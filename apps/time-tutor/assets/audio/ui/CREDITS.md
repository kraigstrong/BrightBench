# Sound credits

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

- `correct.mp3` (correct answer, in Practice and Challenge)
  - Mixkit 947, "Correct answer notification"
  - Trimmed 1.06s → 0.90s; audible content ends at 0.70s. Challenge advances
    700ms after a correct answer, so anything longer would be cut off by the
    next answer. Peak -1.4 dBFS.
- `try-again.mp3` (wrong answer)
  - Mixkit 1110, "Click error"
  - Trimmed 1.11s → 0.55s; audible content ends at 0.35s. Challenge advances
    520ms after a wrong answer — a tighter budget than the correct sound.
    Peak -1.6 dBFS.

## Challenge results

- `suspense-roll.mp3` (drum roll under the results reveal)
  - Mixkit 566, "Drum Roll"
  - Trimmed from the 5.94s source to 3.45s so the crash lands at ~3.0s, on the
    score bar completing, with a 250ms fade from 3.20s. The reveal calls
    `stopSuspenseLoop()` at 3.52s, so the file has to finish before then or the
    crash gets cut mid-decay. Peak -3.4 dBFS.
- `star-ding.mp3` (one per star as it pops in during the reveal)
  - Mixkit 600, "Achievement bell"
  - Trimmed from the 2.40s source to 1.40s. The strike is at 0-0.2s and the
    ring-out is inaudible past ~1.0s, so the source's remaining 1.4s was dead
    tail. Stars land 0.4-0.6s apart, so these overlap by design. Peak -1.5 dBFS.
- `round-none.mp3` (challenge finished with 0 stars)
  - Mixkit 2032, "Negative answer lose"
  - Trimmed 3.03s → 1.65s; audible content ends at 1.40s. Nothing follows this
    sound, so its length is unconstrained. Peak -1.4 dBFS.
- `crown.mp3` (mastery crown earned)
  - Mixkit 2633, "Sweeping sparkle presentation intro"
  - Trimmed from the 3.00s source to 2.80s. Peak -1.3 dBFS.

## Navigation

- `mode-tap.mp3` (tapping into a game mode on the home screen)
  - Mixkit 2568, "Cool interface click tone"
  - Untrimmed. Duration 0.20s, peak -6.7 dBFS — deliberately quieter than the
    reward sounds, since it fires on every navigation.

## History

The original set came from Kenney's "Interface Sounds" pack (CC0,
https://kenney.nl/assets/interface-sounds). No Kenney files remain.
