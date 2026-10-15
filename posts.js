(() => {
  // ============================================================
  // CONFIG
  // ============================================================

  // LinkedIn posts live in posts.json, an array of entries shown in order.
  //   urn    string, required, e.g. "urn:li:ugcPost:7515347321409400832"
  //          (LinkedIn: post menu > Embed this post, take it from the iframe src)
  //   title  string, optional, accessible title of the iframe
  //
  // While posts.json has no valid entries, the section stays hidden.

  const SETTINGS = {
    dataUrl: 'posts.json',
    max: 3,                                                  // extra entries are ignored
    embedUrl: 'https://www.linkedin.com/embed/feed/update/', // + urn + query
    urnPattern: /^urn:li:(ugcPost|share|activity):\d+$/,
    width: 504,
    height: 542
  };

  // ============================================================
  // RENDER
  // ============================================================

  const section = document.getElementById('posts');
  const list = document.getElementById('post-list');
  if (!section || !list) return;
  if (window.SITE_CONFIG?.features?.linkedinPosts === false) return;

  function post(p, n) {
    const li = document.createElement('li');
    const f = document.createElement('iframe');
    f.src = `${SETTINGS.embedUrl}${p.urn}?collapsed=1`;
    f.width = SETTINGS.width;
    f.height = SETTINGS.height;
    f.loading = 'lazy';
    f.allowFullscreen = true;
    f.title = typeof p.title === 'string' && p.title.trim() ? p.title : `LinkedIn post ${n}`;
    li.append(f);
    return li;
  }

  function render(posts) {
    const valid = posts.filter((p, i) => {
      const ok = p && typeof p.urn === 'string' && SETTINGS.urnPattern.test(p.urn);
      if (!ok) console.warn(`[posts] Entry ${i} in ${SETTINGS.dataUrl} has no valid "urn" and was skipped.`);
      return ok;
    });
    if (valid.length > SETTINGS.max) {
      console.warn(`[posts] ${SETTINGS.dataUrl} has ${valid.length} valid entries, only the first ${SETTINGS.max} are shown.`);
    }
    valid.slice(0, SETTINGS.max).forEach((p, i) => list.append(post(p, i + 1)));
    if (list.childElementCount) section.hidden = false;
  }

  fetch(SETTINGS.dataUrl, { cache: 'no-cache' })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('the file must contain a JSON array [ ... ]');
      render(data);
    })
    .catch(err => console.warn(`[posts] Could not load ${SETTINGS.dataUrl}: ${err.message}`));
})();
