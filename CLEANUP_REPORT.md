# Cleanup / Optimization Report

This build keeps the existing game functionality but cleans up broken or duplicated pieces that were making the project harder to maintain.

## Fixed

- Fixed a syntax error in `rooms/content_config.js` that could stop entity encounters/config loading.
- Kept Firebase compatibility for both config names:
  - `window.GAME_FIREBASE_CONFIG`
  - `window.FIREBASE_GAME_CONFIG`
- Kept the corrected cloud save logic using `getFirebaseGameConfig()`.
- Kept the Clear Mind achievement fix so it does not unlock just from opening the menu.
- Kept trophies page scrolling and hid the sanity bar there.
- Kept settings page scrolling.
- Kept crafting/cooking scrolling.
- Kept upgraded inventory UI.
- Kept creature gibberish voice settings.

## Cleaned

- Moved the settings page behavior out of inline HTML and into `rooms/settings.js`.
- Added `.gitignore` so private/admin Firebase files and local junk do not get committed.
- Added this report so future changes are easier to track.

## Optimized

- Downscaled the oversized `images/trail.png` background from 3264px wide to 1920px wide. It still works as a full-screen background, but loads faster and makes the project ZIP smaller.

## Notes

- No gameplay systems were intentionally removed.
- Template/old helper files were left in place instead of deleted so nothing relying on them breaks.
