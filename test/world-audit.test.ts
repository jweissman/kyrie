import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { WorldAudit } from '../src/world/world-audit';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlacedSites } from '../src/world/placed-sites';

// Every story in a generated world can be found and finished: its places walked to, what its people want got
// somewhere, its word heard from someone reachable, every site set apart for one (a kit's hold, a makers' work) told
// of where it belongs and an aim once known, its ending something the world can bring about. Read off the world, for
// many seeds; and a world with a story that cannot be finished is caught (a fever with no herbs anywhere; a hold no
// word leads to, as the hobs' was until their hook was read).
class Audited {
  static async world(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const composed = (await ModuleBundle.campaign(w.path, w.source, seed)).composition;
    return { w, s: await PlaySession.start(w.path, seed, w.source), sites: PlacedSites.of(w.report, composed) };
  }
  static retract(s: PlaySession, name: string, last: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const rows = s.campaign.world.related(name).filter(r => r.args.at(-1) === last);
    c.commit(c.world.apply(rows.map(r => ({ kind: 'retract', call: ModuleWriter.call(name, ...r.args) }))));
  }
}

describe('a generated world\'s stories', () => {
  it.each(['thorn', 'a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'i9'])('can all be found and finished in %s', async seed => {
    const { w, s, sites } = await Audited.world(seed);
    expect(sites.length).toBeGreaterThan(0);
    expect(WorldAudit.audit(s.campaign, w.report.placements, sites)).toEqual([]);
  }, 60000);
  it('catches one that cannot: a fever when there are no herbs to be had anywhere', async () => {
    const { w, s } = await Audited.world('thorn');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const herbs = s.campaign.world.related('itemKind').filter(r => ['herbs', 'willow_bark', 'feverwort'].includes(r.args[1]!));
    c.commit(c.world.apply(herbs.map(r => ({ kind: 'retract', call: ModuleWriter.call('itemKind', ...r.args) }))));
    expect(WorldAudit.audit(s.campaign, w.report.placements)).toEqual([expect.objectContaining({ kind: 'resource',
      subject: 'fever__mother' })]);
  }, 60000);
  it('catches a hold no word leads to: the hobs\' at Gaudumport in kite, the hall they hold out in', async () => {
    const { w, s, sites } = await Audited.world('kite');
    expect(sites).toContainEqual(expect.objectContaining({ subject: 'raiders.approach', place: 'region__w1' }));
    Audited.retract(s, 'leadsTo', 'region__w1');
    expect(WorldAudit.audit(s.campaign, w.report.placements, sites)).toEqual([
      { kind: 'clue', subject: 'raiders.approach', text: 'nothing leads to it' },
      { kind: 'clue', subject: 'work:w1', text: 'nothing leads to it' }]);
  }, 60000);
});
