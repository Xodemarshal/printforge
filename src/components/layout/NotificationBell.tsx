"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-notification-bell]")) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "🎉";
      case "error": return "⚠️";
      case "warning": return "⚡";
      default: return "📢";
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" data-notification-bell>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cream transition-all duration-300 hover:bg-white/10 backdrop-blur-md shrink-0"
      >
        <Bell size={16} className="sm:w-5 sm:h-5 text-emerald-400" />
        <span className="sr-only">Notifications</span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] text-white font-bold shadow-md shadow-emerald-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
      
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-3xl border border-white/10 bg-[#0a130c]/95 backdrop-blur-xl shadow-2xl shadow-black/60 text-cream">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-emerald-400">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-cream/60 hover:text-emerald-400 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-cream/50">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-1.5 p-2">
                {notifications.slice(0, 10).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`rounded-2xl p-3 cursor-pointer transition-colors border ${
                      notification.read 
                        ? "bg-white/5 border-white/5 hover:bg-white/10" 
                        : "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-cream">
                          {notification.title}
                        </p>
                        <p className="text-xs text-cream/70 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-cream/40 mt-2 font-medium">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-1 shadow-sm shadow-emerald-400"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-white/10">
            <Link 
              href="/dashboard" 
              className="block text-center text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
