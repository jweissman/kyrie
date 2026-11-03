import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

// The Mark-Forger (q_forger.kyr): Ma Gedge in Dyers' Alley, a hunter called Dabney, and a raid at four on the second
// afternoon (watch 336). Played by the labels a player sees; checks use fixed seeds.
const party = (classId: string, n = 3) => Array.from({ length: n }, (_, i) => ({ name: `${classId}${i}`, raceId: 'human', classId }));
type J = Awaited<ReturnType<typeof City.start>>;
const alley = [...City.honest, '^To Brick Lane', '^To Dyers. Alley'];
const hunt = [...alley, 'Ask Mr Dabney what he is hunting'];
const warned = [...hunt, '^Into the die-works', 'Warn Ma Gedge'];
const has = (j: J, r: string, ...a: string[]) => City.has(j, r, ...a);
const holdsWrit = (j: J) => j.choices().some(c => /writ of the Lamprey/.test(c.label));

describe('The Mark-Forger', () => {
  it('is found three ways: a notice in the lane, a plate in the Wards, the Slate; and the shop by walking into it', async () => {
    const a = await City.start();
    await a.play(...City.honest, '^To Brick Lane');
    expect(City.pages(a)).toContain('PAY TWELVE COIN');
    expect(City.knows(a, 'fg_plates')).toBe(true);
    const b = await City.start();
    await b.play(...City.slip);
    expect(City.knows(b, 'fg_claim')).toBe(true);
    const c = await City.start();
    await c.play(...alley, '^Into the die-works');
    expect(City.knows(c, 'fg_forger')).toBe(true);
    expect(c.taken.at(-1)!.told).toContain('fire-pot');
    const d = await City.start();
    await d.play(...City.honest, '>quittance__salt_lane');
    expect(City.said(d)).toContain('not quite round');
  }, 90000);

  it('reporting her pays twelve coin and the Phoenix\'s thanks, shuts the shop, and puts Ma Gedge in the fire-house cell', async () => {
    const j = await City.start();
    await j.play(...alley, '^Into the die-works', '^Out to Dyers. Alley');
    const gold = City.gold(j), regard = City.regard(j, 'phoenix');
    await j.play('Tell Mr Dabney where the plates are cast');
    expect(City.gold(j)).toBe(gold + 12);
    expect(City.regard(j, 'phoenix')).toBe(regard + 1);
    expect(has(j, 'fg_informed', 'party')).toBe(true);
    expect(has(j, 'fg_raided', 'fg_shop')).toBe(true);
    expect(j.at(Q('fg_gedge'))).toBe(Q('engine_room'));
    expect(has(j, 'fg_network', 'party')).toBe(false);
    // and the shop is shut
    await j.play('^Into the die-works');
    expect(j.taken.at(-1)!.told).toContain('Phoenix seal');
    // she can be bailed out with ten coin, and then she will teach
    await j.play('^Out to Dyers. Alley', '^To Brick Lane', '^To the fire-house yard', '^Into the Phoenix fire-house', 'Pay Ma Gedge.s fine');
    expect(j.at(Q('fg_gedge'))).toBe(Q('gedge_back'));
    expect(has(j, 'fg_bailed', 'party')).toBe(true);
    expect(has(j, 'fg_trusted', 'party')).toBe(true);
    expect(City.gold(j)).toBe(gold + 12 - 10);
  }, 90000);

  it('warning her of the hunter wins her over: she teaches the trade, gives the writ, and the Wards get their doors', async () => {
    const j = await City.start();
    await j.play(...warned);
    expect(has(j, 'fg_warned', 'party')).toBe(true);
    expect(has(j, 'fg_trusted', 'party')).toBe(true);
    expect(City.state(j, 'fg_dies', 'fg_dies_hidden')).toBe(true);
    await j.play('Ask Ma Gedge how she came to cast for the Wards');
    await j.play('Ask Ma Gedge why a plate nobody cast should keep a house');
    expect(City.knows(j, 'd_marks_work')).toBe(true);
    await j.play('Ask Ma Gedge to show you how a plate is cast');
    expect(has(j, 'fg_network', 'party')).toBe(true);
    expect(j.measure(Q('fg_doors'), 'party')).toBe(12);
    expect(holdsWrit(j)).toBe(true);
    await j.play('Ask Ma Gedge how her pension is coming on');
    expect(City.said(j)).toContain('Candlewick');
  }, 90000);

  it('the web of doors is seen in Salt Lane once it is made', async () => {
    const j = await City.start();
    await j.play(...warned, 'Ask Ma Gedge to show you how a plate is cast');
    expect(has(j, 'fg_network', 'party')).toBe(true);
    await j.play('>quittance__salt_lane');
    expect(j.taken.at(-1)!.told).toContain('Over every fourth door in Salt Lane');
    const n = await City.start();
    await n.play(...alley, '>quittance__salt_lane');
    expect(n.taken.at(-1)!.told).not.toContain('Over every fourth door');
  }, 90000);

  it('improving her marks: a lore check against the true bird, or a mender\'s file; each adds doors; a failure costs only an hour', async () => {
    const a = await City.start('a', { party: party('bard') });
    await a.play(...warned, 'Show Ma Gedge what is wrong with her feathers');
    expect(has(a, 'fg_better', 'party')).toBe(true);
    await a.play('Ask Ma Gedge to show you how a plate is cast');
    expect(a.measure(Q('fg_doors'), 'party')).toBe(20);
    const f = await City.start('quittance', { party: party('bard') });
    await f.play(...warned, 'Show Ma Gedge what is wrong with her feathers');
    expect(has(f, 'fg_better', 'party')).toBe(false);
    expect(has(f, 'fg_trusted', 'party')).toBe(true);
    const c = await City.start('c', { party: party('cleric') });
    await c.play(...warned, 'Take the file from Ma Gedge');
    expect(has(c, 'fg_better', 'party')).toBe(true);
  }, 90000);

  it('extortion pays fifteen coin and ends any friendship; a bluff called ends it too', async () => {
    const a = await City.start('a', { party: party('warrior') });
    await a.play(...alley, '^Into the die-works');
    const gold = City.gold(a);
    await a.play('Tell Ma Gedge that Mr Dabney would pay');
    expect(City.gold(a)).toBe(gold + 15);
    expect(has(a, 'fg_extorted', 'party')).toBe(true);
    expect(has(a, 'fg_hostile', 'party')).toBe(true);
    expect(a.offers('Ask Ma Gedge to show you how a plate is cast')).toBe(false);
    const b = await City.start('quittance', { party: party('warrior') });
    await b.play(...alley, '^Into the die-works');
    const g2 = City.gold(b);
    await b.play('Tell Ma Gedge that Mr Dabney would pay');
    expect(City.gold(b)).toBe(g2);
    expect(has(b, 'fg_extorted', 'party')).toBe(false);
    expect(has(b, 'fg_hostile', 'party')).toBe(true);
    expect(has(b, 'fg_network', 'party')).toBe(false);
    expect(b.offers('Warn Ma Gedge')).toBe(false);
  }, 90000);

  it('turning the hunter: read his face, or ask her ledger, then ask about his sister\'s door; no raid comes, and he will testify', async () => {
    const j = await City.start('c', { party: party('cleric') });
    await j.play(...hunt, "Watch Mr Dabney's face");
    expect(City.knows(j, 'fg_sister')).toBe(true);
    await j.play("Ask Mr Dabney whether the door of his sister's house");
    expect(has(j, 'fg_turned', 'party')).toBe(true);
    expect(has(j, 'fg_protected', 'fg_shop')).toBe(true);
    expect(has(j, 'witness', 'fg_dabney')).toBe(true);
    await j.play('=340');
    expect(has(j, 'fg_raided', 'fg_shop')).toBe(false);
    expect(j.at(Q('fg_gedge'))).toBe(Q('gedge_back'));
    await j.play('Ask Mr Dabney how the hunt is going');
    expect(City.said(j)).toContain('three new tinsmiths');
    expect(j.offers('Tell Mr Dabney where the plates are cast')).toBe(false);
    // the face that is not read gives away nothing, and costs ten minutes
    const f = await City.start('quittance', { party: party('cleric') });
    await f.play(...hunt, "Watch Mr Dabney's face");
    expect(City.knows(f, 'fg_sister')).toBe(false);
    expect(f.offers("Ask Mr Dabney whether the door of his sister's house")).toBe(false);
  }, 90000);

  it('or the ledger of a friend gives away the sister: warned, trusted, shown the Ds', async () => {
    const j = await City.start();
    await j.play(...warned, 'Ask Ma Gedge who her best customers are', '^Out to Dyers. Alley', "Ask Mr Dabney whether the door of his sister's house");
    expect(has(j, 'fg_turned', 'party')).toBe(true);
    expect(has(j, 'witness', 'fg_dabney')).toBe(true);
    expect(j.at(Q('fg_gedge'))).toBe(Q('gedge_back'));
  }, 90000);

  it('warned and left alone, the raid at four finds door-knockers and Ma Gedge stays where she is', async () => {
    const j = await City.start();
    await j.play(...warned, '=340');
    expect(has(j, 'fg_raid_done', 'fg_shop')).toBe(true);
    expect(has(j, 'fg_raided', 'fg_shop')).toBe(false);
    expect(j.at(Q('fg_gedge'))).toBe(Q('gedge_back'));
    expect(City.said(j)).toContain('door-knocker');
  }, 90000);

  it('left entirely alone, the hunter has her by five: the shop is sealed, the cell is a room away, and no network is formed', async () => {
    const j = await City.start();
    await j.play(...alley, '=340');
    expect(has(j, 'fg_raided', 'fg_shop')).toBe(true);
    expect(j.at(Q('fg_gedge'))).toBe(Q('engine_room'));
    expect(has(j, 'fg_network', 'party')).toBe(false);
    expect(City.said(j)).toContain('walked up Brick Lane');
  }, 90000);

  it('why the marks work: Tobias Pargeter, who has turned out for plates he wondered about', async () => {
    const j = await City.start();
    await j.play(...alley, '^Into the Pargeter house');
    expect(City.knows(j, 'd_marks_work')).toBe(false);
    await j.play('Ask Tobias Pargeter whether he has ever turned out for a plate');
    expect(City.knows(j, 'd_marks_work')).toBe(true);
    expect(City.said(j)).toContain('You\'d be surprised how often');
  }, 90000);
});
