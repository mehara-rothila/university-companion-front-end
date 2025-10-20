'use client';

import React, { memo } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Bell, Wifi, WifiOff } from 'lucide-react';

const NotificationToast: React.FC = () => {
  const { toastNotifications, removeToastNotification, isConnected, connectionError } = useNotifications();

  const getIcon = (type: string, priority: string) => {
    if (priority === 'URGENT') return <AlertCircle className="w-5 h-5" />;
    
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type: string, priority: string) => {
    if (priority === 'URGENT') return 'bg-red-600 border-l-4 border-red-800';
    if (priority === 'HIGH') return 'bg-orange-500 border-l-4 border-orange-700';
    
    switch (type) {
      case 'success': return 'bg-green-500 border-l-4 border-green-700';
      case 'warning': return 'bg-yellow-500 border-l-4 border-yellow-700';
      case 'error': return 'bg-red-500 border-l-4 border-red-700';
      default: return 'bg-blue-500 border-l-4 border-blue-700';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {/* WebSocket Connection Status */}
      <div className={`${
        isConnected 
          ? 'bg-green-500 border-l-4 border-green-700' 
          : 'bg-red-500 border-l-4 border-red-700'
      } text-white p-3 rounded-lg shadow-lg backdrop-blur-sm flex items-center space-x-3 transition-all duration-300`}>
        <div className="flex-shrink-0">
          {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium">
            {isConnected ? 'Real-time notifications active' : 'Connection lost'}
          </p>
          {connectionError && (
            <p className="text-xs opacity-80 mt-1">{connectionError}</p>
          )}
        </div>
      </div>

      {toastNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getColor(notification.type, notification.priority)} text-white p-4 rounded-lg shadow-xl backdrop-blur-sm flex items-start space-x-3 animate-slide-in transition-all duration-300 hover:shadow-2xl`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type, notification.priority)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold mb-1 line-clamp-2">
              {notification.title}
            </h4>
            <p className="text-xs opacity-90 line-clamp-3 leading-relaxed">
              {notification.message}
            </p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs opacity-75">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                notification.priority === 'URGENT' ? 'bg-red-700/50' :
                notification.priority === 'HIGH' ? 'bg-orange-600/50' :
                notification.priority === 'MEDIUM' ? 'bg-yellow-600/50' :
                'bg-gray-600/50'
              }`}>
                {notification.priority}
              </span>
            </div>
          </div>
          <button
            onClick={() => removeToastNotification(notification.id)}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(NotificationToast);