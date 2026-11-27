import { HandbookCreationReferences } from '../../src/client/creation-references';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';

// Where a life begins is the world's, never a pick (OB-16; the owner, 17 November: "remove the abstract origin-quest
// selection in favor of diegetic starting circumstances"): no step of the making asks why the life came, at any point
// of it, and the life as told says none; where it begins is the circumstance setting out gives. A tester's address may
// still name one (?origin=), outside the steps.
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }, { id: 'wanderer', title: 'Wandering',
    choice: 'You come with your trade', background: 'drifter' }],
  party: [Creation.protagonist('human', 'nowhy', {})] };
class Making {
  static asked(flow: CreationFlow): string[] { return flow.steps().map(s => `${s.id}: ${s.ask}`); }
}

describe('making a life asks no reason for having come', () => {
  it('has no step that asks it, from the first step to setting out', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    const seen = new Set<string>();
    for (let i = 0; i < 20 && flow.current() !== 'go'; i++) {
      Making.asked(flow).forEach(a => seen.add(a));
      flow.choose('onward', '');
    }
    expect(flow.current()).toBe('go');
    expect([...seen].filter(a => /why have you come|^why:/i.test(a))).toEqual([]);
    expect(flow.life().some(l => /debt|wandering/i.test(l))).toBe(false);
    expect(flow.circumstance()).toBe('debt');
  });
  it('begins where a tester names, outside the steps, without adding one', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    const before = flow.steps().map(s => s.id);
    flow.choose('origin', 'wanderer');
    expect(flow.steps().map(s => s.id)).toEqual(before);
    expect(flow.circumstance()).toBe('wanderer');
  });
});
