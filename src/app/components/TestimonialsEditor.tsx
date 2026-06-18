import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";

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

interface TestimonialsEditorProps {
  testimonials: Testimonial[];
  onChange: (testimonials: Testimonial[]) => void;
}

export function TestimonialsEditor({
  testimonials,
  onChange,
}: TestimonialsEditorProps) {
  const handleImageUpload = async (index: number, file: File) => {
    try {
      const publicUrl = await adminApi.uploads.uploadSlideshow(file);
      const updated = [...testimonials];
      updated[index].image = publicUrl;
      onChange(updated);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof Testimonial,
    value: string | number,
  ) => {
    const updated = [...testimonials];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const addTestimonial = () => {
    const maxId = Math.max(...testimonials.map((t) => t.id), 0);
    onChange([
      ...testimonials,
      {
        id: maxId + 1,
        name: "",
        role: "",
        quote: "",
        image: "",
        rating: 5,
        metric: "",
        metricLabel: "",
      },
    ]);
  };

  const removeTestimonial = (index: number) => {
    onChange(testimonials.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {testimonials.map((testimonial, idx) => (
        <div
          key={testimonial.id}
          className="p-6 border grid grid-cols-2 gap-6"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Name
              </label>
              <input
                type="text"
                value={testimonial.name}
                onChange={(e) => handleFieldChange(idx, "name", e.target.value)}
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="e.g., Amara Njoroge"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Role
              </label>
              <input
                type="text"
                value={testimonial.role}
                onChange={(e) => handleFieldChange(idx, "role", e.target.value)}
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="e.g., Architect, Nairobi"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Quote
              </label>
              <textarea
                value={testimonial.quote}
                onChange={(e) =>
                  handleFieldChange(idx, "quote", e.target.value)
                }
                className="w-full px-4 py-2 border text-sm focus:outline-none resize-none"
                rows={4}
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="Customer testimonial..."
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Rating (1-5)
              </label>
              <select
                value={testimonial.rating}
                onChange={(e) =>
                  handleFieldChange(idx, "rating", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Star{num !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 flex flex-col">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Metric
              </label>
              <input
                type="text"
                value={testimonial.metric}
                onChange={(e) =>
                  handleFieldChange(idx, "metric", e.target.value)
                }
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="e.g., 500+"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Metric Label
              </label>
              <input
                type="text"
                value={testimonial.metricLabel}
                onChange={(e) =>
                  handleFieldChange(idx, "metricLabel", e.target.value)
                }
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="e.g., Projects Delivered"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Image
              </label>
              <div
                className="relative border-2 border-dashed rounded flex-1"
                style={{ borderColor: "var(--ws-border)" }}
              >
                {testimonial.image ? (
                  <div className="relative h-40 group">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(idx, file);
                          }}
                          className="hidden"
                        />
                        <div
                          className="px-3 py-2 rounded text-xs font-medium flex items-center gap-2"
                          style={{
                            backgroundColor: "var(--ws-amber)",
                            color: "white",
                          }}
                        >
                          <Upload size={14} />
                          Change
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block p-8">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(idx, file);
                      }}
                      className="hidden"
                    />
                    <div
                      className="flex flex-col items-center justify-center py-6"
                      style={{ color: "var(--ws-text-muted)" }}
                    >
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm">Upload Image</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeTestimonial(idx)}
              className="flex items-center justify-center gap-2 px-3 py-2 border text-sm"
              style={{
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-secondary)",
              }}
            >
              <X size={16} />
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addTestimonial}
        className="flex items-center gap-2 px-4 py-3 border text-sm"
        style={{
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-secondary)",
        }}
      >
        <Plus size={16} />
        Add Testimonial
      </button>
    </div>
  );
}
