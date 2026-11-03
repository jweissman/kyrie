import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';

// Under the town the company begins in, an adventure a step from its door: three ways down, each with a trouble and
// someone in the town who pays to be rid of it, the three joined below in an undercroft, and under that a vault found
// by searching it (the owner, 1 November: "we shouldn't have to explore to start an adventuring loop").
class Town {
  static async start() {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'kite', w.source);
  }
  static async take(s: PlaySession, ...steps: RegExp[]) {
    let said = '';
    for (const re of steps) {
      const c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
      if (!c) { throw new Error(`No ${re} at ${s.campaign.world.one('at', 'party')}`); }
      said = (await s.perform(c.choice.id)).response ?? '';
    }
    return said;
  }
}

describe('under the town the company begins in', () => {
  it('is posted on the green, and the rats under the corn-store are paid for once they are dealt with', async () => {
    const s = await Town.start(), c = s.campaign;
    // Nailed up on the green: read, the three troubles are aims, each saying who pays.
    await Town.take(s, /^Read the notice on the well-post/);
    expect(ScreenModel.build(c).objectives.join(' ')).toContain('Clear the rats out from under the old corn-store');
    expect(ScreenModel.build(c).objectives.join(' ')).toContain('will give fifteen coin');
    await Town.take(s, /^Take Falkor's door/, /^Ask .* about the rats/);
    await Town.take(s, /^Take Falkor's door/, /^Take the corn-store door/, /^Take the trapdoor/, /^Light a torch/,
      /^Take a hole gnawed/, /^Attack the rats/);
    expect(c.world.test(ModuleWriter.call('able', 'region__s1_u_rats'))).toBe(false);
    const before = ScreenModel.build(c).purse.coin;
    await Town.take(s, /^Take a hole gnawed/, /^Take the trapdoor/, /^Take the corn-store door/, /^Take Falkor's door/);
    expect(await Town.take(s, /^Tell .* it is done/)).toContain('counts out 10 coin');
    expect(ScreenModel.build(c).purse.coin).toBe(before + 10);
  }, 120000);
  it('joins its three ways down in an undercroft, under which only a search finds the stair to the sealed vault', async () => {
    const s = await Town.start(), c = s.campaign;
    const shown = () => PlayerView.choices(c).map(x => x.choice.name);
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_u_undercroft') },
      { kind: 'retract', call: ModuleWriter.call('at', 'region__s1_u_crawler', 'region__s1_u_drain') }]));
    expect(['the old drain', 'steps down behind the bone-heaps', 'a breach in the gallery floor']
      .every(way => shown().some(n => n.includes(way)))).toBe(true);
    expect(shown().some(n => /lettered flag/.test(n))).toBe(false);
    await Town.take(s, /^Light a torch/, /^Search the undercroft/);
    expect(shown().some(n => /stair under the lettered flag/.test(n))).toBe(true);
  }, 120000);
  // Below the vault, behind its keeper's chair, it goes on: the country's first dead under the town, three levels more,
  // more of them and more treasure than one company carries out at a go (the owner, 2 November).
  it('goes on below the vault, at least three levels more, with its own dead and treasure', async () => {
    const s = await Town.start(), m = s.campaign.module, W = s.campaign.world;
    expect(W.related('connects').some(r => r.args[1] === 'region__s1_u_vault' && r.args[2] === 'region__s1_ud')).toBe(true);
    const levels = m.entities.filter(e => e.space?.kind === 'level' && e.id.startsWith('region__s1_ud'));
    expect(levels.length).toBeGreaterThanOrEqual(3);
    const rooms = new Set(m.entities.filter(e => e.space?.kind === 'room' && e.id.startsWith('region__s1_ud')).map(e => e.id));
    const foes = m.entities.filter(e => e.type === 'group' && rooms.has(W.one('at', e.id) ?? ''));
    const goods = m.entities.filter(e => e.type === 'item' && rooms.has(W.one('at', e.id) ?? ''));
    expect(foes.length).toBeGreaterThanOrEqual(6);
    expect(goods.length).toBeGreaterThanOrEqual(8);
  }, 120000);
});
