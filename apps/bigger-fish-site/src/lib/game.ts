// What the site says about Bigger Fish, in one place for the home page, the press kit, and metadata.
// Bigger Fish is a native iOS app built outside this repo (kraigstrong/bigger-fish); keep these facts in step
// with it: world names and mottos (ArcadeCampaign.swift), level counts, the iOS deployment target.

export const game = {
  name: 'Bigger Fish',
  tagline: 'Eat fast. Stay alive.',
  /** One sentence, for previews and the press kit's one-liner. */
  oneLiner:
    'A one-touch arcade game about eating smaller fish, dodging bigger ones, and racing the fish you leave behind.',
  /** The home page's line under the logo. */
  pitch: 'Eat smaller fish. Dodge bigger ones. And hurry: the fish you pass keep eating too.',
  developer: 'Kraig Strong',
  platform: 'iPhone',
  requirements: 'iPhone with iOS 17 or later. Plays in landscape.',
  worldCount: 4,
  levelsPerWorld: 10,
  deepEndLevels: 5,
} as const;

export const totalLevels = game.worldCount * (game.levelsPerWorld + game.deepEndLevels);

/** The press kit's fact sheet (its website and contact come from the site's settings). */
export const facts: { label: string; value: string }[] = [
  { label: 'Developer', value: `${game.developer}, independent` },
  { label: 'Release', value: 'Coming soon (in beta on TestFlight)' },
  { label: 'Platform', value: 'iPhone, iOS 17 or later' },
  { label: 'Price', value: 'To be announced' },
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
    title: 'They grow too.',
    body: 'Skip a fish and it keeps feeding behind you. Eat it on the first pass.',
    image: '/media/beats/they-grow-too.jpg',
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
    line: 'Kelp slows you down and hides fish as shadows until you get close.',
    slug: 'kelp-forest',
    screenshot: '/screenshots/kelp-forest.png',
    screenshotAlt: 'Kelp Forest: dark fish silhouettes hidden in tall kelp, one big fish revealed.',
  },
  {
    name: 'Midnight Zone',
    motto: 'Light the way. Mind the dark.',
    line: 'Your headlamp only reaches so far. Every glowing lure could belong to something bigger.',
    slug: 'midnight-zone',
    screenshot: '/screenshots/midnight-zone.png',
    screenshotAlt: "Midnight Zone: the player's headlamp beam lighting up anglerfish lures in the dark.",
  },
];

/** Press kit descriptions, from short to long. */
export const descriptions = {
  short:
    'Bigger Fish is a one-touch arcade game for iPhone. Hold anywhere to rise, let go to fall, and eat every fish smaller than you. The catch: the fish you pass keep eating too. Skip a meal and it grows behind you, until it is big enough to come back for you.',
  long: [
    'Bigger Fish is a one-touch arcade game for iPhone about the food chain, and how quickly it turns. You start small. Hold anywhere on the screen to rise, let go to fall, and swim into anything smaller than you. Each meal makes you bigger, so the fish that threatened you a moment ago become your next target.',
    'But you are not the only one eating. Every fish you pass keeps feeding behind you, and a meal you skip can grow into the fish that ends your run. Eat fast, and eat on the first pass.',
    'Across four worlds the hunt keeps changing: bounce off jellyfish in Jelly Bloom, read the shadows in Kelp Forest, and follow a narrow headlamp through the Midnight Zone, where every glowing lure might belong to something bigger. Each world has ten levels, then a Deep End of five more.',
  ],
} as const;

export const features = [
  'One-touch controls: hold anywhere to rise, let go to fall.',
  'A living food chain: the fish you pass keep eating and growing.',
  'Four worlds, each with its own twist: jellyfish, kelp, and the dark.',
  `${totalLevels} levels, including a five-level Deep End in every world.`,
  'Short runs built for one more try.',
  'No ads, no accounts, and it plays offline.',
] as const;
