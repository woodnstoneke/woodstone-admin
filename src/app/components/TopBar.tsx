import { Search, Sun, Bell, ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useLoading } from "../contexts/LoadingContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useUnreadMessages } from "../hooks/useUnreadMessages";

const API_BASE = import.meta.env.VITE_WORKER_URL;

const emptyMessages = [
  "You're all caught up! 🎉",
  "No new messages. Time for a coffee break! ☕",
  "Everything is handled. Nice work! 👏",
  "Inbox zero achieved! 🚀",
  "All quiet on the western front.",
  "You're a messaging champion! 🏆",
];

export function TopBar() {
  const navigate = useNavigate();
  const { isLoading } = useLoading();
  const { unreadCount } = useNotifications();
  useUnreadMessages();

  const [showDropdown, setShowDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showDropdown) {
      fetchRecentMessages();
    }
  }, [showDropdown]);

  const fetchRecentMessages = async () => {
    setLoadingMessages(true);
    try {
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE}/api/admin/enquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.data) {
        const unread = data.data.filter((msg: any) => !msg.isRead).slice(0, 5);
        setRecentMessages(unread);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleMessageClick = (messageId: string) => {
    setShowDropdown(false);
    navigate(`/messages?id=${messageId}`);
  };

  const getRandomEmptyMessage = () => {
    return emptyMessages[Math.floor(Math.random() * emptyMessages.length)];
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

  return (
    <header
      className="h-16 border-b flex items-center justify-between px-6 relative"
      style={{
        backgroundColor: "var(--ws-surface)",
        borderColor: "var(--ws-border)",
      }}
    >
      {/* Loading Bar */}
      {isLoading && (
        <div
          className="absolute top-0 left-0 w-full h-1 overflow-hidden"
          style={{ backgroundColor: "var(--ws-border)" }}
        >
          <div
            className="h-full"
            style={{
              backgroundColor: "var(--ws-amber)",
              animation: "loading-bar 1.5s ease-in-out infinite",
              width: "100%",
            }}
          />
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--ws-text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border outline-none transition-all"
            style={{
              backgroundColor: "var(--ws-bg)",
              borderColor: "var(--ws-border)",
              color: "var(--ws-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* View Site Button */}
        <a
          href="https://www.woodstonekenya.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 transition-all"
          style={{
            background: "var(--ws-button-bg)",
            color: "var(--ws-button-text)",
            border: "var(--ws-button-border)",
            boxShadow: "var(--ws-button-shadow)",
          }}
        >
          <span>View Site</span>
          <ExternalLink size={16} />
        </a>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            const isDark = document.documentElement.classList.contains("dark");
            if (isDark) {
              document.documentElement.classList.remove("dark");
            } else {
              document.documentElement.classList.add("dark");
            }
          }}
          className="w-10 h-10 flex items-center justify-center transition-all"
          style={{
            backgroundColor: "var(--ws-card)",
            color: "var(--ws-text-primary)",
          }}
        >
          <Sun size={18} />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 flex items-center justify-center relative transition-all hover:opacity-80"
            style={{
              backgroundColor: "var(--ws-card)",
              color: "var(--ws-text-primary)",
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
                style={{
                  backgroundColor: "var(--ws-amber)",
                  color: "white",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Modal */}
          {showDropdown && (
            <div
              className="absolute right-0 mt-2 w-80 shadow-xl overflow-hidden z-50 border"
              style={{
                backgroundColor: "var(--ws-card)",
                borderColor: "var(--ws-border)",
                top: "100%",
              }}
            >
              {/* Header */}
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--ws-border)" }}
              >
                <h3
                  style={{
                    color: "var(--ws-text-primary)",
                    fontFamily: "var(--font-display)",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  Notifications
                </h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="hover:opacity-70 transition-all"
                  style={{ color: "var(--ws-text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {loadingMessages ? (
                  <div className="p-6 text-center">
                    <div
                      className="w-5 h-5 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin mx-auto"
                      style={{
                        borderTopColor: "var(--ws-amber)",
                      }}
                    />
                  </div>
                ) : recentMessages.length === 0 ? (
                  <div className="p-6 text-center">
                    <p
                      style={{
                        color: "var(--ws-text-muted)",
                        fontSize: "14px",
                        lineHeight: 1.6,
                      }}
                    >
                      {getRandomEmptyMessage()}
                    </p>
                  </div>
                ) : (
                  <div>
                    {recentMessages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => handleMessageClick(msg.id)}
                        className="w-full p-4 border-b text-left transition-all hover:opacity-80"
                        style={{
                          borderColor: "var(--ws-border)",
                          backgroundColor: "var(--ws-card)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: "var(--ws-amber)" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                color: "var(--ws-text-primary)",
                                fontWeight: 500,
                                marginBottom: "4px",
                              }}
                            >
                              {msg.name}
                            </p>
                            <p
                              className="text-sm truncate"
                              style={{ color: "var(--ws-text-secondary)" }}
                            >
                              {msg.message.substring(0, 40)}...
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--ws-text-muted)" }}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {recentMessages.length > 0 && (
                <div
                  className="p-4 border-t text-center"
                  style={{ borderColor: "var(--ws-border)" }}
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/messages");
                    }}
                    style={{
                      color: "var(--ws-amber)",
                      fontSize: "14px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                    }}
                    className="hover:opacity-80 transition-all"
                  >
                    View All Messages
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
