'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useMarkAllRead } from '@/lib/hooks/useApi';

const TYPE_ICONS: Record<string, string> = {
  COMMENT: '💬', LIKE: '❤️', COLLABORATION_REQUEST: '👥',
  COLLABORATION_ACCEPTED: '✅', ROOM_MENTION: '@', PROJECT_UPDATE: '📋', SKILL_ENDORSED: '⭐',
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markAll = useMarkAllRead();

  const unread = (notifications ?? []).filter((n) => !n.read).length;
  const isEmpty = !isLoading && (!notifications || notifications.length === 0);

  return (
    <div className="w-full min-h-screen px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            className="text-sm transition-colors"
            style={{ color: '#60a5fa' }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))}
        </div>
      )}

      {/* Empty state — centered in remaining space */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#1f1f1f' }}
          >
            <Bell className="w-8 h-8" style={{ color: '#6b7280' }} />
          </div>
          <h3 className="font-semibold text-white mb-1">No notifications</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: '#6b7280' }}>
            You're all caught up! Notifications will appear here when someone interacts with your posts.
          </p>
        </div>
      )}

      {/* Notifications list */}
      {!isLoading && notifications && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-4 p-4 rounded-xl transition-colors"
              style={{
                backgroundColor: n.read ? '#1a1a1a' : '#1a2a3a',
                border: `1px solid ${n.read ? '#242424' : '#1e3a5f'}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: '#242424' }}
              >
                {TYPE_ICONS[n.type] ?? '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{n.title}</p>
                {n.description && (
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{n.description}</p>
                )}
                <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                  {new Date(n.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: '#3b82f6' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
