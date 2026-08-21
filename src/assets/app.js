/* Aerom site — navigation, mobile menu, lead form. No dependencies, ~4 KB. */
(function () {
  'use strict';

  /* ---------------- dropdown nav ---------------- */
  var items = document.querySelectorAll('[data-nav-item]');
  items.forEach(function (item) {
    var btn = item.querySelector('[data-nav-toggle]');
    if (!btn) return;
    function set(open) {
      item.setAttribute('data-open', open ? 'true' : 'false');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      set(item.getAttribute('data-open') !== 'true');
    });
    item.addEventListener('mouseenter', function () { if (matchMedia('(min-width:781px)').matches) set(true); });
    item.addEventListener('mouseleave', function () { if (matchMedia('(min-width:781px)').matches) set(false); });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) set(false);
    });
    document.addEventListener('click', function (e) { if (!item.contains(e.target)) set(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') items.forEach(function (i) {
      i.setAttribute('data-open', 'false');
      var b = i.querySelector('[data-nav-toggle]'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- mobile menu ---------------- */
  var hdr = document.querySelector('[data-header]');
  var burger = document.querySelector('[data-burger]');
  if (hdr && burger) {
    burger.addEventListener('click', function () {
      var open = hdr.getAttribute('data-menu') === 'open';
      hdr.setAttribute('data-menu', open ? 'closed' : 'open');
      burger.setAttribute('aria-expanded', open ? 'false' : 'true');
      burger.textContent = open ? 'Menu' : 'Close';
      document.body.style.overflow = open ? '' : 'hidden';
    });
  }


  /* ---------------- funnel instrumentation ---------------- */
  // One helper so every funnel event goes to whatever analytics is configured
  // (GA4 today, nothing if not set). Never sends personal data — only the shape
  // of the interaction, which is all we need to find where people drop out.
  function track(event, params) {
    try {
      if (window.gtag) window.gtag('event', event, params || {});
      if (window.clarity) window.clarity('event', event);
    } catch (e) { /* analytics must never break the page */ }
  }

  /* ---------------- scroll reveal ---------------- */
  (function () {
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('.section-head, .card, .numbered li, .cmp-scroll, .formcard, .proof__panel, .specs, .stats, .update, .router__card, .gate__teaser');
    if (!targets.length) return;

    if (reduced || !('IntersectionObserver' in window)) return;   // content is visible by default

    targets.forEach(function (el, i) {
      el.setAttribute('data-reveal', '');
      // a small stagger within a row reads as intentional; more than ~3 reads as slow
      el.style.transitionDelay = ((i % 3) * 60) + 'ms';
    });
    document.documentElement.classList.add('reveal-ready');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------- in-page section nav ---------------- */
  (function () {
    var subnav = document.querySelector('[data-subnav]');
    if (!subnav) return;
    var links = subnav.querySelectorAll('a[href^="#"]');
    var sections = [];
    links.forEach(function (a) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) sections.push({ a: a, el: el });
    });
    if (!sections.length || !('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        sections.forEach(function (s) { s.a.classList.toggle('is-active', s.el === e.target); });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(function (s) { io.observe(s.el); });

    links.forEach(function (a) {
      a.addEventListener('click', function () { track('subnav_click', { section: a.getAttribute('href') }); });
    });
  })();

  /* ---------------- sticky mobile CTA ---------------- */
  (function () {
    var bar = document.querySelector('[data-sticky-cta]');
    if (!bar) return;
    var hero = document.querySelector('.hero, .section');
    var shown = false;
    function update() {
      var past = window.scrollY > (hero ? hero.offsetHeight * 0.6 : 400);
      // hide it again when the visitor reaches the real form — two CTAs
      // competing for the same tap is worse than one
      var form = document.querySelector('.formcard');
      var atForm = form && form.getBoundingClientRect().top < innerHeight * 0.9;
      var want = past && !atForm;
      if (want !== shown) {
        shown = want;
        bar.classList.toggle('is-up', want);
        if (want) track('sticky_cta_shown');
      }
    }
    addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ---------------- scroll-triggered soft CTA ---------------- */
  (function () {
    var nudge = document.querySelector('[data-nudge]');
    if (!nudge) return;
    // Respect a previous dismissal for the rest of the browsing session only.
    // sessionStorage can throw in some privacy modes, so every access is guarded.
    var KEY = 'aerom_nudge_dismissed';
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}

    var fired = false;
    function onScroll() {
      if (fired) return;
      var depth = (window.scrollY + innerHeight) / document.body.scrollHeight;
      if (depth < 0.55) return;
      // someone who has already reached a form does not need to be nudged
      if (document.querySelector('.formcard') &&
          document.querySelector('.formcard').getBoundingClientRect().top < innerHeight) return;
      fired = true;
      nudge.classList.add('is-up');
      track('nudge_shown', { page: location.pathname });
      removeEventListener('scroll', onScroll);
    }
    addEventListener('scroll', onScroll, { passive: true });

    var close = nudge.querySelector('[data-nudge-close]');
    if (close) close.addEventListener('click', function () {
      nudge.classList.remove('is-up');
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      track('nudge_dismissed');
    });
  })();

  /* ---------------- lead forms ---------------- */
  var forms = document.querySelectorAll('[data-lead-form]');
  if (!forms.length) return;

  var started = String(Date.now());
  var utm = (function () {
    var q = new URLSearchParams(location.search), out = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
      if (q.get(k)) out[k] = q.get(k);
    });
    return Object.keys(out).length ? JSON.stringify(out) : '';
  })();

  forms.forEach(function (form) {
    var set = function (n, v) { var el = form.querySelector('[name="' + n + '"]'); if (el) el.value = v; };
    set('sourcePage', location.pathname);
    set('referrer', document.referrer || '');
    set('utm', utm);
    set('startedAt', started);

    // "form started" is the single most useful funnel event: the gap between
    // started and completed is where the friction is.
    var startedTracked = false;
    form.addEventListener('focusin', function () {
      if (startedTracked) return;
      startedTracked = true;
      track('form_start', { intent: form.querySelector('[name="intent"]').value, page: location.pathname });
    });
    form.querySelectorAll('.form__more').forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) track('form_expand_details'); });
    });

    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('button[type="submit"]');
    var originalLabel = submit ? submit.innerHTML : '';

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form__status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // native validation first, so the browser shows the useful message
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });

      if (submit) { submit.disabled = true; submit.innerHTML = 'Sending…'; }
      if (status) { status.className = 'form__status'; status.textContent = ''; }

      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok || !res.body.ok) throw new Error(res.body && res.body.error || 'Request failed');
          form.reset();
          say(data.intent === 'price_sheet'
            ? 'Thank you — the price sheet is on its way. We will follow up personally within one working day.'
            : 'Thank you — we have got it. We will be in touch within one working day.', 'ok');
          track('generate_lead', { intent: data.intent, use_case: data.useCase, page: location.pathname });
        })
        .catch(function (err) {
          say('Something went wrong sending that. Please email us directly and we will pick it up — sorry about this.', 'err');
          track('lead_error');
          if (window.console) console.error('[lead]', err);
        })
        .finally(function () {
          if (submit) { submit.disabled = false; submit.innerHTML = originalLabel; }
        });
    });
  });
})();
