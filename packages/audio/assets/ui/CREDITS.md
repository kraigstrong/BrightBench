# Sound credits

These are the shared BrightBench reward sounds, used by any app in the suite
that needs them. They were originally selected and tuned for Time Tutor, which
is why several of the timing notes below cite Time Tutor's pacing.

All sounds are from Mixkit under its free license, which allows commercial use
with no attribution required. The details below are recorded for our own
traceability, not as a license obligation.

Each file is trimmed to just past its audible end — measured to a -45 dB floor,
since the Mixkit sources carry long inaudible tails — and peak-normalized so
nothing jumps out relative to the rest of the set. Durations and peaks below are
as measured on the shipped files (`ffprobe`, `ffmpeg -af volumedetect`).

Source URLs take the form
`https://assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`.

## Gameplay feedback

- `correct.mp3` (correct answer)
  - Mixkit 947, "Correct answer notification"
  - Trimmed 1.06s → 0.90s; audible content ends at 0.70s. Tuned against Time
    Tutor's pacing, where Challenge advances 700ms after a correct answer, so
    anything longer would be cut off by the next answer. Peak -1.4 dBFS.
- `try-again.mp3` (wrong answer)
  - Mixkit 1110, "Click error"
  - Trimmed 1.11s → 0.55s; audible content ends at 0.35s. Tuned against Time
    Tutor's Challenge, which advances 520ms after a wrong answer — a tighter
    budget than the correct sound. Peak -1.6 dBFS.

## Challenge results

- `suspense-roll.mp3` (drum roll under a results reveal)
  - Mixkit 566, "Drum Roll"
  - The 5.94s source delayed 200ms, trimmed to 5.25s, with a 150ms fade from
    5.10s that only cleans the cut — the decay is already below -45 dB by then.
    Audible content runs 0.20s to 5.05s. The crash peaks at 3.213s and the
    cymbal decays naturally for about 1.8s after it. Peak -3.46 dBFS.
  - The 200ms delay is what puts the crash on 3.20s, where Time Tutor's score
    bar completes (80ms + 1420ms accuracy + 180ms handoff + 1520ms score). The
    source's own crash is at 3.00s, so playing it undelayed fires it while the
    bar is still filling.
  - An earlier version of this file was cut to 3.45s with a 250ms fade from
    3.20s, on the stated assumption that the reveal stopped the roll at 3.52s
    and the file therefore had to end first. Both halves were wrong: the bar
    completes at 3.20s rather than 3.00s, so the crash fired 194ms early, and
    the fade then crushed a cymbal that was still at -15 dB, which is what made
    the ending sound abrupt. The reveal no longer stops the roll at all — it
    rings out over the finished card, and Time Tutor stops it only when the
    player leaves the reveal.
- `star-ding.mp3` (one per star as it pops in during a reveal)
  - Mixkit 600, "Achievement bell"
  - Trimmed from the 2.40s source to 1.40s. The strike is at 0-0.2s and the
    ring-out is inaudible past ~1.0s, so the source's remaining 1.4s was dead
    tail. In Time Tutor, stars land 0.4-0.6s apart, so these overlap by design.
    Peak -1.5 dBFS.
- `round-none.mp3` (round finished with 0 stars)
  - Mixkit 2032, "Negative answer lose"
  - Trimmed 3.03s → 1.65s; audible content ends at 1.40s. Nothing follows this
    sound, so its length is unconstrained. Peak -1.4 dBFS.
- `crown.mp3` (mastery crown earned)
  - Mixkit 2633, "Sweeping sparkle presentation intro"
  - Trimmed from the 3.00s source to 2.80s. Peak -1.3 dBFS.

## Navigation

- `mode-tap.mp3` (tapping into a game mode on a home screen)
  - Mixkit 2568, "Cool interface click tone"
  - Untrimmed. Duration 0.20s, peak -6.7 dBFS — deliberately quieter than the
    reward sounds, since it fires on every navigation.

## History

The original set came from Kenney's "Interface Sounds" pack (CC0,
https://kenney.nl/assets/interface-sounds). No Kenney files remain.

The set lived in `apps/time-tutor/assets/audio/ui` until it was moved here to
become a shared package asset.
