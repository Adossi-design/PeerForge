'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, FolderOpen, MessageSquare, Bell, User, Settings, Zap, Plus, Bookmark, Menu, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewPostModal } from '@/components/features/posts/NewPostModal';
import { useNotifications, useCurrentUser, useDmInbox } from '@/lib/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/context/ThemeContext';
import { SidebarThemeToggle, MobileThemeToggle } from '@/components/common/ThemeToggle';

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
  const { theme } = useTheme();
  const [showNewPost, setShowNewPost] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: notifications } = useNotifications();
  const { data: currentUser } = useCurrentUser();
  const { data: dmInbox } = useDmInbox();
  const router = useRouter();
  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;
  const unreadDms = (dmInbox ?? []).filter((c) => !c.read && c.senderId !== currentUser?.id).length;

  // Determine active section for header color
  const getActiveSection = () => {
    if (pathname.startsWith('/posts')) return 'posts';
    if (pathname.startsWith('/users')) return 'users';
    if (pathname.startsWith('/messages')) return 'messages';
    if (pathname.startsWith('/notifications')) return 'notifications';
    if (pathname.startsWith('/profile')) return 'profile';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/discussions')) return 'discussions';
    if (pathname.startsWith('/projects')) return 'projects';
    if (pathname.startsWith('/explore')) return 'explore';
    if (pathname.startsWith('/saved')) return 'saved';
    return 'home';
  };

  const activeSection = getActiveSection();

  // Header color based on active section
  const getHeaderGradient = () => {
    switch (activeSection) {
      case 'posts':
        return 'linear-gradient(90deg, #1e3a5f, #2d5a8e, #1a4a4a)';
      case 'users':
        return 'linear-gradient(90deg, #3b1f6e, #1a2a5e, #2d1b69)';
      case 'messages':
        return 'linear-gradient(90deg, #1a4a4a, #2d5a5a, #1a3a3a)';
      case 'notifications':
        return 'linear-gradient(90deg, #4a2a1a, #5a3a2a, #3a2a1a)';
      case 'profile':
        return 'linear-gradient(90deg, #2a1a4a, #3a2a5a, #1a1a3a)';
      case 'settings':
        return 'linear-gradient(90deg, #1a2a3a, #2a3a4a, #1a2a2a)';
      case 'discussions':
        return 'linear-gradient(90deg, #3a2a4a, #4a3a5a, #2a1a3a)';
      case 'projects':
        return 'linear-gradient(90deg, #2a3a1a, #3a4a2a, #1a2a1a)';
      case 'explore':
        return 'linear-gradient(90deg, #1a3a4a, #2a4a5a, #1a2a3a)';
      case 'saved':
        return 'linear-gradient(90deg, #3a3a1a, #4a4a2a, #2a2a1a)';
      default:
        return 'linear-gradient(90deg, #0f0c29, #1a1060, #24243e)';
    }
  };

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const main = scrollRef.current;
      if (main) {
        const { scrollTop, scrollHeight, clientHeight } = main;
        const progress = scrollHeight > clientHeight
          ? (scrollTop / (scrollHeight - clientHeight)) * 100
          : 0;
        setScrollProgress(progress);
      }
    };

    const mainElement = scrollRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

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
              : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active ? 'text-white' : 'text-purple-200 hover:text-white hover:bg-white/10',
                )}
                style={active ? {
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  borderRadius: '10px',
                  paddingLeft: '14px',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
                } : {}}
                onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(3px)'; }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.transform = 'translateX(0)'; }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                )}
                <div className="relative flex-shrink-0">
                  <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-purple-300')} />
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
          <SidebarThemeToggle />
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

        {/* Scroll progress indicator */}
        {scrollProgress > 0 && (
          <div
            className="hidden lg:block fixed top-0 left-[240px] right-0 h-0.5 z-50"
            style={{ backgroundColor: 'rgba(79,70,229,0.5)' }}
          >
            <div
              className="h-full transition-all duration-100 ease-out"
              style={{ width: `${scrollProgress}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }}
            />
          </div>
        )}

        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20 flex-shrink-0"
          style={{
            background: getHeaderGradient(),
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
          <MobileThemeToggle />
        </header>

        {/* Page content */}
        <main ref={scrollRef} className="flex-1 pb-20 lg:pb-0" style={{ backgroundColor: theme === 'light' ? '#f0eeff' : '#0d0d12' }}>
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
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{
                color: active ? '#ffffff' : '#a78bfa',
                transform: active ? 'translateY(-3px)' : 'translateY(0)',
                background: active
                  ? 'linear-gradient(135deg, rgba(79,70,229,0.55), rgba(124,58,237,0.55))'
                  : 'transparent',
                boxShadow: active ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
              }}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: '#ffffff' }}
                />
              )}
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
