import { afterEach, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';

// The world's rules as an act wakes them (AX-10), held to a fresh oracle: the warrior's golden walk played with every
// rule asked and solved afresh in every pass (CampaignTick.afresh), and played as the game plays it, each rule passed
// over where what it reads is unwritten. At every line the same rules fire, in the same order, for the same bindings,
// with the same changes, and the world after it holds the same facts.
class Fired {
  static async walk(afresh: boolean): Promise<string[][]> {
    CampaignTick.afresh = afresh;
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), out: string[][] = [];
    let fired: string[] = [];
    CampaignTick.witness = (rule, changes) => { fired.push(`${rule}: ${changes.join(' ')}`); };
    for (const line of GoldenWalk.lines()) {
      fired = [];
      await AsMeant.ask(r, line);
      const { relations, measures } = journey.session.campaign.world.view;
      out.push([line, ...fired, Fired.facts(relations), measures.map(m => `${Fired.facts([m.call])}=${m.value}`).sort().join(' ')]);
    }
    return out;
  }
  private static facts(relations: readonly { name: string; args: readonly string[] }[]): string {
    return relations.map(f => `${f.name}(${f.args.join(',')})`).sort().join(' ');
  }
}
describe("the world's rules, woken by what an act wrote", () => {
  afterEach(() => { CampaignTick.afresh = false; CampaignTick.witness = undefined; });
  it('fire as a fresh pass over every rule fires them, at every line of the golden walk', async () => {
    const fresh = await Fired.walk(true), kept = await Fired.walk(false);
    expect(kept.length).toBe(GoldenWalk.lines().length);
    for (const [i, line] of kept.entries()) { expect({ i, line }).toEqual({ i, line: fresh[i]! }); }
    expect(kept.flat().filter(l => l.includes(': ')).length).toBeGreaterThan(50);
  }, 300000);
});
