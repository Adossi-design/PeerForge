'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { usePost, usePostComments, useCreateComment } from '@/lib/hooks/usePosts';
import { ArrowLeft, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

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

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: post, isLoading: postLoading, error: postError } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = usePostComments(postId);
  const createCommentMutation = useCreateComment();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await createCommentMutation.mutateAsync({
        content: newComment,
        postId,
        userId: user?.id,
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-slate-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/">
            <button className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to feed
            </button>
          </Link>
          <div className="rounded-lg bg-red-50 border border-red-200 p-8 text-center">
            <p className="text-red-800 font-medium">Post not found</p>
            <p className="text-red-600 text-sm mt-2">The post you're looking for doesn't exist or has been deleted.</p>
          </div>
        </div>
      </div>
    );
  }

  const colors = POST_TYPE_COLORS[post.type] || POST_TYPE_COLORS.DISCUSSION;
  const statusColor = STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/">
          <button className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to feed
          </button>
        </Link>

        {/* Post Header */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm mb-6">
          {/* Author Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {post.author.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{post.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-600">
                  by <span className="font-medium">{post.author.username}</span>
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
                  {post.type.replace(/_/g, ' ')}
                </span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${statusColor}`}>
                  {post.status}
                </span>
              </div>
            </div>
            <button className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-slate-700 text-lg leading-relaxed">{post.description}</p>
          </div>

          {/* Tags */}
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-200">
            {post.teamSize && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Team Size</p>
                <p className="text-lg font-semibold text-slate-900">
                  👥 {post.teamSize} member{post.teamSize > 1 ? 's' : ''}
                </p>
              </div>
            )}
            {post.deadline && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Deadline</p>
                <p className="text-lg font-semibold text-slate-900">
                  📅 {new Date(post.deadline).toLocaleDateString()}
                </p>
              </div>
            )}
            {post.budget && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Budget</p>
                <p className="text-lg font-semibold text-slate-900">💰 {post.budget}</p>
              </div>
            )}
            {post.repositoryUrl && (
              <div>
                <p className="text-sm text-slate-600 mb-1">Repository</p>
                <a
                  href={post.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                >
                  View on GitHub →
                </a>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
            <button className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-red-50">
              <Heart className="w-5 h-5" />
              <span className="font-medium">{post._count?.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post._count?.comments || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors px-4 py-2 rounded-lg hover:bg-green-50">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Comments ({comments?.length || 0})</h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 rounded-lg bg-slate-50 border border-slate-200 p-4 text-center">
              <p className="text-slate-600 mb-2">Sign in to leave a comment</p>
              <Link href="/login">
                <button className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition-colors">
                  Sign In
                </button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {commentsLoading ? (
              <p className="text-slate-600 text-center py-8">Loading comments...</p>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {comment.author.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{comment.author.username}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <button className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-700">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
