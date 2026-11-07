# Acute Medical Take — Android release 1.2.0

This release is prepared for Google Play closed testing. It is intentionally not
submitted or promoted to production by the build workflow.

## Store identity

- Package name: `org.acutemedicaltake.app`
- Version: `1.2.0`
- Version code: `2`
- Minimum Android: API 26
- Target/compile SDK: API 36
- One-time product ID: `amt_pro_lifetime`
- Intended UK base price: £9.99

The product is an **in-app product**, not a subscription and not consumable. The
app queries Google Play for the purchaser's local price, restores ownership on a
new device, handles pending purchases and acknowledges completed purchases.

## Google Play Console setup

1. Create or select the app with package name `org.acutemedicaltake.app`.
2. Enrol in Play App Signing and retain the upload key securely.
3. Under **Monetise > Products > In-app products**, create
   `amt_pro_lifetime`, set the UK base price to £9.99, configure regional prices
   and activate it.
4. Complete the store listing, privacy policy, Data safety, App access, Ads,
   Content rating, Target audience, Health apps and any required medical-content
   declarations.
5. Upload the signed AAB to **Closed testing** first. Add licence testers and
   install the app from the tester Play Store link; sideloaded builds cannot
   fully test live Play Billing products.
6. Test purchase success, cancellation, pending payment, restore after reinstall,
   offline launch, biometric/device-credential notes, deep links and all free
   clinical pathways.
7. Review the pre-launch report and resolve every blocking policy or crash issue
   before requesting production access or promotion.

## GitHub signing secrets

Add these encrypted repository secrets. Never commit the keystore or passwords.

- `ANDROID_KEYSTORE_BASE64`: base64 encoding of the upload `.jks` file
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

When all four signing values are available, the Android build workflow produces
`acute-medical-take-1.2.0-signed.aab`. Without them it produces an explicitly
labelled unsigned bundle that cannot be uploaded to Google Play.

## Product boundary

Free users retain acute medical pathways, search, saved guidance/resources,
references and the offline orientation material. AMT Pro unlocks Take Mode, all
timer presets, authenticated encrypted personal notes, starter questions and
eligible future Pro enhancements. Emergency reference content must not become
dependent on a purchase.

## Required release evidence

- Successful CI tests, web build, Capacitor sync and native Gradle build
- Signed AAB generated with the Acute Medical Take upload key
- Purchase and restore tested by at least one Play licence tester
- Privacy policy publicly reachable and consistent with actual data handling
- Clinical governance, sources and safety disclaimers visible in the app
- Store screenshots captured from the release candidate
- Explicit owner approval before production submission
