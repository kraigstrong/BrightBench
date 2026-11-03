import { ImageResponse } from 'next/og';

import { circuits, ghostThread } from '@/lib/ghost-thread';
import { nunito, publicImage, shareImageSize } from '@/lib/share-image';

// Ghost Thread's share image: the logo and tagline on the trackside's mown grass, over every circuit with its ideal
// line threaded on, as the page draws them.

export const alt = `${ghostThread.name}: ${ghostThread.tagline}`;
export const contentType = 'image/png';
export const size = shareImageSize;

const grass = '#4a8040';
const grassLight = '#548f47';
const thread = '#ffd11a';

export default async function Image() {
  const [logo, icon, fonts] = await Promise.all([
    publicImage('/games/ghost-thread/logo.png'),
    publicImage('/games/ghost-thread/icon.png'),
    nunito(900, `${ghostThread.tagline}${ghostThread.platform.toUpperCase()}A ONE-TOUCH RACING GAME FOR `),
  ]);
  const eyebrow = `A one-touch racing game for ${ghostThread.platform}`.toUpperCase();
  const cardWidth = 172;
  const cardHeight = 128;
  /** Each circuit as big as its card holds, at its own proportions: the image renderer stretches an SVG to whatever
   *  box it's given, ignoring its viewBox's shape. */
  const margin = 40;
  const fit = (circuit: (typeof circuits)[number]) => {
    const width = circuit.width + margin * 2;
    const height = circuit.height + margin * 2;
    const scale = Math.min((cardWidth - 24) / width, (cardHeight - 24) / height);
    return { height: Math.round(height * scale), width: Math.round(width * scale) };
  };

  return new ImageResponse(
    (
      <div
        style={{
          background: grass,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Nunito',
          height: '100%',
          padding: '48px 56px 52px',
          position: 'relative',
          width: '100%',
        }}>
        {/* The stripes lean as the track list's do. */}
        <svg height="630" style={{ left: 0, position: 'absolute', top: 0 }} viewBox="0 0 1200 630" width="1200">
          {Array.from({ length: 14 }, (_, i) => {
            const x = i * 140 - 230;
            return <polygon fill={grassLight} key={x} points={`${x + 230},0 ${x + 300},0 ${x + 70},630 ${x},630`} />;
          })}
        </svg>
        <div style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
          <img alt="" height={56} src={icon} style={{ borderRadius: 13 }} width={56} />
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3 }}>{eyebrow}</div>
        </div>
        <img alt="" height={150} src={logo} style={{ marginLeft: -6, marginTop: 18 }} width={804} />
        <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: -1, marginTop: 4 }}>{ghostThread.tagline}</div>

        <div style={{ display: 'flex', gap: 14, marginTop: 'auto' }}>
          {circuits.map((circuit) => (
            <div
              key={circuit.id}
              style={{
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.55)',
                borderRadius: 18,
                display: 'flex',
                height: cardHeight,
                justifyContent: 'center',
                width: cardWidth,
              }}>
              <svg
                height={fit(circuit).height}
                viewBox={`${-margin} ${-margin} ${circuit.width + margin * 2} ${circuit.height + margin * 2}`}
                width={fit(circuit).width}>
                <path d={circuit.outline} fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth={22} />
                <path d={circuit.line} fill="none" stroke={thread} strokeWidth={22} />
              </svg>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.flat() },
  );
}
