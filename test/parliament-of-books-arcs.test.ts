import { describe, expect, it } from 'bun:test';
import { Arcs, Calamy, C, Steps } from './support/calamy';
import type { Journey } from '../src/session/journey';

// The arcs of A Parliament of Books: Hester Rhule's three ends, the Recall, the Lexicon unchained, the bestiary in the
// bond, and the night the Awls come to Doble's yard (doc/adventures/parliament-of-books).
const reached = (j: Journey) => j.campaign.world.related('reached').map(r => r.args[0]);
const until = async (j: Journey, watch: number) => { try { await j.play(`=${watch}`); } catch (e) {
  if (!reached(j).length) { throw e; } } };
const doubt = (j: Journey) => j.measure(C('doubt'), C('rhule'));
const warrior = [{ name: 'Brand', raceId: 'human', classId: 'warrior', backgroundId: 'soldier', level: 3 }];

describe('A Parliament of Books: Hester Rhule', () => {
  it('becomes the Advocate of Books: shown the cry, a kept secret and the first term, she stops the burnings and spares the Kindling', async () => {
    const j = await Calamy.start('advocate');
    await Calamy.play(j, ...Arcs.rhuleKept);
    expect(doubt(j)).toBeGreaterThanOrEqual(5);
    await Calamy.play(j, '=182', 'go:rhule_room', 'Talk to Hester', 'stop the Thursday', 'Take your leave');
    expect(Calamy.holds(j, 'burningsStopped', 'rhule')).toBe(true);
    const from = j.taken.length;
    await Calamy.play(j, 'go:ashpit', '=650');
    // Thursday comes round on the fifth day, and there is no brazier.
    expect(Calamy.said(j, from)).not.toContain('A penny almanack, then another');
    await until(j, 1240);
    expect(Calamy.holds(j, 'rhuleAdvocate', 'rhule')).toBe(true);
    expect(Calamy.holds(j, 'almanacksSpared', 'ashpit')).toBe(true);
    // Nobody went to the Parliament: the Speaker's motion stands, and the Quick are called home, but not burned.
    await until(j, 1300);
    expect(reached(j)).toEqual([C('recalled')]);
  }, 600000);

  it('goes back to her father\'s trade when she has been lied to: and with no one to stop it, the almanacks burn, and the Ash comes', async () => {
    const j = await Calamy.start('binder');
    await Calamy.play(j, ...Arcs.rhuleLied);
    expect(Calamy.holds(j, 'liedTo', 'rhule')).toBe(true);
    expect(doubt(j)).toBeGreaterThanOrEqual(2);
    await Calamy.play(j, 'go:ashpit');
    await until(j, 1240);
    expect(Calamy.holds(j, 'rhuleBinder', 'rhule')).toBe(true);
    expect(Calamy.holds(j, 'almanacksBurned', 'ashpit')).toBe(true);
    await until(j, 1300);
    expect(reached(j)).toEqual([C('ashen')]);
  }, 600000);

  it('lights the Kindling herself when nobody has shown her anything', async () => {
    const j = await Calamy.start('burner');
    await Calamy.play(j, 'go:ashpit');
    await until(j, 1222);
    expect(Calamy.holds(j, 'rhuleBurner', 'rhule')).toBe(true);
    expect(Calamy.said(j)).toContain('stands at the foot of the pile in grey with a lit torch');
  }, 300000);
});

