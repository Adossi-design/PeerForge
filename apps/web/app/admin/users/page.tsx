'use client';

import React, { useState } from 'react';
import { Users, Search, Trash2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAdminUsers, useAdminDeleteUser } from '@/lib/hooks/useAdmin';

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers(page * PAGE_SIZE, PAGE_SIZE, search);
  const deleteUser = useAdminDeleteUser();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

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
            <h1 className="text-xl font-bold text-white">Users</h1>
            <p className="text-xs" style={{ color: '#6b7280' }}>{total.toLocaleString()} total users</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#6b7280' }} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users…"
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
                {['User', 'Email', 'Posts', 'Followers', 'Rep', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1f1f1f' }}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: '#242424', width: j === 0 ? '140px' : '60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#6b7280' }}>No users found.</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid #1f1f1f' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: '#2a2a2a' }}>
                          {u.avatarUrl
                            ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (u.username ?? 'U').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.fullName || u.username}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>@{u.username}</p>
                        </div>
                        {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#9ca3af' }}>{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
                        {u._count?.posts ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: '#9ca3af' }}>{u._count?.followers ?? 0}</td>
                    <td className="px-4 py-3 text-center text-xs" style={{ color: '#9ca3af' }}>{u.reputation}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {confirmDelete === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleteUser.isPending}
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
                          onClick={() => setConfirmDelete(u.id)}
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
