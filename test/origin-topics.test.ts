import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { TalkWeight } from '../src/presentation/talk-weight';

// A stated reason can be found (the cold playtest's CO-08, Gate 1's blocker class): "Ask about your sister" was
// seventeenth of the innkeeper's nineteen topics, because it only spoke, and the engine could not tell it mattered
// (M20's R10-15 and R11-02 before it). On a1, for each origin, at whoever its own topic is asked of, that topic is
// weighty (TalkWeight: it advances an aim, recruits, or tells of somewhere not yet known), so the page puts it first.
describe('the reason a life began, asked of the one the origin names', () => {
  it('is weighty among everything that one could be asked', async () => {
    const out: string[] = [];
    for (const origin of ['debt', 'kin', 'herbs', 'order', 'wanderer', 'map', 'lost', 'courier']) {
      const s = await DrawnWorld.start('a1', { origin, party: [{ name: 'Haze', raceId: 'human', classId: 'thief' }] },
        NodeBundleSource.shared);
      const c = s.campaign;
      // The origin's own topics of someone of the country (the road prologue's wagoner is the road's, not the reason).
      const own = c.module.actions.filter(a => /^origin__/.test(a.id) && a.speaker && !/^origin__/.test(a.speaker)
        && !/_again$/.test(a.id));
      for (const topic of own) {
        const w = c.world, speaker = topic.speaker!, at = w.one('at', speaker), here = w.one('at', 'party');
        if (!at || !here) { continue; }
        c.commitWorld(w.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', here) },
          { kind: 'assert', call: ModuleWriter.call('at', 'party', at) }]));
        const row = PlayerView.choices(c).find(r => r.choice.id === topic.id || r.action.schema === topic.id);
        if (!row) { continue; }
        if (!TalkWeight.of(c).has(row.choice.id)) { out.push(`${origin}: ${row.choice.name} (of ${speaker})`); }
      }
    }
    expect(out).toEqual([]);
  }, 300000);
});
