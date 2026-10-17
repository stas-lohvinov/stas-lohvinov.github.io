(() => {
  // ============================================================
  // CONFIG
  // ============================================================

  // Showcase data lives in works.json, an array of entries shown in order.
  // Add each new entry at the TOP. Copy the template from works.example.json.
  //
  // Fields (only "title" is required):
  //   title    string
  //   year     number or string
  //   type     string, e.g. "Personal project" or "Commercial slot, cleared clip"
  //   summary  string, one or two sentences
  //   stack    array of strings
  //   media    { type: "video" | "image", src, poster (video only), alt, aspect ("16/9", "9/16") }
  //   links    array of { label, href }
  //
  // Put media in works/<slug>/ next to index.html.
  // While works.json is an empty array, the section stays hidden.

  const SETTINGS = {
    dataUrl: 'works.json',
    autoplayVideos: true,     // muted loop while on screen; never with reduced motion
    autoplayThreshold: 0.5    // share of the video that must be visible to play
  };

  // ============================================================
  // RENDER
  // ============================================================

  const section = document.getElementById('showcase');
  const list = document.getElementById('works');
  if (!section || !list) return;
  if (window.SITE_CONFIG?.features?.showcase === false) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  function media(w, li, videos) {
    const m = w.media;
    const fig = el('figure', 'work-media');
    const [aw, ah] = String(m.aspect || '16/9').split('/').map(Number);
    if (aw > 0 && ah > 0) {
      fig.style.aspectRatio = `${aw} / ${ah}`;
      if (aw < ah) li.classList.add('portrait');
    }

    if (m.type === 'video') {
      const v = el('video');
      v.src = m.src;
      if (m.poster) v.poster = m.poster;
      v.muted = true;
      v.setAttribute('muted', '');
      v.loop = true;
      v.playsInline = true;
      v.controls = true;
      v.preload = 'metadata';
      v.setAttribute('aria-label', m.alt || w.title);
      fig.append(v);
      videos.push(v);
    } else {
      const img = el('img');
      img.src = m.src;
      img.alt = m.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.append(img);
    }
    return fig;
  }

  function work(w, videos) {
    const li = el('li', 'work');
    if (w.media && w.media.src) li.append(media(w, li, videos));
    else li.classList.add('no-media');

    const body = el('div', 'work-body');
    body.append(el('h3', null, w.title));
    const meta = [w.year, w.type].filter(Boolean).join(', ');
    if (meta) body.append(el('p', 'work-meta', meta));
    if (w.summary) body.append(el('p', 'work-summary', w.summary));
    if (Array.isArray(w.stack) && w.stack.length) {
      body.append(el('p', 'work-stack', 'Tech stack: ' + w.stack.join(', ')));
    }
    if (Array.isArray(w.links) && w.links.length) {
      const actions = el('div', 'actions');
      for (const l of w.links) {
        if (!l || !l.href || !l.label) continue;
        const a = el('a', 'btn', l.label);
        a.href = l.href;
        if (/^https?:/.test(l.href)) { a.target = '_blank'; a.rel = 'noopener'; }
        actions.append(a);
      }
      if (actions.childElementCount) body.append(actions);
    }
    li.append(body);
    return li;
  }

  function render(works) {
    const videos = [];
    works.forEach((w, i) => {
      if (!w || typeof w.title !== 'string' || !w.title.trim()) {
        console.warn(`[showcase] Entry ${i} in ${SETTINGS.dataUrl} has no "title" and was skipped.`);
        return;
      }
      list.append(work(w, videos));
    });
    if (!list.childElementCount) return;
    section.hidden = false;

    if (videos.length && SETTINGS.autoplayVideos && !reduce && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.play().catch(() => {});
          else e.target.pause();
        }
      }, { threshold: SETTINGS.autoplayThreshold });
      videos.forEach(v => io.observe(v));
    }
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
    .catch(err => console.warn(`[showcase] Could not load ${SETTINGS.dataUrl}: ${err.message}`));
})();
