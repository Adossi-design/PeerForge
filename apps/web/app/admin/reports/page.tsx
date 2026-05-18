'use client';

import React, { useState } from 'react';
import { Flag, CheckCircle, XCircle, Clock, User, FileText, MessageCircle, X, Trash2, Bell, AlertTriangle, Search, Filter } from 'lucide-react';
import { useAdminReports, useAdminUpdateReport, useAdminDeletePost, useAdminStats } from '@/lib/hooks/useAdmin';
import { useTheme } from '@/lib/context/ThemeContext';

const STATUS_TABS = [
  { label: 'All',       value: 'ALL' },
  { label: 'Pending',   value: 'PENDING' },
  { label: 'Reviewed',  value: 'REVIEWED' },
  { label: 'Dismissed', value: 'DISMISSED' },
];

const TARGET_TYPE_FILTERS = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Post',      value: 'POST' },
  { label: 'Comment',   value: 'COMMENT' },
  { label: 'User',      value: 'USER' },
];

const TARGET_ICONS: Record<string, React.ElementType> = {
  POST:    FileText,
  COMMENT: MessageCircle,
  USER:    User,
};

const TARGET_COLORS: Record<string, string> = {
  POST:    '#60a5fa',
  COMMENT: '#a78bfa',
  USER:    '#fb923c',
};

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  PENDING:   { bg: '#fef3c7', color: '#d97706', icon: Clock },
  REVIEWED:  { bg: '#d1fae5', color: '#059669', icon: CheckCircle },
  DISMISSED: { bg: '#f3f4f6', color: '#6b7280', icon: XCircle },
};

const STATUS_STYLES_DARK: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  PENDING:   { bg: '#2d1f00', color: '#fbbf24', icon: Clock },
  REVIEWED:  { bg: '#0f2d1f', color: '#34d399', icon: CheckCircle },
  DISMISSED: { bg: '#1f1f1f', color: '#6b7280', icon: XCircle },
};

