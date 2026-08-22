# Acute Medical Take — Android

Android mobile-app project for https://www.acutemedicaltake.org.

## Current native Android build

The repository now contains a real `android/` project that can be opened directly in Android Studio or built in GitHub Actions.

- App ID: `org.acutemedicaltake.app`
- App name: `Acute Medical Take`
- Version: `1.1.0` (`versionCode 1`)
- Minimum Android: API 26
- Compile SDK: API 36
- Target SDK: API 36
- Java: 17
- Android Gradle Plugin: 9.3.0
- Gradle used in CI: 9.5.0
- HTTPS-only live content from `acutemedicaltake.org`
- Native AMT launcher icon
- Native splash screen
- Deep-link intent filters for `acutemedicaltake.org`
- Offline fallback screen

Google Play requires new apps and app updates to target Android 16 / API 36 from 31 August 2026, so this project is already configured for that requirement.

## Build the first installable APK automatically

Open the GitHub repository, select **Actions**, then select **Android build** and run the workflow if it is not already running.

The workflow installs Android 16 SDK, JDK 17 and Gradle 9.5, then produces:

- `acute-medical-take-debug-apk` — installable Android APK for testing
- `acute-medical-take-release-aab-unsigned` — release App Bundle prepared for the later signing step

The debug APK can be installed on an Android device after allowing installation from the chosen source.

## Build locally in Android Studio

Open the `android/` directory in Android Studio. Install Android SDK Platform 36 and Build Tools 36.0.0 if prompted.

From a terminal you can also run:

```bash
gradle -p android assembleDebug
gradle -p android bundleRelease
```

Expected outputs:

```text
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/bundle/release/app-release.aab
```

## Google Play signing

The current release AAB is intentionally unsigned because the Play upload key must remain private. Before production submission, create or use an Android upload keystore, store it securely, configure release signing, and add the SHA-256 certificate fingerprint to the Digital Asset Links file at:

```text
https://www.acutemedicaltake.org/.well-known/assetlinks.json
```

Do not commit the keystore or its passwords to GitHub.

## Existing AMT mobile features

The web/native-ready layer already contains the Phase 1/2 work:

- Home, Search, Saved and More navigation
- Clinical pathway navigator
- Device-stored favourites
- Emergency and calculator shortcuts
- Offline emergency orientation material
- AMT Pro area
- Starter MRCP Part 2-style questions
- Answer explanations and pathway-review actions

The current native Android activity provides the installable shell and opens the live AMT website securely. The next integration stage is to bundle the richer Phase 1/2 web shell into the native project so those local features run directly inside the APK.

## Clinical governance

The app is an educational/clinical-reference interface to Acute Medical Take. Existing website clinical governance, source attribution, disclaimers and guideline provenance must remain visible. Offline summaries are deliberately concise and must not replace current local/national emergency algorithms. Paid AMT Pro education should remain clearly separated from emergency clinical reference content.
