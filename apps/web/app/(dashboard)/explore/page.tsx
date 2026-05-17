'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { usePosts } from '@/lib/hooks/usePosts';
import { PostCard } from '@/components/features/posts/PostCard';

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'COLLABORATION_REQUEST', label: 'Collaboration' },
  { value: 'HELP_REQUEST', label: 'Help Request' },
  { value: 'TESTING_REQUEST', label: 'Testing' },
  { value: 'OPEN_SOURCE_CONTRIBUTION', label: 'Open Source' },
  { value: 'STARTUP_IDEA', label: 'Startup Idea' },
  { value: 'TECHNICAL_DISCUSSION', label: 'Discussion' },
];

const STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'IDEATION', label: 'Idea' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'BETA', label: 'Testing' },
  { value: 'COMPLETED', label: 'Launched' },
];

function Dropdown({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors min-w-[130px] justify-between"
        style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', color: '#d1d5db' }}
      >
        {selected.label}
        <ChevronDown className="w-4 h-4" style={{ color: '#6b7280' }} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 right-0 rounded-xl shadow-xl z-10 min-w-[160px] py-1"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f' }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors"
              style={
                o.value === value
                  ? { backgroundColor: '#4f46e5', color: '#fff', borderRadius: '6px', margin: '2px 4px', width: 'calc(100% - 8px)' }
                  : { color: '#d1d5db' }
              }
            >
              {o.label}
              {o.value === value && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [stage, setStage] = useState('');
  const { data: posts, isLoading } = usePosts();

  const filtered = (posts ?? []).filter((p) => {
    const matchQuery = !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchType = !type || p.type === type;
    const matchStage = !stage || p.status === stage;
    return matchQuery && matchType && matchStage;
  });

  return (
    <div className="px-4 sm:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Explore</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Discover projects, ideas, and collaborators</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by skill, technology, or keyword..."
            className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', color: '#d1d5db' }}
          />
        </div>
        <div className="flex items-center" style={{ color: '#6b7280' }}>
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <Dropdown options={TYPES} value={type} onChange={setType} />
        <Dropdown options={STAGES} value={stage} onChange={setStage} />
      </div>

      {/* Posts — full width */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: '#1a1a1a' }} />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((post) => <PostCard key={post.id} post={post} href={`/posts/${post.id}`} />)
        ) : (
          <div className="text-center py-16" style={{ color: '#6b7280' }}>No results found.</div>
        )}
      </div>
    </div>
  );
}
