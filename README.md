# stas-lohvinov.github.io

Portfolio landing page of Stas Lohvinov, senior frontend developer for browser slot and casino games (TypeScript, PixiJS, Phaser, Spine, GSAP).

Live: https://stas-lohvinov.github.io/

Plain HTML, CSS and JavaScript. No build step, no dependencies except Google Fonts. Hosted on GitHub Pages from the `main` branch root.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Page markup: hero, showcase, experience, stack, contact |
| `styles.css` | All styles. Colour tokens are CSS variables in `:root` |
| `reels.js` | Slot-reel canvas in the hero. `DATA` and `STYLE` config at the top |
| `showcase.js` | Renders the "Selected work" section from `works.json` |
| `works.json` | Showcase entries. An empty array `[]` hides the section |
| `works.example.json` | Template entry to copy into `works.json` |
| `works/<slug>/` | Images and videos for showcase entries |
| `stas_lohvinov_frontend_dev_resume.pdf` | CV linked from the "Download CV" buttons |

## Run locally

The showcase loads `works.json` with `fetch`, which browsers block on `file://` pages. Use a local server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Add a showcase entry

1. Put media in `works/<slug>/`, for example `works/reel-spin/clip.mp4`.
2. Copy the entry from `works.example.json` to the top of the array in `works.json`.
3. Fill it in. Entries are shown in file order.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | |
| `year` | no | Number or string |
| `type` | no | e.g. `"Personal project"`, `"Commercial slot, cleared clip"` |
| `summary` | no | One or two sentences |
| `stack` | no | Array of strings, shown as "Built with …" |
| `media` | no | `type` (`"video"` or `"image"`), `src`, `poster` (video), `alt`, `aspect` (`"16/9"` default, `"9/16"` for portrait) |
| `links` | no | Array of `{ "label", "href" }`. External links open in a new tab |

Videos play muted while on screen and never autoplay when the visitor prefers reduced motion. Keep clips short (10–20 s) and small (2–5 MB, H.264 MP4).

If `works.json` has a syntax error or an entry has no title, the page still loads and the browser console says what went wrong.

Only publish work you're allowed to show: personal projects, or clips your employer has cleared.

## Change the hero reels

Edit `DATA.reels` in `reels.js`. Each reel is an array of `{ v, l }` symbols (value and label). `DATA.firstLanding` sets which symbol each reel stops on after the first spin. Every number must match the CV.

Visual settings (fonts, sizes, radii, timing, bounce) are in `STYLE`. Colours written as `'--name'` are read from the CSS variables in `styles.css`, so a palette change there applies to the canvas too.

## Deploy

```bash
git add -A
git commit -m "Describe the change"
git push
```

GitHub Pages republishes within a minute or two (Settings → Pages: deploy from branch `main`, folder `/ (root)`).
