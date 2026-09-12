import './styles.css';
import { Network } from '@capacitor/network';
import { Browser } from '@capacitor/browser';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { offlineEmergencies } from './offline-pack.js';
import { mrcpSet1 } from './mrcp-set1.js';
import { TAKE_GROUPS, TAKE_PRESENTATIONS, TIMER_PRESETS, createTimer, formatDuration, newTakeSession, pauseTimer, resumeTimer, timerRemaining, toggleTakeStep } from './clinical-tools.js';

const SITE = 'https://www.acutemedicaltake.org';
const REVIEW_DATE = '12 September 2026';
const NativeFeatures = registerPlugin('AMTNativeFeatures');
const app = document.querySelector('#app');

const sections = [
  { id: 'emergency', title: 'Emergency', subtitle: 'Cardiac arrest, sepsis, anaphylaxis and other urgent pathways', icon: '⚡' },
  { id: 'cardiology', title: 'Cardiology', subtitle: 'ACS, arrhythmias, heart failure and acute cardiac care', icon: '♥' },
  { id: 'respiratory', title: 'Respiratory', subtitle: 'Asthma, COPD, PE, NIV and respiratory emergencies', icon: '◌' },
  { id: 'neurology', title: 'Neurology', subtitle: 'Stroke, seizures and neurological emergencies', icon: '◎' },
  { id: 'endocrinology', title: 'Endocrinology', subtitle: 'DKA, adrenal crisis and hypoglycaemia', icon: '◇' },
  { id: 'electrolytes', title: 'Electrolytes', subtitle: 'Hyponatraemia, hyperkalaemia and electrolyte pathways', icon: '±' },
  { id: 'gastrointestinal', title: 'Gastrointestinal', subtitle: 'GI bleeding, liver disease and acute GI presentations', icon: '≋' },
  { id: 'critical-care', title: 'Critical Care', subtitle: 'Deterioration, shock, escalation and organ support', icon: '✚' },
  { id: 'calculators', title: 'Calculators', subtitle: 'Clinical scores and acute medicine calculators', icon: '#' },
  { id: 'mrcp', title: 'AMT Pro / MRCP', subtitle: 'Starter questions and progress tracking', icon: 'A+' }
];

let currentTab = 'home';
let favourites = new Set();
let selectedOffline = null;
let takeSession = null;
let activeTimer = null;
let currentQuestion = 0;
let score = 0;
let answered = false;
let notesUnlocked = false;
let notesText = '';
let ticker;

const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const safeHaptic = async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) {} };
const readJSON = async (key, fallback) => { try { const { value } = await Preferences.get({ key }); return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; } };
const writeJSON = (key, value) => Preferences.set({ key, value: JSON.stringify(value) });

async function loadState() {
  favourites = new Set(await readJSON('amt-favourites', []));
  takeSession = await readJSON('amt-take-session-v1', null);
  activeTimer = await readJSON('amt-active-timer-v1', null);
}

async function shareWidgetState() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await NativeFeatures.updateSharedState({
      favourites: [...favourites].map(id => sections.find(item => item.id === id)?.title).filter(Boolean),
      activeTimer: activeTimer ? { title: activeTimer.title, targetAt: activeTimer.targetAt || 0, status: activeTimer.status } : null
    });
  } catch (_) {}
}

function header() {
  return `<header class="topbar"><div class="brand-row"><div class="logo-mark" aria-hidden="true">A+</div><div><div class="eyebrow">ACUTE MEDICAL TAKE</div><h1>Clinical Guide</h1></div></div><div id="network-pill" class="network-pill">Checking…</div></header>`;
}

function governanceBox(source = 'Current local and national guidance') {
  return `<aside class="governance"><b>Clinical governance</b><p>Supports, but does not replace, clinical judgement or monitoring. Check current local and national guidance and escalate emergencies appropriately. No diagnosis or dose recommendation is generated.</p><small>Source: ${escapeHTML(source)} · AMT content review: ${REVIEW_DATE} · Clinical sign-off required before release</small></aside>`;
}

