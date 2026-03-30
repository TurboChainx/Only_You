# Google Play store listing assets

Use this checklist when preparing graphics for **Only You** (package `com.onlyyou.app`). Export from your design files or from `mobile/assets/` (see below).

## Required artwork (typical Play Console setup)

| Asset | Size | Notes |
|--------|------|--------|
| **App icon (high-res)** | **512 × 512** px | 32-bit PNG with alpha. Same branding as the in-app icon. |
| **Feature graphic** | **1024 × 500** px | JPG or 24-bit PNG, no transparency. Main banner on the store listing. |
| **Phone screenshots** | Min **320 px** shortest side; max **3840 px** longest side | At least **2** screenshots recommended. Show real UI (login, home, chat). |

## Source files in the project

- **Build-time icons:** `mobile/app.json` references:
  - `./assets/icon.png` — Expo typically uses a **1024 × 1024** master; confirm in [Expo app icons](https://docs.expo.dev/develop/user-interface/app-icons/).
  - `./assets/adaptive-icon.png` — foreground for adaptive icon on Android.
- **512 × 512 for Play:** Resize or export from the same artwork as `icon.png` to exactly **512 × 512** for the Play Console “High-res icon” field.

## Optional

- **Promo video** — YouTube URL  
- **Tablet screenshots** — if you target tablets  
- **TV / Wear** — only if you release on those form factors  

## File naming (suggestion)

Place exported files here for handoff (optional):

- `store-assets/icon-512.png`
- `store-assets/feature-graphic-1024x500.png`
- `store-assets/screenshots/` (numbered PNGs)

Binary assets are often gitignored or large; you may deliver them via cloud drive instead of committing them.
