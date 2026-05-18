'use client';

import React, { useState } from 'react';
import {
  Users, FileText, MessageSquare, Heart, Eye, Share2,
  TrendingUp, Activity, UserPlus, Zap, X,
  AlertTriangle, Flag, CheckCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAdminStats } from '@/lib/hooks/useAdmin';
import { useTheme } from '@/lib/context/ThemeContext';

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

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div
      className="card rounded-2xl p-5 transition-all duration-200 cursor-default"
      style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.borderColor = color + '55';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#242424';
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
    </div>
  );
}

type ModalType = { kind: 'post'; data: any } | { kind: 'user'; data: any } | null;

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [modal, setModal] = useState<ModalType>(null);

  const cardBg    = isLight ? '#ffffff' : '#1a1a1a';
  const cardBdr   = isLight ? '#e5e7eb' : '#242424';
  const textPri   = isLight ? '#111827' : '#ffffff';
  const textMuted = isLight ? '#6b7280' : '#9ca3af';
  const textFaint = isLight ? '#9ca3af' : '#6b7280';
  const tooltipBg = isLight ? '#ffffff' : '#1a1a1a';
  const tooltipBdr= isLight ? '#e5e7eb' : '#2f2f2f';
  const tooltipClr= isLight ? '#111827' : '#ffffff';
  const gridClr   = isLight ? '#f3f4f6' : '#1f1f1f';

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))}
        </div>
        <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
      </div>
    );
  }

  const { overview, activityChart, postsByType, topPosts, recentUsers, activeUsers } = data ?? {};

  const pieData = (postsByType ?? []).map((p: any) => ({
    name: TYPE_LABELS[p.type] ?? p.type,
    value: p.count,
    color: TYPE_COLORS[p.type] ?? '#6b7280',
  }));

  return (
    <div className="px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: textPri }}>Admin Dashboard</h1>
          <p className="text-xs" style={{ color: textFaint }}>Platform overview & analytics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users}         label="Total Users"     value={overview?.totalUsers ?? 0}          color="#60a5fa" />
        <StatCard icon={FileText}      label="Total Posts"     value={overview?.totalPosts ?? 0}          color="#a78bfa" />
        <StatCard icon={MessageSquare} label="Discussions"     value={overview?.totalDiscussions ?? 0}    color="#34d399" />
        <StatCard icon={Activity}      label="Messages"        value={overview?.totalMessages ?? 0}       color="#fbbf24" />
        <StatCard icon={Heart}         label="Comments"        value={overview?.totalComments ?? 0}       color="#f472b6" />
        <StatCard icon={TrendingUp}    label="Collaborations"  value={overview?.totalCollaborations ?? 0} color="#fb923c" />
      </div>

      {/* Additional Stats - Warnings & Reports */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={AlertTriangle} label="Users Warned"    value={overview?.warnedUsers ?? 0}         color="#f59e0b" />
        <StatCard icon={Flag}          label="Pending Reports" value={overview?.pendingReports ?? 0}      color="#ef4444" />
        <StatCard icon={CheckCircle}   label="Resolved"       value={overview?.resolvedReports ?? 0}     color="#22c55e" />
        <StatCard icon={X}             label="Dismissed"      value={overview?.dismissedReports ?? 0}    color="#6b7280" />
      </div>

      {/* Activity Chart + Pie */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: textPri }}>
            <Activity className="w-4 h-4 text-blue-400" />14-Day Activity
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityChart ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridClr} />
              <XAxis dataKey="date" tick={{ fill: textFaint, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: textFaint, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: '8px', color: tooltipClr, fontSize: '12px' }} cursor={{ stroke: tooltipBdr }} />
              <Area type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2} fill="url(#gUsers)" name="New Users" />
              <Area type="monotone" dataKey="posts" stroke="#a78bfa" strokeWidth={2} fill="url(#gPosts)" name="New Posts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: textPri }}>
            <FileText className="w-4 h-4 text-purple-400" />Post Types
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBdr}`, borderRadius: '8px', color: tooltipClr, fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: textMuted }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: textFaint }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Posts */}
        <div className="card rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: textPri }}>
            <TrendingUp className="w-4 h-4 text-blue-400" />Top Posts by Likes
          </h3>
          <div className="space-y-2">
            {(topPosts ?? []).length === 0 && <p className="text-sm" style={{ color: textFaint }}>No posts yet.</p>}
            {(topPosts ?? []).map((p: any, i: number) => (
              <div
                key={p.id}
                className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = isLight ? '#f5f3ff' : '#ffffff08';
                  (e.currentTarget as HTMLDivElement).style.borderColor = isLight ? '#ddd6fe' : '#2f2f2f';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
                }}
                onClick={() => setModal({ kind: 'post', data: p })}
              >
                <span className="text-xs font-bold w-5 flex-shrink-0 mt-0.5" style={{ color: textFaint }}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: textPri }}>{p.title}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: textFaint }}>
                    @{p.author} &nbsp;·&nbsp;
                    <Heart className="w-3 h-3 inline" /> {p.likes} &nbsp;·&nbsp;
                    <Eye className="w-3 h-3 inline" /> {p.views} &nbsp;·&nbsp;
                    <Share2 className="w-3 h-3 inline" /> {p.shares}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Users */}
        <div className="card rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: textPri }}>
            <UserPlus className="w-4 h-4 text-green-400" />Most Active Users
          </h3>
          <div className="space-y-2">
            {(activeUsers ?? []).length === 0 && <p className="text-sm" style={{ color: textFaint }}>No users yet.</p>}
            {(activeUsers ?? []).map((u: any) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
                style={{ border: '1px solid transparent' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = isLight ? '#f5f3ff' : '#ffffff08';
                  (e.currentTarget as HTMLDivElement).style.borderColor = isLight ? '#ddd6fe' : '#2f2f2f';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
                }}
                onClick={() => setModal({ kind: 'user', data: u })}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: '#4f46e5' }}>
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                    : (u.username ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: textPri }}>{u.fullName || u.username}</p>
                  <p className="text-xs" style={{ color: textFaint }}>@{u.username} · {u._count?.posts ?? 0} posts</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
                  {u.reputation} rep
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="card rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}>
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: textPri }}>
          <Users className="w-4 h-4 text-purple-400" />Recent Signups
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${cardBdr}` }}>
                {['User', 'Username', 'Joined', 'Rep'].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold" style={{ color: textFaint }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u: any) => (
                <tr
                  key={u.id}
                  className="cursor-pointer transition-all duration-150"
                  style={{ borderBottom: `1px solid ${cardBdr}` }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isLight ? '#f5f3ff' : '#ffffff06';
                    (e.currentTarget as HTMLTableRowElement).style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLTableRowElement).style.transform = 'translateX(0)';
                  }}
                  onClick={() => setModal({ kind: 'user', data: u })}
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: '#4f46e5' }}>
                        {u.avatarUrl
                          ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : (u.username ?? 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: textPri }}>{u.fullName || u.username}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4" style={{ color: textMuted }}>@{u.username}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: textFaint }}>
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
                      {u.reputation}
                    </span>
                  </td>
                </tr>
              ))}
              {(recentUsers ?? []).length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-sm" style={{ color: textFaint }}>No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
            style={{ backgroundColor: isLight ? '#ffffff' : '#1a1a1a', border: `1px solid ${isLight ? '#e5e7eb' : '#2f2f2f'}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: textPri }}>
                {modal.kind === 'post' ? 'Post Details' : 'User Profile'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: textFaint }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {modal.kind === 'post' && (
              <div className="space-y-3">
                <p className="font-semibold text-sm" style={{ color: textPri }}>{modal.data.title}</p>
                <p className="text-xs" style={{ color: textMuted }}>by @{modal.data.author}</p>
                <div className="flex gap-4 text-xs" style={{ color: textFaint }}>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{modal.data.likes} likes</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{modal.data.views} views</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{modal.data.shares} shares</span>
                </div>
                {modal.data.type && (
                  <span className="inline-block text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>
                    {TYPE_LABELS[modal.data.type] ?? modal.data.type}
                  </span>
                )}
              </div>
            )}

            {modal.kind === 'user' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: '#4f46e5' }}>
                    {modal.data.avatarUrl
                      ? <img src={modal.data.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : (modal.data.username ?? 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: textPri }}>{modal.data.fullName || modal.data.username}</p>
                    <p className="text-xs" style={{ color: textMuted }}>@{modal.data.username}</p>
                  </div>
                </div>
                {modal.data.bio && <p className="text-xs" style={{ color: textMuted }}>{modal.data.bio}</p>}
                {modal.data.email && <p className="text-xs" style={{ color: textFaint }}>{modal.data.email}</p>}
                <div className="flex gap-4 text-xs">
                  <span style={{ color: textFaint }}>{modal.data._count?.posts ?? 0} posts</span>
                  <span style={{ color: textFaint }}>{modal.data._count?.followers ?? 0} followers</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f', color: '#60a5fa' }}>{modal.data.reputation} rep</span>
                </div>
                {modal.data.createdAt && (
                  <p className="text-xs" style={{ color: textFaint }}>
                    Joined {new Date(modal.data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
