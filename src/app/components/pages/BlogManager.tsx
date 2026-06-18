import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Loader,
  Calendar, Tag, Search, BookOpen, X, Upload, Bold,
  Italic, List, Link as LinkIcon, Heading,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787";
const ADMIN_KEY = import.meta.env.VITE_API_SECRET_KEY ?? "";

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ADMIN_KEY}`,
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  author: string | null;
  category: string | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const BLOG_CATEGORIES = [
  "Interior Design Tips",
  "Wood & Joinery",
  "Stone & Cladding",
  "Client Projects",
  "Kenyan Design",
  "How-To Guides",
  "Behind the Scenes",
  "News & Updates",
];

const emptyForm = (): Partial<BlogPost> => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  author: "Wood & Stone Kenya",
  category: "",
  tags: [],
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Simple toolbar for content
function RichToolbar({ onInsert }: { onInsert: (tag: string, close: string) => void }) {
  const btns = [
    { icon: <Heading size={14} />, open: "<h2>", close: "</h2>", title: "Heading" },
    { icon: <Bold size={14} />, open: "<strong>", close: "</strong>", title: "Bold" },
    { icon: <Italic size={14} />, open: "<em>", close: "</em>", title: "Italic" },
    { icon: <List size={14} />, open: "<ul>\n  <li>", close: "</li>\n</ul>", title: "List" },
    { icon: <LinkIcon size={14} />, open: '<a href="URL">', close: "</a>", title: "Link" },
  ];
  return (
    <div className="flex gap-1 p-2" style={{ background: "var(--ws-surface)", borderBottom: "1px solid var(--ws-border)" }}>
      {btns.map((b) => (
        <button
          key={b.title}
          type="button"
          title={b.title}
          onClick={() => onInsert(b.open, b.close)}
          className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-80"
          style={{ background: "var(--ws-card)", color: "var(--ws-text-muted)", border: "1px solid var(--ws-border)" }}
        >
          {b.icon}
        </button>
      ))}
    </div>
  );
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Partial<BlogPost>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/blog?showAll=true&limit=50`, { headers: HEADERS });
      const data = await res.json();
      setPosts(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setTagInput("");
    setShowModal(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({ ...post });
    setTagInput("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleChange = (field: keyof BlogPost, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !editing) next.slug = slugify(value as string);
      return next;
    });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    handleChange("tags", [...(form.tags || []), t]);
    setTagInput("");
  };

  const removeTag = (t: string) => handleChange("tags", (form.tags || []).filter((x) => x !== t));

  const insertTag = (open: string, close: string) => {
    const ta = contentRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e);
    const newVal = value.slice(0, s) + open + selected + close + value.slice(e);
    handleChange("content", newVal);
    setTimeout(() => {
      ta.selectionStart = s + open.length;
      ta.selectionEnd = s + open.length + selected.length;
      ta.focus();
    }, 0);
  };

  const uploadCover = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      // Get upload URL from API
      const res = await fetch(`${BASE_URL}/api/admin/uploads/presign`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Presign failed");
      const { uploadUrl, publicUrl } = await res.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      handleChange("coverImageUrl", publicUrl);
      toast.success("Cover image uploaded");
    } catch {
      toast.error("Upload failed — paste a URL instead");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await fetch(`${BASE_URL}/api/admin/blog/${editing.id}`, {
          method: "PATCH",
          headers: HEADERS,
          body: JSON.stringify(form),
        });
        toast.success("Post updated");
      } else {
        await fetch(`${BASE_URL}/api/admin/blog`, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(form),
        });
        toast.success("Post created");
      }
      closeModal();
      fetchPosts();
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      await fetch(`${BASE_URL}/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: HEADERS,
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      toast.success(post.isPublished ? "Post unpublished" : "Post published");
      fetchPosts();
    } catch { toast.error("Failed to update"); }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`${BASE_URL}/api/admin/blog/${id}`, { method: "DELETE", headers: HEADERS });
    toast.success("Post deleted");
    fetchPosts();
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--ws-bg)",
    border: "1px solid var(--ws-border)",
    color: "var(--ws-text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--ws-cream-light)" }}>
            Blog Manager
          </h1>
          <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: "13px", marginTop: 4 }}>
            Create and manage journal articles for the website
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-85"
          style={{ background: "var(--ws-amber)", color: "#fff", fontFamily: "var(--font-body)", border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6" style={{ maxWidth: 360 }}>
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ws-text-muted)" }} />
        <input
          type="text"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Posts", value: posts.length },
          { label: "Published", value: posts.filter((p) => p.isPublished).length },
          { label: "Drafts", value: posts.filter((p) => !p.isPublished).length },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "20px 24px" }}>
            <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--ws-amber)", marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Post list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader size={28} className="animate-spin" style={{ color: "var(--ws-amber)" }} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" style={{ color: "var(--ws-text-muted)" }} />
          <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>No posts yet. Create your first article above.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid var(--ws-border)" }}>
          {filtered.map((post, i) => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 transition-all hover:opacity-90"
              style={{
                borderBottom: i < filtered.length - 1 ? "1px solid var(--ws-border)" : "none",
                background: "var(--ws-card)",
              }}
            >
              {/* Cover thumb */}
              <div className="flex-shrink-0 w-16 h-14 overflow-hidden" style={{ background: "var(--ws-surface)" }}>
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={18} style={{ color: "var(--ws-border)" }} />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "0.95rem" }} className="truncate">
                    {post.title}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 flex-shrink-0"
                    style={{
                      background: post.isPublished ? "rgba(45,90,61,0.3)" : "var(--ws-surface)",
                      color: post.isPublished ? "#6FCF97" : "var(--ws-text-muted)",
                      border: `1px solid ${post.isPublished ? "#2D5A3D" : "var(--ws-border)"}`,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {post.category && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--ws-amber)", fontFamily: "var(--font-body)" }}>
                      <Tag size={10} /> {post.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>
                    <Calendar size={10} /> {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => togglePublish(post)}
                  title={post.isPublished ? "Unpublish" : "Publish"}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-70"
                  style={{ background: "var(--ws-surface)", color: "var(--ws-text-muted)", border: "1px solid var(--ws-border)", cursor: "pointer" }}
                >
                  {post.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => openEdit(post)}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-70"
                  style={{ background: "var(--ws-surface)", color: "var(--ws-amber)", border: "1px solid var(--ws-border)", cursor: "pointer" }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:opacity-70"
                  style={{ background: "var(--ws-surface)", color: "#ef4444", border: "1px solid var(--ws-border)", cursor: "pointer" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-8"
          style={{ background: "rgba(0,0,0,0.75)" }}>
          <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", width: "100%", maxWidth: 860, borderRadius: 2 }}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--ws-border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1.15rem" }}>
                {editing ? "Edit Post" : "New Post"}
              </h2>
              <button onClick={closeModal} style={{ color: "var(--ws-text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Title *</label>
                  <input type="text" value={form.title || ""} onChange={(e) => handleChange("title", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Slug</label>
                  <input type="text" value={form.slug || ""} onChange={(e) => handleChange("slug", e.target.value)} style={inputStyle} placeholder="auto-generated" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Category</label>
                  <select value={form.category || ""} onChange={(e) => handleChange("category", e.target.value)} style={inputStyle}>
                    <option value="">Select category…</option>
                    {BLOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Author</label>
                  <input type="text" value={form.author || ""} onChange={(e) => handleChange("author", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Excerpt (shown in listing)</label>
                  <textarea rows={3} value={form.excerpt || ""} onChange={(e) => handleChange("excerpt", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Tags</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {(form.tags || []).map((t) => (
                      <span key={t} className="flex items-center gap-1 text-xs px-2 py-1"
                        style={{ background: "var(--ws-surface)", color: "var(--ws-text-muted)", border: "1px solid var(--ws-border)", fontFamily: "var(--font-body)" }}>
                        {t}
                        <button type="button" onClick={() => removeTag(t)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="e.g. nairobi, kitchen" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={addTag} style={{ padding: "8px 14px", background: "var(--ws-surface)", color: "var(--ws-amber)", border: "1px solid var(--ws-border)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12 }}>Add</button>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Cover image */}
                <div>
                  <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Cover Image</label>
                  {form.coverImageUrl && (
                    <div className="relative mb-2" style={{ height: 120 }}>
                      <img src={form.coverImageUrl} alt="cover" className="w-full h-full object-cover" style={{ border: "1px solid var(--ws-border)" }} />
                      <button onClick={() => handleChange("coverImageUrl", "")} className="absolute top-1 right-1" style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", padding: 3 }}><X size={12} /></button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
                    <button type="button" onClick={() => coverInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 text-xs transition-opacity hover:opacity-80"
                      style={{ background: "var(--ws-surface)", color: "var(--ws-text-muted)", border: "1px solid var(--ws-border)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                      {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />} Upload
                    </button>
                    <input type="text" value={form.coverImageUrl || ""} onChange={(e) => handleChange("coverImageUrl", e.target.value)} placeholder="…or paste image URL" style={{ ...inputStyle, flex: 1 }} />
                  </div>
                </div>

                {/* SEO fields */}
                <div style={{ padding: 16, background: "var(--ws-surface)", border: "1px solid var(--ws-border)" }}>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--ws-amber)", fontFamily: "var(--font-body)" }}>SEO (Kenya Market)</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Meta Title</label>
                      <input type="text" value={form.metaTitle || ""} onChange={(e) => handleChange("metaTitle", e.target.value)} placeholder={form.title ? `${form.title} – Wood & Stone Kenya` : ""} style={inputStyle} />
                      <p className="text-xs mt-1" style={{ color: (form.metaTitle?.length || 0) > 60 ? "#ef4444" : "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>
                        {form.metaTitle?.length || 0}/60 chars
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Meta Description</label>
                      <textarea rows={2} value={form.metaDescription || ""} onChange={(e) => handleChange("metaDescription", e.target.value)} placeholder="Describe this article for Google (include Kenya-specific keywords)" style={{ ...inputStyle, resize: "none" }} />
                      <p className="text-xs mt-1" style={{ color: (form.metaDescription?.length || 0) > 160 ? "#ef4444" : "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>
                        {form.metaDescription?.length || 0}/160 chars
                      </p>
                    </div>
                  </div>
                </div>

                {/* Publish toggle */}
                <div className="flex items-center justify-between p-4" style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-border)" }}>
                  <div>
                    <p style={{ color: "var(--ws-cream-light)", fontFamily: "var(--font-body)", fontSize: 14 }}>
                      {form.isPublished ? "Published — visible on site" : "Draft — not visible yet"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange("isPublished", !form.isPublished)}
                    className="w-12 h-6 relative transition-all"
                    style={{ background: form.isPublished ? "var(--ws-amber)" : "var(--ws-border)", borderRadius: 12, border: "none", cursor: "pointer" }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 transition-all"
                      style={{ background: "#fff", borderRadius: "50%", left: form.isPublished ? "calc(100% - 20px)" : 4 }}
                    />
                  </button>
                </div>
              </div>

              {/* Content editor — full width */}
              <div className="lg:col-span-2">
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>Article Content (HTML)</label>
                <div style={{ border: "1px solid var(--ws-border)" }}>
                  <RichToolbar onInsert={insertTag} />
                  <textarea
                    ref={contentRef}
                    rows={14}
                    value={form.content || ""}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="<h2>Your section heading</h2>&#10;<p>Write your article here. Use HTML tags for formatting.</p>"
                    style={{ ...inputStyle, border: "none", resize: "vertical", minHeight: 260, fontFamily: "monospace", fontSize: 13 }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)" }}>
                  Write in HTML. Tip: include keywords like "Nairobi", "Kenya", and your category for better SEO.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-5" style={{ borderTop: "1px solid var(--ws-border)" }}>
              <button onClick={closeModal} style={{ padding: "10px 20px", background: "var(--ws-surface)", color: "var(--ws-text-muted)", border: "1px solid var(--ws-border)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13 }}>
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 transition-opacity hover:opacity-85"
                style={{ padding: "10px 24px", background: "var(--ws-amber)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13 }}
              >
                {saving ? <Loader size={14} className="animate-spin" /> : null}
                {editing ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
