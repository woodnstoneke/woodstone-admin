interface Value {
  title: string;
  description: string;
}

interface Pillar {
  title: string;
  tagline: string;
  description: string;
  image: string;
}

interface AboutPreviewProps {
  values: Value[];
  businessPillars: Pillar[];
}

export function AboutPreview({ values, businessPillars }: AboutPreviewProps) {
  return (
    <div style={{ background: "var(--ws-bg)", minHeight: "100vh" }}>
      {/* Values Section */}
      <section
        className="py-24 px-6 lg:px-8"
        style={{ background: "var(--ws-bg)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{
                color: "var(--ws-amber)",
                fontFamily: "var(--font-body)",
              }}
            >
              What We Stand For
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                color: "var(--ws-cream-light)",
              }}
            >
              Our <em style={{ color: "var(--ws-amber-light)" }}>Philosophy</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="p-8"
                style={{
                  background: "var(--ws-card)",
                  border: "1px solid var(--ws-border)",
                }}
              >
                <div
                  style={{
                    background: "var(--ws-amber)",
                    height: "4px",
                    width: "40px",
                    marginBottom: "24px",
                  }}
                />
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ws-cream-light)",
                    fontSize: "1.1rem",
                  }}
                >
                  {value.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "var(--ws-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Pillars Section */}
      <section
        className="py-24 px-6 lg:px-8"
        style={{ background: "var(--ws-surface)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{
                color: "var(--ws-amber)",
                fontFamily: "var(--font-body)",
              }}
            >
              Why Choose Us
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                color: "var(--ws-cream-light)",
              }}
            >
              The Wood & Stone{" "}
              <em style={{ color: "var(--ws-amber-light)" }}>Difference</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {businessPillars.map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--ws-card)",
                  border: "1px solid var(--ws-border)",
                  overflow: "hidden",
                }}
              >
                <div className="relative h-72 overflow-hidden">
                  {pillar.image ? (
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--ws-border)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(8,6,4,0.9) 0%, transparent 60%)",
                    }}
                  />
                </div>
                <div className="p-6">
                  <div
                    style={{
                      background: "var(--ws-amber)",
                      height: "2px",
                      width: "32px",
                      marginBottom: "16px",
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--ws-cream-light)",
                      fontSize: "1.15rem",
                      marginBottom: "4px",
                    }}
                  >
                    {pillar.title}
                  </h3>
                  <p
                    className="text-xs tracking-[0.1em] uppercase mb-4"
                    style={{
                      color: "var(--ws-amber)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {pillar.tagline}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "var(--ws-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
