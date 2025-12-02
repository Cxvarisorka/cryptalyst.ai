import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketService from '@/services/socket.service';
import notificationService from '@/services/notification.service';
import { useToast } from '@/components/ui/use-toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications function - memoized to prevent recreation
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(params);
      setNotifications(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching unread count:', error);
      }
    }
  }, []);

  // Connect to Socket.io when user is authenticated and auth is fully loaded
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Only proceed if authenticated
    if (!isAuthenticated) {
      return;
    }

    // Connect socket
    socketService.connect();

    // Listen for new notifications
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast({
        title: 'New notification',
        description: `${notification.sender?.name || 'Someone'} ${notification.message}`,
      });
    };

    socketService.onNotification(handleNotification);

    // Fetch initial data
    fetchNotifications();
    fetchUnreadCount();

    // Cleanup on unmount or when auth changes
    return () => {
      socketService.offNotification(handleNotification);
      socketService.disconnect();
    };
  }, [isAuthenticated, authLoading, fetchNotifications, fetchUnreadCount, toast]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
      // Recalculate unread count
      const deletedNotif = notifications.find((n) => n._id === notificationId);
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
