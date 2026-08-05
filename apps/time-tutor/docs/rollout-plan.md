# Time Tutor — Phased Rollout Plan

> **For a fresh session picking this up:** read the "Status" section first to see what's already done, then jump to the next incomplete phase. Each phase lists an input gate (what to get from Kraig before starting), the work, how to validate it, and an output gate (what has to happen — usually Kraig's review — before moving on). Work on a dedicated branch per phase, commit incrementally, and stop for explicit review-and-merge approval before touching `main`. Don't skip a phase's output gate even if the code looks done — several gates require Kraig's hands (device testing, App Store Connect actions, account creation), not just his eyes.

## Status

| Phase | State |
|---|---|
| 0 — Refactor + meta fix | Done (merged [#1](https://github.com/kraigstrong/BrightBench/pull/1)) |
| 1 — Sound/haptics/progress/reorder | Not started |
| 2 — Preview video | Not started |
| 3 — SEO content | Not started |
| 4 — Analytics | Not started |

*(Update this table as phases complete or move to in-progress.)*

**Sequencing logic:** foundation/refactor first (so later phases build on clean code instead of duplicating work), then user-facing engagement features, then release assets, then content/SEO, and analytics last since it's the one irreversible-feeling decision (a new SDK + a privacy-label change) and benefits from being isolated rather than bundled with anything else.

This plan came out of a broader review of Time Tutor's codebase, website (timetutor.app), App Store listing, and the sibling brightbench.app marketing site — background context worth knowing if picking this up cold:
- Time Tutor is a $1.99 Expo/React Native app (analog/digital clock practice) that's sold "a handful" of copies since launch. Core interaction quality is genuinely good; the gaps found were mostly missing engagement polish (no sound/haptics), ASO/SEO gaps, and some code duplication.
- `apps/time-tutor` ships a checked-in native `ios/` project (bare workflow) — Xcode/EAS build from `project.pbxproj`'s `MARKETING_VERSION`/`CURRENT_PROJECT_VERSION`, not from `app.json` alone. Keep both in sync when bumping versions.
- `apps/marketing` (deployed to brightbench.app) is the SEO/content hub for the whole app suite; `timetutor.app` (this app's own web export) is deliberately kept lean as a product demo that converts to an App Store purchase — that split is intentional, keep it.

---

## Phase 0 — Foundation refactor
*No product-facing change. Lowest risk. Unblocks everything after it.*

**Scope:** de-duplicate the Practice/Challenge screens; fix timetutor.app's missing `<title>`/meta tags, `robots.txt`, and `sitemap.xml`.

**Input gate:** none — both items are decision-free. Just confirm you're starting.

**What to do:**
- Extract one shared `PracticeScreen` and one shared `ChallengeScreen`, each parameterized by a small per-mode config (prompt renderer + correctness check), replacing the current 4 near-duplicate screen files (`set-clock-practice-screen.tsx`, `read-clock-practice-screen.tsx`, `timed-challenge-screen.tsx`, `elapsed-time-challenge-screen.tsx`).
- Add `app/+html.tsx` (real title, meta description, Open Graph tags, favicon), `robots.txt` (disallowing `/session/`, `/mode/`, `/practice/`, `/challenge/` — app-shell UI, not indexable content), and a 3-URL `sitemap.xml` (`/`, `/privacy`, `/support`).

**Validation:**
- Full test suite + typecheck + lint clean.
- Manual pass through all 3 scored modes × Practice/Challenge on Simulator to confirm zero behavior change (this is a pure refactor — anything different is a bug).
- Build the web export and verify the title/meta/robots/sitemap render correctly in-browser before calling it done.

**Output gate:** show Kraig the diff summary and test results. Optional: his own spot-check on Simulator/device. He says "merge" and it lands on `main`. Nothing touches App Store Connect in this phase.

---

## Phase 1 — Engagement & UX
*Depends on Phase 0 merged (de-duped screens mean sound/haptics get wired once, not four times).*

**Scope:** sound + haptics, the Progress screen, home screen reorder.

**Input gate (before starting):** confirm the reorder direction with Kraig — lead the home screen with Set the Clock or Read the Clock (instant feedback), move Explore Time later, framed as "not sure yet? try this." If he'd rather keep Explore Time first, adjust accordingly.

**What to do:**
- Pull a CC0 sound pack from Kenney.nl (kenney.nl/assets?q=audio), add `expo-haptics` + `expo-audio`, wire a light haptic + short chime into correct/incorrect feedback across all 3 scored modes, add a "Sound effects" toggle to Settings (matching Fraction Finder's existing pattern in `apps/fraction-finder`).
- Build the Progress screen: one screen off Home, a 3×3 grid (mode × difficulty) showing 0–3 stars per cell plus a crown count at top — built entirely from `challenge-progression.ts` data already persisted locally, no new tracking.
- Reorder home screen cards per the confirmed direction.

**Validation:**
- Manual audio/haptic testing on Simulator, but **Simulator can't render actual haptic feedback** — code correctness can be verified directly, but the *feel* needs a real device.
- Unit test for the star/crown aggregation math; visual check across a few mock progress states (zero stars, partial, full mastery).

**Output gate (mid-phase, needs Kraig's hands):** after the first sound+haptics pass, stop and have Kraig try it on his own device before finalizing — this is the one step in the whole plan that specifically needs his hands, not just his eyes, since haptics can't be verified in Simulator. After that: same review-then-merge gate as Phase 0.

**Follow-up (deferred, not blocking this phase):** Kraig dislikes the current Practice-mode "wrong answer" UX — the toast overlaid on the clock ("Try again" / "You entered X:XX" / Dismiss). He likes the haptics, and likes the feel of the Challenge-mode wrong-answer treatment (shake + flash, no blocking toast); the complaint is specifically about Practice mode's visual. Practice mode still needs to surface what the learner actually entered (that's the whole point of Practice vs. Challenge — untimed, see-your-mistake learning), so this isn't "remove the toast," it's "redesign how the entered value gets communicated." Worth looking at whether Challenge mode's non-blocking treatment (or something adjacent to it) can be adapted for Practice while still surfacing the entered time. Revisit after the rest of Phase 1 lands.

---

## Phase 2 — App Store re-release video
*Independent of the other phases — can happen in parallel with Phase 1 if Kraig wants it sooner.*

**Input gate:** confirm the device/size class with Kraig (recommend iPhone 16 Pro Max — covers the 6.9"/6.5"/6.3"/6.1" classes per Apple's spec, i.e. basically every current iPhone with one recording) and the demo flow. Proposed script, assuming Phase 1 has shipped by then: Explore Time → Set the Clock → a Challenge win → the new Progress screen. If Phase 1 hasn't shipped yet, cut this without those and re-record later.

**What to do:** temporarily re-enable the dormant `DEMO_VIDEO_REWARD_SHORTCUT` (in `src/config/demo-video.ts`), record via `xcrun simctl io booted recordVideo`, encode to Apple's exact spec:
```bash
ffmpeg -i raw_capture.mov \
  -vf "scale=886:1920:flags=lanczos,fps=30" \
  -c:v libx264 -profile:v high -level 4.0 -b:v 11M -maxrate 12M -bufsize 12M -pix_fmt yuv420p \
  -c:a aac -b:a 256k -ar 48000 \
  -t 28 \
  timetutor_preview.mov
```
Then revert the demo shortcut so it never ships live (confirm it's back to `false &&` before this phase closes).

**Validation:** run the final file through `ffprobe` and report the actual numbers (resolution, codec/profile, bitrate, duration, audio spec) against Apple's published spec (886×1920, H.264 High Profile Level 4.0, 10–12 Mbps VBR, 256kbps AAC, ≤30s) — measured values, not just "it looks fine."

**Output gate:** Kraig reviews the file and uploads it to App Store Connect himself — no code merges in this phase (the demo-shortcut change gets reverted, not shipped), so there's nothing to merge, just a file to hand off.

---

## Phase 3 — SEO / marketing content
*Independent of Phases 0–2. Can run anytime.*

**Input gate:** Kraig's decision on Fraction Finder/Grammar Guide timing — are they far enough along for real long-tail pages now, or should they stay placeholders? Confirm the product roster refresh either way.

**What to do:**
- Refresh the homepage roadmap and `productPages` data in `apps/marketing/src/lib/site.ts` to include Letter Learner and Grammar Guide (currently missing despite both existing as real apps in the monorepo).
- Write 3 new Time Tutor long-tail `/learn` pages not covered by the existing 6 ("elapsed time word problems for kids," "when do kids learn to tell time," "AM vs PM explained for kids"), matching the existing structure (FAQ + JSON-LD + internal links).
- If greenlit: long-tail pages for Fraction Finder and/or Grammar Guide in the same structure.

**Validation:** this is content, not logic — the real gate is Kraig's copy review, not automated testing. Also run a typecheck/build pass and validate the JSON-LD structurally (schema-valid FAQPage markup) before handing anything over.

**Output gate:** Kraig approves copy → merge → confirm live on brightbench.app → submit new URLs to Search Console.

---

## Phase 4 — Analytics (optional, isolated, decided last)
*Deliberately last and standalone — the one item with a real, ongoing trade-off rather than a one-time build.*

**Input gate:** Kraig's final call on the privacy trade-off (Aptabase vs. staying at zero analytics), and — only if going ahead — he creates the Aptabase account and API key himself. For the key itself: it should go directly into an env file / EAS secret rather than being pasted into a chat session, so it never sits in a plain-text conversation transcript.

**What to do:** add the Aptabase SDK, instrument ~4–5 anonymous events (`mode_started`, `mode_completed`, `challenge_result` with difficulty + accuracy bucket only — no timestamps or identifiers tied to a person).

**Validation:** trigger each event path manually and confirm it lands correctly in the Aptabase dashboard with no PII/identifiers attached — that's the actual proof it's privacy-safe, not just a code-level claim.

**Output gate:** before this ships, **Kraig updates the App Store privacy questionnaire** to reflect the new SDK — this is a hard gate, not a nice-to-have, since submitting an app with an undisclosed SDK is an App Store policy risk, not just a trust-badge cosmetic issue.

---

## Background findings this plan is based on

For full detail, this plan was derived from a broader review covering:
1. Time Tutor's codebase (feature inventory, UX gaps, accessibility, code duplication, the dormant AM/PM toggle that's built but never enabled — see `src/components/analog-clock.tsx`'s `showMeridiemToggle` prop, never passed `true` anywhere)
2. timetutor.app (missing meta tags, working free-web-demo upsell flow)
3. The App Store listing (empty subtitle field, a typo in a screenshot caption — "PROGESS" — only 4 of 10 allowed screenshots used, only 1 rating with no in-app review prompt)
4. brightbench.app (already-live SEO hub with 6 written long-tail pages + FAQPage JSON-LD, but a stale product roster)

That original review wasn't saved as a repo doc — if useful context is missing here, it may be worth reconstructing specific findings by re-reading the relevant source files directly (they're cited by path throughout this doc).
