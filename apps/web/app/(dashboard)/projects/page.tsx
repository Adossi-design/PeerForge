'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks/useApi';
import { useUserPosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/features/posts/PostCard';
import { NewPostModal } from '@/components/features/posts/NewPostModal';

export default function ProjectsPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: myPosts, isLoading } = useUserPosts(currentUser?.id ?? '');

  const [showNewPost, setShowNewPost] = useState(false);

  return (
    <div className="w-full min-h-screen px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Manage your posts and collaborations</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))
        ) : myPosts && myPosts.length > 0 ? (
          myPosts.map((post) => <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />)
        ) : (
          <div className="text-center py-16 text-sm" style={{ color: '#6b7280' }}>
            No projects yet. Click <span style={{ color: '#a78bfa' }}>+ New Post</span> to create one.
          </div>
        )}
      </div>

      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}
    </div>
  );
}