describe('A Parliament of Books: the bond and the yard', () => {
  it('is turned out of the bond at dusk, goes back in by lantern-light on purpose, reads the beasts home, and is paid', async () => {
    const j = await Calamy.start('bond');
    await Calamy.play(j, 'go:customs_yard', 'Talk to Mr. Sallis', 'claw-marks', 'Take your leave', 'go:gallon_shop', 'Buy › A lantern',
      'Buy › A flask', 'go:bond_loft', 'Talk to the Hithe Bestiary', 'what happened', 'beasts might be called', 'Take your leave',
      'go:bond_floor', '=78', 'Fill a lantern', 'lift the bar on the bond gate', 'go:bond_floor', 'Read the bonnacon', 'go:bond_loft', 'Read the manticore', 'Read the caladrius', '=+2');
    expect(Calamy.holds(j, 'bestiaryQuiet', 'bestiary')).toBe(true);
    expect(Calamy.knows(j, 'bestiary_unsewn')).toBe(true);
    await Calamy.play(j, 'go:customs_yard', 'Talk to Mr. Sallis', 'bond is quiet', 'Take your leave');
    expect(Calamy.holds(j, 'paidBySallis', 'sallis')).toBe(true);
  }, 180000);

  it('fetches Warden Mott to Sew the bestiary, and it goes home', async () => {
    const j = await Calamy.start('sewn');
    await Calamy.play(j, 'go:bond_loft', 'Talk to the Hithe Bestiary', 'what happened', 'Take your leave', 'go:hall_floor', 'Talk to Warden',
      'Sew the bestiary', 'Take your leave', '=+6');
    expect(Calamy.holds(j, 'bestiaryResewn', 'bestiary')).toBe(true);
    expect(Calamy.said(j)).toContain('Warden Mott of the Binders has spent the day');
  }, 180000);

  // The Awls are three against one. A lone warrior of the third level, weary and hungry at one in the morning after
  // three days awake (this path never sleeps), loses nearly every time; rested and fed, wins about one night in eight
  // (M17-45, for the adventure's authors). Here the company has slept and eaten, and the night's dice are a seed's on
  // which it wins: the moment before a fight that came at the company (PT-10) changed the dice the first seed had.
  it('is in Doble\'s yard when the Awls come, and beats them off; Kit Sews the Pleas', async () => {
    const j = await Calamy.start('awls8', warrior);
    await Calamy.play(j, 'go:hall_floor', 'Talk to Warden', 'eats his dinner', 'Take your leave', 'go:press_room', 'Talk to Kit',
      'what would bring him back', 'Take your leave', 'go:hall_floor', 'Talk to Warden', 'journeyman.s wage', 'Take your leave',
      'go:press_room', 'Talk to Kit', 'Warden says yes', '?Take your leave', 'go:doble_office', 'Talk to Ambrose', 'what he is printing',
      'Sewn before they go out', 'Take your leave', 'go:press_yard', '=520');
    const rested = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    rested.commit(rested.world.apply(['weary', 'hungry'].map(name => ({ kind: 'retract', call: { kind: 'call', name, args: ['party'] } }))));
    await Calamy.play(j, '=534', '=+2', '=+2');
    expect(Calamy.holds(j, 'kitSewsPrint', 'kit')).toBe(true);
    expect(Calamy.holds(j, 'awlsStopped', 'saul')).toBe(true);
    expect(Calamy.holds(j, 'pressBroken', 'doble')).toBe(false);
    await Calamy.play(j, '=790');
    expect(Calamy.holds(j, 'pleasPrinted', 'doble')).toBe(true);
    expect(j.campaign.world.test({ kind: 'call', name: C('pleasAwake'), args: [C('doble')] })).toBe(false);
  }, 300000);
});

describe('A Parliament of Books: the Lexicon', () => {
  it('strikes the Lexicon\'s chains: it votes for anything, the Housebook will not sit with it, and the ninth page is learned', async () => {
    const j = await Calamy.start('vask', warrior);
    await Calamy.play(j, ...Steps.corvell, 'go:corvell_hall', 'Talk to Sir Gideon', 'left of their own accord', 'Take your leave',
      'go:crake_front', 'Talk to Absalom', 'Tell Absalom Crake you told', 'take you where the books go', 'Take your leave', 'go:crake_parlour',
      'ribbon: Take', 'go:reading_room', 'Talk to the Catalogue', 'about the Black Lexicon', 'Take your leave', 'go:gloss_wood', '=+2', '=+2',
      'go:vask_foot', 'Name the Black Letters', 'go:vask_top', 'Talk to the Black Lexicon', 'where it stands', 'what it would give',
      'Take your leave', 'Strike the three chains');
    expect(Calamy.holds(j, 'lexiconFreed', 'lexicon')).toBe(true);
    expect(Calamy.holds(j, 'housebookOffended', 'housebook')).toBe(true);
    const brand = j.campaign.readout.creatures.find(c => c.name === 'Brand')!;
    expect([...brand.base.abilities, ...brand.state.learnedAbilities]).toContain('finger_of_death');
    expect(Calamy.holds(j, 'favours', 'lexicon', 'sew_leave')).toBe(true);
  }, 300000);
});
