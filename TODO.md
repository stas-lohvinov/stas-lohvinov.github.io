# TODO

## LinkedIn posts section

Add a section with 1 to 3 embedded LinkedIn posts.

Example embed (post `urn:li:ugcPost:7515347321409400832`):

```html
<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7515347321409400832?collapsed=1" height="542" width="504" frameborder="0" allowfullscreen="" title="Embedded post"></iframe>
```

- [ ] Content in a JSON file (`posts.json`, array of post URNs), not hardcoded in HTML or JS. Same pattern as `works.json`.
- [ ] Render with `createElement` in a new IIFE with a `SETTINGS` block (`dataUrl`, `max: 3`). Use only the first 3 entries and `console.warn` if there are more. Skip invalid entries with a `console.warn`.
- [ ] Hide the section when there are no valid entries.
- [ ] `loading="lazy"` on each iframe, and a unique `title` per post (not just "Embedded post").
- [ ] Works at 375px: the embed is 504px wide, so use `max-width: 100%` and no horizontal scroll. Check the layout with 1, 2 and 3 posts.
- [ ] Update `CLAUDE.md` and `README.md`: LinkedIn embeds become a second external resource (currently "only Google Fonts"), plus a how-to for adding a post.
- [ ] Add a nav link or placement in `index.html` and check the 30-second skim order (the reels stay the one bold element).
