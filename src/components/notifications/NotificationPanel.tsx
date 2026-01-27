import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertCircle className="w-5 h-5 text-emergency" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-risk" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="relative p-3 rounded-xl bg-card border border-border shadow-soft"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 w-5 h-5 bg-emergency text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border shadow-strong z-50"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto h-[calc(100%-64px)] custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Bell className="w-12 h-12 mb-4 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-accent/30' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationPanel;
