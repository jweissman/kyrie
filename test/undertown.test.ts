import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
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
  static async start(two = false) {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' },
        ...two ? [{ name: 'Brand', raceId: 'human', classId: 'cleric' }] : []] });
    return PlaySession.start(w.path, 'kite', w.source);
  }
  static async take(s: PlaySession, ...steps: RegExp[]) {
    let said = '';
    for (const re of steps) {
      const c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
      if (!c) { throw new Error(`No ${re} at ${s.campaign.world.one('at', 'party')}`); }
      said = (await s.leg(c.choice.id)).response ?? '';
    }
    return said;
  }
}

describe('under the town the company begins in', () => {
  // Each trouble is the job of whoever is troubled by it, whose key opens the way down; under it is the cause as well
  // as the trouble; and what is said on coming back names what was done, and is paid for in what a company going down
  // needs (the owner, 3 November: done without a word to anyone, "it is done", one fight, coin).
  // The buck is a fight a lone novice can lose (reckoned fair, and lost on this seed's dice): a company of two goes.
  it('is posted on the green; the rats are the merchant\'s, behind a locked door, and come up from a nest to be cleared', async () => {
    const s = await Town.start(true), c = s.campaign;
    await Town.take(s, /^Read the notice on the well-post/);
    const aims = () => ScreenModel.build(c).objectives.join(' ');
    expect(aims()).toContain('Ask Falkor, herb-wife at Falkor\'s herb-shop, about the rats in the corn-store at Newmeet: '
      + 'the corn-store is locked');
    // Locked until asked.
    expect(PlayerView.choices(c).some(x => /^Take the corn-store door/.test(x.choice.name))).toBe(false);
    await Town.take(s, /^Take Falkor's door/, /^Ask .* about the rats/);
    await Town.take(s, /^Take Falkor's door/, /^Take the corn-store door/, /^Take the trapdoor/, /^Light a torch/,
      /^Take a hole gnawed/, /^Attack the rats/);
    expect(c.world.test(ModuleWriter.call('able', 'region__s1_u_rats'))).toBe(false);
    // Their run goes down to their nest, and the old buck rat that keeps it (Mission 19: two rats had been the job).
    expect(aims()).toContain('Clear the rats\' nest');
    // Hurt from the brood, the company rests before it goes down to the buck, as a player would.
    await Town.take(s, /^Take a hole gnawed/, /^Take the trapdoor/, /^Rest and recover/, /^Take the trapdoor/,
      /^Take a hole gnawed/, /^Take the rats' run down/, /^Attack the old buck rat/);
    expect(c.world.test(ModuleWriter.call('able', 'region__s1_u_buck'))).toBe(false);
    const before = ScreenModel.build(c).purse.coin;
    await Town.take(s, /^Take the rats' run down/, /^Take a hole gnawed/, /^Take the trapdoor/,
      /^Take the corn-store door/, /^Take Falkor's door/);
    expect(await Town.take(s, /^Tell Falkor the rats under the corn-store are dead, nest and all/))
      .toContain('a lantern and two flasks of oil');
    expect(ScreenModel.build(c).purse.coin).toBe(before + 10);
    const kit = c.readout.creatures[0]!.state.inventory!.map(i => i.definition);
    expect([kit.filter(k => k === 'lantern').length, kit.filter(k => k === 'lamp_oil').length]).toEqual([1, 2]);
  }, 120000);
  it('has the dead raised by someone, found out by the opened graves and the chalk, and laid by the candle', async () => {
    const s = await Town.start(), c = s.campaign;
    await Town.take(s, /^Take the shrine porch/, /^Ask .* about the noises/, /^Take the shrine porch/,
      /^Take the lych-gate/);
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__s1_u_dead_robbed'))).toBe(true);
    await Town.take(s, /^Take the stone stair/, /^Light a torch/, /^Take an arch stacked/);
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__s1_u_dead_raised'))).toBe(true);
    // His dead stand by while he does; he fought and fallen, they would turn on the living, and the candle lays them.
    await Town.take(s, /^Attack the man with the black candle/);
    await Town.take(s, /^Pinch out the black candle/);
    const aims = ScreenModel.build(c).objectives.join(' ');
    expect(aims).toMatch(/Tell Carmine at .* that the dead are laid, and who raised them/);
    await Town.take(s, /^Take an arch stacked/, /^Take the stone stair/, /^Take the lych-gate/,
      /^Take the shrine porch/);
    expect(await Town.take(s, /^Tell Carmine the dead under the churchyard are laid, and who raised them/))
      .toContain('a charm of ashwood');
    const kit = c.readout.creatures[0]!.state.inventory!.map(i => i.definition);
    expect([kit.includes('ashwood_charm'), kit.filter(k => k === 'minor_healing_potion').length]).toEqual([true, 2]);
  }, 120000);
  // The Hobb boy saw "a big one at the back": she is there, over her eggs, and they are not burned while she lives
  // (Mission 19: the eggs had hung alone, and nothing the boy saw was there to fight).
  it('has the spiders\' mother over her eggs behind the gallery, who must be dealt with before they burn', async () => {
    const s = await Town.start(), c = s.campaign;
    expect([c.world.one('at', 'region__s1_u_mother'), c.world.one('at', 'region__s1_u_eggs')])
      .toEqual(['region__s1_u_brood', 'region__s1_u_brood']);
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_u_brood') }]));
    await Town.take(s, /^Light a torch/);
    expect(PlayerView.choices(c).some(x => /^Burn the egg-sacs/.test(x.choice.name))).toBe(false);
    expect(ScreenModel.build(c).observed.map(o => o.text).join(' ')).toContain('will not let you near');
  }, 120000);
  // Heard of at the inn, what lies under the vault is an aim before the way to it is known; the next thing to find is
  // said, and where, and the aim's places reach up to the churchyard (the product-design review's PD-03).
  it('says, of what lies below the vault, where the way down is before it is found', async () => {
    const s = await Town.start(), c = s.campaign;
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__s1_ud_story') }]));
    const screen = ScreenModel.build(c), way = screen.aims?.find(a => a.id === 'region__s1_ud_way');
    expect(way?.text).toMatch(/^The way down to .+ is under Newmeet: below a sealed vault, found from the undercroft/);
    expect(way?.places).toEqual(expect.arrayContaining(['region__s1_u_crypt', 'region__s1_u_yard']));
    expect(screen.objectives.join(' ')).toMatch(/up out of .+, from the king's bier|up out of /);
  }, 120000);
  // The flag is a puzzle (the owner, 8 November): forced, or opened by the letters cut small in the ways down to it.
  it('joins its three ways down in an undercroft, whose lettered flag opens to the letters found below', async () => {
    const s = await Town.start(), c = s.campaign;
    const shown = () => PlayerView.choices(c).map(x => x.choice.name);
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__s1_u_undercroft') },
      { kind: 'retract', call: ModuleWriter.call('at', 'region__s1_u_crawler', 'region__s1_u_drain') }]));
    expect(['the old drain', 'steps down behind the bone-heaps', 'a breach in the gallery floor']
      .every(way => shown().some(n => n.includes(way)))).toBe(true);
    expect(shown().some(n => /stair under the lettered flag/.test(n))).toBe(false);
    expect(shown().some(n => /^Lever the lettered flag/.test(n))).toBe(true);
    expect(shown().some(n => /^Press the three/.test(n))).toBe(false);
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__s1_u_letters') }]));
    await Town.take(s, /^Light a torch/, /^Press the three/);
    expect(shown().some(n => /stair under the lettered flag/.test(n))).toBe(true);
    // One place under the town (M19-40): from the rats' run, by the drain, the undercroft and the steps up behind
    // the bone-heaps, into the crypt.
    expect(Journey.way(c.world, 'region__s1_u_warren', 'region__s1_u_crypt').map(([, to]) => to))
      .toEqual(expect.arrayContaining(['region__s1_u_drain', 'region__s1_u_undercroft', 'region__s1_u_ossuary']));
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
