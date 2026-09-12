import test from 'node:test';
import assert from 'node:assert/strict';
import { createTimer, formatDuration, newTakeSession, pauseTimer, resumeTimer, timerRemaining, toggleTakeStep } from '../src/clinical-tools.js';

test('Take Mode stores only a generic presentation and checklist timestamps', () => {
  const session = toggleTakeStep(newTakeSession('Chest pain', 1000), 'abcde-0', 2000);
  assert.deepEqual(Object.keys(session).sort(), ['completed', 'presentation', 'startedAt', 'updatedAt']);
  assert.equal(session.completed['abcde-0'], 2000);
});

test('Take Mode can permanently remove a completed step', () => {
  const session = toggleTakeStep(toggleTakeStep(newTakeSession('Acute breathlessness', 1), 'abcde-0', 2), 'abcde-0', 3);
  assert.deepEqual(session.completed, {});
});

test('timers use wall-clock deadlines across background and relaunch', () => {
  const timer = createTimer('sepsis', 30, 1000);
  assert.equal(timerRemaining(timer, 6000), 1_795_000);
  assert.equal(formatDuration(timerRemaining(timer, 6000)), '29:55');
});

test('pause and resume preserve remaining duration', () => {
  const timer = createTimer('custom', 10, 0);
  const paused = pauseTimer(timer, 60_000);
  const resumed = resumeTimer(paused, 120_000);
  assert.equal(paused.remainingMs, 540_000);
  assert.equal(resumed.targetAt, 660_000);
});

test('timer validation rejects unsafe or accidental extreme intervals', () => {
  assert.throws(() => createTimer('custom', 0, 0));
  assert.throws(() => createTimer('custom', 721, 0));
});
