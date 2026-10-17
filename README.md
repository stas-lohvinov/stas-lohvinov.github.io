# stas-lohvinov.github.io

Portfolio landing page of Stas Lohvinov, senior frontend developer for browser slot and casino games (TypeScript, PixiJS, Phaser, Spine, GSAP).

Live: https://stas-lohvinov.github.io/

Plain HTML, CSS and JavaScript. No build step, no dependencies except Google Fonts and GoatCounter analytics. Hosted on GitHub Pages from the `main` branch root.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Page markup: hero, showcase, LinkedIn posts, experience (rendered from JSON), stack, contact |
| `styles.css` | All styles. Colour tokens are CSS variables in `:root` |
| `config.js` | Site-wide feature flags (`features.showcase`, `features.linkedinPosts`, `features.experienceSummary`). Set a flag to `false` to hide that section |
| `reels.js` | Slot-reel canvas in the hero. `DATA` and `STYLE` config at the top |
| `experience.js` | Renders the "Experience" section from `experience.json` |
| `experience.json` | Jobs, newest first. Fields: `when`, `title` (required), `where`, `summary`, `highlights` |
| `showcase.js` | Renders the "Selected work" section from `works.json` |
| `works.json` | Showcase entries. An empty array `[]` hides the section |
| `works.example.json` | Template entry to copy into `works.json` |
| `posts.js` | Renders the "LinkedIn posts" section from `posts.json` |
| `telemetry.js` | Sends GoatCounter events (CV, LinkedIn, email, reel spin, showcase links and videos). `SETTINGS` at the top |
| `posts.json` | LinkedIn post URNs, 1 to 3 shown. An empty array `[]` hides the section |
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

## Add a LinkedIn post

On LinkedIn open the post menu, choose "Embed this post", and copy the `urn:li:...` part of the iframe `src` (the number after `update/`). Add it to `posts.json`:

```json
{ "urn": "urn:li:ugcPost:7515347321409400832", "title": "Short description of the post" }
```

`urn` is required, `title` is optional (it is the iframe's accessible name). Only the first 3 valid entries are shown. Invalid entries are skipped with a console warning.

## Change the hero reels

Edit `DATA.reels` in `reels.js`. Each reel is an array of `{ v, l }` symbols (value and label). `DATA.firstLanding` sets which symbol each reel stops on after the first spin. Every number must match the CV.

Visual settings (fonts, sizes, radii, timing, bounce) are in `STYLE`. Colours written as `'--name'` are read from the CSS variables in `styles.css`, so a palette change there applies to the canvas too.

## Analytics

[GoatCounter](https://www.goatcounter.com) counts visits without cookies. Dashboard: https://losta.goatcounter.com

Events sent by `telemetry.js` (shown under "Events" on the dashboard):

| Event | When |
| --- | --- |
| `cv-download` | A "Download CV" link is clicked |
| `linkedin-click` | A LinkedIn link is clicked |
| `email-click` | A `mailto:` link is clicked |
| `reel-spin` | The visitor spins the reels, once per page view. The automatic spin on load is not counted |
| `showcase-link` | A link in "Selected work" is clicked. Title is `Entry title: link label` |
| `showcase-video-play` | The visitor starts a showcase video, once per video per page view. Muted autoplay is not counted. Title is the entry title |

Event names and selectors are in `SETTINGS` in `telemetry.js`. If `count.js` is blocked, nothing is sent and the page works as usual.

### Per-application links

Send each application its own link: `https://stas-lohvinov.github.io/?ref=acme`. GoatCounter reads `ref` (also `utm_source`, `src`, `source`) as the campaign source and lists it under "Campaigns". Use one lowercase company slug per application.

### Exclude my own visits

Open `https://stas-lohvinov.github.io/#toggle-goatcounter` once in each browser (laptop, phone). Open it again to turn counting back on. `localhost` is ignored by GoatCounter by default.

## Deploy

```bash
git add -A
git commit -m "Describe the change"
git push
```

GitHub Pages republishes within a minute or two (Settings → Pages: deploy from branch `main`, folder `/ (root)`).
