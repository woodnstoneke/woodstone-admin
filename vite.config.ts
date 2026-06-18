import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { ViteDevServer } from "vite";

// SPA routing plugin for dev server
// Ensures all non-file routes are rewritten to index.html
// so React Router can handle them on the client side
function spaRouting() {
  return {
    name: "spa-routing",
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use((req: any, res: any, next: any) => {
          // Skip actual files (have extensions) and API routes
          if (/\.[^/]+$/.test(req.url) || req.url.startsWith("/api/")) {
            return next();
          }
          // Rewrite all other requests to index.html for client-side routing
          req.url = "/index.html";
          next();
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // SPA routing plugin to handle client-side navigation
    spaRouting(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
