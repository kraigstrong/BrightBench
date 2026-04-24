# Letter Learner

Letter Learner is an Expo-managed BrightBench app for practicing letter names,
letter cases, and letter sounds.

## Local Development

- `npm run dev -w letter-learner`
- `npm run ios -w letter-learner`
- `npm run web -w letter-learner`

## Checks

- `npm run typecheck -w letter-learner`
- `npm run lint -w letter-learner`
- `npm test -w letter-learner -- --runInBand`
- `npm run web:export -w letter-learner`

## Audio

Static audio lives in `assets/audio` and is bundled through
`src/features/game/audio/manifest.ts`.

Letter Match uses `assets/audio/match/lower/*.mp3` and `assets/audio/match/upper/*.mp3`
for spoken clues like “lowercase m”.

Regenerate audio with:

```sh
npm run generate-audio -w letter-learner
```

Use `-- --force` to overwrite existing files:

```sh
npm run generate-audio -w letter-learner -- --force
```
