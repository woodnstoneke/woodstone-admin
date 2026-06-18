import { useState } from "react";
import { Send, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_WORKER_URL;

export function Email() {
  const [recipients, setRecipients] = useState<
    "all-customers" | "recent-customers" | "all-inquiries" | "custom-list"
  >("all-customers");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [customEmails, setCustomEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const customEmailCount = customEmails
    .split(",")
    .filter((e) => e.trim()).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!subject.trim()) {
      setError("Subject line is required");
      toast.error("Subject line is required");
      return;
    }

    if (!message.trim()) {
      setError("Message is required");
      toast.error("Message is required");
      return;
    }

    if (recipients === "custom-list" && !customEmails.trim()) {
      setError("Please add custom email addresses");
      toast.error("Please add custom email addresses");
      return;
    }

    setLoading(true);

    try {
      const emailList =
        recipients === "custom-list"
          ? customEmails
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : undefined;

      const token =
        localStorage.getItem("authToken") || localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE}/api/admin/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients,
          subject,
          message,
          customEmails: emailList,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setSentCount(data.data.recipientCount);
      setSuccess(true);
      toast.success(
        `Email sent successfully to ${data.data.recipientCount} recipients`,
      );
      setSubject("");
      setMessage("");
      setCustomEmails("");

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1
          className="font-display tracking-tight"
          style={{
            color: "var(--ws-text-primary)",
            fontSize: "36px",
          }}
        >
          Email Campaign
        </h1>
        <p style={{ color: "var(--ws-text-muted)", marginTop: "8px" }}>
          Send email campaigns to customers via Resend
        </p>
      </div>

      {error && (
        <div
          className="max-w-3xl flex items-start gap-3 p-4 rounded"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderLeft: "4px solid #ef4444",
          }}
        >
          <AlertCircle
            size={20}
            style={{ color: "#ef4444", marginTop: "2px" }}
          />
          <p style={{ color: "var(--ws-text-primary)" }}>{error}</p>
        </div>
      )}

      {success && (
        <div
          className="max-w-3xl flex items-start gap-3 p-4 rounded"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderLeft: "4px solid #22c55e",
          }}
        >
          <CheckCircle
            size={20}
            style={{ color: "#22c55e", marginTop: "2px" }}
          />
          <p style={{ color: "#15803d" }}>
            Email campaign sent successfully to {sentCount} recipient(s)!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          className="max-w-3xl border p-8 space-y-6"
          style={{
            backgroundColor: "var(--ws-card)",
            borderColor: "var(--ws-border)",
          }}
        >
          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              Recipients
            </label>
            <select
              value={recipients}
              onChange={(e) =>
                setRecipients(
                  e.target.value as
                    | "all-customers"
                    | "recent-customers"
                    | "all-inquiries"
                    | "custom-list",
                )
              }
              disabled={loading}
              className="w-full px-4 py-2.5 border outline-none rounded transition-colors"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-primary)",
              }}
            >
              <option value="all-customers">All Customers</option>
              <option value="recent-customers">
                Recent Customers (30 days)
              </option>
              <option value="all-inquiries">All Inquiries</option>
              <option value="custom-list">Custom List</option>
            </select>
          </div>

          {recipients === "custom-list" && (
            <div>
              <label
                className="block mb-2 text-sm"
                style={{ color: "var(--ws-text-secondary)" }}
              >
                Email Addresses (comma separated)
              </label>
              <textarea
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                disabled={loading}
                rows={4}
                className="w-full px-4 py-2.5 border outline-none rounded resize-none transition-colors"
                style={{
                  backgroundColor: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                }}
                placeholder="email1@example.com, email2@example.com, email3@example.com"
              />
              {customEmailCount > 0 && (
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--ws-text-muted)" }}
                >
                  {customEmailCount} email(s) detected
                </p>
              )}
            </div>
          )}

          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border outline-none rounded transition-colors"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-primary)",
              }}
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <label
              className="block mb-2 text-sm"
              style={{ color: "var(--ws-text-secondary)" }}
            >
              Message
            </label>
            <textarea
              rows={12}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border outline-none rounded resize-none transition-colors"
              style={{
                backgroundColor: "var(--ws-surface)",
                borderColor: "var(--ws-border)",
                color: "var(--ws-text-primary)",
              }}
              placeholder="Compose your email message..."
            />
          </div>

          <div
            className="flex items-center justify-between pt-4 border-t"
            style={{
              borderColor: "var(--ws-border)",
            }}
          >
            <div className="text-sm" style={{ color: "var(--ws-text-muted)" }}>
              {sentCount > 0 ? (
                <>
                  Last sent to{" "}
                  <span
                    style={{
                      color: "var(--ws-text-primary)",
                      fontWeight: "bold",
                    }}
                  >
                    {sentCount}
                  </span>{" "}
                  recipient(s)
                </>
              ) : recipients === "custom-list" ? (
                <>
                  Ready to send to{" "}
                  <span
                    style={{
                      color: "var(--ws-text-primary)",
                      fontWeight: "bold",
                    }}
                  >
                    {customEmailCount}
                  </span>{" "}
                  recipient(s)
                </>
              ) : (
                <>Select recipients and fill the form</>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "var(--ws-button-bg)",
                color: "var(--ws-button-text)",
              }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Campaign</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
