# Acute Medical Take iOS 1.0.0 (2) review dossier

Status: review branch only. Do not merge, upload to TestFlight, change pricing, or submit for App Review without explicit approval.

## Build 1 installation diagnosis

Build 1 archived, exported with `method=app-store-connect`, uploaded, and was accepted for TestFlight processing. The repository and upload workflow show the expected Team ID `WY6W336UZG`, main bundle ID `uk.acutemedicine.acutemedicaltake`, iOS 15 minimum and automatic App Store Connect signing.

The only source-level install-eligibility defect found is `UIRequiredDeviceCapabilities = [armv7]` in the shipped app Info.plist. That declares a legacy 32-bit CPU capability while the current Xcode archive is arm64. On current 64-bit-only iOS/iPadOS this can make a processed build ineligible at installation. Build 2 removes the key entirely and CI now fails if `armv7` reappears.

The build 1 IPA was not retained as a workflow artifact, so its exact embedded profile cannot be decoded retrospectively. This diagnosis is therefore the strongest evidenced source cause, not a claim based on inspecting the already-uploaded IPA. Build 2 adds post-archive checks for the embedded profile, signed application identifier, App Group entitlement, compiled Info.plist and executable architectures.

## Build 2 packaging and compatibility

| Check | Build 2 configuration |
|---|---|
| Main bundle | `uk.acutemedicine.acutemedicaltake` |
| Widget extension | `uk.acutemedicine.acutemedicaltake.widgets` |
| Watch app | `uk.acutemedicine.acutemedicaltake.watch` |
| Version/build | `1.0.0` / `2` |
| Main minimum OS | iOS/iPadOS 15.0 |
| Widget minimum OS | iOS/iPadOS 17.0 |
| Watch minimum OS | watchOS 10.0 |
| Main device family | iPhone and iPad |
| Architectures | Xcode standard architectures; no legacy requirement or exclusion |
| Export | App Store Connect, automatic signing, explicit Team ID |
| Main experience | bundled Vite assets; no production `server.url` |

`ios-testflight.yml` decodes and validates the embedded provisioning profile and signed entitlements before export. It has not been run for build 2.

## Feature summary

- Anonymous, device-only Take Mode with presentation selection, ABCDE, investigation and escalation checklists, user timestamps, outstanding/completed states, reset and permanent deletion.
- Manual local timers for sepsis, stroke, status epilepticus, treatment reassessment and user-created review points. Wall-clock deadlines survive backgrounding/relaunch; notifications are optional.
- Four WidgetKit widgets with deep links: Quick Pathways, Offline Emergencies, Favourites and Active Timer.
- Privacy-safe App Intents for opening the app, sepsis, emergencies, timers and favourites.
- Notes authenticated with LocalAuthentication, encrypted with CryptoKit AES-GCM, protected on disk, excluded from backup, with a 256-bit key in Keychain as `ThisDeviceOnly`.
- Adaptive iPad sidebar/dashboard and multi-column content at wider sizes.
- SwiftUI watchOS companion for emergency summaries, favourites and a local timer, with WatchConnectivity receiving minimum safe state.
- Existing offline summaries, mobile search, favourites, AMT Pro starter questions, branding, icon/splash assets and secure external website links are preserved.

## Clinical safety and App Review

The app does not accept patient identifiers in Take Mode, diagnose, calculate or recommend drug doses, or claim to replace clinical monitoring or judgement. Clinical views display source/version information, the AMT content review date, a clinical-sign-off gate and direction to current local/national guidance.

For Guideline 1.4, it avoids health-measurement accuracy claims, automated diagnosis and unvalidated dose calculations. Independent AMT clinician sign-off of every bundled summary, timer label, source/version and escalation statement remains a release gate.

For Guideline 4.2, it is no longer a website wrapper: Take Mode, offline summaries, background-safe timers, optional local notifications, encrypted notes, widgets, App Intents, an iPad dashboard and Watch companion provide platform-specific utility. The website is a labelled optional external reference.

## Privacy and data flow

| Data | Storage | Shared | Network |
|---|---|---|---|
| Take Mode checklist/timestamps | Capacitor Preferences on device | No | None |
| Timer title/deadline/status | On device | Minimum state to App Group/widget and WatchConnectivity | None |
| Favourites | On device | Pathway titles to App Group/widget and WatchConnectivity | None |
| Personal notes | AES-GCM encrypted application-support file | Never | None |
| Encryption key | Keychain, when-unlocked, this-device-only | Never | None |
| Local notification | Timer title and generic review wording | iOS notification service on device | None |
| Complete website | Not the primary app | Opens only after user action | HTTPS to `acutemedicaltake.org` |

No analytics SDK, AMT server upload, third-party note service, iCloud sync or clinical-note logging is introduced.

## Verification status

- Passed locally: 9 Node feature/release-safety tests.
- Passed locally: production Vite build and Capacitor iOS sync with six plugins.
- Passed locally: Xcode project parser validation.
- Pending GitHub macOS CI: iPhone/iPad container, WidgetKit and watchOS compilation plus built metadata/architecture checks.
- Pending Apple portal setup: App Group and explicit Widget/Watch App IDs.
- Pending physical test: install build 2 on the registered iPhone, first/offline launch, upgrade, authentication, notifications and relaunch.
- Pending visual evidence: iPhone, iPad portrait/landscape/Split View, widgets and Apple Watch after native CI is green.

## Remaining risks

1. Build 1's processed IPA/profile is unavailable, so the root cause cannot be proven by binary forensics.
2. Clinical content and sources require AMT clinician sign-off before external testing or App Review.
3. Widget/Watch provisioning cannot archive until portal identifiers and App Group are configured.
4. A physical-device result cannot be claimed until build 2 is signed and installed on the registered iPhone.
5. Authentication and notification denied states require device validation.
6. External TestFlight testing may require TestFlight App Review; this change does not submit it.

## Future TestFlight command — do not run yet

After explicit approval, portal configuration, a green PR, and merge to `main`:

```bash
gh workflow run ios-testflight.yml \
  --repo Dzoubones/acute-medicine-app \
  --ref main \
  -f build_number=2
```

This workflow uploads build 2 to TestFlight only. It does not submit for App Review or alter pricing.
