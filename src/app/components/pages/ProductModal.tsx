import { useState, useEffect, useRef } from "react";
import { Loader, AlertCircle, Upload, Trash2, Star, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../../lib/api";
import type { ProductDetail, Category, ProductImage } from "../../../lib/api";

interface ProductFormData {
  name: string;
  slug?: string;
  shortDescription: string;
  material: string;
  finish: string;
  priceFrom: string | null;
  unit: string;
  categoryId: number | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  isGallery?: boolean;
}

interface ProductModalProps {
  product: ProductDetail | null;
  categories: Category[];
  onSave: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
  onImageUploaded?: () => Promise<void>;
}

export function ProductModal({
  product,
  categories,
  onSave,
  onClose,
  onImageUploaded,
}: ProductModalProps) {
  // Initialize form data - handle both category object and categoryId field
  const getCategoryId = () => {
    if (!product) return null;
    // Prefer category.id if available (from API join), fall back to categoryId
    return product.category?.id ?? (product as any)?.categoryId ?? null;
  };

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    shortDescription: product?.shortDescription || "",
    material: product?.material || "",
    finish: product?.finish || "",
    priceFrom: product?.priceFrom || null,
    unit: product?.unit || "item",
    categoryId: getCategoryId(),
    isPublished: product?.isPublished || false,
    isFeatured: (product as any)?.isFeatured || false,
    isGallery: (product as any)?.isGallery || false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Multi-image state
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep images in sync with product prop
  useEffect(() => {
    setImages(product?.images || []);
  }, [product?.id]);

  // Sync formData when product changes
  useEffect(() => {
    if (product?.id) {
      const categoryId = getCategoryId();
      setFormData({
        name: product.name || "",
        shortDescription: product.shortDescription || "",
        material: product.material || "",
        finish: product.finish || "",
        priceFrom: product.priceFrom || null,
        unit: product.unit || "item",
        categoryId,
        isPublished: product?.isPublished || false,
        isFeatured: (product as any)?.isFeatured || false,
        isGallery: (product as any)?.isGallery || false,
      });
    }
  }, [product?.id, product?.category?.id, (product as any)?.categoryId]);

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !product?.id) {
      setUploadError("Save the product first before uploading images.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    let uploaded = 0;
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) { toast.error(`${file.name} exceeds 8 MB`); continue; }
      try {
        const sortOrder = images.length + uploaded;
        await adminApi.uploads.upload(product.id, file, { sortOrder });
        uploaded++;
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    if (uploaded > 0) {
      toast.success(`${uploaded} image${uploaded > 1 ? "s" : ""} uploaded`);
      if (onImageUploaded) await onImageUploaded();
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteImage = async (img: ProductImage) => {
    setDeletingId(img.id);
    try {
      await adminApi.uploads.delete(img.id);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success("Image removed");
      if (onImageUploaded) await onImageUploaded();
    } catch {
      toast.error("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (img: ProductImage) => {
    // Reorder: set this as sortOrder=0, others increment
    const reordered = [img, ...images.filter((i) => i.id !== img.id)].map(
      (im, idx) => ({ ...im, sortOrder: idx }),
    );
    setImages(reordered);
    toast.success("Primary image updated — save product to confirm");
  };

  const handleUpdateAltText = async (img: ProductImage, altText: string) => {
    try {
      const BASE_URL = import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787";
      const ADMIN_KEY = import.meta.env.VITE_API_SECRET_KEY ?? "";
      await fetch(`${BASE_URL}/api/admin/uploads/${img.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_KEY}` },
        body: JSON.stringify({ altText }),
      });
      setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, altText } : i));
    } catch {
      toast.error("Failed to update alt text");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setUploadError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setUploadError("Product name is required");
      setIsSaving(false);
      return;
    }

    if (!formData.shortDescription.trim()) {
      setUploadError("Description is required");
      setIsSaving(false);
      return;
    }

    if (!formData.priceFrom) {
      setUploadError("Price is required");
      setIsSaving(false);
      return;
    }

    // Ensure categoryId is either null or a valid number
    const validatedFormData: ProductFormData = {
      ...formData,
      categoryId:
        formData.categoryId === null || formData.categoryId === 0
          ? null
          : typeof formData.categoryId === "number"
            ? formData.categoryId
            : null,
    };

    try {
      await onSave(validatedFormData);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
      }}
    >
      <div
        className="w-full max-w-2xl h-screen flex flex-col"
        style={{
          backgroundColor: "var(--ws-card)",
        }}
      >
        <div
          className="flex items-center justify-between border-b p-6"
          style={{ borderColor: "var(--ws-border)" }}
        >
          <h2
            className="font-display"
            style={{
              color: "var(--ws-text-primary)",
              fontSize: "24px",
            }}
          >
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              color: "var(--ws-text-muted)",
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex-1 overflow-y-auto p-6"
        >
          {/* Product Name */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 border outline-none"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-primary)",
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              Category
            </label>
            <select
              value={formData.categoryId ? String(formData.categoryId) : ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value ? Number(value) : null;
                setFormData({
                  ...formData,
                  categoryId: numValue,
                });
              }}
              className="w-full px-4 py-2.5 border outline-none"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-primary)",
              }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
            {!formData.categoryId && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--ws-text-muted)" }}
              >
                Category helps organize products in the shop
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              Description
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border outline-none"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-primary)",
              }}
            />
          </div>

          {/* Material & Finish */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block mb-2 text-sm"
                style={{ color: "var(--ws-text-secondary)" }}
              >
                Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
                className="w-full px-4 py-2.5 border outline-none"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              />
            </div>

            <div>
              <label
                className="block mb-2 text-sm"
                style={{ color: "var(--ws-text-secondary)" }}
              >
                Finish
              </label>
              <input
                type="text"
                value={formData.finish}
                onChange={(e) =>
                  setFormData({ ...formData, finish: e.target.value })
                }
                className="w-full px-4 py-2.5 border outline-none"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              />
            </div>
          </div>

          {/* Price & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block mb-2 text-sm"
                style={{ color: "var(--ws-text-secondary)" }}
              >
                Price (KES) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.priceFrom || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    priceFrom: value ? value : null,
                  });
                }}
                className="w-full px-4 py-2.5 border outline-none"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="0.00"
              />
            </div>

            <div>
              <label
                className="block mb-2 text-sm"
                style={{ color: "var(--ws-text-secondary)" }}
              >
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-4 py-2.5 border outline-none"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
              >
                <option value="item">Item</option>
                <option value="sqm">Square Meter</option>
                <option value="lm">Linear Meter</option>
                <option value="set">Set</option>
              </select>
            </div>
          </div>

          {/* Product Preview & Actions (only after product created) */}
          {product?.id && (
            <div
              className="p-4 border rounded space-y-4"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
              }}
            >
              <div>
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--ws-text-primary)" }}
                >
                  Product Preview & Actions
                </h3>

                {/* Product Preview */}
                {/* ── Multi-Image Gallery ─────────────────────────── */}
                <div
                  className="p-3 mb-4"
                  style={{
                    backgroundColor: "var(--ws-bg)",
                    border: "1px solid var(--ws-border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--ws-text-muted)" }}>
                      Product Images ({images.length})
                    </p>
                    {product?.id && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleFilesSelect}
                          style={{ display: "none" }}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-opacity hover:opacity-80"
                          style={{
                            background: "var(--ws-button-bg)",
                            color: "var(--ws-button-text)",
                            border: "var(--ws-button-border)",
                            cursor: isUploading ? "not-allowed" : "pointer",
                          }}
                        >
                          {isUploading ? <Loader size={12} className="animate-spin" /> : <Plus size={12} />}
                          {isUploading ? "Uploading…" : "Add Images"}
                        </button>
                      </>
                    )}
                  </div>

                  {images.length === 0 ? (
                    <div
                      className="w-full flex items-center justify-center text-xs"
                      style={{ height: 80, background: "var(--ws-card)", color: "var(--ws-text-muted)", border: "2px dashed var(--ws-border)" }}
                    >
                      {product?.id ? "No images yet — click Add Images" : "Save product first to upload images"}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...images].sort((a, b) => a.sortOrder - b.sortOrder).map((img, idx) => (
                        <div key={img.id} className="flex gap-3 items-start p-2" style={{ background: "var(--ws-bg)", border: "1px solid var(--ws-border)" }}>
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0 group" style={{ width: 72, height: 72, overflow: "hidden" }}>
                            <img
                              src={img.cdnUrl}
                              alt={img.altText || `Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span
                                className="absolute top-0 left-0 text-xs px-1"
                                style={{ background: "var(--ws-amber)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 10 }}
                              >
                                Primary
                              </span>
                            )}
                            {/* Hover overlay */}
                            <div
                              className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "rgba(0,0,0,0.6)" }}
                            >
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  title="Set as primary"
                                  onClick={() => handleSetPrimary(img)}
                                  className="w-6 h-6 flex items-center justify-center"
                                  style={{ background: "var(--ws-amber)", color: "#fff", border: "none", cursor: "pointer", borderRadius: 2 }}
                                >
                                  <Star size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                title="Delete image"
                                onClick={() => handleDeleteImage(img)}
                                disabled={deletingId === img.id}
                                className="w-6 h-6 flex items-center justify-center"
                                style={{ background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", borderRadius: 2 }}
                              >
                                {deletingId === img.id ? <Loader size={11} className="animate-spin" /> : <Trash2 size={11} />}
                              </button>
                            </div>
                          </div>
                          {/* Alt text field */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs mb-1" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>
                              Alt text <span style={{ color: "var(--ws-amber)" }}>(SEO)</span>
                            </p>
                            <input
                              type="text"
                              defaultValue={img.altText || ""}
                              placeholder={`e.g. Custom oak kitchen cabinet – Nairobi`}
                              onBlur={(e) => {
                                const v = e.target.value.trim();
                                if (v !== (img.altText || "")) handleUpdateAltText(img, v);
                              }}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                background: "var(--ws-card)",
                                border: "1px solid var(--ws-border)",
                                color: "var(--ws-text-primary)",
                                fontFamily: "var(--font-body)",
                                fontSize: 12,
                                outline: "none",
                              }}
                            />
                            <p className="text-xs mt-0.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", opacity: 0.6 }}>
                              Describe the image for Google Image Search
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploadError && (
                    <div
                      className="mt-2 p-2 flex items-center gap-2 text-xs"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
                    >
                      <AlertCircle size={14} />
                      {uploadError}
                    </div>
                  )}

                  {!product?.id && (
                    <p className="text-xs mt-2" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>
                      💡 Save the product details first, then add images
                    </p>
                  )}
                </div>
              </div>

              {/* Product Actions */}
              <div
                className="pt-3 border-t"
                style={{ borderColor: "var(--ws-border)" }}
              >
                <p
                  className="text-xs font-medium mb-2"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Status
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        isPublished: !formData.isPublished,
                      });
                    }}
                    className="flex-1 px-3 py-2 rounded text-sm font-medium transition-all"
                    style={{
                      backgroundColor: formData.isPublished
                        ? "var(--ws-button-bg)"
                        : "var(--ws-surface)",
                      color: formData.isPublished
                        ? "var(--ws-button-text)"
                        : "var(--ws-text-secondary)",
                      border: "1px solid",
                      borderColor: "var(--ws-border)",
                    }}
                  >
                    {formData.isPublished ? "✓ Published" : "○ Draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        isFeatured: !formData.isFeatured,
                      });
                    }}
                    className="flex-1 px-3 py-2 rounded text-sm font-medium transition-all"
                    style={{
                      backgroundColor:
                        (formData as any).isFeatured &&
                        (formData as any).isFeatured
                          ? "var(--ws-button-bg)"
                          : "var(--ws-surface)",
                      color:
                        (formData as any).isFeatured &&
                        (formData as any).isFeatured
                          ? "var(--ws-button-text)"
                          : "var(--ws-text-secondary)",
                      border: "1px solid",
                      borderColor: "var(--ws-border)",
                    }}
                  >
                    {(formData as any).isFeatured ? "★ Featured" : "☆ Featured"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        isGallery: !formData.isGallery,
                      });
                    }}
                    className="flex-1 px-3 py-2 rounded text-sm font-medium transition-all"
                    style={{
                      backgroundColor:
                        (formData as any).isGallery &&
                        (formData as any).isGallery
                          ? "var(--ws-button-bg)"
                          : "var(--ws-surface)",
                      color:
                        (formData as any).isGallery &&
                        (formData as any).isGallery
                          ? "var(--ws-button-text)"
                          : "var(--ws-text-secondary)",
                      border: "1px solid",
                      borderColor: "var(--ws-border)",
                    }}
                  >
                    {(formData as any).isGallery ? "🖼 Gallery" : "□ Gallery"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Form Actions - Sticky Bottom */}
        <div
          className="flex justify-end gap-3 p-6 border-t"
          style={{ borderColor: "var(--ws-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 text-sm"
            style={{
              backgroundColor: "var(--ws-surface)",
              color: "var(--ws-text-secondary)",
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2 text-sm flex items-center gap-2"
            style={{
              background: "var(--ws-button-bg)",
              color: "var(--ws-button-text)",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving && <Loader size={14} className="animate-spin" />}
            {product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
