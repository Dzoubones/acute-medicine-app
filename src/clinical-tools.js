export const TAKE_PRESENTATIONS = [
  'Undifferentiated deterioration',
  'Suspected sepsis',
  'Chest pain',
  'Acute breathlessness',
  'Acute neurological deficit'
];

export const TAKE_GROUPS = [
  { id: 'abcde', title: 'ABCDE assessment', steps: ['Airway assessed', 'Breathing assessed', 'Circulation assessed', 'Disability assessed', 'Exposure assessed'] },
  { id: 'investigations', title: 'Investigations', steps: ['Observations reviewed', 'Bedside tests considered', 'Appropriate investigations requested', 'Results reviewed and acted on'] },
  { id: 'escalation', title: 'Escalation and reassessment', steps: ['Senior review considered', 'Local pathway checked', 'Reassessment time set', 'Escalation plan confirmed'] }
];

export const TIMER_PRESETS = [
  { id: 'sepsis', title: 'Sepsis review', minutes: 30, source: 'NICE NG253: Suspected sepsis in people aged 16 or over', version: 'Published 19 November 2025', url: 'https://www.nice.org.uk/guidance/ng253' },
  { id: 'stroke', title: 'Stroke pathway timing', minutes: 15, source: 'NICE NG128: Stroke and transient ischaemic attack in over 16s', version: 'Updated 2 April 2025', url: 'https://www.nice.org.uk/guidance/ng128' },
  { id: 'status', title: 'Status epilepticus timing', minutes: 5, source: 'NICE NG217: Epilepsies in children, young people and adults', version: 'Updated 30 January 2025', url: 'https://www.nice.org.uk/guidance/ng217' },
  { id: 'reassessment', title: 'Treatment reassessment', minutes: 15, source: 'User-defined clinical review point', version: 'No automated recommendation', url: '' },
  { id: 'custom', title: 'User-created review timer', minutes: 10, source: 'User-defined clinical review point', version: 'No automated recommendation', url: '' }
];

export function newTakeSession(presentation, now = Date.now()) {
  if (!TAKE_PRESENTATIONS.includes(presentation)) throw new Error('Unsupported presentation');
  return { presentation, startedAt: now, updatedAt: now, completed: {} };
}

export function toggleTakeStep(session, stepId, now = Date.now()) {
  if (!session) throw new Error('No active session');
  const completed = { ...session.completed };
  if (completed[stepId]) delete completed[stepId];
  else completed[stepId] = now;
  return { ...session, completed, updatedAt: now };
}

export function createTimer(presetId, minutes, now = Date.now()) {
  const preset = TIMER_PRESETS.find(item => item.id === presetId);
  if (!preset) throw new Error('Unknown timer');
  const duration = Number(minutes ?? preset.minutes);
  if (!Number.isFinite(duration) || duration < 1 || duration > 720) throw new Error('Review time must be 1–720 minutes');
  return { id: preset.id, title: preset.title, durationMinutes: duration, startedAt: now, targetAt: now + duration * 60000, remainingMs: duration * 60000, status: 'running' };
}

export function pauseTimer(timer, now = Date.now()) {
  if (!timer || timer.status !== 'running') return timer;
  return { ...timer, remainingMs: Math.max(0, timer.targetAt - now), status: 'paused', pausedAt: now };
}

export function resumeTimer(timer, now = Date.now()) {
  if (!timer || timer.status !== 'paused') return timer;
  return { ...timer, startedAt: now, targetAt: now + timer.remainingMs, status: 'running', pausedAt: undefined };
}

export function timerRemaining(timer, now = Date.now()) {
  if (!timer) return 0;
  return timer.status === 'running' ? Math.max(0, timer.targetAt - now) : Math.max(0, timer.remainingMs || 0);
}

export function formatDuration(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
