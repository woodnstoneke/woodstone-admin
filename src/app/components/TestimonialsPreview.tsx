import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
  metric: string;
  metricLabel: string;
}

interface TestimonialsPreviewProps {
  testimonials: Testimonial[];
  title?: string;
  highlight?: string;
  autoPlayInterval?: number;
}

export function TestimonialsPreview({
  testimonials,
  title = "What Our Nairobi",
  highlight = "Clients Say",
  autoPlayInterval = 6000,
}: TestimonialsPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (testimonials.length === 0) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [testimonials.length, autoPlayInterval]);

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section
      className="py-28 px-6 lg:px-8"
      style={{ background: "var(--ws-surface)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{
              color: "var(--ws-amber)",
              fontFamily: "var(--font-body)",
            }}
          >
            Testimonials
          </p>
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--ws-cream-light)",
            }}
          >
            {title}{" "}
            <em style={{ color: "var(--ws-amber-light)" }}>{highlight}</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Image */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-64 h-80">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover"
                style={{
                  border: "1px solid var(--ws-border)",
                  aspectRatio: "1/1.25",
                }}
              />
            </div>
          </div>

          {/* Right: Quote & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Rating Stars */}
            <div className="flex gap-1">
              {[...Array(current.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill="var(--ws-amber)"
                  style={{ color: "var(--ws-amber)" }}
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote
              className="text-lg leading-relaxed"
              style={{
                color: "var(--ws-text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              "{current.quote}"
            </blockquote>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "var(--ws-border)",
              }}
            />

            {/* Author Info */}
            <div className="space-y-2">
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ws-cream-light)",
                  fontSize: "1.15rem",
                }}
              >
                {current.name}
              </h3>
              <p
                style={{
                  color: "var(--ws-text-muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                }}
              >
                {current.role}
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: "var(--ws-border)",
              }}
            />

            {/* Metric */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ws-amber)",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {current.metric}
              </p>
              <p
                style={{
                  color: "var(--ws-text-muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                }}
              >
                {current.metricLabel}
              </p>
            </div>

            {/* Navigation Dots */}
            <div className="flex gap-2 pt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className="transition-all duration-300"
                  style={{
                    width: i === currentIndex ? "32px" : "8px",
                    height: "8px",
                    background:
                      i === currentIndex
                        ? "var(--ws-amber)"
                        : "var(--ws-border)",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
