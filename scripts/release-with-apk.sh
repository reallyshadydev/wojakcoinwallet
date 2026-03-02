#!/bin/bash
# Push main + tag and create a GitHub release with the APK.
# Prereqs: repo https://github.com/reallyshadydev/wojakwallet-android exists,
#          and you're authenticated (gh auth login or GITHUB_TOKEN, or git credential helper).
set -e
cd "$(dirname "$0")"
APK="android/app/build/outputs/apk/debug/wojakwallet.apk"
TAG="v1.0.0"
if [[ ! -f "$APK" ]]; then
  echo "APK not found: $APK. Run: npm run build && npx cap sync android && (cd android && ./gradlew assembleDebug)"
  exit 1
fi
echo "Pushing main and tag $TAG..."
git push origin main
git push origin "$TAG"
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  echo "Creating GitHub release $TAG with APK..."
  gh release create "$TAG" "$APK" --title "Release $TAG" --notes "WojakCoin Wallet Android. Install the APK on your device."
else
  echo "gh not authenticated. Create the release manually:"
  echo "  1. Go to https://github.com/reallyshadydev/wojakwallet-android/releases/new"
  echo "  2. Choose tag $TAG, title 'Release $TAG', attach: $APK"
fi
