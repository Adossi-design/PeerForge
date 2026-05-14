'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import type { Post } from '@/lib/hooks/usePosts';

interface PostsFeedProps {
  posts: Post[] | undefined;
  isLoading: boolean;
  error: any;
  selectedType: string | null;
}

const POST_TYPE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  COLLABORATION_REQUEST: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
  },
  HELP_REQUEST: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
  },
  OPEN_SOURCE: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  DISCUSSION: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800',
  },
};

const STATUS_COLORS: Record<string, string> = {
  IDEATION: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

export function PostsFeed({ posts, isLoading, error, selectedType }: PostsFeedProps) {
  const filteredPosts = selectedType
    ? posts?.filter((p) => p.type === selectedType)
    : posts;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 rounded-lg bg-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-800 font-medium">Failed to load posts</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-12 text-center">
        <p className="text-slate-600 font-medium">No posts found</p>
        <p className="text-slate-500 text-sm mt-1">
          {selectedType
            ? `No ${selectedType.replace(/_/g, ' ').toLowerCase()} posts yet`
            : 'Be the first to post something!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => {
        const colors = POST_TYPE_COLORS[post.type] || POST_TYPE_COLORS.DISCUSSION;
        const statusColor = STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-800';

        return (
          <Link
            key={post.id}
            href={`/dashboard/posts/${post.id}`}
            className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Author Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {post.author.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>

                {/* Title and Meta */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 break-words">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-slate-600">
                      by <span className="font-medium">{post.author.username}</span>
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
                      {post.type.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save/Bookmark */}
              <button className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 transition-colors" onClick={(e) => e.preventDefault()}>
                <Bookmark className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-700 mb-4 line-clamp-3">{post.description}</p>

            {/* Tags */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap">
                {post.tags.slice(0, 5).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 5 && (
                  <span className="text-xs text-slate-600 px-2 py-1">
                    +{post.tags.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Footer - Team Size and Meta */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                {post.teamSize && (
                  <span className="flex items-center gap-1">
                    👥 {post.teamSize} team member{post.teamSize > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition-colors" onClick={(e) => e.preventDefault()}>
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post._count?.likes || 0}</span>
                </button>
                <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors" onClick={(e) => e.preventDefault()}>
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post._count?.comments || 0}</span>
                </button>
                <button className="flex items-center gap-1 text-slate-600 hover:text-green-600 transition-colors" onClick={(e) => e.preventDefault()}>
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
