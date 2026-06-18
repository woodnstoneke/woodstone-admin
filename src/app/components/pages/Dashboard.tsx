import { useState, useEffect } from "react";
import { Package, Layers, TrendingUp, AlertCircle } from "lucide-react";
import { adminApi } from "../../../lib/api";
import type { ProductSummary, Category } from "../../../lib/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Skeleton loaders ─────────────────────────────────────────────────────── */

function Shimmer({
  h = "100%",
  w = "100%",
  r = "4px",
}: {
  h?: string;
  w?: string;
  r?: string;
}) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        background: "var(--ws-border)",
        animation: "shimmer 1.6s ease-in-out infinite",
        opacity: 0.5,
      }}
    />
  );
}

function KPISkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "var(--ws-border)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ background: "var(--ws-card)", padding: "28px 24px" }}
        >
          <Shimmer h="12px" w="80px" />
          <div style={{ marginTop: 20 }}>
            <Shimmer h="36px" w="60px" />
          </div>
          <div style={{ marginTop: 10 }}>
            <Shimmer h="11px" w="100px" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div
      style={{
        background: "var(--ws-card)",
        border: "1px solid var(--ws-border)",
        padding: "32px",
        height: 360,
      }}
    >
      <Shimmer h="18px" w="140px" />
      <div style={{ marginTop: 24 }}>
        <Shimmer h="260px" />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div
      style={{
        background: "var(--ws-card)",
        border: "1px solid var(--ws-border)",
        padding: "32px",
      }}
    >
      <Shimmer h="18px" w="160px" />
      <div
        style={{
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          background: "var(--ws-border)",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--ws-card)",
              padding: "14px 0",
              display: "flex",
              gap: 24,
            }}
          >
            <Shimmer h="12px" w="160px" />
            <Shimmer h="12px" w="80px" />
            <Shimmer h="12px" w="60px" />
            <Shimmer h="20px" w="64px" r="2px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── KPI Cards ────────────────────────────────────────────────────────────── */

