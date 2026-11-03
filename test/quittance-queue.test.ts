import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

// The Queue (data/adventures/quittance/q_queue.kyr). The dead of the Burning stand on the slag stair; every way down
// but the First Flue passes them. Each way past is played here by the labels the page offers.
const to = (place: string) => `>quittance__${place}`;
// The cellar door is the Descent's: a picked lock, a shoulder, or a key (here, whichever the company has).
const door = [to('exchange_court'), '?^To the foot of the Exchange stair — (unlock|work|put your)'];
const arcade = [...City.honest, ...door, to('cellar_arcade')];
const hall = [...City.honest, ...door, to('queue_hall')];
type J = Awaited<ReturnType<typeof City.start>>;
const way = (j: J) => j.measure(Q('qu_way'), 'party');
const nerve = (j: J) => j.measure(Q('qu_nerve'), 'party');
const fairs = (j: J) => j.measure(Q('qu_fairs'), 'party');
const dead = (j: J) => j.measure(Q('qu_regard'), 'party');
const carries = (j: J, what: RegExp) => j.choices().some(c => /^Pack/.test(c.full) && what.test(c.full));
const offered = (j: J, what: RegExp) => j.choices().some(c => what.test(c.label));
const rich = { party: [{ name: 'Vane', raceId: 'human', classId: 'bard' }, { name: 'Ibb', raceId: 'human', classId: 'thief' },
  { name: 'Sorrel', raceId: 'human', classId: 'cleric' }] };
const thieves = { party: [{ name: 'Wick', raceId: 'human', classId: 'thief' }, { name: 'Tam', raceId: 'human', classId: 'warrior' },
  { name: 'Rook', raceId: 'human', classId: 'warrior' }] };
const plain = { party: [{ name: 'Orm', raceId: 'human', classId: 'warrior' }, { name: 'Pike', raceId: 'human', classId: 'warrior' },
  { name: 'Bas', raceId: 'human', classId: 'warrior' }] };

