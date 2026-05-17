'use client';

import React from 'react';
import {
  Users, FileText, MessageSquare, Heart, Eye, Share2,
  TrendingUp, Activity, UserPlus, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAdminStats } from '@/lib/hooks/useAdmin';

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

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="card rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();

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
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xs" style={{ color: '#6b7280' }}>Platform overview & analytics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users}        label="Total Users"        value={overview?.totalUsers ?? 0}         color="#60a5fa" />
        <StatCard icon={FileText}     label="Total Posts"        value={overview?.totalPosts ?? 0}         color="#a78bfa" />
        <StatCard icon={MessageSquare}label="Discussions"        value={overview?.totalDiscussions ?? 0}   color="#34d399" />
        <StatCard icon={Activity}     label="Messages"           value={overview?.totalMessages ?? 0}      color="#fbbf24" />
        <StatCard icon={Heart}        label="Comments"           value={overview?.totalComments ?? 0}      color="#f472b6" />
        <StatCard icon={TrendingUp}   label="Collaborations"     value={overview?.totalCollaborations ?? 0} color="#fb923c" />
      </div>

      {/* Activity Chart + Pie */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="card lg:col-span-2 rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            14-Day Activity
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                cursor={{ stroke: '#2f2f2f' }}
              />
              <Area type="monotone" dataKey="users" stroke="#60a5fa" strokeWidth={2} fill="url(#gUsers)" name="New Users" />
              <Area type="monotone" dataKey="posts" stroke="#a78bfa" strokeWidth={2} fill="url(#gPosts)" name="New Posts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            Post Types
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: '#6b7280' }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Posts */}
        <div className="card rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Top Posts by Likes
          </h3>
          <div className="space-y-3">
            {(topPosts ?? []).length === 0 && (
              <p className="text-sm" style={{ color: '#6b7280' }}>No posts yet.</p>
            )}
            {(topPosts ?? []).map((p: any, i: number) => (
              <div key={p.id} className="flex items-start gap-3">
                <span className="text-xs font-bold w-5 flex-shrink-0 mt-0.5" style={{ color: '#6b7280' }}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
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
        <div className="card rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-green-400" />
            Most Active Users
          </h3>
          <div className="space-y-3">
            {(activeUsers ?? []).length === 0 && (
              <p className="text-sm" style={{ color: '#6b7280' }}>No users yet.</p>
            )}
            {(activeUsers ?? []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: '#2a2a2a' }}>
                  {u.avatarUrl
                    ? <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                    : (u.username ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.fullName || u.username}</p>
                  <p className="text-xs" style={{ color: '#6b7280' }}>@{u.username} · {u._count?.posts ?? 0} posts</p>
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
      <div className="card rounded-2xl p-5" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Recent Signups
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #242424' }}>
                {['User', 'Username', 'Joined', 'Rep'].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u: any) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: '#2a2a2a' }}>
                        {u.avatarUrl
                          ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : (u.username ?? 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{u.fullName || u.username}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4" style={{ color: '#9ca3af' }}>@{u.username}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: '#6b7280' }}>
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
                <tr><td colSpan={4} className="py-4 text-center text-sm" style={{ color: '#6b7280' }}>No users yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
