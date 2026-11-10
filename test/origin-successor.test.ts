import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { CreatureStore } from '../src/creature-store';
import type { World } from '../src/lang/world';
import { RegionRumours } from '../src/world/region-rumours';

// An origin's ending leaves a successor (the play-structure investigation's PT-01: a resolution had ended in "Nothing
// more is asked of you"). The drover's child is pointed on by the oxen's trail (test/oxen.test.ts); the debtor, square,
// is told by the merchant of the makers' work nearest the town, and has it for an aim and a journey; the order's
// copyist, having both who the makers were and how they ended, has it put together where their greatest work lies.
// a1, Wenna the warrior.
class Ended {
  static async start(origin: string) {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { w, s: await PlaySession.start(w.path, 'a1', w.source) };
  }
  static async purse(s: PlaySession, gold: number) {
    const lease = (s.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(s.campaign.state.partyIds);
    try { lease.creatures[0]!.state.gold = gold; lease.commit(lease.creatures); } finally { lease.release(); }
    await s.leg('wait');
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No choice like ${pattern}`); }
    return s.leg(c.choice.id);
  }
  static knows(s: PlaySession, fact: string) { return s.campaign.world.test(ModuleWriter.call('knows', 'party', fact)); }
}

describe('an origin\'s ending', () => {
  it('square with the merchant, points on to the makers\' work nearest the town', async () => {
    const { w, s } = await Ended.start('debt');
    await Ended.purse(s, 60);
    const paid = await Ended.take(s, /^Pay .* what you owe$/);
    // The nearest work but the one the inn tells of first, where the debt has sent the company already (Mission 20:
    // paid, Tuck had pointed back to the place just come back from).
    const said = /If you want work, and have the stomach for it: (.+?), out in /.exec(paid.response ?? '')?.[1];
    const keep = w.report.region.sites.find(x => x.name === said)!;
    const town = w.report.region.settlements.find(t => t.size === 'town') ?? w.report.region.settlements[0]!;
    const first = RegionRumours.nearest(w.report.region, town, RegionRumours.told(w.report.region))[0]?.site;
    expect([!!keep?.work, keep === first]).toEqual([true, false]);
    expect([Ended.knows(s, `region__${keep.id}_named`), Ended.knows(s, `region__${keep.id}_found`)]).toEqual([true, true]);
    // And the notes have it from the merchant, as said, not as known before the company set out (NAR-12).
    const note = PlayerView.observe(s.campaign).knowledge.find(k => k.id === `region__${keep.id}_named`)!;
    expect([note.source, note.from]).toEqual(['heard', 'Mik, salter']);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.objectives).toContainEqual(expect.stringContaining(keep.name));
    expect(screen.destinations?.map(d => d.name)).toContain(keep.name);
  }, 120000);
  it('with the makers\' story whole, has where their greatest work lies', async () => {
    const { w, s } = await Ended.start('order');
    const great = w.report.region.sites.find(x => x.work?.great)!, art = w.report.region.history!.makers[0]!.art;
    const c = s.campaign as unknown as { world: World; commit(w: World): void };
    c.commit(c.world.apply([`history_${art}`, `history_${art}_fate`].map(f =>
      ({ kind: 'assert' as const, call: ModuleWriter.call('knows', 'party', `region__${f}`) }))));
    await s.leg('wait');
    expect(Ended.knows(s, `region__${great.id}_found`)).toBe(true);
  }, 120000);
});