describe('The Queue', () => {
  it('stands across the slag stair until it is dealt with', async () => {
    const j = await City.start('queue-shut', plain);
    await j.play(...hall);
    expect(City.state(j, 'qu_line', 'closed')).toBe(true);
    expect(offered(j, /^Down to the Glass Street$/)).toBe(false);
    expect(City.has(j, 'queueOpen', 'party')).toBe(false);
  }, 120000);

  it('is let by for a penny a head, and Tench is never met', async () => {
    const j = await City.start('queue-penny', plain);
    await j.play(...hall);
    const gold = City.gold(j);
    await j.play('Lay three coin on the nearest claim');
    expect(City.gold(j)).toBe(gold - 3);
    expect(way(j)).toBe(1);
    expect(City.has(j, 'queueOpen', 'party')).toBe(true);
    expect(City.state(j, 'qu_line', 'open')).toBe(true);
    await j.play(to('glass_street'));
    expect(j.at('party')).toBe(Q('glass_street'));
    expect(nerve(j)).toBe(0);
    expect(City.knows(j, 'd_unpaid_ledger')).toBe(false);
  }, 120000);

  it('can be waited out on a numbered ticket by a company with a day to spare', async () => {
    const j = await City.start('queue-ticket', plain);
    await j.play(...hall, 'Take a numbered ticket');
    await j.play('=+100');
    expect(City.has(j, 'queueOpen', 'party')).toBe(false);
    await j.play('=+50');
    expect(City.has(j, 'queueOpen', 'party')).toBe(true);
    expect(way(j)).toBe(4);
    expect(City.state(j, 'qu_line', 'open')).toBe(true);
  }, 120000);

  it('can be pushed through, and the dead and the Fire remember it', async () => {
    const j = await City.start('queue-push', plain);
    await j.play(...hall, 'Put your shoulder to the Queue');
    expect(way(j)).toBe(5);
    expect(City.has(j, 'qu_pushed', 'party')).toBe(true);
    expect(City.has(j, 'qu_slighted_dead', 'party')).toBe(true);
    expect(City.has(j, 'qu_slighted_fire', 'party')).toBe(true);
    expect(City.state(j, 'qu_line', 'open')).toBe(true);
    await j.play(to('glass_street'), to('queue_hall'), "Ask Mrs Gorringe whether she holds");
    expect(City.said(j)).toContain('not now be able to say that the Phoenix');
    // Tench will have nothing to do with a company that went through his dead.
    await j.play(to('cellar_arcade'));
    expect(offered(j, /Ask Tench, gently/)).toBe(false);
    expect(offered(j, /call the roll aloud/)).toBe(false);
    await j.play('Ask Tench whether he will speak');
    expect(City.said(j)).toContain('They said sorry to you');
  }, 120000);

  it('has the office said over it by a cleric who knows what it waits for, and the dead go home', async () => {
    const j = await City.start('riteknown-a1', rich);
    await j.play(...hall, 'Ask Mrs Gorringe what');
    await j.play('Say the office for the dead over the Queue, and tell');
    expect(way(j)).toBe(3);
    expect(City.has(j, 'qu_released', 'party')).toBe(true);
    expect(dead(j)).toBe(1);
    expect(City.said(j)).toContain('Thank you');
    expect(offered(j, /Ask Mrs Gorringe/)).toBe(false);
    // The Creditor is not dead, and does not go.
    expect(offered(j, /Take the claim the Creditor holds out/)).toBe(true);
  }, 120000);

  it('has a blind office that does not take, and the dead hope it was the claim', async () => {
    const j = await City.start('riteblind-a2', rich);
    await j.play(...hall, 'not knowing what it is waiting for');
    expect(City.page(j)).toContain('Is it that?');
    expect(City.has(j, 'queueOpen', 'party')).toBe(false);
    await j.play('Lay three coin');
    expect(way(j)).toBe(1);
  }, 120000);

  it('is dealt with claim by claim, with Tench finding his feet, and the best document in the book at the end', async () => {
    const j = await City.start('tgently-a1', rich);
    await j.play(...arcade, 'Ask Tench, gently');
    expect(City.knows(j, 'd_unpaid_ledger')).toBe(true);
    // He will not, at first, be asked to do anything.
    expect(offered(j, /Let you carry the Ledger|carry the Ledger/)).toBe(false);
    await j.play('call the roll aloud');
    expect(nerve(j)).toBe(1);
    expect(City.page(j)).toContain('Present');
    await j.play('=+1', to('queue_hall'));
    expect(j.holds('at', Q('tench'), Q('queue_hall'))).toBe(true);
    // Mrs Gorringe: Tench settles it himself.
    await j.play('Ask Mrs Gorringe what she is claiming', "Ask Tench to settle Mrs Gorringe's claim");
    expect(nerve(j)).toBe(2);
    expect(fairs(j)).toBe(1);
    expect(City.page(j)).toContain('Lettice Gorringe, householder');
    // Ned, Fluellen and Crumpe: the company's own judgment.
    await j.play('Ask Ned about his boots', 'Pay a coin for the boots');
    expect(fairs(j)).toBe(2);
    await j.play('Ask Mr Fluellen what he is claiming', "Allow him the tenant's interest");
    expect(fairs(j)).toBe(3);
    expect(City.has(j, 'queueOpen', 'party')).toBe(false);
    await j.play('Ask Mr Crumpe what he is claiming', 'Tell Mr Crumpe he is not dead');
    expect(fairs(j)).toBe(4);
    await j.play('=+1');
    expect(City.has(j, 'queueOpen', 'party')).toBe(true);
    expect(way(j)).toBe(2);
    expect(City.state(j, 'qu_line', 'open')).toBe(true);
    expect(City.regard(j, 'sovereign')).toBe(1);
    expect(dead(j)).toBe(4);
    expect(j.holds('at', Q('qu_crumpe'), Q('cellar_arcade'))).toBe(true);
    // The fifth claim: the Fire files as a creditor, and is given a receipt.
    await j.play('Take the claim the Creditor holds out');
    expect(City.knows(j, 'd_tithe_debt')).toBe(true);
    await j.play('Write a receipt');
    expect(City.has(j, 'qu_fire_receipted', 'party')).toBe(true);
    expect(fairs(j)).toBe(5);
    // Tench in the chair, and the Ledger in the company's hands, and a witness for the Hall.
    await j.play('Ask Tench to let you carry the Ledger');
    expect(City.has(j, 'witness', 'tench')).toBe(true);
    expect(carries(j, /Ledger of the Unpaid/)).toBe(true);
    // And it is the same afterwards: down and back, and Tench is where he was left.
    await j.play(to('glass_street'), to('queue_hall'));
    expect(j.holds('at', Q('tench'), Q('queue_hall'))).toBe(true);
  }, 180000);

  it('spoils a claim that is settled badly, and is not opened by three good ones', async () => {
    const j = await City.start('queue-wrong', plain);
    await j.play(...hall, 'Ask Mrs Gorringe what she is claiming', 'Allow the claim in full: forty pounds');
    expect(City.said(j)).toContain('sideboard');
    await j.play('Ask Ned about his boots', 'Tell him a claim is no matter for a child');
    await j.play('Ask Mr Fluellen what he is claiming', "Allow him the tenant's interest");
    await j.play('Ask Mr Crumpe what he is claiming', 'Tell Mr Crumpe he is not dead');
    await j.play('Take the claim the Creditor holds out', 'Write a receipt');
    expect(fairs(j)).toBe(3);
    expect(City.has(j, 'qu_slighted_dead', 'party')).toBe(true);
    expect(City.has(j, 'qu_slighted_fire', 'party')).toBe(false);
    await j.play('=+1');
    expect(City.has(j, 'queueOpen', 'party')).toBe(false);
    // A spoiled claim is not offered again.
    expect(offered(j, /Enter her as the householder/)).toBe(false);
    await j.play('Lay three coin');
    expect(way(j)).toBe(1);
  }, 180000);

  it('has a Fire insulted by a penny, and the dead agree', async () => {
    const j = await City.start('queue-fire', plain);
    await j.play(...hall, 'Ask Mrs Gorringe what she is claiming', 'Take the claim the Creditor holds out', 'Offer a penny on the claim');
    expect(City.knows(j, 'd_tithe_debt')).toBe(true);
    expect(City.has(j, 'qu_slighted_fire', 'party')).toBe(true);
    expect(City.has(j, 'qu_fire_receipted', 'party')).toBe(false);
  }, 120000);

  it('shows a living man the stair, and he goes to ask Mr Cray what he is owed', async () => {
    const j = await City.start('queue-crumpe', plain);
    await j.play(...hall, 'Ask Mr Crumpe what he is claiming', 'Tell Mr Crumpe he is not dead');
    expect(j.holds('at', Q('qu_crumpe'), Q('cellar_arcade'))).toBe(true);
    expect(offered(j, /Ask Mr Crumpe/)).toBe(false);
  }, 120000);

  it('has its ledger lifted by a thin hand, and loses its witness for it', async () => {
    const j = await City.start('lift-a1', thieves);
    await j.play(...arcade, 'Lift the book out of Tench');
    expect(carries(j, /Ledger of the Unpaid/)).toBe(true);
    expect(City.has(j, 'qu_ledger_stolen', 'party')).toBe(true);
    expect(nerve(j)).toBe(0);
    expect(offered(j, /call the roll aloud/)).toBe(false);
    expect(City.has(j, 'witness', 'tench')).toBe(false);
  }, 120000);

  it('has a hand that is seen lifting the book, and a Tench who sits with his back to you', async () => {
    const j = await City.start('lift-a6', plain);
    await j.play(...arcade, 'Lift the book out of Tench');
    expect(carries(j, /Ledger of the Unpaid/)).toBe(false);
    expect(City.has(j, 'qu_hidden', 'party')).toBe(true);
    expect(offered(j, /Ask Tench, gently/)).toBe(false);
    // The dead will tell what he will not.
    await j.play(to('queue_hall'), 'Ask Mrs Gorringe what she is claiming');
    expect(City.knows(j, 'd_unpaid_ledger')).toBe(true);
  }, 120000);

  it('has a Tench who is not told gently enough, and shuts up', async () => {
    const j = await City.start('tgently-a2', rich);
    await j.play(...arcade, 'Ask Tench, gently');
    expect(City.knows(j, 'd_unpaid_ledger')).toBe(false);
    expect(City.has(j, 'qu_hidden', 'party')).toBe(true);
  }, 120000);

  it('is reached from Mortmain by the catacomb stair: a descendant, and the sexton\'s register', async () => {
    const j = await City.start('queue-mortmain', plain);
    await j.play(...City.honest, to('alms_room'), 'any of her people were in the Burning');
    expect(City.knows(j, 'qu_descendant')).toBe(true);
    await j.play(to('catacomb_head'), 'Ask the sexton about the stair', 'Promise Wragg you will carry', 'Ask Wragg to unlock the grating');
    await j.play(to('catacomb_foot'), to('queue_hall'));
    expect(j.at('party')).toBe(Q('queue_hall'));
    await j.play('Tell Mrs Gorringe that her great-granddaughter');
    expect(fairs(j)).toBe(1);
    await j.play(to('cellar_arcade'), "Give Tench the sexton's register");
    expect(City.has(j, 'qu_register_given', 'party')).toBe(true);
    await j.play('=+1');
    expect(nerve(j)).toBe(1);
    expect(j.holds('promiseKept', Q('an_wragg_promise'))).toBe(true);
    expect(City.regard(j, 'sovereign')).toBe(1);
  }, 180000);
});
