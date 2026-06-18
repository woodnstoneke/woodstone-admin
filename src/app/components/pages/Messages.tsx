import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Loader,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useNotifications } from "../../contexts/NotificationContext";

const isHtmlContent = (content: string): boolean => /<[^>]*>/.test(content);

const htmlContentStyles = `
  .email-html-content {
    font-family: var(--font-body);
    line-height: 1.7;
    color: var(--ws-text-secondary);
    font-size: 0.9rem;
  }
  .email-html-content p { margin: 0 0 1em 0; }
  .email-html-content h1, .email-html-content h2, .email-html-content h3 {
    margin: 1.5em 0 0.5em 0;
    font-family: var(--font-display);
    color: var(--ws-cream-light);
  }
  .email-html-content a { color: var(--ws-amber); text-decoration: none; }
  .email-html-content a:hover { text-decoration: underline; }
  .email-html-content ul, .email-html-content ol { margin: 1em 0; padding-left: 2em; }
  .email-html-content li { margin: 0.5em 0; }
  .email-html-content img { max-width: 100%; height: auto; }
  .email-html-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  .email-html-content th, .email-html-content td {
    border: 1px solid var(--ws-border);
    padding: 0.5em;
    text-align: left;
  }
`;

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  productId?: number;
  resendEmailId: string;
}

