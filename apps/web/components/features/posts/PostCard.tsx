'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, Users, FileText, Share2 } from 'lucide-react';
import { useLikePost, useSavePost, useSharePost } from '@/lib/hooks/usePosts';
import type { Post } from '@/lib/hooks/usePosts';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { useToast } from '@/components/common/Toast';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  COLLABORATION_REQUEST:    { label: 'Collaboration', color: '#60a5fa' },
  HELP_REQUEST:             { label: 'Help Request',  color: '#fbbf24' },
  TESTING_REQUEST:          { label: 'Testing',       color: '#34d399' },
  OPEN_SOURCE_CONTRIBUTION: { label: 'Open Source',   color: '#a78bfa' },
  STARTUP_IDEA:             { label: 'Startup Idea',  color: '#fb923c' },
  TECHNICAL_DISCUSSION:     { label: 'Discussion',    color: '#f472b6' },
};

const STATUS_LABELS: Record<string, string> = {
  IDEATION: 'Idea', PLANNING: 'Planning', IN_PROGRESS: 'In Progress',
  BETA: 'Testing', COMPLETED: 'Launched',
};

function isImage(a: { type?: string; name?: string }) {
  if (a.type && a.type.startsWith('image/')) return true;
  if (a.name) return /\.(png|jpe?g|gif|webp|svg)$/i.test(a.name);
  return false;
}

export function Avatar({ name, avatarUrl, userId, size = 'sm', onClick }: {
  name: string; avatarUrl?: string; userId?: string; size?: 'sm' | 'md' | 'lg'; onClick?: (e: React.MouseEvent) => void;
}) {
  const dim = size === 'lg' ? 'w-12 h-12 text-sm' : size === 'md' ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-xs';
  const content = avatarUrl
    ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
    : <span>{name.slice(0, 2).toUpperCase()}</span>;

  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-semibold text-white overflow-hidden flex-shrink-0 ${userId ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      style={{ backgroundColor: '#2a2a2a' }}
      onClick={onClick}
    >
      {content}
    </div>
  );
}

export function PostCard({ post, href }: { post: Post; href: string }) {
  const router = useRouter();
  const type = TYPE_CONFIG[post.type] ?? TYPE_CONFIG.TECHNICAL_DISCUSSION;
  const statusLabel = STATUS_LABELS[post.status] ?? post.status;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];
  const imageAttachments = attachments.filter(isImage);
  const fileAttachments = attachments.filter((a) => !isImage(a));
  const likePost = useLikePost();
  const savePost = useSavePost();
  const sharePost = useSharePost();
  const toast = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    sharePost.mutate(post.id);
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.description, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copied to clipboard!');
    }
  };

  return (
    <div
      className="card block rounded-xl px-6 py-5 transition-colors w-full cursor-pointer"
      style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}
      onClick={() => router.push(href)}
    >

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={post.author.username}
            avatarUrl={post.author.avatarUrl}
            userId={post.author.id}
            onClick={(e) => { e.stopPropagation(); router.push(`/users/${post.author.id}`); }}
          />
          <div>
            <p className="text-sm font-semibold text-white">{post.author.username}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {new Date(post.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <span className="text-xs font-medium" style={{ color: type.color }}>{type.label}</span>
      </div>

      <h3 className="font-bold text-base text-white mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-sm line-clamp-2 mb-3" style={{ color: '#9ca3af' }}>{post.description}</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 5).map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: '#242424', color: '#d1d5db', border: '1px solid #2f2f2f' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-4 space-y-2">
          {imageAttachments.length > 0 && (
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {imageAttachments.map((a, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                  className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity w-full"
                  style={{ border: '1px solid #2f2f2f' }}
                >
                  <img src={a.url} alt={a.name} className="w-full object-cover" style={{ maxHeight: '160px' }} />
                </button>
              ))}
            </div>
          )}
          {fileAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fileAttachments.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}
                >
                  <FileText className="w-3 h-3" />{a.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={imageAttachments}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #242424' }}>
        <div className="flex items-center gap-4 text-sm" style={{ color: '#6b7280' }}>
          <button
            onClick={(e) => { e.preventDefault(); likePost.mutate(post.id); }}
            className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
            style={{ color: post.isLiked ? '#f87171' : '#6b7280' }}
          >
            <Heart className="w-4 h-4" fill={post.isLiked ? '#f87171' : 'none'} />
            {post._count?.likes ?? 0}
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />{post._count?.comments ?? 0}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); savePost.mutate(post.id); }}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: post.isSaved ? '#60a5fa' : '#6b7280' }}
          >
            <Bookmark className="w-4 h-4" fill={post.isSaved ? '#60a5fa' : 'none'} />
            {post._count?.savedBy ?? 0}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
            style={{ color: '#6b7280' }}
          >
            <Share2 className="w-4 h-4" />
            {post.shareCount ?? 0}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
          {post.teamSize && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{post.teamSize}</span>}
          <span className="px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: '#242424', color: '#9ca3af', border: '1px solid #2f2f2f' }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