function sectionCard(section) {
  const saved = favourites.has(section.id);
  return `<article class="clinical-card"><button class="card-main" data-open="${section.id}" aria-label="Open ${section.title} on the complete website"><span class="card-icon">${section.icon}</span><span class="card-copy"><strong>${section.title}</strong><small>${section.subtitle}</small></span><span class="chevron">›</span></button><button class="save-btn ${saved ? 'saved' : ''}" data-save="${section.id}" aria-label="${saved ? 'Remove from' : 'Add to'} favourites">${saved ? '★' : '☆'}</button></article>`;
}

function homeView() {
  return `${header()}<main class="content"><section class="hero"><span class="hero-kicker">Bundled native companion · works offline</span><h2>Acute medicine, organised for the take.</h2><p>Use device-only checklists, timers and offline summaries. Open the complete website separately when required.</p><div class="hero-actions"><button class="primary" data-tab="take">Start AMT Take Mode</button><button class="secondary" id="open-site">Open complete live website ↗</button></div></section><section class="quick-grid"><button class="quick danger" data-tab="offline"><span>⚡</span><b>Offline</b></button><button class="quick" data-tab="timers"><span>◷</span><b>Timers</b></button><button class="quick" data-tab="saved"><span>★</span><b>Favourites</b></button><button class="quick pro" data-tab="pro"><span>A+</span><b>AMT Pro</b></button></section><div class="section-heading"><div><span class="eyebrow">BUNDLED NAVIGATOR</span><h3>Clinical pathways</h3></div></div><section class="card-list">${sections.slice(0, 8).map(sectionCard).join('')}</section>${governanceBox()}</main>`;
}

function savedView() {
  const saved = sections.filter(item => favourites.has(item.id));
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">DEVICE-STORED</span><h2>Favourites</h2><p>Pathway identifiers only are stored on this device and shared with the favourites widget.</p></div><section class="card-list">${saved.length ? saved.map(sectionCard).join('') : '<div class="empty"><h3>No favourites</h3><p>Use a star beside a pathway to add it.</p></div>'}</section></main>`;
}

function searchView() {
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">LOCAL SEARCH</span><h2>Find a pathway</h2><p>Search the bundled navigator. Website results open only when you choose them.</p></div><div class="search-box"><span>⌕</span><input id="search-input" autocomplete="off" aria-label="Search pathways" placeholder="e.g. stroke, DKA" /></div><section id="search-results" class="card-list">${sections.map(sectionCard).join('')}</section></main>`;
}

function offlineView() {
  if (selectedOffline) {
    const item = offlineEmergencies.find(x => x.id === selectedOffline);
    return `${header()}<main class="content"><button class="back-link" data-offline-back>‹ Offline emergencies</button><div class="page-title"><span class="eyebrow">OFFLINE · RAPID ORIENTATION</span><h2>${item.title}</h2><p class="priority">${item.priority}</p><p>${item.summary}</p></div><ol class="offline-steps">${item.steps.map(step => `<li>${step}</li>`).join('')}</ol><div class="safety-box"><b>Safety note</b><p>${item.safety}</p></div>${governanceBox(item.source || item.safety)}<button class="primary" data-live-topic="${item.title}">Open current live pathway ↗</button></main>`;
  }
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">BUNDLED FOR OFFLINE USE</span><h2>Offline emergencies</h2><p>Rapid orientation only. Exact treatment and doses must come from current approved guidance.</p></div><section class="offline-list">${offlineEmergencies.map(item => `<button class="offline-card" data-offline="${item.id}"><span><b>${item.title}</b><small>${item.priority}</small></span><span>›</span></button>`).join('')}</section>${governanceBox()}</main>`;
}

