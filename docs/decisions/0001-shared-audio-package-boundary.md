# 0001: Shared audio package boundary

## Context

Time Tutor owned seven reward sounds and the playback engine that drove them.
Letter Learner had already copied two of those files (`correct.mp3`,
`try-again.mp3`) into its own assets, and Fraction Finder is expected to want
reward audio too. Without a shared home, each app would keep its own copy of the
files and reinvent the playback mechanics — audio-mode setup, overlap pools, and
the prewarmed synchronous path for latency-sensitive taps — none of which is
product-specific.

The risk in extracting audio is extracting too much with it. Which sound means
"correct", and the rule that a starless round gets a summary sound while a
starred round is already scored by per-star dings, are reward rules. AGENTS.md
is explicit that scoring and curriculum rules must not move into shared packages
prematurely.

## Decision

Create `@education/audio` holding the sound files, their credits, and a
gameplay-neutral playback engine.

The package owns: audio-mode configuration, lazy single players, the round-robin
overlap pool, and the prewarmed synchronous instant-sound path with its
post-play rewind. Its exported names are generic verbs.

Apps own: which sound means what, reward rules, haptics, and the sound-effects
settings gate. Time Tutor keeps `src/lib/answer-feedback.ts` as a thin app-local
layer over the package, with every exported name and signature unchanged.

The sound files move because reward audio is suite identity, not product
identity. Product identity — icons, splash, store metadata — stays app-local, as
does curriculum audio such as letter-name recordings.

`expo-audio` is a peer dependency, so the package cannot quietly add a native
module to an app that lacks one.

## Consequences

- One canonical set of reward sounds and one set of credits for the suite; the
  per-file trimming and normalization work is not repeated per app.
- Time Tutor's release check now reads the credits from the package directory.
- Adopting the package in an app without `expo-audio` is a native-dependency
  change, and therefore High risk in that app.
- The package is a shared-package dependency of a shipped app, so changes to it
  require consumer verification.
- Letter Learner still has duplicate `correct.mp3` / `try-again.mp3` files until
  it is migrated; that is deliberate, separate work.

## Alternatives considered

- **Leave the files in Time Tutor and import across apps.** Rejected: it makes a
  product app a library for its siblings and couples their release cycles.
- **Copy the files into each app.** Rejected: the set is already drifting, and
  re-tuning a sound would mean editing it in several places.
- **Move `answer-feedback.ts` wholesale into the package.** Rejected: it carries
  reward rules and haptics, which AGENTS.md keeps app-local.
- **Put the sounds in `@education/ui`.** Rejected: that package is limited to
  React primitives; audio has no rendering surface and a different peer
  dependency.
