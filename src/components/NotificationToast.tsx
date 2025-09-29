'use client';

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { X, Bell, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const NotificationToast: React.FC = () => {
  const { notifications, clearNotifications } = useNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      setVisibleNotifications(prev => [...prev, latest]);
      
      const timer = setTimeout(() => {
        setVisibleNotifications(prev => prev.filter(n => n !== latest));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const removeNotification = (notification: Notification) => {
    setVisibleNotifications(prev => prev.filter(n => n !== notification));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={`${notification.timestamp}-${index}`}
          className={`${getColor(notification.type)} text-white p-4 rounded-lg shadow-lg max-w-sm flex items-start space-x-3 animate-slide-in`}
        >
          {getIcon(notification.type)}
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs opacity-75 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;