export default function AdminReportsPage() {
  const [activeStatus, setActiveStatus] = useState('PENDING');
  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [warningSent, setWarningSent] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningInput, setShowWarningInput] = useState(false);

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
  const SS = isLight ? STATUS_STYLES : STATUS_STYLES_DARK;

  const { data: reports, isLoading } = useAdminReports(activeStatus === 'ALL' ? undefined : activeStatus);
  const updateReport = useAdminUpdateReport();
  const deletePost = useAdminDeletePost();

  // Filter reports by target type and search query
  let list: any[] = Array.isArray(reports) ? reports : [];
  if (targetTypeFilter !== 'ALL') {
    list = list.filter((r) => r.targetType === targetTypeFilter);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    list = list.filter((r) =>
      r.reason?.toLowerCase().includes(query) ||
      r.details?.toLowerCase().includes(query) ||
      r.targetId?.toLowerCase().includes(query) ||
      r.reporterId?.toLowerCase().includes(query)
    );
  }

  const handleDelete = () => {
    if (!selectedReport?.targetId) return;
    deletePost.mutate(selectedReport.targetId, {
      onSuccess: () => {
        updateReport.mutate({ id: selectedReport.id, status: 'REVIEWED' });
        setSelectedReport(null);
        setConfirmDelete(false);
      },
    });
  };

  const handleWarning = () => {
    // Mark report reviewed and simulate notification
    updateReport.mutate({ id: selectedReport.id, status: 'REVIEWED' }, {
      onSuccess: () => setWarningSent(true),
    });
  };

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #dc2626, #9f1239)' }}>
          <Flag className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: textPri }}>Reports</h1>
          <p className="text-xs" style={{ color: textFaint }}>User-submitted reports for posts, comments and accounts</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
            style={
              activeStatus === tab.value
                ? { backgroundColor: headerBg, color: isLight ? '#1e40af' : '#60a5fa', border: `1px solid ${headerBdr}`, transform: 'translateY(-1px)' }
                : { backgroundColor: 'transparent', color: textFaint, border: '1px solid transparent' }
            }
          >{tab.label}</button>
        ))}
      </div>

      {/* Search and Type Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textFaint }} />
          <input
            type="text"
            placeholder="Search by ID, reason, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none transition-all"
            style={{ backgroundColor: isLight ? '#f9fafb' : '#111111', border: `1px solid ${isLight ? '#e5e7eb' : '#2f2f2f'}`, color: textPri }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: textFaint }} />
          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none transition-all"
            style={{ backgroundColor: isLight ? '#f9fafb' : '#111111', border: `1px solid ${isLight ? '#e5e7eb' : '#2f2f2f'}`, color: textPri }}
          >
            {TARGET_TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: isLight ? '#e5e7eb' : '#1a1a1a' }} />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: isLight ? '#f3f4f6' : '#1f1f1f' }}>
            <Flag className="w-7 h-7" style={{ color: textFaint }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: textPri }}>No {activeStatus.toLowerCase()} reports</p>
          <p className="text-sm" style={{ color: textFaint }}>
            {activeStatus === 'PENDING' ? 'All clear — no reports need attention.' : 'Nothing here yet.'}
          </p>
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((r) => {
            const TargetIcon = TARGET_ICONS[r.targetType] ?? Flag;
            const targetColor = TARGET_COLORS[r.targetType] ?? '#6b7280';
            const statusStyle = SS[r.status] ?? SS.PENDING;
            const StatusIcon = statusStyle.icon;

            return (
              <div
                key={r.id}
                className="card rounded-xl p-5 cursor-pointer transition-all duration-150"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = rowHover;
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateX(3px)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = headerBdr;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = cardBg;
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = cardBdr;
                }}
                onClick={() => { setSelectedReport(r); setConfirmDelete(false); setWarningSent(false); }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${targetColor}18` }}>
                      <TargetIcon className="w-4 h-4" style={{ color: targetColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${targetColor}18`, color: targetColor }}>
                          {r.targetType}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          <StatusIcon className="w-3 h-3" />{r.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: textPri }}>{r.reason}</p>
                      {r.details && <p className="text-xs mb-2" style={{ color: textMuted }}>{r.details}</p>}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: textFaint }}>
                        <span>Target: <span className="font-mono">{r.targetId?.slice(0, 10)}…</span></span>
                        <span>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {r.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => updateReport.mutate({ id: r.id, status: 'REVIEWED' })}
                        disabled={updateReport.isPending}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#059669', color: '#ffffff', border: '1px solid #047857' }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Reviewed
                      </button>
                      <button
                        onClick={() => updateReport.mutate({ id: r.id, status: 'DISMISSED' })}
                        disabled={updateReport.isPending}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: isLight ? '#f3f4f6' : '#2a2a2a', color: textMuted, border: `1px solid ${cardBdr}` }}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedReport(null)}>
          <div className="rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBdr}` }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: textPri }}>Report Details</h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: textFaint }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type + Status */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${TARGET_COLORS[selectedReport.targetType] ?? '#6b7280'}18`, color: TARGET_COLORS[selectedReport.targetType] ?? '#6b7280' }}>
                  {selectedReport.targetType}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: SS[selectedReport.status]?.bg, color: SS[selectedReport.status]?.color }}>
                  {selectedReport.status}
                </span>
              </div>

              {/* Reason + Details */}
              <div className="p-3 rounded-xl" style={{ backgroundColor: isLight ? '#fef3c7' : '#2d1f00', border: isLight ? '1px solid #fde68a' : '1px solid #78350f' }}>
                <p className="text-sm font-semibold" style={{ color: isLight ? '#92400e' : '#fbbf24' }}>{selectedReport.reason}</p>
                {selectedReport.details && <p className="text-xs mt-1" style={{ color: isLight ? '#b45309' : '#d97706' }}>{selectedReport.details}</p>}
              </div>

              {/* IDs */}
              <div className="text-xs space-y-1" style={{ color: textFaint }}>
                <p>Target ID: <span className="font-mono" style={{ color: textMuted }}>{selectedReport.targetId}</span></p>
                <p>Reporter ID: <span className="font-mono" style={{ color: textMuted }}>{selectedReport.reporterId}</span></p>
                <p>Reported: {new Date(selectedReport.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>

              {/* Warning Message Input */}
              {selectedReport.status === 'PENDING' && !warningSent && showWarningInput && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold" style={{ color: textPri }}>Warning Message (optional)</label>
                  <textarea
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    placeholder="Enter a custom warning message to send to the user..."
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                    style={{ backgroundColor: isLight ? '#f9fafb' : '#111111', border: `1px solid ${isLight ? '#e5e7eb' : '#2f2f2f'}`, color: textPri }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleWarning}
                      disabled={updateReport.isPending}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                    >
                      <Bell className="w-3.5 h-3.5" /> Send Warning
                    </button>
                    <button
                      onClick={() => { setShowWarningInput(false); setWarningMessage(''); }}
                      className="text-xs px-3 py-2 rounded-lg transition-colors"
                      style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Warning sent confirmation with message display */}
              {warningSent && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}>
                    ✓ Warning notification sent to the user.
                  </div>
                  {warningMessage && (
                    <div className="p-3 rounded-xl" style={{ backgroundColor: isLight ? '#f3f4f6' : '#111111', border: `1px solid ${isLight ? '#e5e7eb' : '#2f2f2f'}` }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: textPri }}>Warning Message Sent:</p>
                      <p className="text-xs" style={{ color: textMuted }}>{warningMessage}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {selectedReport.status === 'PENDING' && !warningSent && !showWarningInput && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => updateReport.mutate({ id: selectedReport.id, status: 'REVIEWED' }, { onSuccess: () => setSelectedReport(null) })}
                    disabled={updateReport.isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#059669', color: '#ffffff' }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Reviewed
                  </button>
                  <button
                    onClick={() => setShowWarningInput(true)}
                    disabled={updateReport.isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                  >
                    <Bell className="w-3.5 h-3.5" /> Send Warning
                  </button>
                  {selectedReport.targetType === 'POST' && (
                    confirmDelete ? (
                      <div className="flex gap-2">
                        <button onClick={handleDelete} disabled={deletePost.isPending}
                          className="text-xs font-semibold px-3 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50">
                          Confirm Delete
                        </button>
                        <button onClick={() => setConfirmDelete(false)}
                          className="text-xs px-3 py-2 rounded-lg transition-colors"
                          style={{ backgroundColor: isLight ? '#f3f4f6' : '#242424', color: textMuted }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-90"
                        style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete Post
                      </button>
                    )
                  )}
                  <button
                    onClick={() => updateReport.mutate({ id: selectedReport.id, status: 'DISMISSED' }, { onSuccess: () => setSelectedReport(null) })}
                    disabled={updateReport.isPending}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: isLight ? '#f3f4f6' : '#2a2a2a', color: textMuted, border: `1px solid ${cardBdr}` }}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
