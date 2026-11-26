import { afterEach, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import { AutoplayRun } from '../src/autoplay/run';

// The world's rules as an act wakes them (AX-10), held to a fresh oracle: the warrior's golden walk played with every
// rule asked and solved afresh in every pass (CampaignTick.afresh), and played as the game plays it, each rule passed
// over where what it reads is unwritten. At every line the same rules fire, in the same order, for the same bindings,
// with the same changes, and the world after it holds the same facts. And over two seeded worlds the automated player
// plays, the same steps are taken and the same rules fire.
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
  // A seeded world played by the automated player, its steps and every rule that fired.
  static async seeded(seed: string, afresh: boolean): Promise<string[]> {
    CampaignTick.afresh = afresh;
    const fired: string[] = [];
    CampaignTick.witness = (rule, changes) => { fired.push(`${rule}: ${changes.join(' ')}`); };
    const r = await AutoplayRun.run({ seed, origin: 'wanderer', policy: 'mixed', steps: 30,
      protagonist: { name: 'Wenna', raceId: 'dwarf', classId: 'cleric' } });
    return [String(r.failure), ...r.steps.map(s => JSON.stringify(s)), ...fired];
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
  it('fire as a fresh pass fires them over seeded worlds played by the automated player', async () => {
    for (const seed of ['a1', 'b2']) {
      const fresh = await Fired.seeded(seed, true), kept = await Fired.seeded(seed, false);
      expect(kept).toEqual(fresh);
      expect(kept.length).toBeGreaterThan(30);
    }
  }, 300000);
});
