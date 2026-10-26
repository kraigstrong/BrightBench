# Double Putt site

Read `README.md` first. Rules specific to this site:

- **Facts come from the game.** Course names, counts, rules and requirements live in `src/lib/site.ts`; keep them in
  step with the game (`kraigstrong/double-putt`: `MiniGolf/Core/Levels.swift`, its README, the iOS deployment target).
- **The game's words.** A hole is two greens side by side: never "pair", never "hole A" and "hole B".
- **Privacy copy is legal copy.** `app/privacy/page.tsx` describes what the game sends to brightbench.app's analytics
  endpoint (`apps/marketing/src/lib/double-putt-analytics.ts`). Change neither without Kraig's OK.
- **Apple's marketing rules:** say "iPhone" and "iPad", not "iOS", outside system requirements; show the App Store badge only
  once the app is on the store; no drawn devices, no Apple logo.
- **No tracking.** The site has no analytics, cookies, or third-party scripts. Adding any needs Kraig's OK and a
  privacy policy update.