function KPICards({
  products,
  categories,
}: {
  products: ProductSummary[];
  categories: Category[];
}) {
  const publishedProducts = products.filter((p) => p.isPublished).length;
  const activeRate =
    products.length > 0
      ? ((publishedProducts / products.length) * 100).toFixed(0)
      : "0";

  const kpis = [
    {
      label: "Total Products",
      value: products.length,
      sub: `${publishedProducts} published`,
      icon: Package,
      accent: "var(--ws-amber)",
    },
    {
      label: "Categories",
      value: categories.length,
      sub: "Product categories",
      icon: Layers,
      accent: "var(--ws-stone)",
    },
    {
      label: "Active Rate",
      value: `${activeRate}%`,
      sub: `${publishedProducts} of ${products.length} active`,
      icon: TrendingUp,
      accent: "var(--ws-green)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "var(--ws-border)",
      }}
    >
      {kpis.map(({ label, value, sub, icon: Icon, accent }, idx) => (
        <div
          key={label}
          style={{
            background: "var(--ws-card)",
            padding: "28px 24px",
            position: "relative",
            overflow: "hidden",
            animation: `fadeUp 0.4s ease both`,
            animationDelay: `${idx * 80}ms`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: accent,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--ws-text-muted)",
              }}
            >
              {label}
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `${accent}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accent,
              }}
            >
              <Icon size={15} strokeWidth={1.8} />
            </div>
          </div>

          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 38,
              fontWeight: 700,
              color: "var(--ws-text-primary)",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {value}
          </div>

          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--ws-text-muted)",
            }}
          >
            {sub}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Product Distribution Pie ─────────────────────────────────────────────── */

const PIE_COLORS = [
  "var(--ws-amber)",
  "var(--ws-stone)",
  "var(--ws-green)",
  "var(--ws-amber-light)",
  "var(--ws-stone-light)",
];

function ProductDistributionChart({
  products,
}: {
  products: ProductSummary[];
}) {
  const categoryMap: Record<string, number> = {};
  products.forEach((p) => {
    const name = p.category?.name ?? "Uncategorized";
    categoryMap[name] = (categoryMap[name] ?? 0) + 1;
  });
  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div
      style={{
        background: "var(--ws-card)",
        border: "1px solid var(--ws-border)",
        padding: "32px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SectionTitle>Products by Category</SectionTitle>

      <div style={{ flex: 1, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={54}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={({ cx, cy, midAngle, outerRadius, name, value }) => {
                const RADIAN = Math.PI / 180;
                const r = outerRadius + 22;
                const x = cx + r * Math.cos(-midAngle * RADIAN);
                const y = cy + r * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="var(--ws-text-muted)"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    style={{ fontFamily: "var(--font-body)", fontSize: 11 }}
                  >
                    {name} ({value})
                  </text>
                );
              }}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={PIE_COLORS[i % PIE_COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--ws-surface)",
                border: "1px solid var(--ws-border)",
                borderRadius: 0,
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--ws-text-primary)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 20px",
          marginTop: 16,
        }}
      >
        {data.map(({ name }, i) => (
          <div
            key={name}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: PIE_COLORS[i % PIE_COLORS.length],
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                color: "var(--ws-text-muted)",
              }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Recent Products Table ─────────────────────────────────────────────────── */

function RecentProductsTable({ products }: { products: ProductSummary[] }) {
  const recent = products.slice(0, 6);

  return (
    <div
      style={{
        background: "var(--ws-card)",
        border: "1px solid var(--ws-border)",
        padding: "32px",
      }}
    >
      <SectionTitle>Recent Products</SectionTitle>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "var(--font-body)",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ws-border)" }}>
              {["Product", "Category", "Price", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "0 12px 12px 0",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ws-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((product, idx) => (
              <tr
                key={product.id}
                style={{
                  borderBottom:
                    idx < recent.length - 1
                      ? "1px solid var(--ws-border)"
                      : "none",
                  animation: `fadeUp 0.35s ease both`,
                  animationDelay: `${idx * 50 + 100}ms`,
                }}
              >
                <td
                  style={{
                    padding: "14px 12px 14px 0",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--ws-text-primary)",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.name}
                </td>
                <td
                  style={{
                    padding: "14px 12px 14px 0",
                    fontSize: 13,
                    color: "var(--ws-text-secondary)",
                  }}
                >
                  {product.category?.name ?? "—"}
                </td>
                <td
                  style={{
                    padding: "14px 12px 14px 0",
                    fontSize: 13,
                    color: "var(--ws-text-secondary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.priceFrom
                    ? `KES ${Number(product.priceFrom).toLocaleString()}`
                    : "—"}
                </td>
                <td style={{ padding: "14px 0" }}>
                  <StatusPill published={product.isPublished} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Shared micro-components ───────────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--ws-text-primary)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {children}
      </h2>
      <div
        style={{
          width: 24,
          height: 2,
          background: "var(--ws-amber)",
          marginTop: 8,
        }}
      />
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        fontFamily: "var(--font-body)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: published ? "var(--ws-green)" : "var(--ws-text-muted)",
        background: published ? "var(--ws-green)18" : "var(--ws-border)",
        border: `1px solid ${published ? "var(--ws-green)40" : "var(--ws-border)"}`,
      }}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────────────────── */

export function Dashboard() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          adminApi.products.list({ page: 1, limit: 100 }),
          adminApi.categories.list(),
        ]);

        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const animations = `
    @keyframes shimmer {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{animations}</style>

      <div
        style={{
          padding: "40px 48px 60px",
          maxWidth: 1280,
          margin: "0 auto",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 40,
            paddingBottom: 32,
            borderBottom: "1px solid var(--ws-border)",
            animation: "fadeUp 0.4s ease both",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--ws-amber)",
                marginBottom: 8,
              }}
            >
              Admin Panel
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 44,
                fontWeight: 700,
                color: "var(--ws-text-primary)",
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Dashboard
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ws-text-muted)",
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              Business overview &amp; key metrics
            </p>
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--ws-text-muted)",
            }}
          >
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "20px 24px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#c0392b",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              marginBottom: 32,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ display: "block", marginBottom: 4 }}>
                Failed to load dashboard
              </strong>
              {error}
            </div>
          </div>
        )}

        {/* ── KPI Strip ── */}
        <div style={{ marginBottom: 2 }}>
          {loading ? (
            <KPISkeleton />
          ) : (
            <KPICards products={products} categories={categories} />
          )}
        </div>

        {/* ── Pie Chart + Products Table ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "400px 1fr",
            gap: 2,
            marginTop: 2,
          }}
        >
          {loading ? (
            <>
              <ChartSkeleton />
              <TableSkeleton />
            </>
          ) : (
            <>
              <ProductDistributionChart products={products} />
              <RecentProductsTable products={products} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
