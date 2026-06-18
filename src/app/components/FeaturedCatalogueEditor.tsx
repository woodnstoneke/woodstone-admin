import { useEffect, useState } from "react";
import { Plus, X, GripVertical, Loader } from "lucide-react";
import { adminApi, type ProductSummary } from "../../lib/api";

interface Product {
  id: number;
  name: string;
  category: string;
  material: string;
  price: string;
  image: string;
  tag?: string;
}

interface FeaturedCatalogueEditorProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

export function FeaturedCatalogueEditor({
  products,
  onChange,
}: FeaturedCatalogueEditorProps) {
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Fetch featured products on mount
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminApi.products.list({ limit: 1000 });
        const featured = response.data.filter((p) => p.isFeatured);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Map ProductSummary to Product interface
  const mapProductSummaryToProduct = (summary: ProductSummary): Product => ({
    id: summary.id,
    name: summary.name,
    category: summary.category?.name || "Uncategorized",
    material: summary.material || "Not specified",
    price: summary.priceFrom ? `KES ${summary.priceFrom}` : "Contact for price",
    image: summary.primaryImage?.cdnUrl || "",
    tag: undefined,
  });

  // Add product to featured catalogue
  const addProduct = (product: ProductSummary) => {
    const newProduct = mapProductSummaryToProduct(product);
    const updatedProducts = [...products, newProduct];
    onChange(updatedProducts);
    setShowModal(false);
  };

  // Remove product from featured catalogue
  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    onChange(updatedProducts);
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop to reorder
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newProducts = [...products];
    const draggedProduct = newProducts[draggedIndex];
    newProducts.splice(draggedIndex, 1);
    newProducts.splice(dropIndex, 0, draggedProduct);

    onChange(newProducts);
    setDraggedIndex(null);
  };

  // Get available products (not already in featured catalogue)
  const availableProducts = featuredProducts.filter(
    (featured) => !products.some((p) => p.id === featured.id),
  );

  return (
    <div className="space-y-6">
      {/* Featured Products List */}
      <div className="grid gap-4">
        {products.length === 0 ? (
          <div
            className="p-6 rounded border text-center"
            style={{
              backgroundColor: "var(--ws-card)",
              borderColor: "var(--ws-border)",
              color: "var(--ws-text-secondary)",
            }}
          >
            <p className="text-sm">No featured products selected yet.</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`p-4 border rounded transition-opacity ${
                draggedIndex === index ? "opacity-50" : ""
              }`}
              style={{
                backgroundColor: "var(--ws-card)",
                borderColor: "var(--ws-border)",
                cursor: "grab",
              }}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div
                  className="pt-1 flex-shrink-0"
                  style={{ color: "var(--ws-text-secondary)" }}
                >
                  <GripVertical size={16} />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-display font-semibold mb-2"
                    style={{ color: "var(--ws-text-primary)" }}
                  >
                    {product.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span style={{ color: "var(--ws-text-secondary)" }}>
                        Category:
                      </span>
                      <p style={{ color: "var(--ws-text-primary)" }}>
                        {product.category}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "var(--ws-text-secondary)" }}>
                        Material:
                      </span>
                      <p style={{ color: "var(--ws-text-primary)" }}>
                        {product.material}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: "var(--ws-text-secondary)" }}>
                        Price:
                      </span>
                      <p style={{ color: "var(--ws-text-primary)" }}>
                        {product.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Image Preview */}
                {product.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeProduct(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  style={{ backgroundColor: "transparent" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Products Button */}
      <button
        onClick={() => setShowModal(true)}
        disabled={loading || availableProducts.length === 0}
        className="flex items-center gap-2 px-4 py-2 border text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: "var(--ws-border)",
          color: "var(--ws-text-secondary)",
        }}
      >
        {loading ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <Plus size={16} />
        )}
        {loading ? "Loading featured products..." : "Add Featured Products"}
      </button>

      {error && (
        <div
          className="p-4 rounded border text-sm"
          style={{
            backgroundColor: "#fee",
            borderColor: "#fcc",
            color: "#c33",
          }}
        >
          {error}
        </div>
      )}

      {/* Product Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
            style={{
              backgroundColor: "var(--ws-card)",
              borderColor: "var(--ws-border)",
            }}
          >
            <div
              className="sticky top-0 p-6 border-b flex items-center justify-between"
              style={{ borderColor: "var(--ws-border)" }}
            >
              <h3
                className="text-lg font-display"
                style={{ color: "var(--ws-text-primary)" }}
              >
                Select Featured Products
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {availableProducts.length === 0 ? (
              <div
                className="p-6 text-center"
                style={{ color: "var(--ws-text-secondary)" }}
              >
                <p className="text-sm">
                  {products.length === 0
                    ? "No featured products available. Please mark products as featured in the products section first."
                    : "All featured products are already selected."}
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-3">
                {availableProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="w-full flex items-center gap-4 p-4 rounded border hover:border-amber-600 transition-colors text-left"
                    style={{
                      backgroundColor: "var(--ws-bg)",
                      borderColor: "var(--ws-border)",
                    }}
                  >
                    {product.primaryImage && (
                      <img
                        src={product.primaryImage.cdnUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--ws-text-primary)" }}
                      >
                        {product.name}
                      </h4>
                      <p
                        className="text-sm"
                        style={{ color: "var(--ws-text-secondary)" }}
                      >
                        {product.category?.name &&
                          `${product.category.name} • `}
                        {product.material && `${product.material} • `}
                        {product.priceFrom
                          ? `KES ${product.priceFrom}`
                          : "Contact for price"}
                      </p>
                    </div>
                    <Plus
                      size={18}
                      style={{
                        color: "var(--ws-text-secondary)",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
