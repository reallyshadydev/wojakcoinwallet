# Building Wojakcoinwallet for iOS

This project uses [Capacitor](https://capacitorjs.com/) to run the same Next.js wallet UI inside a WebView on iOS.

**You need a Mac with Xcode** to build and run the iOS app. Building cannot be done on Linux/Windows.

## Prerequisites

- **macOS** with Xcode (from the App Store)
- **Xcode Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods` or `brew install cocoapods`
- Node.js 18+

## Setup

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment**
   Copy `.env.example` to `.env.local` and set:
   - **`NEXT_PUBLIC_ELECTRS_API_URL`** — Public Electrs URL (default: `https://api.wojakcoin.cash`).
   - **`NEXT_PUBLIC_PRICE_API_URL`** — (Optional) Base URL for price API.

3. **Build the web app and sync to iOS**
   ```bash
   npm run build
   npx cap sync ios
   ```
   Or in one step: `npm run build:ios`

4. **Install CocoaPods dependencies** (on the Mac)
   ```bash
   cd ios/App && pod install && cd ../..
   ```

5. **Open in Xcode and run**
   ```bash
   npm run open:ios
   ```
   Then in Xcode: select a simulator or device → Run (▶️). For a device you need an Apple Developer account and signing.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build:ios` | Runs `next build` then `cap sync ios` (copy `out/` into the iOS project). |
| `npm run open:ios` | Opens the iOS project in Xcode. |

## Build flow

1. `next build` produces a **static export** in `out/`.
2. `cap sync ios` copies `out/` into `ios/App/App/public`.
3. The app uses `NEXT_PUBLIC_ELECTRS_API_URL` (https://api.wojakcoin.cash) for blockchain data; CORS is enabled on the API for the app.

## Release / Archive

In Xcode:

1. Select **Any iOS Device (arm64)** (or a connected device).
2. **Product → Archive**.
3. After archiving, use **Distribute App** to export for App Store Connect or ad-hoc distribution.

## TestFlight (install on your iPhone)

TestFlight lets you install beta builds on your iPhone without going through the App Store. You need an **Apple Developer account** ($99/year) and a **Mac with Xcode**.

### 1. App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com) and sign in with your Apple Developer account.
2. **My Apps** → **+** → **New App**. Choose iOS, name (e.g. “Wojakcoinwallet”), bundle ID, SKU. Create the app (you don’t have to submit to the store to use TestFlight).
3. Note the **Bundle ID** (e.g. `com.yourapp.wojakcoinwallet`). It must match the one in the Xcode project: open `ios/App/App/Info.plist` or the project in Xcode and check **Signing & Capabilities** → Bundle Identifier.

### 2. Signing in Xcode (on your Mac)

1. Clone the repo and build/sync as in **Setup** above (`npm run build:ios`, then `cd ios/App && pod install`).
2. Open the app: `npm run open:ios` (or open `ios/App/App.xcworkspace`).
3. In Xcode: select the **App** project in the left sidebar → **Signing & Capabilities**.
4. Check **Automatically manage signing**, choose your **Team** (your Apple Developer account). Xcode will create/use a provisioning profile.
5. Ensure the **Bundle Identifier** matches the app you created in App Store Connect.

### 3. Archive and upload

1. At the top of Xcode, set the run destination to **Any iOS Device (arm64)**.
2. Menu: **Product → Archive**.
3. When the Organizer opens, select the new archive and click **Distribute App**.
4. Choose **App Store Connect** → **Upload** → Next.
5. Leave options as default (e.g. upload symbols, manage version/build) → Next.
6. Select your distribution certificate / signing identity → Next and wait for the upload to finish.

### 4. Enable the build in TestFlight

1. In App Store Connect, open your app → **TestFlight** tab.
2. Under **iOS Builds**, the build you just uploaded will appear (processing can take 5–15 minutes).
3. When it’s ready, add **Internal Testing** (your own team) and/or **External Testing** (requires a short review). You can add yourself as a tester.

### 5. Install on your iPhone

1. On your iPhone, install **TestFlight** from the App Store.
2. Open the email invite from App Store Connect, or in TestFlight tap **Redeem** and enter the code from App Store Connect (TestFlight → your app → testers).
3. In TestFlight, tap **Install** next to Wojakcoinwallet. The app will install like a normal app.

**Note:** The build from the **GitHub Actions** workflow (the `.app` in the release artifact) is **unsigned** and cannot be used for TestFlight. You must archive and upload from your Mac with your Apple Developer signing as above.

## App icons

The Android project uses Wojak branding in `android/.../res/`. For iOS, set the app icon in Xcode:

- Open **ios/App/App/Assets.xcassets/AppIcon.appiconset** and add the required sizes, or replace with your `wojaklogo`-based assets.

## Notes

- **CocoaPods** was skipped on non-Mac (e.g. Linux CI). On the Mac, run `pod install` in `ios/App` before opening in Xcode.
- **Signing**: You need an Apple Developer account to run on a real device or ship to the App Store.
