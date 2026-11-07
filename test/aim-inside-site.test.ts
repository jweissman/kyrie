import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Undertakings } from '../src/presentation/undertakings';
import { Glanced } from './support/glanced';

// The fresh playtest of 7 November: in the crypt under the lone tower, following "Something is wrong at Lapisspira"
// (the heath the tower stands on), the page's aim was "Lapisspira — Go out", by the postern. An aim at the place a
// site stands at is, inside the site, an aim at the site: no way out to that place is your aim's, nor led with.
describe('an aim at the place a site stands at', () => {
  it('points no way out of the site once the company is inside it', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'cleric' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), g = Glanced.of(s), c = s.campaign;
    const held = c as unknown as { world: { apply(c: Change[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    const put = (place: string) => held.commit(held.world.apply([
      { kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) },
      { kind: 'retract', call: ModuleWriter.call('unlit', place) }]));
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'tower__lights') }]));
    Undertakings.follow(c, 'tower__rumoured');
    put('tower__crypt');
    await g.perform('wait');
    const out = g.screen.exits.find(e => e.destination.id === 'region__w9')!;
    expect(out.id).toBeDefined();
    expect(g.glance.aimed).not.toContain(out.id);
    expect(g.glance.acts.map(a => a.choice)).not.toContain(out.id);
  }, 120000);
});
