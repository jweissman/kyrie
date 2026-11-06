import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import type { Battle } from '../src/battle';
import type { Command } from '../src/model';

// Thrume's second pass (doc/imbar/adventures/thrume.md), played by the labels a player sees: the Paymasters' hall and its
// four ways round, the Shoulder Hall's child, its young blood and its wolves, the Saltgrave faces, the company's own
// voices, the world events Thrume reads, and the two payoffs at the edge of the Mouth. Starts that are not Saltgrave are
// fixtures (test/fixtures/thrume-depth); the first two tests use the shipped campaign.
const saltgrave = 'data/campaigns/thrume.campaign.json';
const depth = 'test/fixtures/thrume-depth/depth.campaign.json';
const hold = 'test/fixtures/thrume-depth/hold.campaign.json';
const camp = 'test/fixtures/thrume-depth/camp.campaign.json';
const mouth = 'test/fixtures/thrume-depth/mouth.campaign.json';
class T {
  static async start(campaign: string) {
    const s = await PlaySession.start(campaign, 'saltgrave', NodeBundleSource.shared);
    return { s, j: Journey.of(s) };
  }
  static holds(s: PlaySession, name: string, ...args: string[]) { return s.campaign.world.test(ModuleWriter.call(name, ...args)); }
  static measure(s: PlaySession, name: string, ...args: string[]) { return s.campaign.world.number(ModuleWriter.call(name, ...args)); }
  static fallen(s: PlaySession) {
    return s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id) && !c.state.hp).length;
  }
  static labels(j: Journey) { return j.choices().map(c => c.label); }
  // The company fights as a company fights: it strikes if it can, and does nothing cleverer.
  static fighter(this: void, battle: Battle): Promise<Command> {
    const legal = battle.legalCommands();
    return Promise.resolve(legal.find(c => c.ability === 'melee') ?? legal.find(c => c.ability !== 'flee') ?? legal[0]!);
  }
}
const toWages = ['?a torch: Light', '^To the cold forge', '^To the Paymasters'];

describe('Thrume: Saltgrave, the faces and the company\'s voices', () => {
  it('gives the clerk\'s history and the Exchange\'s errand; a cleric counts the sleepers\' breath; a provost with a daughter pays for a boy', async () => {
    const { s, j } = await T.start(saltgrave);
    let said = await j.play('^To the market', '^Into Dunmore', 'what is wrong', '^Out', '^Into the Salt Office', 'who crossed out CLOSED', 'who else buys the red salt');
    expect(said).toContain('We did it nine times');
    expect(T.holds(s, 'knows', 'party', 'thrume__orsett_buys')).toBe(true);
    said = await j.play('^To the provost', 'Read the Salt Office ledger', 'carts in his ledger');
    const gold = T.measure(s, 'quantity', 'party', 'gold');
    said = await j.play('Tell Provost Hauk');
    expect(said).toContain('Buy him back');
    expect(T.measure(s, 'quantity', 'party', 'gold')).toBe(gold + 20);
    expect(T.labels(j).some(l => /Tell Provost Hauk/.test(l))).toBe(false);
    // The money buys the boy: Col is freed on the same ten coin as before, with ten to spare.
    said = await j.play('^To the Salt Office', '^Out', '^Into the Red Lantern', '^To the smoke');
    expect(said).toContain('whose breath they are keeping');
  }, 120000);

  it('tells of the boots on the adit props, and of the hams in the Saltcellar, and of the pinch of white salt at the shrine door', async () => {
    const { j } = await T.start(saltgrave);
    let said = await j.play('^To the market', '^Into the Saltcellar', 'about the hams', '^Out', '^Into the Hearth-Mother', 'why the Salt Office leaves a pinch', 'the fire that never goes out');
    expect(said).toContain('the pig\'s own last dream');
    expect(said).toContain('a lamp on a rock out beyond the Combs');
    said = await j.play('^Out', '^To the carters', '^To the cart road', '?a torch: Light', '^To the old adit');
    expect(said).toContain('a hundred and twelve');
  }, 120000);
});

