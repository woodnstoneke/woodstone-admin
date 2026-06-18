
  # Admin panel for Wood & Stone Construction Kenya


## Node.js — with Hono
Plain Node.js works, but for Cloudflare Workers the recommended framework is **[Hono](https://hono.dev/)** — think of it as the Express/FastAPI equivalent built specifically for edge runtimes.

**Why Hono over plain Express:**
- Express doesn't run on Workers (uses Node.js APIs Workers doesn't support)
- Hono is lightweight, fast, and has an almost identical API to Express
- First-class TypeScript support
- Works on Workers, Vercel, Bun, Deno, Node.js — so you're never locked in

A basic Hono route looks very familiar:
```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/products', async (c) => {
  const data = await db.query('SELECT * FROM products')
  return c.json(data)
})

app.post('/api/upload', async (c) => {
  // generate R2 presigned URL and return it
})

export default app
```

---

## Stack

| Layer | Service | Tech |
|---|---|---|
| Web App | Vercel | Your frontend framework |
| Admin Dashboard | Vercel | Your frontend framework |
| **API / Backend** | **Cloudflare Workers** | **Hono + TypeScript** |
| Image Storage | Cloudflare R2 | — |
| CDN | Cloudflare | — |
| Database | Neon (serverless Postgres) | Drizzle ORM |

**Drizzle ORM** pairs exceptionally well with this stack too — it's TypeScript-native, lightweight, and works perfectly in edge environments unlike heavier ORMs like Prisma.

---

**Bottom line:** **Node.js (Hono + TypeScript)** — it unlocks the full Cloudflare stack, keeps everything consistent in one language across your frontend and backend, and the learning curve from Express/FastAPI concepts is minimal. If you later decide Workers isn't right, Hono runs on plain Node.js too with zero code changes.


**Vercel → Workers (HTTPS / REST)**
Both frontends call your Workers API using a plain `fetch()` with your `WORKER_URL` env variable. In production you'd also attach a JWT or API key header for auth — Hono handles that with a middleware.

**Workers → Neon Postgres (SQL over TLS)**
Cloudflare Workers can't use standard Postgres TCP connections, so Neon provides `@neondatabase/serverless` — a Postgres driver built for edge runtimes that tunnels over HTTP/WebSockets. Drizzle ORM sits on top of it, so your queries look normal:
```ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

const sql = neon(env.DATABASE_URL)
const db = drizzle(sql)
```
The `DATABASE_URL` is a Neon connection string stored as a Workers secret.

**Workers → R2 (presigned URLs)**
Workers has a native R2 binding — no HTTP calls needed, it talks to R2 directly in-process via the Workers runtime. The backend generates a presigned URL and returns it to the client, which then uploads/downloads directly to R2 without going through your API:
```ts
const url = await env.MY_BUCKET.createMultipartUpload(key)
```

**R2 → CDN (origin fetch)**
You connect a Cloudflare custom domain to your R2 bucket. CDN automatically caches image responses at the edge. On first request it fetches from R2 (origin fetch), then serves from cache for all subsequent requests globally.

**CDN → browser (dashed line)**
The dashed arrow is the key performance win — once an image is cached, the browser fetches it directly from the nearest Cloudflare edge node, never touching your Workers API. Your Workers only handles the metadata (who uploaded what, permissions, etc.) while heavy image traffic is completely offloaded to CDN.
