import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const useWebSocket = (userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);
    };

    if (userId) {
      socket.on(`notifications/${userId}`, handleNotification);
    }
    
    socket.on('notifications', handleNotification);

    return () => {
      if (userId) {
        socket.off(`notifications/${userId}`, handleNotification);
      }
      socket.off('notifications', handleNotification);
    };
  }, [socket, userId]);

  const sendMessage = useCallback((destination: string, message: unknown) => {
    if (socket && isConnected) {
      socket.emit(destination, message);
    }
  }, [socket, isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket,
    isConnected,
    notifications,
    sendMessage,
    clearNotifications
  };
};