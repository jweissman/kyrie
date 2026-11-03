import { describe, expect, it } from 'bun:test';
import { Ombra, home } from './support/ombra';

// The Gauntlet (data/adventures/book-of-faces/warrior.kyr): the Duelling Stair of Quiet Hill, nine landings and a
// Second on each, what a company answers to them, the Captain's question, the Contessa's killing, and the Stair held at
// the Drawing. A climb here is a plan (what is answered at each landing) walked by a player who retries a roll, is
// carried down at the third fall, sits on the surgeon's bench and comes again; the seeds are pinned, and the odds of a
// level-one climb are in the notes.
const sam = (level: number, cls = 'warrior') => [{ name: 'Sam', raceId: 'human', classId: cls, level } as never];
const start = (seed = 'ombra', level = 10, cls = 'warrior') => Ombra.start(home, seed, sam(level, cls));
const up = (to: string) => `To the landing of the ${to}`;
const landings = ['wr_l1', 'wr_l2', 'wr_l3', 'wr_l4', 'wr_l5', 'wr_l6', 'wr_l7', 'wr_l8', 'wr_l9'];
const ways = ['first flight', up('Door'), up('Fool'), up('Ledger'), up('Yielding'), up('Veil'), up('Brother'), up('Lamp'), up('Captain')];
type Plan = Record<string, string[]>;
// What the landings are answered with, three ways, none of which kills anyone.
const hireling: Plan = { wr_l1: ['Pay Sturry the Stair'], wr_l2: ['Take the narrow door'], wr_l3: ['Spar the Fool'], wr_l4: ['Ask to see the line', 'Take the win he has been paid'],
  wr_l5: ["Take the old man's sword"], wr_l6: ['Cross blades with the Second', 'Take the House'], wr_l7: ['Take the sword out of his hand'], wr_l8: ['Stare the boy down'] };
const defender: Plan = { wr_l1: ['Lay your steel on the rack'], wr_l2: ['Take the narrow door'], wr_l3: ['Ask Dobb about the little girl', 'Put on the Fool'],
  wr_l4: ['Ask to see the line', 'Tell Vask you will not be given it'], wr_l5: ['Tell him to keep it'], wr_l6: ['Cross blades with the Second', 'Pick up his domino'],
  wr_l7: ['Watch his sword hand', 'Drop your point'], wr_l8: ['Sit on the step'] };
const breaker: Plan = { wr_l1: ['Lay your steel on the rack'], wr_l2: ['Take the narrow door'], wr_l3: ['Spar the Fool'], wr_l4: ['Ask to see the line', 'Take the win he has been paid'],
  wr_l5: ['Break the sword'], wr_l6: ['Cross blades with the Second', 'Name a Second in a black'], wr_l7: ['Take the sword out of his hand'], wr_l8: ['Stare the boy down'] };
// Walks a plan from the foot of the Stair to the Captain's landing: the first of a landing's answers that is offered, a
// roll tried again until it is passed, the way up when nothing more is offered, and the bench when carried down.
async function walk(o: Ombra, plan: Plan, to = 'wr_l9') {
  await o.play('>ombra__hill_foot');
  for (let guard = 0; guard < 150; guard++) {
    const here = (o.at('party') ?? '').replace('ombra__', '');
    if (here === to) { return; }
    if (here === 'hill_foot') {
      if (guard > 0) { await o.play('>ombra__seconds_yard', '?Ask Goodwife Ream', '?Rest and recover', '>ombra__hill_foot'); }
      await o.play('first flight');
      continue;
    }
    const act = plan[here]?.find(a => o.j.offers(a));
    if (act) { await o.play('?' + act); } else { await o.play(ways[landings.indexOf(here) + 1]!); }
  }
  throw new Error('the plan did not reach ' + to);
}
// what the last command told, which the page's telling of a fight and a fall leaves out
const told = (o: Ombra) => o.j.taken[o.j.taken.length - 1]!.told;
const swear = (answer: string) => ['Tell the Captain you will answer', answer, 'Kneel on the wet stone'];

