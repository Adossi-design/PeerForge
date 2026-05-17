'use client';

import React, { useState } from 'react';
import { FileText, Search, Trash2, ChevronLeft, ChevronRight, Heart, Eye, Share2, MessageCircle } from 'lucide-react';
import { useAdminPosts, useAdminDeletePost } from '@/lib/hooks/useAdmin';

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

  const { data, isLoading } = useAdminPosts(page * PAGE_SIZE, PAGE_SIZE, search);
  const deletePost = useAdminDeletePost();

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleDelete = (id: string) => {
    deletePost.mutate(id, { onSuccess: () => setConfirmDelete(null) });
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2d1f5e' }}>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Posts</h1>
            <p className="text-xs" style={{ color: '#6b7280' }}>{total.toLocaleString()} total posts</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#6b7280' }} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts…"
              className="pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', width: '200px' }}
            />
          </div>
          <button type="submit" className="px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #242424', backgroundColor: '#111111' }}>
                {['Post', 'Author', 'Type', 'Stats', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1f1f1f' }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: '#242424', width: j === 0 ? '200px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: '#6b7280' }}>No posts found.</td></tr>
              ) : (
                posts.map((p: any) => (
                  <tr key={p.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid #1f1f1f' }}>
                    <td className="px-4 py-3" style={{ maxWidth: '260px' }}>
                      <p className="font-medium text-white truncate">{p.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: '#2a2a2a' }}>
                          {p.authorAvatar
                            ? <img src={p.authorAvatar} alt="" className="w-full h-full object-cover" />
                            : (p.author ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>@{p.author}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${TYPE_COLORS[p.type] ?? '#6b7280'}18`, color: TYPE_COLORS[p.type] ?? '#6b7280' }}>
                        {TYPE_LABELS[p.type] ?? p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 text-xs" style={{ color: '#6b7280' }}>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{p.comments}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{p.shares}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {confirmDelete === p.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletePost.isPending}
                            className="text-xs px-2 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ backgroundColor: '#242424', color: '#9ca3af' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                          style={{ color: '#6b7280' }}
                        >
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #242424' }}>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ backgroundColor: '#242424', color: '#9ca3af' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs" style={{ color: '#9ca3af' }}>{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                style={{ backgroundColor: '#242424', color: '#9ca3af' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
