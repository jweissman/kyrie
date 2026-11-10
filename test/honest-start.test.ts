import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Undertakings } from '../src/presentation/undertakings';
import { HonestPlayer } from './support/honest-player';

// The opening, played as a player who knows only what the page shows (see HonestPlayer), from the normal start of a
// fixed world by an ordinary character: the reviews of 9 November asked for one honest-start journey that proves the
// next thing to do can be found, not only done. Each step is the page's lead; nothing is put, taught or chosen by id.
const start = async (origin: string) => {
  const w = await WorldAssembler.assemble('kahitude', NodeBundleSource.shared, { origin,
    party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
  return new HonestPlayer(await PlaySession.start(w.path, 'kahitude', w.source));
};
const held = (p: HonestPlayer, id: string) => Undertakings.held(p.s.campaign).some(o => o.id.endsWith(id));
describe('the opening, as the page leads it', () => {
  it('takes a son home to his father’s fate: the ruts found, the brother and the mother told, the aim done', async () => {
    const p = await start('kin');
    expect(await p.until(() => held(p, 'tell_kin'), 12)).toBe(true);
    expect(await p.until(() => !held(p, 'tell_kin'), 16)).toBe(true);
    expect(p.log.join('\n')).toMatch(/says: Tell your mother what you found/);
  }, 180000);
  it('takes a debtor from the shop to the inn, and out to the place told of there, kept over a save', async () => {
    const p = await start('debt'), c = p.s.campaign;
    expect(await p.until(() => held(p, 'owing_out'), 10)).toBe(true);
    expect(p.log.join('\n')).toMatch(/says: Ask what is out in the country round/);
    // Out by the map's journey to the nearest place told of, and there.
    expect(await p.until(() => /journey: arrived/.test(p.log.join('\n')), 4)).toBe(true);
    const restored = PlaySession.resume(JSON.parse(JSON.stringify(p.s.checkpoint())));
    expect(restored.campaign.world.one('at', 'party')).toBe(c.world.one('at', 'party'));
    expect(new HonestPlayer(restored).aim()).toBe(p.aim());
  }, 240000);
  // Its errand done, the son goes about the town as the page leads, and is led down under it: a fight won and
  // something found there, by the page's leads alone.
  it('leads a son with his errand done down under the town, to a fight won and something found', async () => {
    const p = await start('kin'), c = p.s.campaign;
    expect(await p.until(() => held(p, 'tell_kin'), 12)).toBe(true);
    expect(await p.until(() => !held(p, 'tell_kin'), 16)).toBe(true);
    const carried = () => p.glanced.screen.items.map(i => i.id), before = new Set(carried());
    // A fight the company's side won (its side is the fighters).
    const won = () => c.history.some(e => e.combat.some(x => x.type === 'end' && 'outcome' in x
      && x.outcome === 'fighters'));
    expect(await p.until(() => won() && carried().some(id => !before.has(id)), 50)).toBe(true);
    expect(p.s.campaign.world.one('at', 'party')).toMatch(/_u_|_ud/);
    // With no aim of its own, led back to the notice of the town's jobs and to whoever gives one (M19-234).
    expect(p.log.join('\n')).toMatch(/the notice on the well-post/);
  }, 300000);
});
