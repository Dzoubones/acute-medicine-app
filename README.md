# Acute Medical Take — Mobile

Native iOS and Android projects for [Acute Medical Take](https://www.acutemedicaltake.org).

## Android 1.2.0 — AMT Pro lifetime

The Android app is a bundled, offline-first Capacitor application rather than a
remote website wrapper.

- Package: `org.acutemedicaltake.app`
- Version: `1.2.0` (`versionCode 2`)
- Android API: minimum 26, target/compile 36
- Java 17, Android Gradle Plugin 8.13.0, Gradle wrapper 8.14.3
- Google Play Billing Library 9.1.0
- One-time, non-consumable AMT Pro product: `amt_pro_lifetime`
- Android Keystore AES-GCM encrypted notes protected by biometrics or device credentials
- HTTPS deep links for `acutemedicaltake.org`

Free access includes clinical pathways, search, saved guidance/resources and
references. AMT Pro is displayed at the Google Play localised price (intended UK
base price £9.99) and unlocks Take Mode, all timer presets, encrypted personal
notes, starter questions and eligible future Pro enhancements. It is not a
subscription.

### Build and test Android

```bash
npm ci
npm test
npm run android:sync
./android/gradlew -p android assembleDebug bundleRelease
```

Outputs:

```text
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/bundle/release/app-release.aab
```

The GitHub **Android build** workflow runs the same tests and produces the APK
and AAB. It signs the AAB only when the protected Android signing secrets are
configured. See [the Android release guide](docs/ANDROID-RELEASE.md).

## iOS 1.0.0

The existing Apple build and entitlements are unchanged by the Android Pro
boundary.

- Bundle ID: `uk.acutemedicine.acutemedicaltake`
- Version: `1.0.0` (build 2)
- Minimum iOS: 15.0
- iPhone, iPad, WidgetKit and Apple Watch targets
- CryptoKit/Keychain personal notes protected by device authentication

On a Mac:

```bash
npm ci
npm run ios:sync
npm run ios:open
```

See [the iOS review dossier](docs/ios-build-2-review.md),
[Apple Developer configuration](docs/apple-developer-configuration.md), and the
[manual test plan](docs/manual-test-plan.md).

## Clinical governance

The app is an educational and clinical-reference interface. Source attribution,
disclaimers and guideline provenance must remain visible. Offline summaries do
not replace current local or national emergency algorithms. Paid education and
productivity tools remain separate from essential emergency reference content.
