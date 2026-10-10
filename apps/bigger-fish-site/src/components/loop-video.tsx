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
    // Unknown until the first report: an above-the-fold loop that's already autoplaying is left alone till then.
    let onScreen: boolean | undefined;
    const sync = () => {
      if (reduceMotion.matches || onScreen === false) {
        video.pause();
      } else if (onScreen && document.visibilityState === 'visible' && video.paused) {
        video.play().catch(() => {
          // Low Power Mode and some browsers refuse; the poster stays up.
        });
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        // Several changes can arrive at once while the layout settles: the last one is current.
        onScreen = entries[entries.length - 1]?.isIntersecting ?? onScreen;
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduceMotion.addEventListener('change', sync);
    video.addEventListener('loadeddata', sync);
    // Browsers pause video in a hidden tab; pick it up again on return.
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener('change', sync);
      video.removeEventListener('loadeddata', sync);
      document.removeEventListener('visibilitychange', sync);
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
