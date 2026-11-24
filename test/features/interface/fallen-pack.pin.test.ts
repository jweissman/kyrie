import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../src/session/play-session';
import { CreatureStore } from '../../../src/creature-store';
import { Runner } from '../../../src/cli/runner';
import { RunnerOffer } from '../../../src/cli/runner-offer';
import { ScreenModel } from '../../../src/ui/screen-model';
import { ChoiceList } from '../../../src/ui/choice-list';
import { Doable } from '../../../src/presentation/doable';
import { GeneratedWorld } from '../../support/generated';

// A fallen companion's things are taken from the pack, under each thing in their keeping, beside what is given or set
// down there (OR-381, CL-67's fold): the scene keeps its few rows. Fourteen "Take a candle from Elen for Bran" had
// stood among the waits of the time lens, one for each thing and each who could take it.
describe('a fallen companion\'s pack', () => {
  it('is taken from in the pack, not the scene, for every client', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(s.campaign.state.partyIds);
    try {
      lease.creatures[0]!.state.hp = 0;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    GeneratedWorld.put(s, `${w.report.region.settlements.find(t => t.size === 'town')!.id}_shrine`);
    const r = new Runner(s), said = await r.ask('{"act":"wait"}');
    if ('error' in said) { throw new Error(said.error); }
    const take = /^take_from\(/;
    // The scene: none among its rows, nor in any lens but the company's gear.
    const screen = ScreenModel.build(s.campaign), g = r.leaf!.glance!;
    expect(Doable.flat(Doable.of(g, screen)).filter(x => take.test(x.does ?? '') && x.lens)).toEqual([]);
    expect(Object.values(g.lenses).flatMap(l => [...l.promoted, ...l.rest]).filter(a => take.test(a.command ?? '')))
      .toEqual([]);
    const lenses = said.offer.lenses ?? {};
    for (const [k, os] of Object.entries(lenses)) {
      if (k !== 'gear') { expect(RunnerOffer.flat(os).filter(o => take.test(o.does ?? ''))).toEqual([]); }
    }
    // The pack: under each thing Elen carries, who can take it.
    const elen = ChoiceList.pack(screen).find(x => x.title === 'Elen carries')!;
    const rope = elen.choices.find(c => c.label === 'A coil of rope')!;
    expect(rope.children?.map(c => c.label)).toEqual(['Take for Bran', 'Take for Dori']);
    const done = await r.ask(JSON.stringify({ act: rope.children![0]!.command }));
    expect('error' in done ? done.error : done.scene.prose.join(' ')).toContain('Bran takes a coil of rope from Elen');
  }, 120000);
});
