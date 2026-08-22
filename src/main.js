import './styles.css';
import { Network } from '@capacitor/network';
import { Browser } from '@capacitor/browser';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { offlineEmergencies } from './offline-pack.js';
import { mrcpSet1 } from './mrcp-set1.js';

const SITE = 'https://www.acutemedicaltake.org';
const app = document.querySelector('#app');

const sections = [
  { id: 'emergency', title: 'Emergency', subtitle: 'Cardiac arrest, sepsis, anaphylaxis and other urgent pathways', icon: '⚡' },
  { id: 'cardiology', title: 'Cardiology', subtitle: 'ACS, arrhythmias, heart failure and acute cardiac care', icon: '♥' },
  { id: 'respiratory', title: 'Respiratory', subtitle: 'Asthma, COPD, PE, NIV and respiratory emergencies', icon: '◌' },
  { id: 'neurology', title: 'Neurology', subtitle: 'Stroke, seizures, headache and neurological emergencies', icon: '◎' },
  { id: 'endocrinology', title: 'Endocrinology', subtitle: 'DKA, adrenal crisis, hypoglycaemia and endocrine emergencies', icon: '◇' },
  { id: 'electrolytes', title: 'Electrolytes', subtitle: 'Hyponatraemia, hyperkalaemia and electrolyte pathways', icon: '±' },
  { id: 'gastrointestinal', title: 'Gastrointestinal', subtitle: 'GI bleeding, liver disease and acute GI presentations', icon: '≋' },
  { id: 'critical-care', title: 'Critical Care', subtitle: 'Deterioration, shock, escalation and organ support', icon: '✚' },
  { id: 'calculators', title: 'Calculators', subtitle: 'Clinical scores and acute medicine calculators', icon: '#' },
  { id: 'mrcp', title: 'AMT Pro / MRCP', subtitle: 'Interactive cases, MRCP Part 2 questions and progress tracking', icon: 'A+' }
];

let currentTab = 'home';
let favourites = new Set();
let selectedOffline = null;
let currentQuestion = 0;
let score = 0;
let answered = false;

const safeHaptic = async () => {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (_) {}
};

async function loadFavourites() {
  const { value } = await Preferences.get({ key: 'amt-favourites' });
  favourites = new Set(value ? JSON.parse(value) : []);
}

async function saveFavourites() {
  await Preferences.set({ key: 'amt-favourites', value: JSON.stringify([...favourites]) });
}

function header() {
  return `<header class="topbar"><div class="brand-row"><div class="logo-mark">AMT</div><div><div class="eyebrow">ACUTE MEDICAL TAKE</div><h1>Clinical Guide</h1></div></div><div id="network-pill" class="network-pill">Checking…</div></header>`;
}

function sectionCard(section) {
  const saved = favourites.has(section.id);
  return `<article class="clinical-card"><button class="card-main" data-open="${section.id}" aria-label="Open ${section.title}"><span class="card-icon">${section.icon}</span><span class="card-copy"><strong>${section.title}</strong><small>${section.subtitle}</small></span><span class="chevron">›</span></button><button class="save-btn ${saved ? 'saved' : ''}" data-save="${section.id}" aria-label="${saved ? 'Remove from' : 'Add to'} favourites">${saved ? '★' : '☆'}</button></article>`;
}

function homeView() {
  return `${header()}<main class="content"><section class="hero"><span class="hero-kicker">Rapid access at the bedside</span><h2>Acute medicine, organised for mobile.</h2><p>Open pathways, emergency algorithms, calculators and AMT Pro learning from one clinical app.</p><div class="hero-actions"><button class="primary" id="open-site">Open full Acute Medical Take</button><button class="secondary" data-tab="offline">Offline emergencies</button></div></section><section class="quick-grid"><button class="quick danger" data-tab="offline"><span>⚡</span><b>Offline</b></button><button class="quick" data-open="calculators"><span>#</span><b>Calculators</b></button><button class="quick" data-tab="saved"><span>★</span><b>Saved</b></button><button class="quick pro" data-tab="pro"><span>A+</span><b>AMT Pro</b></button></section><div class="section-heading"><div><span class="eyebrow">NAVIGATOR</span><h3>Clinical pathways</h3></div></div><section class="card-list">${sections.slice(0, 8).map(sectionCard).join('')}</section></main>`;
}

