import { Plus, X } from "lucide-react";

interface Value {
  title: string;
  description: string;
}

interface AboutValuesEditorProps {
  values: Value[];
  onChange: (values: Value[]) => void;
}

export function AboutValuesEditor({ values, onChange }: AboutValuesEditorProps) {
  const handleAddValue = () => {
    onChange([
      ...values,
      { title: "New Value", description: "Value description" },
    ]);
  };

  const handleRemoveValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleUpdateValue = (
    index: number,
    field: keyof Value,
    value: string,
  ) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {values.map((value, idx) => (
        <div
          key={idx}
          className="p-4 border relative"
          style={{
            background: "var(--ws-surface)",
            borderColor: "var(--ws-border)",
          }}
        >
          <button
            onClick={() => handleRemoveValue(idx)}
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
                value={value.title}
                onChange={(e) =>
                  handleUpdateValue(idx, "title", e.target.value)
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
                value={value.description}
                onChange={(e) =>
                  handleUpdateValue(idx, "description", e.target.value)
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
          </div>
        </div>
      ))}

      <button
        onClick={handleAddValue}
        className="flex items-center gap-2 px-4 py-2 border"
        style={{
          background: "var(--ws-surface)",
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-primary)",
        }}
      >
        <Plus size={18} />
        Add Value
      </button>
    </div>
  );
}
