'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, Users, FileText, Share2, Send, Trash2, UserPlus, UserCheck, X } from 'lucide-react';
import {
  useLikePost,
  useSavePost,
  useSharePost,
  usePostComments,
  useCreateComment,
  useDeleteComment,
  usePostLikers,
} from '@/lib/hooks/usePosts';
import type { Post } from '@/lib/hooks/usePosts';
import { useCurrentUser, useFollow, useFollowStatus } from '@/lib/hooks/useApi';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { PostImageGallery } from '@/components/features/posts/PostImageGallery';
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
      style={{ backgroundColor: avatarUrl ? '#2a2a2a' : '#4f46e5' }}
      onClick={onClick}
    >
      {content}
    </div>
  );
}

/** Large icon-only action button used in the post footer row. */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  activeColor = '#a78bfa',
}: {
  icon: React.ComponentType<{ className?: string; fill?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center py-2.5 transition-colors hover:bg-white/[0.05]"
      style={{ color: active ? activeColor : '#9ca3af' }}
    >
      <Icon className="w-5 h-5" fill={active ? activeColor : 'none'} />
    </button>
  );
}

/** Modal listing users who liked the post. */
function LikersModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const router = useRouter();
  const { data: likers, isLoading } = usePostLikers(postId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="card rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--post-body-bg)',
          border: '1px solid var(--post-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--post-border)' }}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: '#f87171' }} fill="#f87171" />
            Liked by
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:opacity-80 transition-opacity"
            style={{ color: '#9ca3af' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-3 py-2">
          {isLoading ? (
            <p className="text-xs px-2 py-3" style={{ color: '#9ca3af' }}>Loading…</p>
          ) : !likers || likers.length === 0 ? (
            <p className="text-xs px-2 py-3" style={{ color: '#9ca3af' }}>No likes yet.</p>
          ) : (
            likers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onClose(); router.push(`/users/${u.id}`); }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
              >
                <Avatar name={u.username} avatarUrl={u.avatarUrl ?? undefined} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.fullName || u.username}</p>
                  <p className="text-xs truncate" style={{ color: '#9ca3af' }}>@{u.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Inline comment panel — loads + creates comments without leaving the feed. */
function InlineComments({ postId }: { postId: string }) {
  const router = useRouter();
  const { data: comments, isLoading } = usePostComments(postId);
  const { data: currentUser } = useCurrentUser();
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [text, setText] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await createComment.mutateAsync({ content: text.trim(), postId });
      setText('');
    } catch {
      toast('Failed to post comment.', 'error');
    }
  };

  return (
    <div
      className="px-5 py-4 space-y-3"
      style={{
        backgroundColor: 'var(--post-comment-bg)',
        borderTop: '1px solid var(--post-border)',
      }}
    >
      {currentUser && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-start">
          <Avatar name={currentUser.fullName || currentUser.username} avatarUrl={currentUser.avatarUrl} />
          <div className="flex-1 relative">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--post-comment-item-bg)',
                border: '1px solid var(--post-border-subtle)',
                color: '#d1d5db',
              }}
            />
            <button
              type="submit"
              disabled={!text.trim() || createComment.isPending}
              aria-label="Send comment"
              className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: '#4f46e5', color: '#fff' }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-xs" style={{ color: '#9ca3af' }}>Loading comments…</p>
      ) : !comments || comments.length === 0 ? (
        <p className="text-xs" style={{ color: '#9ca3af' }}>No comments yet. Be the first.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex gap-2 items-start">
            <Avatar
              name={c.author.username}
              avatarUrl={c.author.avatarUrl}
              userId={c.author.id}
              onClick={(e) => { e.stopPropagation(); router.push(`/users/${c.author.id}`); }}
            />
            <div
              className="flex-1 rounded-2xl px-3 py-2 min-w-0"
              style={{
                backgroundColor: 'var(--post-comment-item-bg)',
                border: '1px solid var(--post-border-subtle)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white truncate">{c.author.username}</span>
                  <span className="text-[11px] flex-shrink-0" style={{ color: '#9ca3af' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {currentUser?.id === c.author.id && (
                  <button
                    type="button"
                    onClick={() => deleteComment.mutate({ commentId: c.id, postId })}
                    className="transition-colors hover:text-red-400 flex-shrink-0"
                    style={{ color: '#9ca3af' }}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm mt-0.5 break-words" style={{ color: '#d1d5db' }}>{c.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function PostCard({ post }: { post: Post; href?: string }) {
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likersOpen, setLikersOpen] = useState(false);

  // Follow state for the post author. Only show when viewing someone else's post.
  const { data: currentUser } = useCurrentUser();
  const isOwnPost = currentUser?.id === post.author.id;
  const { data: followStatus } = useFollowStatus(isOwnPost ? '' : post.author.id);
  const followMutation = useFollow(post.author.id);

  const handleShare = async () => {
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
      className="card rounded-xl w-full overflow-hidden"
      style={{ backgroundColor: 'var(--post-body-bg)', border: '1px solid var(--post-border)' }}
    >
      {/* Header section */}
      <div
        className="post-card-header flex items-start justify-between px-5 py-3 gap-3"
        style={{ backgroundColor: 'var(--post-header-bg)', borderBottom: '1px solid var(--post-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={post.author.username}
            avatarUrl={post.author.avatarUrl}
            userId={post.author.id}
            onClick={(e) => { e.stopPropagation(); router.push(`/users/${post.author.id}`); }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{post.author.username}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              {new Date(post.createdAt ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {!isOwnPost && currentUser && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); followMutation.mutate(); }}
              disabled={followMutation.isPending}
              aria-label={followStatus?.following ? 'Unfollow' : 'Follow'}
              className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 bg-transparent border-0 px-0"
              style={{ color: followStatus?.following ? '#9ca3af' : '#60a5fa' }}
            >
              {followStatus?.following
                ? (<><UserCheck className="w-4 h-4" />Following</>)
                : (<><UserPlus className="w-4 h-4" />Follow</>)}
            </button>
          )}
          <span className="text-xs font-medium" style={{ color: type.color }}>{type.label}</span>
        </div>
      </div>

      {/* Body — title + description + attachments. No click navigation. */}
      <div
        className="post-card-body px-5 py-4"
        style={{ backgroundColor: 'var(--post-body-bg)' }}
      >
        <h3 className="font-bold text-base text-white mb-2">{post.title}</h3>
        <p className="text-sm mb-3 whitespace-pre-wrap" style={{ color: '#9ca3af' }}>{post.description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#242424', color: '#d1d5db', border: '1px solid #2f2f2f' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Status + team size — moved out of the footer to keep the footer
            focused on engagement/actions like LinkedIn. */}
        {(post.teamSize || statusLabel) && (
          <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: '#9ca3af' }}>
            {post.teamSize && (
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{post.teamSize}</span>
            )}
            <span className="px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: '#242424', color: '#d1d5db', border: '1px solid #2f2f2f' }}>
              {statusLabel}
            </span>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-2">
            {imageAttachments.length > 0 && (
              <PostImageGallery images={imageAttachments} onOpen={setLightboxIndex} />
            )}
            {fileAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {fileAttachments.map((a, i) => (
                  <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
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
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={imageAttachments}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNav={setLightboxIndex}
        />
      )}

      {/* Engagement summary row — avatars + count on left, comments + shares on right.
          Hidden entirely when nothing has happened yet. */}
      {((post._count?.likes ?? 0) > 0 || (post._count?.comments ?? 0) > 0 || (post.shareCount ?? 0) > 0) && (
        <div
          className="flex items-center justify-between px-5 py-2 text-xs"
          style={{
            backgroundColor: 'var(--post-footer-bg)',
            borderTop: '1px solid var(--post-border)',
            color: '#9ca3af',
          }}
        >
          {/* Left: likers avatar stack + count */}
          {(post._count?.likes ?? 0) > 0 ? (
            <button
              type="button"
              onClick={() => setLikersOpen(true)}
              className="flex items-center gap-2 hover:underline transition-colors"
              aria-label="See who liked this post"
            >
              {post.topLikers && post.topLikers.length > 0 && (
                <span className="flex -space-x-1.5 items-center">
                  {post.topLikers.slice(0, 3).map((u) => (
                    <span
                      key={u.id}
                      className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: u.avatarUrl ? '#2a2a2a' : '#4f46e5',
                        border: '2px solid var(--post-footer-bg)',
                      }}
                      title={u.fullName || u.username}
                    >
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                        : u.username.slice(0, 1).toUpperCase()}
                    </span>
                  ))}
                </span>
              )}
              <span>{post._count?.likes ?? 0}</span>
            </button>
          ) : <span />}

          {/* Right: comments + shares */}
          <div className="flex items-center gap-3">
            {(post._count?.comments ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => setCommentsOpen((v) => !v)}
                className="hover:underline transition-colors"
              >
                {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
              </button>
            )}
            {(post.shareCount ?? 0) > 0 && (
              <span>{post.shareCount} {post.shareCount === 1 ? 'share' : 'shares'}</span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons row — large icons, no counts, evenly distributed. */}
      <div
        className="post-card-footer grid grid-cols-4"
        style={{ backgroundColor: 'var(--post-footer-bg)', borderTop: '1px solid var(--post-border)' }}
      >
        <ActionButton
          icon={Heart}
          label="Like"
          active={post.isLiked}
          activeColor="#f87171"
          onClick={() => likePost.mutate(post.id)}
        />
        <ActionButton
          icon={MessageCircle}
          label="Comment"
          active={commentsOpen}
          activeColor="#a78bfa"
          onClick={() => setCommentsOpen((v) => !v)}
        />
        <ActionButton
          icon={Share2}
          label="Share"
          onClick={handleShare}
        />
        <ActionButton
          icon={Bookmark}
          label="Save"
          active={post.isSaved}
          activeColor="#60a5fa"
          onClick={() => savePost.mutate(post.id)}
        />
      </div>

      {/* Inline comment panel — opens below the footer, no navigation */}
      {commentsOpen && <InlineComments postId={post.id} />}

      {/* Likers list modal */}
      {likersOpen && <LikersModal postId={post.id} onClose={() => setLikersOpen(false)} />}
    </div>
  );
}
