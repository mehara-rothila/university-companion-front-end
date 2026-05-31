// src/hooks/useBrowserNotifications.ts
'use client';

import { useEffect, useState } from 'react';

export interface BrowserNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export const useBrowserNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) {
      console.warn('Browser notifications not supported');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const showNotification = async (options: BrowserNotificationOptions): Promise<Notification | null> => {
    if (!supported) {
      console.warn('Browser notifications not supported');
      return null;
    }

    // Request permission if not granted
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/emergency-icon.png',
        badge: options.badge || '/badge-icon.png',
        tag: options.tag || 'university-notification',
        requireInteraction: options.requireInteraction ?? false,
        silent: options.silent ?? false,
        // @ts-ignore - vibrate is supported in mobile browsers but not in TS types
        vibrate: [200, 100, 200], // Vibration pattern for mobile
        timestamp: Date.now(),
      });

      // Auto-close after 10 seconds if not required interaction
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  };

  const showEmergencyNotification = async (title: string, message: string): Promise<Notification | null> => {
    return showNotification({
      title: `🚨 EMERGENCY: ${title}`,
      body: message,
      requireInteraction: true, // Force user to interact
      silent: false, // Make sound
      tag: 'emergency-alert',
    });
  };

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
    showEmergencyNotification,
  };
};
