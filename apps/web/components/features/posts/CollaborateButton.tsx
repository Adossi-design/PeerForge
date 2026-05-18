'use client';

import React, { useState } from 'react';
import { Users, Check, Clock, X } from 'lucide-react';
import {
  useCollaborationStatus,
  usePostCollaborations,
  useRequestCollaboration,
  useRespondCollaboration,
  Collaboration,
} from '@/lib/hooks/useApi';
import { useCurrentUser } from '@/lib/hooks/useApi';
import { useToast } from '@/components/common/Toast';
import { useTheme } from '@/lib/context/ThemeContext';

const STATUS_CONFIG = {
  PENDING:  { label: 'Request Sent', icon: Clock,  color: '#fbbf24', bg: '#2d2000' },
  ACCEPTED: { label: 'Collaborating', icon: Check, color: '#22c55e', bg: '#052e16' },
  REJECTED: { label: 'Declined',      icon: X,     color: '#ef4444', bg: '#2d0a0a' },
};

export function CollaborateButton({ postId, postAuthorId }: { postId: string; postAuthorId: string }) {
  const { data: currentUser } = useCurrentUser();
  const { data: statusData } = useCollaborationStatus(postId);
  const requestCollab = useRequestCollaboration();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const toast = useToast();

  // Don't show button to the post author
  if (!currentUser || currentUser.id === postAuthorId) return null;

  const status = statusData?.status as keyof typeof STATUS_CONFIG | null;
  const cfg = status ? STATUS_CONFIG[status] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestCollab.mutateAsync({ postId, message: message.trim() || undefined });
      toast('Collaboration request sent!');
      setShowModal(false);
      setMessage('');
    } catch (err: any) {
      toast(err?.message ?? 'Failed to send request.', 'error');
    }
  };

  if (cfg) {
    const Icon = cfg.icon;
    return (
      <span
        className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium"
        style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
      >
        <Icon className="w-4 h-4" />{cfg.label}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#4f46e5' }}
      >
        <Users className="w-4 h-4" />Request to Collaborate
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f' }}>
            <h3 className="text-lg font-bold text-white mb-1">Request to Collaborate</h3>
            <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
              Send a message to the post author explaining why you'd like to join.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and describe what you can contribute... (optional)"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                style={{ backgroundColor: '#111', border: '1px solid #2f2f2f', color: '#d1d5db' }}
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg"
                  style={{ backgroundColor: '#242424', color: '#9ca3af', border: '1px solid #3f3f3f' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestCollab.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                  style={{ backgroundColor: '#4f46e5' }}
                >
                  {requestCollab.isPending ? 'Sending…' : 'Send Request'}
                </button>
              </div>
              {requestCollab.isError && (
                <p className="text-xs text-center" style={{ color: '#ef4444' }}>
                  {(requestCollab.error as Error).message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function CollaboratorsPanel({ postId, isAuthor }: { postId: string; isAuthor: boolean }) {
  const { data: collaborations } = usePostCollaborations(postId);
  const respond = useRespondCollaboration();
  const toast = useToast();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!collaborations || collaborations.length === 0) return null;

  return (
    <div className="card rounded-2xl p-5 mb-6" style={{ backgroundColor: isLight ? '#dbeafe' : '#1a1a1a', border: `1px solid ${isLight ? '#bfdbfe' : '#2f2f2f'}` }}>
      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" style={{ color: '#60a5fa' }} />
        Collaboration Requests ({collaborations.length})
      </h3>
      <div className="space-y-3">
        {collaborations.map((c: Collaboration) => {
          const cfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG];
          return (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: isLight ? '#eff6ff' : '#111111', border: `1px solid ${isLight ? '#bfdbfe' : '#2f2f2f'}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: '#2a2a2a' }}>
                {c.user?.username?.slice(0, 2).toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{c.user?.username}</p>
                {c.message && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{c.message}</p>}
              </div>
              {isAuthor && c.status === 'PENDING' ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => respond.mutate({ id: c.id, accept: true, postId }, { onSuccess: () => toast('Collaboration accepted!'), onError: () => toast('Failed to respond.', 'error') })}
                    disabled={respond.isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                    style={{ backgroundColor: '#166534' }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respond.mutate({ id: c.id, accept: false, postId }, { onSuccess: () => toast('Collaboration declined.'), onError: () => toast('Failed to respond.', 'error') })}
                    disabled={respond.isPending}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ backgroundColor: '#2d0a0a', color: '#ef4444' }}
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full flex-shrink-0 font-medium"
                  style={{ backgroundColor: cfg?.bg, color: cfg?.color }}>
                  {cfg?.label ?? c.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
