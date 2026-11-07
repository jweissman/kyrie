import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';

// The Lamp Below (doc/imbar/17-the-ring.md, section 5): the lamp-engine under the Pharos, reached through a trap in the
// oil store that stays shut while the ring's Principal stands, and opens when he has fallen (routed or dead: canonical
// relations on the entity the herald binds; here, in the standalone campaign, a local stand-in for it).
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const start = async () => {
  const j = await Journey.start(campaign, 's1');
  j.put('party', k('pharos_foot'));
  return j;
};
const seen = (j: Journey) => PlayerView.observe(j.campaign).observations.map(o => o.text).join(' ');
const s2 = (j: Journey) => j.play('^Examine › Look|^Wait › A while');
const fall = async (j: Journey) => {
  j.assert('routed', 'ring_head');
  await j.play('^Wait › A while');
};
const descend = async (j: Journey) => {
  await fall(j);
  await j.play('^Into the oil store|oil store', 'Into the Lamp Below');
};

describe('the Lamp Below', () => {
  it('is shut while the ring stands and open when its Principal has fallen', async () => {
    const j = await start();
    await j.play('oil store');
    expect(j.holds(k('ringFallen'), 'party')).toBe(false);
    expect(j.matches('Into the Lamp Below').length).toBe(0);
    expect(j.page).toContain('House padlock');
    // Waiting does not open it, nor does anything but the fall.
    await j.play('^Wait › An hour');
    expect(j.matches('Into the Lamp Below').length).toBe(0);
    expect(j.at(k('lb_head'))).toBeUndefined();
    await fall(j);
    expect(j.holds(k('ringFallen'), 'party')).toBe(true);
    expect(j.matches('Into the Lamp Below').length).toBe(1);
    expect(j.page).toContain('drops into the dust like a dead bird');
    await j.play('Into the Lamp Below');
    expect(j.at('party')).toBe(k('lb_head'));
  }, 300000);

  it('is open too if the Principal is dead and not merely routed', async () => {
    const j = await start();
    j.assert('dead', 'ring_head');
    await j.play('oil store', '^Wait › A while');
    expect(j.holds(k('ringFallen'), 'party')).toBe(true);
    expect(j.matches('Into the Lamp Below').length).toBe(1);
  }, 300000);

  it('lets a company through the keepers\' gate by the rubbing, and across the wheel-floor by the lines', async () => {
    const j = await start();
    await descend(j);
    await j.play('black stair', "To the keepers' gate");
    expect(j.matches("Set the gate's numerals").length).toBe(0);
    j.give('pharos_rubbing');
    await j.play("Set the gate's numerals", 'To the ledge over the wheel-floor');
    expect(j.matches('far side of the wheel-floor').length).toBe(0);
    await j.play('Cross on the lines', 'To the far side of the wheel-floor');
    expect(j.holds(k('crossed'), 'party')).toBe(true);
  }, 300000);

  it('has a quiet way in for the thief and a loud one for the bar, and the bar is paid for', async () => {
    const j = await start();
    await descend(j);
    await j.play('black stair', "To the keepers' gate");
    expect(j.page).toContain('Two locks');
    j.roll('pass');
    await j.play("Take the gate's tumbler");
    expect(j.holds(k('stirred'), 'party')).toBe(false);
    const loud = await start();
    await descend(loud);
    await loud.play('black stair', "To the keepers' gate");
    loud.roll('pass');
    await loud.play("Break the gate's lock");
    expect(loud.holds(k('stirred'), 'party')).toBe(true);
    expect(loud.page).toContain('faster');
  }, 300000);

  it('can be crossed by the brake, at a price the island pays: the Pharos goes out', async () => {
    const j = await start();
    await descend(j);
    await j.play('black stair', "To the keepers' gate");
    j.roll('pass');
    await j.play("Take the gate's tumbler", 'To the ledge over the wheel-floor', 'Ease the keepers. brake');
    expect(j.holds(k('brakeThrown'), 'party')).toBe(true);
    await j.play('To the far side of the wheel-floor');
    expect(j.holds(k('crossed'), 'party')).toBe(true);
    j.put('party', k('pharos_lamp'));
    expect(seen(j)).toContain('has nothing to throw');
  }, 300000);

  it('lets a mage cipher the wheels and a lone company slip the gate by the tally-crawl', async () => {
    const m = await Journey.start('test/fixtures/ring/learned.campaign.json', 's1');
    m.put('party', k('lb_ledge'));
    await m.play('Read the wheel-floor.s numbers');
    expect(m.holds(k('crossed'), 'party')).toBe(true);
    const lone = await Journey.start('test/fixtures/ring/lone.campaign.json', 's1');
    lone.put('party', k('lb_gate'));
    expect(lone.matches('tally-crawl').length).toBe(1);
    await lone.play('tally-crawl');
    expect(lone.at('party')).toBe(k('lb_crawl'));
    const company = await start();
    company.put('party', k('lb_gate'));
    expect(company.matches('tally-crawl').length).toBe(0);
  }, 300000);

  it('teaches the word from Oswin Tarn, and the Governor lies down at it', async () => {
    const j = await start();
    j.put('party', k('lb_gallery'));
    await j.play('Ask Oswin Tarn about the Governor', 'Promise Oswin Tarn');
    expect(j.holds('knows', 'party', k('lb_stopword'))).toBe(true);
    j.put('party', k('lb_well'));
    await j.play('Say the keepers. word');
    expect(j.holds('tolerates', k('governor'), 'party')).toBe(true);
    await j.play('Take the engine-keeper.s gauge');
    expect(j.holds(k('lbDone'), 'party')).toBe(true);
    expect(seen(j)).toContain('the Aeneans\' claim');
  }, 300000);

  it('has a second way past the Governor: a keg of the Pharos\'s oil, poured into the pilot', async () => {
    const j = await start();
    j.give('dorothea_oil_keg');
    j.put('party', k('lb_well'));
    await j.play('Pour a keg of the Pharos');
    expect(j.holds(k('pilotLit'), 'party')).toBe(true);
    expect(j.holds('tolerates', k('governor'), 'party')).toBe(true);
  }, 300000);

  it('has a third, for the cleric, who closes the count with the office', async () => {
    const j = await Journey.start('test/fixtures/ring/learned.campaign.json', 's1');
    j.put('party', k('lb_well'));
    j.roll('pass');
    await j.play('Read the office for the dead');
    expect(j.holds('tolerates', k('governor'), 'party')).toBe(true);
    expect(j.page).toContain('folds its hands');
  }, 300000);

  it('has a fourth, for a company of one, whom the Governor counts as the keeper', async () => {
    const j = await Journey.start('test/fixtures/ring/lone.campaign.json', 's1');
    j.put('party', k('lb_well'));
    await j.play('^Wait › A while');
    expect(j.holds('tolerates', k('governor'), 'party')).toBe(true);
    expect(j.page).toContain('One keeper. Tend.');
  }, 300000);

  it('is a fight if none of these is tried, and the company that waits is warned first', async () => {
    const j = await start();
    j.put('party', k('lb_well'));
    await s2(j);
    expect(j.latest).toContain('All others are removal');
    expect(j.holds('tolerates', k('governor'), 'party')).toBe(false);
  }, 300000);

  it('keeps its state across a save and a reload', async () => {
    const j = await start();
    await descend(j);
    await j.play('black stair', "To the keepers' gate");
    j.give('pharos_rubbing');
    await j.play("Set the gate's numerals", 'To the ledge over the wheel-floor', 'Cross on the lines');
    const { PlaySession } = await import('../src/session/play-session');
    const back = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint()))));
    expect(back.session.canonical()).toBe(j.session.canonical());
    expect(back.holds(k('crossed'), 'party')).toBe(true);
    expect(back.holds(k('ringFallen'), 'party')).toBe(true);
    await back.play('To the far side of the wheel-floor');
    expect(back.at('party')).toBe(k('lb_far'));
  }, 300000);

  // What a descent costs and what it leaves (the play-through in doc/imbar/playtests/ring-and-lamp-player.md).
  it('makes Oswin Tarn a choice: carry the man and leave his book, or carry the book and leave the man to be fetched', async () => {
    const carry = await start();
    carry.put('party', k('lb_gallery'));
    await carry.play('Take Oswin Tarn back up the stair');
    expect(carry.holds(k('oswinOut'), 'party')).toBe(true);
    expect(carry.matches("Take Oswin Tarn's notebook").length).toBe(0);
    expect(carry.at(k('oswin'))).toBe(k('lb_head'));
    carry.put('party', k('oil_store'));
    expect(seen(carry)).toContain('exactly how wrong he was');
    const book = await start();
    book.put('party', k('lb_gallery'));
    await book.play("Take Oswin Tarn's notebook");
    expect(book.holds(k('bookTaken'), 'party')).toBe(true);
    expect(book.matches('Take Oswin Tarn back up').length).toBe(0);
    expect(book.at(k('oswin'))).toBe(k('lb_gallery'));
    expect(book.campaign.world.related('holding').some(f => f.args[1] === k('lb_notebook'))).toBe(true);
    book.put('party', k('oil_store'));
    expect(seen(book)).toContain('You carried his paper up and left him with the lamp');
  }, 300000);

  it('has the brake cost a night on the Reach unless the pilot is fed in time, and the pilot save it', async () => {
    const dark = await start();
    await descend(dark);
    await dark.play('black stair', "To the keepers' gate");
    dark.roll('pass');
    await dark.play("Take the gate's tumbler", 'To the ledge over the wheel-floor', 'Ease the keepers. brake');
    expect(dark.holds(k('brakeThrown'), 'party')).toBe(true);
    await dark.play(`=${dark.watch() + 100}`);
    expect(dark.holds(k('reachPaid'), 'party')).toBe(false);
    await dark.play(`=${dark.watch() + 60}`);
    expect(dark.holds(k('reachPaid'), 'party')).toBe(true);
    expect(dark.latest).toContain('thump of a gun');
    dark.put('party', k('pharos_foot'));
    expect(seen(dark)).toContain('spars lie across the strand');
    // Fed in time, the Pharos burns again, and nothing is lost on the Reach.
    const fed = await start();
    await descend(fed);
    await fed.play('black stair', "To the keepers' gate");
    fed.roll('pass');
    await fed.play("Take the gate's tumbler", 'To the ledge over the wheel-floor', 'Ease the keepers. brake');
    fed.give('dorothea_oil_keg');
    fed.put('party', k('lb_well'));
    await fed.play('Pour a keg of the Pharos');
    expect(fed.holds(k('pilotLit'), 'party')).toBe(true);
    await fed.play(`=${fed.watch() + 200}`);
    expect(fed.holds(k('reachPaid'), 'party')).toBe(false);
  }, 600000);

  it('lets a company leave a coin in the drift on the way down, and finds it bright on the way up', async () => {
    const j = await start();
    j.put('party', k('lb_stair'));
    j.coin(5);
    await j.play('Leave a coin in the drift');
    expect(j.holds(k('coinLeft'), 'party')).toBe(true);
    expect(j.matches('Leave a coin').length).toBe(0);
    j.assert('lbDone', 'party');
    j.put('party', k('lb_head'));
    await j.play('=+1');
    expect(seen(j)).toContain('first light you have seen in hours');
    expect(seen(j)).toContain('the hollow in the crown of it is bright again');
  }, 300000);
});
