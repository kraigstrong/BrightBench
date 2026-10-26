// What brightbench.app says about the studio and its games, for the home page and Play.
// Each game has its own site, which is where its facts come from: keep these in step with
// apps/bigger-fish-site/src/lib/game.ts and apps/double-putt-site/src/lib/site.ts.

export const studio = {
  name: 'BrightBench',
  title: 'BrightBench: Family-friendly games and learning apps',
  tagline: 'Games to play. Apps to learn.',
  description:
    'BrightBench is an independent studio making family-friendly games and focused learning apps for kids.',
  /** What every game promises; both game sites say it word for word. */
  promise: 'No ads. No accounts. Plays offline.',
  developer: 'Kraig Strong',
} as const;

/** The studio's mark, a four-point spark, on a 24-unit square: for the header, the footer and the share images. */
export const sparkPath =
  'M12 1.5c.9 5.4 3.6 8.6 10.5 10.5-6.9 1.9-9.6 5.1-10.5 10.5-.9-5.4-3.6-8.6-10.5-10.5C8.4 10.1 11.1 6.9 12 1.5Z';

export type Game = {
  slug: string;
  name: string;
  /** The game's own site, the one place it's sold from. */
  url: string;
  /** Its site's address as shown: "biggerfish.app". */
  domain: string;
  trailerUrl: string;
  /** "A one-touch arcade game", finishing "… for iPhone and iPad". */
  genre: string;
  tagline: string;
  pitch: string[];
  facts: string[];
  /** Where it is in release. */
  status: string;
  icon: string;
  video: { src: string; poster: string; orientation: 'landscape' | 'portrait' };
  /** Decorative media gets no description; this is the game in words, for anyone who can't see it. */
  alt: string;
};

export const games: Game[] = [
  {
    slug: 'bigger-fish',
    name: 'Bigger Fish',
    url: 'https://biggerfish.app',
    domain: 'biggerfish.app',
    trailerUrl: 'https://biggerfish.app/#trailer',
    genre: 'A one-touch arcade game',
    tagline: 'Eat fast. Stay alive.',
    pitch: ['Eat smaller fish. Dodge bigger ones.', 'Win the food race.'],
    facts: ['5 worlds', '75 levels', 'iPhone and iPad'],
    // The App Store release day (game.releaseDay there). Switch this at launch.
    status: 'Coming November 3',
    icon: '/games/bigger-fish/icon.png',
    video: {
      orientation: 'landscape',
      poster: '/games/bigger-fish/hero-poster.jpg',
      src: '/games/bigger-fish/hero.mp4',
    },
    alt: 'The orange player fish swimming through blue water among bigger and smaller fish.',
  },
  {
    slug: 'double-putt',
    name: 'Double Putt',
    url: 'https://doubleputt.app',
    domain: 'doubleputt.app',
    trailerUrl: 'https://doubleputt.app/#trailer',
    genre: 'A mini golf puzzle game',
    tagline: 'One swing. Two greens.',
    pitch: ['Every swing plays two greens at once.', 'Find the one putt that drops both.'],
    facts: ['9 courses', '81 holes', 'iPhone and iPad'],
    // In TestFlight beta, with no public link yet. Switch this at launch.
    status: 'In beta',
    icon: '/games/double-putt/icon.png',
    video: {
      orientation: 'portrait',
      poster: '/games/double-putt/hero-poster.jpg',
      src: '/games/double-putt/hero.mp4',
    },
    alt: 'Reflection: two matching greens side by side, one swing rolling both balls toward their cups.',
  },
];
