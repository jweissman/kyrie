import { describe, expect, it } from 'bun:test';
import { City, Q } from './support/quittance';

// Mark Street (q_markstreet.kyr): a house on fire under the wrong Office's plate, at ten on the first morning.
// Each approach below is played by the labels a player sees; the checks use fixed seeds so that the dice are known.
const party = (classId: string, n = 3) => Array.from({ length: n }, (_, i) => ({ name: `${classId}${i}`, raceId: 'human', classId }));
const lane = [...City.honest, '^To Brick Lane'];
const fire = [...lane, '^To Mark Street', '=12'];
const licensed = [...City.slip, '^Out to Policy Row', '^To the Brokers', '^To Gate Plaza', '^To Brick Lane', '^To Mark Street', '=12'];
const yard = ['^To the yard behind'];
const tier = (j: Awaited<ReturnType<typeof City.start>>) => j.measure(Q('ms_tier'), Q('ms_nine'));
const v = (j: Awaited<ReturnType<typeof City.start>>, who: string) => City.has(j, who, 'ms_nine');

describe('Mark Street', () => {
  it('opens at ten, in front of a company that walks up Brick Lane, and the Slate and the street both say so', async () => {
    const j = await City.start();
    await j.play(...lane);
    expect(City.state(j, 'ms_house', 'ms_whole')).toBe(true);
    await j.play('=12');
    expect(City.state(j, 'ms_house', 'ms_alight')).toBe(true);
    expect(City.knows(j, 'ms_alarm')).toBe(true);
    expect(j.at(Q('garrity'))).toBe(Q('mark_street'));
    expect(j.at(Q('tobias'))).toBe(Q('mark_street'));
    expect(j.at(Q('ms_mate'))).toBe(Q('mark_street'));
    expect(j.at(Q('ms_mrs'))).toBe(Q('mark_street'));
  }, 60000);

  it('a company in Policy Row at ten reads the claim on the Slate and the boy in the plaza, and can still come in time', async () => {
    const j = await City.start();
    await j.play(...City.slip, '=13');
    expect(City.pages(j)).toContain('Phoenix bell');
    expect(City.knows(j, 'ms_alarm')).toBe(true);
    await j.play('^Out to Policy Row', '^Into the Bell & Slip');
    expect(City.knows(j, 'ms_claim')).toBe(true);
    await j.play('^Out to Policy Row', '^To the Brokers', '^To Gate Plaza', '^To Brick Lane', '^To Mark Street');
    expect(City.state(j, 'ms_house', 'ms_alight')).toBe(true);
  }, 60000);

  it('the street talks: Mrs Peascod, the children, the surveyor, the Lamprey\'s mate, and a Captain who will not be argued with', async () => {
    const j = await City.start();
    await j.play(...City.honest, '^Into the Wayward Hen', 'Ask Mrs Pudsey if anything is happening in the Brickfields');
    expect(City.said(j)).toContain('ask them about the book');
    await j.play('^Out to Gate Plaza', '^To Brick Lane', '^To Mark Street', '=12');
    await j.play('Ask Mr Tapley about the plate');
    expect(City.knows(j, 'ms_nailed_wrong')).toBe(true);
    await j.play('Ask Mr Tapley to say so to the captains');
    expect(City.said(j)).toContain('Not,');
    await j.play('Ask Mrs Peascod whose cover');
    expect(City.knows(j, 'ms_lamprey_cover')).toBe(true);
    await j.play('Ask Mrs Peascod why she is holding the clock', 'Ask the children what they have saved');
    expect(City.said(j)).toContain('IF A HOUSE IS INSURED AND IT BURNS, WHO');
    await j.play('Ask Mate Marchbanks what the Lamprey says about the mark', 'Ask Mate Marchbanks what would send the Lamprey home');
    expect(City.said(j)).toContain('Eight coin');
    await j.play('Put it to Captain Garrity');
    expect(City.said(j)).toContain('is a plate');
    expect(City.arc(j, 'garrity')).toBe(0);
    expect(City.state(j, 'ms_house', 'ms_alight')).toBe(true);
    const k = await City.start();
    await k.play(...City.honest, '>quittance__salvor_yard', 'Ask Master Voakes what the Salvors take');
    expect(City.said(k)).toContain('a case you do not ask about');
  }, 90000);

  it('the bucket-line (brawn) saves most of the house in the Phoenix\'s favour, wrongly: the family is paid by nobody', async () => {
    const j = await City.start('quittance', { party: party('warrior') });
    await j.play(...fire, ...yard, 'Take the head of the bucket-line');
    expect(v(j, 'ms_v_buckets')).toBe(true);
    expect(City.state(j, 'ms_house', 'ms_saved')).toBe(true);
    expect(City.has(j, 'ms_precedent_mark', 'party')).toBe(true);
    expect(City.has(j, 'ms_unpaid', 'party')).toBe(true);
    expect(City.has(j, 'ms_paid', 'ms_nine')).toBe(false);
    expect(City.has(j, 'ms_rule', 'party')).toBe(false);
    expect(City.regard(j, 'phoenix')).toBe(2);
    expect(City.regard(j, 'brigades')).toBe(1);
    expect(City.has(j, 'tobiasWilling', 'party')).toBe(true);
    expect(j.at(Q('garrity'))).toBe(Q('drill_yard'));
    expect(j.at(Q('ms_mrs'))).toBe(Q('ms_kitchen'));
    expect(City.arc(j, 'garrity')).toBe(0);
  }, 60000);

  it('any hands can pass buckets: a plain company saves less of the house', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...fire, ...yard);
    expect(j.offers('Take the head of the bucket-line')).toBe(false);
    await j.play('Form a bucket-line');
    expect(v(j, 'ms_v_buckets')).toBe(true);
    expect(tier(j)).toBeGreaterThanOrEqual(2);
    expect(City.state(j, 'ms_house', 'ms_saved')).toBe(true);
    expect(City.state(j, 'ms_plate', 'ms_bird')).toBe(true);
  }, 60000);

  it('a company that is absent finds Mark Street burned, the family at the Pargeters\', and Tobias with blankets', async () => {
    const j = await City.start();
    await j.play(...lane, '=26');
    expect(City.state(j, 'ms_house', 'ms_gutted')).toBe(true);
    expect(v(j, 'ms_v_none')).toBe(true);
    expect(City.has(j, 'ms_burned', 'party')).toBe(true);
    expect(j.at(Q('ms_mrs'))).toBe(Q('pargeter_front'));
    expect(j.at(Q('garrity'))).toBe(Q('drill_yard'));
    expect(City.has(j, 'tobiasWilling', 'party')).toBe(false);
    await j.play('^To Mark Street');
    expect(City.page(j)).toContain('blankets');
    expect(City.page(j)).toContain('a tooth out');
  }, 60000);

  it('a family carried out into the yard: the contents are saved though the house is lost, and Tobias is grateful', async () => {
    const j = await City.start();
    await j.play(...fire, ...yard, 'Carry the Peascods');
    expect(City.has(j, 'ms_contents', 'ms_nine')).toBe(true);
    await j.play('=+14');
    expect(City.state(j, 'ms_house', 'ms_gutted')).toBe(true);
    expect(City.has(j, 'tobiasWilling', 'party')).toBe(true);
    await j.play('^To Mark Street', '^To Brick Lane', '^To Dyers. Alley', '^Into the Pargeter', 'Ask Tobias Pargeter to come along');
    expect(j.holds('willing', Q('tobias'), 'party')).toBe(true);
  }, 60000);

  it('the Third Certification: asked, not argued; the book from the front room; both brigades; the Mark Street Rule', async () => {
    const j = await City.start();
    await j.play(...licensed);
    await j.play('Put it to Captain Garrity');
    expect(City.arc(j, 'garrity')).toBe(0);
    expect(j.offers('Certify a third thing')).toBe(false);
    await j.play('Tell Captain Garrity that you are not here to order her');
    expect(City.arc(j, 'garrity')).toBe(1);
    await j.play('Elen goes first', 'Take the Peascods. policy-book', '^Out to Mark Street', 'Read the Peascods');
    expect(City.knows(j, 'ms_proof')).toBe(true);
    await j.play('Certify a third thing');
    expect(v(j, 'ms_v_third')).toBe(true);
    expect(City.has(j, 'ms_rule', 'party')).toBe(true);
    expect(City.has(j, 'ms_paid', 'ms_nine')).toBe(true);
    expect(tier(j)).toBe(2);
    expect(City.state(j, 'ms_house', 'ms_half')).toBe(true);
    expect(City.regard(j, 'lamprey')).toBe(1);
    expect(City.regard(j, 'brigades')).toBe(2);
    expect(City.has(j, 'tobiasWilling', 'party')).toBe(true);
    // The consequence stays: the family is home, the Captain greets with two fingers to her helmet, and asked to be a
    // witness
    await j.play('^Into Number Nine', '^To the kitchen of Number Nine', 'Ask Mrs Peascod whether she would say', '^To the front room', '^Out to Mark Street');
    expect(City.has(j, 'witness', 'ms_mrs')).toBe(true);
    await j.play('^To Brick Lane', '^To the fire-house yard');
    expect(City.page(j)).toContain('two fingers to her helmet');
    await j.play('Ask Captain Garrity what the Office makes of the certification');
    expect(City.said(j)).toContain('Mark Street Rule');
  }, 90000);
});

