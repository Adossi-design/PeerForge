'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, FolderOpen, MessageSquare, Bell, User, Settings, Zap, Plus, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewPostModal } from '@/components/features/posts/NewPostModal';

const NAV = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/saved', icon: Bookmark, label: 'Saved' },
  { href: '/discussions', icon: MessageSquare, label: 'Discussions' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNewPost, setShowNewPost] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full w-[240px] flex flex-col z-20"
        style={{ backgroundColor: '#111111', borderRight: '1px solid #1f1f1f' }}
      >
        {/* Logo */}
        <div className="px-5 py-5">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">PeerForge</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                )}
                style={active ? { backgroundColor: '#1e3a5f' } : {}}
              >
                <Icon className={cn('w-5 h-5', active ? 'text-blue-400' : 'text-gray-500')} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* New Post Button */}
        <div className="p-4">
          <button
            onClick={() => setShowNewPost(true)}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[240px] flex-1 min-h-screen" style={{ backgroundColor: '#0d0d0d' }}>
        {children}
      </main>

      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}
    </div>
  );
}
