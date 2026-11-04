import { ImageResponse } from "next/og";

import { night, nunito, publicImage, shareImageSize } from "@/lib/share-image";
import { games, sparkPath, type Game } from "@/lib/studio";

// Play's share image: the page's headline over a card for each game, in that game's own colors, side by side across
// the image's width.

const eyebrow = "BrightBench games";
const headline = ["Family-friendly games", "for iPhone and iPad."];

export const alt = `${eyebrow}: ${new Intl.ListFormat("en", { type: "conjunction" }).format(games.map((game) => game.name))}`;
export const contentType = "image/png";
export const size = shareImageSize;

/** Each game's water and light, as play.module.css tints its section. */
const tints: Record<
  string,
  { accent: string; background: string; shade: string }
> = {
  "bigger-fish": {
    accent: "#ffa630",
    background: "#071530",
    shade: "7, 21, 48",
  },
  "double-putt": {
    accent: "#ffc94a",
    background: "linear-gradient(135deg, #10231a 0%, #2f6e43 100%)",
    shade: "16, 35, 26",
  },
  "ghost-thread": {
    accent: "#ffd11a",
    background: "linear-gradient(135deg, #0b1d33 0%, #3f7536 100%)",
    shade: "17, 40, 27",
  },
};
const fallbackTint = {
  accent: night.gold,
  background: night.deep,
  shade: "7, 20, 38",
};

/** The cards share the width inside the image's padding: three of them are 344 wide. */
const padding = 64;
const gap = 20;
const card = {
  height: 270,
  width: Math.floor(
    (shareImageSize.width - 2 * padding - gap * (games.length - 1)) /
      games.length,
  ),
};

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
      nunito(
        900,
        `${eyebrow.toUpperCase()}${headline.join("")}${games.map((game) => game.name).join("")}`,
      ),
      nunito(800, games.map((game) => game.tagline).join("")),
    ]),
  ]);

  return new ImageResponse(
    <div
      style={{
        background: `radial-gradient(90% 80% at 10% 0%, ${night.ink} 0%, ${night.night} 70%)`,
        color: night.cream,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Nunito",
        height: "100%",
        padding: `50px ${padding}px 60px`,
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
        <svg height="34" viewBox="0 0 24 24" width="34">
          <path d={sparkPath} fill={night.gold} />
        </svg>
        <div
          style={{
            color: night.coral,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 4,
          }}
        >
          {eyebrow.toUpperCase()}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
        {headline.map((line) => (
          <div
            key={line}
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1.04,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap, marginTop: "auto" }}>
        {cards.map((card) => (
          <GameCard key={card.game.slug} {...card} />
        ))}
      </div>
    </div>,
    { ...size, fonts: fonts.flat() },
  );
}

/** A game's card: its footage (a wide shot, or its screen standing upright), its icon, name and tagline. */
function GameCard({
  game,
  icon,
  poster,
}: {
  game: Game;
  icon: string;
  poster: string;
}) {
  const tint = tints[game.slug] ?? fallbackTint;
  const wide = game.video.orientation === "landscape";

  return (
    <div
      style={{
        background: tint.background,
        borderRadius: 26,
        display: "flex",
        height: card.height,
        overflow: "hidden",
        position: "relative",
        width: card.width,
      }}
    >
      {wide ? (
        <img
          alt=""
          height={card.height}
          src={poster}
          style={{
            left: 0,
            objectFit: "cover",
            objectPosition: "100% 50%",
            position: "absolute",
            top: 0,
          }}
          width={card.width}
        />
      ) : null}
      {/* The copy's side shades into the game's water, as the Play page's sections do. */}
      <div
        style={{
          background: `linear-gradient(90deg, rgba(${tint.shade}, 0.97) 0%, rgba(${tint.shade}, 0.95) 45%, rgba(${tint.shade}, 0) 82%)`,
          display: "flex",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      {wide ? null : (
        <img
          alt=""
          height={182}
          src={poster}
          style={{
            border: "3px solid rgba(255, 255, 255, 0.3)",
            borderRadius: 16,
            position: "absolute",
            right: 12,
            top: 12,
            transform: "rotate(6deg)",
          }}
          width={84}
        />
      )}
      <div
        style={{
          bottom: 22,
          display: "flex",
          flexDirection: "column",
          left: 24,
          position: "absolute",
          right: 24,
        }}
      >
        <img
          alt=""
          height={54}
          src={icon}
          style={{ borderRadius: 14 }}
          width={54}
        />
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: -1,
            lineHeight: 1,
            marginTop: 12,
          }}
        >
          {game.name}
        </div>
        {/* A sentence a line, so a longer tagline ("Race your ghost. Thread the line.") never leaves a word alone. */}
        <div
          style={{
            color: tint.accent,
            display: "flex",
            flexDirection: "column",
            fontSize: 21,
            fontWeight: 800,
            lineHeight: 1.15,
            marginTop: 6,
          }}
        >
          {game.tagline.split(/(?<=\.)\s+/).map((sentence) => (
            <div key={sentence}>{sentence}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
