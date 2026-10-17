// What the site says about Bigger Fish, in one place for the home page, the press kit, and metadata.
// Bigger Fish is a native iOS app built outside this repo (kraigstrong/bigger-fish); keep these facts in step
// with it: world names and mottos (ArcadeCampaign.swift), level counts, the iOS deployment target.

export const game = {
  name: 'Bigger Fish',
  tagline: 'Eat fast. Stay alive.',
  /** One sentence, for previews and the press kit's one-liner. */
  oneLiner:
    'A one-touch arcade game: eat smaller fish, dodge bigger ones, and outgrow them all.',
  /** What it costs. */
  offer: 'The first world is free. One $4.99 purchase unlocks every level.',
  /** The home page's lines under the logo. */
  pitch: ['Eat smaller fish. Dodge bigger ones.', 'Win the food race.'],
  /**
   * The home page's closing line. From the TestFlight beta's anonymous stats, Sep 18 to Oct 17, 2026: 3,076 of
   * 3,143 lost runs ended in a retry (97.9%). It counts runs, not people, so keep "of lost runs".
   */
  retryLine: 'In the beta, players tried again after 98% of lost runs.',
  developer: 'Kraig Strong',
  /** The App Store release day, announced before launch. */
  releaseDay: 'November 3',
  releaseYear: 2026,
  platform: 'iPhone and iPad',
  requirements: 'iPhone with iOS 17 or later, or iPad with iPadOS 17 or later. Plays in landscape.',
  worldCount: 5,
  levelsPerWorld: 10,
  deepEndLevels: 5,
} as const;

export const totalLevels = game.worldCount * (game.levelsPerWorld + game.deepEndLevels);

/** The press kit's fact sheet (its website and contact come from the site's settings). */
export const facts: { label: string; value: string }[] = [
  { label: 'Developer', value: `${game.developer}, independent` },
  { label: 'Release', value: `${game.releaseDay}, ${game.releaseYear} (in beta on TestFlight until then)` },
  { label: 'Platform', value: 'iPhone and iPad, iOS 17 and iPadOS 17 or later' },
  { label: 'Price', value: 'First world free, plus the first two levels of every other world; one $4.99 purchase unlocks every level' },
  { label: 'Genre', value: 'Arcade' },
  { label: 'Players', value: 'Single player' },
  { label: 'Controls', value: 'One touch, landscape' },
  { label: 'Levels', value: `${totalLevels} across ${game.worldCount} worlds` },
  { label: 'Languages', value: 'English' },
];

/** The core loop, in the trailer's words. */
export const beats = [
  {
    title: 'Eat.',
    body: 'Hold anywhere to rise. Let go to fall. Anything smaller than you is lunch.',
    image: '/media/beats/eat.jpg',
    alt: 'The orange player fish, mouth open, chasing a smaller fish through Shallow Reef.',
  },
  {
    title: 'Grow.',
    body: 'Every meal makes you bigger, and bigger fish join the menu.',
    image: '/media/beats/grow.jpg',
    alt: 'The player fish, grown bigger, swallowing a spotted green fish nearly its own size.',
  },
  {
    title: 'Win the food race.',
    body: 'Every fish is eating. Outgrow them before they outgrow you.',
    image: '/media/beats/win-the-food-race.jpg',
    alt: 'The player fish face to face with a school of fish that have grown bigger than it.',
  },
] as const;

export type World = {
  name: string;
  motto: string;
  line: string;
  slug: string;
  screenshot: string;
  screenshotAlt: string;
};

export const worlds: World[] = [
  {
    name: 'Shallow Reef',
    motto: 'Eat. Dodge. Grow.',
    line: 'Bright water and a fast food chain.',
    slug: 'shallow-reef',
    screenshot: '/screenshots/shallow-reef.png',
    screenshotAlt: 'Shallow Reef: bright blue water full of colorful fish.',
  },
  {
    name: 'Jelly Bloom',
    motto: 'Bounce the tops. Dodge the tentacles.',
    line: 'Jellyfish domes launch you upward. Their tentacles sting.',
    slug: 'jelly-bloom',
    screenshot: '/screenshots/jelly-bloom.png',
    screenshotAlt: 'Jelly Bloom: purple water with glowing jellyfish among the fish.',
  },
  {
    name: 'Kelp Forest',
    motto: "Dive into the kelp. Mind what's hiding.",
    line: 'Kelp slows you down. Deep in it, fish show only their bubbles until you get close.',
    slug: 'kelp-forest',
    screenshot: '/screenshots/kelp-forest.png',
    screenshotAlt: 'Kelp Forest: bubbles rising from a fish hidden in tall kelp, a big fish out in the open water.',
  },
  {
    name: 'Sunset Cove',
    motto: 'Watch the boats. Leave the bait.',
    line: 'Boats pass overhead trailing baited hooks. The easiest meal in the water is a trap.',
    slug: 'sunset-cove',
    screenshot: '/screenshots/sunset-cove.png',
    screenshotAlt: 'Sunset Cove: pink evening water under three boats, their baited hooks hanging among the fish.',
  },
  {
    name: 'Midnight Zone',
    motto: 'Light the way. Mind the dark.',
    line: 'Your headlamp only reaches so far. Every glowing lure could belong to something bigger.',
    slug: 'midnight-zone',
    screenshot: '/screenshots/midnight-zone.png',
    screenshotAlt: "Midnight Zone: the beam from the player's own lure lighting up anglerfish in the dark.",
  },
];

/** Press kit descriptions, from short to long. */
export const descriptions = {
  short:
    'Bigger Fish is a one-touch arcade game for iPhone and iPad. Hold anywhere to rise, let go to fall, and eat every fish smaller than you. The catch: they grow too. Outgrow them to survive.',
  long: [
    'Bigger Fish is a one-touch arcade game for iPhone and iPad about the food chain, and how quickly it turns. You start small. Hold anywhere on the screen to rise, let go to fall, and swim into anything smaller than you. Each meal makes you bigger, so the fish that threatened you a moment ago become your next target.',
    'But you are not the only one eating. Every fish around you is growing too, and it only takes one bigger fish to end your run. Eat fast, and stay one size ahead. Runs are over in seconds, and in the beta, players tried again after 98% of the runs they lost.',
    'Across five worlds the hunt keeps changing: bounce off jellyfish in Jelly Bloom, follow the bubbles in Kelp Forest, steer clear of baited hooks in Sunset Cove, and follow a narrow headlamp through the Midnight Zone, where every glowing lure might belong to something bigger. Each world has ten levels, then a Deep End of five more.',
  ],
} as const;

export const features = [
  'One-touch controls: hold anywhere to rise, let go to fall.',
  'A living food chain: every fish is eating and growing, just like you.',
  'Five worlds, each with its own twist: jellyfish, kelp, fishing hooks, and the dark.',
  `${totalLevels} levels, including a five-level Deep End in every world.`,
  // 86% of the beta's runs ended within 10 seconds (same stats as `game.retryLine`).
  'Short runs built for one more try: most last under ten seconds.',
  'No ads, no accounts, and it plays offline.',
] as const;
