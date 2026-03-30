# Play Store & client delivery package

This document matches what you need to ship to the client for **Google Play** publication: **Android App Bundle (`.aab`)**, **full source**, **listing assets**, and a **privacy policy** they can host.

## 1. What to hand over

| Deliverable | Location / how |
|-------------|----------------|
| Full source code | This repository (`backend/`, `admin-panel/`, `mobile/`, `deploy/`) |
| Production `.aab` | Build with EAS (below); artifact is downloaded from [Expo dashboard](https://expo.dev) |
| Privacy policy text | `docs/privacy-policy.md` — publisher hosts it at a **public URL** and enters that URL in Play Console |
| Store graphics spec | `store-assets/README.md` — sizes for icon (512×512), feature graphic (1024×500), screenshots |
| Deployment & ops | `DEPLOYMENT_GUIDE.md`, `HANDOFF_TO_CLIENT.md`, `README.md` |

## 2. Build the `.aab` (Google Play)

Play requires an **Android App Bundle**, not a raw APK for new uploads.

**Prerequisites:** Expo account (project owner in `app.json` → `extra.eas.projectId`), EAS CLI.

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

- **Profile `production`** uses `buildType: "app-bundle"` in `mobile/eas.json`.
- When the build finishes, download the **`.aab`** from the Expo build page and send it to the client (or attach to the milestone).

**Internal testing APK (optional):** same repo, preview profile:

```bash
eas build --platform android --profile preview
```

That produces an **APK** for testers, not for Play upload.

## 3. Signing (Play Console)

- **EAS Build** can manage Android credentials (`eas credentials`). On first production build, follow the prompts to create or upload a **keystore** / use **Google Play App Signing** (recommended).
- Do **not** rely on local `assembleRelease` with debug signing for store release. For store builds, use **EAS `production`** (or configure proper release signing locally if you know what you’re doing).

## 4. Client checklist (Play Console)

1. Create the app in [Google Play Console](https://play.google.com/console).
2. Upload the **`.aab`** in **Release** → testing track or production.
3. **App content** → **Privacy policy**: host `docs/privacy-policy.md` (or an HTML copy) at **HTTPS URL** and paste the URL here.
4. **Store listing** → add short/full description, **512×512** icon, **1024×500** feature graphic, phone screenshots (see `store-assets/README.md`).
5. Complete **Data safety** and **Permissions** declarations (align with `mobile/app.json` and backend behavior).

## 5. Privacy policy

- Edit `docs/privacy-policy.md`: replace bracketed placeholders (`[Your Company Name]`, contact email, jurisdiction).
- Publish the file on any public HTTPS URL (static site, GitHub Pages, S3, etc.). Google requires a **link**, not only a file in the repo.

## 6. App icons for the build vs Play listing

- **Expo / app build:** `mobile/app.json` references `./assets/icon.png` (typically **1024×1024** source) and `./assets/adaptive-icon.png`. Ensure those files exist before building.
- **Play Store “High-res icon”:** **512×512** px — export from the same artwork (see `store-assets/README.md`).

---

**Summary:** Run **`eas build --platform android --profile production`**, deliver the downloaded **`.aab`**, this repo (or archive), **`docs/privacy-policy.md`** (after they fill placeholders), and point them to **`store-assets/README.md`** for listing artwork.
