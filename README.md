# Acute Medical Take — Android

Android mobile-app project for https://www.acutemedicaltake.org.

## Architecture

The first Android release uses Capacitor 8 as a native Android shell around the live Acute Medical Take website. This preserves the existing clinical website as the source of truth while allowing native Android features to be added progressively.

## Current v1 foundation

- Capacitor Android-ready project
- App ID: `org.acutemedicaltake.app`
- App name: `Acute Medical Take`
- Live production source: `https://www.acutemedicaltake.org`
- HTTPS-only navigation
- Native network-status support
- Branded local fallback screen
- Mobile safe-area styling

## Generate the Android project

On a Mac or Windows computer with Node.js installed:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio will open the generated native project.

## Planned AMT mobile features

1. Native bottom navigation
2. Favourite pathways
3. Recently viewed pathways
4. Offline emergency pack
5. AMT Pro login and entitlement
6. MRCP Part 2 question bank
7. Interactive acute medicine scenarios
8. Learning progress tracking
9. Push notifications for important content updates
10. Google Play production release

## Clinical governance

The app is an educational/clinical-reference interface to Acute Medical Take. Existing website clinical governance, source attribution, disclaimers and guideline provenance must remain visible in the app. Paid AMT Pro education should remain clearly separated from emergency clinical reference content.
