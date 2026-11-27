import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { ModuleWriter } from '../../../src/lang/index';
import { Creation } from '../../../web/engine/creation';
import { CreationFlow } from '../../../src/creation/creation-flow';
import type { Setting } from '../../../src/creation/protocol';

// Feature pins: see test/features/choice/consequence.pin.test.ts.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
  party: [Creation.protagonist('human', 'pins', names)] };

describe('Character › Creation with meaningful differentiation', () => {
  it('makes a mage with a school and spells, and a warrior with neither, from the same flow', () => {
    const mage = new CreationFlow(setting, Creation.catalog()), warrior = new CreationFlow(setting, Creation.catalog());
    mage.choose('calling', 'mage'); warrior.choose('calling', 'warrior');
    expect((mage.member.spells ?? []).length).toBeGreaterThan(0);
    expect((warrior.member.spells ?? []).length).toBe(0);
    expect(mage.member.traits?.[0]).not.toBe(warrior.member.traits?.[0]);
  });
  it.todo('unwritten: a calling, a people and a past each open a way through one problem the others do not');
});

describe('Character › Stat checks woven into narrative moments', () => {
  // OB-11: a check inside a conversation, its outcome told in the speaker's own words.
  it('a question put in conversation is a check, its outcome said by the one asked', async () => {
    const gate = `
      Place yard "the yard" is room at 0, 0 outdoors.
      Person wat "Wat" at yard { Role "the gatekeeper". Ancestry human. Peaceable. Pronouns he. }
      Company party "You" of 1 at yard.
      Relation opened(group).
      Topic wat_gate with wat "Talk Wat round to opening the gate" when true once {
        Resolve check(actor, persuasion, dc_hard).
        Says "'Oh, go on, then,' says Wat.".
        Otherwise "'Not for you,' says Wat.".
        On discuss { Assert opened(wat). }
      }`;
    const won = await Tiny.start(gate), lost = await Tiny.start(gate);
    won.journey.roll('pass'); lost.journey.roll('fail');
    await won.play('Talk to Wat', 'Talk Wat round'); await lost.play('Talk to Wat', 'Talk Wat round');
    expect(won.campaign.events.at(-1)!.response).toContain('go on, then');
    expect(lost.campaign.events.at(-1)!.response).toContain('Not for you');
    const opened = ModuleWriter.call('t__opened', 't__wat');
    expect([won.world.test(opened), lost.world.test(opened)]).toEqual([true, false]);
    // A question won in conversation earns experience; one lost does not (the compactification's third stage).
    const gained = (t: typeof won) => t.campaign.events.at(-1)!.combat
      .flatMap(e => e.type === 'gain' && e.detail?.startsWith('experience') ? [e.detail] : []);
    expect(gained(won)[0]).toBe('experience: persuasion with Wat');
    expect(gained(lost)).toEqual([]);
  });
});

describe('Character › Skill and attribute progression', () => {
  it.todo('unwritten: a level gained opens a way to talk, climb, decipher or slip past that was shut before');
});

describe('Character › Inventory with textual presence', () => {
  it.todo('unwritten: an item has its history and maker, said when it is looked at, and a use beyond its numbers');
});
