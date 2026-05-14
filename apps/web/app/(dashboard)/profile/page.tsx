'use client';

import React from 'react';
import { Mail, MapPin, Github, Calendar, ExternalLink, Linkedin } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/useApi';
import { usePosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/features/posts/PostCard';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: posts } = usePosts();

  const myPosts = (posts ?? []).filter((p) => p.author?.id === user?.id);
  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()
    : 'U';

  if (isLoading) return (
    <div className="w-full px-8 py-8">
      <div className="h-64 rounded-2xl animate-pulse mx-auto" style={{ backgroundColor: '#1a1a1a', maxWidth: '760px' }} />
    </div>
  );

  return (
    <div className="w-full px-8 py-8">
      {/* Profile Card */}
      <div className="rounded-2xl overflow-hidden mb-8 mx-auto"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424', maxWidth: '760px' }}>

        {/* Banner */}
        <div style={{ height: '110px', background: 'linear-gradient(135deg, #3b1f6e 0%, #1a2a5e 50%, #0f3d3d 100%)' }} />

        <div className="px-6" style={{ marginTop: '-40px' }}>
          {/* Avatar + Name + Edit button */}
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0"
                style={{ backgroundColor: '#2a2a2a', border: '4px solid #1a1a1a', fontSize: '18px' }}>
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="pb-1">
                <h2 className="text-lg font-bold text-white">{user?.fullName ?? 'Your Name'}</h2>
                <p className="text-sm" style={{ color: '#6b7280' }}>@{user?.username ?? 'username'}</p>
              </div>
            </div>
            <Link href="/settings">
              <button className="text-sm font-medium px-4 py-1.5 rounded-lg mb-1 hover:bg-white/5 transition-colors"
                style={{ border: '1px solid #3f3f3f', color: '#d1d5db' }}>
                Edit Profile
              </button>
            </Link>
          </div>

          {/* Bio */}
          {user?.bio && <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{user.bio}</p>}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs" style={{ color: '#6b7280' }}>
            {user?.university && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.university}</span>}
            {user?.country && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.country}</span>}
            {user?.githubUrl && (
              <a href={user.githubUrl.startsWith('http') ? user.githubUrl : `https://${user.githubUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors">
                <Github className="w-3.5 h-3.5" />GitHub
              </a>
            )}
            {user?.portfolioUrl && (
              <a href={user.portfolioUrl.startsWith('http') ? user.portfolioUrl : `https://${user.portfolioUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Portfolio
              </a>
            )}
            {user?.linkedinUrl && (
              <a href={user.linkedinUrl.startsWith('http') ? user.linkedinUrl : `https://linkedin.com/${user.linkedinUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors">
                <Linkedin className="w-3.5 h-3.5" />LinkedIn
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {user?.createdAt
                ? new Date(user.createdAt as any).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-5 text-sm">
            {[
              { label: 'Posts', value: user?._count?.posts ?? myPosts.length },
              { label: 'Rep', value: user?.reputation ?? 0 },
              { label: 'Badges', value: 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="font-bold text-white text-base">{value}</span>
                <span className="ml-1.5" style={{ color: '#6b7280' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          {user?.skills && user.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {user?.interests && user.interests.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#2d1f5e', color: '#a78bfa', border: '1px solid #4c3a8e' }}>
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Posts */}
      <div className="mx-auto" style={{ maxWidth: '760px' }}>
        <h3 className="text-lg font-bold text-white mb-4">My Posts</h3>
        <div className="space-y-4">
          {myPosts.length > 0
            ? myPosts.map((post) => <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />)
            : <div className="text-center py-12 text-sm" style={{ color: '#6b7280' }}>No posts yet.</div>}
        </div>
      </div>
    </div>
  );
}
