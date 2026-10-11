# Vasudev Android

Vasudev uses Capacitor to package the existing app as an Android application while keeping the web app available.

## Automated APK

Every push to `main` starts the **Android APK** GitHub Actions workflow. When it succeeds:

1. Open the repository's **Actions** tab.
2. Open the latest **Android APK** run.
3. Download the `vasudev-android-debug` artifact.
4. Extract it to get `app-debug.apk`, then install it on an Android test device.

The debug APK is for testing, not Play Store release.

## Local Android development

Requirements: Node.js 22, Android Studio, and its Android SDK.

```sh
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

After changing web code, run `npm run android:sync`, then run the app from Android Studio or use `npm run android:run` with a connected device/emulator.

## Before Play Store release

- Test on real phones and tablets, including small screens.
- Test local project persistence, import/export, keyboard behavior, and printing.
- Add app icons and a launch screen.
- Configure a signed release build and protect the signing key.
- Review privacy/data handling and store listing requirements.
- Test offline behavior and native Android back navigation.

The automated build produces a debug APK. It does not publish to Google Play or create a signed release.
