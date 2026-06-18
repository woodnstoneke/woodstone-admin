import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, MessageSquare, Package, Eye, Users, RefreshCw, Loader } from "lucide-react";

const BASE_URL = import.meta.env.VITE_WORKER_URL ?? "http://localhost:8787";
const ADMIN_KEY = import.meta.env.VITE_API_SECRET_KEY ?? "";
const HEADERS = { Authorization: `Bearer ${ADMIN_KEY}` };

const AMBER = "var(--ws-amber)";
const PIE_COLORS = ["#C8611A", "#E8901A", "#A04A10", "#6B3010", "#F0B060", "#784A20"];

interface AnalyticsData {
  enquiriesByMonth: { month: string; count: number }[];
  enquiriesByDay: { day: string; count: number }[];
  topProducts: { name: string; enquiries: number; slug: string }[];
  readRate: { read: number; unread: number };
  totalEnquiries: number;
  totalProducts: number;
  totalPublished: number;
  totalBlogPosts: number;
  recentEnquiries: {
    id: string;
    name: string;
    message: string;
    createdAt: string;
    isRead: boolean;
  }[];
}

function Shimmer({ h = "100%", w = "100%" }: { h?: string; w?: string }) {
  return (
    <div
      style={{
        height: h, width: w,
        background: "var(--ws-border)",
        animation: "shimmer 1.6s ease-in-out infinite",
        opacity: 0.5,
        borderRadius: 3,
      }}
    />
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "10px 14px", fontFamily: "var(--font-body)", fontSize: 13 }}>
      <p style={{ color: "var(--ws-text-muted)", marginBottom: 4 }}>{label}</p>
      <p style={{ color: AMBER, fontWeight: 600 }}>{payload[0].value} enquiries</p>
    </div>
  );
};

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [enqRes, prodRes, blogRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/enquiries`, { headers: HEADERS }),
        fetch(`${BASE_URL}/api/admin/products?showAll=true&limit=200`, { headers: HEADERS }),
        fetch(`${BASE_URL}/api/blog?showAll=true&limit=200`, { headers: HEADERS }),
      ]);

      const [enqData, prodData, blogData] = await Promise.all([
        enqRes.json(),
        prodRes.json(),
        blogRes.json(),
      ]);

      const enquiries: any[] = enqData.data || [];
      const products: any[] = prodData.data || [];
      const blogPosts: any[] = blogData.data || [];

      // Enquiries by month (last 6 months)
      const monthMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
        monthMap[key] = 0;
      }
      enquiries.forEach((e) => {
        const d = new Date(e.createdAt);
        const key = d.toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
        if (key in monthMap) monthMap[key]++;
      });

      // Enquiries by day of week
      const dayMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      enquiries.forEach((e) => {
        const d = new Date(e.createdAt);
        dayMap[dayNames[d.getDay()]]++;
      });

      // Top products by enquiry count
      const prodEnqCount: Record<string, number> = {};
      enquiries.forEach((e) => {
        if (e.productId) {
          const p = products.find((p: any) => p.id === e.productId);
          if (p) prodEnqCount[p.name] = (prodEnqCount[p.name] || 0) + 1;
        }
      });
      const topProducts = Object.entries(prodEnqCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, enquiries: count, slug: "" }));

      // Read rate
      const read = enquiries.filter((e) => e.isRead).length;
      const unread = enquiries.length - read;

      setData({
        enquiriesByMonth: Object.entries(monthMap).map(([month, count]) => ({ month, count })),
        enquiriesByDay: Object.entries(dayMap).map(([day, count]) => ({ day, count })),
        topProducts,
        readRate: { read, unread },
        totalEnquiries: enquiries.length,
        totalProducts: products.length,
        totalPublished: products.filter((p: any) => p.isPublished).length,
        totalBlogPosts: blogPosts.length,
        recentEnquiries: enquiries.slice(0, 5).map((e: any) => ({
          id: e.id,
          name: e.name,
          message: e.message?.slice(0, 60) + (e.message?.length > 60 ? "…" : ""),
          createdAt: e.createdAt,
          isRead: e.isRead,
        })),
      });
      setLastRefreshed(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const kpis = data
    ? [
        { label: "Total Enquiries", value: data.totalEnquiries, icon: <MessageSquare size={20} />, sub: `${data.readRate.unread} unread` },
        { label: "Total Products", value: data.totalProducts, icon: <Package size={20} />, sub: `${data.totalPublished} published` },
        { label: "Blog Posts", value: data.totalBlogPosts, icon: <Eye size={20} />, sub: "articles in journal" },
        { label: "Response Rate", value: data.totalEnquiries ? `${Math.round((data.readRate.read / data.totalEnquiries) * 100)}%` : "–", icon: <Users size={20} />, sub: "enquiries read" },
      ]
    : [];

  return (
    <div style={{ padding: "32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--ws-cream-light)" }}>Analytics</h1>
          <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 13, marginTop: 4 }}>
            Business overview — last refreshed {lastRefreshed.toLocaleTimeString("en-KE")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm transition-opacity hover:opacity-80"
          style={{ background: "var(--ws-card)", color: "var(--ws-text-muted)", border: "1px solid var(--ws-border)", cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-8" style={{ background: "var(--ws-border)" }}>
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: "var(--ws-card)", padding: "28px 24px" }}>
                <Shimmer h="12px" w="80px" />
                <div style={{ marginTop: 20 }}><Shimmer h="36px" w="60px" /></div>
              </div>
            ))
          : kpis.map((k) => (
              <div key={k.label} style={{ background: "var(--ws-card)", padding: "28px 24px" }}>
                <div className="flex items-center gap-2 mb-3" style={{ color: "var(--ws-amber)" }}>{k.icon}</div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "2.25rem", color: "var(--ws-cream-light)", lineHeight: 1 }}>{k.value}</p>
                <p style={{ color: "var(--ws-amber)", fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 6 }}>{k.label}</p>
                <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 12, marginTop: 3 }}>{k.sub}</p>
              </div>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Enquiries by month */}
        <div className="lg:col-span-2" style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} style={{ color: AMBER }} />
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>Enquiries — Last 6 Months</h3>
          </div>
          {loading ? <Shimmer h="240px" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data?.enquiriesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ws-border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--ws-text-muted)", fontSize: 12, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--ws-text-muted)", fontSize: 12, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" stroke={AMBER} strokeWidth={2.5} dot={{ fill: AMBER, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Read vs Unread pie */}
        <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
          <h3 className="mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>Enquiry Read Rate</h3>
          {loading ? <Shimmer h="240px" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Read", value: data?.readRate.read || 0 },
                    { name: "Unread", value: data?.readRate.unread || 0 },
                  ]}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                >
                  <Cell fill={AMBER} />
                  <Cell fill="var(--ws-border)" />
                </Pie>
                <Tooltip contentStyle={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", fontFamily: "var(--font-body)" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enquiries by day */}
        <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
          <h3 className="mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>Enquiries by Day of Week</h3>
          {loading ? <Shimmer h="200px" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.enquiriesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ws-border)" />
                <XAxis dataKey="day" tick={{ fill: "var(--ws-text-muted)", fontSize: 12, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--ws-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", fontFamily: "var(--font-body)" }} />
                <Bar dataKey="count" fill={AMBER} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
          <h3 className="mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>Most Enquired Products</h3>
          {loading ? <Shimmer h="200px" /> : data?.topProducts.length === 0 ? (
            <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 13 }}>No product enquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {(data?.topProducts || []).map((p, i) => {
                const max = Math.max(...(data?.topProducts.map((x) => x.enquiries) || [1]));
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ color: "var(--ws-text-primary)", fontFamily: "var(--font-body)", fontSize: 13 }}>{p.name}</span>
                      <span style={{ color: AMBER, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>{p.enquiries}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--ws-surface)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${(p.enquiries / max) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 2, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Blog stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
          <h3 className="mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>Blog Posts by Category</h3>
          {loading ? <Shimmer h="200px" /> : (() => {
            // Compute category breakdown from blog data (re-fetched in load())
            const cats: Record<string, number> = {};
            // We only have totalBlogPosts in state; show a simple published/draft chart
            const blogData = [
              { name: "Published", value: data?.totalBlogPosts || 0 },
            ];
            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-4" style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-border)" }}>
                  <div>
                    <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Posts</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--ws-amber)" }}>{data?.totalBlogPosts || 0}</p>
                  </div>
                  <a
                    href="/blog"
                    style={{ color: "var(--ws-amber)", fontFamily: "var(--font-body)", fontSize: 13, textDecoration: "none" }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    Manage Blog →
                  </a>
                </div>
                <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 12 }}>
                  Blog posts help with SEO — aim for 2–4 articles/month using keywords like "Nairobi interior design", "custom furniture Kenya", and "kitchen countertops Nairobi".
                </p>
              </div>
            );
          })()}
        </div>

        {/* Category breakdown for blog */}
        <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
          <h3 className="mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>SEO Quick Tips</h3>
          <div className="space-y-3">
            {[
              { tip: "Add alt text to all product images", icon: "🖼️" },
              { tip: "Write 1–2 blog posts per month", icon: "✍️" },
              { tip: "Include 'Nairobi' or 'Kenya' in post titles", icon: "🇰🇪" },
              { tip: "Keep meta descriptions under 160 chars", icon: "📏" },
              { tip: "Respond to all enquiries within 24hrs", icon: "⚡" },
              { tip: "Share blog posts on your WhatsApp Business", icon: "💬" },
            ].map((item) => (
              <div key={item.tip} className="flex items-start gap-3 p-3" style={{ background: "var(--ws-surface)", border: "1px solid var(--ws-border)" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                <p style={{ color: "var(--ws-text-primary)", fontFamily: "var(--font-body)", fontSize: 13 }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent enquiries feed */}
      <div style={{ background: "var(--ws-card)", border: "1px solid var(--ws-border)", padding: "28px" }}>
        <h3 className="mb-5" style={{ fontFamily: "var(--font-display)", color: "var(--ws-cream-light)", fontSize: "1rem" }}>Recent Enquiries</h3>
        {loading ? <Shimmer h="160px" /> : data?.recentEnquiries.length === 0 ? (
          <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 13 }}>No enquiries yet.</p>
        ) : (
          <div>
            {data?.recentEnquiries.map((e, i) => (
              <div key={e.id} className="flex items-start gap-3 py-3"
                style={{ borderBottom: i < (data?.recentEnquiries.length || 0) - 1 ? "1px solid var(--ws-border)" : "none" }}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: e.isRead ? "var(--ws-border)" : AMBER }} />
                <div>
                  <p style={{ color: "var(--ws-cream-light)", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500 }}>{e.name}</p>
                  <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 13, marginTop: 2 }}>{e.message}</p>
                  <p style={{ color: "var(--ws-text-muted)", fontFamily: "var(--font-body)", fontSize: 11, marginTop: 4 }}>
                    {new Date(e.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
