import { HandbookCreationReferences } from '../../../src/client/creation-references';
import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
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
    const mage = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    const warrior = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    mage.choose('calling', 'mage'); warrior.choose('calling', 'warrior');
    expect((mage.member.spells ?? []).length).toBeGreaterThan(0);
    expect((warrior.member.spells ?? []).length).toBe(0);
    expect(mage.member.traits?.[0]).not.toBe(warrior.member.traits?.[0]);
  });
  it.todo('unwritten: a calling, a people and a past each open a way through one problem the others do not');
});

describe('Character › Stat checks woven into narrative moments', () => {
  // OB-11: a check inside a conversation, its outcome told in the speaker's own words. A Topic cannot carry a check.
  it.failing('missing: a question put in conversation is a check, its outcome said by the one asked', async () => {
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Person wat "Wat" at yard { Role "the gatekeeper". Ancestry human. Peaceable. Pronouns he. }
      Company party "You" of 1 at yard.
      Topic wat_gate with wat "Talk Wat round to opening the gate" when true once {
        Resolve check(actor, persuasion, dc_hard).
        Says "'Oh, go on, then,' says Wat.".
        Otherwise "'Not for you,' says Wat.".
      }`);
    t.journey.roll('fail');
    await t.play('Talk to Wat', 'Talk Wat round');
    expect(t.campaign.events.at(-1)!.response).toContain('Not for you');
  });
});

describe('Character › Skill and attribute progression', () => {
  it.todo('unwritten: a level gained opens a way to talk, climb, decipher or slip past that was shut before');
});

describe('Character › Inventory with textual presence', () => {
  it.todo('unwritten: an item has its history and maker, said when it is looked at, and a use beyond its numbers');
});
