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
          'The main experience is the iOS app. A lighter web version can support practice, but the full challenge flow lives in the App Store app.',
        question: 'Is it a web game or an app?',
      },
      {
        answer:
          'It works well for both. Families can use it for low-pressure home practice, and teachers can use it as a focused supplement for clock and time lessons.',
        question: 'Is it good for home or classroom use?',
      },
    ],
    h1: 'A telling time game that helps kids read clocks with confidence',
    heroEyebrow: 'Time Tutor',
    intro: [
      'Time Tutor is a focused telling time game for kids who need more than a worksheet or a cluttered browser game. It helps students read clocks, connect analog and digital time, and build confidence with elapsed time through calm, visual practice.',
      'Instead of burying the learning inside ads, distractions, or random mini-games, Time Tutor keeps the experience clear. Kids practice one skill at a time and get steady repetition that actually supports understanding.',
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
      'Time Tutor is a telling time game for kids in grades 1-3 with analog clock practice, digital matching, elapsed time work, and a calm learning-focused design.',
    modeItems: [
      {
        body: 'Explore analog and digital time together so kids can see how the two representations connect before they are asked to answer.',
        title: 'Explore Time',
      },
      {
        body: 'Kids drag the clock hands until the analog clock matches a target digital time, which strengthens clock-setting and hand placement skills.',
        title: 'Set the Clock',
      },
      {
        body: 'Kids read an analog clock and enter the matching time, building fluency instead of relying on memorized tricks.',
        title: 'Read the Clock',
      },
      {
        body: 'Students compare two times and figure out how much time has passed, which supports the tricky reasoning behind elapsed time.',
        title: 'Elapsed Time',
      },
    ],
    pageTitle: 'Time Tutor | Telling Time Game and Clock Practice for Kids',
    practiceItems: [
      'Practice mode keeps the pace calm and lets kids focus on accuracy first.',
      'Timed challenge mode adds repetition and motivation once the concept starts to stick.',
      'Time settings can scale from easier intervals to more precise clock reading.',
      'A lighter web practice experience exists, but the most complete challenge flow is in the App Store app.',
    ],
    primaryCta: {
      external: true,
      href: timeTutorAppStoreUrl,
      label: 'Download Time Tutor on the App Store',
    },
    primaryTopic: 'telling time game',
    proofPoints: [
      'Grades 1-3',
      'Analog and digital clocks',
      'Elapsed time included',
      'Built for home and classroom use',
    ],
    relatedLinks: [
      {
        description:
          'See the analog-specific learning page for kids who need clearer clock-reading practice.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
      {
        description:
          'See the elapsed-time page for families or teachers focused on duration and time-interval reasoning.',
        href: '/learn/elapsed-time-practice',
        label: 'Elapsed time practice for kids',
      },
    ],
    secondaryCta: {
      label: 'Web availability',
      note: 'A lighter web version is available for practice, but the full challenge flow lives in the App Store app.',
    },
    slug: 'time-tutor',
    status: 'Live on the App Store',
    trustItems: [
      {
        body: 'The app is built around one concept at a time so kids can focus on understanding instead of bouncing between unrelated activities.',
        title: 'Focused practice',
      },
      {
        body: 'The visuals are calm, clean, and readable so the clock itself stays at the center of the learning.',
        title: 'No junky distractions',
      },
      {
        body: 'Time Tutor is designed to support actual skill-building in reading clocks and working with elapsed time, not just empty screen time.',
        title: 'Built for real learning',
      },
    ],
    usageItems: [
      'Use it at home when a child needs extra repetition without the noise of generic browser games.',
      'Use it in classrooms as a focused station, intervention tool, or reinforcement activity during time units.',
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
    h1: 'Analog clock practice that helps telling time click',
    heroEyebrow: 'Learn',
    intro: [
      'Analog clock practice works best when kids can see what the hands are doing, test their understanding, and connect the clock face to actual time language. That is very different from clicking through a noisy web game or memorizing a few shortcuts.',
      'If a child knows the numbers on a clock but still freezes when it is time to read one, the answer is usually better analog clock practice, not more clutter.',
    ],
    metaDescription:
      'Analog clock practice for kids should be visual, calm, and clear. Learn what helps, then see how Time Tutor supports reading and setting analog clocks.',
    pageTitle: 'Analog Clock Practice for Kids | Time Tutor',
    primaryCta: {
      href: '/products/time-tutor',
      label: 'See the Time Tutor telling time game',
    },
    primaryTopic: 'analog clock practice',
    relatedLinks: [
      {
        description:
          'Go to the main Time Tutor page for the full app overview, audience, and download details.',
        href: '/products/time-tutor',
        label: 'Time Tutor telling time game',
      },
      {
        description:
          'Move into elapsed-time-specific support once basic clock reading is more secure.',
        href: '/learn/elapsed-time-practice',
        label: 'Elapsed time practice for kids',
      },
    ],
    secondaryCta: {
      href: '/learn/elapsed-time-practice',
      label: 'Explore elapsed time practice',
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
        title: 'What strong analog clock practice looks like',
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
        title: 'How Time Tutor supports analog clock practice',
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
          'Grades 1-3 is a strong fit overall, especially once a child already has some basic familiarity with reading clocks and is ready to reason about time intervals.',
        question: 'What grade range fits elapsed time work?',
      },
    ],
    h1: 'Elapsed time practice with clear visual clock-based problems',
    heroEyebrow: 'Learn',
    intro: [
      'Elapsed time is where many students first realize that telling time and reasoning about time are different skills. A child may be able to read a clock and still struggle to figure out how much time has passed.',
      'Good elapsed time practice makes the start time, end time, and duration feel connected. It should be visual, clear, and broken into understandable steps rather than buried inside dense word problems.',
    ],
    metaDescription:
      'Elapsed time practice for kids should connect start time, end time, and duration clearly. Learn the skill need, then see how Time Tutor supports it.',
    pageTitle: 'Elapsed Time Practice for Kids | Time Tutor',
    primaryCta: {
      href: '/products/time-tutor',
      label: 'See the Time Tutor telling time game',
    },
    primaryTopic: 'elapsed time practice',
    relatedLinks: [
      {
        description:
          'Go to the main Time Tutor page for the full app overview, learning goals, and download details.',
        href: '/products/time-tutor',
        label: 'Time Tutor telling time game',
      },
      {
        description:
          'Build stronger clock-reading fluency before or alongside elapsed-time work.',
        href: '/learn/analog-clock-practice',
        label: 'Analog clock practice for kids',
      },
    ],
    secondaryCta: {
      href: '/learn/analog-clock-practice',
      label: 'Explore analog clock practice',
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
          'The same calm interface keeps attention on the math instead of the chrome around it.',
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
        title: 'Where it fits',
      },
    ],
    slug: 'elapsed-time-practice',
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
