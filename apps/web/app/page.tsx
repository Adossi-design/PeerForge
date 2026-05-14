'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePosts } from '@/lib/hooks/usePosts';
import { PostTypeFilter } from '@/components/feed/PostTypeFilter';
import { PostsFeed } from '@/components/feed/PostsFeed';
import { ArrowRight, Zap, Users, MessageSquare, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { isSignedIn, isLoading } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { data: posts, isLoading: postsLoading, error: postsError } = usePosts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Home Feed</h1>
                <p className="mt-1 text-slate-600">
                  Discover projects, collaborations, and opportunities
                </p>
              </div>
              <Link href="/dashboard/posts">
                <Button className="gap-2">
                  Create Project <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <PostTypeFilter
              selectedType={selectedType}
              onTypeSelect={setSelectedType}
            />
          </div>
        </div>

        {/* Feed */}
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <PostsFeed
            posts={posts}
            isLoading={postsLoading}
            error={postsError}
            selectedType={selectedType}
          />
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="heading-1 mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Where Builders Meet
            </h1>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto mb-8">
              PeerForge is the collaboration ecosystem for computer science students. 
              Find teammates, build together, get technical help, and grow your network.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="card-gradient p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="heading-4">Find Teammates</h3>
              </div>
              <p className="body-small text-muted-foreground">
                Connect with developers who share your interests and skills. Build teams that work.
              </p>
            </div>

            <div className="card-gradient p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-accent" />
                <h3 className="heading-4">Real-time Discussions</h3>
              </div>
              <p className="body-small text-muted-foreground">
                Collaborate instantly with real-time chat, code sharing, and project discussions.
              </p>
            </div>

            <div className="card-gradient p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-secondary" />
                <h3 className="heading-4">Grow Your Skills</h3>
              </div>
              <p className="body-small text-muted-foreground">
                Learn from peers, get feedback on projects, and showcase your work to the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="heading-2 mb-4">Welcome to PeerForge</h1>
          <p className="body-large text-muted-foreground">
            Redirecting you to the dashboard...
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Link href="/dashboard/home">
            <Button size="lg" gap="2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
