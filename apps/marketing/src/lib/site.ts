import {
  buildDefaultPrivacySummary,
  buildDefaultSupportIntro,
} from '@education/legal-pages';

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@timetutor.app';
const timeTutorAppStoreUrl =
  process.env.NEXT_PUBLIC_TIME_TUTOR_APP_STORE_URL ||
  'https://apps.apple.com/app/time-tutor-clock-practice/id6761587276';
const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.replace(/\/$/, '');

/**
 * Canonical origin for sitemap, robots, and absolute URLs when env is unset
 * (e.g. local dev or Vercel preview with VERCEL_URL).
 */
export function getPublicSiteOrigin(): string {
  if (siteOrigin) {
    return siteOrigin;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export type PageCta = {
  external?: boolean;
  href?: string;
  label: string;
  note?: string;
};

export type FaqItem = {
  answer: string;
  question: string;
};

export type RelatedLink = {
  description: string;
  href: string;
  label: string;
};

export type HighlightItem = {
  body: string;
  title: string;
};

export type ContentSection = {
  body: string[];
  bullets?: string[];
  title: string;
};

export type ProductCard = {
  accent: string;
  appStoreUrl?: string;
  availability: 'coming-soon' | 'in-progress' | 'live';
  blurb: string;
  href: string;
  name: string;
  status: string;
};

type BaseDiscoveryPage = {
  faqItems: FaqItem[];
  h1: string;
  metaDescription: string;
  pageTitle: string;
  primaryCta: PageCta;
  primaryTopic: string;
  relatedLinks: RelatedLink[];
  secondaryCta?: PageCta;
  slug: string;
};

export type ProductPage =
  | (BaseDiscoveryPage & {
      audience: string;
      discoverabilityCallout?: {
        body: string[];
        title: string;
      };
      heroEyebrow: string;
      intro: string[];
      kind: 'app';
      learningItems: string[];
      modeItems: HighlightItem[];
      practiceItems: string[];
      proofPoints: string[];
      status: string;
      trustItems: HighlightItem[];
      usageItems: string[];
    })
  | (BaseDiscoveryPage & {
      heroEyebrow: string;
      intro: string[];
      kind: 'placeholder';
      noindex: true;
      sections: ContentSection[];
      status: string;
    });

export type LearnPage = BaseDiscoveryPage & {
  heroEyebrow: string;
  intro: string[];
  sections: ContentSection[];
};

export const siteMeta = {
  description:
    'BrightBench builds focused educational apps that help tricky elementary concepts feel clear, calm, and approachable.',
  origin: siteOrigin,
  supportEmail,
  timeTutorAppStoreUrl,
  title: 'BrightBench',
};

export const productCards: ProductCard[] = [
  {
    accent: '#E97A5F',
    availability: 'in-progress',
    blurb:
      'Build fraction intuition through seeing, estimating, comparing, and creating fractions.',
    href: '/products/fraction-finder',
    name: 'Fraction Finder',
    status: 'In progress',
  },
  {
    accent: '#E7A54B',
    appStoreUrl: timeTutorAppStoreUrl,
    availability: 'live',
    blurb:
      'Practice analog, digital, and elapsed time with clean, tactile interactions.',
    href: '/products/time-tutor',
    name: 'Time Tutor',
    status: 'Live on the App Store',
  },
  {
    accent: '#6FA5D8',
    availability: 'coming-soon',
    blurb: 'Early literacy practice for letter recognition, sounds, and fluency.',
    href: '/products/letter-bingo',
    name: 'Letter Bingo',
    status: 'Planned',
  },
  {
    accent: '#9A7AD6',
    availability: 'coming-soon',
    blurb:
      'Build place-value understanding through visual grouping, movement, and number sense.',
    href: '/products/place-value',
    name: 'Place Value',
    status: 'Planned',
  },
] as const;

export const productPages: ProductPage[] = [
  {
    audience: 'Grades 1-3',
    faqItems: [
      {
        answer:
          'Time Tutor is designed for kids in grades 1 through 3 who are learning to read clocks, match analog and digital time, and make sense of elapsed time.',
        question: 'What age is Time Tutor for?',
      },
      {
        answer:
          'Yes. Kids work with analog clocks directly and connect them to digital time through both reading and clock-setting activities.',
        question: 'Does it teach analog and digital clocks?',
      },
      {
        answer:
          'Yes. Time Tutor includes a dedicated elapsed time mode so students can work on start time, end time, and duration thinking.',
        question: 'Does it include elapsed time?',
      },
      {
        answer:
          'Time Tutor is an iOS app. Download it from the App Store for the full experience.',
        question: 'Is it a web game or an app?',
      },
      {
        answer:
          'It works well for both. Families can use it for low-pressure home practice, and teachers can use it as a focused supplement for clock and time lessons.',
        question: 'Is it good for home or classroom use?',
      },
      {
        answer:
          'Yes. Time Tutor is built around real clock skills: analog, digital, clock setting, clock reading, and elapsed time.',
        question: 'Is Time Tutor a good telling time game for kids?',
      },
    ],
    h1: 'Help your kid learn to tell time — without the struggle.',
    heroEyebrow: 'Time Tutor',
    intro: [
      'Time Tutor is a simple, self-guided clock practice app for grades 1–3 — kids move at their own pace with clear feedback and no busywork.',
      'Kids learn by doing: read analog clocks, set the hands to match a target time, match analog to digital, and practice elapsed time with clear visual problems.',
    ],
    kind: 'app',
    learningItems: [
      'Read analog clocks with less guessing and more understanding.',
      'Match digital times to the correct position of the clock hands.',
      'Translate what an analog clock shows into digital time.',
      'Work through elapsed time by comparing start and end times visually.',
      'Build confidence through repeatable practice and timed challenge play.',
    ],
    metaDescription:
      'Time Tutor is a telling time game for kids (grades 1–3): analog + digital clock practice, set the clock, read the clock, and elapsed time — calm, clear, and visual on iOS.',
    modeItems: [
      {
        body: 'See analog and digital time side by side before answering, so the connection becomes obvious.',
        title: 'Explore Time',
      },
      {
        body: 'Drag the hands until the analog clock matches a target time, building placement and interval sense.',
        title: 'Set the Clock',
      },
      {
        body: 'Read an analog clock and enter the matching time to build real fluency.',
        title: 'Read the Clock',
      },
      {
        body: 'Compare times and reason about duration with visual clock-based problems.',
        title: 'Elapsed Time',
      },
    ],
    pageTitle:
      'Time Tutor | Telling Time Game for Kids (Time Telling Games)',
    practiceItems: [
      'Practice mode keeps the pace calm so kids can focus on accuracy first.',
      'Challenge mode adds a timer once the concept starts to stick.',
      'Adjust time settings from easier intervals to more precise clock reading.',
      'Download the iOS app from the App Store for the full experience.',
    ],
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download today on the App Store',
    },
    primaryTopic: 'time telling games',
    proofPoints: [
      'Grades 1–3',
      'Analog + digital',
      'Elapsed time',
      'Home + classroom',
    ],
    relatedLinks: [
      {
        description:
          'What to look for in telling time practice, and how Time Tutor maps to it.',
        href: '/learn/time-telling-games',
        label: 'Time telling games for kids',
      },
      {
        description:
          'Analog foundations: reading, setting, and connecting analog to digital time.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
      {
        description:
          'When kids can read clocks more confidently, elapsed time gets easier to reason about.',
        href: '/learn/elapsed-time-practice',
        label: 'Elapsed time practice for kids',
      },
      {
        description:
          'Why moving the hands builds placement skills and interval sense.',
        href: '/learn/set-the-clock-game',
        label: 'Set the clock practice for kids',
      },
      {
        description:
          'Build fluency reading an analog clock and typing the matching digital time.',
        href: '/learn/read-the-clock-game',
        label: 'Read the clock practice for kids',
      },
    ],
    slug: 'time-tutor',
    status: 'Live on the App Store',
    trustItems: [
      {
        body: 'Designed around the clock itself so practice stays clear and repeatable.',
        title: 'Calm and clear',
      },
      {
        body: 'Kids interact with the hands and connect analog to digital in ways that build understanding.',
        title: 'Visual and hands-on',
      },
      {
        body: 'Includes analog reading, clock setting, and elapsed time so progress carries into real-world use.',
        title: 'Real clock skills',
      },
    ],
    usageItems: [
      'Use it at home for short, repeatable sessions when a child needs extra clock practice.',
      'Use it in classrooms as a station, intervention tool, or reinforcement activity during time units.',
      'Use it for short, repeatable sessions that make clock reading feel less frustrating over time.',
    ],
  },
  {
    faqItems: [],
    h1: 'Fraction Finder is in progress',
    heroEyebrow: 'Coming next',
    intro: [
      'Fraction Finder is the next BrightBench product in active development.',
      'Its future page will focus on fraction intuition, comparison, and visual number sense once the public product experience is ready.',
    ],
    kind: 'placeholder',
    metaDescription:
      'Fraction Finder is an in-progress BrightBench app focused on helping kids build fraction intuition through visual practice.',
    noindex: true,
    pageTitle: 'Fraction Finder | BrightBench',
    primaryCta: {
      href: '/',
      label: 'See the BrightBench app lineup',
    },
    primaryTopic: 'fraction learning app',
    relatedLinks: [
      {
        description: 'Return to the BrightBench hub to see live and planned apps.',
        href: '/',
        label: 'BrightBench focused learning apps',
      },
    ],
    sections: [
      {
        body: [
          'This page exists as a roadmap marker, not a finished search landing page. When Fraction Finder is ready for public discovery, it will have a dedicated, standalone page with real product details and stronger learning content.',
        ],
        title: 'What to expect later',
      },
    ],
    slug: 'fraction-finder',
    status: 'In progress',
  },
  {
    faqItems: [],
    h1: 'Letter Bingo is planned',
    heroEyebrow: 'Planned app',
    intro: [
      'Letter Bingo is a planned BrightBench literacy app focused on early letter recognition and sound practice.',
      'It is not yet a public product page, so this page stays lightweight on purpose.',
    ],
    kind: 'placeholder',
    metaDescription:
      'Letter Bingo is a planned BrightBench literacy app focused on early letter recognition and sound practice.',
    noindex: true,
    pageTitle: 'Letter Bingo | BrightBench',
    primaryCta: {
      href: '/',
      label: 'Back to the BrightBench hub',
    },
    primaryTopic: 'letter recognition app',
    relatedLinks: [
      {
        description: 'Return to the BrightBench overview.',
        href: '/',
        label: 'BrightBench educational app suite',
      },
    ],
    sections: [
      {
        body: [
          'This page is a simple product marker until the app has enough substance to deserve its own full discovery page.',
        ],
        title: 'Status',
      },
    ],
    slug: 'letter-bingo',
    status: 'Planned',
  },
  {
    faqItems: [],
    h1: 'Place Value is planned',
    heroEyebrow: 'Planned app',
    intro: [
      'Place Value is a planned BrightBench math app centered on grouping, number sense, and place-value understanding.',
      'It is still a placeholder and is intentionally not positioned as a complete search landing page yet.',
    ],
    kind: 'placeholder',
    metaDescription:
      'Place Value is a planned BrightBench app focused on grouping, place-value understanding, and number sense.',
    noindex: true,
    pageTitle: 'Place Value | BrightBench',
    primaryCta: {
      href: '/',
      label: 'Back to the BrightBench hub',
    },
    primaryTopic: 'place value app',
    relatedLinks: [
      {
        description: 'Return to the BrightBench overview.',
        href: '/',
        label: 'BrightBench educational app suite',
      },
    ],
    sections: [
      {
        body: [
          'This page stays intentionally minimal until the app and its public-facing learning story are ready.',
        ],
        title: 'Status',
      },
    ],
    slug: 'place-value',
    status: 'Planned',
  },
];

export const learnPages: LearnPage[] = [
  {
    faqItems: [
      {
        answer:
          'Many kids can recite clock rules without really seeing what the hands mean. Good practice helps them connect hand position, hour movement, and minute intervals in a visual way.',
        question: 'Why is analog clock reading hard for some kids?',
      },
      {
        answer:
          'Strong analog practice includes reading clocks, setting clocks, and comparing analog time to digital time instead of drilling only one skill.',
        question: 'What makes analog clock practice useful?',
      },
      {
        answer:
          'Yes. Time Tutor includes Explore Time, Set the Clock, and Read the Clock so kids can build analog-clock understanding from different angles.',
        question: 'Can Time Tutor help with analog clock confidence?',
      },
      {
        answer:
          'Yes. It works well for short classroom stations, intervention blocks, and home practice sessions when a child needs calm repetition.',
        question: 'Is it useful for school and home?',
      },
    ],
    h1: 'Analog clock practice for kids',
    heroEyebrow: 'Guides',
    intro: [
      'Analog clock practice works best when kids can see what the hands are doing, try placements themselves, and connect the clock face to real time language.',
      'Time Tutor supports self-guided practice with Explore Time, Set the Clock, and Read the Clock so kids build understanding step by step.',
    ],
    metaDescription:
      'Analog clock practice for grades 1–3: what helps, and how Time Tutor supports it on the App Store.',
    pageTitle: 'Analog Clock Practice for Kids | Time Tutor',
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'analog clock practice',
    relatedLinks: [
      {
        description: 'Modes, ages, and the App Store download.',
        href: '/products/time-tutor',
        label: 'Time Tutor overview',
      },
      {
        description: 'A simple framing for families comparing telling time options.',
        href: '/learn/time-telling-games',
        label: 'Time telling games for kids',
      },
      {
        description: 'When clock reading is steadier, elapsed time gets easier to reason about.',
        href: '/learn/elapsed-time-practice',
        label: 'Elapsed time practice for kids',
      },
      {
        description: 'Practice placing hands to match a target time.',
        href: '/learn/set-the-clock-game',
        label: 'Set the clock practice for kids',
      },
    ],
    secondaryCta: {
      href: '/learn/elapsed-time-practice',
      label: 'Next: elapsed time practice',
    },
    sections: [
      {
        body: [
          'Kids often need to understand that the short hand moves gradually, the long hand controls the minutes, and both hands matter at the same time. If practice isolates only one tiny rule, the full picture never quite lands.',
        ],
        bullets: [
          'Give kids repeated exposure to real clock faces.',
          'Let them read clocks and set clocks instead of only choosing multiple-choice answers.',
          'Connect analog clocks to digital time so the meaning transfers.',
        ],
        title: 'What good analog practice looks like',
      },
      {
        body: [
          'Time Tutor approaches analog clock learning from more than one direction, which helps the concept feel concrete instead of abstract.',
        ],
        bullets: [
          'Explore Time lets kids compare analog and digital time side by side.',
          'Set the Clock asks kids to drag the hands until the clock matches a target time.',
          'Read the Clock asks kids to read the analog display and enter the matching time.',
        ],
        title: 'How Time Tutor helps',
      },
      {
        body: [
          'For many learners, confidence comes from short, repeatable sessions with clean feedback. That matters at home and in classrooms where attention is already stretched.',
        ],
        bullets: [
          'Use it for low-pressure home review.',
          'Use it in centers or intervention blocks at school.',
          'Use challenge mode later, after accuracy starts to stick.',
        ],
        title: 'When to use it',
      },
    ],
    slug: 'analog-clock-practice',
  },
  {
    faqItems: [
      {
        answer:
          'Elapsed time asks kids to keep track of a starting point, an ending point, and the duration between them. That is harder than simply reading one clock.',
        question: 'Why is elapsed time harder than basic clock reading?',
      },
      {
        answer:
          'Clear practice uses start and end times that students can compare visually, then gives them room to reason through the duration step by step.',
        question: 'What does good elapsed time practice include?',
      },
      {
        answer:
          'Yes. Time Tutor includes a dedicated Elapsed Time mode built around visual clock-based problems instead of only worksheet-style prompts.',
        question: 'Does Time Tutor help with elapsed time?',
      },
      {
        answer:
          'Grades 1–3 is a strong fit overall, especially once a child already has some basic familiarity with reading clocks and is ready to reason about time intervals.',
        question: 'What grade range fits elapsed time work?',
      },
    ],
    h1: 'Elapsed time practice for kids',
    heroEyebrow: 'Guides',
    intro: [
      'Elapsed time is where many students first realize that telling time and reasoning about time are different skills. A child may be able to read a clock and still struggle to figure out how much time has passed.',
      'Time Tutor includes a dedicated Elapsed Time mode with visual clock-based problems so kids can connect start time, end time, and duration step by step.',
    ],
    metaDescription:
      'Elapsed time practice for grades 1–3: what helps, and how Time Tutor supports it on the App Store.',
    pageTitle: 'Elapsed Time Practice for Kids | Time Tutor',
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'elapsed time practice',
    relatedLinks: [
      {
        description: 'Modes, ages, and the App Store download.',
        href: '/products/time-tutor',
        label: 'Time Tutor overview',
      },
      {
        description: 'Build clock-reading fluency before or alongside elapsed time work.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
      {
        description: 'A simple framing for families comparing telling time options.',
        href: '/learn/time-telling-games',
        label: 'Time telling games for kids',
      },
    ],
    secondaryCta: {
      href: '/learn/analog-clock-practice',
      label: 'Back to analog clock practice',
    },
    sections: [
      {
        body: [
          'Students often lose track when they have to move from one clock reading to another and then turn that difference into minutes or hours. Practice needs to slow that reasoning down enough for it to make sense.',
        ],
        bullets: [
          'Start with a clear start time and end time.',
          'Help kids compare the two times visually.',
          'Make the duration the final idea, not the only thing shown.',
        ],
        title: 'Why elapsed time needs its own practice',
      },
      {
        body: [
          'Time Tutor includes a dedicated Elapsed Time mode so the skill does not get treated like a small add-on. Students work with clock-based problems that are easier to reason through than generic worksheets.',
        ],
        bullets: [
          'Visual clock prompts keep the time relationship visible.',
          'Focused practice helps kids connect start time, end time, and duration.',
          'The same calm interface keeps attention on the math instead of extra distractions.',
        ],
        title: 'How Time Tutor helps',
      },
      {
        body: [
          'Elapsed time practice can support both families and teachers once a child is ready to move beyond basic clock identification.',
        ],
        bullets: [
          'Use it for targeted review after a classroom lesson.',
          'Use it for repeated short home sessions when elapsed time still feels slippery.',
          'Pair it with analog clock practice when students need both fluency and reasoning support.',
        ],
        title: 'When to use it',
      },
    ],
    slug: 'elapsed-time-practice',
  },
  {
    faqItems: [
      {
        answer:
          'Look for practice that keeps the clock readable, repeats the right interactions, and lets kids move at their own pace before adding timed challenge.',
        question: 'What should parents look for in telling time apps?',
      },
      {
        answer:
          'Time Tutor is a telling time app for grades 1–3 with Explore Time, Set the Clock, Read the Clock, and Elapsed Time.',
        question: 'What is Time Tutor?',
      },
      {
        answer:
          'Yes. Time Tutor is designed for grades 1–3 and supports analog and digital time, clock setting, clock reading, and elapsed time.',
        question: 'Does Time Tutor work for classroom and home?',
      },
      {
        answer:
          'Use the App Store download on the Time Tutor page.',
        question: 'Where do I download it?',
      },
    ],
    h1: 'Time telling games for kids',
    heroEyebrow: 'Guides',
    intro: [
      'Telling time is easier when practice is simple: a real clock face, clear feedback, and skills broken into steps kids can repeat.',
      'Time Tutor is built for grades 1–3 with Explore Time, Set the Clock, Read the Clock, and Elapsed Time so kids can learn at their own pace.',
    ],
    metaDescription:
      'Time telling games for kids (grades 1–3): what good practice looks like, and how Time Tutor supports it on the App Store.',
    pageTitle: 'Time Telling Games for Kids | Time Tutor on the App Store',
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'time telling games',
    relatedLinks: [
      {
        description: 'Modes, ages, and the App Store download.',
        href: '/products/time-tutor',
        label: 'Time Tutor overview',
      },
      {
        description: 'Analog foundations: reading, setting, and connecting analog to digital time.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
      {
        description: 'When clock reading is steadier, elapsed time gets easier to reason about.',
        href: '/learn/elapsed-time-practice',
        label: 'Elapsed time practice for kids',
      },
      {
        description: 'Practice placing hands to match a target time.',
        href: '/learn/set-the-clock-game',
        label: 'Set the clock practice for kids',
      },
    ],
    sections: [
      {
        body: [
          'Good telling time practice still needs a real clock face, sensible pacing, and feedback that reinforces meaning.',
        ],
        bullets: [
          'Analog and digital time should connect, not compete for attention.',
          'Practice should include both reading a clock and setting a clock.',
          'Elapsed time deserves its own lane once basics are in place.',
        ],
        title: 'What good practice looks like',
      },
      {
        body: [
          'Time Tutor keeps the learning story obvious: explore clocks, set hands to match targets, read analog clocks fluently, and stretch into elapsed time when students are ready.',
        ],
        bullets: [
          'Explore Time connects representations before quizzing.',
          'Set the Clock strengthens hand placement and interval sense.',
          'Read the Clock builds fluency entering digital time.',
          'Elapsed Time supports duration reasoning with visual clocks.',
        ],
        title: 'How Time Tutor helps',
      },
    ],
    slug: 'time-telling-games',
  },
  {
    faqItems: [
      {
        answer:
          'Setting the clock forces kids to think about where the hour and minute hands belong, not just recognize a pre-drawn answer. That builds placement skills and interval understanding.',
        question: 'Why is set-the-clock practice useful?',
      },
      {
        answer:
          'Yes. Set the Clock mode asks learners to drag the hands until the analog clock matches a target digital time.',
        question: 'Does Time Tutor include set-the-clock practice?',
      },
      {
        answer:
          'Pair Set the Clock with Read the Clock and Explore Time so kids connect setting, reading, and comparing analog and digital time.',
        question: 'What should we practice next?',
      },
      {
        answer:
          'Download Time Tutor on the App Store for the full experience.',
        question: 'Where can we get it?',
      },
    ],
    h1: 'Set the clock practice for kids',
    heroEyebrow: 'Guides',
    intro: [
      'Set-the-clock practice works best when kids move the hour and minute hands themselves until the analog face matches a target time.',
      'Time Tutor includes Set the Clock mode alongside Explore Time and Read the Clock so learners build confidence from more than one angle.',
    ],
    metaDescription:
      'Set-the-clock practice for kids: what helps, and how Time Tutor supports it on the App Store.',
    pageTitle: 'Set the Clock Practice for Kids | Time Tutor',
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'set-the-clock practice',
    relatedLinks: [
      {
        description: 'Modes, ages, and the App Store download.',
        href: '/products/time-tutor',
        label: 'Time Tutor overview',
      },
      {
        description: 'When setting feels hard, analog foundations usually need reinforcement.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
      {
        description: 'Pair setting with reading so understanding goes both ways.',
        href: '/learn/read-the-clock-game',
        label: 'Read the clock practice for kids',
      },
      {
        description: 'A simple framing for families comparing telling time options.',
        href: '/learn/time-telling-games',
        label: 'Time telling games for kids',
      },
    ],
    sections: [
      {
        body: [
          'Look for interactions where both hands move realistically, minute intervals stay visible, and feedback explains what changed when a guess is wrong.',
        ],
        bullets: [
          'Hands should move together the way a real clock behaves.',
          'Targets should include digital time so translation stays explicit.',
          'Sessions should stay short and repeatable instead of overstimulating.',
        ],
        title: 'What good set-the-clock practice looks like',
      },
      {
        body: [
          'Time Tutor centers the clock face and keeps controls tactile so learners focus on placement instead of chasing unrelated game goals.',
        ],
        bullets: [
          'Set the Clock targets a digital time with draggable hands.',
          'Explore Time previews analog and digital side by side.',
          'Read the Clock reverses the skill by reading first, then typing time.',
        ],
        title: 'How Time Tutor helps',
      },
    ],
    slug: 'set-the-clock-game',
  },
  {
    faqItems: [
      {
        answer:
          'Reading asks kids to interpret the position of both hands and translate that into time language or digital notation. It is the skill they need in classrooms and daily life.',
        question: 'Why is read-the-clock practice different from setting?',
      },
      {
        answer:
          'Yes. Read the Clock mode shows an analog clock and asks students to enter the matching time.',
        question: 'Does Time Tutor include read-the-clock practice?',
      },
      {
        answer:
          'Alternate Read the Clock with Set the Clock so kids encode and decode time in both directions.',
        question: 'What pairs well with read-the-clock work?',
      },
      {
        answer:
          'Download Time Tutor on the App Store for the full experience.',
        question: 'Where do we get it?',
      },
    ],
    h1: 'Read the clock practice for kids',
    heroEyebrow: 'Guides',
    intro: [
      'Read-the-clock practice works best when kids can focus on both hands, interval sense, and translating what they see into a digital time.',
      'Time Tutor includes Read the Clock mode so students practice entering time after reading an analog display.',
    ],
    metaDescription:
      'Read-the-clock practice for kids: what helps, and how Time Tutor supports it on the App Store.',
    pageTitle: 'Read the Clock Practice for Kids | Time Tutor',
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'read-the-clock practice',
    relatedLinks: [
      {
        description: 'Modes, ages, and the App Store download.',
        href: '/products/time-tutor',
        label: 'Time Tutor overview',
      },
      {
        description: 'Strengthen the underlying analog foundations that reading depends on.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
      {
        description: 'Alternate reading with setting so understanding goes both ways.',
        href: '/learn/set-the-clock-game',
        label: 'Set the clock practice for kids',
      },
      {
        description: 'A simple framing for families comparing telling time options.',
        href: '/learn/time-telling-games',
        label: 'Time telling games for kids',
      },
    ],
    sections: [
      {
        body: [
          'Strong read-the-clock practice mixes interval sizes as kids grow, keeps numerals readable, and gives feedback that reinforces what each hand is doing.',
        ],
        bullets: [
          'Include times where the hour hand is between numbers.',
          'Practice both o’clock times and finer intervals as confidence grows.',
          'Connect analog results to digital notation.',
        ],
        title: 'What good read-the-clock practice looks like',
      },
      {
        body: [
          'Time Tutor keeps the analog display central and asks learners to type the matching time, which mirrors how kids need to demonstrate understanding in school.',
        ],
        title: 'How Time Tutor helps',
      },
    ],
    slug: 'read-the-clock-game',
  },
  {
    faqItems: [
      {
        answer:
          'Five-minute intervals are a common classroom milestone. They require kids to track skip counting by fives on the minute hand while still reading the hour correctly.',
        question: 'Why do schools emphasize nearest 5 minutes?',
      },
      {
        answer:
          'Time Tutor supports scaling time settings so practice can start at friendlier intervals and move toward finer precision as kids are ready.',
        question: 'Can Time Tutor practice nearest 5 minutes?',
      },
      {
        answer:
          'Pair interval work with Set the Clock and Read the Clock so kids see how hand placement lines up with five-minute jumps.',
        question: 'What activities help besides drilling?',
      },
      {
        answer:
          'Download on the App Store for the full experience.',
        question: 'Where can families try it?',
      },
    ],
    h1: 'Tell time to the nearest 5 minutes',
    heroEyebrow: 'Guides',
    intro: [
      'Telling time to the nearest five minutes is a common classroom milestone. Kids need clear minute marks, repeated exposure, and feedback that reinforces skip counting by fives.',
      'Time Tutor lets you keep practice focused on the clock while gradually increasing precision as kids are ready.',
    ],
    metaDescription:
      'Tell time to the nearest 5 minutes: what helps, and how Time Tutor supports it on the App Store.',
    pageTitle: 'Tell Time to the Nearest 5 Minutes | Time Tutor',
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'tell time to the nearest 5 minutes',
    relatedLinks: [
      {
        description: 'Modes, ages, and the App Store download.',
        href: '/products/time-tutor',
        label: 'Time Tutor overview',
      },
      {
        description: 'Hand placement practice supports accurate five-minute reading.',
        href: '/learn/set-the-clock-game',
        label: 'Set the clock practice for kids',
      },
      {
        description: 'Reading fluency pairs naturally with typed answers.',
        href: '/learn/read-the-clock-game',
        label: 'Read the clock practice for kids',
      },
      {
        description: 'A simple framing for families comparing telling time options.',
        href: '/learn/time-telling-games',
        label: 'Time telling games for kids',
      },
    ],
    sections: [
      {
        body: [
          'Kids should see how each five-minute step changes the minute hand, how the hour hand creeps between numbers, and how digital notation lines up with the analog face.',
        ],
        bullets: [
          'Use clocks with clear minute tick marks.',
          'Alternate reading and setting at the same interval level.',
          'Celebrate small wins before jumping to minute-level precision.',
        ],
        title: 'What good five-minute practice looks like',
      },
      {
        body: [
          'Time Tutor keeps the interface calm so learners can focus on interval reasoning instead of unrelated game mechanics.',
        ],
        title: 'How Time Tutor helps',
      },
    ],
    slug: 'telling-time-to-the-nearest-5-minutes',
  },
];

export const liveProductCards = productCards.filter(
  (product) => product.availability === 'live',
);

export const roadmapProductCards = productCards.filter(
  (product) => product.availability !== 'live',
);

export const supportConfig = {
  appName: siteMeta.title,
  supportEmail: siteMeta.supportEmail,
  supportIntro: buildDefaultSupportIntro(siteMeta.title),
};

export const privacyConfig = {
  appName: siteMeta.title,
  companyName: siteMeta.title,
  contactEmail: siteMeta.supportEmail,
  dataPracticesSummary: buildDefaultPrivacySummary(siteMeta.title),
};

export function getProductBySlug(slug: string) {
  return productCards.find((product) => slugify(product.name) === slug);
}

export function getProductPageBySlug(slug: string) {
  return productPages.find((page) => page.slug === slug);
}

export function getLearnPageBySlug(slug: string) {
  return learnPages.find((page) => page.slug === slug);
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-');
}