describe('Thrume: the Shoulder Hall', () => {
  it('has a ranger read the snow, a warrior the hall, a child sing the rhyme, a thane admit who he listens to, and a young blood give the wolves away', async () => {
    const { s, j } = await T.start(hold);
    let said = await j.play('Strike');
    expect(said).toContain('Nobody feeds hostages off their own plate');
    said = await j.play('^To the long hall');
    expect(said).toContain('it is not a fight they planned');
    said = await j.play('^To the mothers', 'Let Wenna put the company to bed');
    expect(said).toContain('Hollin, Orrab, Gur-and-Gwen');
    expect(T.holds(s, 'knows', 'party', 'thrume__wenna_rhyme')).toBe(true);
    said = await j.play('why every pillar has a row of pebbles', '^To the long hall', '^To the high seat', 'Wenna says the seat hums back');
    expect(said).toContain('Do not say so to Skarn');
    said = await j.play('^To the long hall', '^To the gate-yard', '^To the young bloods', 'Ask Skarn why the young bloods', 'Tell Skarn that his thane weeps');
    expect(said).toContain('there is no one to carry me');
    expect(T.holds(s, 'thrume__roused', 'thrume__hold')).toBe(false);
    expect(T.labels(j).some(l => /Tell Skarn/.test(l))).toBe(false);
    said = await j.play('^To the gate-yard', '^To the wolf-pens');
    expect(T.labels(j).some(l => /Blow Skarn's bone whistle/.test(l))).toBe(true);
    said = await j.play('Blow Skarn');
    expect(said).toContain('lie down in the straw');
    expect(T.holds(s, 'tolerates', 'thrume__wolves', 'party')).toBe(true);
  }, 180000);

  it('lets the ranger go in among the wolves with open hands, and offers the whistle no longer to a company that has not got it', async () => {
    const { s, j } = await T.start(hold);
    await j.play('Strike', '^To the wolf-pens');
    expect(T.labels(j).some(l => /Blow Skarn's bone whistle/.test(l))).toBe(false);
    const said = await j.play('Let the ranger go in among the wolves');
    expect(said).toContain('Nobody has touched one of them in a year but the girl');
    expect(T.holds(s, 'tolerates', 'thrume__wolves', 'party')).toBe(true);
    expect(T.labels(j).some(l => /Let the ranger go in/.test(l))).toBe(false);
    // The miners' lanterns are on the wall, and can be had.
    expect(T.labels(j).some(l => /^Take/.test(l))).toBe(true);
  }, 120000);
});

describe('Thrume: the Paymasters\' hall', () => {
  it('stands the company off with a quarrel it must settle, and lets a pay-roll be read before anything is struck', async () => {
    const { s, j } = await T.start(depth);
    let said = await j.play(...toWages);
    expect(said).toContain('hammers on the pegs');
    expect(said).toContain('SHE WAS NOT');
    said = await j.play('Read the pay-roll');
    expect(said).toContain('Both are waiting for you to say whose way it is');
    expect(T.holds(s, 'knows', 'party', 'thrume__gods_wage')).toBe(true);
    expect(T.holds(s, 'thrume__quarrelPaid', 'party')).toBe(true);
    // Four ways round, and a fifth that is not: all offered.
    for (const l of [/^Pay the Paid/, /^Say the office/, /^Attack/, /^Take/]) { expect(T.labels(j).some(x => l.test(x))).toBe(true); }
  }, 120000);

  it('is paid in crowns: twelve spent, the Paid stand down and keep the window, and no office can be said afterwards', async () => {
    const { s, j } = await T.start(depth);
    await j.play(...toWages, 'Read the pay-roll');
    const gold = T.measure(s, 'quantity', 'party', 'gold');
    const said = await j.play('Pay the Paid');
    expect(said).toContain('Short, and in a coin I do not know');
    expect(T.measure(s, 'quantity', 'party', 'gold')).toBe(gold - 12);
    expect(T.holds(s, 'thrume__paidSettled', 'thrume__paid')).toBe(true);
    expect(T.holds(s, 'tolerates', 'thrume__paid', 'party')).toBe(true);
    expect(T.labels(j).some(l => /^Say the office/.test(l))).toBe(false);
    expect(T.holds(s, 'knows', 'party', 'thrume__smith_names')).toBe(false);
  }, 120000);

  it('is paid out of the tray at no cost: the last day\'s wage was on the counter the whole time', async () => {
    const { s, j } = await T.start(depth);
    await j.play(...toWages, 'Read the pay-roll', '^Take$');
    const gold = T.measure(s, 'quantity', 'party', 'gold');
    const said = await j.play('Hand the Paid the bars');
    expect(said).toContain('It was always on the counter');
    expect(T.measure(s, 'quantity', 'party', 'gold')).toBe(gold);
    expect(T.holds(s, 'thrume__paidSettled', 'thrume__paid')).toBe(true);
  }, 120000);

  it('knows its master\'s hammer', async () => {
    const { s, j } = await T.start(depth);
    await j.play('?a torch: Light', '^To the cold forge', '^To the iron library', '^To the Master', '^Take$');
    const said = await j.play('^To the iron library', '^To the cold forge', '^To the Paymasters', 'Show the Paid the Smith-Master');
    expect(said).toContain('We kept the window. We were not told to stop');
    expect(T.holds(s, 'thrume__paidSettled', 'thrume__paid')).toBe(true);
  }, 120000);

  it('is closed by a cleric\'s office, which costs an afternoon and a torch, and teaches the names the Mouth will want', async () => {
    const { s, j } = await T.start(depth);
    const cell = await j.play('?a torch: Light', '^To the cold forge', '^To the iron library', '^To the Master');
    expect(cell).toContain('nobody has said a word over him');
    await j.play('^To the iron library', '^To the cold forge', '^To the Paymasters', 'Read the pay-roll');
    const before = j.watch(), gold = T.measure(s, 'quantity', 'party', 'gold');
    const said = await j.play('Say the office');
    expect(said).toContain('At each name the taller of the Paid says, quietly, \'Here,\'');
    expect(j.watch() - before).toBeGreaterThanOrEqual(18);
    expect(T.holds(s, 'knows', 'party', 'thrume__smith_names')).toBe(true);
    expect(T.holds(s, 'thrume__paidLaid', 'thrume__paid')).toBe(true);
    expect(T.holds(s, 'at', 'thrume__paid', 'thrume__wage_hall')).toBe(false);
    expect(T.measure(s, 'quantity', 'party', 'gold')).toBe(gold);
  }, 120000);

  it('can be fought, and wins nothing but a ring in the iron: the sleeper stirs, and the company is hurt', async () => {
    const { s, j } = await T.start(depth);
    await j.play(...toWages);
    const attack = j.choices().find(c => c.label === 'Attack')!;
    expect(T.measure(s, 'thrume__stirring', 'thrume__fells')).toBe(2);
    const event = await s.perform(attack.command, T.fighter);
    expect(event.combat.some(e => e.type === 'end')).toBe(true);
    expect(T.holds(s, 'dead', 'thrume__paid')).toBe(true);
    expect(T.measure(s, 'thrume__stirring', 'thrume__fells')).toBe(3);
    expect(T.fallen(s)).toBeGreaterThanOrEqual(1);
  }, 180000);
});

describe('Thrume: the overseer', () => {
  it('is the worst liar in the Margravine\'s service, and is seen at the Salt Office door being one', async () => {
    const { s, j } = await T.start(camp);
    const said = await j.play('?a torch: Light', 'what he will tell the Margravine');
    expect(said).toContain('I will tell it badly');
    expect(T.holds(s, 'thrume__brannocLies', 'thrume__brannoc')).toBe(true);
    const market = await j.play('>market');
    expect(market).toContain('the worst liar in the Margravine\'s service');
  }, 120000);
});

describe('Thrume: a company that dithers', () => {
  it('has an hour to say its business at the window, and is fallen on by the Paid if it does not', async () => {
    const { s, j } = await T.start(depth);
    await j.play(...toWages);
    expect(T.holds(s, 'thrume__paidWaited', 'thrume__paid')).toBe(true);
    await j.play('Read the pay-roll', '^Wait › An hour');
    for (let i = 0; i < 3 && !T.holds(s, 'dead', 'thrume__paid') && !T.fallen(s); i++) {
      try { await j.play('^Wait › An hour'); } catch { break; }
    }
    expect(T.holds(s, 'dead', 'thrume__paid') || T.fallen(s) > 0).toBe(true);
  }, 180000);
});

describe('Thrume: what it reads of the world, and the payoffs at the Mouth', () => {
  it('marks a twelfth stroke on the Gauge when a black square has been opened a long way off', async () => {
    const { s, j } = await T.start(depth);
    await j.play('?a torch: Light', '^To the cold forge');
    const quiet = await j.play('^To the Gauge');
    expect(quiet).not.toContain('twelfth is not blank');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('befell', 'slack_opened') }]));
    await j.play('^To the cold forge');
    expect(await j.play('^To the Gauge')).toContain('twelfth is not blank');
  }, 120000);

  it('sings the smiths\' names after the old ones\', and finishes the line a child began, only for a company that has them', async () => {
    const plain = await T.start(mouth);
    const sung = await plain.j.play('Sing the keepers');
    expect(sung).toContain('the Mouth closes');
    expect(sung).not.toContain('count it fast');
    expect(sung).not.toContain('Ysolt Fenn');
    const rich = await T.start(mouth);
    const c = rich.s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    for (const f of ['smith_names', 'wenna_rhyme']) { c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', `thrume__${f}`) }])); }
    const said = await rich.j.play('Sing the keepers');
    expect(said).toContain('Ysolt Fenn, and a hundred and six more');
    expect(said).toContain('count it, count it, count it fast');
  }, 120000);
});
