'use client';

import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    handleRedirectCallback({
      afterSignInUrl: '/home',
      afterSignUpUrl: '/home',
    }).catch(() => router.push('/login'));
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm" style={{ color: '#6b7280' }}>Signing you in…</p>
      </div>
    </div>
  );
}
