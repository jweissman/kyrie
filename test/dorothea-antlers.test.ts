import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Antlers: stacks, birds, a rope-ladder with a real danger, and a cresset the House's lease forbids anyone to
// light.
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const party = (j: Journey) => j.campaign.world.one('at', 'party');
const antlers = async (opts: { rope?: boolean } = {}) => {
  const j = await Journey.start(campaign, 's1');
  j.assert(k('seaQuiet'), k('hull'));
  await j.play('^To Tolleth quay');
  if (opts.rope) { await j.play('^Into Garrick', 'Buy .*rope', '^Out to'); }
  await j.play('Ask Captain Bascom for passage', 'Ask Captain Bascom where else', 'Ask Captain Bascom to put in at the Antlers',
    'Walk Fenwick Pelham', 'Pay Captain Bascom eight', "^To the Dorothea's waist", '=200', "^To the Antlers' ledge");
  return j;
};
const toFoot = (j: Journey) => j.play('^To the harvest hut', '^To the foot of the Great Stack');

describe('The Antlers', () => {
  it('has a Prentice who keeps the true book and tells the ranks, and an Agent who keeps another', async () => {
    const j = await antlers();
    await j.play('^To the harvest hut', 'Ask Wick Bligh to read you the day-book', 'Ask Wick Bligh who is above whom');
    expect(j.holds(k('leafAntlers'), 'party')).toBe(true);
    expect(j.holds(k('knowsRanks'), 'party')).toBe(true);
    expect(j.page).toContain('Book Two is this one');
  }, 300000);

  it('puts the rope ladder behind a real danger, with two safe ways round it: the hoist, and new lashings', async () => {
    const hoist = await antlers();
    await toFoot(hoist);
    expect(hoist.matches('^To the top of the Great Stack').length).toBe(0);
    await hoist.play('Ask Hob Sedge to take you up in the egg-basket', '^To the top of the Great Stack');
    expect(party(hoist)).toBe(k('stack_top'));
    const mended = await antlers({ rope: true });
    await toFoot(mended);
    await mended.play('Re-lash the rope ladder');
    expect(mended.holds(k('ladderSound'), 'party')).toBe(true);
    await mended.play('^To the top of the Great Stack');
    expect(party(mended)).toBe(k('stack_top'));
  }, 400000);

  it('lets the old ladder be climbed, at a cost: a fall when the rung gives, the top when the hands hold', async () => {
    const fall = await antlers();
    await toFoot(fall);
    fall.roll('fail');
    await fall.play('Climb the old rope ladder');
    fall.roll();
    expect(party(fall)).toBe(k('stack_foot'));
    const up = await antlers();
    await toFoot(up);
    up.roll('pass');
    await up.play('Climb the old rope ladder');
    up.roll();
    expect(party(up)).toBe(k('stack_top'));
    expect(up.page).toContain('CLAUSE 7');
  }, 400000);

  it('lights the cresset by paying the arrears (and the House\'s leave is bought)', async () => {
    const j = await antlers();
    await j.play('^To the harvest hut', 'Pay the Antlers. rent arrears');
    expect(j.holds(k('cressetFree'), 'party')).toBe(true);
    await j.play('^To the foot of the Great Stack', 'Ask Hob Sedge to take you up', '^To the top of the Great Stack', 'Light the Antlers. cresset');
    expect(j.holds(k('lampLit'), k('lamp_antlers'))).toBe(true);
    expect(j.measure(k('freed'), 'party')).toBe(1);
    expect(j.page).toContain('My father lit it');
  }, 400000);

  it('lets the ranger count the nests, and the Agent sign the release in his own name', async () => {
    const j = await antlers();
    await toFoot(j);
    await j.play('Ask Hob Sedge to take you up', '^To the top of the Great Stack');
    j.roll('pass');
    await j.play('Walk the stack top and count');
    j.roll();
    expect(j.holds(k('birdsCounted'), 'party')).toBe(true);
    await j.play('^To the foot of the Great Stack', '^To the harvest hut', 'Show Osric Deane the count');
    expect(j.holds(k('cressetFree'), 'party')).toBe(true);
    expect(j.holds(k('marked'), 'party')).toBe(false);
  }, 400000);

  it('lets the board be pulled off the post and the cresset lit, and the House then shuts its door at Port Ness', async () => {
    const j = await antlers();
    await toFoot(j);
    await j.play('Ask Hob Sedge to take you up', '^To the top of the Great Stack', 'Pull the House.s board', 'Light the Antlers. cresset');
    expect(j.holds(k('lampLit'), k('lamp_antlers'))).toBe(true);
    expect(j.holds(k('marked'), 'party')).toBe(true);
  }, 400000);
});
