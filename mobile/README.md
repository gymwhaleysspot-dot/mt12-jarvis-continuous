# A17Y MT12 Mobile Companion

Native Android and iPhone companions for the RadioMaster MT12.

## Android

The Android app uses the Storage Access Framework for persistent access to an MT12/USB folder and Android USB-host enumeration for connection awareness. After the user authorizes the MT12 root once, the app can scan `LOGS`, hash/deduplicate CSV files, upload new logs to `tests/replays`, create backup manifests, and copy a verified `.uf2` file to an authorized `EDGETX_UF2` volume. Android hardware and vendor storage-provider support determine whether a connected drive is exposed automatically.

## iPhone

The iOS app uses `UIDocumentPickerViewController` directory authorization and security-scoped bookmarks. The user authorizes the MT12 folder once; the app remembers that folder and can sync whenever opened or when **Sync MT12** is pressed. iOS does not allow a normal app to silently enumerate an arbitrary USB mass-storage device in the background. EdgeTX firmware is downloaded/verified in-app and exported to the Files workflow for copying to `EDGETX_UF2`. ELRS uses the official Wi-Fi web interface or a remotely built firmware package.

## Shared safeguards

- Exact RadioMaster MT12 target
- SHA-256 deduplication and verification
- Backup-before-update gate
- Minimum battery gate
- Explicit flash approval
- Stable/prerelease firmware channels
- Rollback records
- No automatic trusted-controller promotion

## Builds

GitHub Actions builds an Android debug APK and an unsigned iOS Simulator app/source package. Installing on a physical iPhone requires signing with the user's Apple developer identity in Xcode.