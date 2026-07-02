import { useEffect, useState, useCallback, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Notification {
  title: string;
  message: string;
  type: string;
  priority: string;
  id: string;
  timestamp: string;
}

interface WebSocketHookReturn {
  client: Client | null;
  isConnected: boolean;
  notifications: Notification[];
  sendMessage: (destination: string, message: unknown) => void;
  clearNotifications: () => void;
  connectionError: string | null;
}

export const useWebSocket = (userId?: string): WebSocketHookReturn => {
  const [client, setClient] = useState<Client | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptionsRef = useRef<{ [key: string]: any }>({});
  const clientRef = useRef<Client | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    // Prevent creating duplicate clients if one already exists
    if (clientRef.current?.active) {
      console.log('WebSocket already connected, skipping new connection');
      return;
    }

    // Reset reconnect attempts on new connection
    reconnectAttemptsRef.current = 0;

    // Create STOMP client with SockJS transport
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('Connecting to WebSocket at:', `${API_URL}/ws`);

    const stompClient = new Client({
      webSocketFactory: () => {
        console.log('Creating SockJS connection...');
        return new SockJS(`${API_URL}/ws`);
      },

      connectHeaders: {
        // Add authentication headers if needed
      },

      debug: (str) => {
        // Only log important debug messages to reduce console spam
        if (str.includes('ERROR') || str.includes('RECEIPT') || str.includes('CONNECT')) {
          console.log('STOMP Debug:', str);
        }
      },

      reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
      heartbeatIncoming: 10000, // Increased from 4000
      heartbeatOutgoing: 10000, // Increased from 4000

      onConnect: (frame) => {
        console.log('✅ STOMP Connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;

        // Subscribe to global notifications
        try {
          const globalSub = stompClient.subscribe('/topic/notifications', (message: IMessage) => {
            try {
              const notification: Notification = JSON.parse(message.body);
              console.log('Received global notification:', notification);
              setNotifications((prev) => [...prev, notification]);
            } catch (error) {
              console.error('Error parsing notification:', error);
            }
          });
          subscriptionsRef.current['global'] = globalSub;

          // Subscribe to user-specific notifications if userId is provided
          if (userId) {
            const userSub = stompClient.subscribe(
              `/topic/notifications/${userId}`,
              (message: IMessage) => {
                try {
                  const notification: Notification = JSON.parse(message.body);
                  console.log('Received user-specific notification:', notification);
                  setNotifications((prev) => [...prev, notification]);
                } catch (error) {
                  console.error('Error parsing user notification:', error);
                }
              }
            );
            subscriptionsRef.current['user'] = userSub;
          }
        } catch (error) {
          console.error('Error setting up subscriptions:', error);
        }
      },

      onDisconnect: (frame) => {
        console.log('STOMP Disconnected');
        setIsConnected(false);
        // Clear subscriptions
        subscriptionsRef.current = {};
      },

      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError(
            `Connection failed after ${maxReconnectAttempts} attempts. WebSocket notifications disabled.`
          );
          console.warn('Max reconnection attempts reached. Stopping reconnection.');
          stompClient.deactivate();
        } else {
          setConnectionError(
            `Connection error (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );
        }
        setIsConnected(false);
      },

      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        reconnectAttemptsRef.current++;

        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('WebSocket connection unavailable. Real-time notifications disabled.');
          console.warn('WebSocket connection failed. Operating without real-time notifications.');
          stompClient.deactivate();
        } else {
          setConnectionError(
            `Connection error (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          );
        }
        setIsConnected(false);
      },
    });

    // Activate the client
    try {
      stompClient.activate();
      setClient(stompClient);
      clientRef.current = stompClient;
    } catch (error) {
      console.error('Error activating WebSocket client:', error);
      setConnectionError('Failed to initialize WebSocket connection');
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');

      // Unsubscribe from all subscriptions
      Object.values(subscriptionsRef.current).forEach((sub) => {
        if (sub && typeof sub.unsubscribe === 'function') {
          try {
            sub.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing:', error);
          }
        }
      });
      subscriptionsRef.current = {};

      // Deactivate the client
      if (clientRef.current?.active) {
        try {
          clientRef.current.deactivate();
        } catch (error) {
          console.error('Error deactivating client:', error);
        }
      }
      clientRef.current = null;
    };
  }, [userId]);

  const sendMessage = useCallback(
    (destination: string, message: unknown) => {
      if (clientRef.current && isConnected) {
        try {
          clientRef.current.publish({
            destination,
            body: JSON.stringify(message),
          });
          console.log('Message sent to:', destination, message);
        } catch (error) {
          console.error('Error sending message:', error);
        }
      } else {
        console.warn('Cannot send message: WebSocket not connected');
      }
    },
    [client, isConnected]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    client,
    isConnected,
    notifications,
    sendMessage,
    clearNotifications,
    connectionError,
  };
};
