'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap, Users, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';

export default function RootPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/home');
  }, [isLoaded, isSignedIn, router]);


  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Zap className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">PeerForge</span>
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Where Builders Meet
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          The collaboration ecosystem for CS students. Find teammates, build together, get technical help, and grow your network.
        </p>

        <div className="flex gap-4 justify-center mb-20">
          <Link href="/signup">
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/login">
            <button className="border border-border hover:bg-border/50 font-semibold px-6 py-3 rounded-xl transition-colors">
              Sign In
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'Find Teammates', desc: 'Connect with developers who share your interests and skills.' },
            { icon: MessageSquare, title: 'Real-time Discussions', desc: 'Collaborate instantly with real-time chat and code sharing.' },
            { icon: TrendingUp, title: 'Grow Your Skills', desc: 'Learn from peers, get feedback, and showcase your work.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6 text-left">
              <Icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
