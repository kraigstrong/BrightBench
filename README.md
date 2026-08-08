# BrightBench

BrightBench is a portfolio of focused educational apps built on a shared technical foundation and a calm, child-friendly design language.

## Portfolio

- Time Tutor: shipped Expo app and visual source of truth.
- Fraction Finder: active Expo app and tooling reference.
- Letter Learner: active Expo app for letter names, cases, and sounds.
- Marketing: deployable Next.js portfolio site.
- Letter Bingo and Place Value: future products.

Current priorities and outstanding human checks live in [`docs/current.md`](docs/current.md). Git history and pull requests are the durable record of completed work.

## Stack

- npm workspaces with Turbo orchestration.
- Expo-managed React Native, Expo Router, and React Native Web for product apps.
- Next.js App Router for marketing.
- Shared tokens in `@education/design` and stable primitives in `@education/ui`.
- Independent App Store and Vercel deployments per product.

## Quick start

Install dependencies:

```sh
npm ci
```

Run the repository quality gate:

```sh
npm run check
```

Run the full CI-equivalent gate, including affected Expo exports and the
production dependency audit:

```sh
npm run check:ci
```

Run one Expo app:

```sh
npm run dev -w time-tutor
npm run ios -w time-tutor
```

Run the marketing site:

```sh
npm run dev -w marketing
```

## Agent workflow

Start with:

1. [`AGENTS.md`](AGENTS.md)
2. [`docs/current.md`](docs/current.md)
3. A target app's nested `AGENTS.md`, when present
4. Files directly involved in the change

Reusable workflows live in `.agents/skills`. Verification is risk-based so routine UI work stays lightweight while persistence, native, privacy, and release changes receive stronger review.

## Documentation

- [`docs/architecture.md`](docs/architecture.md): system shape and package boundaries.
- [`docs/design-canon.md`](docs/design-canon.md): shared visual decisions.
- [`docs/release-playbook.md`](docs/release-playbook.md): deployment and release process.
- [`docs/app-template.md`](docs/app-template.md): scaffolding conventions for a new product.
- [`docs/decisions`](docs/decisions): durable ADRs that meet the repository threshold.

## Safety

`/Users/kraig/code/time-tutor` is read-only reference material. Make all changes inside this monorepo.
