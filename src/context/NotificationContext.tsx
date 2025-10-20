'use client';

import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface RealtimeNotification {
  title: string;
  message: string;
  type: string;
  priority: string;
  id: string;
  timestamp: string;
}

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  timestamp: string;
}

interface NotificationContextType {
  realtimeNotifications: RealtimeNotification[];
  toastNotifications: ToastNotification[];
  isConnected: boolean;
  connectionError: string | null;
  sendMessage: (destination: string, message: unknown) => void;
  clearNotifications: () => void;
  addToastNotification: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToastNotification: (id: string) => void;
  notificationCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId
}) => {
  const { notifications, isConnected, connectionError, sendMessage, clearNotifications } = useWebSocket(userId);
  const [toastNotifications, setToastNotifications] = useState<ToastNotification[]>([]);

  // Track timer IDs for cleanup
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());
  // Track processed notification IDs to prevent duplicates
  const processedNotificationsRef = useRef<Set<string>>(new Set());

  // Cleanup all timers on unmount
  React.useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const removeToastNotification = useCallback((id: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addToastNotification = useCallback((notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newNotification: ToastNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setToastNotifications(prev => [...prev, newNotification]);

    // Auto-remove after 5 seconds for non-urgent notifications
    if (notification.priority !== 'URGENT') {
      const timer = setTimeout(() => {
        removeToastNotification(newNotification.id);
        timersRef.current.delete(timer);
      }, 5000);
      timersRef.current.add(timer);
    }
  }, [removeToastNotification]);

  // Convert realtime notifications to toast notifications
  React.useEffect(() => {
    notifications.forEach(notification => {
      // Prevent duplicate processing
      if (processedNotificationsRef.current.has(notification.id)) {
        return;
      }
      processedNotificationsRef.current.add(notification.id);

      const toastType: 'info' | 'success' | 'warning' | 'error' =
        notification.type === 'SYSTEM' ? 'info' :
        notification.type === 'WELLNESS' ? 'success' :
        notification.priority === 'URGENT' ? 'error' : 'info';

      addToastNotification({
        title: notification.title,
        message: notification.message,
        type: toastType,
        priority: notification.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      });
    });
  }, [notifications, addToastNotification]);

  const contextValue = useMemo(() => ({
    realtimeNotifications: notifications,
    toastNotifications,
    isConnected,
    connectionError,
    sendMessage,
    clearNotifications,
    addToastNotification,
    removeToastNotification,
    notificationCount: notifications.length
  }), [notifications, toastNotifications, isConnected, connectionError, sendMessage, clearNotifications, addToastNotification, removeToastNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};