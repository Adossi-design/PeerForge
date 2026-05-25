'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';

interface SidebarProps {
  variant?: 'default' | 'admin';
}

/**
 * Full-width pill toggle used in the sidebars of both the user dashboard and
 * the admin shell. Renders a labeled button with a slider on the right.
 *
 * Class names (`theme-toggle-btn`, `theme-toggle-pill`, `theme-toggle-dot`) are
 * referenced by `globals.css` to keep the pill visible in light mode (the
 * universal `aside.fixed *` reset would otherwise blank it out).
 */
export function SidebarThemeToggle({ variant = 'default' }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const borderColor =
    variant === 'admin' ? 'rgba(236,72,153,0.3)' : 'rgba(139,92,246,0.3)';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`theme-toggle-btn${
        variant === 'admin' ? ' theme-toggle-btn--admin' : ''
      } w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-purple-200 hover:text-white`}
      style={{
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <span className="flex items-center gap-2">
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-300" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-300" />
        )}
        {theme === 'dark' ? 'Dark mode' : 'Light mode'}
      </span>
      <div
        className={`theme-toggle-pill${
          variant === 'admin' ? ' theme-toggle-pill--admin' : ''
        } relative flex-shrink-0 rounded-full transition-colors duration-200`}
        style={{ width: '40px', height: '22px' }}
      >
        <span
          className="theme-toggle-dot absolute rounded-full transition-transform duration-200"
          style={{
            top: '2px',
            left: '0',
            width: '18px',
            height: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(2px)',
          }}
        />
      </div>
    </button>
  );
}

/**
 * Compact icon-only theme toggle used in the mobile top bar.
 */
export function MobileThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="theme-toggle-mobile w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
    >
      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
