import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ChoiceList } from '../../src/ui/choice-list';

// The vault under the first town keeps the barrow ghoul (the lead's ruling, 13 November): an OSR deep room may be
// lethal when it is told and escapable. Told: its warning, and the attack's own mark before it is chosen ("beyond you",
// "could be lost"). Escapable: it waits out the watch, and the way back up is offered. The vault in miniature
// (data/generation/town/undertown.kyrt), the keeper as placed there.
const vault = `
  Place under "the undercroft" is room at 0, 0 underground 2 down.
  Place vault "the sealed vault" is room at 1, 0 underground 3 down.
  Passage stair "the stair under the lettered flag" is stair between under and vault.
  Company party "You" of 1 at under.
  Person keeper "the keeper of the vault" at vault {
    Role "the last of whoever built the undercroft, long dead and still at its post". Species ghoul. Variant barrow. Numbers 1. Level 2. Temperament territorial. Lair vault.
    Warns "Something stands up from a stone chair at the far end of the vault, slowly, as if it had been waiting a long time.".
  }
  Goal false.`;

describe('the barrow ghoul in the vault, for a lone warrior', () => {
  it.each([1, 2])('at level %d, is told, marked as a fight that could be lost or is beyond him, and left by the stair', async level => {
    const t = await Tiny.start(vault, { party: [{ name: 'Hild', raceId: 'human', classId: 'warrior', level }] });
    await t.perform('light_item(t__party_1__torch)');
    const leg = await t.session.leg('go(t__stair,t__vault)');
    expect(t.where()).toBe('t__vault');
    // It warned, and has not closed: no fight in the going in.
    expect(leg.combat?.length ?? 0).toBe(0);
    t.look();
    const keeper = t.screen.people.find(p => p.id === 't__keeper');
    expect(['grave', 'deadly']).toContain(keeper?.reckoning?.danger);
    expect(['could be lost', 'beyond you']).toContain(ChoiceList.chances[keeper!.reckoning!.danger]);
    expect(t.journey.choices().some(c => c.command === 'go(t__stair,t__under)')).toBe(true);
  });
});
