import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";

interface Service {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

interface ServicesEditorProps {
  services: Service[];
  onChange: (services: Service[]) => void;
}

export function ServicesEditor({ services, onChange }: ServicesEditorProps) {
  const addService = () => {
    const newService: Service = {
      title: "New Service",
      subtitle: "Service subtitle",
      description: "Service description",
      image: "",
    };
    onChange([...services, newService]);
  };

  const updateService = (
    index: number,
    field: keyof Service,
    value: string,
  ) => {
    const newServices = services.map((service, i) =>
      i === index ? { ...service, [field]: value } : service,
    );
    onChange(newServices);
  };

  const handleFileUpload = async (index: number, file: File) => {
    try {
      const publicUrl = await adminApi.uploads.uploadSlideshow(file);
      updateService(index, "image", publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    onChange(newServices);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="p-4 border rounded"
            style={{
              backgroundColor: "var(--ws-card)",
              borderColor: "var(--ws-border)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h4
                className="font-display"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Service {index + 1}
              </h4>
              <button
                onClick={() => removeService(index)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Image Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(index, file);
                  }}
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: "var(--ws-bg)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) =>
                    updateService(index, "title", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: "var(--ws-bg)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Subtitle
                </label>
                <input
                  type="text"
                  value={service.subtitle}
                  onChange={(e) =>
                    updateService(index, "subtitle", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: "var(--ws-bg)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Description
                </label>
                <textarea
                  value={service.description}
                  onChange={(e) =>
                    updateService(index, "description", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: "var(--ws-bg)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                  rows={3}
                />
              </div>
            </div>
            {service.image && (
              <div className="mt-4">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addService}
        className="flex items-center gap-2 px-4 py-2 border text-sm"
        style={{
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-secondary)",
        }}
      >
        <Plus size={16} />
        Add Service
      </button>
    </div>
  );
}
