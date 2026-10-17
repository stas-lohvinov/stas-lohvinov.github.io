(() => {
  // ============================================================
  // CONFIG
  // ============================================================

  // Sends GoatCounter events (https://www.goatcounter.com/help/events).
  // Does nothing when count.js is missing or blocked.

  const SETTINGS = {
    events: {
      cv: 'cv-download',
      linkedin: 'linkedin-click',
      email: 'email-click',
      reelSpin: 'reel-spin',
      showcaseLink: 'showcase-link',
      showcaseVideo: 'showcase-video-play'
    },
    selectors: {
      cv: 'a[href$=".pdf"]',
      linkedin: 'a[href*="linkedin.com"]',
      email: 'a[href^="mailto:"]',
      spin: '#spin, #reels',
      showcase: '#works',
      showcaseVideo: '#works video',
      work: '.work',
      workTitle: 'h3'
    },
    // A video 'play' counts only if the visitor clicked or pressed a key on it this recently (ms).
    userPlayWindow: 1000
  };

  // ============================================================
  // LOGIC
  // ============================================================

  const { events: EV, selectors: SEL } = SETTINGS;

  function send(path, title) {
    const gc = window.goatcounter;
    if (!gc || !gc.count) return;
    try { gc.count({ path, title, event: true }); } catch (e) { /* analytics must never break the page */ }
  }

  const workTitle = node => node.closest(SEL.work)?.querySelector(SEL.workTitle)?.textContent.trim() || '';

  let spun = false;

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (a) {
      if (a.closest(SEL.showcase)) send(EV.showcaseLink, `${workTitle(a)}: ${a.textContent.trim()}`);
      else if (a.matches(SEL.cv)) send(EV.cv);
      else if (a.matches(SEL.linkedin)) send(EV.linkedin);
      else if (a.matches(SEL.email)) send(EV.email);
    } else if (!spun && e.target.closest(SEL.spin)) {
      spun = true;
      send(EV.reelSpin);
    }
  });

  // Showcase videos autoplay muted through play(), which also fires 'play'.
  // A click or key press on the video just before 'play' marks it as the visitor's own.
  // 'click' (not 'pointerdown') so a touch-scroll that starts on a video doesn't count.
  const touched = new WeakMap();
  const counted = new WeakSet();
  const mark = e => {
    const v = e.target.closest?.(SEL.showcaseVideo);
    if (v) touched.set(v, Date.now());
  };
  document.addEventListener('click', mark, true);
  document.addEventListener('keydown', mark, true);
  document.addEventListener('play', e => {
    const v = e.target;
    if (!v.matches?.(SEL.showcaseVideo) || counted.has(v)) return;
    if (Date.now() - (touched.get(v) || 0) > SETTINGS.userPlayWindow) return;
    counted.add(v);
    send(EV.showcaseVideo, workTitle(v));
  }, true);
})();
