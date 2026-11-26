/* Yosh Blogerlar Akademiyasi — bron sahifasi.
   Обычный JavaScript без библиотек. Настройки — config.js (window.SAYT_CONFIG).
   Путь родителя: 3 экрана о курсе → возраст + телефон (бронь) → «Rahmat». */
(() => {
  'use strict';

  const C = window.SAYT_CONFIG || {};
  const STEPS = ['intro', 'dastur', 'narx', 'bron', 'rahmat'];
  const I_BRON = 3;
  const I_RAHMAT = 4;
  const DISC = (Array.isArray(C.chegirmalar) && C.chegirmalar.length === 5) ? C.chegirmalar.map(Number) : [3, 6, 10, 15, 20];
  const MAX = DISC[4];
  const AGES = (Array.isArray(C.yoshlar) && C.yoshlar.length) ? C.yoshlar.map(String) : ['6–8', '9–11', '12–14', '15+'];
  const KEY = 'yba-sayt-bron:v2';
  const DEMO = Boolean(C.demo) || !C.endpoint;
  const PAYME = Boolean(C.payme && C.payme.enabled);
  const PAYME_SUM = (C.payme && Number(C.payme.summa)) || 100000;
  const RING = 2 * Math.PI * 19; // длина окружности кольца скидки (r = 19)
  const reduceMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const escHtml = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const ageValue = (label) => String(label).replace(/[–—]/g, '-').replace(/\s+/g, '');
  const ageLabel = (value) => String(value || '').replace('-', '–');

  // ---------- Состояние (сохраняется в браузере, если он позволяет) ----------
  const params = new URLSearchParams(location.search);
  if (params.get('reset') === '1') {
    try { localStorage.removeItem(KEY); } catch (e) { /* хранилище недоступно */ }
  }
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  };
  const state = Object.assign(
    { step: 0, unlocked: 0, phone: '', age: '', code: '', sid: '', utm: {}, booked: false, paid: false },
    readState()
  );
  if (!state.sid) state.sid = randomId(18);
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* приватный режим — работаем без сохранения */ }
  };

  // Метки рекламы: откуда пришёл родитель (сохраняем последние).
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach((k) => {
    const v = params.get(k);
    if (v) utm[k] = v.slice(0, 300);
  });
  if (Object.keys(utm).length) state.utm = utm;
  save();

  function randomId(n) {
    const abc = 'abcdefghijkmnpqrstuvwxyz23456789';
    const buf = new Uint8Array(n);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    let out = '';
    for (let i = 0; i < n; i++) out += abc[buf[i] % abc.length];
    return out;
  }

  // ---------- Форматирование ----------
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const som = (n) => fmt(n) + ' so‘m';
  const narx = Number(C.narx) || 0;
  const narxMax = Math.round(narx * (100 - MAX) / 100 / 1000) * 1000;
  const phoneDigits = (v) => {
    let d = String(v || '').replace(/\D/g, '');
    if (d.length > 9 && d.indexOf('998') === 0) d = d.slice(3);
    return d.slice(0, 9);
  };
  const phoneFmt = (d) => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
  const phoneOk = (d) => /^[2-9]\d{8}$/.test(d);

  // Ближайший сезон курса: по дате через 2 недели (в конце сезона уже показываем следующий).
  // Зима — декабрь–февраль, весна — март–май, лето — июнь–август, осень — сентябрь–ноябрь.
  const SEASON_BY_MONTH = ['qish', 'qish', 'bahor', 'bahor', 'bahor', 'yoz', 'yoz', 'yoz', 'kuz', 'kuz', 'kuz', 'qish'];
  const season = (() => {
    const key = SEASON_BY_MONTH[new Date(Date.now() + 14 * 86400000).getMonth()];
    const name = String((C.mavsumlar && C.mavsumlar[key]) || '').trim();
    return { key: key, name: name };
  })();

  function bindAll() {
    const values = {
      narx: narx ? som(narx) : '',
      narxMax: narx ? som(narxMax) : '',
      joy: C.joy || '',
      jadval: C.jadval || '',
      davomiylik: C.davomiylik || '',
      guruh: C.guruh || '',
      yosh: C.yosh || '',
      ishVaqti: C.ishVaqti || '',
      manzil: C.manzil || '',
      dMax: MAX + '%',
      paymeSum: som(PAYME_SUM),
      phone: state.phone ? '+998 ' + phoneFmt(state.phone) : '',
      age: state.age ? ageLabel(state.age) + ' yosh' : '',
      code: state.code ? '№ ' + state.code : '',
      mavsum: season.name ? '«' + season.name + '»' : '',
      mavsumFasl: season.name ? '«' + season.name + '» · ' + season.key : '',
      bronEyebrow: season.name ? '«' + season.name + '» mavsumi · oxirgi qadam' : 'Oxirgi qadam',
    };
    $$('[data-bind]').forEach((el) => {
      const v = values[el.dataset.bind];
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-row]').forEach((el) => { el.hidden = !values[el.dataset.row]; });
    $$('[data-when]').forEach((el) => { el.hidden = (el.dataset.when === 'payme') !== PAYME; });
    const map = $('#map-link');
    if (map) {
      map.hidden = !C.xarita;
      if (C.xarita) map.href = C.xarita;
    }
  }

  // ---------- Кольцо скидки ----------
  const meter = $('#meter');
  const ringProg = $('#ring-prog');
  const discEl = $('#disc');
  const hintEl = $('#hint');
  const toastEl = $('#toast');
  const live = $('#live');
  meter.setAttribute('aria-valuemax', String(MAX));
  ringProg.style.strokeDasharray = String(RING);
  let shown = 0;

  function hintFor(i) {
    if (i === 0) return 'Har qadamda chegirma oshadi — ' + MAX + '% gacha';
    if (i === 1) return 'Zo‘r! Davom eting — chegirma oshib boradi';
    if (i === 2) return 'Yana bir qadam — va ' + DISC[2] + '%';
    if (i === I_BRON) {
      return state.age
        ? 'Raqamni yozing — chegirma ' + MAX + '%'
        : 'Yoshni tanlang — ' + DISC[3] + '%, raqamni yozing — ' + MAX + '%';
    }
    return 'Maksimal chegirma — ' + MAX + '% ✓';
  }

  function setMeter(v, animate) {
    ringProg.style.strokeDashoffset = String(RING * (1 - Math.min(1, v / MAX)));
    meter.classList.toggle('full', v >= MAX);
    meter.setAttribute('aria-valuenow', String(v));
    meter.setAttribute('aria-valuetext', v + '% chegirma');
    const from = shown;
    shown = v;
    if (!animate || reduceMotion || from === v) {
      discEl.textContent = String(v);
      return;
    }
    const t0 = performance.now();
    const dur = 800;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      discEl.textContent = String(Math.round(from + (v - from) * e));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function unlock(v) {
    if (v <= state.unlocked) return;
    const gain = v - state.unlocked;
    state.unlocked = v;
    save();
    setMeter(v, true);
    live.textContent = 'Chegirma ' + v + '% ga oshdi';
    toastEl.textContent = '+' + gain + '%';
    toastEl.classList.remove('show');
    void toastEl.offsetWidth; // перезапуск анимации
    toastEl.classList.add('show');
    if (navigator.vibrate && !reduceMotion) {
      try { navigator.vibrate(10); } catch (e) { /* не везде доступно */ }
    }
  }

  // ---------- Нижняя кнопка ----------
  const mainBtn = $('#btn-main');
  const backBtn = $('#btn-back');
  const ctaBar = $('#cta');
  let busy = false;

  function setCta(i) {
    ctaBar.hidden = i === I_RAHMAT;
    backBtn.hidden = i === 0 || i === I_RAHMAT;
    let label = 'Davom etish';
    let gain = '';
    if (i < I_BRON) {
      const g = DISC[i] - state.unlocked;
      if (g > 0) gain = '+' + g + '%';
    } else if (i === I_BRON) {
      label = 'Joyni band qilish';
      gain = MAX + '%';
    }
    $('.btn-label', mainBtn).textContent = label;
    const gainEl = $('.gain', mainBtn);
    gainEl.textContent = gain;
    gainEl.hidden = !gain;
  }

  function setBusy(on) {
    busy = on;
    mainBtn.disabled = on;
    mainBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    $('.spinner', mainBtn).hidden = !on;
    $('.gain', mainBtn).style.display = on ? 'none' : '';
  }

  // ---------- Переходы между экранами ----------
  function go(target, opts) {
    const o = opts || {};
    let i = Math.max(0, Math.min(I_RAHMAT, Number(target) || 0));
    if (i === I_BRON && state.booked) i = I_RAHMAT;
    if (i === I_RAHMAT && !state.booked) i = I_BRON;
    const prev = state.step;
    state.step = i;
    save();

    $$('.step').forEach((el) => { el.hidden = el.dataset.step !== STEPS[i]; });
    hintEl.textContent = hintFor(i);
    setCta(i);
    bindAll();

    const url = '#' + STEPS[i];
    if (o.replace) history.replaceState({ step: i }, '', url);
    else if (!o.fromPop) history.pushState({ step: i }, '', url);
    window.scrollTo(0, 0);

    if (i === I_BRON) phoneInput.value = phoneFmt(state.phone);
    if (!o.initial && prev !== i) {
      const h = $('.step[data-step="' + STEPS[i] + '"] h1, .step[data-step="' + STEPS[i] + '"] h2');
      if (h) {
        h.setAttribute('tabindex', '-1');
        try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); }
      }
    }
    if (i === 0) track('ViewContent', { content_name: 'kurs haqida' });
  }

  mainBtn.addEventListener('click', () => {
    if (busy) return;
    const i = state.step;
    if (i < I_BRON) {
      unlock(DISC[i]);
      go(i + 1);
    } else if (i === I_BRON) {
      submitBron();
    }
  });
  backBtn.addEventListener('click', () => { if (!busy) go(state.step - 1); });
  window.addEventListener('popstate', (e) => {
    const fromState = e.state && typeof e.state.step === 'number' ? e.state.step : -1;
    const fromHash = STEPS.indexOf(location.hash.slice(1));
    go(fromState >= 0 ? fromState : Math.max(0, fromHash), { fromPop: true });
  });

  // ---------- Экран брони: возраст + телефон ----------
  const seg = $('#age');
  const phoneInput = $('#phone');
  const phoneField = $('.phone');
  const formErr = $('#form-error');
  const hp = $('#hp');

  function renderAges() {
    seg.style.setProperty('--n', String(AGES.length));
    seg.innerHTML = '<span class="seg-thumb" aria-hidden="true"></span>' + AGES.map((label) =>
      '<label><input type="radio" name="yosh" value="' + escHtml(ageValue(label)) + '"><span>' + escHtml(label) + '</span></label>'
    ).join('');
    const inputs = $$('input', seg);
    const idx = inputs.findIndex((inp) => inp.value === state.age);
    if (idx >= 0) inputs[idx].checked = true;
    placeThumb(idx);
  }
  function placeThumb(idx) {
    seg.style.setProperty('--i', String(Math.max(0, idx)));
    seg.classList.toggle('has-value', idx >= 0);
  }
  seg.addEventListener('change', (e) => {
    const input = e.target;
    if (!input || input.name !== 'yosh') return;
    state.age = input.value;
    save();
    placeThumb($$('input', seg).indexOf(input));
    showError('');
    unlock(DISC[3]);
    hintEl.textContent = hintFor(state.step);
  });

  function showError(msg) {
    formErr.textContent = msg;
    formErr.hidden = !msg;
    if (!msg) {
      phoneField.classList.remove('invalid');
      phoneInput.setAttribute('aria-invalid', 'false');
    }
  }
  function shake(el) {
    if (reduceMotion) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneFmt(phoneDigits(phoneInput.value));
    if (!formErr.hidden) showError('');
  });
  $('#bron-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitBron();
  });

  async function submitBron() {
    if (busy) return;
    if (!state.age) {
      showError('Farzandingiz yoshini tanlang');
      shake(seg);
      return;
    }
    const d = phoneDigits(phoneInput.value);
    if (!phoneOk(d)) {
      showError('Raqamni to‘liq yozing: 9 ta raqam, masalan 90 123 45 67');
      phoneField.classList.add('invalid');
      phoneInput.setAttribute('aria-invalid', 'true');
      shake(phoneField);
      phoneInput.focus();
      return;
    }
    state.phone = d;
    save();
    setBusy(true);
    try {
      const res = await api('bron', { yosh: state.age, mavsum: season.name });
      state.code = String(res.code || '').slice(0, 12) || state.code || demoCode();
      state.booked = true;
      save();
      track('Lead');
      track('Schedule', { content_name: 'joy band qilish' });
      unlock(MAX);
      go(I_RAHMAT);
    } catch (e) {
      showError('Internet bilan muammo bo‘ldi. Qayta urinib ko‘ring.' +
        (C.aloqaTelefon ? ' Yoki qo‘ng‘iroq qiling: ' + C.aloqaTelefon : ''));
    } finally {
      setBusy(false);
    }
  }
  $('#reread').addEventListener('click', () => go(0));

  // ---------- Оплата брони через Payme (включается в config.js) ----------
  const payBtn = $('#pay-btn');
  const payStatus = $('#pay-status');
  function markPaid() {
    if (!state.paid) {
      state.paid = true;
      save();
      track('Purchase', { value: PAYME_SUM, currency: 'UZS' });
    }
    $('#payme-box').classList.add('is-paid');
    payStatus.textContent = 'To‘lov qabul qilindi ✓ Joyingiz kafolatlandi.';
    payStatus.hidden = false;
    payBtn.hidden = true;
  }
  async function checkPaid() {
    payStatus.textContent = 'To‘lov tekshirilmoqda…';
    payStatus.hidden = false;
    try {
      const res = await api('status');
      if (res.paid) markPaid();
      else payStatus.textContent = 'To‘lov hali ko‘rinmayapti. Agar to‘lagan bo‘lsangiz, menejer tekshirib beradi.';
    } catch (e) {
      payStatus.textContent = 'To‘lovni tekshirib bo‘lmadi. Menejer tekshirib beradi.';
    }
  }
  payBtn.addEventListener('click', async () => {
    payBtn.disabled = true;
    payStatus.textContent = 'Payme ochilmoqda…';
    payStatus.hidden = false;
    try {
      const res = await api('pay', { return_url: location.origin + location.pathname + '?tolov=1#rahmat' });
      track('InitiateCheckout', { value: PAYME_SUM, currency: 'UZS' });
      if (res.paid) { markPaid(); return; }
      if (res.url) { location.href = res.url; return; }
      payStatus.textContent = DEMO ? 'Demo rejim: Payme sahifasi ochilmaydi.' : 'To‘lov sahifasini ochib bo‘lmadi. Keyinroq urinib ko‘ring.';
    } catch (e) {
      payStatus.textContent = 'To‘lov sahifasini ochib bo‘lmadi. Keyinroq urinib ko‘ring.';
    } finally {
      payBtn.disabled = false;
    }
  });

  // ---------- Сервер ----------
  function demoCode() {
    const abc = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let s = '';
    for (let i = 0; i < 5; i++) s += abc[Math.floor(Math.random() * abc.length)];
    return s;
  }

  async function api(action, extra) {
    const body = Object.assign({
      action: action,
      phone: state.phone ? '+998' + state.phone : '',
      sid: state.sid,
      utm: state.utm || {},
      website: hp ? hp.value : '',
    }, extra || {});
    if (DEMO) {
      await sleep(800);
      if (action === 'bron') return { ok: true, code: state.code || demoCode() };
      if (action === 'status') return { ok: true, paid: false };
      if (action === 'pay') return { ok: true, url: '' };
      return { ok: true };
    }
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 15000) : 0;
    try {
      const res = await fetch(C.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'omit',
        signal: ctrl ? ctrl.signal : undefined,
      });
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      if (!res.ok || !data || data.ok !== true) throw new Error('api ' + res.status);
      return data;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  // ---------- Meta Pixel (если указан ID) ----------
  function initPixel() {
    const id = String(C.metaPixelId || '').trim();
    if (!/^\d{6,20}$/.test(id)) return;
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }
  function track(ev, data) {
    try {
      if (window.fbq) window.fbq('track', ev, data || {}, { eventID: state.sid + '.' + ev });
    } catch (e) { /* пиксель не обязателен */ }
  }

  // ---------- Запуск ----------
  if (DEMO) $('#demo').hidden = false; // заявки не уходят (demo: true или нет endpoint) — видно сразу
  initPixel();
  renderAges();
  setMeter(state.unlocked, false);
  go(state.booked ? I_RAHMAT : (state.step || 0), { replace: true, initial: true });
  if (PAYME && state.booked) {
    if (state.paid) markPaid();
    else if (params.get('tolov') === '1') checkPaid();
  }
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
  idle(() => {
    ['dastur-1', 'dastur-2', 'dars-1', 'dars-2'].forEach((name) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = 'assets/img/' + name + '.jpg';
    });
  });
})();
