# StudyOS

Minimal offline-first study planner (PWA). Plain HTML/CSS/JS, no backend, no accounts, no build step.

## Files
index.html · style.css · app.js · sw.js · manifest.webmanifest · icons/

## Host free on GitHub Pages
1. Create a new public repo on github.com (e.g. `studyos`).
2. Upload ALL files from this folder (keep the `icons/` folder), so `index.html` is at the repo root.
3. Repo → Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `(root)` → Save.
4. After ~1 minute open `https://<your-username>.github.io/studyos/`.

## Host free on Netlify
1. Go to app.netlify.com/drop.
2. Drag the unzipped `studyos` folder onto the page.
3. Open the link Netlify gives you (HTTPS is automatic).

PWAs need HTTPS (or localhost), so opening index.html straight from the phone's file manager will not install.

## Install on Android (Chrome)
1. Open your hosted link in Chrome and let it load fully once.
2. Tap the Install button in the app header, or Chrome menu (⋮) → "Install app" / "Add to Home screen".
3. Confirm. StudyOS appears on your home screen and opens fullscreen (standalone), also offline.

## Notes
- Progress is saved per calendar date in localStorage (on that device/browser only).
- Clearing browser/site data erases progress.
- After updating files, change `CACHE = 'studyos-v1'` in sw.js to `v2` so phones fetch the new version.
