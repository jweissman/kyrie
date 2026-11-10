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
  it('takes a debtor from the shop to the inn, to the place told of there, through a fight to what is found, kept over a save',
    async () => {
      const p = await start('debt'), c = p.s.campaign;
      expect(await p.until(() => held(p, 'owing_out'), 10)).toBe(true);
      expect(p.log.join('\n')).toMatch(/says: Ask what is out in the country round/);
      // Things found there, in the pack (what was carried in, a torch burned, aside).
      const carried = () => p.glanced.screen.items.map(i => i.id), before = new Set(carried());
      const found = () => carried().filter(id => !before.has(id)).length;
      expect(await p.until(() => found() >= 2, 14)).toBe(true);
      expect(p.log.join('\n')).toMatch(/journey: arrived/);
      expect(c.history.some(e => e.combat.some(x => x.type === 'end'))).toBe(true);
      const restored = PlaySession.resume(JSON.parse(JSON.stringify(p.s.checkpoint())));
      expect(restored.campaign.world.one('at', 'party')).toBe(c.world.one('at', 'party'));
      expect(new HonestPlayer(restored).glanced.screen.items.map(i => i.id)).toEqual(carried());
      expect(new HonestPlayer(restored).aim()).toBe(p.aim());
    }, 240000);
});
