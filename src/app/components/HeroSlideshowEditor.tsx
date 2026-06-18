import { Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../lib/api";

interface Slide {
  url: string;
  label: string;
  caption: string;
}

interface HeroSlideshowEditorProps {
  images: Slide[];
  onChange: (images: Slide[]) => void;
}

export function HeroSlideshowEditor({
  images,
  onChange,
}: HeroSlideshowEditorProps) {
  const addSlide = () => {
    const newSlide: Slide = {
      url: "",
      label: "New Slide",
      caption: "Description here",
    };
    onChange([...images, newSlide]);
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const newImages = images.map((slide, i) =>
      i === index ? { ...slide, [field]: value } : slide,
    );
    onChange(newImages);
  };

  const handleFileUpload = async (index: number, file: File) => {
    try {
      console.log("Starting upload for file:", file.name);
      const publicUrl = await adminApi.uploads.uploadSlideshow(file);
      console.log("Upload returned publicUrl:", publicUrl);
      console.log("typeof publicUrl:", typeof publicUrl);
      if (publicUrl) {
        updateSlide(index, "url", publicUrl);
        console.log("Updated slide URL to:", publicUrl);
      } else {
        console.error("publicUrl is empty or undefined");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const removeSlide = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {images.map((slide, index) => (
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
                Slide {index + 1}
              </h4>
              <button
                onClick={() => removeSlide(index)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Label
                </label>
                <input
                  type="text"
                  value={slide.label}
                  onChange={(e) => updateSlide(index, "label", e.target.value)}
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
                  Caption
                </label>
                <input
                  type="text"
                  value={slide.caption}
                  onChange={(e) =>
                    updateSlide(index, "caption", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  style={{
                    backgroundColor: "var(--ws-bg)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                />
              </div>
            </div>
            {slide.url && (
              <div className="mt-4">
                <img
                  src={slide.url}
                  alt={slide.label}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addSlide}
        className="flex items-center gap-2 px-4 py-2 border text-sm"
        style={{
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-secondary)",
        }}
      >
        <Plus size={16} />
        Add Slide
      </button>
    </div>
  );
}