function takeView() {
  if (!takeSession) {
    return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">ANONYMOUS · DEVICE ONLY</span><h2>AMT Take Mode</h2><p>A structured workspace for your acute take. It does not register patients, diagnose, prescribe or upload data.</p></div><div class="warning"><b>Do not enter identifiable patient information.</b><p>No names, NHS numbers, dates of birth, addresses or other identifiable details. This tool does not replace the clinical record.</p></div><label class="field-label" for="presentation">Select an acute presentation</label><select id="presentation" class="field">${TAKE_PRESENTATIONS.map(item => `<option>${item}</option>`).join('')}</select><button class="primary" id="start-take">Create device-only session</button>${governanceBox()}</main>`;
  }
  const total = TAKE_GROUPS.reduce((sum, group) => sum + group.steps.length, 0);
  const done = Object.keys(takeSession.completed).length;
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">ACTIVE TAKE · ${done}/${total} COMPLETE</span><h2>${escapeHTML(takeSession.presentation)}</h2><p>Started ${new Date(takeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Timestamps are user-controlled.</p></div><div class="warning compact"><b>No identifiable patient information</b></div>${TAKE_GROUPS.map(group => `<section class="check-group"><h3>${group.title}</h3>${group.steps.map((step, index) => { const id = `${group.id}-${index}`; const at = takeSession.completed[id]; return `<button class="check-row ${at ? 'complete' : ''}" data-take-step="${id}"><span>${at ? '✓' : '○'}</span><span><b>${step}</b>${at ? `<small>Marked ${new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>` : '<small>Outstanding</small>'}</span></button>`; }).join('')}</section>`).join('')}<div class="danger-actions"><button class="secondary" id="reset-take">Reset checklist</button><button class="destructive" id="delete-take">Permanently delete session</button></div>${governanceBox()}</main>`;
}

function timersView() {
  const remaining = timerRemaining(activeTimer);
  const active = activeTimer ? `<section class="active-timer"><span class="eyebrow">${activeTimer.status.toUpperCase()}</span><h2>${escapeHTML(activeTimer.title)}</h2><div class="timer-clock" id="timer-clock">${formatDuration(remaining)}</div><p>Next user-defined review point: ${activeTimer.targetAt ? new Date(activeTimer.targetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Paused'}</p><div class="timer-actions">${activeTimer.status === 'running' ? '<button class="secondary" id="pause-timer">Pause</button>' : '<button class="secondary" id="resume-timer">Resume</button>'}<button class="secondary" id="reset-timer">Reset</button><button class="destructive" id="cancel-timer">Cancel</button></div></section>` : '';
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">MANUAL · LOCAL ONLY</span><h2>Clinical timers</h2><p>You must start every timer. Optional local alerts do not replace clinical monitoring.</p></div>${active}<section class="timer-presets">${TIMER_PRESETS.map(item => `<article class="timer-card"><div><b>${item.title}</b><small>${item.source}<br>${item.version}</small></div><label>Review minutes<input type="number" min="1" max="720" value="${item.minutes}" data-timer-minutes="${item.id}" aria-label="${item.title} review minutes"></label><button class="primary" data-start-timer="${item.id}">Start manually</button>${item.url ? `<button class="link-button" data-url="${item.url}">View referenced guidance ↗</button>` : ''}</article>`).join('')}</section>${governanceBox()}</main>`;
}

function notesView() {
  if (!Capacitor.isNativePlatform()) return `${header()}<main class="content"><div class="page-title"><h2>Secured personal notes</h2><p>Available only inside the native iOS app.</p></div></main>`;
  if (!notesUnlocked) return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">ENCRYPTED · DEVICE ONLY</span><h2>Secured personal notes</h2><p>Protected by Face ID, Touch ID or device passcode. Cloud sync is disabled.</p></div><div class="warning"><b>Do not enter identifiable patient information.</b><p>Notes must not contain names, NHS numbers, dates of birth, addresses or identifiable clinical information.</p></div><button class="primary" id="unlock-notes">Unlock securely</button></main>`;
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">UNLOCKED FOR THIS SESSION</span><h2>Personal notes</h2><p>Encrypted with CryptoKit; the key is held in Keychain.</p></div><div class="warning compact"><b>Do not enter identifiable patient information.</b></div><textarea id="secure-notes" class="notes-field" maxlength="12000" autocomplete="off" spellcheck="true" aria-label="Encrypted personal notes">${escapeHTML(notesText)}</textarea><div class="danger-actions"><button class="primary" id="save-notes">Encrypt and save</button><button class="destructive" id="delete-notes">Permanently delete all notes</button></div></main>`;
}

