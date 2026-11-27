import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../../src/lang/index';
import { ScreenModel } from '../../src/ui/screen-model';
import { Tiny } from '../support/tiny';

// Each probe on the kernel and the packages it reads (OR-407).
const start: typeof Tiny.start = (kyr, options = {}) => Tiny.start(kyr, { horizon: ['belongings', 'probing', 'inhabitants'], ...options });

const call = (name: string, ...args: string[]) => ModuleWriter.call(name, ...args);
const sky = `
  Place upper "Mero, the upper isle" is room at 0, 0 outdoors.
  Place lower "Nacre, the lower isle" is room at 0, 2 outdoors.
  Place basin "the receiving basin" is room within lower at 0, 2 outdoors.
  Passage fall "the waterfall between Mero and Nacre" is drift between upper and basin one way taking 10 minutes.
  Company party "You" of 1 at upper.
  Entity sky: terrainkind "sky".
  Kind sky_jar "a sealed jar of green clay" is gear worth 0 weighing 0.
  Initially Assert terrain(upper, sky). Initially Assert terrain(lower, sky). Initially Assert terrain(basin, sky).
  Item jar "a sealed jar of green clay" is sky_jar at upper.
  Relation falling(item). Relation warningSent(group).
  Discovery falling_bell "The upper isle warned that the windward line had parted.".
  Action send_warning(actor: group) "Ring the warning-bell into the fall" {
    Requires able(actor) and company(actor) and at(actor, upper) and not warningSent(actor).
    On success { Assert warningSent(actor). }
    Result "The bell-note drops with the water; its echo no longer returns to Mero.".
  }
  Action release_jar(actor: group, carrier: member, site: place) "Let the green-clay jar fall into the water" {
    Requires able(actor) and at(actor, site) and at(actor, upper) and memberOf(carrier, actor)
      and ownedItem(jar, carrier).
    Resolve drop(jar, carrier).
    On success { Assert falling(jar). Assert at(jar, upper). }
    Result "The jar turns once in the white air, enters the fall, and is gone below.".
  }
  Rule gravity when falling(?x) and at(?x, upper) {
    Retract at(?x, upper). Assert at(?x, basin). Retract falling(?x).
  }
  Thing kite "the wind-kite above the basin" at basin {
    State furled "The kite lies spread on the stone, its lift-lines crossed and loose.".
    State caught "The kite fills like a lung and tugs at the line toward Mero.".
    Change raise "Raise the wind-kite in the updraft" from furled to caught.
  }
  Passage lift "the wind-kite's upward climb" is drift between basin and upper one way
    opening when state(kite, caught) taking 20 minutes.
  Action lower_jar(actor: group) "Take the jar from the receiving basin" {
    Requires able(actor) and company(actor) and at(actor, basin) and at(jar, basin).
    On success { Give jar to actor. }
  }
  Observe fall_scene at upper when true
    "From Mero, the river leaves solid stone and falls through the open sky in a white rope toward Nacre.".
  Observe basin_scene at basin when true
    "The fall arrives as mist and a weightless-looking roar. Water runs off Nacre's basin into the air below.".
  Observe bell_below at basin when warningSent(party)
    "Under the fall's noise comes one clear bell-note, thin but whole: the line above has parted."
    teaches falling_bell.
  Goal false.`;

const ferry = `
  Place upper "Mero's ferry ledge" is room at 0, 0 outdoors.
  Place lower "Nacre's cloud-bank" is room at 0, 1 outdoors.
  Company party "You" of 1 at upper.
  Initially Set quantity(party, gold) to 5.
  Person keel "Keel, the sky-ferrier" at upper {
    Role "the ferrier of the short crossing". Ancestry human. Peaceable. Pronouns they.
  }
  Thing raft "the wind-raft" at upper { State moored "The raft is tied at the ledge.". }
  Passage ordinary_down "the step into open air" is drift between upper and lower one way taking 5 minutes.
  Relation engaged_ferry(group). Relation ferryForfeit(group). Relation ferryDone(group).
  Measure crossing(group).
  Action begin_crossing(actor: group, site: place) "Take the wind-raft's trim-line, a penny at risk" {
    Description "Two good moves will reach Nacre; withdrawing gives Keel the penny.".
    Requires able(actor) and at(actor, site) and at(actor, upper) and at(keel, upper)
      and quantity(actor, gold) >= 1 and not engaged_ferry(actor) and not ferryDone(actor).
    On success {
      Decrease quantity(actor, gold) by 1. Assert engaged_ferry(actor).
      Assert engaged_in(actor, raft). Assert engaged_in(actor, keel). Set crossing(actor) to 0.
    }
  }
  Action trim(actor: group, site: place) "Trim the sunward sail and hold" {
    Requires able(actor) and at(actor, site) and at(actor, upper)
      and engaged_ferry(actor) and engaged_in(actor, raft).
    On success { Increase crossing(actor) by 1. }
  }
  Action catch_updraft(actor: group, site: place) "Catch the updraft on the lee-line" {
    Requires able(actor) and at(actor, site) and at(actor, upper)
      and engaged_ferry(actor) and engaged_in(actor, raft).
    Resolve check(actor, brawn, dc_fair).
    On success { Increase crossing(actor) by 2. }
    On failure { Increase crossing(actor) by 1. }
  }
  Action get_off(actor: group, site: place) "Step off and withdraw" {
    Requires at(actor, site) and at(actor, upper) and engaged_ferry(actor) and engaged_in(actor, raft).
    On success {
      Assert ferryForfeit(actor). Retract engaged_ferry(actor).
      Retract engaged_in(actor, raft). Retract engaged_in(actor, keel).
    }
    Result "Keel keeps the penny and asks no questions. You remain on Mero's ledge.".
  }
  Rule ferry_arrives when engaged_ferry(party) and crossing(party) >= 2 {
    Assert ferryDone(party). Retract engaged_ferry(party). Retract engaged_in(party, raft).
    Retract engaged_in(party, keel). Retract at(party, upper). Assert at(party, lower).
    Increase quantity(party, gold) by 2.
  }
  Goal false.`;

