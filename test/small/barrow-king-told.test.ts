import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ChoiceList } from '../../src/ui/choice-list';

// The great barrow's last king (data/generation/works/great_barrow.kyrt), more than a fresh warrior alone can take now
// that a blow for nothing no longer makes him bleed (R9-06, the lead's ruling of 13 November), must be told and
// escapable (decision 4): he warns from his seat and waits out the watch, the attack is marked before it is chosen,
// and the steps back down are offered. His high chamber in miniature.
const howe = `
  Place flutes "the fluted hall" is room at 0, 0 underground.
  Place throne "the high chamber" is room at 1, 0 underground.
  Passage high "the steps up" is steps between flutes and throne.
  Company party "You" of 1 at flutes.
  Person king "the barrow-king" at throne {
    Role "the last king of the Barrow-Kin, who keeps the last of the bound". Species revenant. Level 5. Temperament territorial. Lair throne.
    Warns "The king on the seat lifts his skull from his chest. Something in the dark of his eyes finds you, and he stands, and the sword comes up.".
  }
  Goal false.`;

describe('the barrow-king, for a fresh warrior alone', () => {
  it('is told, marked as beyond him or a fight that could be lost, and left by the steps', async () => {
    const t = await Tiny.start(howe, { party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    await t.perform('light_item(t__party_1__torch)');
    const leg = await t.session.leg('go(t__high,t__throne)');
    expect(t.where()).toBe('t__throne');
    expect(leg.combat?.length ?? 0).toBe(0);
    t.look();
    const king = t.screen.people.find(p => p.id === 't__king');
    expect(['grave', 'deadly']).toContain(king?.reckoning?.danger ?? 'none');
    expect(['could be lost', 'beyond you']).toContain(ChoiceList.chances[king!.reckoning!.danger]);
    expect(t.journey.choices().some(c => c.command === 'go(t__high,t__flutes)')).toBe(true);
  });
});
