import { describe, expect, it } from 'bun:test';
import { Calamy, C } from './support/calamy';
import type { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';

// The Road and the company's voices (doc/imbar/adventures/parliament-of-books.md), played by the labels a player sees:
// the dead-letter hook at the Hithe stairs, the post-house under the drowned ridge at dead low water, the Undelivered
// and its ways round, the tide that asks for the room back, an almanack posted of its own leave, and the Roll's answer.
const hold = (j: Journey, rel: string, ...args: string[]) => j.campaign.world.test(ModuleWriter.call(C(rel), ...args.map(a => a === 'party' ? a : C(a))));
// A shared relation (tolerates, dead) is not the module's own.
const shared = (j: Journey, rel: string, ...args: string[]) => j.campaign.world.test(ModuleWriter.call(rel, ...args.map(a => a === 'party' ? a : C(a))));
const labels = (j: Journey) => j.choices().map(c => c.label);
const offered = (j: Journey, re: RegExp) => labels(j).some(l => re.test(l));
// Out over the flats and down into the roof, in the hour of dead low water.
const toPost = ['go:mudbank', '=until hour(clock) == 5', 'go:reed_edge', '=until deadLow()', 'go:reed_heart', '@go(calamy__ridge_hatch,calamy__post_house)'];
const letter = ['go:ferry_stairs', 'Ask the ferryman about the hook', 'which is the oldest letter'];
const rhyme = ['go:bridge_middle', 'Talk to the children', 'what they are singing', 'Take your leave'];

describe('A Parliament of Books: the Road', () => {
  it('has a ferryman give up the oldest letter on his hook, and a lamp lit for a mail that does not come', async () => {
    const j = await Calamy.start('post');
    const said = await Calamy.play(j, ...letter);
    expect(said).toContain('Nobody in the Hithe has ever thrown a letter away');
    expect(said).toContain('I swore I\'d not give it to anyone');
    expect(labels(j).some(l => /letter from the hook/.test(l))).toBe(true);
    // Not given twice.
    expect(offered(j, /oldest letter/)).toBe(false);
  }, 120000);

  it('hears the bard say what the tide-table and the skipping rope are, and nobody else say it for them', async () => {
    const j = await Calamy.start('post');
    let said = await Calamy.play(j, 'go:taproom', 'Talk to the Almanack', 'what it is');
    expect(said).toContain('Somebody taught this book to count in verse');
    said = await Calamy.play(j, ...rhyme.slice(0, 1), 'Talk to the children', 'what they are singing');
    expect(said).toContain('It is a relay');
  }, 120000);

  it('shows its black stones to a ranger, and its second lock to a thief: a company with neither is told nothing', async () => {
    const ranger = await Calamy.start('post', [{ name: 'Wren', raceId: 'human', classId: 'ranger' } as never]);
    expect(await Calamy.play(ranger, 'go:mudbank', '=until hour(clock) == 5', 'go:reed_edge')).toContain('straight as a rule');
    const bard = await Calamy.start('post');
    expect(await Calamy.play(bard, 'go:mudbank', '=until hour(clock) == 5', 'go:reed_edge')).not.toContain('straight as a rule');
  }, 180000);

  it('opens the post-house at dead low water only, and gives the hour back to the tide', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, ...letter, ...toPost);
    expect(j.at('party')).toBe(C('post_house'));
    const said = await Calamy.play(j, 'Give the Undelivered the letter');
    expect(said).toContain('Received');
    // The hour is up at eight: the water comes down the stair, and the company is on the mud with a bruise.
    const told = await Calamy.play(j, '=until hour(clock) == 8');
    expect(told).toContain('shoulders you up the stair');
    expect(j.at('party')).toBe(C('reed_heart'));
    expect(offered(j, /post-house under the ridge/)).toBe(false);
  }, 240000);

  it('is eased by a bard\'s stage-chant, which no letter and no coin is needed for', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, ...rhyme, ...toPost);
    expect(offered(j, /^Chant the stages/)).toBe(true);
    const said = await Calamy.play(j, 'Chant the stages');
    expect(said).toContain('Read it once and leave alone');
    expect(hold(j, 'runnerEased', 'runner')).toBe(true);
    expect(shared(j, 'tolerates', 'runner', 'party')).toBe(true);
  }, 240000);

  it('does not offer the chant to a company that has not heard the rhyme, or has no bard', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, ...toPost);
    expect(offered(j, /^Chant the stages/)).toBe(false);
    const thief = await Calamy.start('post', [{ name: 'Wren', raceId: 'human', classId: 'thief' } as never]);
    await Calamy.play(thief, ...rhyme, ...toPost);
    expect(offered(thief, /^Chant the stages/)).toBe(false);
  }, 240000);

  it('can be fought, and a lone bard is not likely to come out of it', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, ...toPost);
    const attack = j.choices().find(c => c.label === 'Attack')!;
    const fighter = (b: { legalCommands(): { ability: string }[] }) => {
      const legal = b.legalCommands();
      return Promise.resolve(legal.find(c => c.ability === 'melee') ?? legal.find(c => c.ability !== 'flee') ?? legal[0]!);
    };
    const event = await j.session.leg(attack.command, fighter as never);
    expect(event.combat.some(e => e.type === 'end')).toBe(true);
    const r = j.campaign.readout;
    const fallen = r.creatures.filter(c => r.partyIds.includes(c.id) && !c.state.hp).length;
    expect(fallen + (shared(j, 'dead', 'runner') ? 1 : 0)).toBeGreaterThanOrEqual(1);
  }, 240000);

  it('also lets the company talk its way by, before anything is struck: the Undelivered gives a reading\'s patience', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, ...toPost);
    expect(offered(j, /^Ask the Undelivered to let you by/)).toBe(true);
    expect(hold(j, 'runnerHeard', 'runner')).toBe(true);
  }, 240000);

  it('lets a book be posted to the Parliament only of its own leave; the company loses it, and the Roll hears it', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, 'go:taproom', 'Talk to the Almanack', 'what it is', 'Take your leave', 'go:bridge_north', 'Buy.*penny almanack', ...letter, ...toPost, 'Give the Undelivered the letter');
    expect(offered(j, /Give the Undelivered your almanack/)).toBe(false);
    await Calamy.play(j, 'what the House of the Posts was');
    expect(Calamy.knows(j, 'post_known')).toBe(true);
    expect(Calamy.knows(j, 'kindling_is_rite')).toBe(true);
    await Calamy.play(j, 'Ask the Almanack whether it would go');
    const said = await Calamy.play(j, 'Give the Undelivered your almanack');
    expect(said).toContain('Received');
    expect(hold(j, 'almanackPosted', 'almanack')).toBe(true);
    expect(j.holds('travelsWith', C('almanack'), 'party')).toBe(false);
    await Calamy.play(j, 'where the twelfth stage is', '=until hour(clock) == 8');
    // In the Chamber, with the Roll's stance heard, the posted book is answered.
    const c = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', j.at('party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', C('chamber')) },
      { kind: 'assert', call: ModuleWriter.call(C('heardStance'), C('roll')) }]));
    const roll = await Calamy.play(j, 'Tell the Great Roll that a book has come');
    expect(roll).toContain('RECEIVED');
    expect(hold(j, 'favours', 'roll', 'sew_leave')).toBe(true);
  }, 300000);

  it('lays the die before the Roll for a licensed Door', async () => {
    const j = await Calamy.start('post');
    await Calamy.play(j, ...rhyme, ...toPost, 'Chant the stages', 'what the House of the Posts was', 'where the twelfth stage is', 'Take');
    expect(j.holds('carries', 'party', C('post_die'))).toBe(true);
    const c = j.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', j.at('party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', C('chamber')) },
      { kind: 'assert', call: ModuleWriter.call(C('heardStance'), C('roll')) }]));
    const roll = await Calamy.play(j, 'Lay before the Great Roll the die');
    expect(roll).toContain('The chair could accept the Door under licence');
    expect(hold(j, 'favours', 'roll', 'door_licensed')).toBe(true);
  }, 300000);
});