function savedView() {
  const savedSections = sections.filter(s => favourites.has(s.id));
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">PERSONAL LIBRARY</span><h2>Saved pathways</h2><p>Your frequently used AMT sections are stored on this device.</p></div><section class="card-list">${savedSections.length ? savedSections.map(sectionCard).join('') : '<div class="empty"><div class="empty-star">☆</div><h3>No saved pathways yet</h3><p>Tap the star beside any clinical section to keep it here.</p></div>'}</section></main>`;
}

function searchView() {
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">SEARCH</span><h2>Find a pathway</h2><p>Search the mobile navigator, then open the live AMT clinical content.</p></div><div class="search-box"><span>⌕</span><input id="search-input" autocomplete="off" placeholder="e.g. hyponatraemia, stroke, DKA" /></div><section id="search-results" class="card-list">${sections.map(sectionCard).join('')}</section></main>`;
}

function offlineView() {
  if (selectedOffline) {
    const item = offlineEmergencies.find(x => x.id === selectedOffline);
    return `${header()}<main class="content"><button class="back-link" data-offline-back>‹ Offline emergency pack</button><div class="page-title"><span class="eyebrow">OFFLINE · RAPID ORIENTATION</span><h2>${item.title}</h2><p class="priority">${item.priority}</p><p>${item.summary}</p></div><ol class="offline-steps">${item.steps.map(step => `<li>${step}</li>`).join('')}</ol><div class="safety-box"><b>Safety note</b><p>${item.safety}</p></div><button class="primary" data-live-topic="${item.title}">Open current live pathway</button></main>`;
  }
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">PHASE 2</span><h2>Offline emergency pack</h2><p>Concise emergency orientation stored inside the app for use when connectivity is poor. Always use current local/national algorithms for exact doses and definitive treatment.</p></div><section class="offline-list">${offlineEmergencies.map(item => `<button class="offline-card" data-offline="${item.id}"><span><b>${item.title}</b><small>${item.priority}</small></span><span>›</span></button>`).join('')}</section></main>`;
}

function proView() {
  const q = mrcpSet1[currentQuestion];
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">AMT PRO · MRCP PART 2</span><h2>Question ${currentQuestion + 1} of ${mrcpSet1.length}</h2><p>Starter set · score ${score}/${mrcpSet1.length}</p></div><div class="question-card"><div class="question-topic">${q.topic}</div><p class="question-stem">${q.stem}</p><div class="answer-list">${q.options.map((opt, i) => `<button class="answer-btn" data-answer="${i}" ${answered ? 'disabled' : ''}><span>${String.fromCharCode(65+i)}</span>${opt}</button>`).join('')}</div><div id="answer-feedback"></div></div><div class="pro-actions"><button class="secondary" data-live-topic="${q.pathway}">Review AMT pathway</button>${answered ? `<button class="primary" id="next-question">${currentQuestion === mrcpSet1.length - 1 ? 'Restart set' : 'Next question'}</button>` : ''}</div></main>`;
}

function moreView() {
  return `${header()}<main class="content"><div class="page-title"><span class="eyebrow">ACUTE MEDICAL TAKE</span><h2>More</h2></div><section class="menu-list"><button data-tab="pro"><b>AMT Pro</b><span>MRCP Part 2 starter set ›</span></button><button data-tab="offline"><b>Offline emergency pack</b><span>Five rapid-orientation emergency summaries ›</span></button><button id="open-site-more"><b>Full website</b><span>Open acutemedicaltake.org ›</span></button><div><b>Deep links</b><span>App is prepared to receive acutemedicaltake.org links</span></div><div><b>Version</b><span>Android Phase 2 · 1.1.0</span></div></section><p class="disclaimer">Educational clinical reference only. It does not replace clinical judgement, local policy, current national guidance or specialist advice.</p></main>`;
}

function bottomNav() {
  return `<nav class="bottom-nav" aria-label="App navigation"><button class="${currentTab === 'home' ? 'active' : ''}" data-tab="home"><span>⌂</span><small>Home</small></button><button class="${currentTab === 'search' ? 'active' : ''}" data-tab="search"><span>⌕</span><small>Search</small></button><button class="${currentTab === 'saved' ? 'active' : ''}" data-tab="saved"><span>★</span><small>Saved</small></button><button class="${currentTab === 'more' ? 'active' : ''}" data-tab="more"><span>•••</span><small>More</small></button></nav>`;
}

