import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Home,
  Info,
  Image,
  Store,
  Sofa,
  Palette,
  Mail,
  Folder,
  LogOut,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [contentExpanded, setContentExpanded] = useState(
    location.pathname.startsWith("/content"),
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/orders" },
    { id: "products", label: "Products", icon: Package, path: "/products" },
    {
      id: "categories",
      label: "Categories",
      icon: Folder,
      path: "/categories",
    },
    { id: "customers", label: "Customers", icon: Users, path: "/customers" },
    {
      id: "mail",
      label: "Mail",
      icon: Mail,
      path: "/email",
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      path: "/messages",
    },
    {
      id: "content",
      label: "Content",
      icon: FileText,
      expandable: true,
      children: [
        {
          id: "content-home",
          label: "Home",
          icon: Home,
          path: "/content/home",
        },
        // {
        //   id: "content-about",
        //   label: "About",
        //   icon: Info,
        //   path: "/content/about",
        // },
        // {
        //   id: "content-gallery",
        //   label: "Gallery",
        //   icon: Image,
        //   path: "/content/gallery",
        // },
        // {
        //   id: "content-shop",
        //   label: "Shop",
        //   icon: Store,
        //   path: "/content/shop",
        // },
        // {
        //   id: "content-furniture",
        //   label: "Furniture",
        //   icon: Sofa,
        //   path: "/content/furniture",
        // },
        // {
        //   id: "content-custom",
        //   label: "Custom Design",
        //   icon: Palette,
        //   path: "/content/custom",
        // },
        // {
        //   id: "content-contact",
        //   label: "Contact",
        //   icon: Mail,
        //   path: "/content/contact",
        // },
      ],
    },
    { id: "blog", label: "Blog", icon: BookOpen, path: "/blog" },
    { id: "analytics", label: "Analytics", icon: TrendingUp, path: "/analytics" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className="w-64 h-full border-r flex flex-col"
      style={{
        backgroundColor: "var(--ws-surface)",
        borderColor: "var(--ws-border)",
      }}
    >
      {/* Logo */}
      <div
        className="h-16 border-b flex items-center px-6"
        style={{ borderColor: "var(--ws-border)" }}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          <div>
            <div
              className="font-display tracking-tight text-sm"
              style={{
                color: "var(--ws-text-primary)",
              }}
            >
              Wood & Stone Construction Kenya
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.expandable ? (
                <div>
                  <button
                    onClick={() => setContentExpanded(!contentExpanded)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 transition-all"
                    style={{
                      color: item.children?.some(
                        (child) => location.pathname === child.path,
                      )
                        ? "var(--ws-amber)"
                        : "var(--ws-text-secondary)",
                      backgroundColor: item.children?.some(
                        (child) => location.pathname === child.path,
                      )
                        ? "rgba(200, 97, 26, 0.1)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className="transition-transform"
                      style={{
                        transform: contentExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {contentExpanded && item.children && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            to={child.path}
                            className="w-full flex items-center gap-3 px-4 py-2 transition-all text-sm"
                            style={{
                              color:
                                location.pathname === child.path
                                  ? "var(--ws-amber)"
                                  : "var(--ws-text-secondary)",
                              backgroundColor:
                                location.pathname === child.path
                                  ? "rgba(200, 97, 26, 0.1)"
                                  : "transparent",
                            }}
                          >
                            <child.icon size={16} strokeWidth={1.5} />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                  style={{
                    color:
                      location.pathname === item.path
                        ? "var(--ws-amber)"
                        : "var(--ws-text-secondary)",
                    backgroundColor:
                      location.pathname === item.path
                        ? "rgba(200, 97, 26, 0.1)"
                        : "transparent",
                  }}
                >
                  <item.icon size={18} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div
        className="px-6 py-4 border-t relative"
        style={{ borderColor: "var(--ws-border)" }}
      >
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="w-full flex items-center justify-between p-2 transition-all"
          style={{
            backgroundColor: profileMenuOpen
              ? "rgba(200, 97, 26, 0.1)"
              : "transparent",
            color: "var(--ws-text-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--ws-amber), var(--ws-amber-dark))",
                color: "white",
              }}
            >
              <span className="text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <div className="text-sm font-medium truncate">
              {user?.name || "Admin"}
            </div>
          </div>
          <ChevronDown
            size={16}
            className="transition-transform"
            style={{
              transform: profileMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              color: "var(--ws-text-secondary)",
            }}
          />
        </button>
        {profileMenuOpen && (
          <div
            className="mt-2 py-2 border rounded-md"
            style={{
              backgroundColor: "var(--ws-surface)",
              borderColor: "var(--ws-border)",
            }}
          >
            <button
              onClick={() => {
                logout();
                navigate("/login");
                setProfileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-all hover:opacity-80"
              style={{ color: "var(--ws-text-primary)" }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
