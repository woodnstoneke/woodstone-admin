import { ArrowRight, Eye } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  material: string;
  price: string;
  image: string;
  tag?: string;
}

interface FeaturedCataloguePreviewProps {
  products: Product[];
}

export function FeaturedCataloguePreview({ products }: FeaturedCataloguePreviewProps) {
  return (
    <section
      className="py-24 px-6 lg:px-8"
      style={{ background: "var(--ws-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{
                color: "var(--ws-amber)",
                fontFamily: "var(--font-body)",
              }}
            >
              Curated Materials
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "var(--ws-cream-light)",
                lineHeight: 1.1,
              }}
            >
              Explore Our{" "}
              <em style={{ color: "var(--ws-amber-light)" }}>Catalogue</em>
            </h2>
          </div>

          <button
            className="group inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase transition-colors"
            style={{
              color: "var(--ws-text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            View Full Shop
            <span className="p-2 rounded-full border border-current group-hover:bg-[#C8611A] group-hover:border-transparent transition-all">
              <ArrowRight size={14} />
            </span>
          </button>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col"
              style={{
                background: "var(--ws-card)",
                border: "1px solid var(--ws-border)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-[#C8611A] transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <span
                  className="text-[10px] tracking-widest uppercase mb-1 block"
                  style={{ color: "var(--ws-amber)" }}
                >
                  {product.material}
                </span>
                <h3
                  className="text-base mb-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ws-cream-light)",
                  }}
                >
                  {product.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--ws-amber-light)" }}
                  >
                    {product.price}
                  </span>
                  <button
                    className="text-[10px] uppercase tracking-widest px-3 py-1.5 border border-[#C8611A]/40 text-[#C8611A] hover:bg-[#C8611A] hover:text-white transition-all"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}