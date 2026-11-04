import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { EntityIndex } from '../src/lang/entity-index';
import { Depth } from '../src/ui/depth';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

// How deep under the ground the company is, said at the head of the page (the owner, 4 November): as the undertown's
// author says, and below its sealed vault reckoned level by level from it.
describe('depth under the ground', () => {
  it('is said by the author, and reckoned below that level by level', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const c = (await PlaySession.start(w.path, 'kite', w.source)).campaign;
    const byId = EntityIndex.of(c.module.entities).byId, of = (id: string) => Depth.of(byId, c.world, id);
    expect(['region__s1_green', 'region__s1_u_store', 'region__s1_u_cellar', 'region__s1_u_nest', 'region__s1_u_vault']
      .map(of)).toEqual([undefined, undefined, 1, 2, 3]);
    // The levels under the vault: each a storey further down than the one above it.
    const levels = c.module.entities.filter(e => e.space?.kind === 'level' && e.id.startsWith('region__s1_ud'));
    const deepest = levels.map(l => c.module.entities.filter(e => e.space?.kind === 'room' && e.space.parent === l.id)
      .flatMap(r => of(r.id) ?? [])).map(ds => Math.min(...ds));
    expect(deepest).toEqual([4, 5, 6]);
  }, 120000);
  it('is written back as it was read', () => {
    const m = ModuleParser.parse('Module m "M" {\n  Place m_cellar "a cellar" is room underground 2 down.\n}\n');
    expect(m.entities[0]!.space?.depth).toBe(2);
    expect(ModuleWriter.write(m)).toContain('Place m_cellar "a cellar" is room underground 2 down.');
  });
});
