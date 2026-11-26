import type { Campaign } from '../../src/campaign/campaign';
import { EntityIndex, ModuleWriter } from '../../src/lang/index';

// The company told of every town of its country, as the milestones on its roads tell them (RegionRoads.unnamed): for a
// spec whose matter is the journeys between towns, not how the company comes to hear of them. Since the map draws what
// the company knows (OR-810), a fresh life is offered no town it has not been to or heard of; told of each, the map and
// its journeys hold them all, as the country's map had before.
export class Heard {
  static towns(c: Campaign, actor = c.playerActor ?? 'party'): void {
    const w = c.world, byId = EntityIndex.of(c.module.entities).byId;
    if (!w.relates('leadsTo')) { return; }
    const facts = [...new Set(w.related('leadsTo')
      .filter(r => byId.get(r.args[1]!)?.space?.kind === 'settlement').map(r => r.args[0]!))];
    c.commitWorld(w.apply(facts.map(f => ({ kind: 'assert' as const, call: ModuleWriter.call('knows', actor, f) }))));
  }
}
