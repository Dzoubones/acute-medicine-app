# Acute Medical Take — Android

Android mobile-app project for https://www.acutemedicaltake.org.

## Architecture

The first Android release uses Capacitor 8 as a native Android shell around the live Acute Medical Take website. The website remains the source of truth for clinical content while the app progressively adds native mobile navigation, local storage, offline content and AMT Pro functionality.

## Android Phase 1 — completed

- App ID: `org.acutemedicaltake.app`
- App name: `Acute Medical Take`
- Live production source: `https://www.acutemedicaltake.org`
- Native-style Android home screen
- Bottom navigation: Home, Search, Saved, More
- Clinical pathway navigator
- Emergency, Calculators and AMT Pro quick-access buttons
- Local pathway search
- Device-stored favourites using Capacitor Preferences
- Native haptic feedback on key interactions
- Native browser handoff to live AMT clinical content
- Online/offline network indicator
- Mobile safe-area support
- Clinical disclaimer and version screen
- Responsive phone layout

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

## Test locally before Android Studio

```bash
npm install
npm run dev
```

Open the local Vite address shown in Terminal to inspect the Phase 1 mobile shell in a browser.

## Phase 2

1. Replace generic live-site handoff with verified deep links to individual AMT pathways
2. Offline emergency pack
3. Recently viewed pathways
4. AMT Pro authentication and entitlement
5. MRCP Part 2 question bank
6. Interactive acute medicine scenarios
7. Learning progress dashboard
8. Push notifications for important content updates
9. Native AMT launcher icon and splash screen
10. Google Play signed App Bundle (`.aab`) release workflow

## Clinical governance

The app is an educational/clinical-reference interface to Acute Medical Take. Existing website clinical governance, source attribution, disclaimers and guideline provenance must remain visible in the app. Paid AMT Pro education should remain clearly separated from emergency clinical reference content.
