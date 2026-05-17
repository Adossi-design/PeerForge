'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, FolderOpen, MessageSquare, Bell, User, Settings, Zap, Plus, Bookmark, Menu, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewPostModal } from '@/components/features/posts/NewPostModal';
import { useNotifications, useCurrentUser, useDmInbox } from '@/lib/hooks/useApi';
import { useSavedPosts } from '@/lib/hooks/usePosts';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const NAV = [
  { href: '/home',          icon: Home,         label: 'Home' },
  { href: '/explore',       icon: Compass,      label: 'Explore' },
  { href: '/projects',      icon: FolderOpen,   label: 'Projects' },
  { href: '/saved',         icon: Bookmark,     label: 'Saved' },
  { href: '/discussions',   icon: MessageSquare,label: 'Discussions' },
  { href: '/messages',      icon: Mail,         label: 'Messages' },
  { href: '/notifications', icon: Bell,         label: 'Notifications' },
  { href: '/profile',       icon: User,         label: 'Profile' },
  { href: '/settings',      icon: Settings,     label: 'Settings' },
];

// Bottom nav shows only the most important 5 items on mobile
const BOTTOM_NAV = [
  { href: '/home',          icon: Home,         label: 'Home' },
  { href: '/explore',       icon: Compass,      label: 'Explore' },
  { href: '/notifications', icon: Bell,         label: 'Alerts' },
  { href: '/profile',       icon: User,         label: 'Profile' },
  { href: '/settings',      icon: Settings,     label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [showNewPost, setShowNewPost] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const { data: currentUser } = useCurrentUser();
  const { data: dmInbox } = useDmInbox();
  const { data: savedPosts } = useSavedPosts();
  const router = useRouter();
  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;
  const unreadDms = (dmInbox ?? []).filter((c) => !c.read && c.senderId !== currentUser?.id).length;
  const savedCount = savedPosts?.length ?? 0;

  React.useEffect(() => {
    if (currentUser && currentUser.username?.startsWith('user_')) {
      router.replace('/onboarding');
    }
  }, [currentUser, router]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme === 'light' ? '#f0eeff' : '#0d0d12' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full flex flex-col z-40 transition-transform duration-300',
          'lg:translate-x-0 lg:w-[240px]',
          sidebarOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-[280px]',
        )}
        style={{
          background: theme === 'light' ? '#1a1a2e' : '#0a0a0a',
          borderRight: theme === 'light' ? '1px solid #16213e' : '1px solid #111111',
        }}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/home" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">PeerForge</span>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-4 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href);
            const badge = (label === 'Notifications' && unreadCount > 0) ? unreadCount
              : (label === 'Messages' && unreadDms > 0) ? unreadDms
              : (label === 'Saved' && savedCount > 0) ? savedCount
              : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active ? 'text-white' : 'text-purple-200 hover:text-white hover:bg-white/10',
                )}
                style={active ? {
                  background: '#3d2b8e',
                  borderRadius: '8px',
                  paddingLeft: '12px',
                } : {}}
              >
                <div className="relative flex-shrink-0">
                  <Icon className={cn('w-5 h-5', active ? 'text-indigo-300' : 'text-purple-300')} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: '#ef4444' }}>
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mt-2 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Theme toggle + New Post Button */}
        <div className="p-4 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-purple-200 hover:text-white"
            style={{ border: '1px solid rgba(139,92,246,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <span className="flex items-center gap-2">
              {theme === 'dark'
                ? <Moon className="w-4 h-4 text-indigo-300" />
                : <Sun className="w-4 h-4 text-yellow-300" />}
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </span>
            <div
              className="relative flex-shrink-0 rounded-full transition-colors duration-200"
              style={{ width: '40px', height: '22px', backgroundColor: '#4f46e5' }}
            >
              <span
                className="absolute rounded-full transition-transform duration-200"
                style={{
                  top: '2px', left: '0',
                  width: '18px', height: '18px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(2px)',
                }}
              />
            </div>
          </button>
          <button
            onClick={() => { setShowNewPost(true); setSidebarOpen(false); }}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Plus className="w-4 h-4" />New Post
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">

        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #0f0c29, #1a1060, #24243e)',
            borderBottom: '1px solid rgba(139,92,246,0.25)',
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-purple-300 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">PeerForge</span>
          </Link>
          <button
            onClick={() => setShowNewPost(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(139,92,246,0.4)' }}
          >
            {theme === 'dark'
              ? <Moon className="w-4 h-4 text-indigo-300" />
              : <Sun className="w-4 h-4 text-yellow-300" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0" style={{ backgroundColor: theme === 'light' ? '#f0eeff' : '#0d0d12' }}>
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around px-2 py-2"
        style={{
          background: 'linear-gradient(90deg, #0f0c29, #1a1060, #24243e)',
          borderTop: '1px solid rgba(139,92,246,0.25)',
        }}
      >
        {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href);
          const badge = label === 'Alerts' && unreadCount > 0 ? unreadCount : 0;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: active ? '#c4b5fd' : '#a78bfa' }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: '#ef4444' }}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}
    </div>
  );
}
