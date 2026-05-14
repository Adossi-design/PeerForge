'use client';

import React, { useState } from 'react';
import { TrendingUp, MessageSquare, Flame } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/features/posts/PostCard';

const FILTERS = [
  { label: 'All',         value: null },
  { label: 'Collabs',     value: 'COLLABORATION_REQUEST' },
  { label: 'Help',        value: 'HELP_REQUEST' },
  { label: 'Open Source', value: 'OPEN_SOURCE_CONTRIBUTION' },
  { label: 'Ideas',       value: 'STARTUP_IDEA' },
  { label: 'Discussion',  value: 'TECHNICAL_DISCUSSION' },
];

const HOT_SKILLS = ['React', 'Python', 'AI/ML', 'TypeScript', 'Docker', 'Next.js', 'Rust', 'Go'];

export default function HomePage() {
  const { user } = useUser();
  const [filter, setFilter] = useState<string | null>(null);
  const { data: posts, isLoading } = usePosts();

  const firstName = user?.firstName ?? 'there';
  const filtered = filter ? posts?.filter((p) => p.type === filter) : posts;

  return (
    <div className="flex h-full min-h-screen">
      {/* Feed — takes remaining space */}
      <div className="flex-1 min-w-0 px-8 py-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">Hey, {firstName}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Discover what builders are working on</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={String(f.value)}
                onClick={() => setFilter(f.value)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }
                    : { backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid transparent' }
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
            ))
          ) : filtered && filtered.length > 0 ? (
            filtered.map((post) => (
              <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />
            ))
          ) : (
            <div className="text-center py-16" style={{ color: '#6b7280' }}>No posts found.</div>
          )}
        </div>
      </div>

      {/* Right Sidebar — fixed 260px */}
      <aside
        className="flex-shrink-0 px-6 py-8"
        style={{ width: '260px', borderLeft: '1px solid #1f1f1f' }}
      >
        {/* Trending */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: '#60a5fa' }} />
            Trending Projects
          </h3>
          <div className="space-y-3">
            {(posts ?? []).slice(0, 4).map((post, i) => (
              <div key={post.id} className="flex gap-2">
                <span className="text-xs font-bold w-5 flex-shrink-0" style={{ color: '#6b7280' }}>#{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{post.title}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>
                    {post._count?.likes ?? 0} likes · {post._count?.comments ?? 0} comments
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #1f1f1f', marginBottom: '2rem' }} />

        {/* Active Discussions */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <MessageSquare className="w-4 h-4" style={{ color: '#60a5fa' }} />
            Active Discussions
          </h3>
          <div className="space-y-3">
            {['AI Study Buddy — Dev Chat', 'Rust Web Dev Discussion', 'CS350 Study Group', 'Open Source Contributors'].map((name) => (
              <div key={name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#22c55e' }} />
                <span className="text-sm" style={{ color: '#9ca3af' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #1f1f1f', marginBottom: '2rem' }} />

        {/* Hot Skills */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
            <Flame className="w-4 h-4" style={{ color: '#fb923c' }} />
            Hot Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {HOT_SKILLS.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#1a1a1a', color: '#d1d5db', border: '1px solid #2f2f2f' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