describe('Mark Street, continued', () => {
  it('certifying the mark false (no ask): the Lamprey wins, Garrity is shamed, and she cannot be asked after', async () => {
    const j = await City.start();
    await j.play(...licensed, 'Elen goes first', 'Take the Peascods. policy-book', '^Out to Mark Street', 'Read the Peascods');
    expect(j.offers('Certify a third thing')).toBe(false);
    await j.play('Certify the mark false');
    expect(v(j, 'ms_v_lamprey')).toBe(true);
    expect(City.has(j, 'ms_garrity_shamed', 'party')).toBe(true);
    expect(City.has(j, 'ms_paid', 'ms_nine')).toBe(true);
    expect(City.has(j, 'ms_rule', 'party')).toBe(false);
    expect(City.regard(j, 'lamprey')).toBe(2);
    expect(City.regard(j, 'phoenix')).toBe(0);
    expect(City.arc(j, 'garrity')).toBe(0);
  }, 60000);

  it('the book can be had by the back (brawn at the kitchen door) or from Tobias, who loses his eyebrows for it', async () => {
    const a = await City.start('quittance', { party: party('warrior') });
    await a.play(...fire, ...yard, 'Put your shoulder to the kitchen door', '^Into Number Nine, Mark Street by the kitchen door', '^To the front room', 'Take the Peascods. policy-book');
    expect(a.offers('Read the Peascods')).toBe(true);
    const b = await City.start('quittance', { party: party('ranger') });
    await b.play(...fire, 'Ask Tobias Pargeter to run in at the front');
    expect(b.offers('Read the Peascods')).toBe(true);
    expect(City.has(b, 'ms_book_taken', 'ms_nine')).toBe(true);
  }, 90000);

  it('pulling the plate (stealth): both brigades stand down and the Salvors come for a third', async () => {
    const j = await City.start('d', { party: party('thief') });
    await j.play(...fire, 'Prise the gilt bird');
    expect(City.state(j, 'ms_plate', 'ms_bare')).toBe(true);
    await j.play('=+4');
    expect(v(j, 'ms_v_salvors')).toBe(true);
    expect(City.has(j, 'ms_unpaid', 'party')).toBe(true);
    expect(City.has(j, 'ms_slighted_brigades', 'party')).toBe(true);
    expect(City.regard(j, 'brigades')).toBe(0);
    expect(City.has(j, 'tobiasWilling', 'party')).toBe(false);
    expect(j.at(Q('ms_quennell'))).toBe(Q('salvor_yard'));
  }, 60000);

  it('swapping the plate for the neighbour\'s fish: the Lamprey saves it, Garrity says a mark is a mark', async () => {
    const j = await City.start('b', { party: party('thief') });
    await j.play(...fire, 'Swap Number Ten');
    expect(City.state(j, 'ms_plate', 'ms_fish')).toBe(true);
    expect(v(j, 'ms_v_lamprey')).toBe(true);
    expect(City.has(j, 'ms_swapped', 'party')).toBe(true);
    expect(City.has(j, 'ms_garrity_shamed', 'party')).toBe(false);
    expect(City.has(j, 'ms_paid', 'ms_nine')).toBe(true);
    expect(City.regard(j, 'lamprey')).toBe(1);
  }, 60000);

  it('a stealth check that fails draws both captains on the company, and costs time and the brigades\' regard', async () => {
    const j = await City.start('quittance', { party: party('thief') });
    await j.play(...fire, 'Prise the gilt bird');
    expect(City.state(j, 'ms_plate', 'ms_bird')).toBe(true);
    expect(City.has(j, 'ms_caught', 'party')).toBe(true);
    expect(j.offers('Prise the gilt bird')).toBe(false);
    expect(j.offers('Swap Number Ten')).toBe(false);
  }, 60000);

  it('coin to the Lamprey\'s mate sends the Lamprey home: the Phoenix saves it, the Lamprey are slighted', async () => {
    const j = await City.start('quittance', { party: party('ranger') });
    await j.play(...fire, 'Ask Mate Marchbanks what would send the Lamprey home', 'Press eight coin');
    expect(v(j, 'ms_v_phoenix')).toBe(true);
    expect(City.gold(j)).toBe(18 - 3 - 8);
    expect(City.has(j, 'ms_slighted_lamprey', 'party')).toBe(true);
    expect(City.has(j, 'ms_precedent_mark', 'party')).toBe(true);
    expect(City.has(j, 'ms_paid', 'ms_nine')).toBe(false);
    expect(tier(j)).toBeGreaterThanOrEqual(2);
  }, 60000);

  it('offered coin, Captain Garrity is insulted and cannot be asked until she has been begged pardon; then she can', async () => {
    const j = await City.start();
    await j.play(...fire, 'Slip Captain Garrity ten coin');
    expect(City.has(j, 'ms_g_insulted', 'party')).toBe(true);
    expect(j.offers('Tell Captain Garrity that you are not here to order her')).toBe(false);
    await j.play("Beg Captain Garrity's pardon");
    expect(j.offers('Tell Captain Garrity that you are not here to order her')).toBe(true);
    await j.play('Tell Captain Garrity that you are not here to order her');
    expect(City.arc(j, 'garrity')).toBe(1);
  }, 60000);

  it('intimidating the mate (warrior) moves him; a failure makes the Lamprey an enemy', async () => {
    const j = await City.start('c', { party: party('warrior') });
    await j.play(...fire, "Tell Mate Marchbanks what the Lamprey's pump");
    expect(v(j, 'ms_v_phoenix')).toBe(true);
    expect(City.regard(j, 'lamprey')).toBe(0);
    expect(City.has(j, 'ms_slighted_lamprey', 'party')).toBe(true);
    const k = await City.start('quittance', { party: party('warrior') });
    await k.play(...fire, "Tell Mate Marchbanks what the Lamprey's pump");
    expect(v(k, 'ms_v_phoenix')).toBe(false);
    expect(City.state(k, 'ms_house', 'ms_alight')).toBe(true);
    expect(City.has(k, 'ms_slighted_lamprey', 'party')).toBe(true);
  }, 60000);

  it('asked, and nothing done: Garrity has been moved but the house still burns, and she says so after', async () => {
    const j = await City.start();
    await j.play(...fire, 'Tell Captain Garrity that you are not here to order her', '=+14');
    expect(City.arc(j, 'garrity')).toBe(1);
    expect(City.state(j, 'ms_house', 'ms_gutted')).toBe(true);
    expect(v(j, 'ms_v_none')).toBe(true);
    expect(City.has(j, 'ms_rule', 'party')).toBe(false);
    expect(City.has(j, 'tobiasWilling', 'party')).toBe(false);
  }, 60000);

  it('arriving after it has burned: the claim can still be settled from the ash, with Garrity asked, for the Rule if not the house', async () => {
    const j = await City.start();
    await j.play(...licensed.slice(0, -2), '=40');
    expect(City.state(j, 'ms_house', 'ms_gutted')).toBe(true);
    await j.play('^To Mark Street', '^Into Number Nine');
    await j.play('Take the Peascods. policy-book', '^Out to Mark Street', 'Read the Peascods');
    expect(City.knows(j, 'ms_proof')).toBe(true);
    await j.play('^To Brick Lane', '^To the fire-house yard');
    expect(j.offers('Certify the dead house after the fact')).toBe(false);
    await j.play('Ask Captain Garrity, as a favour, to put her name');
    expect(City.arc(j, 'garrity')).toBe(1);
    await j.play('Certify the dead house after the fact');
    expect(City.has(j, 'ms_rule', 'party')).toBe(true);
    expect(City.has(j, 'ms_paid', 'ms_nine')).toBe(true);
    expect(City.has(j, 'ms_unpaid', 'party')).toBe(false);
  }, 90000);
});
