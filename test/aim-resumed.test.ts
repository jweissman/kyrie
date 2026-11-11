import { describe, expect, it } from 'bun:test';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import type { PlayerSnapshot } from '../src/presentation/player-view';

// The aim followed going back to the company's own errand when the one followed ends is said, as the aim now (round
// 4's talker: the aim followed went over to a dungeon by itself, and nothing said so).
describe('an errand followed again', () => {
  const errand = { id: 'origin__errand', text: 'Take the letter to the reeve at Hessel.' };
  const job = { id: 'quarrel__stones', text: 'Find who moved the boundary stones.' };
  const seen = (objectives: { id: string; text: string }[], followed?: string) =>
    ({ objectives, ...followed ? { followed } : {} }) as PlayerSnapshot;
  it('is told when the aim followed is gone and the errand is followed in its place', () => {
    const { aims, amended } = ActionFeedbackView.aims(seen([errand, job], job.id), seen([errand], errand.id));
    expect([aims, amended]).toEqual([[], [errand.text]]);
  });
  it('is not told while the aim followed holds, nor when it was the errand that ended', () => {
    expect(ActionFeedbackView.aims(seen([errand, job], job.id), seen([errand, job], job.id)).amended).toEqual([]);
    expect(ActionFeedbackView.aims(seen([errand, job], errand.id), seen([job])).amended).toEqual([]);
  });
});
