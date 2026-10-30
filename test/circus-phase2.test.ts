import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// Wapshott's Peregrine Circus, Phase II: The Crowned Wheel (doc/adventures/wapshotts-circus/phase2.md). Played over
// the host towns of test/fixtures/circus. The Goose Fair is held on days 10 to 12 and the note is reckoned at ten on
// the twelfth; the letter comes when the wagons reach the second town on the thirteenth; the Revels round goes up to
// the King's Rest for days 22 to 24, and the Revels are on the night of the twenty-fourth.
const host = 'test/fixtures/circus/circus.campaign.json';
const c = (id: string) => `circus__${id}`;
const id = (a: string) => a === 'party' ? 'party' : c(a);
class Tour {
  static async start(seed = 'p2') { return new Tour(await Journey.start(host, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(c(name), ...args.map(id)); }
  knows(fact: string) { return this.j.holds('knows', 'party', c(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(c(name), ...args.map(id)); }
  at(who: string) { return this.j.campaign.world.one('at', id(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  // What is so, set directly: a fact (name, args), a measure (set, name, args, value), or a fact retracted (not, ...).
  stage(...facts: string[][]) {
    type Staged = { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    const w = this.j.campaign as unknown as Staged;
    w.commit(w.world.apply(facts.map(([name, ...args]): Change => {
      if (name === 'set') { return { kind: 'set', call: ModuleWriter.call(c(args[0]!), ...args.slice(1, -1).map(id)), value: ModuleWriter.number(Number(args.at(-1))) }; }
      if (name === 'not') { return { kind: 'retract', call: ModuleWriter.call(c(args[0]!), ...args.slice(1).map(id)) }; }
      if (name === 'at') { return { kind: 'assert', call: ModuleWriter.call('at', id(args[0]!), id(args[1]!)) }; }
      if (name === 'knows') { return { kind: 'assert', call: ModuleWriter.call('knows', 'party', c(args[0]!)) }; }
      return { kind: 'assert', call: ModuleWriter.call(c(name), ...args.map(id)) };
    })));
    return this;
  }
  // To the Fair's reckoning with the company known to the circus and out of the way at the inn; then one outcome.
  static async reckoned(outcome: 'paid' | 'torn' | 'merged', seed = 'p2') {
    const t = await Tour.start(seed);
    await t.play('=day 1 14:30', '^To Wapshott', 'Talk to Ada', '>host__a_tap', '=day 10 15:00');
    if (outcome === 'paid') { t.stage(['set', 'fairScore', 'wapshotts', '20'], ['set', 'strongbox', 'wapshotts', '30']); }
    if (outcome === 'torn') { t.stage(['sleeExposed', 'slee'], ['set', 'strongbox', 'wapshotts', '0']); }
    await t.play('=day 12 23:00');
    return t;
  }
}

describe("Wapshott's, after the Goose Fair: the letter", () => {
  it('brings the Clerk of the Household to the second town on the first day of the next stand, whatever the reckoning', async () => {
    for (const outcome of ['paid', 'torn', 'merged'] as const) {
      const t = await Tour.reckoned(outcome);
      expect(t.holds(outcome === 'paid' ? 'noteDischarged' : outcome === 'torn' ? 'noteTorn' : 'merged', 'wapshotts')).toBe(true);
      await t.play('=day 13 19:00');
      expect(t.holds('letterCome', 'wapshotts')).toBe(true);
      expect(t.measure('revelsDay', 'wapshotts')).toBe(24);
      expect(t.at('tobias')).toBe(c('wagons_b'));
    }
  }, 600000);

  it('keeps what Phase I made: the menagerie, the training, the friendships go on round', async () => {
    const t = await Tour.start();
    t.stage(['fallLearned', 'party'], ['answerLearned', 'party'], ['exhibit', 'methuselah'], ['travels', 'methuselah'], ['post', 'methuselah', 'rk_beasts'],
      ['menagerieOpen', 'wapshotts'], ['feudMended', 'hal']);
    await t.play('=day 1 14:30', '^To Wapshott', 'Talk to Ada', '>host__a_tap', '=day 13 19:00');
    expect(t.holds('exhibit', 'methuselah')).toBe(true);
    expect(t.at('methuselah')).toBe(c('beasts_b'));
    expect(t.holds('fallLearned', 'party')).toBe(true);
    await t.play('>' + c('yard_b'), 'Ask Mumchance about the Riposte');
    expect(t.page).toContain('The fifth I never taught anybody');
  }, 300000);
});

describe('the three reckonings carry on differently', () => {
  it('united: Cordelia refuses Sir Gervase, cancels the coach, pays the wages, and her horses and lion are in the show', async () => {
    const t = await Tour.reckoned('merged');
    await t.play('=day 13 19:00', '>' + c('tober_b'), '=day 16 12:00');
    expect(t.holds('fundsFound', 'wapshotts')).toBe(true);
    expect(t.holds('fenwickSigned', 'wapshotts')).toBe(false);
    expect(t.holds('coachStopped', 'wapshotts')).toBe(true);
    expect(t.holds('exhibit', 'neb')).toBe(true);
    expect(t.measure('arrears', 'wapshotts')).toBe(0);
    await t.play('>' + c('tober_c'), '=day 16 18:40', 'Buy a ticket', '>' + c('ring_c'), '=day 16 20:00');
    expect(t.page).toContain('twelve white horses');
  }, 400000);

  it('paid: the Colonel signs Sir Gervase\'s contract as it stands unless someone strikes its clauses, and Billie gives up the beasts', async () => {
    const t = await Tour.reckoned('paid');
    await t.play('=day 14 12:00');
    expect(t.holds('fenwickCome', 'fenwick')).toBe(true);
    await t.play('=day 17 12:00');
    expect(t.holds('fenwickSigned', 'wapshotts')).toBe(true);
    expect(t.holds('billieQuit', 'billie')).toBe(true);
    const u = await Tour.reckoned('paid');
    await u.play('=day 14 12:00', '>' + c('tober_b'), 'Ask Sir Gervase what brings him');
    u.stage(['not', 'clauseBeasts', 'wapshotts']);
    await u.play('=day 17 12:00');
    expect(u.holds('fenwickSigned', 'wapshotts')).toBe(true);
    expect(u.holds('billieQuit', 'billie')).toBe(false);
  }, 600000);

  it('torn: Madame Sallow is a rival again at the Revels, and may lend the old lion to Wapshott\'s procession', async () => {
    const t = await Tour.reckoned('torn');
    t.stage(['knows', 'inventory_known'], ['knows', 'lion_well'], ['knows', 'rest_heard'], ['knows', 'rivals_known']);
    await t.play('=day 24 17:30', '>' + c('revels_hall'));
    expect(t.at('sallow')).toBe(c('revels_hall'));
    await t.play('Ask Madame Sallow to let Nebuchadnezzar walk', 'Say that the Colonel sits up at night');
    expect(t.holds('lionLent', 'neb')).toBe(true);
  }, 600000);
});

describe('the Revels round', () => {
  it('goes up the hill to the King\'s Rest for its last stand, and back to the second town\'s field after', async () => {
    const t = await Tour.reckoned('merged');
    await t.play('=day 22 16:00');
    expect(t.holds('here', 'tober_r')).toBe(true);
    expect(t.at('wapshott')).not.toBe(c('wagons_b'));
    await t.play('=day 26 16:00');
    expect(t.holds('here', 'tober_c')).toBe(true);
    expect(t.j.holds(c('nextGround'), c('tober_a'), c('tober_b'))).toBe(true);
  }, 600000);

  it('gives the office to Pell\'s Comedians if nobody helps Wapshott\'s, with the Dowager\'s appointment for comfort', async () => {
    const t = await Tour.reckoned('merged');
    await t.play('=day 24 23:30');
    expect(t.holds('revelsDone', 'wapshotts')).toBe(true);
    expect(t.holds('warrantPell', 'wapshotts')).toBe(true);
  }, 600000);

  it('gives it to Wapshott\'s for a Rest made fit and a Triumph well played, and the Long Court becomes its stand', async () => {
    const t = await Tour.reckoned('merged');
    t.stage(['knows', 'rest_heard'], ['knows', 'letter_known']);
    await t.play('=day 24 16:00', '>' + c('revels_hall'));
    t.stage(['hallRoofed', 'wapshotts'], ['densFit', 'wapshotts'], ['warmGlazed', 'wapshotts'], ['cloudMended', 'wapshotts'], ['ascensionRigged', 'wapshotts'],
      ['clemencyFolly', 'clemency'], ['set', 'regard', 'tom', '1']);
    await t.play('=day 24 23:30');
    expect(t.page).toContain('MASTER OF THE REVELS AND KEEPER OF THE MENAGERIE ROYAL');
    expect(t.holds('warrantOurs', 'wapshotts')).toBe(true);
    expect(t.holds('warrantFenwick', 'wapshotts')).toBe(false);
    await t.play('>host__b_tap', '=day 33 16:00');
    expect(t.holds('here', 'tober_r')).toBe(true);
  }, 600000);

  it('gives the Keepership to Sir Gervase if the Colonel signed the first clause and the circus wins', async () => {
    const t = await Tour.reckoned('paid');
    await t.play('=day 24 16:00');
    t.stage(['hallRoofed', 'wapshotts'], ['densFit', 'wapshotts'], ['warmGlazed', 'wapshotts'], ['cloudMended', 'wapshotts'], ['ascensionRigged', 'wapshotts'],
      ['clemencyFolly', 'clemency'], ['set', 'regard', 'tom', '1'], ['partnered', 'party']);
    await t.play('=day 24 23:30');
    expect(t.holds('fenwickSigned', 'wapshotts')).toBe(true);
    expect(t.holds('warrantFenwick', 'wapshotts')).toBe(true);
  }, 600000);
});

describe('the King\'s Rest and its Inventory', () => {
  it('has an old keeper with a book, a raven with a seal, and a tortoise that can go home', async () => {
    const t = await Tour.reckoned('merged');
    t.stage(['exhibit', 'methuselah'], ['travels', 'methuselah'], ['post', 'methuselah', 'rk_beasts'], ['menagerieOpen', 'wapshotts']);
    await t.play('=day 13 19:00', '>host__b_tap', 'Ask Will Pargeter about the walls on the hill', '>' + c('keeper_lodge'), 'Talk to Jabez', 'Ask Jabez why he keeps',
      'Ask Jabez to show you the Keepers', 'Ask Jabez what the notes', 'Tell Jabez that Wapshott');
    expect(t.knows('bishop_identified')).toBe(true);
    await t.play('>' + c('wagons_b'), 'Tell Tobias that the tortoise');
    await t.play('=day 14 12:30', '>' + c('wagons_b'), 'Put it to the Colonel that the Bishop');
    expect(t.holds('bishopHome', 'methuselah')).toBe(true);
    await t.play('>host__b_tap', '=day 22 16:00');
    expect(t.holds('bishopAtRest', 'methuselah')).toBe(true);
    expect(t.at('methuselah')).toBe(c('beast_yard'));
  }, 600000);

  it('gets the seal back from the raven with Hench\'s spangles', async () => {
    const t = await Tour.reckoned('merged');
    t.stage(['knows', 'rest_heard'], ['knows', 'seal_seen'], ['knows', 'letter_known']);
    await t.play('=day 13 19:00', '>' + c('wagons_b'), 'Ask Hench for a handful of spare spangles');
    t.stage(['at', 'party', 'gate_tower']);
    await t.play('=day 14 10:00', 'Spread Hench', '>' + c('wagons_b'), 'Give the Steward');
    expect(t.holds('sealBack', 'tobias')).toBe(true);
  }, 600000);

  it('drains the marl-pit with Honoria\'s arm, finds the King\'s diggers\' stone and the claw, and the Colonel sees it', async () => {
    const t = await Tour.reckoned('merged');
    await t.play('=day 16 19:00', '>host__c_green', 'Ask Sim Tull about the marl-pit', '>' + c('yard_c'), 'Ask Honoria to come and turn the sluice');
    await t.play('=day 17 9:00', '>' + c('pit_water'));
    expect(t.knows('worm_stone')).toBe(true);
    expect(t.page).toContain('NOT DEAD ENOUGH');
    await t.play('Collect the great claw', '>' + c('wagons_c'), 'Show the Colonel the great claw');
    expect(t.holds('clawToColonel', 'wapshott')).toBe(true);
  }, 600000);
});

describe('the company\'s own lives in the Revels round', () => {
  it('marries Honoria and Mumchance in the chapel of the Rest on the day before the Revels, with or without the company', async () => {
    const t = await Tour.reckoned('merged');
    await t.play('=day 23 15:00');
    expect(t.holds('weddingDone', 'honoria')).toBe(true);
  }, 600000);

  it('brings Kit Darrow over from Pell\'s to learn to fall, if Pip is told he should', async () => {
    const t = await Tour.reckoned('merged');
    t.stage(['set', 'kitNights', 'kit', '2']);
    await t.play('=day 14 10:00', '>' + c('ring_b'), 'Ask Pip about the boy', 'Tell Pip that Kit should come', '=day 23 15:00');
    expect(t.holds('kitJoins', 'kit')).toBe(true);
  }, 600000);
});
