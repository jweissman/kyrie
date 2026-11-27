import { afterEach, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { CampaignTick } from '../src/campaign/campaign-tick';
import type { World } from '../src/lang/index';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import { HonestPlayer } from './support/honest-player';
import { ContinuityCensus } from '../scripts/continuity-census';
import { readFileSync } from 'node:fs';

// The world's rules woken by what was written, held at every watch (OR-1438): the continuity census's walks (the
// warrior's golden walk, the mage's cold walk, and eighty steps of the page's lead) each played with every rule asked
// and solved afresh in every pass (CampaignTick.afresh: no rule held idle), and played as the game plays it, each rule
// held on what it reads of the one thing it asks of (Reads.keyed), and a pass reading only the names written since.
// After every watch's rules the world holds the same facts and measures both ways, and the same rules fired, in the
// same order, for the same bindings, with the same changes.
class Watched {
  static async walk(w: (typeof ContinuityCensus.walks)[number], afresh: boolean): Promise<string[]> {
    CampaignTick.afresh = afresh;
    const out: string[] = [];
    let fired: string[] = [];
    CampaignTick.witness = (rule, changes) => { fired.push(`${rule}: ${changes.join(' ')}`); };
    CampaignTick.ruled = (world: World) => { out.push([...fired, Watched.held(world)].join('\n')); fired = []; };
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args(w.as, w.lines ?? GoldenWalk.file)));
    const s = journey.session, r = new Runner(s), honest = new HonestPlayer(s);
    const lines = w.lines ? readFileSync(w.lines, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')) : [];
    for (const line of lines) { await AsMeant.ask(r, line); }
    for (let n = 0; n < (w.steps ?? 0) && await honest.step(); n++) { /* the page's lead, step by step */ }
    return out;
  }
  // What the world holds, facts and measures, in no order but their own.
  static held(world: World): string {
    const { relations, measures } = world.view;
    return [...relations.map(f => `${f.name}(${f.args.join(',')})`),
      ...measures.map(m => `${m.call.name}(${m.call.args.join(',')})=${m.value}`)].sort().join(' ');
  }
}
describe("the world's rules, woken by what was written, at every watch", () => {
  afterEach(() => { CampaignTick.afresh = false; CampaignTick.witness = undefined; CampaignTick.ruled = undefined; });
  for (const w of ContinuityCensus.walks) {
    it(`leave the world as a fresh pass over every rule does, on the ${w.name} walk`, async () => {
      const fresh = await Watched.walk(w, true), kept = await Watched.walk(w, false);
      expect(kept.length).toBe(fresh.length);
      expect(kept.length).toBeGreaterThan(50);
      for (const [i, watch] of kept.entries()) { expect({ i, watch }).toEqual({ i, watch: fresh[i]! }); }
    }, 600000);
  }
});
