import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Shared styles (same as Contact page)
  const inputStyle: React.CSSProperties = {
    background: "var(--ws-card)",
    border: "1px solid var(--ws-border)",
    color: "var(--ws-text-primary)",
    fontFamily: "var(--font-body)",
    padding: "13px 16px",
    outline: "none",
    width: "100%",
    fontSize: "0.875rem",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--ws-text-secondary)",
    fontFamily: "var(--font-body)",
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--ws-bg)" }}
    >
      {/* ── HEADER ── */}
      <div
        className="pt-20 pb-10 px-6 lg:px-8 relative overflow-hidden"
        style={{ background: "var(--ws-surface)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 80% 50%, rgba(200,97,26,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative">
          <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-6" />

          <p
            className="text-xs tracking-[0.3em] uppercase mb-3"
            style={{
              color: "var(--ws-amber)",
              fontFamily: "var(--font-body)",
            }}
          >
            Admin Access
          </p>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 4vw, 3rem)",
              color: "var(--ws-cream-light)",
            }}
          >
            Dashboard <em style={{ color: "var(--ws-amber-light)" }}>Login</em>
          </h1>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--ws-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Secure access to manage your platform.
          </p>
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
        <div className="w-full max-w-xl">
          <div
            style={{
              background: "var(--ws-card)",
              border: "1px solid var(--ws-border)",
            }}
          >
            {/* Header */}
            <div
              className="px-8 py-5 border-b"
              style={{ borderColor: "var(--ws-border)" }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--ws-cream-light)",
                  fontSize: "1.4rem",
                }}
              >
                Sign In
              </h2>
              <p
                className="text-sm mt-1"
                style={{
                  color: "var(--ws-text-muted)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Enter your credentials to continue.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--ws-text-muted)" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="text-sm px-4 py-3"
                  style={{
                    border: "1px solid rgba(220,38,38,0.3)",
                    color: "#f87171",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-3 py-4 text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #C8611A, #8B4513)",
                  color: "var(--ws-button-text)",
                  fontFamily: "var(--font-body)",
                  boxShadow: "0 0 25px rgba(200,97,26,0.25)",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}