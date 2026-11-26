import { afterEach, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import { AutoplayRun } from '../src/autoplay/run';
import { ReachTool } from '../src/cli/reach-tool';

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
  // An adventure's reach walk, as `kyrie verify` walks it: what it reached and every rule that fired. Played once
  // before, unwatched: a campaign's first start in a process settles the world its later starts begin from (its
  // ways opened at the start fire once, then not again), so each walk compared is a later one.
  static async reached(campaign: string, afresh: boolean): Promise<string[]> {
    CampaignTick.afresh = afresh;
    const fired: string[] = [];
    CampaignTick.witness = (rule, changes) => { fired.push(`${rule}: ${changes.join(' ')}`); };
    const { reach } = await ReachTool.run(`data/campaigns/${campaign}.campaign.json`, 'verify', 120);
    return [JSON.stringify(reach), ...fired];
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
  // Wellspring's walk had stopped at its first step for a rule that reads nothing (OR-722) where the golden walk and
  // the seeded worlds never met one. All 36 campaigns' walks were held the same so on 25 November; these four here.
  it('fire as a fresh pass fires them over the reach walks verify takes of adventures', async () => {
    for (const campaign of ['the-lull', 'hessel', 'windfall', 'goingbank']) {
      await Fired.reached(campaign, true);
      const fresh = await Fired.reached(campaign, true), kept = await Fired.reached(campaign, false);
      expect({ campaign, kept }).toEqual({ campaign, kept: fresh });
      expect([campaign, kept.length > 50]).toEqual([campaign, true]);
    }
  }, 300000);
});
