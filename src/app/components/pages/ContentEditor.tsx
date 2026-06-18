import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  X,
  Plus,
  Edit2,
  Trash2,
  Loader,
  Star,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { HeroSlideshowPreview } from "../HeroSlideshowPreview";
import { HeroSlideshowEditor } from "../HeroSlideshowEditor";
import { FeaturedCataloguePreview } from "../FeaturedCataloguePreview";
import { FeaturedCatalogueEditor } from "../FeaturedCatalogueEditor";
import { ServicesPreview } from "../ServicesPreview";
import { ServicesEditor } from "../ServicesEditor";
import { FeaturedProjectsPreview } from "../FeaturedProjectsPreview";
import { FeaturedProjectsEditor } from "../FeaturedProjectsEditor";
import { TestimonialsPreview } from "../TestimonialsPreview";
import { TestimonialsEditor } from "../TestimonialsEditor";
import { AboutValuesEditor } from "../AboutValuesEditor";
import { AboutPillarsEditor } from "../AboutPillarsEditor";
import { AboutPreview } from "../AboutPreview";
import { ProductModal } from "./ProductModal";
import { Pagination } from "../Pagination";
import { adminApi } from "../../../lib/api";
import type { ProductDetail, ProductSummary, Category } from "../../../lib/api";

interface Slide {
  url: string;
  label: string;
  caption: string;
}

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

// Content is fetched from the API