async function openLive(sectionId = '') {
  await safeHaptic();
  const label = sections.find(s => s.id === sectionId)?.title || sectionId;
  const url = label ? `${SITE}/?amt_section=${encodeURIComponent(label)}` : SITE;
  await Browser.open({ url, presentationStyle: 'popover' });
}

function handleIncomingUrl(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('acutemedicaltake.org')) return;
    const section = parsed.searchParams.get('amt_section');
    if (section?.toLowerCase().includes('mrcp') || section?.toLowerCase().includes('amt pro')) currentTab = 'pro';
    else if (section?.toLowerCase().includes('emergency')) currentTab = 'offline';
    else currentTab = 'home';
    render();
  } catch (_) {}
}

function attachEvents() {
  document.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', async () => { await safeHaptic(); currentTab = el.dataset.tab; selectedOffline = null; render(); }));
  document.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openLive(el.dataset.open)));
  document.querySelectorAll('[data-live-topic]').forEach(el => el.addEventListener('click', () => openLive(el.dataset.liveTopic)));
  document.querySelectorAll('[data-offline]').forEach(el => el.addEventListener('click', async () => { await safeHaptic(); selectedOffline = el.dataset.offline; render(); }));
  document.querySelector('[data-offline-back]')?.addEventListener('click', () => { selectedOffline = null; render(); });
  document.querySelectorAll('[data-save]').forEach(el => el.addEventListener('click', async () => { await safeHaptic(); const id = el.dataset.save; favourites.has(id) ? favourites.delete(id) : favourites.add(id); await saveFavourites(); render(); }));
  document.querySelectorAll('[data-answer]').forEach(el => el.addEventListener('click', async () => { if (answered) return; await safeHaptic(); answered = true; const selected = Number(el.dataset.answer); const q = mrcpSet1[currentQuestion]; if (selected === q.answer) score += 1; render(); const feedback = document.querySelector('#answer-feedback'); if (feedback) feedback.innerHTML = `<div class="feedback ${selected === q.answer ? 'correct' : 'incorrect'}"><b>${selected === q.answer ? 'Correct' : `Best answer: ${String.fromCharCode(65 + q.answer)}`}</b><p>${q.explanation}</p><small>Pathway: ${q.pathway}</small></div>`; }));
  document.querySelector('#next-question')?.addEventListener('click', () => { if (currentQuestion === mrcpSet1.length - 1) { currentQuestion = 0; score = 0; } else currentQuestion += 1; answered = false; render(); });
  document.querySelector('#open-site')?.addEventListener('click', () => openLive());
  document.querySelector('#open-site-more')?.addEventListener('click', () => openLive());
  document.querySelector('#search-input')?.addEventListener('input', e => { const query = e.target.value.trim().toLowerCase(); const filtered = sections.filter(s => `${s.title} ${s.subtitle}`.toLowerCase().includes(query)); document.querySelector('#search-results').innerHTML = filtered.length ? filtered.map(sectionCard).join('') : '<div class="empty"><h3>No local match</h3><p>Open the full AMT site for the complete clinical search.</p><button class="primary" id="search-full-site">Search full AMT</button></div>'; attachDynamicCardEvents(); document.querySelector('#search-full-site')?.addEventListener('click', () => openLive(query)); });
  refreshNetworkPill();
}

function attachDynamicCardEvents() {
  document.querySelectorAll('[data-open]').forEach(el => el.onclick = () => openLive(el.dataset.open));
  document.querySelectorAll('[data-save]').forEach(el => el.onclick = async () => { const id = el.dataset.save; favourites.has(id) ? favourites.delete(id) : favourites.add(id); await saveFavourites(); render(); });
}

function render() {
  const views = { home: homeView, search: searchView, saved: savedView, more: moreView, offline: offlineView, pro: proView };
  app.innerHTML = `<div class="app-shell">${views[currentTab]()}${bottomNav()}</div>`;
  attachEvents();
}

async function refreshNetworkPill() {
  const status = await Network.getStatus();
  const pill = document.querySelector('#network-pill');
  if (!pill) return;
  pill.textContent = status.connected ? '● Online' : '○ Offline';
  pill.dataset.online = String(status.connected);
}

await loadFavourites();
render();
Network.addListener('networkStatusChange', refreshNetworkPill);
App.addListener('appUrlOpen', ({ url }) => handleIncomingUrl(url));
