import { describe, expect, it } from 'bun:test';
import { Sennet, steps } from './support/sennet';

// What the second pass added to Sennet (doc/adventures/the-grand-tour/12-second-pass.md): the Sexton in the drowned
// belfry, which the bell keeps up; the Rector's memoirs in the Courant, whose printed lie is a witness; and the wrong
// answer to the fall, carried to the Watch.
const whelm = () => steps('outcomes', 'undertow').slice(0, steps('outcomes', 'undertow').indexOf('Tell the guards Ha\'penny') + 1);
describe('The Grand Tour, second pass', () => {
  it('the Sexton: up the tower at the wrong hour it kills; at the turn, while the bell rings, it lies still', async () => {
    const wrong = await Sennet.start(undefined, 'sennet', Sennet.one('warrior', 'laborer', 'human', 'Brann'));
    await wrong.play(...whelm(), '>sennet__belfry');
    expect(wrong.page).toContain('The Sexton comes at you');
    expect(wrong.holds('able', 'party')).toBe(false);
    const right = await Sennet.start(undefined, 'sennet', Sennet.one('warrior', 'laborer', 'human', 'Brann'));
    await right.play(...whelm(), '=day 1 17:55', '>sennet__belfry', '=day 1 18:05');
    expect(right.page).toContain('head under its tail');
    expect(right.holds('able', 'party')).toBe(true);
  }, 600000);

  it('the bell stopped for Bethan lets the Sexton down into Chandlers\' Row; rung again, it goes back up', async () => {
    const g = await Sennet.start();
    await g.play('>sennet__quay', 'Ask Old Bethan about the bell', '>sennet__fish_stairs', '=day 1 16:00', 'Talk to Ha\'penny',
      'Ask Ha\'penny about the bell', 'why the children ring the bell', 'Tell Ha\'penny about Old Bethan', 'Ask Ha\'penny to stop ringing',
      '=day 1 18:20');
    expect(g.at('sexton')).toBe('sennet__drowned_street');
    expect(g.page).toContain('listens to it not ringing');
    await g.play('=day 2 07:10', 'Ask Ha\'penny and the others to ring', '=day 2 18:20');
    expect(g.at('sexton')).toBe('sennet__belfry');
  }, 600000);

  it('told why the merfolk ring it, Old Bethan lets the bell ring, and sleeps', async () => {
    const g = await Sennet.start();
    await g.play('>sennet__quay', 'Ask Old Bethan about the bell', '>sennet__fish_stairs', '=day 1 16:00', 'Talk to Ha\'penny',
      'Ask Ha\'penny about the bell', 'why the children ring the bell', '>sennet__quay', 'why the merfolk ring the bell');
    expect(g.holds('bethanAtPeace', 'bethan')).toBe(true);
    expect(g.holds('bellStopped', 'sennet_bay')).toBe(false);
    expect(g.at('sexton')).toBe('sennet__belfry');
  }, 600000);

  it('fed Old Bethan\'s eels, the Sexton lets a company be in its belfry at any hour', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('warrior', 'laborer', 'human', 'Brann'));
    await g.play('>sennet__quay', 'Buy › A basket of live eels', ...whelm(), '=day 1 17:55', '>sennet__belfry', 'Tip Old Bethan',
      '=day 1 19:10');
    expect(g.holds('sextonFed', 'party')).toBe(true);
    expect(g.holds('able', 'party')).toBe(true);
  }, 600000);

  it('the Courant\'s chapter on the funeral morning, set beside the winch-gang\'s memory, makes the case', async () => {
    const g = await Sennet.start(undefined, 'sennet', Sennet.one('cleric', 'acolyte', 'human', 'Ama'));
    await g.play(...steps('outcomes', 'found_out').slice(0, 6), '=day 3 08:10', '>sennet__taproom', 'Wait › A while');
    expect(g.knows('thresholds_nine')).toBe(true);
    expect(g.knows('quance_pushed')).toBe(true);
    expect(g.page).toContain('One of them is lying in the Courant');
  }, 600000);

  it('the wrong answer: Aubrey\'s own story, carried to Bassett, puts him in the Watch-house, and pleases the Rector', async () => {
    const g = await Sennet.start();
    await g.play(...steps('tour', 'fire', 'fabian_earth', 'whelm'));
    const cg = steps('tour', 'cloudgate');
    await g.play(...cg.slice(0, cg.indexOf('a man who meant to say sorry')));
    await g.play('>sennet__landing_stage', 'Go down in the basket', '>sennet__glasshouse', 'Tell Sergeant Bassett that it was Aubrey', '=+8');
    expect(g.holds('aubreyTaken', 'aubrey')).toBe(true);
    expect(g.at('aubrey')).toBe('sennet__offstage');
    await g.play('>sennet__air_bell', 'his brother is in the Watch-house');
    expect(g.holds('perrinWantsUp', 'perrin')).toBe(true);
  }, 600000);
});
