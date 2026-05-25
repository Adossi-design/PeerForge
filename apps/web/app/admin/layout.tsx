'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Zap, LayoutDashboard, Users, FileText, ShieldCheck,
  LogOut, Menu, X, ChevronRight, Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAdminToken, useAdminLogout, useAdminReportCount } from '@/lib/hooks/useAdmin';
import { useTheme } from '@/lib/context/ThemeContext';
import { SidebarThemeToggle } from '@/components/common/ThemeToggle';

const NAV = [
  { href: '/admin',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users',   icon: Users,            label: 'Users' },
  { href: '/admin/posts',   icon: FileText,         label: 'Posts' },
  { href: '/admin/reports', icon: Flag,             label: 'Reports' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAdminLogout();
  const { data: reportCountData } = useAdminReportCount();
  const pendingReports: number = reportCountData?.count ?? 0;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
    if (pathname === '/admin/login') return;
    const token = getAdminToken();
    if (!token) router.replace('/admin/login');
  }, [pathname, router]);

  if (!mounted) return null;
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme === 'light' ? '#f0eeff' : '#0d0d12' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full flex flex-col z-40 transition-transform duration-300',
          'lg:translate-x-0 lg:w-[220px]',
          sidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px]',
        )}
        style={{
          background: theme === 'light' ? '#1a1a2e' : '#0a0a0a',
          borderRight: theme === 'light' ? '1px solid #16213e' : '1px solid #111111',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #ec4899)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-none">PeerForge</p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5" style={{ color: '#f9a8d4' }} />
                <span className="text-[10px] font-medium" style={{ color: '#f9a8d4' }}>Admin</span>
              </div>
            </div>
          </div>
          <button className="lg:hidden text-purple-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-4 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            const badge = label === 'Reports' && pendingReports > 0 ? pendingReports : 0;
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
                  background: 'linear-gradient(90deg, #4f46e5 0%, #ec4899 100%)',
                  borderRadius: '10px',
                  paddingLeft: '14px',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
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
                  <Icon className={cn('w-4 h-4', active ? 'text-white' : 'text-purple-300')} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: '#ef4444' }}>
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-pink-300" />}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 mt-2 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Theme toggle + Logout */}
        <div className="p-4 space-y-2">
          <SidebarThemeToggle variant="admin" />
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-purple-200 hover:text-red-300"
            style={{ border: '1px solid rgba(139,92,246,0.3)', backgroundColor: 'rgba(255,255,255,0.03)' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[220px]">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-20"
          style={{
            background: 'linear-gradient(90deg, #0f0c29, #1a1060, #2d1b69)',
            borderBottom: '1px solid rgba(236,72,153,0.25)',
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-purple-300 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" style={{ color: '#f9a8d4' }} />
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 pb-8" style={{ backgroundColor: theme === 'light' ? '#f0eeff' : '#0d0d12' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
