'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, ChevronLeft, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { useAdminUsers, useAdminDeleteUser } from '@/lib/hooks/useAdmin';
import { useTheme } from '@/lib/context/ThemeContext';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const { theme } = useTheme();
  const isLight = theme === 'light';
  const textPri   = isLight ? '#111827' : '#ffffff';
  const textMuted = isLight ? '#6b7280' : '#9ca3af';
  const textFaint = isLight ? '#9ca3af' : '#6b7280';
  const cardBg    = isLight ? '#ffffff' : '#1a1a1a';
  const cardBdr   = isLight ? '#e5e7eb' : '#242424';
  const rowHover  = isLight ? '#f5f3ff' : '#ffffff06';

  const { data, isLoading } = useAdminUsers(page * PAGE_SIZE, PAGE_SIZE, search);
  const deleteUser = useAdminDeleteUser();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Live search — debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = (id: string) => {
    deleteUser.mutate(id, { onSuccess: () => setConfirmDelete(null) });
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: textPri }}>Users</h1>
            <p className="text-xs" style={{ color: textFaint }}>{total.toLocaleString()} total users</p>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#6b7280' }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users…"
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
              <tr style={{ borderBottom: `1px solid ${cardBdr}`, backgroundColor: isLight ? '#f9fafb' : '#111111' }}>
                {['User', 'Email', 'Posts', 'Followers', 'Rep', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: textFaint }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${cardBdr}` }}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: isLight ? '#e5e7eb' : '#242424', width: j === 0 ? '140px' : '60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: textFaint }}>No users found.</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr
                    key={u.id}
                    className="transition-all duration-150 cursor-pointer"
                    style={{ borderBottom: `1px solid ${cardBdr}` }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = rowHover;
                      (e.currentTarget as HTMLTableRowElement).style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                      (e.currentTarget as HTMLTableRowElement).style.transform = 'translateX(0)';
                    }}
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: '#4f46e5' }}>
                          {u.avatarUrl
                            ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (u.username ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: textPri }}>{u.fullName || u.username}</p>
                          <p className="text-xs" style={{ color: textFaint }}>@{u.username}</p>
                        </div>
                        {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: textMuted }}>{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
                        {u._count?.posts ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: textMuted }}>{u._count?.followers ?? 0}</td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: textMuted }}>{u.reputation}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: textFaint }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {confirmDelete === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleteUser.isPending}
                            className="text-xs px-2 py-1 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                          >Confirm</button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(u.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                          style={{ color: textFaint }}
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

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedUser(null)}>
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: textPri }}>User Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: textFaint }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: '#4f46e5' }}>
                  {selectedUser.avatarUrl
                    ? <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : (selectedUser.username ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: textPri }}>{selectedUser.fullName || selectedUser.username}</p>
                  <p className="text-xs" style={{ color: textMuted }}>@{selectedUser.username}</p>
                  {selectedUser.isVerified && (
                    <span className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3" />Verified
                    </span>
                  )}
                </div>
              </div>
              {selectedUser.bio && <p className="text-sm" style={{ color: textMuted }}>{selectedUser.bio}</p>}
              <p className="text-xs" style={{ color: textFaint }}>{selectedUser.email}</p>
              <div className="flex gap-4 text-xs flex-wrap">
                <span style={{ color: textFaint }}>{selectedUser._count?.posts ?? 0} posts</span>
                <span style={{ color: textFaint }}>{selectedUser._count?.followers ?? 0} followers</span>
                <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
                  {selectedUser.reputation} rep
                </span>
              </div>
              {selectedUser.university && <p className="text-xs" style={{ color: textFaint }}>🎓 {selectedUser.university}</p>}
              {selectedUser.country && <p className="text-xs" style={{ color: textFaint }}>📍 {selectedUser.country}</p>}
              <p className="text-xs" style={{ color: textFaint }}>
                Joined {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
