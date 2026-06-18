import { useState } from "react";
import { X } from "lucide-react";

interface AboutHeroData {
  subtitle?: string;
  heading?: string;
  paragraphOne?: string;
  paragraphTwo?: string;
  image?: string;
  statNumber?: string;
  statLabel?: string;
}

interface AboutHeroEditorProps {
  data: AboutHeroData;
  onChange: (data: AboutHeroData) => void;
}

export function AboutHeroEditor({ data, onChange }: AboutHeroEditorProps) {
  const [imageUrl, setImageUrl] = useState(data.image || "");

  const handleChange = (field: keyof AboutHeroData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageChange = (url: string) => {
    setImageUrl(url);
    handleChange("image", url);
  };

  return (
    <div className="space-y-6">
      {/* Subtitle */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          Subtitle
        </label>
        <input
          type="text"
          value={data.subtitle || ""}
          onChange={(e) => handleChange("subtitle", e.target.value)}
          placeholder="e.g., Our Story"
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
      </div>

      {/* Heading */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          Main Heading
        </label>
        <textarea
          value={data.heading || ""}
          onChange={(e) => handleChange("heading", e.target.value)}
          placeholder="e.g., Built on Earth, Crafted with Soul"
          rows={3}
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
      </div>

      {/* Paragraph One */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          First Paragraph
        </label>
        <textarea
          value={data.paragraphOne || ""}
          onChange={(e) => handleChange("paragraphOne", e.target.value)}
          placeholder="First paragraph of the about section..."
          rows={4}
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
      </div>

      {/* Paragraph Two */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          Second Paragraph
        </label>
        <textarea
          value={data.paragraphTwo || ""}
          onChange={(e) => handleChange("paragraphTwo", e.target.value)}
          placeholder="Second paragraph of the about section..."
          rows={4}
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
      </div>

      {/* Image URL */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          Hero Image URL
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => handleImageChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
        {imageUrl && (
          <div className="mt-3 relative inline-block">
            <img
              src={imageUrl}
              alt="Hero preview"
              className="h-40 w-auto object-cover"
              style={{ border: "1px solid var(--ws-border)" }}
            />
          </div>
        )}
      </div>

      {/* Stat Number */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          Stat Number
        </label>
        <input
          type="text"
          value={data.statNumber || ""}
          onChange={(e) => handleChange("statNumber", e.target.value)}
          placeholder="e.g., 500+"
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
      </div>

      {/* Stat Label */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: "var(--ws-text-primary)" }}
        >
          Stat Label
        </label>
        <input
          type="text"
          value={data.statLabel || ""}
          onChange={(e) => handleChange("statLabel", e.target.value)}
          placeholder="e.g., Projects Delivered"
          className="w-full px-4 py-2 border"
          style={{
            background: "var(--ws-input-bg)",
            borderColor: "var(--ws-border)",
            color: "var(--ws-text-primary)",
          }}
        />
      </div>
    </div>
  );
}
