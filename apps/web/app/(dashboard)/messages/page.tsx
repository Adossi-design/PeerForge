'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useDmInbox } from '@/lib/hooks/useApi';
import { useCurrentUser } from '@/lib/hooks/useApi';

export default function MessagesPage() {
  const { data: conversations, isLoading } = useDmInbox();
  const { data: currentUser } = useCurrentUser();

  return (
    <div className="w-full px-4 sm:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Your private conversations</p>
      </div>

      <div className="space-y-2" style={{ maxWidth: '680px' }}>
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))
        ) : conversations && conversations.length > 0 ? (
          conversations.map((c) => {
            const unread = !c.read && c.senderId !== currentUser?.id;
            return (
              <Link
                key={c.partner.id}
                href={`/messages/${c.partner.id}`}
                className="card flex items-center gap-4 px-4 py-3 rounded-xl transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1a1a1a', border: `1px solid ${unread ? '#1e3a5f' : '#242424'}` }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-white flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#2a2a2a' }}>
                  {c.partner.avatarUrl
                    ? <img src={c.partner.avatarUrl} alt={c.partner.username} className="w-full h-full object-cover" />
                    : c.partner.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{c.partner.fullName || c.partner.username}</p>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: '#6b7280' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: unread ? '#d1d5db' : '#6b7280', fontWeight: unread ? 600 : 400 }}>
                    {c.senderId === currentUser?.id ? 'You: ' : ''}{c.content}
                  </p>
                </div>
                {unread && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#3b82f6' }} />}
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#1f1f1f' }}>
              <MessageCircle className="w-8 h-8" style={{ color: '#6b7280' }} />
            </div>
            <h3 className="font-semibold text-white mb-1">No messages yet</h3>
            <p className="text-sm text-center max-w-xs" style={{ color: '#6b7280' }}>
              Visit someone's profile and click "Message" to start a conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
