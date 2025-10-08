import { useEffect, useState, useCallback, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

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

  useEffect(() => {
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
        console.log('STOMP Debug:', str);
      },
      
      reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: (frame) => {
        console.log('STOMP Connected:', frame);
        setIsConnected(true);
        setConnectionError(null);
        
        // Subscribe to global notifications
        const globalSub = stompClient.subscribe('/topic/notifications', (message: IMessage) => {
          try {
            const notification: Notification = JSON.parse(message.body);
            console.log('Received global notification:', notification);
            setNotifications(prev => [...prev, notification]);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        });
        subscriptionsRef.current['global'] = globalSub;

        // Subscribe to user-specific notifications if userId is provided
        if (userId) {
          const userSub = stompClient.subscribe(`/topic/notifications/${userId}`, (message: IMessage) => {
            try {
              const notification: Notification = JSON.parse(message.body);
              console.log('Received user-specific notification:', notification);
              setNotifications(prev => [...prev, notification]);
            } catch (error) {
              console.error('Error parsing user notification:', error);
            }
          });
          subscriptionsRef.current['user'] = userSub;
        }

        // Send a test message to confirm connection
        stompClient.publish({
          destination: '/app/hello',
          body: 'Hello from client!'
        });
      },
      
      onDisconnect: (frame) => {
        console.log('STOMP Disconnected:', frame);
        setIsConnected(false);
        // Clear subscriptions
        subscriptionsRef.current = {};
      },
      
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        setConnectionError(`Connection error: ${frame.headers['message'] || 'Unknown error'}`);
        setIsConnected(false);
      },
      
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        setConnectionError('WebSocket connection failed');
        setIsConnected(false);
      }
    });

    // Activate the client
    stompClient.activate();
    setClient(stompClient);

    // Cleanup on unmount
    return () => {
      // Unsubscribe from all subscriptions
      Object.values(subscriptionsRef.current).forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
      subscriptionsRef.current = {};
      
      // Deactivate the client
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [userId]);

  const sendMessage = useCallback((destination: string, message: unknown) => {
    if (client && isConnected) {
      try {
        client.publish({
          destination,
          body: JSON.stringify(message)
        });
        console.log('Message sent to:', destination, message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }, [client, isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    client,
    isConnected,
    notifications,
    sendMessage,
    clearNotifications,
    connectionError
  };
};