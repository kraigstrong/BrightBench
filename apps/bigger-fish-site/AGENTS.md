# Bigger Fish site

Read `README.md` first. Rules specific to this site:

- **Facts come from the game.** World names, mottos, level counts, and requirements live in `src/lib/game.ts`; keep
  them in step with the game (`kraigstrong/bigger-fish`: `ArcadeCampaign.swift`, the iOS deployment target).
- **Privacy copy is legal copy.** `app/privacy/page.tsx` is word for word the policy at
  brightbench.app/bigger-fish/privacy. Change neither without Kraig's OK, and keep them identical until the old URL
  redirects here.
- **Apple's marketing rules:** say "iPhone", not "iOS", outside system requirements; show the App Store badge only
  once the app is on the store (it's environment-driven, see `src/lib/site.ts`); no drawn devices, no Apple logo.
- **No tracking.** The site has no analytics, cookies, or third-party scripts. Adding any needs Kraig's OK and a
  privacy policy update.
- **Keep the home page short.** Under about 150 words of copy; the game's footage does the selling.
