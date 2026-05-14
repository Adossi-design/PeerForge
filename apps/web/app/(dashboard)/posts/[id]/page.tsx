'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Users, Github, Send, Paperclip } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePost, usePostComments, useCreateComment, useLikePost, useSavePost } from '@/lib/hooks/usePosts';
import { Avatar } from '@/components/features/posts/PostCard';

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  COLLABORATION_REQUEST:    { label: 'Collaboration', color: '#60a5fa' },
  HELP_REQUEST:             { label: 'Help Request',  color: '#fbbf24' },
  OPEN_SOURCE_CONTRIBUTION: { label: 'Open Source',   color: '#a78bfa' },
  STARTUP_IDEA:             { label: 'Startup Idea',  color: '#fb923c' },
  TECHNICAL_DISCUSSION:     { label: 'Discussion',    color: '#f472b6' },
  TESTING_REQUEST:          { label: 'Testing',       color: '#34d399' },
};

const STATUS_LABELS: Record<string, string> = {
  IDEATION: 'Idea', PLANNING: 'Planning', IN_PROGRESS: 'In Progress', BETA: 'Testing', COMPLETED: 'Launched',
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [comment, setComment] = useState('');

  const { data: post, isLoading } = usePost(id);
  const { data: comments } = usePostComments(id);
  const createComment = useCreateComment();
  const likePost = useLikePost();
  const savePost = useSavePost();

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await createComment.mutateAsync({ content: comment, postId: id, userId: user?.id } as any);
    setComment('');
  };

  if (isLoading) return <div className="px-8 py-8"><div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} /></div>;
  if (!post) return <div className="px-8 py-8" style={{ color: '#6b7280' }}>Post not found.</div>;

  const type = TYPE_CONFIG[post.type] ?? TYPE_CONFIG.TECHNICAL_DISCUSSION;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const attachments = Array.isArray((post as any).attachments) ? (post as any).attachments : [];

  return (
    <div className="px-8 py-8 w-full" style={{ maxWidth: '800px' }}>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: '#6b7280' }}>
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      {/* Post */}
      <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
        {/* Author */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={post.author.username} avatarUrl={post.author.avatarUrl} userId={post.author.id}
              onClick={() => router.push(`/users/${post.author.id}`)} size="md" />
            <div>
              <p className="font-semibold text-sm text-white">{post.author.username}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>
                {new Date(post.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium" style={{ color: type.color }}>{type.label}</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-3">{post.title}</h1>
        <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: '#d1d5db' }}>{post.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#242424', color: '#9ca3af' }}>
            {STATUS_LABELS[post.status] ?? post.status}
          </span>
          {post.teamSize && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#242424', color: '#9ca3af' }}>
              <Users className="w-3 h-3" />{post.teamSize} people
            </span>
          )}
          {post.repositoryUrl && (
            <a href={post.repositoryUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#242424', color: '#9ca3af' }}>
              <Github className="w-3 h-3" />GitHub
            </a>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Attachments</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((a: any, i: number) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
                  <Paperclip className="w-3 h-3" />{a.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 text-sm" style={{ borderTop: '1px solid #242424', color: '#6b7280' }}>
          <button
            onClick={() => likePost.mutate(post.id)}
            className="flex items-center gap-1.5 transition-colors hover:text-red-400"
            style={{ color: post.isLiked ? '#f87171' : '#6b7280' }}
          >
            <Heart className="w-4 h-4" fill={post.isLiked ? '#f87171' : 'none'} />
            {post._count?.likes ?? 0}
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />{post._count?.comments ?? 0}
          </span>
          <button
            onClick={() => savePost.mutate(post.id)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: post.isSaved ? '#60a5fa' : '#6b7280' }}
          >
            <Bookmark className="w-4 h-4" fill={post.isSaved ? '#60a5fa' : 'none'} />
            {post.isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Comments ({comments?.length ?? 0})</h2>

        <form onSubmit={handleComment} className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 text-white"
            style={{ backgroundColor: '#2a2a2a' }}>
            {user?.firstName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              style={{ backgroundColor: '#161b22', border: '1px solid #2f2f2f', color: '#d1d5db' }}
            />
            <button
              type="submit"
              disabled={!comment.trim() || createComment.isPending}
              className="absolute bottom-3 right-3 flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
              style={{ backgroundColor: '#4f46e5' }}
            >
              <Send className="w-3 h-3" />Comment
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.author.username} avatarUrl={c.author.avatarUrl} userId={c.author.id}
                  onClick={() => router.push(`/users/${c.author.id}`)} />
                <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{c.author.username}</span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: '#d1d5db' }}>{c.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#6b7280' }}>No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
