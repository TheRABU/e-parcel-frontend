// contexts/NotificationContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";

import { useAuth } from "./AuthContext";
import { axiosInstance } from "../lib/axios";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // ✅ CORRECT: Fetch notifications matching backend endpoint
  const fetchNotifications = useCallback(
    async (params = {}) => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        // Build query string from params
        const queryParams = new URLSearchParams(params).toString();
        const url = `/notification${queryParams ? `?${queryParams}` : ""}`;

        const response = await axiosInstance.get(url);

        // ✅ Match backend response structure
        const data = response.data.data;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);

        return { success: true, data: response.data };
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return {
          success: false,
          error:
            error.response?.data?.message || "Failed to fetch notifications",
        };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // ✅ CORRECT: Socket.IO setup matching backend events
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    const newSocket = io(socketUrl, {
      withCredentials: true,
      auth: {
        userId: user._id,
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected for notifications");
      // ✅ Join user's room matching backend room naming
      newSocket.emit("join-notifications", user._id);
    });

    // ✅ CORRECT: Listening for backend events
    newSocket.on("notification:new", (data) => {
      console.log("New notification received:", data);

      // Add notification to state
      setNotifications((prev) => [
        {
          id: data.notificationId,
          title: data.title,
          message: data.message,
          type: data.type,
          isRead: data.isRead || false,
          parcelId: data.parcelId,
          createdAt: data.createdAt,
          ...data,
        },
        ...prev,
      ]);

      // Update unread count
      if (!data.isRead) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.title, { body: data.message });
      }
    });

    // ✅ Handle notification read event
    newSocket.on("notification:read", (data) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === data.notificationId
            ? { ...notif, isRead: true, readAt: data.readAt }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    // ✅ Handle all notifications read event
    newSocket.on("notification:all-read", () => {
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
        }))
      );
      setUnreadCount(0);
    });

    // ✅ Handle notification deleted event
    newSocket.on("notification:deleted", (data) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== data.notificationId)
      );
    });

    setSocket(newSocket);

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user?._id, fetchNotifications]);

  // ✅ CORRECT: Mark as read matching backend endpoint
  const markAsRead = async (notificationId) => {
    try {
      const response = await axiosInstance.put(
        `/notification/${notificationId}/read`
      );

      // Update local state immediately
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to mark as read",
      };
    }
  };

  // ✅ CORRECT: Mark all as read matching backend endpoint
  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put("/notification/mark-all-read");

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
        }))
      );
      setUnreadCount(0);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to mark all as read",
      };
    }
  };

  // ✅ CORRECT: Delete notification matching backend endpoint
  const deleteNotification = async (notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/notification/${notificationId}`
      );

      // Update local state
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete notification",
      };
    }
  };

  // ✅ NEW: Create notification (for admin/customer use)
  const createNotification = async (notificationData) => {
    try {
      const response = await axiosInstance.post(
        "/api/notification",
        notificationData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create notification",
      };
    }
  };

  const value = {
    notifications,
    unreadCount,
    socket,
    loading,

    // Core notification functions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,

    // Helper functions
    clearNotifications: () => setNotifications([]),
    hasUnread: unreadCount > 0,
    getUnreadNotifications: () => notifications.filter((n) => !n.isRead),
    getReadNotifications: () => notifications.filter((n) => n.isRead),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