describe('the nine landings', () => {
  it('are climbed as a Defender, by a company that holds a door, spares a fool, a boy and a brother, and keeps a face a secret', async () => {
    const o = await start('s1');
    await walk(o, defender);
    expect(o.measure('wr_height', 'party')).toBe(8);
    expect(o.measure('wr_defend', 'party')).toBeGreaterThanOrEqual(5);
    expect(o.holds('wr_brother_spared', 'party')).toBe(true);
    expect(o.holds('wr_rook_waited', 'party')).toBe(true);
    expect(o.holds('wr_veil_spared', 'party')).toBe(true);
    await o.play(...swear('Say that you refuse to see the unarmed hurt'));
    expect(o.holds('wr_defender', 'party')).toBe(true);
    expect(o.holds('wr_sworn', 'party')).toBe(true);
    expect(o.carries('wr_seconds_blade')).toBe(true);
    expect(o.holds('handReady', 'party', 'hand_stair')).toBe(true);
    expect(o.holds('wr_blooded', 'party')).toBe(false);
    expect(o.page).toContain('Welcome up');
    // the Captain's own account of the fourth landing, and the way on to the head of the Stair
    await o.play('Ask the Captain about the forty coin');
    expect(o.page).toContain('I wanted to see what you did');
    await o.play('To the head of the Duelling Stair');
    expect(o.at('party')).toBe('ombra__stair_top');
  }, 180_000);

  it('are climbed as a Hireling, for coin, by a company that takes what is paid and what is given', async () => {
    const o = await start('s1');
    await walk(o, hireling);
    expect(o.measure('wr_hire', 'party')).toBeGreaterThanOrEqual(6);
    expect(o.holds('wr_blade_taken', 'party')).toBe(true);
    expect(o.carries('wr_wend_blade')).toBe(true);
    expect(o.gold()).toBeGreaterThan(25);
    expect(o.j.offers('Say that you refuse to see the unarmed hurt')).toBe(false);
    await o.play(...swear('Say that you refuse nothing that is fairly paid for'));
    expect(o.holds('wr_hireling', 'party')).toBe(true);
    expect(o.holds('wr_defender', 'party')).toBe(false);
  }, 180_000);

  it('are climbed as a Breaker, by one who breaks the old man\'s sword and says a face aloud in the street', async () => {
    const o = await start('s1');
    await walk(o, breaker);
    expect(o.holds('wr_veil_broken', 'party')).toBe(true);
    expect(o.holds('named', 'wr_veil')).toBe(true);
    expect(o.holds('wr_blade_broken', 'party')).toBe(true);
    expect(o.measure('wr_break', 'party')).toBe(2);
    expect(o.measure('heat', 'party')).toBeGreaterThanOrEqual(2);
    expect(o.holds('hl_vesper_gone', 'party')).toBe(true);
    await o.play(...swear('Say that you refuse a rule that makes you do it'));
    expect(o.holds('wr_breaker', 'party')).toBe(true);
  }, 180_000);

  it('are a stair like any other to a company with no blade, which is let up, and not sworn', async () => {
    const o = await Ombra.start(home, 'ombra', Ombra.one('thief'));
    await o.play('>ombra__hill_foot', ...ways, 'Ask the Captain what is at the head', 'To the head of the Duelling Stair');
    expect(o.at('party')).toBe('ombra__stair_top');
    expect(o.measure('wr_height', 'party')).toBe(9);
    expect(o.holds('wr_sworn', 'party')).toBe(false);
    expect(o.holds('handReady', 'party', 'hand_stair')).toBe(false);
    expect(o.page).toContain('We ask nothing of the unarmed');
  }, 120_000);
});

describe('a level-one climb', () => {
  // A careful hand answers by the rolls, is carried down at the third fall, sits on the surgeon's bench, and comes
  // again. The climb is fair: forty seeds of this player were all sworn, none dead, 1.4 carry-downs each.
  it('gets a level-one warrior to the oath, with the bench between falls and nobody dead', async () => {
    const o = await start('c1', 1);
    await walk(o, defender);
    await o.play(...swear('Say that you refuse'));
    expect(o.holds('dead', 'party')).toBe(false);
    expect(o.holds('wr_sworn', 'party')).toBe(true);
    expect(o.holds('wr_blooded', 'party')).toBe(false);
    expect(o.measure('wr_height', 'party')).toBe(9);
  }, 240_000);
});

