import { describe, expect, it } from 'bun:test';
import { RunnerLed } from '../../src/cli/runner-led';
import type { Offered } from '../../src/cli/runner';
import type { PlayerFrame } from '../../src/presentation/player-frame';
import type { Screen } from '../../src/ui/screen-types';
import type { AimLead } from '../../src/presentation/aim-lead';

// A way out led toward the aim is led wherever it stands (OR-930). Since OR-800 the runner puts a way out of a
// building last of the rest, the four's way out with it, and the runner's account had read only the four for what
// leads: the way out of the Wardens' gatehouse toward the reeve, gold on the page, was led nowhere
// (test/golden-road-home). The same in miniature: a gatehouse, its door out to the bank gilt for the aim, and stood
// last of the rest.
const row = (id: string, label: string, does?: string): Offered =>
  ({ id, label, ...does ? { does } : {}, aspects: [], type: 'other', marks: [] }) as Offered;
const frame = {
  campaign: { world: { one: () => undefined }, module: { entities: [] } },
  bound: () => new Map<string, string[]>(),
} as unknown as PlayerFrame;
const screen = {
  place: { id: 'gatehouse', indoors: true },
  exits: [{ id: 'exit:bank', transition: 'walk', destination: { id: 'bank', indoors: false }, acts: [] }],
} as unknown as Screen;
const lead = { next: ['reeve'] } as unknown as AimLead;
const out = row('exit:bank', 'To the sea-bank', 'go(door,bank)');
const wind = row('wind', 'Wind the gate', 'wind_gate(party)');

describe('a way out led toward the aim', () => {
  it('is led though it stands last of the rest', () => {
    expect(RunnerLed.of(frame, screen, [wind], { lead, gilt: ['exit:bank'], rest: [row('wait', 'Wait'), out] }))
      .toEqual(['go(door,bank)']);
  });
  it('and nothing of the rest that does not leave is led for being there', () => {
    expect(RunnerLed.of(frame, screen, [wind], { lead, gilt: ['wait'], rest: [row('wait', 'Wait', 'wait'), out] }))
      .toEqual([]);
  });
});
