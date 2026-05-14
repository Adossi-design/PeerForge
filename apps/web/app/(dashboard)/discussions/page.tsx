'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, Users } from 'lucide-react';
import { useDiscussions } from '@/lib/hooks/useApi';

const TYPE_LABELS: Record<string, string> = {
  PROJECT: 'Project', TOPIC: 'Topic', GENERAL: 'General', STUDY_GROUP: 'Study Group',
};

export default function DiscussionsPage() {
  const { data: discussions, isLoading } = useDiscussions();

  return (
    <div className="px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Discussions</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Join conversations and collaborate in real-time</p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))
        ) : discussions && discussions.length > 0 ? (
          discussions.map((d) => (
            <Link
              key={d.id}
              href={`/discussions/${d.id}`}
              className="flex items-center gap-4 rounded-xl px-6 py-5 transition-colors"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#1e3a5f' }}
              >
                <MessageSquare className="w-5 h-5" style={{ color: '#60a5fa' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">{d.name}</p>
                {d.description && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>{d.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: '#6b7280' }}>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />{d.memberCount} members
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: '#242424', border: '1px solid #2f2f2f', color: '#9ca3af' }}
                  >
                    {TYPE_LABELS[d.type] ?? d.type}
                  </span>
                  <span>
                    Active {d.updatedAt
                      ? new Date(d.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'recently'}
                  </span>
                </div>
              </div>

              {/* Online dot */}
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#22c55e' }} />
            </Link>
          ))
        ) : (
          <div className="text-center py-16" style={{ color: '#6b7280' }}>No discussions yet.</div>
        )}
      </div>
    </div>
  );
}