function proView() {
  const q = mrcpSet1[currentQuestion];
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">AMT PRO · STARTER SET</span><h2>Question ${currentQuestion + 1} of ${mrcpSet1.length}</h2><p>Score ${score}/${mrcpSet1.length}</p></div><div class="question-card"><div class="question-topic">${q.topic}</div><p class="question-stem">${q.stem}</p><div class="answer-list">${q.options.map((option, index) => `<button class="answer-btn" data-answer="${index}" ${answered ? 'disabled' : ''}><span>${String.fromCharCode(65 + index)}</span>${option}</button>`).join('')}</div><div id="answer-feedback"></div></div><div class="pro-actions"><button class="secondary" data-live-topic="${q.pathway}">Review complete pathway ↗</button>${answered ? `<button class="primary" id="next-question">${currentQuestion === mrcpSet1.length - 1 ? 'Restart set' : 'Next question'}</button>` : ''}</div>${governanceBox()}</main>`;
}

function moreView() {
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">APP-EXCLUSIVE TOOLS</span><h2>More</h2></div><section class="menu-list"><button data-tab="notes"><b>Face ID-secured notes</b><span>Encrypted device-only notes ›</span></button><button data-tab="pro"><b>AMT Pro</b><span>MRCP Part 2 starter questions ›</span></button><button id="open-site-more"><b>Complete live website ↗</b><span>Securely opens acutemedicaltake.org in the in-app browser</span></button><div><b>Siri and widgets</b><span>Quick pathways, emergencies, favourites and timer actions are available from iOS.</span></div><div><b>Version</b><span>1.0.0 (2) review build</span></div></section>${governanceBox()}</main>`;
}

function bottomNav() {
  const items = [['home', '⌂', 'Home'], ['take', '☑', 'Take'], ['timers', '◷', 'Timers'], ['search', '⌕', 'Search'], ['saved', '★', 'Saved'], ['more', '•••', 'More']];
  return `<nav class="bottom-nav" aria-label="App navigation">${items.map(([id, icon, label]) => `<button class="${currentTab === id ? 'active' : ''}" data-tab="${id}"><span>${icon}</span><small>${label}</small></button>`).join('')}</nav>`;
}

function ipadSidebar() {
  return `<aside class="ipad-sidebar" aria-label="iPad dashboard"><div class="eyebrow">IPAD DASHBOARD</div><h2>Acute Take</h2><button data-tab="take">Take Mode</button><button data-tab="timers">Active timer ${activeTimer ? `· ${formatDuration(timerRemaining(activeTimer))}` : ''}</button><button data-tab="offline">Offline emergencies</button><button data-tab="saved">Favourites · ${favourites.size}</button><button data-tab="notes">Secured notes</button></aside>`;
}

async function openURL(url) {
  const parsed = new URL(url, SITE);
  if (parsed.protocol !== 'https:') return;
  await Browser.open({ url: parsed.href, presentationStyle: 'popover' });
}

async function openLive(sectionId = '') {
  await safeHaptic();
  const label = sections.find(item => item.id === sectionId)?.title || sectionId;
  await openURL(label ? `${SITE}/?amt_section=${encodeURIComponent(label)}` : SITE);
}

async function saveFavourites() { await writeJSON('amt-favourites', [...favourites]); await shareWidgetState(); }
async function persistTake() { await writeJSON('amt-take-session-v1', takeSession); }
async function persistTimer() { await writeJSON('amt-active-timer-v1', activeTimer); await shareWidgetState(); }

async function scheduleTimerAlert(timer) {
  if (!Capacitor.isNativePlatform()) return;
  const permission = await LocalNotifications.checkPermissions();
  let status = permission.display;
  if (status === 'prompt' || status === 'prompt-with-rationale') status = (await LocalNotifications.requestPermissions()).display;
  if (status !== 'granted') return;
  await LocalNotifications.cancel({ notifications: [{ id: 1002 }] });
  await LocalNotifications.schedule({ notifications: [{ id: 1002, title: `${timer.title} review point`, body: 'Review the patient and current clinical plan. This alert does not replace monitoring.', schedule: { at: new Date(timer.targetAt) }, extra: { route: 'timers' } }] });
}

