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

/**
 * Where each game's card lies in the Play door, as on the page: the second over the first's far corner, clear of its
 * name (the left half of each card's art).
 */
const cardPlacements = [
  { left: 182, rotate: -5, top: 22 },
  { left: 290, rotate: 4, top: 96 },
];
const cardSize = { height: 110, width: 210 };

export default async function Image() {
  const [keyArts, fox, fonts] = await Promise.all([
    Promise.all(
      games.slice(0, cardPlacements.length).map(async (game) => ({ slug: game.slug, src: await publicImage(game.keyArt) })),
    ),
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
              background: `radial-gradient(70% 90% at 60% 35%, #1b4672 0%, ${night.night} 100%)`,
              borderRadius: 30,
              display: 'flex',
              height: 270,
              overflow: 'hidden',
              position: 'relative',
              width: 522,
            }}>
            {keyArts.map((art, index) => (
              <img
                alt=""
                height={cardSize.height}
                key={art.slug}
                src={art.src}
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 10,
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5)',
                  left: cardPlacements[index]?.left,
                  position: 'absolute',
                  top: cardPlacements[index]?.top,
                  transform: `rotate(${cardPlacements[index]?.rotate}deg)`,
                }}
                width={cardSize.width}
              />
            ))}
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
