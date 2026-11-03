import { describe, expect, it } from 'bun:test';
import type { Journey } from '../src/session/journey';
import { City, Q } from './support/quittance';

// Mr Teague's Wake (q_wake.kyr, prefix wk_). Every road to who is paid, and what follows. A check's die is fixed by the
// seed and the moment, so each journey names the seed on which its checks come as the story needs them. Days are the
// clock's own: the first morning is day 1; the Providence pays at four on day 3 (watch 336).
const P = (...c: string[]) => ({ party: c.map((classId, i) => ({ name: `M${i}`, raceId: 'human', classId })) });
const start = async (seed: string, ...classes: string[]) => {
  const j = await City.start(seed, P(...(classes.length ? classes : ['bard', 'warrior', 'cleric']))); await j.play(...City.honest); return j;
};
const house = ['=day 2 11:00', '>quittance__teague_front'];
const pos = (j: Journey) => j.measure(Q('wk_pos'), Q('wk_fusby'));
const mood = (j: Journey) => j.measure(Q('wk_mood'), Q('wk_fusby'));
const rel = (j: Journey, r: string) => City.has(j, r, 'party');
// Let Fusby speak of his own accord until he has said n phrases (the cage open and the bird easy).
const runTo = async (j: Journey, n: number) => { for (let i = 0; i < 120 && pos(j) < n; i++) { await j.play('=+2'); } };
// The cloth off, Fusby easy (two walnuts), and left to say his whole repertoire to an empty room, adjuster not
// listening.
const exhaust = async (j: Journey) => { await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut', 'Give Fusby a walnut'); await runTo(j, 6); };
// Until Fusby has said n phrases with the adjuster by the cage: sing when he will take it, or wait, and ask the
// adjuster to sit again.
const said = async (j: Journey, n: number) => {
  for (let i = 0; i < 40 && pos(j) < n; i++) {
    if (j.matches('Ask Mr Fettiplace to take a chair').length && !rel(j, 'wk_closed')) { await j.play('Ask Mr Fettiplace to take a chair'); }
    if (j.matches('Sing to Fusby').length) { await j.play('Sing to Fusby'); } else { await j.play('=+1'); }
  }
};
const text = (j: Journey, from: number) => City.said(j, from);

describe('Mr Teague wake', () => {
  it('is found on the Slate, on the Teagues door, and from the undertaker', async () => {
    const j = await start('b');
    await j.play('=day 2 09:00', '>quittance__slip_room');
    expect(City.knows(j, 'wk_claim')).toBe(true);
    const k = await start('b');
    expect(City.knows(k, 'wk_claim')).toBe(false);
    await k.play('=day 2 09:00', '>quittance__hill_street');
    expect(City.knows(k, 'wk_claim')).toBe(true);
    const m = await start('b');
    await m.play('>quittance__hill_street', 'Ask Mr Skillicorn who is waking whom');
    expect(City.knows(m, 'wk_claim')).toBe(true);
    const n = await start('b');
    await n.play(...house, 'Ask Mr Fettiplace what the Providence');
    expect(City.knows(n, 'wk_two')).toBe(true);
  }, 200000);

  it('the adjuster takes the wake at eleven on the second day, and goes home at four on the third', async () => {
    const j = await start('b');
    await j.play('=day 2 09:00');
    expect(j.at(Q('wk_fettiplace'))).toBe(Q('provid_counter'));
    await j.play('=day 2 13:00');
    expect(j.at(Q('wk_fettiplace'))).toBe(Q('teague_front'));
    await j.play('=day 3 17:00');
    expect(j.at(Q('wk_fettiplace'))).toBe(Q('provid_counter'));
  }, 200000);

  it('honest parrot: coaxed, in order, with the adjuster by the cage, the lodger is paid', async () => {
    const j = await start('b');
    await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut', 'Ask Mr Fettiplace to take a chair');
    expect(mood(j)).toBe(1);
    const from = j.taken.length;
    await j.play('Sing to Fusby', 'Sing to Fusby');
    expect(pos(j)).toBe(2);
    expect(text(j, from)).toContain('Admiral on deck');
    expect(text(j, from)).toContain('Hold the line, Ros');
    expect(rel(j, 'wk_heardL')).toBe(true);
    expect(rel(j, 'wk_heardW')).toBe(false);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_lodger')).toBe(true);
    expect(rel(j, 'wk_paid_wife')).toBe(false);
    expect(City.regard(j, 'providence')).toBe(1);
    expect(rel(j, 'wk_friend_lodger')).toBe(true);
    expect(rel(j, 'wk_fraud')).toBe(false);
    expect(rel(j, 'wk_settled')).toBe(true);
  }, 200000);

  it('the order is the order he heard: the tea (the wife) comes after the line (the lodger) and the adjuster who stays hears both', async () => {
    const j = await start('c');
    await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut', 'Ask Mr Fettiplace to take a chair');
    await j.play('Sing to Fusby', 'Sing to Fusby', 'Sing to Fusby', 'Sing to Fusby');
    expect(pos(j)).toBe(4);
    expect(rel(j, 'wk_heardL') && rel(j, 'wk_heardW')).toBe(true);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_lodger') && rel(j, 'wk_paid_wife')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(0);
  }, 200000);

  it('private rehearsal spends the line: told only the tea, the adjuster pays the wife', async () => {
    const j = await start('c');
    await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut');
    await j.play('Sing to Fusby', 'Sing to Fusby', 'Sing to Fusby');
    expect(pos(j)).toBe(3);
    await j.play('Ask Mr Fettiplace to take a chair', 'Sing to Fusby');
    expect(pos(j)).toBe(4);
    expect(rel(j, 'wk_heardW') && !rel(j, 'wk_heardL')).toBe(true);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_wife')).toBe(true);
    expect(rel(j, 'wk_paid_lodger')).toBe(false);
    expect(rel(j, 'wk_friend_wife')).toBe(true);
  }, 200000);

  it('a night under the cloth and he begins again; or the keeper whistles him back for four coin', async () => {
    const j = await start('c');
    await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut', 'Sing to Fusby', 'Sing to Fusby');
    expect(pos(j)).toBe(2);
    await j.play('Press three coin on Tabitha');
    expect(City.knows(j, 'wk_order')).toBe(true);
    await j.play('Put the cloth back over Fusby', '=+40');
    await j.play('Take the cloth off');
    expect(pos(j)).toBe(0);
    expect(mood(j)).toBe(1);
    await j.play('Sing to Fusby');
    expect(pos(j)).toBe(1);
    const gold = City.gold(j);
    await j.play('Pay Tabitha four coin to whistle');
    expect(pos(j)).toBe(0);
    expect(City.gold(j)).toBe(gold - 4);
  }, 200000);

  it('the ham is a mistake, the walnut a courtesy, the cloth a refusal', async () => {
    const j = await start('c');
    await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut', 'Give Fusby a walnut');
    expect(mood(j)).toBe(2);
    expect(j.choices().some(c => /Give Fusby a walnut/.test(c.label))).toBe(false);
    await j.play('Offer Fusby a bit of the cold ham');
    expect(mood(j)).toBe(1);
  }, 200000);

  it('a failed song makes him sulk and mimic; failure is a loss of mood and no more', async () => {
    let seen = false;
    for (const seed of ['a', 'd', 'f', 'g']) {
      const j = await start(seed, 'warrior', 'cleric', 'ranger');
      await j.play(...house, 'Take the cloth off', 'Give Fusby a walnut', 'Sing to Fusby');
      if (mood(j) === 0 && pos(j) === 0) {
        seen = true;
        expect(City.pages(j, j.taken.length - 1)).toContain('cruel and exact impression');
        expect(j.choices().some(c => /Sing to Fusby/.test(c.label))).toBe(false);
        break;
      }
    }
    expect(seen).toBe(true);
  }, 300000);

  it('planted words: a clean plant makes the lodger the one he meant to adjuster and Fusby alike; the Hall will hear it', async () => {
    const j = await start('d', 'thief', 'bard', 'cleric');
    await exhaust(j);
    expect(pos(j)).toBe(6);
    expect(City.knows(j, 'wk_last')).toBe(true);
    await j.play('Ask Mr Fettiplace to take a chair', "Teach Fusby a sentence for the adjuster: 'To Ros");
    expect(rel(j, 'wk_plantL')).toBe(true);
    await said(j, 7);
    expect(pos(j)).toBe(7);
    expect(rel(j, 'wk_heardPL')).toBe(true);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_lodger')).toBe(true);
    expect(rel(j, 'wk_fraud')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(1);
  }, 400000);
});

describe('Mr Teague wake, continued', () => {
  it('a bungled plant comes back in the company voice and the claim is struck', async () => {
    const j = await start('c', 'thief', 'bard', 'cleric');
    await exhaust(j);
    await j.play('Ask Mr Fettiplace to take a chair', "Teach Fusby a sentence for the adjuster: 'To the Admiral");
    expect(rel(j, 'wk_exposed')).toBe(true);
    expect(rel(j, 'wk_plantW')).toBe(false);
    await said(j, 7);
    expect(rel(j, 'wk_heardX')).toBe(true);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_none')).toBe(true);
    expect(rel(j, 'wk_slighted_providence')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(0);
  }, 400000);

  it('insight: the tea, the trunk and the hands say the lodger; put to the adjuster it pays her', async () => {
    const j = await start('c', 'bard', 'warrior', 'cleric');
    await j.play('=day 2 11:30', '>quittance__teague_front', 'Ask Miss Harbottle what she did', 'Ask Miss Harbottle about the trunk', '>quittance__wk_kitchen');
    expect(City.knows(j, 'wk_tea')).toBe(true);
    expect(City.knows(j, 'wk_meant')).toBe(true);
    await j.play('>quittance__teague_front', 'Put it to Mr Fettiplace that Mr Teague meant the lodger');
    expect(rel(j, 'wk_heardL')).toBe(true);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_lodger')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(1);
  }, 300000);

  it('an argument that fails turns the adjuster suspicious, and the company is left with the parrot', async () => {
    const j = await start('a', 'bard', 'warrior', 'cleric');
    await j.play('=day 2 11:30', '>quittance__teague_front', 'Ask Miss Harbottle what she did', 'Ask Miss Harbottle about the trunk', '>quittance__wk_kitchen', '>quittance__teague_front');
    await j.play('Put it to Mr Fettiplace that Mr Teague meant the lodger');
    expect(rel(j, 'wk_heardL')).toBe(false);
    expect(rel(j, 'wk_argued')).toBe(true);
    expect(j.choices().some(c => /Put it to Mr Fettiplace that Mr Teague meant/.test(c.label))).toBe(false);
    await j.play('Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_none')).toBe(true);
  }, 300000);

  it('reading the widows is a try; it fails without the rest, and the argument then fails before the adjuster', async () => {
    let seen = false;
    for (const seed of ['a', 'd', 'e', 'g', 'h']) {
      const j = await start(seed, 'warrior', 'ranger', 'thief');
      await j.play(...house, 'Watch the two Rosalinds');
      if (!City.knows(j, 'wk_hands')) { seen = true; expect(City.knows(j, 'wk_meant')).toBe(false); break; }
    }
    expect(seen).toBe(true);
  }, 300000);

  it('a settlement: both Rosalinds put their names to a half, and the company pays the Office twelve', async () => {
    const j = await start('b');
    await j.play(...house, 'Ask Mrs Teague what her husband called her', 'Put it to Mrs Teague that half', 'Put it to Miss Harbottle that half');
    expect(rel(j, 'wk_wifeAgrees') && rel(j, 'wk_lodgerAgrees')).toBe(true);
    const gold = City.gold(j);
    await j.play('Propose to Mr Fettiplace that the four hundred be divided');
    expect(City.gold(j)).toBe(gold - 12);
    expect(rel(j, 'wk_paid_wife') && rel(j, 'wk_paid_lodger')).toBe(true);
    expect(rel(j, 'wk_friend_wife') && rel(j, 'wk_friend_lodger')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(1);
  }, 200000);

  it('neither paid: letting the Office keep it earns the third, and a slight', async () => {
    const j = await start('b');
    const gold0 = City.gold(j);
    await j.play(...house, 'Tell Mr Fettiplace that the Providence had better keep it');
    expect(City.gold(j)).toBe(gold0 + 15);
    expect(rel(j, 'wk_paid_none')).toBe(true);
    expect(rel(j, 'wk_slighted_providence')).toBe(true);
    expect(rel(j, 'wk_friend_wife') || rel(j, 'wk_friend_lodger')).toBe(false);
  }, 200000);

  it('left alone, the clock runs out at four on the third day and the money goes to the Residuary', async () => {
    const j = await start('b');
    await j.play('=day 3 15:00');
    expect(rel(j, 'wk_settled')).toBe(false);
    await j.play('=day 3 17:00');
    expect(rel(j, 'wk_settled')).toBe(true);
    expect(rel(j, 'wk_paid_none')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(0);
  }, 200000);

  it('the last words are directions: worked out by lore (a mage), or told by the friend (the lodger who sat)', async () => {
    const j = await start('b', 'mage', 'warrior', 'cleric');
    await exhaust(j);
    expect(City.knows(j, 'wk_last')).toBe(true);
    expect(City.knows(j, 'd_way_teague')).toBe(false);
    await j.play("Work out what Mr Teague's last words");
    expect(City.knows(j, 'd_way_teague')).toBe(true);
    expect(rel(j, 'teagueCombination')).toBe(true);
    const k = await start('b');
    await k.play('=day 1 21:30', '>quittance__teague_front', 'Sit the wake through the night');
    expect(rel(k, 'wk_sat')).toBe(true);
    await k.play('Ask Mrs Teague where he went', 'Take the cloth off', 'Give Fusby a walnut', 'Give Fusby a walnut');
    await runTo(k, 6);
    expect(City.knows(k, 'wk_last')).toBe(true);
    await k.play('Ask Miss Harbottle, quietly, what');
    expect(City.knows(k, 'd_way_teague')).toBe(true);
    expect(rel(k, 'teagueCombination')).toBe(true);
  }, 600000);

  it('sitting the night, the lodger paid, the hearth is kept; Fusby goes to the Hall as a witness and is as good as his word', async () => {
    const j = await start('b');
    await j.play('=day 1 21:30', '>quittance__teague_front', 'Sit the wake through the night');
    await j.play('=day 2 11:30', 'Take the cloth off', 'Give Fusby a walnut', 'Ask Mr Fettiplace to take a chair', 'Sing to Fusby', 'Sing to Fusby', 'Ask Mr Fettiplace to write his report now');
    expect(rel(j, 'wk_paid_lodger')).toBe(true);
    await j.play('Ask Miss Harbottle whether the lamp by the coffin');
    expect(j.holds(Q('keeper'), Q('hill'))).toBe(true);
    await j.play('Ask Tabitha whether Fusby might be carried');
    expect(j.holds(Q('witness'), Q('wk_fusby'))).toBe(true);
    await j.play('=day 7 09:00');
    expect(j.at(Q('wk_fusby'))).toBe(Q('hall_five'));
    await j.play('>quittance__hall_five');
    expect(City.pages(j, j.taken.length - 1)).toContain('Hold the line!');
    expect(rel(j, 'wk_testified')).toBe(true);
    expect(rel(j, 'wk_slighted_lamprey')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(1);
  }, 600000);

  it('a bird taught a lie testifies to it before the Five, and the Providence turns round', async () => {
    const j = await start('d', 'thief', 'bard', 'cleric');
    await exhaust(j);
    await j.play('Ask Mr Fettiplace to take a chair', "Teach Fusby a sentence for the adjuster: 'To Ros");
    await said(j, 7);
    await j.play('Ask Mr Fettiplace to write', 'Ask Tabitha whether Fusby might be carried');
    expect(City.regard(j, 'providence')).toBe(1);
    await j.play('=day 7 09:00', '>quittance__hall_five');
    expect(rel(j, 'wk_slighted_providence')).toBe(true);
    expect(City.regard(j, 'providence')).toBe(0);
  }, 600000);

  it('the wife keeps the hearth if she is paid and the company sat with her', async () => {
    const j = await start('c');
    await j.play('=day 1 21:30', '>quittance__teague_front', 'Sit the wake through the night');
    await j.play('=day 2 11:30', 'Take the cloth off', 'Give Fusby a walnut');
    await j.play('Sing to Fusby', 'Sing to Fusby', 'Sing to Fusby');
    await j.play('Ask Mr Fettiplace to take a chair', 'Sing to Fusby', 'Ask Mr Fettiplace to write');
    expect(rel(j, 'wk_paid_wife')).toBe(true);
    await j.play('Ask Mrs Teague whether the range');
    expect(j.holds(Q('keeper'), Q('hill'))).toBe(true);
    const k = await start('c');
    await k.play(...house, 'Tell Mr Fettiplace that the Providence had better keep it');
    expect(k.choices().some(c => /whether the range/.test(c.label))).toBe(false);
  }, 600000);
});