const API_BASE = import.meta.env.VITE_WORKER_URL;

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUnreadCount } = useNotifications();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectedMessage) {
      navigate(`/messages?id=${selectedMessage.id}`, { replace: true });
    } else {
      navigate("/messages", { replace: true });
    }
  }, [selectedMessage, navigate]);

  const fetchMessages = async () => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE}/api/admin/enquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch messages");
      const msgs = data.data || [];
      setMessages(msgs);
      setUnreadCount(msgs.filter((m: Message) => !m.isRead).length);

      // Auto-select message from URL param after messages are loaded
      const messageId = searchParams.get("id");
      if (messageId) {
        const message = msgs.find((msg: Message) => msg.id === messageId);
        if (message) {
          setSelectedMessage(message);
          if (!message.isRead) {
            markMessageAsRead(messageId);
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load messages",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailContent = async (resendEmailId: string) => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE}/api/admin/email/${resendEmailId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch email");
      return data.data.html || data.data.text || "";
    } catch {
      return "";
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("auth_token");
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, isRead: true } : msg,
      );
      setMessages(updatedMessages);
      setUnreadCount(updatedMessages.filter((m) => !m.isRead).length);
      const response = await fetch(
        `${API_BASE}/api/admin/email/${messageId}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) await fetchMessages();
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error("Please type a reply");
      return;
    }
    setReplySending(true);
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE}/api/admin/email/reply/${selectedMessage.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: `Re: ${selectedMessage.name}'s inquiry`,
            message: replyText,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send reply");
      toast.success("Reply sent successfully");
      setReplyText("");
      const updated = messages.map((msg) =>
        msg.id === selectedMessage.id ? { ...msg, isRead: true } : msg,
      );
      setMessages(updated);
      setSelectedMessage({ ...selectedMessage, isRead: true });
      setUnreadCount(updated.filter((m) => !m.isRead).length);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reply",
      );
    } finally {
      setReplySending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--ws-bg)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader
            className="animate-spin"
            size={22}
            style={{ color: "var(--ws-amber)" }}
          />
          <p
            className="text-xs tracking-[0.2em] uppercase"
            style={{
              color: "var(--ws-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            Loading messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--ws-bg)", minHeight: "100vh" }}>
      {/* ── HEADER ── */}
      <div
        className="pt-10 pb-8 px-8 relative overflow-hidden border-b"
        style={{
          background: "var(--ws-surface)",
          borderColor: "var(--ws-border)",
        }}
      >
        {/* Decorative gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 100% at 90% 50%, rgba(200,97,26,0.07) 0%, transparent 70%)",
          }}
        />
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--ws-amber), transparent)",
          }}
        />

        <div className="relative flex items-end justify-between">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{
                color: "var(--ws-amber)",
                fontFamily: "var(--font-body)",
              }}
            >
              Inbox
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                color: "var(--ws-cream-light)",
                lineHeight: 1.1,
              }}
            >
              Client{" "}
              <em style={{ color: "var(--ws-amber-light)" }}>Messages</em>
            </h1>
            <p
              className="mt-2 text-sm"
              style={{
                color: "var(--ws-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Inquiries and communications from your clients
            </p>
          </div>

          {unreadCount > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{
                border: "1px solid rgba(200,97,26,0.35)",
                background: "rgba(200,97,26,0.08)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--ws-amber)" }}
              />
              <span
                className="text-xs tracking-[0.12em] uppercase"
                style={{
                  color: "var(--ws-amber)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {unreadCount} unread
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div
        className="grid grid-cols-5"
        style={{ height: "calc(100vh - 180px)" }}
      >
        {/* ── LEFT PANEL: Messages List ── */}
        <div
          className="col-span-2 flex flex-col border-r overflow-hidden"
          style={{
            borderColor: "var(--ws-border)",
            background: "var(--ws-card)",
          }}
        >
          {/* Search bar */}
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "var(--ws-border)" }}
          >
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--ws-text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border outline-none"
                style={{
                  background: "var(--ws-surface)",
                  borderColor: "var(--ws-border)",
                  color: "var(--ws-text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.01em",
                }}
              />
            </div>
          </div>

          {/* Count label */}
          <div
            className="px-5 py-2.5 border-b flex items-center justify-between"
            style={{ borderColor: "var(--ws-border)" }}
          >
            <span
              className="text-xs tracking-[0.15em] uppercase"
              style={{
                color: "var(--ws-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {filteredMessages.length} message
              {filteredMessages.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail
                  size={24}
                  className="mx-auto mb-3"
                  style={{ color: "var(--ws-text-muted)", opacity: 0.4 }}
                />
                <p
                  className="text-sm"
                  style={{
                    color: "var(--ws-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  No messages found
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isActive = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={async () => {
                      if (!msg.message && msg.resendEmailId) {
                        const content = await fetchEmailContent(
                          msg.resendEmailId,
                        );
                        setSelectedMessage({ ...msg, message: content });
                      } else {
                        setSelectedMessage(msg);
                      }
                      if (!msg.isRead) await markMessageAsRead(msg.id);
                    }}
                    className="w-full text-left border-b transition-all duration-200"
                    style={{
                      borderColor: "var(--ws-border)",
                      background: isActive
                        ? "linear-gradient(90deg, rgba(200,97,26,0.08) 0%, var(--ws-surface) 100%)"
                        : "transparent",
                      borderLeft: isActive
                        ? "2px solid var(--ws-amber)"
                        : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                    }}
                  >
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs mt-0.5"
                          style={{
                            background: !msg.isRead
                              ? "linear-gradient(135deg, var(--ws-amber), var(--ws-amber-dark))"
                              : "var(--ws-surface)",
                            border: "1px solid",
                            borderColor: !msg.isRead
                              ? "var(--ws-amber)"
                              : "var(--ws-border)",
                            color: !msg.isRead
                              ? "white"
                              : "var(--ws-text-muted)",
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                          }}
                        >
                          {msg.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className="text-sm truncate"
                              style={{
                                fontFamily: "var(--font-body)",
                                color: "var(--ws-cream-light)",
                                fontWeight: !msg.isRead ? 600 : 400,
                                letterSpacing: "0.01em",
                              }}
                            >
                              {msg.name}
                            </span>
                            <span
                              className="text-xs flex-shrink-0"
                              style={{
                                color: "var(--ws-text-muted)",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p
                            className="text-xs truncate"
                            style={{
                              color: "var(--ws-text-muted)",
                              fontFamily: "var(--font-body)",
                              fontWeight: !msg.isRead ? 500 : 400,
                            }}
                          >
                            {msg.message.substring(0, 60)}…
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Message Detail ── */}
        <div
          className="col-span-3 flex flex-col overflow-hidden"
          style={{ background: "var(--ws-bg)" }}
        >
          {selectedMessage ? (
            <>
              {/* Detail header */}
              <div
                className="px-8 py-5 border-b relative overflow-hidden"
                style={{
                  borderColor: "var(--ws-border)",
                  background: "var(--ws-surface)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 100% at 100% 50%, rgba(200,97,26,0.05) 0%, transparent 70%)",
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--ws-amber), var(--ws-amber-dark))",
                        color: "white",
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                      }}
                    >
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--ws-cream-light)",
                          fontSize: "1.2rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedMessage.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs"
                          style={{
                            color: "var(--ws-amber)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {selectedMessage.email}
                        </span>
                        <span style={{ color: "var(--ws-border)" }}>·</span>
                        <span
                          className="text-xs"
                          style={{
                            color: "var(--ws-text-muted)",
                            fontFamily: "var(--font-body)",
                          }}
                        >
                          {formatTime(selectedMessage.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-xs tracking-[0.1em] uppercase transition-all duration-200"
                      style={{
                        border: "1px solid var(--ws-border)",
                        color: "var(--ws-text-muted)",
                        fontFamily: "var(--font-body)",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(200,97,26,0.35)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--ws-text-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--ws-border)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--ws-text-muted)";
                      }}
                    >
                      <Archive size={13} />
                      Archive
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-xs tracking-[0.1em] uppercase transition-all duration-200"
                      style={{
                        border: "1px solid var(--ws-border)",
                        color: "var(--ws-text-muted)",
                        fontFamily: "var(--font-body)",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "rgba(200,97,26,0.35)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--ws-text-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          "var(--ws-border)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--ws-text-muted)";
                      }}
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto px-8 py-8">
                <style>{htmlContentStyles}</style>

                {/* Thin amber rule above message */}
                <div
                  className="mb-6 pb-6 border-b"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <p
                    className="text-xs tracking-[0.2em] uppercase"
                    style={{
                      color: "var(--ws-amber)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Message
                  </p>
                </div>

                {isHtmlContent(selectedMessage.message) ? (
                  <div
                    className="email-html-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedMessage.message,
                    }}
                  />
                ) : (
                  <p
                    style={{
                      color: "var(--ws-text-secondary)",
                      fontFamily: "var(--font-body)",
                      lineHeight: 1.8,
                      fontSize: "0.9rem",
                    }}
                  >
                    {selectedMessage.message}
                  </p>
                )}
              </div>

              {/* Reply box */}
              <div
                className="px-8 py-5 border-t"
                style={{
                  borderColor: "var(--ws-border)",
                  background: "var(--ws-surface)",
                }}
              >
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-3"
                  style={{
                    color: "var(--ws-amber)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Reply
                </p>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${selectedMessage.name}...`}
                  disabled={replySending}
                  className="w-full border outline-none resize-none mb-4"
                  style={{
                    background: "var(--ws-card)",
                    borderColor: "var(--ws-border)",
                    color: "var(--ws-text-primary)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.875rem",
                    padding: "12px 14px",
                    lineHeight: 1.6,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(200,97,26,0.5)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--ws-border)";
                  }}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={replySending}
                    className="inline-flex items-center gap-2.5 px-6 py-3 text-xs tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50"
                    style={{
                      background: replySending
                        ? "linear-gradient(135deg, #666, #444)"
                        : "linear-gradient(135deg, #C8611A, #8B4513)",
                      color: "var(--ws-button-text)",
                      fontFamily: "var(--font-body)",
                      boxShadow: replySending
                        ? "none"
                        : "0 0 20px rgba(200,97,26,0.2)",
                      cursor: replySending ? "not-allowed" : "pointer",
                    }}
                  >
                    {replySending ? (
                      <>
                        <Loader size={13} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div
                className="w-14 h-14 flex items-center justify-center"
                style={{
                  border: "1px solid var(--ws-border)",
                  background: "var(--ws-surface)",
                }}
              >
                <Mail
                  size={22}
                  style={{ color: "var(--ws-text-muted)", opacity: 0.5 }}
                />
              </div>
              <div className="text-center">
                <p
                  className="text-sm mb-1"
                  style={{
                    color: "var(--ws-text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Select a message to view
                </p>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--ws-text-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Choose from the list on the left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
