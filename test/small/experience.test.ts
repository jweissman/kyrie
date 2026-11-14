import { describe, expect, it } from 'bun:test';
import { RunnerExperience } from '../../src/cli/runner-experience';
import type { Offered, Said } from '../../src/cli/runner';
import type { Walk } from '../../src/cli/runner-walk';

// The experience measures read a walk's own turns, never its rendered colour (the owner, 15 November): a synthetic
// walk of five turns between two places, with one act that changed the world and one bond kept.
const act = (id: string, type: Offered['type'], aspects: string[] = []): Offered =>
  ({ id, label: id, aspects, type, marks: [] });
const take = act('take_item(coin,hamo)', 'act', ['payoff']), ask = act('ask(eamon,road)', 'talk', ['knowledge']);
const go = act('go(door,yard)', 'go', ['undertaking']), back = act('go(door,inn)', 'go'), wait = act('wait', 'wait');
const turn = (at: string, over: Partial<Said>): Said => ({ turn: 0, moment: 'arrive', at,
  scene: { lines: [at], prose: [] }, offer: { primary: [go, back], rest: [] }, ...over });
const aims = [{ id: 'carry', text: 'Carry it', followed: true as const }];
const walk: Walk = { policy: 'curious', chosen: [take, go, back, go, ask],
  turns: [turn('inn', { offer: { primary: [take, go, wait], rest: [ask] }, aims }),
    turn('inn', { moment: 'outcome', changed: ['+ carries(hamo, coin)'], aims, scene: { lines: [], prose: ['A coin.'] } }),
    turn('yard', { aims }), turn('inn', { aims, scene: { lines: [], prose: ['A coin.'] } }),
    turn('yard', { kept: { held: 1, of: 1 } }), turn('yard', { moment: 'outcome' })],
  scenes: [], budget: { scenes: 0, mean: 0, median: 0, worst: [], reference: 0,
    unasked: { sentences: 2, words: 4, heavy: [] } } };

describe('the experience measures', () => {
  it('count variety, continuity, prose and payoff from the turns alone', () => {
    const e = RunnerExperience.of(walk);
    expect([e.facets, e.opportunities, e.promoted, e.buried, e.pursued]).toEqual([3, 2, 1, 1, 2]);
    expect([e.resolved, e.changing, e.acts, e.returns, e.differing]).toEqual([1, 1, 5, 2, 1]);
    expect([e.longest, e.echoes, e.revisited, e.kept]).toEqual([4, 1, 1, 1]);
    expect(e.keys).toEqual(['ask(eamon,road)', 'take_item(coin,hamo)']);
  });
});
