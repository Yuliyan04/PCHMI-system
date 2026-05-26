let navHistory = [];
let currentScreen = 'screen-welcome';

const NAV_MAP = {
  home:     'screen-home',
  causes:   'screen-causes',
  calendar: 'screen-calendar',
  profile:  'screen-profile'
};

const NAV_SCREENS = new Set(Object.values(NAV_MAP));

function go(id, pushHistory = true) {
  if (id === currentScreen) return;
  const prev = document.getElementById(currentScreen);
  const next = document.getElementById(id);
  if (!next) return;

  if (pushHistory) navHistory.push(currentScreen);

  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('slide-out');
    setTimeout(() => prev.classList.remove('slide-out'), 280);
  }

  next.style.transform = 'translateX(24px)';
  next.classList.add('active');
  next.offsetHeight; // force reflow
  next.style.transform = '';

  currentScreen = id;
  updateNav(id);

  const body = next.querySelector('.screen-body');
  if (body) body.scrollTop = 0;

  if (id === 'screen-create-event') renderQR();
  if (id === 'screen-calendar') renderCalendar();
}

function back() {
  if (navHistory.length > 0) {
    const prev = navHistory.pop();
    go(prev, false);
  }
}

function navTo(tab) {
  const id = NAV_MAP[tab];
  if (id) go(id, true);
}

function updateNav(id) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab && NAV_MAP[el.dataset.tab] === id);
  });
}

function toggleChip(el) {
  el.classList.toggle('sel');
}

function toggleCandProfile(arrow, profileId) {
  const profile = document.getElementById(profileId);
  const isOpen = profile.classList.toggle('open');
  arrow.classList.toggle('open', isOpen);
}

function toggleMoreCategories() {
  const panel = document.getElementById('more-cats');
  const btn   = document.getElementById('more-cats-btn');
  const open  = panel.style.display === 'none' || panel.style.display === '';
  panel.style.display = open ? 'flex' : 'none';
  btn.classList.toggle('sel', open);
}

let activeHomeFilter = 'всички';

function searchEvents() {
  applyHomeFilters();
}

function setHomeFilter(btn) {
  const category = btn.dataset.category;
  const row = document.getElementById('home-filter-row');
  const allBtn = row.querySelector('[data-category="всички"]');

  if (category === 'всички' || activeHomeFilter === category) {
    activeHomeFilter = 'всички';
    row.querySelectorAll('.chip[data-category]').forEach(c => c.classList.remove('sel'));
    allBtn.classList.add('sel');
  } else {
    activeHomeFilter = category;
    row.querySelectorAll('.chip[data-category]').forEach(c => c.classList.remove('sel'));
    btn.classList.add('sel');
  }

  applyHomeFilters();
}

