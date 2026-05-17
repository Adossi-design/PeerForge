import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import Providers from '@/Providers';

export const metadata: Metadata = {
  title: 'PeerForge - Builder Ecosystem for CS Students',
  description:
    'Collaborate on projects, find teammates, get technical help, and build together.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e06',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Inline script runs before paint to avoid theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('peerforge-theme');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');})();`,
          }}
        />
      </head>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
