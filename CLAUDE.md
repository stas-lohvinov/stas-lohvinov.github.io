# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Portfolio landing page for Stas Lohvinov, senior frontend developer for browser slot and casino games. The audience is recruiters and hiring managers in iGaming. Its job is to show, within 30 seconds, who he is, proof of his work, and how to contact him.

Live at https://stas-lohvinov.github.io/ (GitHub Pages user site, served from `main` root). See README.md for structure and how-tos.

## Hard constraints

- No build step, no bundler, no npm dependencies. Plain HTML, CSS and vanilla JS that runs as-is on GitHub Pages.
- Only external resource is Google Fonts (Unbounded, Atkinson Hyperlegible). Ask before adding any other library or CDN.
- All paths relative (`reels.js`, `works/...`). The site lives at the domain root.
- This repo is public. Never commit tokens, credentials, private notes, rates, or anything about job-search status beyond what the page already says.

## Architecture

- `index.html` loads `reels.js` and `showcase.js` as independent IIFEs. They share no state.
- `reels.js` resolves `'--name'` entries in `STYLE.colors` from `:root` once at load, so a palette change in `styles.css` needs a page reload.
- `showcase.js` fetches `works.json` with `cache: 'no-cache'`. An empty `[]` keeps `#showcase` hidden; entries without a `title` are skipped with a `console.warn`.
- The CV is `stas_lohvinov_frontend_dev_resume.pdf`, linked from `index.html` with `download="Stas-Lohvinov-CV.pdf"`. Keep the repo filename and the hrefs in sync.

## Content rules

- Facts, numbers, dates and job titles come from Stas's CV, which is not in this repo. Never invent or round up a metric. If a number isn't already on the page, ask before adding it.
- Numbers appear in two places: the page text in `index.html` and `DATA.reels` in `reels.js`. Change both together.
- NeverEnding is shown as "2026" with no end month. Don't change it to "Present" or a specific month without asking.
- NDA: never add employer game names, builds, code or clips unless Stas confirms they're cleared. Personal projects are fine.
- Copy style: plain, specific, sentence case. No buzzwords ("passionate", "leverage", "results-driven"), no all-caps labels, no "→" on links, no middle-dot separators, minimal em dashes.

## Code conventions

- Each JS file is an IIFE with a config block at the top (`DATA`/`STYLE` in `reels.js`, `SETTINGS` in `showcase.js`) and the engine/render code below. Keep tunable values in config, not scattered in the code.
- Showcase content lives in `works.json` only. Don't hardcode entries in JS or HTML. Schema: top of `showcase.js`.
- Colours are CSS variables in `:root` of `styles.css` (`--ink`, `--panel`, `--line`, `--text`, `--muted`, `--brass`, `--brass-hi`). Reuse them. The canvas reads them via `'--name'` strings in `STYLE.colors`.
- Build DOM with `createElement` and `textContent`, not `innerHTML` with data.
- Design: one bold element (the reels). Keep everything else quiet. Don't add fade-in-on-scroll effects or hover animations on every block.

## Accessibility and quality floor

- Works at 375px wide with no horizontal scroll. Check desktop and mobile.
- Respect `prefers-reduced-motion`: no auto-spin, no video autoplay.
- Visible keyboard focus, real `<button>`s, `alt` text on images, `aria-label` on videos and the canvas, `aria-live` for reel results.
- Bad data must not break the page: skip invalid entries and `console.warn` a clear message.

## Testing

- No linter and no automated tests. Verification is manual, as below.
- Serve locally: `python3 -m http.server 8000`, then open http://localhost:8000. `file://` blocks the `works.json` fetch.
- After a change, load the page at desktop and ~375px widths and confirm there are no console errors.
- For showcase changes, test an empty `works.json`, a filled one, and a deliberately broken one.

## Git

- Commit messages: short imperative summary ("Add reel demo to showcase").
- Deploy is just `git push` to `main`. Pages republishes in a minute or two.
