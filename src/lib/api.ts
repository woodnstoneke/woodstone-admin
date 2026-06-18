const BASE_URL = import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787";
const ADMIN_KEY = import.meta.env.VITE_API_SECRET_KEY ?? "";

// ── Fetch Helpers ─────────────────────────────────────────────────────────────

async function get<T>(path: string, isAdmin = false): Promise<T> {
  // Add cache-busting query parameter for admin requests
  const separator = path.includes("?") ? "&" : "?";
  const cacheBustedPath = isAdmin
    ? `${path}${separator}_t=${Date.now()}`
    : path;

  const res = await fetch(`${BASE_URL}${cacheBustedPath}`, {
    cache: "no-store",
    headers: isAdmin ? { Authorization: `Bearer ${ADMIN_KEY}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function post<T>(
  path: string,
  body: unknown,
  isAdmin = false,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(isAdmin ? { Authorization: `Bearer ${ADMIN_KEY}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    cache: "no-store",
    headers: { Authorization: `Bearer ${ADMIN_KEY}` },
  });
  if (!res.ok) throw new Error(await res.text());
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result;
}

export const adminApi = {
  categories: {
    list: () => get<{ data: Category[] }>("/api/admin/categories", true),
    create: (body: Partial<Category>) =>
      post<{ data: Category }>("/api/admin/categories", body, true),
    update: (id: number, body: Partial<Category>) =>
      patch<{ data: Category }>(`/api/admin/categories/${id}`, body),
    delete: (id: number) => del(`/api/admin/categories/${id}`),
  },

  products: {
    list: (params?: { page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set("page", String(params.page));
      if (params?.limit) qs.set("limit", String(params.limit));
      qs.set("showAll", "true");
      return get<{ data: ProductSummary[]; pagination: Pagination }>(
        `/api/admin/products?${qs}`,
        true,
      );
    },
    create: (body: Partial<ProductDetail>) =>
      post<{ data: ProductDetail }>("/api/admin/products", body, true),
    update: (id: number, body: Partial<ProductDetail>) =>
      patch<{ data: ProductDetail }>(`/api/admin/products/${id}`, body),
    delete: (id: number) => del(`/api/admin/products/${id}`),
  },

  uploads: {
    /**
     * Full image upload flow:
     * 1. Get a presigned URL from the Worker
     * 2. PUT the file directly to R2
     * 3. Confirm so the Worker writes to the DB
     */
    upload: async (
      productId: number,
      file: File,
      opts?: { altText?: string; sortOrder?: number },
    ) => {
      // Step 1: Presign
      const { uploadUrl, r2Key, publicUrl } = await post<{
        uploadUrl: string;
        r2Key: string;
        publicUrl: string;
      }>(
        "/api/admin/uploads/presign",
        {
          productId,
          fileName: file.name,
          contentType: file.type,
        },
        true,
      );

      // Step 2: Upload directly to R2 (no Worker in the middle)
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        const responseText = await uploadRes.text();
        throw new Error(
          `R2 upload failed: ${uploadRes.status} ${uploadRes.statusText}`,
        );
      }

      // Step 3: Confirm
      const confirmResult = await post<{ data: ProductImage }>(
        "/api/admin/uploads/confirm",
        {
          productId,
          r2Key,
          altText: opts?.altText,
          sortOrder: opts?.sortOrder,
        },
        true,
      );
      return confirmResult;
    },

    /**
     * Upload for slideshow images (no DB confirm)
     */
    uploadSlideshow: async (file: File) => {
      const { uploadUrl, publicUrl } = await post<{
        uploadUrl: string;
        publicUrl: string;
      }>(
        "/api/admin/uploads/presign",
        {
          productId: 0, // dummy for slideshow
          fileName: file.name,
          contentType: file.type,
        },
        true,
      );

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      return publicUrl;
    },

    delete: (imageId: number) => del(`/api/admin/uploads/${imageId}`),
  },

  enquiries: {
    list: () => get<{ data: Enquiry[] }>("/api/admin/enquiries", true),
    markRead: (id: string) =>
      patch<{ data: Enquiry }>(`/api/admin/enquiries/${id}/read`, {}),
  },

  blog: {
    list: (params?: { limit?: number }) => {
      const qs = new URLSearchParams({ showAll: "true", limit: String(params?.limit ?? 50) });
      return get<{ data: BlogPost[] }>(`/api/blog?${qs}`, true);
    },
    create: (body: Partial<BlogPost>) =>
      post<{ data: BlogPost }>("/api/admin/blog", body, true),
    update: (id: number, body: Partial<BlogPost>) =>
      patch<{ data: BlogPost }>(`/api/admin/blog/${id}`, body),
    delete: (id: number) => del(`/api/admin/blog/${id}`),
  },

  content: {
    updatePage: (slug: string, body: any) =>
      put<{ success: boolean; message: string; pageId: number }>(
        `/api/admin/content/${slug}`,
        body,
      ),
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductSummary = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  material: string | null;
  finish: string | null;
  priceFrom: string | null;
  unit: string | null;
  isFeatured: boolean;
  isGallery: boolean;
  isPublished: boolean;
  category: Pick<Category, "id" | "name" | "slug"> | null;
  primaryImage: { cdnUrl: string; altText: string | null } | null;
};

export type ProductDetail = ProductSummary & {
  description: string | null;
  tags: string[] | null;
  isPublished: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: number;
  productId: number;
  r2Key: string;
  cdnUrl: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
};

export type EnquiryInput = {
  productId?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export type Enquiry = EnquiryInput & {
  id: string;
  isRead: boolean;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  coverImageKey: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
