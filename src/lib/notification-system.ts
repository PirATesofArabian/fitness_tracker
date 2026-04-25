'use client';

export interface StoredNotification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  message: string;
  timestamp: string;
  read: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'fitness_tracker_notifications';
const NOTIFICATION_EXPIRY_HOURS = 24;

export function getStoredNotifications(): StoredNotification[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const notifications: StoredNotification[] = JSON.parse(stored);
    const now = new Date();
    
    // Filter out notifications older than 24 hours
    const filtered = notifications.filter(notif => {
      const notifTime = new Date(notif.timestamp);
      const hoursDiff = (now.getTime() - notifTime.getTime()) / (1000 * 60 * 60);
      return hoursDiff < NOTIFICATION_EXPIRY_HOURS;
    });
    
    // Save filtered list back
    if (filtered.length !== notifications.length) {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filtered));
    }
    
    return filtered;
  } catch (e) {
    console.error('Failed to parse notifications', e);
    return [];
  }
}

export function addNotification(notification: Omit<StoredNotification, 'id' | 'timestamp' | 'read'>): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getStoredNotifications();
  
  // Check if similar notification already exists in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const duplicate = notifications.find(n => 
    n.message === notification.message && 
    new Date(n.timestamp) > oneHourAgo
  );
  
  if (duplicate) return; // Don't add duplicate
  
  const newNotification: StoredNotification = {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  notifications.unshift(newNotification);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  
  // Dispatch custom event for UI updates
  window.dispatchEvent(new CustomEvent('notification-added', { detail: newNotification }));
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getStoredNotifications();
  const notification = notifications.find(n => n.id === id);
  
  if (notification) {
    notification.read = true;
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('notification-updated'));
  }
}

export function markAllNotificationsAsRead(): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getStoredNotifications();
  notifications.forEach(n => n.read = true);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent('notification-updated'));
}

export function deleteNotification(id: string): void {
  if (typeof window === 'undefined') return;
  
  const notifications = getStoredNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('notification-updated'));
}

export function getUnreadCount(): number {
  return getStoredNotifications().filter(n => !n.read).length;
}