describe('steel on the Stair', () => {
  it('carries a company that falls down the Stair to the foot of it, and it may come again', async () => {
    const o = await start('s1', 1);
    await o.play('>ombra__hill_foot', 'first flight', 'Keep your steel');
    expect(told(o)).toContain('Come again');
    expect(o.at('party')).toBe('ombra__hill_foot');
    expect(o.holds('dead', 'wr_marl')).toBe(false);
    expect(o.holds('wr_blooded', 'party')).toBe(false);
    await o.play('first flight');
    expect(o.at('party')).toBe('ombra__wr_l1');
    expect(o.j.offers('Lay your steel on the rack')).toBe(true);
  }, 120_000);

  it('carries a company down at the third fall, which is the Guild\'s count, and the count starts again', async () => {
    const o = await start('s1', 1);
    await o.play('>ombra__hill_foot', 'first flight');
    for (let i = 0; i < 40 && o.measure('wr_falls', 'party') < 3 && o.at('party') === 'ombra__wr_l1'; i++) {
      // the roll is the first blood, and a company that wins it has left the landing; one that loses it has a fall
      await o.play('?Lay your steel on the rack');
      if (o.holds('tolerates', 'wr_marl', 'party')) { break; }
    }
    // either the third fall came (and the count was called) or the roll was won first; the count never stands at more
    // than two
    expect(o.measure('wr_falls', 'party')).toBeLessThan(3);
  }, 120_000);

  it('leaves blood on the Stair when a Second is killed, and the Captain will not swear a company that left it', async () => {
    const o = await start('s2', 1);
    await o.play('>ombra__hill_foot', 'first flight', 'Keep your steel');
    expect(o.holds('dead', 'wr_marl')).toBe(true);
    expect(o.holds('wr_blooded', 'party')).toBe(true);
    expect(told(o)).toContain('a bell is rung once');
    await o.play(up('Door'));
    expect(o.at('party')).toBe('ombra__wr_l2');
  }, 120_000);

  it('turns a blooded company from the oath, and lets it go up the public stair', async () => {
    const o = await start('s2', 10);
    await o.play('>ombra__hill_foot', 'first flight', 'Keep your steel');
    expect(o.holds('wr_blooded', 'party')).toBe(true);
    await walk(o, defender, 'wr_l9');
    expect(o.holds('wr_blooded', 'party')).toBe(true);
    expect(o.j.offers('Tell the Captain you will answer')).toBe(false);
    await o.play('Ask the Captain what she will say of the Stair');
    expect(o.page).toContain('You have killed on my Stair');
    expect(o.j.offers('Kneel on the wet stone')).toBe(false);
    await o.play('To the head of the Duelling Stair');
    expect(o.holds('wr_sworn', 'party')).toBe(false);
  }, 180_000);

  it('lets a company go down at any landing, and up again to find the Seconds as it left them', async () => {
    const o = await start('s1', 10);
    await walk(o, hireling, 'wr_l3');
    expect(o.measure('wr_height', 'party')).toBe(2);
    await o.play('>ombra__hill_foot', '=day 2 9:00', 'first flight', up('Door'), up('Fool'));
    expect(o.at('party')).toBe('ombra__wr_l3');
    expect(o.measure('wr_height', 'party')).toBe(2);
    expect(o.holds('tolerates', 'wr_marl', 'party')).toBe(true);
  }, 180_000);
});

describe('the Contessa\'s killing', () => {
  const sworn = async (seed = 's1') => { const o = await start(seed); await walk(o, defender); await o.play(...swear('Say that you refuse to see the unarmed hurt')); return o; };
  it('can be refused, and is then done by another Second in the dark of the eighth night', async () => {
    const o = await sworn();
    await o.play('>ombra__tarn_hall', 'Tell the Contessa that you are sworn', 'Tell the Contessa that you will not do it');
    expect(o.holds('wr_refused', 'party')).toBe(true);
    await o.play('=day 9 7:00');
    expect(o.holds('wr_other_second', 'party')).toBe(true);
    expect(o.holds('wr_ullin_dead', 'party')).toBe(false);
    expect(o.page).toContain('a young man with a sword is found in it in the morning');
  }, 180_000);

  it('can be stood against, for the Lady Elinor, in the Guild\'s yard on the Rule of Acknowledgement', async () => {
    const o = await sworn();
    await o.play('>ombra__tarn_hall', 'Tell the Contessa that you are sworn', 'Ask Elinor why', 'Ask what she would have a Second do', '=day 1 19:00',
      '>ombra__seconds_yard', 'Ask him whether he knows');
    for (let i = 0; i < 8 && !o.holds('wr_ullin_bound', 'party'); i++) { await o.play('?Stand for Elinor'); }
    expect(o.holds('wr_ullin_bound', 'party')).toBe(true);
    expect(o.holds('wr_ullin_dead', 'party')).toBe(false);
    expect(o.page).toContain('I acknowledge her');
    await o.play('=day 9 7:00');
    expect(o.holds('wr_other_second', 'party')).toBe(false);
  }, 180_000);

  it('can be done, for sixty coin, and the man falls in the lamplight', async () => {
    const o = await sworn();
    await o.play('>ombra__tarn_hall', 'Tell the Contessa that you are sworn', 'Take the Contessa', '=day 1 19:00', '>ombra__seconds_yard', 'Take the Contessa');
    expect(o.holds('wr_hired', 'party')).toBe(true);
    expect(o.holds('wr_ullin_dead', 'party')).toBe(true);
    expect(o.gold()).toBeGreaterThanOrEqual(60);
  }, 180_000);
});

