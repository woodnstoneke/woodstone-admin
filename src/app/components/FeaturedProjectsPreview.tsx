import { ArrowRight } from "lucide-react";

interface Project {
  title: string;
  category: string;
  image: string;
}

interface FeaturedProjectsPreviewProps {
  projects: Project[];
}

export function FeaturedProjectsPreview({
  projects,
}: FeaturedProjectsPreviewProps) {
  return (
    <section
      className="py-28 px-6 lg:px-8"
      style={{ background: "var(--ws-surface)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          style={{
            opacity: 1,
            transform: "translateY(0)",
          }}
        >
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{
                color: "var(--ws-amber)",
                fontFamily: "var(--font-body)",
              }}
            >
              Our Work
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "var(--ws-cream-light)",
              }}
            >
              Featured{" "}
              <em style={{ color: "var(--ws-amber-light)" }}>Projects</em>
            </h2>
          </div>
          <button
            className="inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase transition-all duration-300 group"
            style={{
              color: "var(--ws-amber)",
              fontFamily: "var(--font-body)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            View Full Gallery
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <button
              key={project.title}
              className="group relative overflow-hidden block transition-all duration-700 text-left"
              style={{
                opacity: 1,
                transform: "translateY(0)",
                height: i === 0 ? "480px" : "320px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{
                  background: "rgba(200,97,26,0.08)",
                }}
              />
              <div className="absolute bottom-0 left-0 p-6">
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-1"
                  style={{
                    color: "var(--ws-amber)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {project.category}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#f5ecd7",
                    fontSize: "1.25rem",
                  }}
                >
                  {project.title}
                </h3>
              </div>
              {/* Amber accent line */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{ background: "var(--ws-amber)" }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
