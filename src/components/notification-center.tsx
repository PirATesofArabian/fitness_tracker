'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  getStoredNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  StoredNotification 
} from '@/lib/notification-system';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    setNotifications(getStoredNotifications());
    setUnreadCount(getUnreadCount());
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener('notification-added', handleUpdate);
    window.addEventListener('notification-updated', handleUpdate);

    return () => {
      window.removeEventListener('notification-added', handleUpdate);
      window.removeEventListener('notification-updated', handleUpdate);
    };
  }, []);

  const handleOpen = () => {
    setOpen(true);
    // Mark all as read when opening
    setTimeout(() => {
      markAllNotificationsAsRead();
    }, 500);
  };

  const getNotificationStyles = (type: StoredNotification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400';
      case 'tip':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleOpen}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Notifications</DialogTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    notifications.forEach(n => deleteNotification(n.id));
                    loadNotifications();
                  }}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border text-sm relative ${getNotificationStyles(notif.type)} ${
                    !notif.read ? 'ring-2 ring-primary/20' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p>{notif.message}</p>
                      <p className="text-xs opacity-60 mt-1">{formatTime(notif.timestamp)}</p>
                    </div>
                    <button
                      onClick={() => {
                        deleteNotification(notif.id);
                        loadNotifications();
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {!notif.read && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


