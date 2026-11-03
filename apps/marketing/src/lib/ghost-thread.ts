// Ghost Thread, the one-touch racer, is a native iOS app built outside this repo (kraigstrong/apex-rivals, code name
// Apex). It has no site of its own: its page, privacy policy and support live here, at /ghost-thread. Keep these in
// step with the app: the circuits (ghost-thread-circuits.json, which the game's SiteArtTests draws into Art/site,
// with public/games/ghost-thread/logo.png), the unlock (Apex/CircuitUnlock.swift), and what it sends
// (Apex/ApexOnline.swift, Apex/PrivacyInfo.xcprivacy, and the lap service in apex-laps.ts).

import circuitData from './ghost-thread-circuits.json' with { type: 'json' };

export const ghostThread = {
  name: 'Ghost Thread',
  tagline: 'Race your ghost. Thread the line.',
  /** One sentence, for previews. */
  oneLiner:
    'A one-touch racing game for iPhone and iPad: hold to steer up, let go to steer down, and find the straightest line through every corner.',
  platform: 'iPhone and iPad',
  requirements: 'an iPhone with iOS 17 or later, or an iPad with iPadOS 17 or later',
  /** Free to try: one circuit and Apex School, the tutorial. */
  freeCircuit: 'Ardennes',
  /** The one in-app purchase (non-consumable, Family Sharing on): every circuit, and every circuit added later. */
  unlock: { name: 'All Circuits', price: '$1.99' },
  contactEmail: 'support@brightbench.app',
} as const;

/** The public TestFlight group's link, for players who find the page before the App Store does. */
const testFlightUrl = 'https://testflight.apple.com/join/dt7sHRvR';

/** The App Store link, once it's there: Apple's badge takes over from the beta. */
const appStoreUrl = '';

export type GhostThreadCta = { href: string; kind: 'download' } | { href: string; kind: 'beta' };

/** Apple's Download badge is licensed only for an app on the App Store; until then the page invites players to the beta. */
export function ghostThreadCta(links: { appStoreUrl: string; testFlightUrl: string } = { appStoreUrl, testFlightUrl }): GhostThreadCta {
  return links.appStoreUrl ? { href: links.appStoreUrl, kind: 'download' } : { href: links.testFlightUrl, kind: 'beta' };
}

/**
 * A circuit as the game draws it, in an SVG viewBox of `width` × `height` (the longer side 1000), north up: its
 * centerline (`outline`) and its ideal line (`line`), with how far along the line the thread is at evenly spaced
 * moments of a `lap`-second lap (`keyPoints`, shares of its length, from 0 to 1).
 */
export type Circuit = {
  id: string;
  name: string;
  summary: string;
  corners: number;
  clockwise: boolean;
  width: number;
  height: number;
  outline: string;
  line: string;
  lap: number;
  keyPoints: number[];
};

export const circuits: Circuit[] = circuitData;
