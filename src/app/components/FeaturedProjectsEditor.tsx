import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";

interface Project {
  title: string;
  category: string;
  image: string;
}

interface FeaturedProjectsEditorProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function FeaturedProjectsEditor({
  projects,
  onChange,
}: FeaturedProjectsEditorProps) {
  const handleImageUpload = async (index: number, file: File) => {
    try {
      const publicUrl = await adminApi.uploads.uploadSlideshow(file);
      const updated = [...projects];
      updated[index].image = publicUrl;
      onChange(updated);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof Project,
    value: string,
  ) => {
    const updated = [...projects];
    updated[index][field] = value;
    onChange(updated);
  };

  const addProject = () => {
    onChange([
      ...projects,
      {
        title: "",
        category: "",
        image: "",
      },
    ]);
  };

  const removeProject = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {projects.map((project, idx) => (
        <div
          key={idx}
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
                Title
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) =>
                  handleFieldChange(idx, "title", e.target.value)
                }
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="e.g., The Westlands Residence"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Category
              </label>
              <input
                type="text"
                value={project.category}
                onChange={(e) =>
                  handleFieldChange(idx, "category", e.target.value)
                }
                className="w-full px-4 py-2 border text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--ws-bg)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="e.g., Full Interior"
              />
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Image
              </label>
              <div
                className="relative border-2 border-dashed rounded overflow-hidden"
                style={{ borderColor: "var(--ws-border)" }}
              >
                {project.image ? (
                  <div className="relative h-40 group">
                    <img
                      src={project.image}
                      alt={project.title}
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
              onClick={() => removeProject(idx)}
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
        onClick={addProject}
        className="flex items-center gap-2 px-4 py-3 border text-sm"
        style={{
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-secondary)",
        }}
      >
        <Plus size={16} />
        Add Project
      </button>
    </div>
  );
}
