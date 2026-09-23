import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  arrow
} from '@floating-ui/dom';

// ------- CONFIG -------
const GAP = 8;        // tooltip offset from hotspot
const PADDING = 8;    // viewport padding when shifting

// Autoplay pacing
const MIN_DWELL = 4500;    // shortest a hotspot stays open
const MAX_DWELL = 14000;   // longest, however wordy the advice is
const MS_PER_CHAR = 45;    // reading speed
const SCENE_HOLD_MS = 8000; // 'bilder' mode: how long a scene stays up
const SCENE_GAP_MS = 1200;  // 'alt' mode: pause after the last hotspot

// The three scenes, in the same order as the ← → page-nav links
const SCENES = [
  { key: 'home',       href: '../Home/home-office.html'      },
  { key: 'office',     href: '../Office/office.html'         },
  { key: 'travelling', href: '../Travelling/travelling.html' }
];

const MODES = [
  { mode: 'punkter', label: 'Punkter', title: 'Bla gjennom punktene i dette bildet' },
  { mode: 'bilder',  label: 'Bilder',  title: 'Bla gjennom de tre bildene' },
  { mode: 'alt',     label: 'Alt',     title: 'Bla gjennom punktene, så neste bilde' }
];

export function initScene({ hotspots, baseW, baseH }) {
  // Prefer bottom placement on small screens
  const preferBottom = window.matchMedia('(max-width: 640px)').matches;
  const initialPlacement = preferBottom ? 'bottom' : 'right';
  const fallbacks = preferBottom ? ['top', 'right', 'left'] : ['left', 'bottom', 'top'];

  // ------- DOM -------
  const stage = document.getElementById('stage');
  const artboard = document.getElementById('artboard');
  const overlay = document.getElementById('overlay');
  const tooltip = document.getElementById('tooltip');

  // Ensure internal structure inside #tooltip (arrow + content)
  let arrowEl, contentEl;
  function ensureTooltipInternals() {
    arrowEl = tooltip.querySelector('[data-arrow]');
    contentEl = tooltip.querySelector('.tooltip-content');
    if (!arrowEl) {
      arrowEl = document.createElement('div');
      arrowEl.setAttribute('data-arrow', '');
      tooltip.appendChild(arrowEl);
    }
    if (!contentEl) {
      contentEl = document.createElement('div');
      contentEl.className = 'tooltip-content';
      tooltip.appendChild(contentEl);
    }
  }
  ensureTooltipInternals();

  // --- Background scaling with CSS background on stage ---
  // The background image's composition already fills the artboard's design
  // frame 1:1 (no extra bled scenery baked in), so the background is simply
  // sized to match the artboard's own rendered width at all times.
  function clampArtboardSize() {
    artboard.style.minWidth = '320px';
    artboard.style.minHeight = (320 * (baseH / baseW)) + 'px';
  }

  function syncBackgroundToArtboardFromRect(rect) {
    const widthPx = Math.round(rect.width);
    stage.style.backgroundSize = `${widthPx}px auto`;
  }

  function syncBackgroundToArtboard() {
    requestAnimationFrame(() => {
      const rect = artboard.getBoundingClientRect();
      syncBackgroundToArtboardFromRect(rect);
    });
  }

  // Observe size changes on artboard
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === artboard) {
          clampArtboardSize();
          syncBackgroundToArtboardFromRect(entry.contentRect);
        }
      }
    });
    ro.observe(artboard);
  }
  ['load', 'resize', 'orientationchange'].forEach(evt =>
    window.addEventListener(evt, syncBackgroundToArtboard)
  );
  clampArtboardSize();
  syncBackgroundToArtboard();

  // Place hotspots. The overlay used to be aria-hidden while holding focusable
  // buttons; autoplay highlights these, so they get real names instead.
  overlay.removeAttribute('aria-hidden');
  const hotspotEls = hotspots.map((h, i) => {
    const el = document.createElement('button');
    el.className = 'hotspot';
    el.type = 'button';
    el.dataset.index = i;
    el.style.left = h.x + '%';
    el.style.top = h.y + '%';
    el.setAttribute('aria-label', `Råd ${i + 1} av ${hotspots.length}`);
    overlay.appendChild(el);
    return el;
  });

  // --- Tooltip state ---
  let openState = { reference: null, cleanup: null };
  let suppressNextDocClick = false; // guard to ignore the click that opened the tooltip

  // --- Helpers for tooltip content ---
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function setTooltipContentFromString(str) {
    const parts = String(str || '').trim().split(/\n{2,}/); // blank line = new paragraph
    contentEl.innerHTML = parts.map(p => `<p>${esc(p)}</p>`).join('');
  }

  function setTooltipContent(data) {
    ensureTooltipInternals(); // keep arrow/content present
    if (data && typeof data === 'object') {
      if (typeof data.html === 'string') { contentEl.innerHTML = data.html; return; }
      if (Array.isArray(data.paragraphs)) { contentEl.innerHTML = data.paragraphs.map(p => `<p>${esc(p)}</p>`).join(''); return; }
      if (typeof data.text === 'string') { setTooltipContentFromString(data.text); return; }
    }
    if (typeof data === 'string') setTooltipContentFromString(data);
    else contentEl.innerHTML = '';
  }

  // --- Show & position tooltip ---
  async function showTooltip(reference, data) {
    // Render content BEFORE measuring
    setTooltipContent(data);

    tooltip.setAttribute('data-open', 'true');
    tooltip.ariaHidden = 'false';

    // Ignore the very next document click (the one that opened us)
    suppressNextDocClick = true;
    setTimeout(() => { suppressNextDocClick = false; }, 0);

    // Auto-update while visible
    if (openState.cleanup) openState.cleanup();
    const stop = autoUpdate(reference, tooltip, position);
    openState = { reference, cleanup: stop };

    await position();

    async function position() {
      const { x, y, placement, middlewareData } = await computePosition(reference, tooltip, {
        strategy: 'fixed',
        placement: initialPlacement,
        middleware: [
          offset(GAP),
          flip({ fallbackPlacements: fallbacks }),
          shift({ padding: PADDING, crossAxis: true }),
          size({
            padding: PADDING,
            apply({ availableWidth, availableHeight, elements }) {
              const maxW = Math.min(320, availableWidth);
              Object.assign(elements.floating.style, {
                maxWidth: `${maxW}px`,
                maxHeight: `${availableHeight}px`,
              });
            }
          }),
          arrow({ element: arrowEl, padding: 6 })
        ]
      });

      Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });

      if (middlewareData.arrow) {
        const { x: ax, y: ay } = middlewareData.arrow;
        const base = placement.split('-')[0]; // top | right | bottom | left
        const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[base];

        Object.assign(arrowEl.style, {
          left: ax != null ? `${ax}px` : '',
          top:  ay != null ? `${ay}px` : '',
          right: '', bottom: ''
        });
        arrowEl.style[staticSide] = '-5px';
      }
    }
  }

  function hideTooltip() {
    tooltip.removeAttribute('data-open');
    tooltip.ariaHidden = 'true';
    if (openState.cleanup) { openState.cleanup(); openState.cleanup = null; }
    openState.reference = null;
  }

  // ================= AUTOPLAY =================
  // Modes are mutually exclusive: 'punkter' loops this scene's hotspots,
  // 'bilder' walks the three scenes, 'alt' does hotspots then next scene.
  // The active mode rides in ?auto= so it survives navigating between scenes.
  const sceneIndex = Math.max(0, SCENES.findIndex(s =>
    location.pathname.endsWith(s.href.replace('../', '/'))
  ));

  let mode = null;        // null | 'punkter' | 'bilder' | 'alt'
  let stepIndex = 0;      // which hotspot is showing
  let timer = null;       // single pending setTimeout
  let pendingStep = null; // re-armed after the tab becomes visible again
  let activeEl = null;

  const plainLength = (h) => {
    if (!h) return 0;
    if (typeof h.text === 'string') return h.text.length;
    if (Array.isArray(h.paragraphs)) return h.paragraphs.join(' ').length;
    if (typeof h.html === 'string') return h.html.replace(/<[^>]*>/g, '').length;
    return 0;
  };

  const dwellFor = (h) =>
    Math.min(MAX_DWELL, Math.max(MIN_DWELL, plainLength(h) * MS_PER_CHAR));

  function schedule(fn, ms) {
    clearTimeout(timer);
    pendingStep = { fn, ms };
    if (document.hidden) return; // resumed by the visibilitychange handler
    timer = setTimeout(() => { pendingStep = null; fn(); }, ms);
  }

  function markActive(el) {
    if (activeEl) activeEl.classList.remove('is-active');
    activeEl = el || null;
    if (activeEl) activeEl.classList.add('is-active');
  }

  function gotoScene(delta) {
    const next = SCENES[(sceneIndex + delta + SCENES.length) % SCENES.length];
    location.href = `${next.href}?auto=${mode}`;
  }

  // Show hotspot `i`, then queue whatever comes after it.
  function showStep(i) {
    stepIndex = i;
    const el = hotspotEls[i];
    if (!el) { // a scene with no hotspots still moves on
      if (mode === 'alt') schedule(() => gotoScene(1), SCENE_GAP_MS);
      return;
    }
    markActive(el);
    showTooltip(el, hotspots[i]);

    const dwell = dwellFor(hotspots[i]);
    const isLast = i >= hotspotEls.length - 1;

    if (isLast && mode === 'alt') {
      schedule(() => { hideTooltip(); markActive(null); schedule(() => gotoScene(1), SCENE_GAP_MS); }, dwell);
    } else {
      schedule(() => showStep(isLast ? 0 : i + 1), dwell);
    }
  }

  function startMode(next) {
    mode = next;
    stepIndex = 0;
    syncButtons();
    if (mode === 'bilder') {
      hideTooltip();
      markActive(null);
      schedule(() => gotoScene(1), SCENE_HOLD_MS);
    } else {
      showStep(0);
    }
  }

  // Stop everything and drop ?auto= so a reload doesn't silently restart.
  function stopAutoplay({ keepTooltip = false } = {}) {
    if (!mode) return;
    mode = null;
    clearTimeout(timer);
    timer = null;
    pendingStep = null;
    markActive(null);
    if (!keepTooltip) hideTooltip();
    syncButtons();
    const url = new URL(location.href);
    if (url.searchParams.has('auto')) {
      url.searchParams.delete('auto');
      history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
    }
  }

  function toggleMode(next) {
    if (mode === next) stopAutoplay();
    else { clearTimeout(timer); pendingStep = null; startMode(next); }
  }

  // --- Control bar ---
  const bar = document.createElement('div');
  bar.className = 'autoplay';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Automatisk visning');
  const buttons = MODES.map(({ mode: m, label, title }) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'autoplay-btn';
    b.dataset.mode = m;
    b.title = title;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = label;
    b.addEventListener('click', (e) => {
      e.stopPropagation();      // don't trip the outside-click closer
      b.blur();
      toggleMode(m);
    });
    bar.appendChild(b);
    return b;
  });
  document.body.appendChild(bar);

  function syncButtons() {
    buttons.forEach(b => {
      const on = b.dataset.mode === mode;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  // A backgrounded tab must not race through the whole tour.
  document.addEventListener('visibilitychange', () => {
    if (!mode) return;
    if (document.hidden) {
      clearTimeout(timer);
      timer = null;
    } else if (pendingStep) {
      const { fn, ms } = pendingStep;
      schedule(fn, ms);
    }
  });

  // --- Open on click (not pointerdown) ---
  overlay.addEventListener('click', (e) => {
    const hs = e.target.closest('.hotspot');
    if (!hs) return;

    e.preventDefault();
    e.stopPropagation();

    stopAutoplay({ keepTooltip: true }); // manual interaction wins

    const h = hotspots[Number(hs.dataset.index)];
    if (openState.reference === hs) {
      hideTooltip();
      return;
    }
    showTooltip(hs, h); // pass whole hotspot so .html/.text work
  });

  // --- Close on outside click (with guard) ---
  document.addEventListener('click', (e) => {
    if (suppressNextDocClick) return; // ignore the opening click
    if (e.target.closest('.hotspot') || e.target.closest('#tooltip')) return;
    if (e.target.closest('.autoplay')) return;
    stopAutoplay();
    hideTooltip();
  });

  // --- Close on Escape ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { stopAutoplay(); hideTooltip(); }
  });

  // --- Resume a tour arriving from another scene (or a kiosk deep link) ---
  const requested = new URLSearchParams(location.search).get('auto');
  if (MODES.some(m => m.mode === requested)) startMode(requested);
  else syncButtons();
}