function applyHomeFilters() {
  const q          = (document.getElementById('home-search')?.value || '').trim().toLowerCase();
  const filtering  = activeHomeFilter !== 'всички';
  const searching  = q.length > 0;
  const eventCards = document.querySelectorAll('#screen-home .event-card[data-category]');
  const recCards   = document.querySelectorAll('#screen-home .rec-card[data-category]');
  const recSection = document.getElementById('recommended-section');
  const noResults  = document.getElementById('no-results');
  const noResultsQ = document.getElementById('no-results-query');

  let anyVisible = false;

  eventCards.forEach(card => {
    const matchesCat    = !filtering || card.dataset.category === activeHomeFilter;
    const matchesSearch = !searching || card.dataset.search.includes(q);
    const show = matchesCat && matchesSearch;
    card.style.display = show ? '' : 'none';
    if (show) anyVisible = true;
  });

  let anyRecVisible = false;
  recCards.forEach(card => {
    const matchesCat    = !filtering || card.dataset.category === activeHomeFilter;
    const matchesSearch = !searching || card.dataset.search.includes(q);
    const show = matchesCat && matchesSearch;
    card.style.display = show ? '' : 'none';
    if (show) anyRecVisible = true;
  });

  recSection.style.display = (searching || filtering) ? (anyRecVisible ? '' : 'none') : '';
  if (anyRecVisible) anyVisible = true;

  if (!anyVisible && (searching || filtering)) {
    noResultsQ.textContent = searching ? q : activeHomeFilter;
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

function toggleTerms(btn) {
  const checked = btn.classList.toggle('terms-checked');
  btn.style.background = checked ? 'var(--green)' : 'var(--border)';
  btn.innerHTML = checked
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    : '';
}

function toggleOrgSection() {
  const section = document.getElementById('org-section');
  const isOpen = section.style.display !== 'none';
  section.style.display = isOpen ? 'none' : 'block';
}

function saveEditedEvent() {
  const BG_MONTHS = ['яну','фев','мар','апр','май','юни','юли','авг','сеп','окт','ное','дек'];

  const title    = document.getElementById('edit-ev-title').value.trim();
  const date     = document.getElementById('edit-ev-date').value.trim();
  const capacity = document.getElementById('edit-ev-capacity').value.trim();

  if (title) document.getElementById('dash-event-title').textContent = title;
  if (date && capacity) {
    const parts = date.split('.');
    const day   = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const label = day + ' ' + (BG_MONTHS[month - 1] || parts[1]);
    const filled = document.getElementById('dash-event-progress');
    const volunteers = filled ? Math.round(parseFloat(filled.style.width) / 100 * parseInt(capacity)) : 8;
    document.getElementById('dash-event-meta').textContent =
      label + ' · ' + volunteers + '/' + capacity + ' доброволци';
  }
  showToast('Промените са запазени', true);
  back();
}

function setCauseFilter(el) {
  const row = el.closest('.chip-row');
  const allBtn = row.querySelector('[data-category="all"]');
  const category = el.dataset.category;

  if (category === 'all') {
    row.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
    allBtn.classList.add('sel');
  } else {
    allBtn.classList.remove('sel');
    el.classList.toggle('sel');
    const anyActive = row.querySelectorAll('.chip:not([data-category="all"]).sel').length > 0;
    if (!anyActive) allBtn.classList.add('sel');
  }

  const active = [...row.querySelectorAll('.chip.sel')].map(c => c.dataset.category);
  const showAll = active.includes('all');
  document.querySelectorAll('#screen-causes .cause-card').forEach(card => {
    card.style.display = (showAll || active.includes(card.dataset.category)) ? '' : 'none';
  });
}

function setFilter(el) {
  const parent = el.closest('.chip-row, .chips-row, .filter-row, .filter-chips');
  if (parent) {
    parent.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
  }
  el.classList.add('sel');
}

function setTypeBtn(el) {
  const parent = el.closest('.form-type-btns');
  if (parent) parent.querySelectorAll('button').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
}

function setApplyType(el, type) {
  setTypeBtn(el);
  const picker = document.getElementById('team-picker');
  if (!picker) return;
  picker.style.display = type === 'team' ? 'flex' : 'none';
  if (type === 'team') {
    document.getElementById('team-green-warriors').classList.add('sel');
    document.getElementById('team-angry-birds').classList.remove('sel');
    updateTeamCheck('team-green-warriors', true);
    updateTeamCheck('team-angry-birds', false);
  }
}

function updateTeamCheck(id, checked) {
  const card = document.getElementById(id);
  if (!card) return;
  const box = card.querySelector('.team-pick-check');
  box.innerHTML = checked
    ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    : '';
}

function selectTeam(card) {
  const picker = document.getElementById('team-picker');
  picker.querySelectorAll('.team-pick-card').forEach(c => {
    c.classList.remove('sel');
    updateTeamCheck(c.id, false);
  });
  card.classList.add('sel');
  updateTeamCheck(card.id, true);
}

const EVENTS = {
  vitoshaPlant: {
    title: 'Засаждане на дървета - Витоша',
    tags: ['Екология', 'Физически', 'Групова'],
    date: '18 Април 2026, 09:00-16:00',
    location: 'Природен парк Витоша, Вход Бояна',
    org: 'БНТ Зелена България',
    capacity: 30,
    maxCapacity: 30,
    pct: 100,
    full: true,
    gradient: "url('images/forest-bg.png') center/cover no-repeat",
    description: 'Присъедини се към нас за залесяване в Природен парк Витоша. Ще засадим над 200 дървета заедно с местната общност.'
  },
  lunch: {
    title: 'Раздаване на обяд',
    tags: ['Социална', 'Кухня', 'Групова'],
    date: '25 Април 2026, 11:00-14:00',
    location: 'ул. Граф Игнатиев 42, София',
    org: 'Каритас България',
    capacity: 12,
    maxCapacity: 20,
    pct: 40,
    gradient: "url('images/lunch-bg.png') center/cover no-repeat",
    description: 'Помогни ни да раздадем топъл обяд на хора в нужда в центъра на София.'
  },
  animalShelter: {
    title: 'Разходки в приют',
    tags: ['Животни', 'Грижи', 'Индивидуална'],
    date: '20 Април 2026, 10:00-13:00',
    location: 'Приют за бездомни животни, кв. Горубляне',
    org: 'Животни в беда',
    capacity: 5,
    maxCapacity: 15,
    pct: 33,
    gradient: "url('images/shelter-bg.png') center/cover no-repeat",
    description: 'Помогни на бездомните кучета и котки — разходки, игра и социализация. Всеки доброволец е добре дошъл!'
  },
  chernomorie: {
    title: 'Почистване - Черноморие',
    tags: ['Екология', 'Физически', 'Групова'],
    date: '22 Апр 2026, 09:00',
    location: 'Черноморие, плажна ивица',
    org: 'БНТ Зелена България',
    capacity: 8,
    maxCapacity: 50,
    pct: 16,
    gradient: "url('images/beach-bg.png') center/cover no-repeat",
    description: 'Почистване на крайбрежната ивица около Черноморие. Носете подходящо облекло и обувки. Ще бъдат осигурени ръкавици и торби.'
  },
  beachClean: {
    title: 'Почистване на плажа',
    tags: ['Екология', 'Физически', 'Групова'],
    date: '10 Май 2026, 09:00-12:00',
    location: 'Плаж Кабакум, Варна',
    org: 'Черно море Живо',
    capacity: 22,
    maxCapacity: 50,
    pct: 44,
    gradient: "url('images/beach-bg.png') center/cover no-repeat",
    description: 'Събери се с нас за почистване на морски отпадъци по крайбрежието.'
  },
  readingLesson: {
    title: 'Урок по четене',
    tags: ['Образование', 'Деца', 'Индивидуална'],
    date: '25 Април 2026, 14:00-16:00',
    location: 'Читалище Слово, София',
    org: 'Читалище Слово',
    capacity: 6,
    maxCapacity: 12,
    pct: 50,
    gradient: "linear-gradient(135deg,rgba(74,20,140,0.7),rgba(206,147,216,0.5)), url('images/reading-bg.jpg') center/cover no-repeat",
    description: 'Помогни на деца да четат по-добре. Нужни са доброволци с желание да преподават и търпение.'
  }
};

function openEvent(key) {
  const ev = EVENTS[key];
  if (!ev) return;

  const heroBg = document.getElementById('event-hero-bg');
  if (heroBg) heroBg.style.background = ev.gradient;

  const title = document.getElementById('event-hero-title');
  if (title) title.textContent = ev.title;

  const tagsEl = document.getElementById('event-tags');
  if (tagsEl) {
    tagsEl.innerHTML = ev.tags.map(t => `<span class="chip">${t}</span>`).join('');
  }

  const dateEl = document.getElementById('event-date-time');
  if (dateEl) dateEl.textContent = ev.date;

  const locEl = document.getElementById('event-location');
  if (locEl) locEl.textContent = ev.location;

  const orgEl = document.getElementById('event-org');
  if (orgEl) orgEl.textContent = ev.org;

  const capEl = document.getElementById('event-cap-text');
  if (capEl) capEl.textContent = `${ev.capacity}/${ev.maxCapacity} доброволци`;

  const capPct = document.getElementById('event-cap-pct');
  if (capPct) capPct.textContent = ev.pct + '%';

  const barEl = document.getElementById('event-cap-fill');
  if (barEl) barEl.style.width = ev.pct + '%';

  const descEl = document.getElementById('event-desc');
  if (descEl) descEl.textContent = ev.description;

  const actionBtn = document.getElementById('event-action-btn');
  if (actionBtn) {
    if (ev.full) {
      actionBtn.textContent = 'Запиши се в списъка на чакащи';
      actionBtn.className = 'btn btn-outline btn-full btn-pill';
      actionBtn.style.cssText = 'font-size:16px; padding:16px;';
      actionBtn.onclick = joinWaitlist;
    } else {
      actionBtn.textContent = 'Кандидатствай';
      actionBtn.className = 'btn btn-green btn-full btn-pill';
      actionBtn.style.cssText = 'font-size:16px; padding:16px;';
      actionBtn.onclick = goApply;
    }
  }

  go('screen-event-detail');
}

const STAR_LABELS = ['', 'Лошо', 'Задоволително', 'Добро', 'Много добро', 'Отлично'];

function setReviewStar(n) {
  const stars = document.querySelectorAll('#review-stars svg');
  stars.forEach((s, i) => {
    s.setAttribute('fill', i < n ? 'var(--green)' : 'none');
    s.setAttribute('stroke', i < n ? 'var(--green)' : 'var(--border)');
  });
  const lbl = document.getElementById('review-star-label');
  if (lbl) lbl.textContent = STAR_LABELS[n] || '';
}

function submitReview() {
  const stars = document.querySelectorAll('#review-stars svg[fill="var(--green)"]');
  if (stars.length === 0) {
    showToast('Моля, избери оценка');
    return;
  }
  showToast('Отзивът е изпратен', true);
  back();
}

function setVolStar(el, n) {
  const row = el.closest('[data-vol]');
  const stars = row.querySelectorAll('svg');
  stars.forEach((s, i) => {
    s.setAttribute('fill', i < n ? 'var(--green)' : 'none');
    s.setAttribute('stroke', i < n ? 'var(--green)' : 'var(--border)');
  });
}

function submitVolReviews() {
  showToast('Оценките са запазени', true);
  back();
}

function addTeamMember() {
  const input = document.getElementById('team-invite-email');
  const errEl = document.getElementById('team-invite-err');
  const email = input.value.trim();

  if (!email) {
    errEl.textContent = 'Моля, въведи имейл адрес.';
    errEl.classList.add('visible');
    input.classList.add('input-error');
    return;
  }
  if (!isValidEmail(email)) {
    errEl.textContent = 'Невалиден имейл адрес.';
    errEl.classList.add('visible');
    input.classList.add('input-error');
    return;
  }

  const list = document.getElementById('team-members-list');
  const existing = Array.from(list.querySelectorAll('.team-member-email')).map(el => el.textContent);
  if (existing.includes(email)) {
    errEl.textContent = 'Този имейл вече е добавен.';
    errEl.classList.add('visible');
    input.classList.add('input-error');
    return;
  }

  const initials = email.slice(0, 2).toUpperCase();
  const row = document.createElement('div');
  row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; background:var(--bg); border-radius:var(--r-md); border:1px solid var(--border);';
  row.innerHTML = `
    <div class="avatar av-sm" style="background:#e0e0e0; color:#666; flex-shrink:0;">${initials}</div>
    <span class="team-member-email" style="flex:1; font-size:14px; color:var(--text);">${email}</span>
    <button onclick="this.closest('div').remove()" style="background:none; border:none; cursor:pointer; padding:4px; color:var(--text-muted);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  list.appendChild(row);

  input.value = '';
  input.classList.remove('input-error');
  errEl.textContent = '';
  errEl.classList.remove('visible');
  input.focus();
}

function doCreateTeam() {
  const name = document.getElementById('team-name').value.trim();
  const nameErr = document.getElementById('team-name-err');
  if (!name) {
    nameErr.classList.add('visible');
    document.getElementById('team-name').classList.add('input-error');
    return;
  }
  nameErr.classList.remove('visible');
  document.getElementById('team-name').classList.remove('input-error');
  document.getElementById('team-members-list').innerHTML = '';
  document.getElementById('team-invite-email').value = '';
  document.getElementById('team-name').value = '';
  document.getElementById('team-desc').value = '';
  showToast('Екипът е създаден успешно', true);
  back();
}

function openGroupChat(title, canWrite) {
  const titleEl = document.getElementById('chat-event-title');
  if (titleEl) titleEl.textContent = title;

  const inputBar    = document.getElementById('chat-input-bar');
  const readonlyBar = document.getElementById('chat-readonly-bar');
  if (inputBar)    inputBar.style.display    = canWrite ? 'flex' : 'none';
  if (readonlyBar) readonlyBar.style.display = canWrite ? 'none' : 'block';

  go('screen-group-chat');
  setTimeout(() => {
    const msgs = document.getElementById('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  const row = document.createElement('div');
  row.style.cssText = 'display:flex; flex-direction:row-reverse; gap:8px; align-items:flex-end;';
  row.innerHTML = `
    <div class="avatar av-sm" style="background:var(--green); color:white; flex-shrink:0; font-size:11px;">БЗ</div>
    <div style="display:flex; flex-direction:column; align-items:flex-end;">
      <div style="font-size:11px; color:var(--text-muted); margin-bottom:4px;">Организатор · ${time}</div>
      <div style="background:var(--green); color:white; border-radius:16px 16px 4px 16px; padding:10px 14px; font-size:14px; max-width:230px; line-height:1.5;">${msg}</div>
    </div>
  `;

  const msgs = document.getElementById('chat-messages');
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
  input.value = '';
  input.focus();
}

function joinWaitlist() {
  showToast('Добавен/а си в списъка на чакащи', true);
  back();
}

function openVolunteerSelection(title) {
  const el = document.getElementById('selection-event-title');
  if (el) el.textContent = title;
  go('screen-volunteer-selection');
}

function goApply() {
  const titleEl = document.getElementById('event-hero-title');
  const applyTitle = document.getElementById('apply-event-title');
  if (applyTitle && titleEl) applyTitle.textContent = titleEl.textContent;
  go('screen-apply');
}

function setFieldError(inputId, errId, message) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (!input || !err) return;
  if (message) {
    input.classList.add('input-error');
    err.textContent = message;
    err.classList.add('visible');
  } else {
    input.classList.remove('input-error');
    err.classList.remove('visible');
  }
}

function clearFieldError(inputId, errId) {
  setFieldError(inputId, errId, null);
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function doRegister() {
  const name     = document.getElementById('reg-name');
  const email    = document.getElementById('reg-email');
  const password = document.getElementById('reg-password');
  const toggle   = document.getElementById('terms-toggle');
  let valid = true;

  if (!name.value.trim()) {
    setFieldError('reg-name', 'reg-name-err', 'Моля, въведи името си.');
    valid = false;
  } else {
    clearFieldError('reg-name', 'reg-name-err');
  }

  if (!isValidEmail(email.value)) {
    setFieldError('reg-email', 'reg-email-err', 'Моля, въведи валиден имейл адрес.');
    valid = false;
  } else {
    clearFieldError('reg-email', 'reg-email-err');
  }

  if (password.value.length < 6) {
    setFieldError('reg-password', 'reg-password-err', 'Паролата трябва да е поне 6 символа.');
    valid = false;
  } else {
    clearFieldError('reg-password', 'reg-password-err');
  }

  if (!toggle || !toggle.classList.contains('terms-checked')) {
    showToast('Моля, приеми условията за ползване.');
    valid = false;
  }

  if (!valid) return;

  go('screen-login');
  showToast('Профилът е създаден успешно!', true);
}

function doLogin() {
  const email    = document.getElementById('login-email');
  const password = document.getElementById('login-password');
  let valid = true;

  if (!isValidEmail(email.value)) {
    setFieldError('login-email', 'login-email-err', 'Моля, въведи валиден имейл адрес.');
    valid = false;
  } else {
    clearFieldError('login-email', 'login-email-err');
  }

  if (!password.value.trim()) {
    setFieldError('login-password', 'login-password-err', 'Моля, въведи паролата си.');
    valid = false;
  } else {
    clearFieldError('login-password', 'login-password-err');
  }

  if (!valid) return;

  go('screen-home');
  showToast('Влязохте успешно!', true);
}

function openQR(title, date, org) {
  document.getElementById('cert-event-title').textContent = title;
  document.getElementById('cert-event-sub').textContent = `${date} · ${org}`;
  go('screen-qr');
}

function publishEvent() {
  const fields = [
    { id: 'ev-title',    errId: 'ev-title-err',    test: v => v.trim().length > 0 },
    { id: 'ev-desc',     errId: 'ev-desc-err',     test: v => v.trim().length > 0 },
    { id: 'ev-date',     errId: 'ev-date-err',     test: v => /^\d{2}\.\d{2}\.\d{4}$/.test(v.trim()) },
    { id: 'ev-time',     errId: 'ev-time-err',     test: v => /^\d{2}:\d{2}$/.test(v.trim()) },
    { id: 'ev-location', errId: 'ev-location-err', test: v => v.trim().length > 0 },
    { id: 'ev-capacity', errId: 'ev-capacity-err', test: v => parseInt(v) >= 1 },
  ];

  let valid = true;
  fields.forEach(({ id, errId, test }) => {
    const input = document.getElementById(id);
    const err = document.getElementById(errId);
    const ok = test(input.value);
    input.classList.toggle('input-error', !ok);
    err.classList.toggle('visible', !ok);
    if (!ok) valid = false;
  });

  if (!valid) return;

  showToast('Събитието е публикувано!', true);
}

let calYear = 2026;
let calMonth = 3; // April (0-indexed)

const CAL_EVENTS = {
  18: { label: 'Засаждане - Витоша', color: '#2A4820' },
  25: { label: 'Раздаване на обяд', color: '#C8752A' }
};

const MONTH_NAMES = [
  'Януари','Февруари','Март','Април','Май','Юни',
  'Юли','Август','Септември','Октомври','Ноември','Декември'
];
const DAY_NAMES = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

function renderCalendar() {
  const grid = document.getElementById('cal-grid');
  const heading = document.getElementById('cal-title');
  if (!grid || !heading) return;

  heading.textContent = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  const startOffset = (firstDay + 6) % 7;

  let html = '';

  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  const TODAY = calMonth === 3 && calYear === 2026 ? 14 : -1;

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === TODAY;
    const hasEv = CAL_EVENTS[d];
    const cls = ['cal-day', isToday ? 'today' : '', hasEv ? 'has-event' : ''].filter(Boolean).join(' ');
    html += `<div class="${cls}">${d}</div>`;
  }

  grid.innerHTML = html;
}

function calNav(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  renderCalendar();
}

function pseudoRand(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function renderQR() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SIZE = canvas.width;
  const CELLS = 21;
  const CELL = SIZE / CELLS;
  const rand = pseudoRand(42);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = '#1a1a1a';
  for (let r = 0; r < CELLS; r++) {
    for (let c = 0; c < CELLS; c++) {

      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= CELLS - 8) ||
        (r >= CELLS - 8 && c < 8);
      if (inFinder) continue;
      if (rand() > 0.5) {
        ctx.fillRect(c * CELL, r * CELL, CELL - 0.5, CELL - 0.5);
      }
    }
  }

  function drawFinder(x, y) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, CELL * 7, CELL * 7);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + CELL, y + CELL, CELL * 5, CELL * 5);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + CELL * 2, y + CELL * 2, CELL * 3, CELL * 3);
  }

  drawFinder(0, 0);
  drawFinder((CELLS - 7) * CELL, 0);
  drawFinder(0, (CELLS - 7) * CELL);
}

function showToast(msg, success = true) {
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.id = 'app-toast';
  t.className = 'toast' + (success ? ' toast-ok' : '');
  t.textContent = msg;

  const frame = document.getElementById('app') || document.body;
  frame.appendChild(t);

  requestAnimationFrame(() => t.classList.add('show'));

  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  menu.classList.toggle('open');
}

function closeProfileMenu() {
  document.getElementById('profile-menu').classList.remove('open');
}

function doLogout() {
  closeProfileMenu();
  go('screen-login');
}

function inviteAll() {
  showToast('Поканени са топ 18 доброволци!', true);
}

function showInvitePanel(teamId) {
  const panel = document.getElementById('invite-panel-' + teamId);
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    document.getElementById('invite-email-' + teamId).focus();
  }
}

function doInviteMember(teamId) {
  const emailInput = document.getElementById('invite-email-' + teamId);
  const errorEl = document.getElementById('invite-error-' + teamId);
  const email = emailInput.value.trim();

  if (!email) {
    errorEl.textContent = 'Моля, въведете имейл адрес.';
    errorEl.classList.add('visible');
    emailInput.classList.add('input-error');
    return;
  }
  if (!isValidEmail(email)) {
    errorEl.textContent = 'Невалиден имейл адрес.';
    errorEl.classList.add('visible');
    emailInput.classList.add('input-error');
    return;
  }

  const membersContainer = document.getElementById('members-' + teamId);
  const lastRow = membersContainer.querySelector('.member-row:last-child');
  if (lastRow) lastRow.style.borderBottom = '';

  const initials = email.slice(0, 2).toUpperCase();
  const row = document.createElement('div');
  row.className = 'member-row';
  row.style.borderBottom = 'none';
  row.innerHTML = `
    <div class="avatar av-md" style="background:#e0e0e0; color:#666;">${initials}</div>
    <div style="flex:1;">
      <div class="member-name">${email}</div>
      <div class="member-count">Покана изпратена</div>
    </div>
    <span class="status status-orange" style="font-size:11px;">Чакащ</span>
  `;
  membersContainer.appendChild(row);

  emailInput.value = '';
  emailInput.classList.remove('input-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
  document.getElementById('invite-panel-' + teamId).style.display = 'none';

  showToast('Поканата е изпратена!', true);
}

document.addEventListener('DOMContentLoaded', () => {

  const welcome = document.getElementById('screen-welcome');
  if (welcome) welcome.classList.add('active');
  currentScreen = 'screen-welcome';

  renderCalendar();
  renderQR();

  document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
    el.addEventListener('click', () => navTo(el.dataset.tab));
  });

  document.addEventListener('click', e => {
    const item = e.target.closest('[data-tooltip]');
    document.querySelectorAll('.tooltip-visible').forEach(el => el.classList.remove('tooltip-visible'));
    if (item) {
      item.classList.add('tooltip-visible');
      setTimeout(() => item.classList.remove('tooltip-visible'), 2000);
    }

    const menu = document.getElementById('profile-menu');
    if (menu && menu.classList.contains('open')) {
      if (!e.target.closest('.profile-menu') && !e.target.closest('.profile-3dots')) {
        menu.classList.remove('open');
      }
    }
  });
});