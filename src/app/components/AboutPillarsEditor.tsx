import { Plus, X } from "lucide-react";

interface BusinessPillar {
  title: string;
  tagline: string;
  description: string;
  image: string;
}

interface AboutPillarsEditorProps {
  pillars: BusinessPillar[];
  onChange: (pillars: BusinessPillar[]) => void;
}

export function AboutPillarsEditor({ pillars, onChange }: AboutPillarsEditorProps) {
  const handleAddPillar = () => {
    onChange([
      ...pillars,
      { title: "New Pillar", tagline: "", description: "", image: "" },
    ]);
  };

  const handleRemovePillar = (index: number) => {
    onChange(pillars.filter((_, i) => i !== index));
  };

  const handleUpdatePillar = (
    index: number,
    field: keyof BusinessPillar,
    value: string,
  ) => {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {pillars.map((pillar, idx) => (
        <div
          key={idx}
          className="p-4 border relative"
          style={{
            background: "var(--ws-surface)",
            borderColor: "var(--ws-border)",
          }}
        >
          <button
            onClick={() => handleRemovePillar(idx)}
            className="absolute top-3 right-3 p-1"
            style={{ color: "var(--ws-text-muted)" }}
          >
            <X size={18} />
          </button>

          <div className="space-y-3 pr-8">
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Title
              </label>
              <input
                type="text"
                value={pillar.title}
                onChange={(e) =>
                  handleUpdatePillar(idx, "title", e.target.value)
                }
                className="w-full px-3 py-2 border"
                style={{
                  background: "var(--ws-input-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Tagline
              </label>
              <input
                type="text"
                value={pillar.tagline}
                onChange={(e) =>
                  handleUpdatePillar(idx, "tagline", e.target.value)
                }
                className="w-full px-3 py-2 border"
                style={{
                  background: "var(--ws-input-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Description
              </label>
              <textarea
                value={pillar.description}
                onChange={(e) =>
                  handleUpdatePillar(idx, "description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border"
                style={{
                  background: "var(--ws-input-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Image URL
              </label>
              <input
                type="text"
                value={pillar.image}
                onChange={(e) =>
                  handleUpdatePillar(idx, "image", e.target.value)
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border"
                style={{
                  background: "var(--ws-input-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              />
              {pillar.image && (
                <div className="mt-2">
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="h-32 w-auto object-cover"
                    style={{ border: "1px solid var(--ws-border)" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleAddPillar}
        className="flex items-center gap-2 px-4 py-2 border"
        style={{
          background: "var(--ws-surface)",
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-primary)",
        }}
      >
        <Plus size={18} />
        Add Business Pillar
      </button>
    </div>
  );
}
