# Acute Medical Take — Android

Android mobile-app project for https://www.acutemedicaltake.org.

## Architecture

The Android release uses Capacitor 8 as a native shell around Acute Medical Take while progressively adding native mobile features. The live website remains the source of truth for full clinical content and evidence updates; selected emergency orientation material and learning content are stored locally in the app.

## Android Phase 1 — completed

- App ID: `org.acutemedicaltake.app`
- App name: `Acute Medical Take`
- Bottom navigation: Home, Search, Saved, More
- Clinical pathway navigator
- Device-stored favourites
- Local pathway search
- Haptic feedback
- Native browser handoff
- Online/offline status
- Responsive mobile-safe layout

## Android Phase 2 — completed in web/native-ready layer

- Offline emergency pack with:
  - Cardiac arrest
  - Anaphylaxis
  - Suspected sepsis
  - Severe hyperkalaemia
  - Life-threatening asthma
- Safety notes that direct clinicians back to current national/local algorithms for exact doses and definitive management
- AMT Pro area
- Five original MRCP Part 2-style starter questions
- Immediate answer feedback and explanations
- Direct pathway-review action from each MRCP question
- Deep-link listener prepared using Capacitor App `appUrlOpen`
- Version updated to 1.1.0

## Generate the native Android project

On a Mac or Windows computer with Node.js and Android Studio installed:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

The final command opens the generated project in Android Studio.

## Test the app locally first

```bash
npm install
npm run dev
```

Open the Vite address shown in Terminal.

## Native Android deep-link activation

The JavaScript app is ready to receive links from `acutemedicaltake.org`, but Android must also be told that this app owns those web links.

After `npx cap add android`, edit:

`android/app/src/main/AndroidManifest.xml`

Inside the main Activity, add an intent filter similar to:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="www.acutemedicaltake.org" />
    <data android:scheme="https" android:host="acutemedicaltake.org" />
</intent-filter>
```

For verified Android App Links, publish a valid Digital Asset Links file at:

`https://www.acutemedicaltake.org/.well-known/assetlinks.json`

That file must contain the final Android package name and the SHA-256 fingerprint of the signing certificate used for the Play Store build.

## Next Android stage

1. Generate and commit the actual `android/` native project
2. Set target/compile SDK to the current Google Play requirement
3. Add AMT launcher icon and splash screen assets
4. Add recently viewed pathways
5. Expand MRCP Part 2 question bank
6. Add interactive acute medicine scenarios
7. Add AMT Pro authentication/entitlement
8. Add learning progress tracking
9. Add push notifications
10. Build and sign the Google Play `.aab`

## Clinical governance

The app is an educational/clinical-reference interface to Acute Medical Take. Existing website clinical governance, source attribution, disclaimers and guideline provenance must remain visible. Offline summaries are deliberately concise and must not replace current local/national emergency algorithms. Paid AMT Pro education should remain clearly separated from emergency clinical reference content.
