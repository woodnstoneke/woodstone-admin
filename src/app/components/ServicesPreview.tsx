import { ChevronRight } from "lucide-react";

interface Service {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

interface ServicesPreviewProps {
  services: Service[];
}

export function ServicesPreview({ services }: ServicesPreviewProps) {
  return (
    <section
      className="py-28 px-6 lg:px-8"
      style={{ background: "var(--ws-surface)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="text-center mb-16"
          style={{
            opacity: 1,
          }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{
              color: "var(--ws-amber)",
              fontFamily: "var(--font-body)",
            }}
          >
            Bespoke Craftsmanship, Made in Kenya
          </p>
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--ws-cream-light)",
            }}
          >
            What We Build For{" "}
            <em style={{ color: "var(--ws-amber-light)" }}>You</em>
          </h2>
          <p
            className="max-w-lg mx-auto text-sm leading-relaxed"
            style={{
              color: "var(--ws-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            From a single custom piece to a complete interior fit-out — we handle everything so you can enjoy world-class Kenyan craftsmanship in your space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden cursor-pointer transition-all duration-500"
              style={{
                background: "var(--ws-card)",
                border: "1px solid var(--ws-border)",
              }}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(200,97,26,0.2) 0%, transparent 60%)",
                  }}
                />
              </div>
              <div className="p-6">
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-1"
                  style={{
                    color: "var(--ws-amber)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {service.subtitle}
                </p>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ws-cream-light)",
                    fontSize: "1.15rem",
                  }}
                >
                  {service.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{
                    color: "var(--ws-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {service.description}
                </p>
                <button
                  className="inline-flex items-center gap-2 text-xs tracking-[0.1em] uppercase transition-all duration-300 group-hover:gap-3"
                  style={{
                    color: "var(--ws-amber)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Book Now <ChevronRight size={12} />
                </button>
              </div>
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{ background: "var(--ws-amber)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}