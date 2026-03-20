# Building Wojakcoinwallet for Android

This project uses [Capacitor](https://capacitorjs.com/) to run the same Next.js wallet UI inside an Android WebView.

## Prerequisites

- Node.js 18+
- Android Studio (for building the APK and running the app)
- JDK 17

## Setup

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment**
   Copy `.env.example` to `.env.local` and set:
   - **`NEXT_PUBLIC_ELECTRS_API_URL`** — Public Electrs URL (default: `https://api.wojakcoin.cash`). Must be reachable from the device.
   - **`NEXT_PUBLIC_PRICE_API_URL`** — (Optional) Base URL of a deployed Next.js app that exposes `/api/price`. If unset, the app uses cached price only.

3. **Build the web app and add Android**
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   ```

4. **Open in Android Studio and run**
   ```bash
   npm run open:android
   ```
   Then in Android Studio: Run → Run 'app' (or build a release APK via Build → Build Bundle(s) / APK(s)).

## CI (GitHub Actions)

Workflow **Build Android** (`.github/workflows/build-android.yml`) runs on **push to `main`** and **manual dispatch**. It:

1. Runs `npm run build` (static export)
2. Runs `npx cap sync android`
3. Builds **`assembleDebug`** (unsigned debug APK)
4. Uploads **`app-debug.apk`** as a **workflow artifact**

**No GitHub Release is created** — download the APK from the Actions run → **Artifacts** when you are ready to test. After you verify, you can cut a proper signed release separately.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build:android` | Runs `next build` then `cap sync android` (copy `out/` into the Android project). |
| `npm run open:android` | Opens the Android project in Android Studio. |

## Build flow

1. `next build` produces a **static export** in `out/` (no server; API routes are not available inside the app).
2. In the Android app, the wallet talks to Electrs **directly** using `NEXT_PUBLIC_ELECTRS_API_URL`.
3. Price data uses `NEXT_PUBLIC_PRICE_API_URL` if set; otherwise only cached values are shown.

## Release APK

In Android Studio:

1. Build → Generate Signed Bundle / APK → APK.
2. Choose or create a keystore and complete the wizard.

The signed APK will be in `android/app/build/outputs/apk/`.

## Updating the app (no data loss)

To ship updates so **existing users keep their wallet and app data**:

1. **Keep `applicationId` the same**  
   In `android/app/build.gradle`, leave `applicationId "cash.wojakcoin.wallet"` unchanged. Changing it makes Android treat the app as a new one and users lose data.

2. **Sign with the same keystore**  
   Every release APK must be signed with the **same** keystore you used for the first release. Otherwise the system won’t allow an update and may treat it as a different app.

3. **Bump version for each release**  
   In `android/app/build.gradle`, increase `versionCode` (e.g. 1 → 2 → 3) for every release. Update `versionName` for display (e.g. `"1.0"` → `"1.1"`).  
   Example:
   ```gradle
   versionCode 2
   versionName "1.1"
   ```

When users install the new APK over the existing app (or get the update from the Play Store), Android performs an **update**: the app’s data directory (including WebView storage where the wallet’s `localStorage` lives) is kept, so keys and settings are preserved.

## Troubleshooting

- **"Bus error (core dumped)" on `npm run build`** — This project is pinned to Next.js 15 (not 16) because some environments hit a bus error with Next 16’s build. If you still see it, try building on another machine (e.g. CI or a different host) and copy the `out/` folder here, then run `npx cap sync android`.
