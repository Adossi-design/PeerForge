'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, MessageSquare, Flame } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePosts } from '@/lib/hooks/usePosts';
import { useDiscussions } from '@/lib/hooks/useApi';
import { PostCard } from '@/components/features/posts/PostCard';
import { useTheme } from '@/lib/context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [filter, setFilter] = useState<string | null>(null);
  const { data: posts, isLoading } = usePosts();
  const firstName = user?.firstName ?? 'there';
  const filtered = filter ? posts?.filter((p) => p.type === filter) : posts;
  const { data: discussions } = useDiscussions();

  const rsBg    = isLight ? '#f9f9fb'  : '#13121e';
  const rsBorder = isLight ? '#e5e7eb' : '#1e1c2e';
  const cardBg  = isLight ? '#ffffff'  : '#16152a';
  const cardBdr = isLight ? '#e5e7eb'  : '#252338';
  const headClr = isLight ? '#111827'  : '#ffffff';
  const iconClr = isLight ? '#6366f1'  : '#818cf8';
  const rankClr = isLight ? '#9ca3af'  : '#6b7280';
  const titleClr= isLight ? '#111827'  : '#f3f4f6';
  const metaClr = isLight ? '#9ca3af'  : '#6b7280';
  const dotClr  = isLight ? '#a5b4fc'  : '#a5b4fc';
  const nameClr = isLight ? '#374151'  : '#d1d5db';
  const tagBg   = isLight ? '#ede9fe'  : '#1e1b4b';
  const tagClr  = isLight ? '#5b21b6'  : '#a5b4fc';
  const tagBdr  = isLight ? '#ddd6fe'  : '#312e81';

  return (
    <div className="flex h-full min-h-screen">
      {/* Feed */}
      <div className="flex-1 min-w-0 px-4 sm:px-8 py-8">
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

      {/* Right Sidebar */}
      <aside
        className="hidden xl:flex flex-col flex-shrink-0 py-8 px-4 gap-4"
        style={{ width: '300px', borderLeft: `1px solid ${rsBorder}`, backgroundColor: rsBg, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}
      >
        {/* Trending Projects */}
        <div className="card rounded-2xl p-4" style={{
          backgroundColor: isLight ? '#f0ebff' : '#1a1535',
          border: isLight ? '1px solid #ddd6fe' : '1px solid #2d2060',
          background: isLight ? 'linear-gradient(135deg, #f0ebff 0%, #fce7f3 100%)' : 'linear-gradient(135deg, #1a1535 0%, #1e1040 100%)'
        }}>
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: headClr }}>
            <TrendingUp className="w-4 h-4" style={{ color: iconClr }} />
            Trending Projects
          </h3>
          <div className="space-y-3">
            {(posts ?? []).slice(0, 4).map((post, i) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="flex gap-2.5 group" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-bold w-5 flex-shrink-0 mt-0.5" style={{ color: rankClr }}>#{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-indigo-400 transition-colors" style={{ color: titleClr }}>{post.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: metaClr }}>{post._count?.likes ?? 0} likes &nbsp;&middot;&nbsp; {post._count?.comments ?? 0} comments</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Discussions */}
        <div className="card rounded-2xl p-4" style={{
          backgroundColor: isLight ? '#eff6ff' : '#0f1f3d',
          border: isLight ? '1px solid #bfdbfe' : '1px solid #1e3a6e',
          background: isLight ? 'linear-gradient(135deg, #eff6ff 0%, #f0ebff 100%)' : 'linear-gradient(135deg, #0f1f3d 0%, #1a1535 100%)'
        }}>
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: headClr }}>
            <MessageSquare className="w-4 h-4" style={{ color: iconClr }} />
            Active Discussions
          </h3>
          <div className="space-y-3">
            {(discussions ?? []).slice(0, 4).map((d) => (
              <Link key={d.id} href={`/discussions/${d.id}`} className="flex items-center gap-2.5 group">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotClr }} />
                <span className="text-sm truncate group-hover:text-indigo-400 transition-colors" style={{ color: nameClr }}>{d.name}</span>
              </Link>
            ))}
            {(!discussions || discussions.length === 0) && (
              <p className="text-xs" style={{ color: metaClr }}>No active discussions yet.</p>
            )}
          </div>
        </div>

        {/* Hot Skills */}
        <div className="card rounded-2xl p-4" style={{
          backgroundColor: isLight ? '#fdf4ff' : '#1f0f35',
          border: isLight ? '1px solid #e9d5ff' : '1px solid #3b1f6e',
          background: isLight ? 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%)' : 'linear-gradient(135deg, #1f0f35 0%, #2d1060 100%)'
        }}>
          <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: headClr }}>
            <Flame className="w-4 h-4" style={{ color: '#f97316' }} />
            Hot Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {HOT_SKILLS.map((skill) => (
              <span key={skill} className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ backgroundColor: tagBg, color: tagClr, border: `1px solid ${tagBdr}` }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