async function cancelTimerAlert() { if (Capacitor.isNativePlatform()) { try { await LocalNotifications.cancel({ notifications: [{ id: 1002 }] }); } catch (_) {} } }

function routeFromURL(url) {
  try {
    const parsed = new URL(url);
    const route = parsed.protocol === 'acutemedicaltake:' ? parsed.hostname || parsed.pathname.replace('/', '') : parsed.searchParams.get('amt_section') || '';
    const value = route.toLowerCase();
    if (value.includes('timer')) currentTab = 'timers';
    else if (value.includes('take')) currentTab = 'take';
    else if (value.includes('offline') || value.includes('emerg')) currentTab = 'offline';
    else if (value.includes('favourite') || value.includes('saved')) currentTab = 'saved';
    else if (value.includes('sepsis')) { currentTab = 'offline'; selectedOffline = 'sepsis'; }
    else currentTab = 'home';
    render();
  } catch (_) {}
}

function attachEvents() {
  document.querySelectorAll('[data-tab]').forEach(element => element.addEventListener('click', async () => { await safeHaptic(); currentTab = element.dataset.tab; selectedOffline = null; render(); }));
  document.querySelectorAll('[data-open]').forEach(element => element.addEventListener('click', () => openLive(element.dataset.open)));
  document.querySelectorAll('[data-live-topic]').forEach(element => element.addEventListener('click', () => openLive(element.dataset.liveTopic)));
  document.querySelectorAll('[data-url]').forEach(element => element.addEventListener('click', () => openURL(element.dataset.url)));
  document.querySelectorAll('[data-offline]').forEach(element => element.addEventListener('click', () => { selectedOffline = element.dataset.offline; render(); }));
  document.querySelector('[data-offline-back]')?.addEventListener('click', () => { selectedOffline = null; render(); });
  document.querySelectorAll('[data-save]').forEach(element => element.addEventListener('click', async () => { const id = element.dataset.save; favourites.has(id) ? favourites.delete(id) : favourites.add(id); await saveFavourites(); render(); }));
  document.querySelector('#start-take')?.addEventListener('click', async () => { takeSession = newTakeSession(document.querySelector('#presentation').value); await persistTake(); render(); });
  document.querySelectorAll('[data-take-step]').forEach(element => element.addEventListener('click', async () => { takeSession = toggleTakeStep(takeSession, element.dataset.takeStep); await persistTake(); render(); }));
  document.querySelector('#reset-take')?.addEventListener('click', async () => { if (!confirm('Reset every checklist item and timestamp?')) return; takeSession = newTakeSession(takeSession.presentation); await persistTake(); render(); });
  document.querySelector('#delete-take')?.addEventListener('click', async () => { if (!confirm('Permanently delete this device-only Take Mode session?')) return; takeSession = null; await Preferences.remove({ key: 'amt-take-session-v1' }); render(); });
  document.querySelectorAll('[data-start-timer]').forEach(element => element.addEventListener('click', async () => { const id = element.dataset.startTimer; const minutes = document.querySelector(`[data-timer-minutes="${id}"]`).value; try { activeTimer = createTimer(id, minutes); await persistTimer(); await scheduleTimerAlert(activeTimer); render(); } catch (error) { alert(error.message); } }));
  document.querySelector('#pause-timer')?.addEventListener('click', async () => { activeTimer = pauseTimer(activeTimer); await cancelTimerAlert(); await persistTimer(); render(); });
  document.querySelector('#resume-timer')?.addEventListener('click', async () => { activeTimer = resumeTimer(activeTimer); await persistTimer(); await scheduleTimerAlert(activeTimer); render(); });
  document.querySelector('#reset-timer')?.addEventListener('click', async () => { activeTimer = createTimer(activeTimer.id, activeTimer.durationMinutes); await persistTimer(); await scheduleTimerAlert(activeTimer); render(); });
  document.querySelector('#cancel-timer')?.addEventListener('click', async () => { await cancelTimerAlert(); activeTimer = null; await Preferences.remove({ key: 'amt-active-timer-v1' }); await shareWidgetState(); render(); });
  document.querySelector('#unlock-notes')?.addEventListener('click', async () => { try { await NativeFeatures.authenticate({ reason: 'Unlock your encrypted Acute Medical Take notes' }); const result = await NativeFeatures.loadSecureNotes(); notesText = result.text || ''; notesUnlocked = true; render(); } catch (_) { alert('Notes remain locked. Authentication was cancelled or is unavailable.'); } });
  document.querySelector('#save-notes')?.addEventListener('click', async () => { notesText = document.querySelector('#secure-notes').value; await NativeFeatures.saveSecureNotes({ text: notesText }); alert('Notes encrypted and saved on this device.'); });
  document.querySelector('#delete-notes')?.addEventListener('click', async () => { if (!confirm('Permanently delete all encrypted notes? This cannot be undone.')) return; await NativeFeatures.deleteSecureNotes(); notesText = ''; notesUnlocked = false; render(); });
  document.querySelectorAll('[data-answer]').forEach(element => element.addEventListener('click', () => { if (answered) return; answered = true; const selected = Number(element.dataset.answer); const q = mrcpSet1[currentQuestion]; if (selected === q.answer) score += 1; render(); const feedback = document.querySelector('#answer-feedback'); if (feedback) feedback.innerHTML = `<div class="feedback ${selected === q.answer ? 'correct' : 'incorrect'}"><b>${selected === q.answer ? 'Correct' : `Best answer: ${String.fromCharCode(65 + q.answer)}`}</b><p>${q.explanation}</p></div>`; }));
  document.querySelector('#next-question')?.addEventListener('click', () => { currentQuestion = (currentQuestion + 1) % mrcpSet1.length; if (!currentQuestion) score = 0; answered = false; render(); });
  document.querySelector('#open-site')?.addEventListener('click', () => openLive());
  document.querySelector('#open-site-more')?.addEventListener('click', () => openLive());
  document.querySelector('#search-input')?.addEventListener('input', event => { const query = event.target.value.trim().toLowerCase(); const results = sections.filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query)); document.querySelector('#search-results').innerHTML = results.length ? results.map(sectionCard).join('') : '<div class="empty"><h3>No bundled match</h3><p>Try another term or open the complete website.</p></div>'; });
  refreshNetworkPill();
}