describe('the Stair held', () => {
  it('is held at the Drawing, by a Defender, with shields, when the company is at the foot of the Urn Hall stair', async () => {
    const o = await start('s1');
    await walk(o, defender);
    await o.play(...swear('Say that you refuse to see the unarmed hurt'), '=day 9 18:10', '>ombra__urn_hall');
    expect(o.at('reeve')).toBe('ombra__urn_hall');
    expect(o.j.offers('Order the Seconds to clear the stair with steel')).toBe(false);
    expect(o.j.offers('Tell the Seconds to stand aside')).toBe(false);
    await o.play('Have the Seconds close their shields');
    expect(o.holds('handPlayed', 'party', 'hand_stair')).toBe(true);
    expect(o.measure('handWay', 'hand_stair')).toBe(1);
  }, 280_000);

  it('can be opened, by a Breaker, which is the first time in three hundred years the Stair has refused to hold', async () => {
    const o = await start('s1');
    await walk(o, breaker);
    await o.play(...swear('Say that you refuse a rule that makes you do it'), '=day 9 18:10', '>ombra__urn_hall', 'Tell the Seconds to stand aside');
    expect(o.measure('handWay', 'hand_stair')).toBe(3);
  }, 280_000);

  it('is held with steel by a Hireling, who is not asked whom it costs', async () => {
    const o = await start('s1');
    await walk(o, hireling);
    await o.play(...swear('Say that you refuse nothing that is fairly paid for'), '=day 9 18:10', '>ombra__urn_hall', 'Order the Seconds to clear the stair with steel');
    expect(o.measure('handWay', 'hand_stair')).toBe(2);
    expect(o.holds('wr_crowd_bled', 'party')).toBe(true);
  }, 280_000);
});

describe('exploring', () => {
  it('never enters a state that cannot be, on or off the Stair', async () => {
    const o = await start('stairwalk', 3);
    await o.play('>ombra__hill_foot');
    let n = 0;
    for (let i = 0; i < 200; i++) {
      const offered = o.j.choices()
        .filter(c => !/^(Pack|a |an |the |some )/i.test(c.full) && !/Set down/.test(c.label) && !/^Wait/.test(c.label));
      if (!offered.length || i % 9 === 8) { await o.play('Wait › An hour'); continue; }
      const c = offered[(i * 11 + 3) % offered.length]!;
      try { await o.play(c.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); n++; } catch (e) { if (!o.running) { break; } throw e; }
      expect(o.measure('wr_height', 'party')).toBeLessThanOrEqual(9);
      if (o.holds('wr_sworn', 'party')) { expect(o.holds('wr_asked', 'party')).toBe(true); expect(o.holds('wr_blooded', 'party')).toBe(false); }
      if (o.holds('handReady', 'party', 'hand_stair')) { expect(o.holds('wr_sworn', 'party')).toBe(true); }
      for (const s of ['wr_marl', 'wr_pair', 'wr_dobb', 'wr_vask', 'wr_wend', 'wr_veil', 'wr_anselm', 'wr_rook', 'reeve']) {
        expect(o.at(s)).toBeDefined();
        expect(o.holds('dead', s) && o.holds('tolerates', s, 'party') && !o.holds('wr_slain', s)).toBe(false);
      }
    }
    expect(n).toBeGreaterThan(40);
    expect(o.page).not.toMatch(/undefined|\{\?/);
  }, 300_000);
});
