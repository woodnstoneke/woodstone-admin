import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6 py-20"
      style={{ backgroundColor: "var(--ws-bg)" }}
    >
      <div className="text-center max-w-2xl">
        {/* Large 404 heading */}
        <div className="mb-8">
          <h1
            className="text-9xl md:text-[150px] font-bold leading-none mb-4"
            style={{
              color: "var(--ws-amber)",
              fontFamily: "var(--font-display)",
              textShadow: "0 2px 10px rgba(200, 97, 26, 0.1)",
            }}
          >
            404
          </h1>
          <div
            className="h-1 w-24 mx-auto rounded-full"
            style={{ background: "var(--ws-amber)" }}
          />
        </div>

        {/* Error message */}
        <h2
          className="text-3xl md:text-4xl font-medium mb-4"
          style={{
            color: "var(--ws-text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          Page Not Found
        </h2>

        <p
          className="text-lg mb-8 leading-relaxed max-w-md mx-auto"
          style={{
            color: "var(--ws-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to the dashboard.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "var(--ws-button-bg)",
              color: "var(--ws-button-text)",
              fontFamily: "var(--font-body)",
            }}
          >
            <Home size={18} />
            Go to Dashboard
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              border: "2px solid var(--ws-amber)",
              color: "var(--ws-amber)",
              background: "transparent",
              fontFamily: "var(--font-body)",
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Helpful links */}
        <div
          className="pt-8 border-t"
          style={{ borderColor: "var(--ws-border)" }}
        >
          <p
            className="text-sm mb-6 font-medium"
            style={{ color: "var(--ws-text-secondary)" }}
          >
            Quick Navigation:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Dashboard", path: "/dashboard" },
              { label: "Products", path: "/products" },
              { label: "Categories", path: "/categories" },
              { label: "Messages", path: "/messages" },
              { label: "Content", path: "/content/home" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm px-4 py-2 rounded transition-all duration-300 hover:scale-110"
                style={{
                  color: "var(--ws-amber)",
                  background: "var(--ws-card)",
                  border: "1px solid var(--ws-border)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Help text */}
        <p
          className="text-xs mt-12"
          style={{
            color: "var(--ws-text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          If you believe this is an error, please contact the administrator.
        </p>
      </div>
    </div>
  );
}
