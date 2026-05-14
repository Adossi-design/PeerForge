'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { useSavedPosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/features/posts/PostCard';

export default function SavedPage() {
  const { data: posts, isLoading } = useSavedPosts();

  return (
    <div className="w-full px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Saved Posts</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Posts you've bookmarked</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))
        ) : posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#1f1f1f' }}>
              <Bookmark className="w-8 h-8" style={{ color: '#6b7280' }} />
            </div>
            <h3 className="font-semibold text-white mb-1">No saved posts</h3>
            <p className="text-sm text-center max-w-xs" style={{ color: '#6b7280' }}>
              Posts you save will appear here. Click the bookmark icon on any post to save it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
