import { ImageResponse } from 'next/og';

import { night, nunito, publicImage, shareImageSize } from '@/lib/share-image';
import { featuredProductCards } from '@/lib/site';
import { games, sparkPath, studio } from '@/lib/studio';

// The home page's share image: the front door in small, its two doors and all.

export const alt = `${studio.name}: ${studio.tagline}`;
export const contentType = 'image/png';
export const size = shareImageSize;

const playLine = games.map((game) => game.name).join(' · ');
const learnLine = featuredProductCards.map((app) => app.name).join(' · ');

export default async function Image() {
  const [landscape, portrait] = [
    games.find((game) => game.video.orientation === 'landscape'),
    games.find((game) => game.video.orientation === 'portrait'),
  ];
  const [water, greens, fox, fonts] = await Promise.all([
    landscape ? publicImage(landscape.video.poster) : undefined,
    portrait ? publicImage(portrait.video.poster) : undefined,
    publicImage('/mascots/brightbench-fox-sitting.png'),
    Promise.all([
      nunito(900, `${studio.name}${studio.tagline}PlayLearn`),
      nunito(800, `${playLine}${learnLine}`),
    ]),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: `radial-gradient(90% 80% at 10% 0%, ${night.ink} 0%, ${night.night} 70%)`,
          color: night.cream,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Nunito',
          height: '100%',
          padding: '50px 64px 60px',
          width: '100%',
        }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 20 }}>
          <svg height="68" viewBox="0 0 24 24" width="68">
            <path d={sparkPath} fill={night.gold} />
          </svg>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: -3, lineHeight: 1 }}>{studio.name}</div>
        </div>
        <div style={{ color: night.gold, fontSize: 46, fontWeight: 900, marginTop: 14 }}>{studio.tagline}</div>

        <div style={{ display: 'flex', gap: 28, marginTop: 'auto' }}>
          <div
            style={{
              background: night.deep,
              borderRadius: 30,
              display: 'flex',
              height: 270,
              overflow: 'hidden',
              position: 'relative',
              width: 522,
            }}>
            {water ? (
              // Bigger enough than the card, and high enough, that its fish swim above the door's name.
              <img alt="" height={372} src={water} style={{ left: -50, position: 'absolute', top: -100 }} width={809} />
            ) : null}
            <div
              style={{
                background: 'linear-gradient(0deg, rgba(7, 20, 38, 0.92) 0%, rgba(7, 20, 38, 0) 70%)',
                display: 'flex',
                height: '100%',
                left: 0,
                position: 'absolute',
                top: 0,
                width: '100%',
              }}
            />
            {greens ? (
              <img
                alt=""
                height={252}
                src={greens}
                style={{
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 20,
                  position: 'absolute',
                  right: 40,
                  top: 26,
                  transform: 'rotate(6deg)',
                }}
                width={116}
              />
            ) : null}
            <Door line={playLine} lineColor={night.muted} title="Play" titleColor={night.cream} />
          </div>

          <div
            style={{
              background: `radial-gradient(70% 90% at 72% 60%, #fbe0c8 0%, ${night.paper} 100%)`,
              borderRadius: 30,
              display: 'flex',
              height: 270,
              overflow: 'hidden',
              position: 'relative',
              width: 522,
            }}>
            <img alt="" height={260} src={fox} style={{ position: 'absolute', right: -34, top: 18 }} width={390} />
            <Door line={learnLine} lineColor="#5b6c7d" title="Learn" titleColor={night.ink} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.flat() },
  );
}

/** A door's name and what's behind it, in its bottom-left corner. */
function Door({ line, lineColor, title, titleColor }: { line: string; lineColor: string; title: string; titleColor: string }) {
  return (
    <div style={{ bottom: 24, display: 'flex', flexDirection: 'column', left: 32, position: 'absolute' }}>
      <div style={{ color: titleColor, fontSize: 68, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>{title}</div>
      <div style={{ color: lineColor, fontSize: 24, fontWeight: 800, marginTop: 8 }}>{line}</div>
    </div>
  );
}
