'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Hash, Users, Send } from 'lucide-react';
import { useDiscussion, useDiscussionMessages, ChatMessage } from '@/lib/hooks/useApi';
import { useCurrentUser } from '@/lib/hooks/useApi';
import { getSocket, socketEvents } from '@/lib/socket';

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 text-white"
      style={{ backgroundColor: '#2a2a2a' }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function DiscussionRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [message, setMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const joinedRef = useRef(false);

  const { data: discussion } = useDiscussion(id);
  const { data: fetchedMessages } = useDiscussionMessages(id);

  // Sync fetched messages into live state
  useEffect(() => {
    if (fetchedMessages) setLiveMessages(fetchedMessages);
  }, [fetchedMessages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages]);

  // Socket setup
  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = getSocket();

    // Join room
    if (!joinedRef.current) {
      socket.emit(socketEvents.JOIN_DISCUSSION, { discussionId: id, userId: currentUser.id });
      joinedRef.current = true;
    }

    // Listen for new messages
    const onMessage = (msg: ChatMessage) => {
      setLiveMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on(socketEvents.MESSAGE_RECEIVED, onMessage);

    return () => {
      socket.off(socketEvents.MESSAGE_RECEIVED, onMessage);
      socket.emit(socketEvents.LEAVE_DISCUSSION, { discussionId: id, userId: currentUser.id });
      joinedRef.current = false;
    };
  }, [id, currentUser?.id]);

  const handleSend = () => {
    if (!message.trim() || !currentUser?.id) return;
    const socket = getSocket();
    socket.emit(socketEvents.SEND_MESSAGE, {
      discussionId: id,
      userId: currentUser.id,
      message: { content: message.trim() },
    });
    setMessage('');
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid #1f1f1f', backgroundColor: '#111111' }}>
        <button onClick={() => router.back()} style={{ color: '#6b7280' }} className="hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#1e3a5f' }}>
          <Hash className="w-4 h-4" style={{ color: '#60a5fa' }} />
        </div>
        <div>
          <p className="font-semibold text-sm text-white">{discussion?.name ?? 'Loading...'}</p>
          <p className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }}>
            <Users className="w-3 h-3" />
            {discussion?.memberCount ?? 0} members
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {liveMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: '#6b7280' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          liveMessages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar name={msg.author.username} />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white">{msg.author.username}</span>
                  <span className="text-xs" style={{ color: '#6b7280' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#d1d5db' }}>{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderTop: '1px solid #1f1f1f' }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: '#d1d5db' }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 transition-colors"
          style={{ backgroundColor: '#4f46e5' }}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
