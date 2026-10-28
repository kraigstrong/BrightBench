import type { Metadata } from 'next';

import { ProsePage, ProseSection } from '@/components/prose-page';
import { contactEmail } from '@/lib/site';

// Copied word for word from brightbench.app/bigger-fish/privacy (BrightBench apps/marketing), which the App Store
// listing links today. Keep the two identical until that page redirects here, and keep both in step with the game's
// PrivacyInfo.xcprivacy, its analytics payload (ArcadeAnalytics.swift, ArcadeMetrics.swift), the App Store privacy
// answers, and the analytics endpoint (apps/marketing/src/lib/bigger-fish-analytics.ts). Changes need Kraig's OK.

export const metadata: Metadata = {
  alternates: { canonical: '/privacy' },
  description: 'How Bigger Fish, an arcade game, handles information, including its anonymous gameplay summaries.',
  title: 'Privacy Policy',
};

const sections: { title: string; body: string[] }[] = [
  {
    title: 'What Bigger Fish Sends',
    body: [
      'Bigger Fish has no accounts and never asks for a name, email address, photo, or location. It has no ads, no tracking, and no third-party code that collects data.',
      'To learn which levels are too hard or too easy, the game sends a short anonymous summary of each level played to BrightBench. It says which world, level, game mode, and version of that level it was; whether you had already cleared it; and how the run ended: cleared, quit, left unfinished, or lost, and if lost, whether to a bigger fish or a hazard such as jellyfish tentacles.',
      'The summary also includes how long the run lasted and how many laps of the level you swam; how many fish you and the other fish ate; how many of your catches were close in size; how many jellyfish bounces there were; the longest stretch between your meals; how long only fish you could eat were left; and how long the remaining fish were too big for you to grow into, when that first happened, and whether it changed back. At the end of the run it records your size, how many fish were left, how many of them you could eat, how big the largest was compared to you, and whether eating the rest could still have grown you enough. If a fish ate you, it records how much bigger that fish was.',
      'It also says how many tries it took to clear a level the first time, and whether you chose to play again, go to the next level, or leave after a win or loss.',
      "Bigger Fish is free to try, with a one-time purchase that unlocks every world. To learn whether the free levels and the price are right, the game reports each time the screen offering that purchase appears, what opened it (a locked level or world, going on to a locked next level, the Unlock all button, conquering a world, or using up the day's free Open Water runs), and whether it was the first time on that device. It reports how each attempt to buy or restore the purchase ended (unlocked, waiting for approval such as Ask to Buy, cancelled, failed, restored, or nothing found to restore) and where it was made, and each level summary says whether the game was unlocked.",
      "In the Open Water, the endless run, the game sends one short summary of each run instead: how many levels it cleared, how many fish you ate and pearls you collected, how long it lasted, whether it was your best yet, and how it ended: quit, left unfinished, or lost, and if lost, to a bigger fish or a hazard. It also says how many times the next level wasn't ready in time, how long you waited for it in all, and the longest any level of the run took to make, which says a little about how quickly the game runs on the device. Whether you chose to play again or leave after a run is reported too.",
      "Pearls from the Open Water buy looks for your fish in the pearl shop. To learn whether the shop and its prices are right, the game reports each visit: whether it was opened from the world map or after a run, how many pearls you had, which looks you bought, and, with your first purchase, how many Open Water runs you had played before it. It reports once each look you earn by playing, and each level and Open Water summary says whether your fish was wearing any look. The first time you play after opening the game, if your fish is wearing any looks, it reports which ones; each is counted on its own, and the combination is not kept.",
      "A few reports are sent only once per device, such as the first launch, the first time each level or world is started or cleared, the first time all ten of a world's main levels are cleared, your first Open Water run, and the first time a run gets round all five worlds, so the totals can show how many players reach each level. Each report also says which version of the game sent it and whether it is a test build or the App Store version.",
    ],
  },
  {
    title: 'What Is Never Sent',
    body: [
      "No name, account, contact details, photo, or location. No payment details, receipts, or Apple Account information: Apple handles the purchase itself. No device, advertising, session, or other identifier, and nothing that could tell one player's or device's reports apart from another's. No dates or times, device model, system version, or language. No touches or swimming paths.",
    ],
  },
  {
    title: 'How the Summaries Are Kept and Used',
    body: [
      'Each summary is checked and immediately added to running totals for each day, grouped by level and game version. Individual summaries are not stored, and the totals cannot be traced back to a player or a device. Daily totals are deleted after 90 days.',
      "The totals are used only to improve Bigger Fish's levels and difficulty, the Open Water, and the pearl shop's looks and prices, and to decide how much of it is free to try and what the unlock costs. They are never used for advertising or tracking, and never sold or shared.",
      'Bigger Fish works without an internet connection. Summaries wait on the device and are sent together: when several have built up, when you leave the game, or the next time it opens. A report that fails to send is discarded rather than retried.',
    ],
  },
  {
    title: 'Service Providers',
    body: [
      'Reports are received by brightbench.app, which runs on Vercel, and the daily totals are stored with Upstash. Like any web service, Vercel handles each connection, including its IP address, to deliver the report. We do not store or log IP addresses or the reports themselves; Vercel and Upstash may keep their own operational logs under their policies.',
    ],
  },
  {
    title: 'Information Stored on Your Device',
    body: [
      'Bigger Fish saves which levels you have cleared, your best times, your best Open Water run, your pearls, the looks you own and wear and your saved outfits, and whether you have seen the jellyfish lesson, so you can pick up where you left off. To send the once-per-device reports and try counts described above, it also keeps a few markers and counters on the device. None of these are sent to us; only the anonymous summaries are.',
      "If you use iCloud, Bigger Fish also keeps a copy of your progress (cleared levels, best times, your best Open Water run, your pearls, the looks you own and wear and your saved outfits, and which lessons and screens you have seen) in your own iCloud account, through Apple, so it comes back if you reinstall the game and follows you to your other devices. We cannot access that copy, and deleting the app doesn't remove it. Otherwise, deleting the app removes this information. Like other app data, it may be included in your own device backups, which we cannot access.",
    ],
  },
  {
    title: 'Beta Testing',
    body: [
      'If you test Bigger Fish through TestFlight, Apple collects any feedback, screenshots, and crash reports you choose to send under its own privacy policy and shares them with us so we can fix problems.',
    ],
  },
  {
    title: 'Contacting Us',
    body: [
      'If you email us, we receive what you choose to include and use it only to reply. We keep that correspondence only as long as needed to help you, and will delete it on request.',
    ],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'If how Bigger Fish handles information changes, we will update this page and its date before the change ships in the game.',
    ],
  },
];

export default function PrivacyPage() {
  const email = contactEmail();
  return (
    <ProsePage eyebrow="Privacy" intro={<p>Last updated: October 26, 2026</p>} title="Bigger Fish Privacy Policy">
      {sections.map((section) => (
        <ProseSection key={section.title} title={section.title}>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ProseSection>
      ))}
      <p>
        Questions can be sent to <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </ProsePage>
  );
}
