'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Github, Calendar, ExternalLink, Linkedin, MessageCircle, UserPlus, UserCheck, Flag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { PostCard } from '@/components/features/posts/PostCard';
import { useCurrentUser, useFollowCounts, useFollowStatus, useFollow } from '@/lib/hooks/useApi';
import { ReportModal } from '@/components/common/ReportModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/users/${id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('User not found');
      return res.json().then((d) => d.user ?? d);
    },
    enabled: !!id,
  });

  const { data: postsData } = useQuery({
    queryKey: ['user-posts', id],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/posts/user/${id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
      });
      if (!res.ok) return { posts: [] };
      return res.json();
    },
    enabled: !!id,
  });

  const user = userData;
  const posts = postsData?.posts ?? [];
  const { data: currentUser } = useCurrentUser();
  const { data: followCounts } = useFollowCounts(id as string);
  const { data: followStatus } = useFollowStatus(id as string);
  const followMutation = useFollow(id as string);
  const [showReport, setShowReport] = useState(false);
  const initials = user?.fullName
    ? user.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 3).toUpperCase()
    : 'U';

  if (isLoading) return (
    <div className="w-full px-4 sm:px-8 py-8">
      <div className="h-64 rounded-2xl animate-pulse mx-auto" style={{ backgroundColor: '#1a1a1a', maxWidth: '760px' }} />
    </div>
  );

  if (!user) return (
    <div className="w-full px-4 sm:px-8 py-8 text-center" style={{ color: '#6b7280' }}>User not found.</div>
  );

  return (
    <div className="w-full px-4 sm:px-8 py-8">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: '#6b7280' }}>
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      <div className="rounded-2xl overflow-hidden mb-8 mx-auto"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424', maxWidth: '760px' }}>

        <div style={{ height: '110px', background: 'linear-gradient(135deg, #3b1f6e 0%, #1a2a5e 50%, #0f3d3d 100%)' }} />

        <div className="px-6" style={{ marginTop: '-40px' }}>
          {/* Avatar (overlaps banner edge) + action buttons on the right */}
          <div className="flex items-end justify-between mb-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0"
              style={{ backgroundColor: '#2a2a2a', border: '4px solid var(--post-body-bg, #1a1a1a)', fontSize: '18px' }}>
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : initials}
            </div>
            {currentUser && currentUser.id !== user.id && (
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => followMutation.mutate()}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors hover:opacity-90"
                  style={followStatus?.following
                    ? { backgroundColor: '#242424', color: '#d1d5db', border: '1px solid #3f3f3f' }
                    : { backgroundColor: '#4f46e5', color: '#fff' }}
                >
                  {followStatus?.following
                    ? <><UserCheck className="w-4 h-4" />Following</>
                    : <><UserPlus className="w-4 h-4" />Follow</>}
                </button>
                <button
                  onClick={() => router.push(`/messages/${user.id}`)}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#1a1a1a', color: '#d1d5db', border: '1px solid #3f3f3f' }}
                >
                  <MessageCircle className="w-4 h-4" />Message
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:text-red-400"
                  style={{ backgroundColor: '#1a1a1a', color: '#6b7280', border: '1px solid #3f3f3f' }}
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Name + username — below the banner on the card body, readable in both modes */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">{user.fullName || user.username}</h2>
            <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>@{user.username}</p>
          </div>

          {user.bio && <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>{user.bio}</p>}

          <div className="flex flex-wrap gap-4 mb-4 text-xs" style={{ color: '#6b7280' }}>
            {user.university && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.university}</span>}
            {user.country && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{user.country}</span>}
            {user.githubUrl && (
              <a href={user.githubUrl.startsWith('http') ? user.githubUrl : `https://${user.githubUrl}`}
                target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <Github className="w-3.5 h-3.5" />GitHub
              </a>
            )}
            {user.portfolioUrl && (
              <a href={user.portfolioUrl.startsWith('http') ? user.portfolioUrl : `https://${user.portfolioUrl}`}
                target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Portfolio
              </a>
            )}
            {user.linkedinUrl && (
              <a href={user.linkedinUrl.startsWith('http') ? user.linkedinUrl : `https://linkedin.com/${user.linkedinUrl}`}
                target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                <Linkedin className="w-3.5 h-3.5" />LinkedIn
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
            </span>
          </div>

          <div className="flex gap-8 mb-5 text-sm">
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Followers', value: followCounts?.followers ?? 0 },
              { label: 'Following', value: followCounts?.following ?? 0 },
              { label: 'Reputation', value: user.reputation ?? 0, accent: true },
            ].map(({ label, value, accent }) => (
              <div key={label}>
                <span className="font-bold text-base" style={{ color: accent ? '#a78bfa' : '#ffffff' }}>{value}</span>
                <span className="ml-1.5" style={{ color: '#9ca3af' }}>{label}</span>
              </div>
            ))}
          </div>

          {user.skills?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s: string) => (
                  <span key={s} className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {user.interests?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((i: string) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#2d1f5e', color: '#a78bfa', border: '1px solid #4c3a8e' }}>{i}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: '760px' }}>
        <h3 className="text-lg font-bold text-white mb-4">Posts</h3>
        <div className="space-y-4">
          {posts.length > 0
            ? posts.map((post: any) => <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />)
            : <div className="text-center py-12 text-sm" style={{ color: '#6b7280' }}>No posts yet.</div>}
        </div>
      </div>

      {showReport && (
        <ReportModal
          targetType="USER"
          targetId={user.id}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
