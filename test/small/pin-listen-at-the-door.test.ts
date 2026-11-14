import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

// A Paragon pin (doc/architecture/mission-21/paragon-pins.md): listening at a door. In a dark passage, with the door
// shut, the company puts an ear to it and hears what is behind it: voices where the goblins are, nothing where they
// are not. Hearing passes a shut door, as sight and the sense of who would join do not (the owner, 15 November), and
// it wants no light. What is heard here is the author's, said as the world stands; what the pin finds about hearing
// itself is in paragon-pins.md.
const passage = (goblins: boolean) => `
  Place passage "the dark passage" is room at 0, 0 underground.
  Place guardroom "the guardroom" is room at 1, 0 underground.
  Passage oak "the oak door" is door between passage and guardroom.
  Company party "You" of 1 at passage.
  Initially Assert unlit(passage). Initially Assert unlit(guardroom).
  Thing door "the oak door" on oak {
    Tries listening.
    State shut blocking "The oak door is shut.".
    Change open "Open the oak door" from shut to open.
    State open "The oak door stands open.".
  }
  Person goblins "goblins" ${goblins ? 'at guardroom' : 'nowhere'} {
    Role "a band of goblins at dice". Species goblin. Numbers 3. Temperament territorial. }
  Observe door_voices near door as sound when tried(door, listening) and at(goblins, guardroom) "Through the oak, low voices, the rattle of dice, a laugh cut short.".
  Observe door_silence near door as sound when tried(door, listening) and not at(goblins, guardroom) "Behind the oak, nothing: not a breath.".`;
describe('listening at a door', () => {
  it('in the dark, through the shut door, hears who is behind it, and silence where no one is', async () => {
    const heard = async (goblins: boolean) => {
      const t = await Tiny.start(passage(goblins));
      expect(t.journey.campaign.world.one('state', 't__door')).toBe('t__shut');
      expect(t.journey.holds('benighted', 'party')).toBe(true);
      await t.journey.play('Listen at it');
      return ScreenModel.build(t.campaign).observed.map(o => o.text).join(' ');
    };
    expect(await heard(true)).toMatch(/low voices/);
    expect(await heard(false)).toMatch(/nothing: not a breath/);
  });
});
