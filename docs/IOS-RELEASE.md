# Acute Medical Take — iOS release handover

## Regenerated project

- Xcode project: `ios/App/App.xcodeproj`
- Bundle identifier: `uk.acutemedicine.acutemedicaltake`
- Display name: `Acute Medical Take`
- Version: `1.1.0`
- Build number: `1`
- Minimum iOS version: `15.0`
- Live content: `https://www.acutemedicaltake.org`
- Package manager: Swift Package Manager

The iOS project, web bundle, AMT icon, splash screen and Capacitor plugins are
included. No signing certificate, provisioning profile or App Store Connect
credential is stored in the project.

## Open and test on a Mac

1. Install the current App Store-supported Xcode release.
2. Run `npm ci` from the repository root.
3. Run `npm run ios:sync`.
4. Run `npm run ios:open`.
5. In Xcode, select the `App` target and choose the correct Apple Developer
   team under Signing & Capabilities.
6. Keep the bundle identifier as `uk.acutemedicine.acutemedicaltake` if that
   identifier is already registered in the Apple Developer account.
7. Test on a physical iPhone as well as an iPhone simulator.

## Required release checks

- The homepage loads from `www.acutemedicaltake.org` over HTTPS.
- Clinical pathways, search, calculators and external guideline links open.
- Back navigation, rotation, safe-area spacing and keyboard behaviour work.
- Loss of connectivity produces a clear, non-misleading state.
- Clinical governance, educational-use notice and source attribution remain
  visible.
- No patient-identifiable information is requested or retained.

## TestFlight handover

1. Set the release destination to **Any iOS Device (arm64)**.
2. Choose **Product > Archive** in Xcode.
3. In Organizer, select **Distribute App > App Store Connect > Upload**.
4. Complete the App Store privacy answers, screenshots, support URL and review
   information in App Store Connect.
5. Release first through TestFlight, complete device testing, and only then
   submit for App Review.

The regenerated project has not been signed, uploaded or submitted to Apple.
