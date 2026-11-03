import { useId } from 'react';

import type { Circuit } from '@/lib/ghost-thread';

import styles from './circuit-thread.module.css';

/** Laps go by this many times faster than real ones, as on the game's unlock screen. */
const playback = 4;
/**
 * The thread trailing the car: pieces of the lap (in thousandths), how strongly each shows, faintest first, and how
 * thick, in the 1000-unit drawing's own units. A dash can't keep its stroke a fixed width on screen: browsers then
 * measure the dash in pixels too, and it slides off the car.
 */
const trail = [
  { length: 340, opacity: 0.3, width: 9 },
  { length: 200, opacity: 0.6, width: 12 },
  { length: 90, opacity: 1, width: 16 },
];

type CircuitThreadProps = {
  circuit: Circuit;
  className?: string;
  /** Seconds into its lap to start, so circuits side by side don't move in step. */
  offset?: number;
};

/**
 * A circuit's outline with its ideal line threaded around it, as the game's unlock screen draws it: a car lapping the
 * line at the speed the line allows, trailing its thread. Plain SVG animation, so it needs no script; with reduced
 * motion the whole line stands still instead. Decoration: the words beside it name the circuit.
 */
export function CircuitThread({ circuit, className, offset = 0 }: CircuitThreadProps) {
  const id = useId();
  const lineId = `${id}-line`;
  const margin = 40;
  const animation = {
    begin: `${-offset}s`,
    calcMode: 'linear',
    dur: `${(circuit.lap / playback).toFixed(2)}s`,
    keyTimes: circuit.keyPoints.map((_, index) => (index / (circuit.keyPoints.length - 1)).toFixed(4)).join(';'),
    repeatCount: 'indefinite',
  };
  return (
    <svg
      aria-hidden="true"
      className={`${styles.thread} ${className ?? ''}`}
      viewBox={`${-margin} ${-margin} ${circuit.width + margin * 2} ${circuit.height + margin * 2}`}>
      <path className={styles.road} d={circuit.outline} vectorEffect="non-scaling-stroke" />
      <path className={styles.edge} d={circuit.outline} vectorEffect="non-scaling-stroke" />
      <path className={styles.still} d={circuit.line} vectorEffect="non-scaling-stroke" />
      <path d={circuit.line} fill="none" id={lineId} pathLength={1000} stroke="none" />
      {trail.map((piece) => (
        // Each piece ends at the car: its dash is `length` long and slides round with it.
        <path
          className={styles.trail}
          d={circuit.line}
          key={piece.length}
          pathLength={1000}
          strokeDasharray={`${piece.length} ${1000 - piece.length}`}
          strokeOpacity={piece.opacity}
          strokeWidth={piece.width}>
          <animate
            attributeName="stroke-dashoffset"
            {...animation}
            values={circuit.keyPoints.map((k) => (piece.length - 1000 * k).toFixed(1)).join(';')}
          />
        </path>
      ))}
      <g className={styles.car}>
        <circle r={22} opacity={0.3} />
        <circle r={11} />
        <circle className={styles.carCore} r={4.5} />
        <animateMotion {...animation} keyPoints={circuit.keyPoints.join(';')}>
          <mpath href={`#${lineId}`} />
        </animateMotion>
      </g>
    </svg>
  );
}
