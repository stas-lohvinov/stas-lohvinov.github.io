(() => {
  // ============================================================
  // CONFIG
  // ============================================================

  // Jobs live in experience.json, an array shown in order (newest first).
  // Fields (only "title" is required):
  //   when        string, e.g. "2026" or "Apr 2024 - Dec 2025"
  //   title       string, job title
  //   where       string, e.g. "Innovecs, remote"
  //   summary     string, one-paragraph description
  //   highlights  array of strings, bullet points
  //
  // Facts and numbers must match the CV.

  const SETTINGS = {
    dataUrl: 'experience.json'
  };

  // ============================================================
  // RENDER
  // ============================================================

  const section = document.getElementById('experience');
  const list = document.getElementById('jobs');
  if (!section || !list) return;

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const str = v => typeof v === 'string' && v.trim();

  function job(j) {
    const li = el('li', 'job');
    if (str(j.when)) li.append(el('div', 'when', j.when));
    const body = el('div');
    body.append(el('h3', null, j.title));
    if (str(j.where)) body.append(el('p', 'where', j.where));
    if (str(j.summary) && window.SITE_CONFIG?.features?.experienceSummary !== false) body.append(el('p', 'summary', j.summary));
    if (Array.isArray(j.highlights) && j.highlights.length) {
      const ul = el('ul');
      j.highlights.filter(str).forEach(h => ul.append(el('li', null, h)));
      body.append(ul);
    }
    li.append(body);
    return li;
  }

  function render(jobs) {
    jobs.forEach((j, i) => {
      if (!j || !str(j.title)) {
        console.warn(`[experience] Entry ${i} in ${SETTINGS.dataUrl} has no "title" and was skipped.`);
        return;
      }
      list.append(job(j));
    });
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
    .catch(err => console.warn(`[experience] Could not load ${SETTINGS.dataUrl}: ${err.message}`));
})();
