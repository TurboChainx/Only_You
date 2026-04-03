# Delivery builds (handoff to client)

Files here are **not** committed to Git (see `.gitignore` for `*.aab` / `*.apk`).

## Google Play — Android App Bundle (`.aab`)

| File | Description |
|------|-------------|
| **`OnlyYou-1.0.1-production.aab`** | Store upload — **v1.0.1** (versionCode **2**), package **`com.onlyyouchat.app`**. |
| `OnlyYou-1.0.0-production.aab` | Legacy (`com.onlyyou.app`); obsolete for the new listing. |

See **`docs/LATEST_PRODUCTION_BUILD.md`** for EAS download links.

## Internal testing — APK (install directly)

| File | Description |
|------|-------------|
| **`OnlyYou-1.0.1-preview.apk`** | **Preview / internal** build — same app id **`com.onlyyouchat.app`**, Firebase `google-services.json` with both legacy + new Android clients. For sideload or testing **not** for Play upload (use `.aab` for Play). |

**EAS preview build:** https://expo.dev/accounts/turbo_chainx/projects/only-you/builds/6a4a71c2-2099-41c3-8fff-8cb41c518a4a  

**Regenerate APK:** `cd mobile && eas build --platform android --profile preview`
