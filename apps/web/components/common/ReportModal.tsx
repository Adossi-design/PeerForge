'use client';

import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useToast } from '@/components/common/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';

const REASONS: Record<ReportTargetType, string[]> = {
  POST: [
    'Spam or misleading',
    'Inappropriate content',
    'Harassment or hate speech',
    'Plagiarism or stolen work',
    'Off-topic or irrelevant',
    'Fake project or scam',
    'Other',
  ],
  COMMENT: [
    'Spam',
    'Harassment or bullying',
    'Hate speech',
    'Inappropriate content',
    'Misinformation',
    'Other',
  ],
  USER: [
    'Fake or impersonation account',
    'Spam or bot',
    'Harassment or bullying',
    'Hate speech or discrimination',
    'Inappropriate profile content',
    'Scam or fraud',
    'Other',
  ],
};

const TARGET_LABELS: Record<ReportTargetType, string> = {
  POST: 'post',
  COMMENT: 'comment',
  USER: 'account',
};

interface ReportModalProps {
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
}

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const { getToken } = useAuth();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ targetType, targetId, reason, details: details.trim() || undefined }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to submit report');
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err: any) => {
      const msg = err?.message ?? '';
      if (msg.includes('already reported')) {
        toast('You have already reported this.', 'error');
      } else {
        toast('Failed to submit report. Please try again.', 'error');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full rounded-2xl p-6 relative"
        style={{ maxWidth: '440px', backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors hover:text-white"
          style={{ color: '#6b7280' }}
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#1e3a5f' }}>
              <Flag className="w-6 h-6" style={{ color: '#60a5fa' }} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Report submitted</h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>
              Thanks for letting us know. We'll review this {TARGET_LABELS[targetType]} and take action if needed.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-sm font-medium px-6 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4" style={{ color: '#f87171' }} />
              <h3 className="text-lg font-bold text-white">
                Report {TARGET_LABELS[targetType]}
              </h3>
            </div>
            <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
              Help us understand what's wrong with this {TARGET_LABELS[targetType]}.
            </p>

            {/* Reason selection */}
            <div className="space-y-2 mb-4">
              {REASONS[targetType].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                  style={{
                    backgroundColor: reason === r ? '#1e3a5f' : '#111111',
                    border: `1px solid ${reason === r ? '#2d5a8e' : '#2f2f2f'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="hidden"
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      border: `2px solid ${reason === r ? '#60a5fa' : '#4b5563'}`,
                      backgroundColor: reason === r ? '#60a5fa' : 'transparent',
                    }}
                  >
                    {reason === r && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm" style={{ color: reason === r ? '#d1d5db' : '#9ca3af' }}>{r}</span>
                </label>
              ))}
            </div>

            {/* Optional details */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-white mb-1.5">
                Additional details <span style={{ color: '#6b7280' }}>(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Provide any additional context..."
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                style={{ backgroundColor: '#111111', border: '1px solid #2f2f2f', color: '#d1d5db' }}
              />
              <p className="text-xs mt-1 text-right" style={{ color: '#6b7280' }}>{details.length}/500</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ backgroundColor: '#242424', color: '#d1d5db', border: '1px solid #3f3f3f' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason || mutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#dc2626' }}
              >
                {mutation.isPending ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
