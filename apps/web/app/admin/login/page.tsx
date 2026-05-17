'use client';

import React, { useState } from 'react';
import { Zap, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAdminLogin } from '@/lib/hooks/useAdmin';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PeerForge</h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
            <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}
        >
          <h2 className="text-lg font-bold text-white mb-1">Admin Sign In</h2>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
            Restricted access — authorized personnel only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #2f2f2f',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:ring-1"
                  style={{ backgroundColor: '#111111', border: '1px solid #2f2f2f' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#6b7280' }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {login.isError && (
              <p className="text-xs text-red-400 text-center">
                Invalid credentials. Access denied.
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {login.isPending ? 'Authenticating…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#374151' }}>
          This area is monitored and access is logged.
        </p>
      </div>
    </div>
  );
}
