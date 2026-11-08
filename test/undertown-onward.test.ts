import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { Undertakings } from '../src/presentation/undertakings';

// The owner, 8 November: a dungeon is more than one or two rooms. Under the first town the three jobs' ways meet in
// the undercroft and go on down through the vault into a deep site of several levels; each step is said as an aim,
// so a company that has finished a job is led on, not left at the end of it.
describe('the old ways under a town', () => {
  it('lead on from a job done to the undercroft, its floor, and the stair below the vault', async () => {
    const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'W', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kahitude', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(x: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
    const change = (...x: unknown[]) => held.commit(held.world.apply(x));
    const put = (p: string) => change({ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', p) });
    const aims = async () => { await s.perform('wait'); return Undertakings.held(c).map(o => o.id); };
    expect(await aims()).not.toContain('region__s1_u_onward_sought');
    change({ kind: 'assert', call: ModuleWriter.call('region__s1_u_done', 'region__s1_u_rats_job') });
    expect(await aims()).toContain('region__s1_u_onward_sought');
    put('region__s1_u_undercroft');
    expect(await aims()).toEqual(expect.arrayContaining(['region__s1_u_floor_sought']));
    change({ kind: 'retract', call: ModuleWriter.call('able', 'region__s1_u_keeper') });
    put('region__s1_u_vault');
    expect(await aims()).toContain('region__s1_ud_below');
  }, 120000);
});
