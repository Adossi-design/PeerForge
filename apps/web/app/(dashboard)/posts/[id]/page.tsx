'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Users, Github, Send, FileText, Share2, Trash2, Flag } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePost, usePostComments, useCreateComment, useLikePost, useSavePost, useDeleteComment } from '@/lib/hooks/usePosts';
import { useCurrentUser } from '@/lib/hooks/useApi';
import { Avatar } from '@/components/features/posts/PostCard';
import { CollaborateButton, CollaboratorsPanel } from '@/components/features/posts/CollaborateButton';
import { useToast } from '@/components/common/Toast';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { PostImageGallery } from '@/components/features/posts/PostImageGallery';
import { ReportModal } from '@/components/common/ReportModal';

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

function isImage(a: { type?: string; name?: string }) {
  if (a.type && a.type.startsWith('image/')) return true;
  if (a.name) return /\.(png|jpe?g|gif|webp|svg)$/i.test(a.name);
  return false;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [comment, setComment] = useState('');

  const { data: post, isLoading } = usePost(id);
  const { data: comments } = usePostComments(id);
  const { data: currentUser } = useCurrentUser();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const likePost = useLikePost();
  const savePost = useSavePost();
  const toast = useToast();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'POST' | 'COMMENT'; id: string } | null>(null);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await createComment.mutateAsync({ content: comment, postId: id });
      setComment('');
      toast('Comment posted!');
    } catch {
      toast('Failed to post comment.', 'error');
    }
  };

  if (isLoading) return <div className="px-8 py-8"><div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} /></div>;
  if (!post) return <div className="px-8 py-8" style={{ color: '#6b7280' }}>Post not found.</div>;

  const type = TYPE_CONFIG[post.type] ?? TYPE_CONFIG.TECHNICAL_DISCUSSION;
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];
  const imageAttachments = attachments.filter(isImage);
  const fileAttachments = attachments.filter((a) => !isImage(a));

  return (
    <div className="px-4 sm:px-8 py-8 w-full mx-auto" style={{ maxWidth: '860px' }}>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-white"
        style={{ color: '#6b7280' }}>
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      {/* Post */}
      <div className="card rounded-2xl mb-6 overflow-hidden" style={{ backgroundColor: 'var(--post-body-bg)', border: '1px solid var(--post-border)' }}>
        {/* Author (header section) — distinct background */}
        <div
          className="flex items-start justify-between px-6 py-4"
          style={{ backgroundColor: 'var(--post-header-bg)', borderBottom: '1px solid var(--post-border)' }}
        >
          <div className="flex items-center gap-3">
            <Avatar name={post.author.username} avatarUrl={post.author.avatarUrl} userId={post.author.id}
              onClick={() => router.push(`/users/${post.author.id}`)} size="md" />
            <div>
              <p className="font-semibold text-sm text-white">{post.author.username}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                {new Date(post.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium" style={{ color: type.color }}>{type.label}</span>
        </div>

        {/* Body section — title + description + attachments + tags */}
        <div className="px-6 py-5" style={{ backgroundColor: 'var(--post-body-bg)' }}>
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
            {imageAttachments.length > 0 && (
              <div className="mb-2">
                <PostImageGallery images={imageAttachments} onOpen={setLightboxIndex} rounded="xl" />
              </div>
            )}
            {fileAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {fileAttachments.map((a: any, i: number) => (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
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

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer / interaction bar — distinct background, independent region */}
        <div
          className="flex items-center gap-4 px-6 py-3 text-sm"
          style={{ backgroundColor: 'var(--post-footer-bg)', borderTop: '1px solid var(--post-border)', color: '#9ca3af' }}
        >
          <button
            type="button"
            onClick={() => likePost.mutate(post.id)}
            className="flex items-center gap-1.5 transition-colors hover:text-red-400"
            style={{ color: post.isLiked ? '#f87171' : '#9ca3af' }}
            aria-label="Like"
          >
            <Heart className="w-4 h-4" fill={post.isLiked ? '#f87171' : 'none'} />
            {post._count?.likes ?? 0}
          </button>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />{post._count?.comments ?? 0}
          </span>
          <button
            type="button"
            onClick={() => savePost.mutate(post.id)}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: post.isSaved ? '#60a5fa' : '#9ca3af' }}
            aria-label="Save"
          >
            <Bookmark className="w-4 h-4" fill={post.isSaved ? '#60a5fa' : 'none'} />
            {post._count?.savedBy ?? 0}
          </button>
          <CollaborateButton postId={post.id} postAuthorId={post.author.id} />
          <button
            type="button"
            onClick={async () => {
              const url = `${window.location.origin}/posts/${post.id}`;
              if (navigator.share) {
                try { await navigator.share({ title: post.title, text: post.description, url }); } catch {}
              } else {
                await navigator.clipboard.writeText(url);
                toast('Link copied to clipboard!');
              }
            }}
            className="flex items-center gap-1.5 transition-colors hover:text-white ml-auto"
            style={{ color: '#9ca3af' }}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />Share
          </button>
          {currentUser && currentUser.id !== post.author.id && (
            <button
              type="button"
              onClick={() => setReportTarget({ type: 'POST', id: post.id })}
              className="flex items-center gap-1.5 transition-colors hover:text-red-400"
              style={{ color: '#9ca3af' }}
              aria-label="Report"
            >
              <Flag className="w-4 h-4" />Report
            </button>
          )}
        </div>
      </div>

      <CollaboratorsPanel postId={post.id} isAuthor={currentUser?.id === post.author.id} />

      {/* Comments — its own distinct card with own background */}
      <div
        className="card rounded-2xl px-5 py-5"
        style={{ backgroundColor: 'var(--post-comment-bg)', border: '1px solid var(--post-border-subtle)' }}
      >
        <h2 className="text-lg font-bold text-white mb-4">Comments ({comments?.length ?? 0})</h2>

        <form onSubmit={handleComment} className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 text-white"
            style={{ backgroundColor: '#4f46e5' }}>
            {user?.firstName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              style={{ backgroundColor: 'var(--post-comment-item-bg)', border: '1px solid var(--post-border)', color: '#d1d5db' }}
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
                <div className="flex-1 rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--post-comment-item-bg)', border: '1px solid var(--post-border-subtle)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{c.author.username}</span>
                      <span className="text-xs" style={{ color: '#9ca3af' }}>
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {currentUser?.id === c.author.id ? (
                      <button
                        onClick={() => deleteComment.mutate({ commentId: c.id, postId: id })}
                        className="transition-colors hover:text-red-400"
                        style={{ color: '#9ca3af' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : currentUser ? (
                      <button
                        onClick={() => setReportTarget({ type: 'COMMENT', id: c.id })}
                        className="transition-colors hover:text-red-400"
                        style={{ color: '#9ca3af' }}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <p className="text-sm" style={{ color: '#d1d5db' }}>{c.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center py-8" style={{ color: '#9ca3af' }}>No comments yet. Be the first!</p>
          )}
        </div>
      </div>

      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