export function ContentEditor() {
  const { pageName: paramPageName } = useParams<{ pageName: string }>();
  const pageName = `content-${paramPageName}`;
  const [previewMode, setPreviewMode] = useState(false);
  const [content, setContent] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shop page state
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    null,
  );
  const [productError, setProductError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(24);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const slug = paramPageName || "home";
        const baseUrl =
          import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787";
        const response = await fetch(`${baseUrl}/api/content/${slug}`);

        if (response.status === 404) {
          // Page doesn't exist, create it with initial data
          const initialData = {
            title: paramPageName || "home",
            isPublished: false,
            ...(slug === "about" && {
              values: { items: [] },
              businessPillars: { items: [] },
            }),
          };

          await adminApi.content.updatePage(slug, initialData);

          // Fetch the newly created page
          const retryResponse = await fetch(`${baseUrl}/api/content/${slug}`);
          if (!retryResponse.ok)
            throw new Error("Failed to fetch newly created content");
          const data = await retryResponse.json();
          setContent(data);
        } else if (!response.ok) {
          throw new Error("Failed to fetch content");
        } else {
          let data = await response.json();

          // Deduplicate about page data
          if (slug === "about") {
            if (data.values?.items) {
              data.values.items = Array.from(
                new Map(
                  data.values.items.map((v: any) => [v.title, v]),
                ).values(),
              );
            }
            if (data.businessPillars?.items) {
              data.businessPillars.items = Array.from(
                new Map(
                  data.businessPillars.items.map((p: any) => [p.title, p]),
                ).values(),
              );
            }
          }

          setContent(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setContent({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [paramPageName]);

  // Load products and categories when on shop page
  useEffect(() => {
    if (pageName !== "content-shop") return;

    loadShopData();
  }, [pageName]);

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
      // Find current product to get its publish status
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newStatus = !product.isPublished;

      // Optimistically update local state immediately
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isPublished: newStatus } : p,
        ),
      );

      // Make API call
      await adminApi.products.update(productId, {
        isPublished: newStatus,
      });

      toast.success(
        `Product ${newStatus ? "published" : "unpublished"} successfully!`,
      );

      // Reload products to ensure data is in sync
      await loadShopData();
    } catch (err) {
      // Revert the optimistic update by reloading
      await loadShopData();
      toast.error(
        `Failed to update product: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      // Convert empty priceFrom to null to avoid numeric error
      const cleanedForm = {
        ...formData,
        priceFrom: formData.priceFrom ? formData.priceFrom : null,
      };

      if (selectedProduct) {
        await adminApi.products.update(selectedProduct.id, cleanedForm);
        toast.success("Product updated successfully!");
        setShowProductModal(false);
        setSelectedProduct(null);
        await loadShopData();
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
        // Set for image upload modal
        setSelectedProduct(createdProduct);
      }
    } catch (err) {
      toast.error(
        `Failed to save product: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const loadShopData = async (page: number = 1, limit: number = pageLimit) => {
    try {
      setLoadingProducts(true);
      setProductError(null);
      const [productsRes, categoriesRes] = await Promise.all([
        adminApi.products.list(),
        adminApi.categories.list(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setPagination(productsRes.pagination || null);
      setCurrentPage(page);
      setPageLimit(limit);
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : "Failed to load data",
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadShopData(newPage, pageLimit);
  };

  const handleLimitChange = (newLimit: number) => {
    loadShopData(1, newLimit);
  };

  const pageTitle = pageName.replace("content-", "").replace("-", " ");

  const handleSaveHeroSlideshow = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "home";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        heroSlideshow: content.heroSlideshow,
        services: content.services,
        featuredProjects: content.featuredProjects,
        testimonials: content.testimonials,
        featuredCatalogue: content.featuredCatalogue,
      });
      toast.success("Hero slideshow saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save hero slideshow. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeaturedCatalogue = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "home";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        heroSlideshow: content.heroSlideshow,
        services: content.services,
        featuredProjects: content.featuredProjects,
        testimonials: content.testimonials,
        featuredCatalogue: content.featuredCatalogue,
      });
      toast.success("Featured catalogue saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save featured catalogue. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveServices = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "home";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        heroSlideshow: content.heroSlideshow,
        services: content.services,
        featuredProjects: content.featuredProjects,
        testimonials: content.testimonials,
        featuredCatalogue: content.featuredCatalogue,
      });
      toast.success("Services saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save services. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFeaturedProjects = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "home";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        heroSlideshow: content.heroSlideshow,
        services: content.services,
        featuredProjects: content.featuredProjects,
        testimonials: content.testimonials,
        featuredCatalogue: content.featuredCatalogue,
      });
      toast.success("Featured projects saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save featured projects. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTestimonials = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "home";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        heroSlideshow: content.heroSlideshow,
        services: content.services,
        featuredProjects: content.featuredProjects,
        testimonials: content.testimonials,
        featuredCatalogue: content.featuredCatalogue,
      });
      toast.success("Testimonials saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save testimonials. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAboutValues = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "about";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        values: content.values,
        businessPillars: content.businessPillars,
      });
      toast.success("Values saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save values. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAboutPillars = async () => {
    setIsSaving(true);
    try {
      const slug = paramPageName || "about";
      await adminApi.content.updatePage(slug, {
        title: pageTitle,
        isPublished: false,
        values: content.values,
        businessPillars: content.businessPillars,
      });
      toast.success("Business pillars saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save business pillars. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: "var(--ws-bg)", minHeight: "100vh" }}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-gray-300 border-t-amber-500 rounded-full animate-spin"></div>
            <p style={{ color: "var(--ws-text-muted)" }}>Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "var(--ws-bg)", minHeight: "100vh" }}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p style={{ color: "var(--ws-text-danger)" }}>Error: {error}</p>
            <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
              Failed to load page content. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (previewMode && pageName === "content-home") {
    return (
      <div style={{ backgroundColor: "var(--ws-bg)", minHeight: "100vh" }}>
        <div
          className="sticky top-0 z-50 p-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              <X size={20} />
            </button>
            <span
              className="font-display"
              style={{ color: "var(--ws-text-primary)" }}
            >
              Preview Mode
            </span>
          </div>
          <span className="text-sm" style={{ color: "var(--ws-text-muted)" }}>
            Previewing homepage content
          </span>
        </div>

        <HeroSlideshowPreview images={content.heroSlideshow?.images || []} />
        <FeaturedCataloguePreview
          products={content.featuredCatalogue?.products || []}
        />
        <ServicesPreview services={content.services?.items || []} />
        <FeaturedProjectsPreview
          projects={content.featuredProjects?.items || []}
        />
        <TestimonialsPreview
          testimonials={content.testimonials?.items || []}
          title="Why Experts Choose"
          highlight="Working With US"
          autoPlayInterval={6000}
        />
      </div>
    );
  }

  if (previewMode && pageName === "content-about") {
    return (
      <div style={{ backgroundColor: "var(--ws-bg)", minHeight: "100vh" }}>
        <div
          className="sticky top-0 z-50 p-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(false)}
              className="p-2"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              <X size={20} />
            </button>
            <span
              className="font-display"
              style={{ color: "var(--ws-text-primary)" }}
            >
              Preview Mode
            </span>
          </div>
          <span className="text-sm" style={{ color: "var(--ws-text-muted)" }}>
            Previewing about page content
          </span>
        </div>

        <AboutPreview
          values={content.values?.items || []}
          businessPillars={content.businessPillars?.items || []}
        />
      </div>
    );
  }

  if (pageName === "content-about") {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-display tracking-tight capitalize"
              style={{ color: "var(--ws-text-primary)", fontSize: "36px" }}
            >
              About Page
            </h1>
            <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
              Edit the about page content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2 px-6 py-3 border"
              style={{
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-secondary)",
              }}
            >
              <Eye size={18} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        <div
          className="p-6 border space-y-8"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          {/* Values Section */}
          <div
            className="space-y-4 p-4 border rounded"
            style={{
              backgroundColor: "var(--ws-surface)",
              borderColor: "var(--ws-border)",
            }}
          >
            <div>
              <h3
                className="font-display mb-1"
                style={{
                  color: "var(--ws-text-primary)",
                  fontSize: "18px",
                }}
              >
                Core Values
              </h3>
              <p className="text-sm" style={{ color: "var(--ws-text-muted)" }}>
                Manage the company values.
              </p>
            </div>
            <AboutValuesEditor
              values={content.values?.items || []}
              onChange={(items) =>
                setContent((prev: any) => ({
                  ...prev,
                  values: { items },
                }))
              }
            />
            <div
              className="flex justify-end pt-4 border-t"
              style={{ borderColor: "var(--ws-border)" }}
            >
              <button
                onClick={handleSaveAboutValues}
                disabled={isSaving}
                className="px-6 py-2 text-sm disabled:opacity-50"
                style={{
                  background: "var(--ws-button-bg)",
                  color: "var(--ws-button-text)",
                }}
              >
                {isSaving ? "Saving..." : "Save Values"}
              </button>
            </div>
          </div>

          {/* Business Pillars Section */}
          <div
            className="space-y-4 p-4 border rounded"
            style={{
              backgroundColor: "var(--ws-surface)",
              borderColor: "var(--ws-border)",
            }}
          >
            <div>
              <h3
                className="font-display mb-1"
                style={{
                  color: "var(--ws-text-primary)",
                  fontSize: "18px",
                }}
              >
                Business Pillars
              </h3>
              <p className="text-sm" style={{ color: "var(--ws-text-muted)" }}>
                Manage the business pillars.
              </p>
            </div>
            <AboutPillarsEditor
              pillars={content.businessPillars?.items || []}
              onChange={(items) =>
                setContent((prev: any) => ({
                  ...prev,
                  businessPillars: { items },
                }))
              }
            />
            <div
              className="flex justify-end pt-4 border-t"
              style={{ borderColor: "var(--ws-border)" }}
            >
              <button
                onClick={handleSaveAboutPillars}
                disabled={isSaving}
                className="px-6 py-2 text-sm disabled:opacity-50"
                style={{
                  background: "var(--ws-button-bg)",
                  color: "var(--ws-button-text)",
                }}
              >
                {isSaving ? "Saving..." : "Save Business Pillars"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageName === "content-home") {
    return (
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-display tracking-tight capitalize"
              style={{ color: "var(--ws-text-primary)", fontSize: "36px" }}
            >
              {pageTitle}
            </h1>
            <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
              Edit the homepage content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-2 px-6 py-3 border"
              style={{
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-secondary)",
              }}
            >
              <Eye size={18} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        <div
          className="p-6 border"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-8">
              {/* Hero Slideshow Section */}
              <div
                className="space-y-4 p-4 border rounded"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                }}
              >
                <div>
                  <h3
                    className="font-display mb-1"
                    style={{
                      color: "var(--ws-text-primary)",
                      fontSize: "18px",
                    }}
                  >
                    Hero Slideshow
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--ws-text-muted)" }}
                  >
                    Manage your homepage hero slides.
                  </p>
                </div>
                <HeroSlideshowEditor
                  images={content.heroSlideshow?.images || []}
                  onChange={(images) =>
                    setContent((prev: any) => ({
                      ...prev,
                      heroSlideshow: { ...prev.heroSlideshow, images },
                    }))
                  }
                />
                <div
                  className="flex justify-end pt-4 border-t"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <button
                    onClick={handleSaveHeroSlideshow}
                    disabled={isSaving}
                    className="px-6 py-2 text-sm disabled:opacity-50"
                    style={{
                      background: "var(--ws-button-bg)",
                      color: "var(--ws-button-text)",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Hero Slideshow"}
                  </button>
                </div>
              </div>

              {/* Featured Catalogue Section */}
              <div
                className="space-y-4 p-4 border rounded"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                }}
              >
                <div>
                  <h3
                    className="font-display mb-1"
                    style={{
                      color: "var(--ws-text-primary)",
                      fontSize: "18px",
                    }}
                  >
                    Featured Catalogue
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--ws-text-muted)" }}
                  >
                    Manage your featured products on the homepage.
                  </p>
                </div>
                <FeaturedCatalogueEditor
                  products={content.featuredCatalogue?.products || []}
                  onChange={(products) =>
                    setContent((prev: any) => ({
                      ...prev,
                      featuredCatalogue: {
                        ...prev.featuredCatalogue,
                        products,
                      },
                    }))
                  }
                />
                <div
                  className="flex justify-end pt-4 border-t"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <button
                    onClick={handleSaveFeaturedCatalogue}
                    disabled={isSaving}
                    className="px-6 py-2 text-sm disabled:opacity-50"
                    style={{
                      background: "var(--ws-button-bg)",
                      color: "var(--ws-button-text)",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Featured Catalogue"}
                  </button>
                </div>
              </div>

              {/* Services Section */}
              <div
                className="space-y-4 p-4 border rounded"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                }}
              >
                <div>
                  <h3
                    className="font-display mb-1"
                    style={{
                      color: "var(--ws-text-primary)",
                      fontSize: "18px",
                    }}
                  >
                    Services
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--ws-text-muted)" }}
                  >
                    Manage the services section displayed on the homepage.
                  </p>
                </div>
                <ServicesEditor
                  services={content.services?.items || []}
                  onChange={(items) =>
                    setContent((prev: any) => ({
                      ...prev,
                      services: { ...prev.services, items },
                    }))
                  }
                />
                <div
                  className="flex justify-end pt-4 border-t"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <button
                    onClick={handleSaveServices}
                    disabled={isSaving}
                    className="px-6 py-2 text-sm disabled:opacity-50"
                    style={{
                      background: "var(--ws-button-bg)",
                      color: "var(--ws-button-text)",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Services"}
                  </button>
                </div>
              </div>

              {/* Featured Projects Section */}
              <div
                className="space-y-4 p-4 border rounded"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                }}
              >
                <div>
                  <h3
                    className="font-display mb-1"
                    style={{
                      color: "var(--ws-text-primary)",
                      fontSize: "18px",
                    }}
                  >
                    Featured Projects
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--ws-text-muted)" }}
                  >
                    Manage your featured projects displayed on the homepage.
                  </p>
                </div>
                <FeaturedProjectsEditor
                  projects={content.featuredProjects?.items || []}
                  onChange={(items) =>
                    setContent((prev: any) => ({
                      ...prev,
                      featuredProjects: { ...prev.featuredProjects, items },
                    }))
                  }
                />
                <div
                  className="flex justify-end pt-4 border-t"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <button
                    onClick={handleSaveFeaturedProjects}
                    disabled={isSaving}
                    className="px-6 py-2 text-sm disabled:opacity-50"
                    style={{
                      background: "var(--ws-button-bg)",
                      color: "var(--ws-button-text)",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Featured Projects"}
                  </button>
                </div>
              </div>

              {/* Testimonials Section */}
              <div
                className="space-y-4 p-4 border rounded"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                }}
              >
                <div>
                  <h3
                    className="font-display mb-1"
                    style={{
                      color: "var(--ws-text-primary)",
                      fontSize: "18px",
                    }}
                  >
                    Testimonials
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--ws-text-muted)" }}
                  >
                    Manage customer testimonials displayed on the homepage.
                  </p>
                </div>
                <TestimonialsEditor
                  testimonials={content.testimonials?.items || []}
                  onChange={(items) =>
                    setContent((prev: any) => ({
                      ...prev,
                      testimonials: { ...prev.testimonials, items },
                    }))
                  }
                />
                <div
                  className="flex justify-end pt-4 border-t"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <button
                    onClick={handleSaveTestimonials}
                    disabled={isSaving}
                    className="px-6 py-2 text-sm disabled:opacity-50"
                    style={{
                      background: "var(--ws-button-bg)",
                      color: "var(--ws-button-text)",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Testimonials"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pageName === "content-shop") {
    return (
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-display tracking-tight capitalize"
              style={{
                color: "var(--ws-text-primary)",
                fontSize: "36px",
              }}
            >
              Shop Products
            </h1>
            <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
              Manage your shop product catalog
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
        {productError && (
          <div
            className="p-4 border rounded"
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              borderColor: "rgba(220, 38, 38, 0.3)",
              color: "#dc2626",
            }}
          >
            {productError}
          </div>
        )}

        {/* Loading State */}
        {loadingProducts && (
          <div className="flex items-center justify-center py-12">
            <Loader
              size={20}
              style={{ color: "var(--ws-amber)" }}
              className="animate-spin"
            />
          </div>
        )}

        {/* Products Table */}
        {!loadingProducts && (
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
                      Image
                    </th>
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
                      Material
                    </th>
                    <th
                      className="text-left p-4 text-sm"
                      style={{ color: "var(--ws-text-secondary)" }}
                    >
                      Price
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
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <p style={{ color: "var(--ws-text-muted)" }}>
                          No products found. Create one to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b"
                        style={{ borderColor: "var(--ws-border)" }}
                      >
                        <td className="p-4">
                          {product.primaryImage ? (
                            <div
                              className="w-12 h-12 overflow-hidden rounded"
                              style={{
                                backgroundColor: "var(--ws-surface)",
                              }}
                            >
                              <img
                                src={product.primaryImage.cdnUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-12 h-12 rounded flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: "var(--ws-surface)",
                                color: "var(--ws-text-muted)",
                              }}
                            >
                              —
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div>
                            <p style={{ color: "var(--ws-text-primary)" }}>
                              {product.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--ws-text-muted)" }}
                            >
                              {product.slug}
                            </p>
                          </div>
                        </td>
                        <td
                          className="p-4"
                          style={{ color: "var(--ws-text-secondary)" }}
                        >
                          {product.category?.name || "—"}
                        </td>
                        <td
                          className="p-4"
                          style={{ color: "var(--ws-text-secondary)" }}
                        >
                          {product.material || "—"}
                        </td>
                        <td
                          className="p-4"
                          style={{ color: "var(--ws-text-secondary)" }}
                        >
                          {product.priceFrom
                            ? `KES ${Number(product.priceFrom).toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleTogglePublish(product.id)}
                                className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium transition-all"
                                title={
                                  product.isPublished ? "Unpublish" : "Publish"
                                }
                                style={{
                                  backgroundColor: product.isPublished
                                    ? "rgba(34, 197, 94, 0.1)"
                                    : "rgba(107, 114, 128, 0.1)",
                                  color: product.isPublished
                                    ? "#22c55e"
                                    : "var(--ws-text-muted)",
                                }}
                              >
                                {product.isPublished ? (
                                  <>
                                    <CheckCircle2 size={14} />
                                    Published
                                  </>
                                ) : (
                                  <>
                                    <Circle size={14} />
                                    Draft
                                  </>
                                )}
                              </button>
                              {product.isFeatured && (
                                <div
                                  className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                                    color: "#f59e0b",
                                  }}
                                >
                                  <Star size={14} fill="currentColor" />
                                  Featured
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product as ProductDetail);
                                setShowProductModal(true);
                              }}
                              className="w-8 h-8 flex items-center justify-center transition-all"
                              title="Edit product"
                              style={{
                                backgroundColor: "var(--ws-surface)",
                                color: "var(--ws-text-secondary)",
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="w-8 h-8 flex items-center justify-center transition-all"
                              title="Delete product"
                              style={{
                                backgroundColor: "var(--ws-surface)",
                                color: "var(--ws-text-secondary)",
                              }}
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

            {/* Pagination - Separate Component */}
            <div className="mt-6">
              {pagination && (
                <Pagination
                  currentPage={currentPage}
                  total={pagination.total}
                  limit={pageLimit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </div>
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
            onImageUploaded={loadShopData}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1
        className="font-display tracking-tight capitalize"
        style={{ color: "var(--ws-text-primary)", fontSize: "36px" }}
      >
        {pageTitle}
      </h1>
      <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
        Content editor for this page is under construction
      </p>
    </div>
  );
}
