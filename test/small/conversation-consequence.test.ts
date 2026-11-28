import { describe, expect, it } from 'bun:test';
import { Consequence } from '../../src/lang/index';
import { Tiny } from '../support/tiny';

const hall = `
  Place hall "the hall" is room at 0, 0 outdoors.
  Company party "You" of 1 at hall.
  Person keeper "Nell" at hall { Role "keeper". Ancestry human. Peaceable. }
  Relation admitted(group).
  Topic invitation with keeper "Ask Nell what she needs" when true once {
    Says "'Will you stand beside me when the petition is heard?' Nell asks.".
  }
  Topic accept with keeper "Agree to stand beside Nell" answering invitation when true {
    Says "Nell opens the side door.".
    On discuss { Assert admitted(actor). }
  }
  Observe side_door at hall when admitted(party) "The petitioners make room for you.".
  Topic respite with keeper "Ask Nell about the weather" when true once {
    Says "'Wet,' she says. 'But the ducks approve.'".
  }`;

describe('conversations that open a consequential answer', () => {
  it('counts the invitation and proves its answer changes the world', async () => {
    const t = await Tiny.start(hall);
    expect(Consequence.census(t.campaign.module).map(a => a.id)).toEqual(['t__respite']);
    expect(t.journey.offers('Agree to stand beside Nell')).toBe(false);
    await t.perform('t__invitation');
    expect(t.journey.offers('Agree to stand beside Nell')).toBe(true);
    expect(t.journey.holds('admitted', 'party')).toBe(false);
    await t.perform('t__accept');
    expect(t.journey.holds('admitted', 'party')).toBe(true);
    expect(t.journey.offers('Agree to stand beside Nell')).toBe(false);
  });
  it('does not mistake its own recall for a new consequence', async () => {
    const t = await Tiny.start(`
      Place hall "the hall" is room at 0, 0 outdoors.
      Company party "You" of 1 at hall.
      Person keeper "Nell" at hall { Role "keeper". Ancestry human. Peaceable. }
      Topic weather with keeper "Ask Nell about the weather" when true once {
        Says "'Wet,' she says." again "'Still wet.'".
      }`);
    expect(Consequence.census(t.campaign.module).map(a => a.id)).toEqual(['t__weather']);
    await t.perform('t__weather');
    expect(t.journey.offers('Ask Nell again about the weather')).toBe(true);
  });
  it('counts a failed attempt when spending the try opens another course of action', async () => {
    const t = await Tiny.start(`
      Place hall "the hall" is room at 0, 0 outdoors.
      Company party "You" of 1 at hall.
      Relation opened(group).
      Action plead(actor: group) "Try to persuade the porter" {
        Requires at(actor, hall). Resolve check(actor, persuasion, dc_fair) once.
      }
      Action petition(actor: group) "Present a written petition instead" {
        Requires at(actor, hall) and tried_plead(actor).
        On success { Assert opened(actor). }
      }
      Observe admitted at hall when opened(party) "The porter opens the door.".`);
    expect(Consequence.census(t.campaign.module)).toEqual([]);
    expect(t.journey.offers('Present a written petition instead')).toBe(false);
    t.journey.roll('fail');
    await t.play('Try to persuade the porter');
    expect(t.journey.offers('Present a written petition instead')).toBe(true);
    await t.play('Present a written petition instead');
    expect(t.journey.holds('opened', 'party')).toBe(true);
  });
});