async function atBasin(t: Tiny) {
  const down = t.journey.choices().find(choice => choice.command.includes('t__basin'))!;
  await t.perform(down.command);
}

describe('Gamma sky laws', () => {
  it('lets gravity take a released object down the waterfall, never back by that passage', async () => {
    const t = await start(sky);
    const take = t.journey.choices().find(choice => choice.command.startsWith('take_item(')
      && choice.command.includes('t__jar'))!;
    await t.perform(take.command);
    await t.play('Let the green-clay jar fall into the water');
    expect(t.world.test(call('ownedItem', 't__jar', 't__party_1'))).toBe(false);
    expect(t.world.test(call('at', 't__jar', 't__basin'))).toBe(true);
    expect(t.world.test(call('t__falling', 't__jar'))).toBe(false);
    const noUp = t.journey.choices().filter(choice => choice.command.includes('t__upper'));
    expect(noUp.some(choice => choice.command.startsWith('go('))).toBe(false);
    await atBasin(t);
    await t.play('Take the jar from the receiving basin');
    expect(t.campaign.readout.creatures.flatMap(creature => creature.state.inventory ?? [])
      .some(item => item.id === 't__jar')).toBe(true);
  });

  it('carries a warning downward through the fall and teaches it only on arrival below', async () => {
    const t = await start(sky);
    await t.play('Ring the warning-bell into the fall');
    expect(t.world.test(call('knows', 'party', 't__falling_bell'))).toBe(false);
    await atBasin(t);
    expect(t.world.test(call('knows', 'party', 't__falling_bell'))).toBe(true);
  });

  it('allows an authored updraft route while gravity alone has no return', async () => {
    const t = await start(sky);
    await atBasin(t);
    expect(t.journey.choices().some(choice => choice.command.includes('t__lift')
      && choice.command.includes('t__upper'))).toBe(false);
    await t.play('Raise the wind-kite in the updraft');
    const lift = t.journey.choices().find(choice => choice.command.includes('t__lift')
      && choice.command.includes('t__upper'));
    expect(lift).toBeDefined();
    await t.perform(lift!.command);
    expect(t.where()).toBe('t__upper');
  });
});

describe('Gamma intermediate activity pin', () => {
  it('models a sky ferry as real participation, stakes, narrow moves and withdrawal', async () => {
    const t = await start(ferry);
    const beginning = t.journey.choices().find(choice => choice.command.startsWith('t__begin_crossing'))!;
    expect(beginning.label).toContain('a penny at risk');
    await t.perform(beginning.command);
    expect(ScreenModel.build(t.campaign).engaged?.id).toBe('t__raft');
    expect(t.world.test(call('engaged_in', 'party', 't__raft'))).toBe(true);
    const commands = t.journey.choices().map(choice => choice.command);
    expect(commands.some(command => command.startsWith('t__trim'))).toBe(true);
    expect(commands.some(command => command.startsWith('t__catch_updraft'))).toBe(true);
    expect(commands.some(command => command.startsWith('t__get_off'))).toBe(true);
    expect(commands).not.toContain('wait');
    expect(commands).not.toContain('wait_hour');
    await t.play('Step off and withdraw');
    expect(ScreenModel.build(t.campaign).engaged).toBeUndefined();
    expect(t.world.test(call('t__ferryForfeit', 'party'))).toBe(true);
    expect(t.where()).toBe('t__upper');
  });

  it('moves through an intermediate safe trim and resolves the crossing by participation', async () => {
    const t = await start(ferry);
    await t.play("Take the wind-raft's trim-line, a penny at risk");
    await t.play('Trim the sunward sail and hold');
    expect(t.world.number(call('t__crossing', 'party'))).toBe(1);
    expect(t.where()).toBe('t__upper');
    expect(ScreenModel.build(t.campaign).engaged?.id).toBe('t__raft');
    await t.play('Trim the sunward sail and hold');
    expect(t.world.test(call('t__ferryDone', 'party'))).toBe(true);
    expect(t.where()).toBe('t__lower');
    expect(ScreenModel.build(t.campaign).engaged).toBeUndefined();
  });
});
