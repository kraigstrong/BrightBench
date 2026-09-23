# Sound credits

## Kenney — "Interface Sounds" (CC0)

Source: https://kenney.nl/assets/interface-sounds
Converted OGG → MP3 with ffmpeg; otherwise unmodified.

- `correct.mp3` (correct answer) — confirmation_001.ogg
- `try-again.mp3` (wrong answer) — error_001.ogg
- `round-none.mp3` (challenge finished with 0 stars) — error_003.ogg

## Mixkit (free license, no attribution required)

Source: https://mixkit.co/free-sound-effects/ — the Mixkit free license allows
use in our apps with no attribution required. The details below are recorded for
our own traceability, not as a license obligation. Durations and peak levels are
as measured on the shipped files (`ffprobe`, `ffmpeg -af volumedetect`).

- `mode-tap.mp3` (tapping into a game mode on the home screen)
  - Mixkit 2568, "Cool interface click tone"
  - https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3
  - Untrimmed. Duration 0.20s, peak -6.7 dBFS.
- `suspense-roll.mp3` (drum roll under the challenge results reveal)
  - Mixkit 566, "Drum Roll"
  - https://assets.mixkit.co/active_storage/sfx/566/566-preview.mp3
  - Trimmed from the 5.94s source to 3.45s so the crash lands at ~3.0s, on the
    score bar completing, with a 250ms fade from 3.20s. The reveal calls
    `stopSuspenseLoop()` at 3.52s, so the file has to finish before then or the
    crash gets cut mid-decay. Duration 3.45s, peak -3.4 dBFS.
- `star-ding.mp3` (one per star as it pops in during the reveal)
  - Mixkit 600, "Achievement bell"
  - https://assets.mixkit.co/active_storage/sfx/600/600-preview.mp3
  - Trimmed from the 2.40s source to 1.40s. The strike is at 0-0.2s and the
    ring-out is inaudible past ~1.0s, so the source's remaining 1.4s was dead
    tail. Duration 1.40s, peak -1.5 dBFS.
- `crown.mp3` (mastery crown earned)
  - Mixkit 2633, "Sweeping sparkle presentation intro"
  - https://assets.mixkit.co/active_storage/sfx/2633/2633-preview.mp3
  - Trimmed from the 3.00s source to 2.80s. Duration 2.80s, peak -1.3 dBFS.
