import { useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";

interface Message {
  id: string;
  isRead: boolean;
}

const API_BASE = import.meta.env.VITE_WORKER_URL;

export function useUnreadMessages() {
  const { setUnreadCount } = useNotifications();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token =
          localStorage.getItem("authToken") ||
          localStorage.getItem("auth_token");

        const response = await fetch(`${API_BASE}/api/admin/enquiries`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.data) {
          const unreadCount = (data.data as Message[]).filter(
            (msg) => !msg.isRead,
          ).length;
          setUnreadCount(unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    // Fetch immediately on mount
    fetchUnreadCount();

    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [setUnreadCount]);
}
