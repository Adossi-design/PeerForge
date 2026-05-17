'use client';

import React, { useState } from 'react';
import { Flag, CheckCircle, XCircle, Clock, User, FileText, MessageCircle } from 'lucide-react';
import { useAdminReports, useAdminUpdateReport } from '@/lib/hooks/useAdmin';

const STATUS_TABS = [
  { label: 'Pending',  value: 'PENDING' },
  { label: 'Reviewed', value: 'REVIEWED' },
  { label: 'Dismissed',value: 'DISMISSED' },
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
  PENDING:   { bg: '#2d1f00', color: '#fbbf24', icon: Clock },
  REVIEWED:  { bg: '#0f2d1f', color: '#34d399', icon: CheckCircle },
  DISMISSED: { bg: '#1f1f1f', color: '#6b7280', icon: XCircle },
};

export default function AdminReportsPage() {
  const [activeStatus, setActiveStatus] = useState('PENDING');
  const { data: reports, isLoading } = useAdminReports(activeStatus);
  const updateReport = useAdminUpdateReport();

  const list: any[] = Array.isArray(reports) ? reports : [];

  return (
    <div className="px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #dc2626, #9f1239)' }}>
          <Flag className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-xs" style={{ color: '#6b7280' }}>User-submitted reports for posts, comments and accounts</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              activeStatus === tab.value
                ? { backgroundColor: '#1e3a5f', color: '#60a5fa', border: '1px solid #2d5a8e' }
                : { backgroundColor: 'transparent', color: '#6b7280', border: '1px solid transparent' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && list.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#1f1f1f' }}>
            <Flag className="w-7 h-7" style={{ color: '#6b7280' }} />
          </div>
          <p className="font-semibold text-white mb-1">No {activeStatus.toLowerCase()} reports</p>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            {activeStatus === 'PENDING' ? 'All clear — no reports need attention.' : 'Nothing here yet.'}
          </p>
        </div>
      )}

      {/* Reports list */}
      {!isLoading && list.length > 0 && (
        <div className="space-y-3">
          {list.map((r) => {
            const TargetIcon = TARGET_ICONS[r.targetType] ?? Flag;
            const targetColor = TARGET_COLORS[r.targetType] ?? '#6b7280';
            const statusStyle = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
            const StatusIcon = statusStyle.icon;

            return (
              <div key={r.id} className="card rounded-xl p-5"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Target type icon */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${targetColor}18` }}>
                      <TargetIcon className="w-4 h-4" style={{ color: targetColor }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Type + status */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${targetColor}18`, color: targetColor }}>
                          {r.targetType}
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          <StatusIcon className="w-3 h-3" />
                          {r.status}
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-sm font-semibold text-white mb-0.5">{r.reason}</p>

                      {/* Details */}
                      {r.details && (
                        <p className="text-xs mb-2" style={{ color: '#9ca3af' }}>{r.details}</p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#6b7280' }}>
                        <span>Target ID: <span className="font-mono" style={{ color: '#9ca3af' }}>{r.targetId.slice(0, 12)}…</span></span>
                        <span>Reporter: <span className="font-mono" style={{ color: '#9ca3af' }}>{r.reporterId.slice(0, 12)}…</span></span>
                        <span>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions — only for pending */}
                  {r.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateReport.mutate({ id: r.id, status: 'REVIEWED' })}
                        disabled={updateReport.isPending}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#0f2d1f', color: '#34d399', border: '1px solid #166534' }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Reviewed
                      </button>
                      <button
                        onClick={() => updateReport.mutate({ id: r.id, status: 'DISMISSED' })}
                        disabled={updateReport.isPending}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#1f1f1f', color: '#9ca3af', border: '1px solid #3f3f3f' }}
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
    </div>
  );
}
