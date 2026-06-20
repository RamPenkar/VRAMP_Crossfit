# VRAMP × CrossFit — Selected Work

A single-page reel site for VRAMP × CrossFit. Vertical videos, immersive viewer, mobile-first.

## Quick deploy to GitHub Pages

1. Create a new repo on GitHub (public). Name it whatever you want — e.g. `VRAMP_Crossfit`.
2. From this folder:

   ```bash
   cd ~/VRAMP_Crossfit
   git init
   git add .
   git commit -m "Initial reel"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**
   Source: `Deploy from a branch` · Branch: `main` · Folder: `/ (root)` · Save.
4. Wait ~1 minute. Your link will appear at the top of the Pages settings:
   `https://<your-username>.github.io/<your-repo>/`
5. Send that link to your client.

The repo includes a `.nojekyll` file so GitHub serves all files as-is.

## Edit videos / titles

All site content lives in [`app.js`](./app.js) at the top:

```js
const VIDEOS = [
  { slug: 'one-shot', title: 'One Shot', tag: 'Brand', dur: 27 },
  ...
];
```

To **reorder** videos, change the array order.
To **rename** a piece, edit the `title` and/or `tag`.
To **add** a new video: drop the file in `videos/` (and a poster in `posters/`) using a matching slug, then add a new entry to the array.

## Re-encoding new source files

The source masters are large; for web use I encoded each to ~1080×1920 H.264 with `+faststart`. The script `_compress.sh` is included in the repo for reference (gitignored by default) — it expects ffmpeg installed via `brew install ffmpeg`.

## Local preview

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

## Brand quick-edits

- **Tagline / headline:** [`index.html`](./index.html) — the `.hero-title` block.
- **Accent color:** [`styles.css`](./styles.css) — the `--accent` token at the top.
- **Email:** search `ram.penkar@gmail.com` in `index.html` and replace.

---

Built mobile-first with a 9:16 immersive viewer (swipe left/right between pieces, swipe down or tap × to close, arrow keys on desktop).