function render() {
  clearInterval(ticker);
  const views = { home: homeView, take: takeView, timers: timersView, search: searchView, saved: savedView, offline: offlineView, notes: notesView, pro: proView, more: moreView };
  app.innerHTML = `<div class="app-shell">${ipadSidebar()}<div class="app-main">${(views[currentTab] || homeView)()}${bottomNav()}</div></div>`;
  attachEvents();
  if (currentTab === 'timers' && activeTimer?.status === 'running') ticker = setInterval(() => { const clock = document.querySelector('#timer-clock'); if (clock) clock.textContent = formatDuration(timerRemaining(activeTimer)); }, 1000);
}

async function refreshNetworkPill() {
  const status = await Network.getStatus();
  const pill = document.querySelector('#network-pill');
  if (pill) { pill.textContent = status.connected ? '● Online' : '○ Offline ready'; pill.dataset.online = String(status.connected); }
}

await loadState();
render();
Network.addListener('networkStatusChange', refreshNetworkPill);
App.addListener('appUrlOpen', ({ url }) => routeFromURL(url));
LocalNotifications.addListener('localNotificationActionPerformed', () => { currentTab = 'timers'; render(); });
if (Capacitor.isNativePlatform()) {
  try { const pending = await NativeFeatures.consumePendingRoute(); if (pending.route) routeFromURL(`acutemedicaltake://${pending.route}`); } catch (_) {}
}
