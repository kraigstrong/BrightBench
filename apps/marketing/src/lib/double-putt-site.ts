// What brightbench.app/doubleputt says about Double Putt, in one place for its pages and metadata. Double Putt is a
// native iOS app built outside this repo (kraigstrong/double-putt); keep these in step with it: the courses
// (MiniGolf/Core/Levels.swift, Levels.lineup), the rules and Settings (README there), and the iOS deployment target.
// Its words follow the game's: a hole is two greens side by side; never "pair", never "hole A" and "hole B".
// The media in public/doubleputt is made by Tools/capture/site.sh there, from the game itself.

/** Where the site lives on brightbench.app. */
export const base = '/doubleputt';

export const game = {
  name: 'Double Putt',
  tagline: 'One swing. Two greens.',
  /** One sentence, for previews. */
  oneLiner: 'A mini golf puzzle game for iPhone: one swing plays two greens at once. Find the putt that drops both.',
  /** The home page's lines under the logo. */
  pitch: ['Every swing plays two greens at once.', 'Find the one putt that drops both.'],
  developer: 'Kraig Strong',
  platform: 'iPhone',
  requirements: 'iPhone with iOS 17 or later.',
  courseCount: 9,
  holesPerCourse: 9,
} as const;

export const totalHoles = game.courseCount * game.holesPerCourse;

/** The public TestFlight group's link, for players who find the site. Empty, the site says it's coming soon. */
const testFlightUrl = '';

/** The App Store link, once it's there: Apple's badge takes over from the beta. */
const appStoreUrl = '';

export type StoreCta =
  | { href: string; kind: 'download'; label: string }
  | { betaHref?: string; kind: 'comingSoon' };

function httpsUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && /^https:\/\//.test(trimmed) ? trimmed : undefined;
}

/**
 * What the site offers players. Apple's Download badge is licensed only for an app that's on the App Store; before
 * that the site says it's coming, and invites players into the beta when there's a public TestFlight link.
 */
export function storeCta(links: { appStoreUrl?: string; testFlightUrl?: string } = { appStoreUrl, testFlightUrl }): StoreCta {
  const href = httpsUrl(links.appStoreUrl);
  if (href) return { href, kind: 'download', label: 'Download on the App Store' };
  return { betaHref: httpsUrl(links.testFlightUrl), kind: 'comingSoon' };
}

/** Apple's official App Store badge, used unmodified (developer.apple.com/app-store/marketing/guidelines). */
export const appStoreBadgeSrc = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';

export const contactEmail = 'support@brightbench.app';

/** A swing, in three steps. Each still is the whole screen; `focus` is the part a card shows (object-position). */
export const beats = [
  {
    title: 'Aim once.',
    body: 'Pull back anywhere to aim. Both balls take the same swing.',
    image: `${base}/beats/aim.jpg`,
    focus: '50% 90%',
    alt: 'Aiming on Reflection: a finger pulls back below the left ball, and a guide shows each ball its line.',
  },
  {
    title: 'Same or Mirror.',
    body: 'Send the other ball the same way, or flip its shot left to right. Pick before every swing.',
    image: `${base}/beats/mirror.jpg`,
    focus: '50% 90%',
    alt: 'Mirror on: the two guides point away from each other, toward cups on opposite sides.',
  },
  {
    title: 'Drop both.',
    body: "Every hole has a swing that sinks both balls. Find it, and the hole's trophy is yours.",
    image: `${base}/beats/double-ace.jpg`,
    focus: '50% 14%',
    alt: 'Both balls in on Grand Finale under the fireworks, an Ace! over each cup.',
  },
] as const;

export type CourseCard = { slug: string; name: string; line: string; alt: string };

/** The courses, in the game's order. Each has a loop of a double ace on one of its holes. */
export const courses: CourseCard[] = [
  {
    slug: 'daybreak',
    name: 'Daybreak',
    line: 'A spring meadow, a walled garden and a castle moat. Where it starts.',
    alt: 'Reflection: two matching greens in a spring meadow, both balls rolling to their cups.',
  },
  {
    slug: 'nightfall',
    name: 'Nightfall',
    line: 'Autumn leaves, a desert canyon, a snowy windmill and lanterns after dark.',
    alt: 'Windmill: both balls slipping past the turning blades in the snow.',
  },
  {
    slug: 'thunderhead',
    name: 'Thunderhead',
    line: 'Dunes, sundials and ice bridges, and no two greens alike.',
    alt: 'Sundial: two walled-garden greens, each ball timing its way past a turning arm.',
  },
  {
    slug: 'midway',
    name: 'Midway',
    line: 'The fair by day: springboards, teacups and a merry-go-round.',
    alt: 'Springboard: a ball launched off a springboard over a duck pond.',
  },
  {
    slug: 'bigtop',
    name: 'Big Top',
    line: 'Under the circus tent: a human cannonball, spinning plates and a tightrope.',
    alt: 'Human Cannonball: two greens in the circus ring, both balls dropping.',
  },
  {
    slug: 'fireworks',
    name: 'Fireworks',
    line: 'The fair at night, a ghost train, and a grand finale.',
    alt: 'Grand Finale at night: pipes, carousels and fireworks, both balls dropping.',
  },
  {
    slug: 'links',
    name: 'The Links',
    line: 'A windswept seaside links. Read the slopes, and mind the sand.',
    alt: 'Two Tiers: a slope grid over two greens, both balls curling to their cups.',
  },
  {
    slug: 'stadium',
    name: 'The Stadium',
    line: 'A tournament course of ponds, pine straw and grandstands to bank off.',
    alt: 'Island Green: one ball rolling out to a green in the middle of a lake.',
  },
  {
    slug: 'starbase',
    name: 'Starbase',
    line: 'A space station of teleporters, patrol robots and force fields.',
    alt: 'Teleporter: a ball zipping through a teleporter pad on a space station.',
  },
];

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'How do you play?',
    answer:
      'Pull back anywhere on the course to aim, then tap Putt. Each green has its own ball and cup, and one swing moves both balls.',
  },
  {
    question: 'What do Same and Mirror do?',
    answer:
      "Same sends both balls the same way. Mirror flips the other ball's shot left to right. You choose before each swing.",
  },
  {
    question: "Can a ball drop in the other green's cup?",
    answer: 'Yes. Any ball can drop in any cup, one ball to a cup.',
  },
  {
    question: 'How does scoring work?',
    answer:
      "Each green is scored on its own, and a hole's par is both greens' together. A course is a round of nine holes: finish at par or better for bronze, four under for silver, and eight under for gold.",
  },
  {
    question: "What's a double ace?",
    answer:
      "Both balls in with the first swing. Every hole has one, and finding it wins the hole's trophy, in a round or in Free Play.",
  },
  {
    question: 'Is there a hint?',
    answer: "Tap the hole's name at the top of the screen. To see the tips again, pause and choose How to Play.",
  },
  {
    question: 'How do I turn the sound off?',
    answer: "Tap the gear on the title screen for Settings. Sound also follows your iPhone's silent switch.",
  },
  {
    question: 'Does it need an internet connection?',
    answer:
      'No. It sends anonymous gameplay counts when it can, to help tune the courses, and works the same without them. The privacy policy has the details.',
  },
  {
    question: "I'm testing the beta. How do I send feedback?",
    answer:
      'Take a screenshot while playing and share it with TestFlight, or use Send Beta Feedback in the TestFlight app. Email works too.',
  },
];
