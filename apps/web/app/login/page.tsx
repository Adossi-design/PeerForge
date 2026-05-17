'use client';

import React, { useState } from 'react';
import { useSignIn, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { setAdminToken } from '@/lib/hooks/useAdmin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ADMIN_EMAIL = 'admin01test@gmail.com';

export default function LoginPage() {
  const { signIn, isLoaded } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/home',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    setIsGoogleAccount(false);

    // Admin check
    if (email === ADMIN_EMAIL) {
      try {
        const res = await fetch(`${API_URL}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          setAdminToken(data.token);
          router.push('/admin');
          return;
        }
        setError('Invalid admin credentials.');
      } catch {
        setError('Could not reach server. Make sure the API is running.');
      }
      setLoading(false);
      return;
    }

    // Regular Clerk sign-in
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/home');
      } else {
        setError('Sign in incomplete. Please try again.');
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const code = clerkError?.code ?? '';
      const meta = clerkError?.meta ?? {};

      // Account exists but was created via Google OAuth — no password set
      if (
        code === 'strategy_for_user_invalid' ||
        code === 'form_password_incorrect' && meta?.provider === 'google' ||
        (clerkError?.message ?? '').toLowerCase().includes('google') ||
        (clerkError?.message ?? '').toLowerCase().includes('oauth') ||
        (clerkError?.message ?? '').toLowerCase().includes('external account')
      ) {
        setIsGoogleAccount(true);
        setError('This account was created with Google. Please sign in with Google below.');
      } else if (code === 'form_identifier_not_found') {
        setError('No account found with this email. Please sign up first.');
      } else if (code === 'form_password_incorrect') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(clerkError?.longMessage ?? clerkError?.message ?? 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PeerForge</h1>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Welcome back</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #242424' }}>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-90 mb-4 disabled:opacity-50"
            style={{ backgroundColor: '#242424', color: '#d1d5db', border: '1px solid #2f2f2f' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#2f2f2f' }} />
            <span className="text-xs" style={{ color: '#6b7280' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#2f2f2f' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); setIsGoogleAccount(false); }}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                  style={{ backgroundColor: '#111111', border: '1px solid #2f2f2f' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ca3af' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                  style={{ backgroundColor: '#111111', border: '1px solid #2f2f2f' }}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-xs" style={{ backgroundColor: '#2d1515', border: '1px solid #5c2020', color: '#f87171' }}>
                {error}
              </div>
            )}

            {/* If Google account detected, show Google button prominently */}
            {isGoogleAccount ? (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            )}
          </form>

          <p className="text-center text-sm mt-4" style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium hover:text-white transition-colors" style={{ color: '#60a5fa' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
