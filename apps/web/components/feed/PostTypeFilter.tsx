'use client';

import React from 'react';

interface PostTypeFilterProps {
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

export const POST_TYPES = [
  { value: 'COLLABORATION_REQUEST', label: 'Collaborations', color: 'blue' },
  { value: 'HELP_REQUEST', label: 'Help', color: 'amber' },
  { value: 'OPEN_SOURCE', label: 'Open Source', color: 'green' },
  { value: 'DISCUSSION', label: 'Discussions', color: 'purple' },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
};

export function PostTypeFilter({ selectedType, onTypeSelect }: PostTypeFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => onTypeSelect(null)}
        className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
          selectedType === null
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        All Posts
      </button>

      {POST_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => onTypeSelect(type.value)}
          className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
            selectedType === type.value
              ? `bg-${type.color}-600 text-white`
              : COLOR_MAP[type.color]
          }`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
