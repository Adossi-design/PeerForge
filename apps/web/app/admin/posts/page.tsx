'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, ChevronLeft, ChevronRight, Heart, Eye, Share2, MessageCircle, X } from 'lucide-react';
import { useAdminPosts, useAdminDeletePost } from '@/lib/hooks/useAdmin';
import { useTheme } from '@/lib/context/ThemeContext';

const PAGE_SIZE = 20;

const TYPE_COLORS: Record<string, string> = {
  COLLABORATION_REQUEST: '#60a5fa',
  HELP_REQUEST: '#fbbf24',
  TESTING_REQUEST: '#34d399',
  OPEN_SOURCE_CONTRIBUTION: '#a78bfa',
  STARTUP_IDEA: '#fb923c',
  TECHNICAL_DISCUSSION: '#f472b6',
};

const TYPE_LABELS: Record<string, string> = {
  COLLABORATION_REQUEST: 'Collab',
  HELP_REQUEST: 'Help',
  TESTING_REQUEST: 'Testing',
  OPEN_SOURCE_CONTRIBUTION: 'Open Source',
  STARTUP_IDEA: 'Startup',
  TECHNICAL_DISCUSSION: 'Discussion',
};

export default function AdminPostsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const { theme } = useTheme();
  const isLight = theme === 'light';
  const textPri   = isLight ? '#111827' : '#ffffff';
  const textMuted = isLight ? '#6b7280' : '#9ca3af';
  const textFaint = isLight ? '#9ca3af' : '#6b7280';
  const cardBg    = isLight ? '#ffffff' : '#1a1a1a';
  const cardBdr   = isLight ? '#e5e7eb' : '#242424';
  const rowHover  = isLight ? '#eff6ff' : '#ffffff06';
  const headerBg  = isLight ? '#dbeafe' : '#0f1f3d';
  const headerBdr = isLight ? '#bfdbfe' : '#1e3a6e';

  const { data, isLoading } = useAdminPosts(page * PAGE_SIZE, PAGE_SIZE, search);
  const deletePost = useAdminDeletePost();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Live search debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = (id: string) => {
    deletePost.mutate(id, { onSuccess: () => { setConfirmDelete(null); setSelectedPost(null); } });
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: textPri }}>Posts</h1>
            <p className="text-xs" style={{ color: textFaint }}>{total.toLocaleString()} total posts</p>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#6b7280' }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts…"
            className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: isLight ? '#f9fafb' : '#1a1a1a', border: `1px solid ${cardBdr}`, color: textPri, width: '220px' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${headerBdr}`, backgroundColor: headerBg }}>
                {['Post', 'Author', 'Type', 'Stats', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: isLight ? '#1e40af' : '#93c5fd' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${cardBdr}` }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: isLight ? '#e5e7eb' : '#242424', width: j === 0 ? '200px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: textFaint }}>No posts found.</td></tr>
              ) : (
                posts.map((p: any) => (
                  <tr
                    key={p.id}
                    className="cursor-pointer transition-all duration-150"
                    style={{ borderBottom: `1px solid ${cardBdr}` }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = rowHover;
                      (e.currentTarget as HTMLTableRowElement).style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLTableRowElement).style.transform = 'translateX(0)';
                    }}
                    onClick={() => setSelectedPost(p)}
                  >
                    <td className="px-4 py-3" style={{ maxWidth: '260px' }}>
                      <p className="font-medium truncate" style={{ color: textPri }}>{p.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: '#4f46e5' }}>
                          {p.authorAvatar
                            ? <img src={p.authorAvatar} alt="" className="w-full h-full object-cover" />
                            : (p.author ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs" style={{ color: textMuted }}>@{p.author}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${TYPE_COLORS[p.type] ?? '#6b7280'}18`, color: TYPE_COLORS[p.type] ?? '#6b7280' }}>
                        {TYPE_LABELS[p.type] ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 text-xs" style={{ color: textFaint }}>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{p.comments}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{p.shares}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: textFaint }}>
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {confirmDelete === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleDelete(p.id)} disabled={deletePost.isPending}
                            className="text-xs px-2 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                            Confirm
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(p.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                          style={{ color: textFaint }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${cardBdr}` }}>
            <p className="text-xs" style={{ color: textFaint }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs" style={{ color: textMuted }}>{page + 1} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedPost(null)}>
          <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: textPri }}>Post Details</h3>
              <button onClick={() => setSelectedPost(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: textFaint }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-sm" style={{ color: textPri }}>{selectedPost.title}</p>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>by @{selectedPost.author}</p>
              </div>
              {selectedPost.description && (
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{selectedPost.description}</p>
              )}
              <div className="flex gap-3 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${TYPE_COLORS[selectedPost.type] ?? '#6b7280'}18`, color: TYPE_COLORS[selectedPost.type] ?? '#6b7280' }}>
                  {TYPE_LABELS[selectedPost.type] ?? selectedPost.type}
                </span>
                <span className="flex items-center gap-1" style={{ color: textFaint }}><Heart className="w-3 h-3" />{selectedPost.likes} likes</span>
                <span className="flex items-center gap-1" style={{ color: textFaint }}><MessageCircle className="w-3 h-3" />{selectedPost.comments} comments</span>
                <span className="flex items-center gap-1" style={{ color: textFaint }}><Eye className="w-3 h-3" />{selectedPost.views} views</span>
                <span className="flex items-center gap-1" style={{ color: textFaint }}><Share2 className="w-3 h-3" />{selectedPost.shares} shares</span>
              </div>
              <p className="text-xs" style={{ color: textFaint }}>
                Posted {new Date(selectedPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="pt-2 flex justify-end">
                {confirmDelete === selectedPost.id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(selectedPost.id)} disabled={deletePost.isPending}
                      className="text-xs px-3 py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                      Confirm Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(selectedPost.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
