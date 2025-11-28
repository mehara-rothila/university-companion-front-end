'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useBrowserNotifications } from '@/hooks/useBrowserNotifications';
import axios from 'axios';
import { AlertTriangle, X } from 'lucide-react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Emergency {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  timestamp: string;
  expiresAt?: string;
  dismissed: boolean;
}

export default function EmergencyNotificationBanner() {
  const { isDarkMode } = useDarkMode();
  const { user, token } = useAuth();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const { showEmergencyNotification, requestPermission } = useBrowserNotifications();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE = `${API_BASE_URL}/api`;

  // Helper to check if token is a valid JWT (has 3 parts separated by dots)
  const isValidJWT = (token: string | null): boolean => {
    if (!token || token.trim() === '') return false;
    // Check if it's a placeholder token
    if (token === 'google-oauth-token' || token === 'null' || token === 'undefined') return false;
    // Basic JWT format check: should have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  };

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Safe date formatting helper
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  // Request browser notification permission on mount
  useEffect(() => {
    if (user && isValidJWT(token)) {
      // Request permission for browser notifications
      requestPermission().then(granted => {
        if (granted) {
          console.log('✅ Browser notification permission granted');
        } else {
          console.log('❌ Browser notification permission denied');
        }
      });
    }
  }, [user, token]);

  // Load active emergencies on mount
  useEffect(() => {
    // Only load if we have both user and a valid JWT token
    if (user && isValidJWT(token)) {
      loadActiveEmergencies();
      setupWebSocket();
    }

    return () => {
      if (stompClient?.active) {
        stompClient.deactivate();
      }
    };
  }, [user, token]);

  // Mark emergencies as seen when they appear
  useEffect(() => {
    if (user && isValidJWT(token) && emergencies.length > 0) {
      emergencies.forEach(emergency => {
        markEmergencyAsSeen(emergency.id);
      });
    }
  }, [emergencies.map(e => e.id).join(',')]);

  const loadActiveEmergencies = async () => {
    try {
      // Only attempt to load if we have a valid JWT token
      if (!isValidJWT(token)) {
        return;
      }

      const response = await axios.get(`${API_BASE}/emergency/active`, {
        headers: getAuthHeaders()
      });

      if (response.data) {
        const activeEmergencies = response.data
          .filter((e: any) => !e.currentUserDismissed)
          .map((e: any) => ({
            id: e.id,
            title: e.title,
            message: e.message,
            type: e.type,
            priority: e.priority,
            timestamp: e.createdAt,
            expiresAt: e.expiresAt,
            dismissed: false
          }));

        setEmergencies(activeEmergencies);
      }
    } catch (error: any) {
      // Silently fail if it's an auth error (400/401/403)
      if (error.response && [400, 401, 403].includes(error.response.status)) {
        console.log('Emergency notifications not available for this user');
      } else {
        console.error('Failed to load emergencies:', error);
      }
    }
  };

  const setupWebSocket = () => {
    // Only setup WebSocket if we have a valid JWT token
    if (!isValidJWT(token)) {
      return;
    }

    try {
      const client = new Client({
        webSocketFactory: () => {
          return new SockJS(`${API_BASE_URL}/ws`);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: (frame) => {
          console.log('✅ STOMP Connected for emergencies');

          // Subscribe to global emergency broadcasts
          client.subscribe('/topic/emergency', (message: IMessage) => {
            try {
              const emergencyMsg = JSON.parse(message.body);
              if (emergencyMsg.type === 'EMERGENCY') {
                const newEmergency: Emergency = {
                  id: parseInt(emergencyMsg.id),
                  title: emergencyMsg.title,
                  message: emergencyMsg.message,
                  type: emergencyMsg.type,
                  priority: emergencyMsg.priority,
                  timestamp: emergencyMsg.timestamp,
                  expiresAt: emergencyMsg.expiresAt,
                  dismissed: false
                };

                setEmergencies(prev => {
                  const exists = prev.some(e => e.id === newEmergency.id);
                  if (!exists) {
                    playEmergencyAlert();

                    // Show browser notification
                    showEmergencyNotification(newEmergency.title, newEmergency.message)
                      .then(notification => {
                        if (notification) {
                          console.log('🔔 Browser notification shown');
                          // Handle notification click
                          notification.onclick = () => {
                            window.focus();
                            notification.close();
                          };
                        }
                      });

                    return [newEmergency, ...prev];
                  }
                  return prev;
                });
              }
            } catch (error) {
              console.error('Error parsing emergency message:', error);
            }
          });

          // Subscribe to user-specific emergency broadcasts
          if (user?.id) {
            client.subscribe(`/topic/emergency/${user.id}`, (message: IMessage) => {
              try {
                const emergencyMsg = JSON.parse(message.body);
                if (emergencyMsg.type === 'EMERGENCY') {
                  const newEmergency: Emergency = {
                    id: parseInt(emergencyMsg.id),
                    title: emergencyMsg.title,
                    message: emergencyMsg.message,
                    type: emergencyMsg.type,
                    priority: emergencyMsg.priority,
                    timestamp: emergencyMsg.timestamp,
                    expiresAt: emergencyMsg.expiresAt,
                    dismissed: false
                  };

                  setEmergencies(prev => {
                    const exists = prev.some(e => e.id === newEmergency.id);
                    if (!exists) {
                      playEmergencyAlert();

                      // Show browser notification
                      showEmergencyNotification(newEmergency.title, newEmergency.message)
                        .then(notification => {
                          if (notification) {
                            console.log('🔔 Browser notification shown (user-specific)');
                            // Handle notification click
                            notification.onclick = () => {
                              window.focus();
                              notification.close();
                            };
                          }
                        });

                      return [newEmergency, ...prev];
                    }
                    return prev;
                  });
                }
              } catch (error) {
                console.error('Error parsing user emergency message:', error);
              }
            });
          }
        },

        onDisconnect: () => {
          console.log('STOMP disconnected for emergencies');
        },

        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
        },

        onWebSocketError: (error) => {
          console.error('WebSocket Error:', error);
        }
      });

      client.activate();
      setStompClient(client);
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
    }
  };

  const playEmergencyAlert = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail if audio context not available
    }
  };

  const dismissEmergency = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/emergency/${id}/dismiss`, {}, {
        headers: getAuthHeaders()
      });

      setEmergencies(prev => prev.filter(e => e.id !== id));
    } catch (error: any) {
      if (error.response && [400, 401, 403].includes(error.response.status)) {
        console.log('Unable to dismiss emergency - authentication issue');
      } else {
        console.error('Failed to dismiss emergency:', error);
      }
    }
  };

  const acknowledgeEmergency = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/emergency/${id}/acknowledge`, {}, {
        headers: getAuthHeaders()
      });

      // Update emergency to acknowledged in UI
      setEmergencies(prev =>
        prev.map(e =>
          e.id === id ? { ...e, dismissed: true } : e
        )
      );
    } catch (error: any) {
      if (error.response && [400, 401, 403].includes(error.response.status)) {
        console.log('Unable to acknowledge emergency - authentication issue');
      } else {
        console.error('Failed to acknowledge emergency:', error);
      }
    }
  };

  const markEmergencyAsSeen = async (id: number) => {
    try {
      await axios.post(`${API_BASE}/emergency/${id}/seen`, {}, {
        headers: getAuthHeaders()
      });
    } catch (error: any) {
      // Silently fail for "seen" tracking - not critical
      if (error.response && ![400, 401, 403].includes(error.response.status)) {
        console.error('Failed to mark emergency as seen:', error);
      }
    }
  };

  if (!user || emergencies.length === 0) {
    return null;
  }

  return (
    <>
      {emergencies.map((emergency) => (
        <div
          key={emergency.id}
          className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-red-900 via-red-800 to-red-900'
              : 'bg-gradient-to-r from-red-600 via-red-500 to-red-600'
          } border-b-2 border-red-700 shadow-2xl`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Animated Alert Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    {emergency.title}
                    <span className="inline-block px-2 py-0.5 text-xs font-bold bg-white text-red-600 rounded-full">
                      URGENT
                    </span>
                  </h3>
                  <p className="text-white/90 text-sm whitespace-pre-wrap break-words">
                    {emergency.message}
                  </p>
                  {emergency.expiresAt && (
                    <p className="text-white/75 text-xs mt-2">
                      Expires: {formatDate(emergency.expiresAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => acknowledgeEmergency(emergency.id)}
                  className="px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap text-sm"
                >
                  I Acknowledge
                </button>
                <button
                  onClick={() => dismissEmergency(emergency.id)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200 flex-shrink-0"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Animated bottom border */}
          <div className="h-1 bg-red-700">
            <div className="h-full bg-white animate-pulse" style={{
              animation: 'slideInOut 3s infinite'
            }} />
          </div>

          <style>{`
            @keyframes slideInOut {
              0%, 100% { width: 0; }
              50% { width: 100%; }
            }
          `}</style>
        </div>
      ))}
    </>
  );
}
