'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useDmConversation, useSendDm, DirectMessage } from '@/lib/hooks/useApi';
import { useCurrentUser } from '@/lib/hooks/useApi';
import { getDmSocket } from '@/lib/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConversationPage() {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: messages, refetch } = useDmConversation(otherUserId);
  const sendDm = useSendDm();
  const [text, setText] = useState('');
  const [liveMessages, setLiveMessages] = useState<DirectMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: otherUser } = useQuery({
    queryKey: ['user', otherUserId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/users/${otherUserId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) return null;
      return res.json().then((d: any) => d.user ?? d);
    },
    enabled: !!otherUserId,
  });

  // Sync fetched messages
  useEffect(() => {
    if (messages) setLiveMessages(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  // Real-time socket — server authenticates via Clerk token at handshake
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;

    const onReceived = (msg: DirectMessage) => {
      if (msg.senderId === otherUserId || msg.receiverId === otherUserId) {
        setLiveMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]));
      }
    };

    let cleanup = () => {};
    (async () => {
      const token = await getToken();
      if (cancelled) return;
      const socket = getDmSocket(token);
      socket.on('dm_received', onReceived);
      cleanup = () => socket.off('dm_received', onReceived);
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [currentUser?.id, otherUserId, getToken]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    try {
      await sendDm.mutateAsync({ receiverId: otherUserId, content });
    } catch {}
  };

  const displayName = otherUser?.fullName || otherUser?.username || '...';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--chat-bg)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--chat-border)', backgroundColor: 'var(--chat-header-bg)' }}>
        <button onClick={() => router.back()} className="hover:text-white transition-colors" style={{ color: '#6b7280' }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white overflow-hidden flex-shrink-0"
          style={{ backgroundColor: '#2a2a2a' }}>
          {otherUser?.avatarUrl
            ? <img src={otherUser.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div>
          <p className="font-semibold text-sm text-white">{displayName}</p>
          {otherUser?.username && <p className="text-xs" style={{ color: '#6b7280' }}>@{otherUser.username}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {liveMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: '#6b7280' }}>
            No messages yet. Say hello!
          </div>
        ) : (
          liveMessages.map((msg) => {
            const isMine = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  <p className="text-sm px-4 py-2.5 rounded-2xl"
                    style={{
                      backgroundColor: isMine ? '#4f46e5' : 'var(--chat-bubble-bg)',
                      color: isMine ? '#fff' : '#d1d5db',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      border: isMine ? 'none' : '1px solid var(--chat-bubble-border)',
                    }}>
                    {msg.content}
                  </p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-right' : 'text-left'}`} style={{ color: '#6b7280' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--chat-border)', backgroundColor: 'var(--chat-header-bg)' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={`Message ${otherUser?.username ?? ''}...`}
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: '#d1d5db' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendDm.isPending}
          className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 transition-colors flex-shrink-0"
          style={{ backgroundColor: '#4f46e5' }}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
