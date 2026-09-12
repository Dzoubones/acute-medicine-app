# Apple Developer configuration for build 2

Create these records under **AMT DIGITAL HEALTH LIMITED** (`WY6W336UZG`) before a signed archive. Do not store certificates, `.p8` keys, profiles or secrets in the repository.

| Component | Explicit identifier | Capability | Provisioning |
|---|---|---|---|
| Main iOS/iPadOS app | `uk.acutemedicine.acutemedicaltake` | App Groups | App Store profile; development profile for registered-device testing |
| WidgetKit extension | `uk.acutemedicine.acutemedicaltake.widgets` | App Groups | App Store extension profile; development profile for device testing |
| watchOS app | `uk.acutemedicine.acutemedicaltake.watch` | Watch companion relationship | App Store watch profile; development profile for paired-device testing |
| watchOS extension | `uk.acutemedicine.acutemedicaltake.watch.extension` | WatchKit extension relationship | App Store extension profile; development profile for paired-device testing |
| Shared container | `group.uk.acutemedicine.acutemedicaltake.shared` | App Group | Assign only to main app and widget extension |

LocalAuthentication, CryptoKit, Keychain, local notifications, App Intents and WatchConnectivity need no additional portal capability.

## Portal steps

1. Add App Group `group.uk.acutemedicine.acutemedicaltake.shared`.
2. Enable App Groups on the existing main App ID and select it.
3. Create the explicit Widget App ID and select the same App Group.
4. Create the explicit watchOS app and WatchKit extension App IDs beneath the verified namespace.
5. Regenerate development and App Store profiles after capability changes, or let automatic signing create them.
6. Confirm team `WY6W336UZG` on all four Xcode targets; do not use a Personal Team.
7. For physical review, select the registered iPhone and run the `App` scheme. Registration is needed for development/ad hoc profiles, not TestFlight installation.

The upload workflow verifies the embedded profile, signed application identifier, App Group entitlement, versions/builds, absence of `armv7`, and App Store Connect export method.
