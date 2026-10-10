'use client';

import { useState } from 'react';

import styles from './trailer-player.module.css';

type TrailerPlayerProps = {
  poster: string;
  src: string;
  title: string;
};

/** The trailer, with sound. Nothing loads until it's asked for. */
export function TrailerPlayer({ poster, src, title }: TrailerPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        autoPlay
        className={styles.frame}
        controls
        playsInline
        poster={poster}
        preload="auto"
        src={src}
        title={title}
      />
    );
  }

  return (
    <button
      aria-label={`Play ${title}`}
      className={styles.cover}
      onClick={() => setPlaying(true)}
      style={{ backgroundImage: `url(${poster})` }}
      type="button">
      <span aria-hidden="true" className={styles.play}>
        <svg height="28" viewBox="0 0 24 24" width="28">
          <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
        </svg>
      </span>
      <span className={styles.label}>Play the trailer · 0:25</span>
    </button>
  );
}
