# Delivery builds (handoff to client)

Files here are **not** committed to Git (see `.gitignore` for `*.aab` / `*.apk`).

## Google Play — Android App Bundle (`.aab`)

| File | Description |
|------|-------------|
| **`OnlyYou-1.0.2-production.aab`** | **Current for Play** — **v1.0.2** (versionCode **3**), package **`com.onlyyouchat.app`**, includes updated Firebase `google-services` from project. |
| `OnlyYou-1.0.1-production.aab` | Previous store bundle (v1.0.1 / versionCode 2). |
| `OnlyYou-1.0.0-production.aab` | Legacy (`com.onlyyou.app`); obsolete for the new listing. |

See **`docs/LATEST_PRODUCTION_BUILD.md`** for the latest EAS build page and artifact link.

## Internal testing — APK (install directly)

| File | Description |
|------|-------------|
| **`OnlyYou-1.0.1-preview.apk`** | Preview APK — **v1.0.1** (versionCode 2). For sideload/testing; use **`.aab`** above for Play. |

**EAS preview build:** https://expo.dev/accounts/turbo_chainx/projects/only-you/builds/6a4a71c2-2099-41c3-8fff-8cb41c518a4a  

**Regenerate APK:** `cd mobile && eas build --platform android --profile preview`
