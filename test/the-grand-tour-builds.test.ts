import { describe, expect, it } from 'bun:test';
import { Sennet } from './support/sennet';

// What a calling or a background opens in Sennet that the bard's Tour does not use (doc/adventures/the-grand-tour/
// 06-builds.md). The larger differences are whole routes, played in the-grand-tour-outcomes: a labourer-warrior's
// Undertow, an acolyte's Found Out, a burglar's Letter. These are the smaller doors.
describe('The Grand Tour, by calling and background', () => {
  it('a monk climbs the anchor chain, two hours, and comes up into Cloudgate without a coin to the winch-gang', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('monk', 'miner', 'human', 'Ines'));
    const purse = g.gold();
    await g.play('>sennet__ascent_yard', '>sennet__landing_stage');
    expect(g.at('party')).toBe('sennet__landing_stage');
    expect(g.gold()).toBe(purse);
    expect(g.watch).toBeGreaterThanOrEqual(12);
  }, 300000);

  it('a bard cannot climb it: the chain is not a way for one without the skill', async () => {
    const g = await Sennet.start();
    await expect(g.play('>sennet__ascent_yard', '>sennet__landing_stage')).rejects.toThrow();
  }, 300000);

  it('a sailor greets the Whelm\'s guards as the fishermen do, and is breathed on, and let in', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('warrior', 'sailor', 'human', 'Ned'));
    await g.play('>sennet__fish_stairs', 'Talk to Ha\'penny', 'what is up the stairs', 'Lift Ha\'penny', '>sennet__glasshouse',
      'Let Ha\'penny choose', 'why Mercy needs', 'Take Ha\'penny back', '=day 1 16:00', 'Ask Ha\'penny for some of her breath',
      '>sennet__drowned_street', 'Touch your forehead');
    expect(g.holds('admitted', 'party')).toBe(true);
  }, 300000);
});
