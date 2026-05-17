'use client';

import React, { useEffect } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

interface ImageLightboxProps {
  images: { url: string; name: string }[];
  index: number;
  onClose: () => void;
  onNav: (index: number) => void;
}

export function ImageLightbox({ images, index, onClose, onNav }: ImageLightboxProps) {
  const img = images[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onNav(index - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) onNav(index + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [index, images.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1f1f1f' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: '#9ca3af' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-sm truncate max-w-xs" style={{ color: '#9ca3af' }}>{img.name}</span>
        <button onClick={onClose} className="hover:text-white transition-colors" style={{ color: '#9ca3af' }}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {index > 0 && (
          <button
            onClick={() => onNav(index - 1)}
            className="absolute left-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', color: '#d1d5db' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <img
          src={img.url}
          alt={img.name}
          className="max-w-full max-h-full object-contain rounded-lg"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        />
        {index < images.length - 1 && (
          <button
            onClick={() => onNav(index + 1)}
            className="absolute right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2f2f2f', color: '#d1d5db' }}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thumbnails strip — only when multiple images */}
      {images.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-3 flex-shrink-0 overflow-x-auto"
          style={{ borderTop: '1px solid #1f1f1f' }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => onNav(i)}
              className="flex-shrink-0 rounded-lg overflow-hidden transition-opacity"
              style={{
                width: '56px', height: '56px',
                border: `2px solid ${i === index ? '#4f46e5' : '#2f2f2f'}`,
                opacity: i === index ? 1 : 0.5,
              }}
            >
              <img src={im.url} alt={im.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
