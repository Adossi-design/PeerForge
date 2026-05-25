'use client';

import React from 'react';

export interface PostImage {
  url: string;
  name?: string;
  type?: string;
}

interface Props {
  images: PostImage[];
  onOpen: (index: number) => void;
  rounded?: 'lg' | 'xl';
}

/**
 * Facebook/Instagram-style adaptive image grid for posts.
 * - 1 image: full-width, natural aspect ratio (no crop, capped height).
 * - 2 images: 2 equal columns, square-ish.
 * - 3 images: 1 large + 2 stacked.
 * - 4+ images: 2x2 grid with a "+N more" overlay on the last cell.
 */
export function PostImageGallery({ images, onOpen, rounded = 'lg' }: Props) {
  if (!images.length) return null;
  const radius = rounded === 'xl' ? 'rounded-xl' : 'rounded-lg';
  const border = '1px solid #2f2f2f';

  const open = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    onOpen(i);
  };

  // 1 image — natural aspect, no crop, but bounded so a tall portrait can't
  // dominate the viewport. The image is sized by its intrinsic dimensions,
  // capped by both a hard pixel ceiling and a viewport-relative one, then
  // centered with a dark letterbox so portrait shots sit cleanly.
  if (images.length === 1) {
    const a = images[0];
    return (
      <button
        onClick={(e) => open(e, 0)}
        className={`flex justify-center items-center ${radius} overflow-hidden w-full hover:opacity-95 transition-opacity`}
        style={{ border, backgroundColor: '#0d0d12' }}
      >
        <img
          src={a.url}
          alt={a.name ?? ''}
          className="block"
          style={{
            maxWidth: '100%',
            maxHeight: 'min(380px, 55vh)',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
          loading="lazy"
        />
      </button>
    );
  }

  // 2 images — side-by-side
  if (images.length === 2) {
    return (
      <div className={`grid grid-cols-2 gap-1 ${radius} overflow-hidden`} style={{ border }}>
        {images.map((a, i) => (
          <button
            key={i}
            onClick={(e) => open(e, i)}
            className="block hover:opacity-90 transition-opacity"
            style={{ aspectRatio: '1 / 1', backgroundColor: '#0d0d12' }}
          >
            <img src={a.url} alt={a.name ?? ''} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    );
  }

  // 3 images — 1 large left + 2 stacked right
  if (images.length === 3) {
    return (
      <div
        className={`grid grid-cols-2 gap-1 ${radius} overflow-hidden`}
        style={{ border, aspectRatio: '16 / 10' }}
      >
        <button
          onClick={(e) => open(e, 0)}
          className="row-span-2 block hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0d0d12' }}
        >
          <img
            src={images[0].url}
            alt={images[0].name ?? ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
        <button
          onClick={(e) => open(e, 1)}
          className="block hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0d0d12' }}
        >
          <img
            src={images[1].url}
            alt={images[1].name ?? ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
        <button
          onClick={(e) => open(e, 2)}
          className="block hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#0d0d12' }}
        >
          <img
            src={images[2].url}
            alt={images[2].name ?? ''}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      </div>
    );
  }

  // 4+ images — 2x2 with "+N more" overlay on last cell. Container aspect
  // ratio caps total height (otherwise 2 rows of squares would be as tall as
  // the post is wide — too dominant).
  const first4 = images.slice(0, 4);
  const extra = images.length - 4;
  return (
    <div
      className={`grid grid-cols-2 grid-rows-2 gap-1 ${radius} overflow-hidden`}
      style={{ border, aspectRatio: '4 / 3' }}
    >
      {first4.map((a, i) => {
        const isLastWithExtra = i === 3 && extra > 0;
        return (
          <button
            key={i}
            onClick={(e) => open(e, i)}
            className="relative block hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0d0d12' }}
          >
            <img src={a.url} alt={a.name ?? ''} className="w-full h-full object-cover" loading="lazy" />
            {isLastWithExtra && (
              <div
                className="absolute inset-0 flex items-center justify-center font-bold text-white text-2xl"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
              >
                +{extra}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
