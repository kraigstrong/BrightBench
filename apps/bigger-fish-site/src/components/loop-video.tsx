'use client';

import { useEffect, useRef } from 'react';

type LoopVideoProps = {
  className?: string;
  /** Above the fold: start loading straight away. */
  eager?: boolean;
  poster: string;
  src: string;
};

/**
 * A short, silent gameplay loop. It plays only while on screen, and never for someone who has asked for reduced
 * motion: they see its poster frame instead.
 */
export function LoopVideo({ className, eager = false, poster, src }: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // Autoplay is allowed only for muted, inline video; set it on the element itself, not just the attribute.
    video.muted = true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => {
      if (visible && !reduceMotion.matches) {
        video.play().catch(() => {
          // Low Power Mode and some browsers refuse; the poster stays up.
        });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        // Several changes can arrive at once while the layout settles: the last one is current.
        visible = entries[entries.length - 1]?.isIntersecting ?? visible;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduceMotion.addEventListener('change', sync);
    video.addEventListener('loadeddata', sync);
    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener('change', sync);
      video.removeEventListener('loadeddata', sync);
    };
  }, []);

  return (
    <video
      aria-hidden="true"
      // Above the fold, let the browser start it even before the page's script runs.
      autoPlay={eager}
      className={className}
      disablePictureInPicture
      loop
      muted
      playsInline
      poster={poster}
      preload={eager ? 'auto' : 'metadata'}
      ref={ref}
      src={src}
    />
  );
}
