import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader } from "lucide-react";
import { toast } from "sonner";
import { adminApi, type Category } from "../../../lib/api";

// Auto-generate a slug from a name string
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string | null;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.categories.list();
      setCategories(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
    });
    setFormError(null);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      setFormError("Name and slug are required");
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);

      if (selectedCategory) {
        await adminApi.categories.update(selectedCategory.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
        });
        toast.success("Category updated successfully!");
      } else {
        await adminApi.categories.create({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
        });
        toast.success("Category created successfully!");
      }

      await fetchCategories();
      handleCloseModal();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save category",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await adminApi.categories.delete(id);
      toast.success("Category deleted successfully!");
      await fetchCategories();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete category",
      );
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display tracking-tight"
            style={{
              color: "var(--ws-text-primary)",
              fontSize: "36px",
            }}
          >
            Categories
          </h1>
          <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
            Manage product categories
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 transition-all"
          style={{
            background: "var(--ws-button-bg)",
            color: "var(--ws-button-text)",
            border: "var(--ws-button-border)",
            boxShadow: "var(--ws-button-shadow)",
          }}
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="p-4 border"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
          }}
        >
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader
            size={32}
            style={{ color: "var(--ws-amber)" }}
            className="animate-spin"
          />
        </div>
      )}

      {/* Categories Table */}
      {!loading && (
        <div
          className="border overflow-hidden"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{ borderColor: "var(--ws-border)" }}
              >
                <th
                  className="text-left p-4 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Name
                </th>
                <th
                  className="text-left p-4 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Slug
                </th>
                <th
                  className="text-left p-4 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Description
                </th>
                <th
                  className="text-right p-4 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <p style={{ color: "var(--ws-text-muted)" }}>
                      No categories found
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b"
                    style={{ borderColor: "var(--ws-border)" }}
                  >
                    <td
                      className="p-4"
                      style={{ color: "var(--ws-text-primary)" }}
                    >
                      {category.name}
                    </td>
                    <td
                      className="p-4"
                      style={{
                        color: "var(--ws-text-secondary)",
                        fontFamily: "monospace",
                      }}
                    >
                      {category.slug}
                    </td>
                    <td
                      className="p-4"
                      style={{ color: "var(--ws-text-secondary)" }}
                    >
                      {category.description ? (
                        <span>{category.description}</span>
                      ) : (
                        <span style={{ color: "var(--ws-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-80"
                          style={{
                            backgroundColor: "var(--ws-surface)",
                            color: "var(--ws-text-secondary)",
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-80"
                          style={{
                            backgroundColor: "var(--ws-surface)",
                            color: "var(--ws-text-secondary)",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <div
            className="w-full max-w-2xl h-screen flex flex-col overflow-hidden"
            style={{
              backgroundColor: "var(--ws-card)",
            }}
          >
            {/* Header */}
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
                {selectedCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                style={{
                  color: "var(--ws-text-muted)",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label
                  className="block mb-2 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Category Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border outline-none"
                  style={{
                    backgroundColor: "var(--ws-surface)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                  placeholder="e.g. Stone Countertops"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name: newName,
                      slug: toSlug(newName),
                    }));
                  }}
                />
              </div>

              <div>
                <label
                  className="block mb-2 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Slug
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border outline-none"
                  style={{
                    backgroundColor: "var(--ws-surface)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                  placeholder="e.g. stone-countertops"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label
                  className="block mb-2 text-sm"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2.5 border outline-none resize-none"
                  style={{
                    backgroundColor: "var(--ws-surface)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                  }}
                  placeholder="Optional description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {formError && (
                <div
                  className="p-3 border text-sm"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                  }}
                >
                  {formError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 border-t p-6"
              style={{ borderColor: "var(--ws-border)" }}
            >
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-6 py-2.5 border"
                style={{
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-secondary)",
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={isSaving}
                className="px-6 py-2.5"
                style={{
                  background: "var(--ws-button-bg)",
                  color: "var(--ws-button-text)",
                  opacity: isSaving ? 0.6 : 1,
                  cursor: isSaving ? "not-allowed" : "pointer",
                }}
              >
                {isSaving
                  ? "Saving..."
                  : selectedCategory
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
