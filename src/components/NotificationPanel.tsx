import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, MessageSquare, UserPlus, Package, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: 'match' | 'message' | 'deal' | 'system';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
  action?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match Found!',
    description: 'Someone wants to split the iPhone 15 Pro deal with you',
    timestamp: '2 minutes ago',
    isRead: false,
    action: 'View Match'
  },
  {
    id: '2',
    type: 'message',
    title: 'Message from Sarah',
    description: 'Hey! Are you still interested in the Nike shoes deal?',
    timestamp: '1 hour ago',
    isRead: false,
    action: 'Reply'
  },
  {
    id: '3',
    type: 'deal',
    title: 'Deal Completed',
    description: 'Your Costco bulk purchase was successful! ⭐⭐⭐⭐⭐',
    timestamp: '3 hours ago',
    isRead: true,
    action: 'Rate User'
  },
  {
    id: '4',
    type: 'system',
    title: 'Welcome to DealSplit!',
    description: 'Complete your profile to get better matches',
    timestamp: '1 day ago',
    isRead: true,
    action: 'Complete Profile'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'match': return UserPlus;
    case 'message': return MessageSquare;
    case 'deal': return Package;
    case 'system': return Zap;
    default: return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'match': return 'from-green-500 to-green-600';
    case 'message': return 'from-blue-500 to-blue-600';
    case 'deal': return 'from-purple-500 to-purple-600';
    case 'system': return 'from-orange-500 to-orange-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

interface NotificationPanelProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationPanel = ({ unreadCount, onMarkAllRead }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const hasUnread = unreadNotifications.length > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5" />
        
        {/* Red Dot Indicator */}
        <AnimatePresence>
          {hasUnread && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 z-50"
          >
            <Card className="glass-card border border-border/20 shadow-xl">
              <div className="p-4 border-b border-border/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {hasUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMarkAllRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {unreadNotifications.length}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-0 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification, index) => {
                      const Icon = getNotificationIcon(notification.type);
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 border-b border-border/10 hover:bg-muted/20 transition-colors cursor-pointer group ${
                            !notification.isRead ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <motion.div
                              className={`w-10 h-10 rounded-full bg-gradient-to-r ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}
                              whileHover={{ scale: 1.1 }}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </motion.div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {notification.timestamp}
                                    </span>
                                    {notification.action && (
                                      <motion.span
                                        className="text-xs text-primary font-medium cursor-pointer relative"
                                        whileHover="hover"
                                        variants={{
                                          hover: {
                                            scale: 1.05
                                          }
                                        }}
                                      >
                                        {notification.action}
                                        <motion.div
                                          className="absolute -bottom-0.5 left-0 h-0.5 bg-primary rounded-full"
                                          initial={{ width: 0 }}
                                          variants={{
                                            hover: { width: "100%" }
                                          }}
                                          transition={{ duration: 0.3, ease: "easeInOut" }}
                                        />
                                      </motion.span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 ml-2">
                                  {!notification.isRead && (
                                    <motion.button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                      whileHover={{ scale: 1.2 }}
                                      title="Mark as read"
                                    >
                                      <Check className="w-3 h-3" />
                                    </motion.button>
                                  )}
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dismissNotification(notification.id);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    whileHover={{ scale: 1.2 }}
                                    title="Dismiss"
                                  >
                                    <X className="w-3 h-3" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;