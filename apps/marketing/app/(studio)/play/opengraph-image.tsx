import { ImageResponse } from 'next/og';

import { night, nunito, publicImage, shareImageSize } from '@/lib/share-image';
import { games, sparkPath, type Game } from '@/lib/studio';

// Play's share image: the page's headline over a card for each game, in that game's own colors.

const eyebrow = 'BrightBench games';
const headline = ['Family-friendly games', 'for iPhone and iPad.'];

export const alt = `${eyebrow}: ${games.map((game) => game.name).join(' and ')}`;
export const contentType = 'image/png';
export const size = shareImageSize;

/** Each game's water and light, as play.module.css tints its section. */
const tints: Record<string, { accent: string; background: string; shade: string }> = {
  'bigger-fish': { accent: '#ffa630', background: '#071530', shade: '7, 21, 48' },
  'double-putt': { accent: '#ffc94a', background: 'linear-gradient(135deg, #10231a 0%, #2f6e43 100%)', shade: '16, 35, 26' },
};
const fallbackTint = { accent: night.gold, background: night.deep, shade: '7, 20, 38' };

export default async function Image() {
  const [cards, fonts] = await Promise.all([
    Promise.all(
      games.map(async (game) => ({
        game,
        icon: await publicImage(game.icon),
        poster: await publicImage(game.video.poster),
      })),
    ),
    Promise.all([
      nunito(900, `${eyebrow.toUpperCase()}${headline.join('')}${games.map((game) => game.name).join('')}`),
      nunito(800, games.map((game) => game.tagline).join('')),
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
        <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
          <svg height="34" viewBox="0 0 24 24" width="34">
            <path d={sparkPath} fill={night.gold} />
          </svg>
          <div style={{ color: night.coral, fontSize: 26, fontWeight: 900, letterSpacing: 4 }}>
            {eyebrow.toUpperCase()}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 14 }}>
          {headline.map((line) => (
            <div key={line} style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2, lineHeight: 1.04 }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 'auto' }}>
          {cards.map((card) => (
            <GameCard key={card.game.slug} {...card} />
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.flat() },
  );
}

/** A game's card: its footage (a wide shot, or its screen standing upright), its icon, name and tagline. */
function GameCard({ game, icon, poster }: { game: Game; icon: string; poster: string }) {
  const tint = tints[game.slug] ?? fallbackTint;
  const wide = game.video.orientation === 'landscape';

  return (
    <div
      style={{
        background: tint.background,
        borderRadius: 30,
        display: 'flex',
        height: 250,
        overflow: 'hidden',
        position: 'relative',
        width: 522,
      }}>
      {wide ? (
        <img
          alt=""
          height={250}
          src={poster}
          style={{ left: 0, objectFit: 'cover', objectPosition: '100% 50%', position: 'absolute', top: 0 }}
          width={522}
        />
      ) : null}
      {/* The copy's side shades into the game's water, as the Play page's sections do. */}
      <div
        style={{
          background: `linear-gradient(90deg, rgba(${tint.shade}, 0.97) 0%, rgba(${tint.shade}, 0.95) 45%, rgba(${tint.shade}, 0) 82%)`,
          display: 'flex',
          height: '100%',
          left: 0,
          position: 'absolute',
          top: 0,
          width: '100%',
        }}
      />
      {wide ? null : (
        <img
          alt=""
          height={262}
          src={poster}
          style={{
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 20,
            position: 'absolute',
            right: 44,
            top: 22,
            transform: 'rotate(6deg)',
          }}
          width={120}
        />
      )}
      <div style={{ bottom: 26, display: 'flex', flexDirection: 'column', left: 30, position: 'absolute' }}>
        <img alt="" height={66} src={icon} style={{ borderRadius: 16 }} width={66} />
        <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1, lineHeight: 1, marginTop: 14 }}>{game.name}</div>
        <div style={{ color: tint.accent, fontSize: 26, fontWeight: 800, marginTop: 8 }}>{game.tagline}</div>
      </div>
    </div>
  );
}
