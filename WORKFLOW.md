# Development & CI workflow

How code moves from a branch to shipped **web**, **Android**, and **iOS** builds.

## Overview

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────────┐
│  PR or push     │ ──► │  CI              │     │  main only (after merge)    │
│  to main        │     │  lint + build    │     │  Build Android + Build iOS  │
└─────────────────┘     └──────────────────┘     └─────────────────────────────┘
```

| Workflow | File | When it runs | What it does |
|----------|------|----------------|--------------|
| **CI** | `.github/workflows/ci.yml` | Every **PR** targeting `main`, every **push** to `main`, or **manual** | `npm run lint`, `npm run build` (static export) |
| **Build Android** | `.github/workflows/build-android.yml` | **Push** to `main` or **manual** | `npm run build`, `cap sync android`, Gradle `assembleDebug`, upload **APK** artifact |
| **Build iOS** | `.github/workflows/build-ios.yml` | **Push** to `main` or **manual** | `npm run build`, `cap sync ios`, Xcode build, upload **App.app** (+ optional release upload) |

## Typical developer flow

1. **Branch** off `main`, make changes.
2. **Locally:** `npm install --legacy-peer-deps`, `npm run dev` (or `npm run build` before mobile).
3. **Open a PR** → **CI** must pass (lint + static build).
4. **Merge to `main`** → **Build Android** and **Build iOS** run (heavy jobs).
5. **Get artifacts:** GitHub → **Actions** → select the run → **Artifacts** (APK / iOS app).

## Manual runs

In GitHub: **Actions** → choose **CI**, **Build Android**, or **Build iOS** → **Run workflow**.

## Environment / secrets

- **CI** does not need Electrs or price API keys for a green build; Next reads env at build time where required.
- For **production-like** mobile builds, set repo **Variables** / **Secrets** if you inject `NEXT_PUBLIC_*` at build time (see `.env.example`).
- **`NEXT_PUBLIC_PRICE_API_URL`**: optional. If unset in static/native builds, the app falls back to **CoinPaprika** (+ FX for non-USD) for price (see `lib/wojakcoin-api.ts`).

## Local Android / iOS

See **[ANDROID.md](./ANDROID.md)** and **[IOS.md](./IOS.md)** for Studio/Xcode steps and signing.
