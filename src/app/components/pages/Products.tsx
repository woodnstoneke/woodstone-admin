import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, Loader } from "lucide-react";
import { toast } from "sonner";
import {
  adminApi,
  type ProductSummary,
  type ProductDetail,
  type Category,
  type Pagination as PaginationType,
} from "../../../lib/api";
import { Pagination } from "../Pagination";
import { ProductModal } from "./ProductModal";

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
}

interface DisplayProduct {
  id: number;
  name: string;
  category: string;
  status: "Active" | "Draft";
  image: string;
  isPublished: boolean;
  isGallery: boolean;
}

export function Products() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [categories, setCategories] = useState<Category[]>([]);

  const loadShopData = async (
    pageNum: number = 1,
    limitNum: number = limit,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, categoriesRes] = await Promise.all([
        adminApi.products.list({ page: pageNum, limit: limitNum }),
        adminApi.categories.list(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setPagination(productsRes.pagination || null);
      setPage(pageNum);
      setLimit(limitNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopData(1, limit);
  }, []);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await adminApi.products.delete(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted successfully!");
    } catch (err) {
      toast.error(
        `Failed to delete product: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleTogglePublish = async (productId: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newStatus = !product.isPublished;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isPublished: newStatus } : p,
        ),
      );

      await adminApi.products.update(productId, {
        isPublished: newStatus,
      });

      toast.success(
        `Product ${newStatus ? "published" : "unpublished"} successfully!`,
      );
      await loadShopData(page, limit);
    } catch (err) {
      await loadShopData(page, limit);
      toast.error(
        `Failed to update product: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleToggleGallery = async (productId: number) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newStatus = !product.isGallery;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isGallery: newStatus } : p,
        ),
      );

      await adminApi.products.update(productId, {
        isGallery: newStatus,
      });

      toast.success(
        `Product ${newStatus ? "added to" : "removed from"} gallery successfully!`,
      );
      await loadShopData(page, limit);
    } catch (err) {
      await loadShopData(page, limit);
      toast.error(
        `Failed to update product: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      const cleanedForm = {
        ...formData,
        priceFrom: formData.priceFrom ? formData.priceFrom : null,
      };

      if (selectedProduct) {
        await adminApi.products.update(selectedProduct.id, cleanedForm);
        toast.success("Product updated successfully!");
        setShowProductModal(false);
        setSelectedProduct(null);
        await loadShopData(page, limit);
      } else {
        // Generate slug from product name
        const slug = formData.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "");

        const response = await adminApi.products.create({
          ...cleanedForm,
          slug,
          isPublished: false,
          isFeatured: (formData as any).isFeatured || false,
        });

        const createdProduct = response.data as ProductDetail;
        // Add to table immediately
        setProducts((prev) => [createdProduct, ...prev]);
        toast.success("Product created successfully!");
        // Keep modal open for image upload
        setSelectedProduct(createdProduct);
      }
    } catch (err) {
      toast.error(
        `Failed to save product: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    loadShopData(newPage, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    loadShopData(1, newLimit);
  };

  const displayProducts: DisplayProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category?.name || "Uncategorized",
    status: product.isPublished ? "Active" : "Draft",
    image: product.primaryImage?.cdnUrl || "",
    isPublished: product.isPublished,
    isGallery: product.isGallery,
  }));

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
            Products
          </h1>
          <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setShowProductModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 transition-all"
          style={{
            background: "var(--ws-button-bg)",
            color: "var(--ws-button-text)",
            border: "var(--ws-button-border)",
            boxShadow: "var(--ws-button-shadow)",
          }}
        >
          <Plus size={18} />
          <span>Add Product</span>
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

      {/* Products Table */}
      {!loading && (
        <>
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
                    Product
                  </th>
                  <th
                    className="text-left p-4 text-sm"
                    style={{ color: "var(--ws-text-secondary)" }}
                  >
                    Category
                  </th>
                  <th
                    className="text-left p-4 text-sm"
                    style={{ color: "var(--ws-text-secondary)" }}
                  >
                    Status
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
                {displayProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <p style={{ color: "var(--ws-text-muted)" }}>
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b"
                      style={{ borderColor: "var(--ws-border)" }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 overflow-hidden"
                            style={{
                              backgroundColor: "var(--ws-surface)",
                            }}
                          >
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                style={{ color: "var(--ws-text-muted)" }}
                                className="flex items-center justify-center h-full text-xs"
                              >
                                No image
                              </div>
                            )}
                          </div>
                          <span style={{ color: "var(--ws-text-primary)" }}>
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="p-4"
                        style={{ color: "var(--ws-text-secondary)" }}
                      >
                        {product.category}
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 text-sm"
                          style={{
                            backgroundColor:
                              product.status === "Active"
                                ? "rgba(200, 97, 26, 0.1)"
                                : "rgba(107, 90, 71, 0.1)",
                            color:
                              product.status === "Active"
                                ? "var(--ws-amber)"
                                : "var(--ws-text-muted)",
                          }}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleGallery(product.id)}
                            className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-80"
                            style={{
                              backgroundColor: "var(--ws-surface)",
                              color: product.isGallery
                                ? "var(--ws-amber)"
                                : "var(--ws-text-secondary)",
                            }}
                            title={
                              product.isGallery
                                ? "Remove from Gallery"
                                : "Add to Gallery"
                            }
                          >
                            {product.isGallery ? "🖼" : "□"}
                          </button>
                          <button
                            onClick={() => handleTogglePublish(product.id)}
                            className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-80"
                            style={{
                              backgroundColor: "var(--ws-surface)",
                              color: product.isPublished
                                ? "var(--ws-amber)"
                                : "var(--ws-text-secondary)",
                            }}
                            title={
                              product.isPublished ? "Unpublish" : "Publish"
                            }
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const foundProduct = products.find(
                                (p) => p.id === product.id,
                              );
                              setSelectedProduct(
                                (foundProduct as ProductDetail) || null,
                              );
                              setShowProductModal(true);
                            }}
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
                            onClick={() => handleDeleteProduct(product.id)}
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

          {/* Pagination */}
          {pagination && (
            <Pagination
              currentPage={page}
              total={pagination.total}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          )}
        </>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
