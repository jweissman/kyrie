import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Long Man, Fair Weather, Low Water and What Tessary Owes, tied to one another by the things they hand
// out (doc/imbar/adventures/*.md). Each case is a person who reacts to an item kind another of the five gives: offered
// only to a company holding it, answered once, and silent without. As in test/lore-links.test.ts the item is handed to
// the
// company with j.give and the company placed with j.put, since the item's own adventure is another province; those two
// are ASSERTED setup. What is under test is the reaction.
const campaign = (name: string) => `data/campaigns/${name}.campaign.json`;
const told = (j: Journey) => j.taken.map(x => `${x.page} ${x.told}`).join('\n');
async function arrive(name: string, mod: string, place: string, items: string[] = []) {
  const j = await Journey.start(campaign(name), 'five');
  for (const i of items) { j.give(i); }
  j.put('party', `${mod}__${place}`);
  await j.play('=+1');
  return j;
}

describe('papers and a face passed between the five', () => {
  const cases: [string, string, string, string, string, string, string, RegExp][] = [
    // [title, campaign, module, place, item kind, the ask, the fact, a line of the answer]
    ['Hosken and the Mower\'s mask (Long Man to Skeel)', 'skeel', 'skeel', 'church', 'keeper_mask', 'Show Parson Hosken the grey mask', 'lore_mask_notch', /stand where it could see the sea/],
    ['Bartle Tonkin and the Collegium\'s letter (Low Water to Skeel)', 'skeel', 'skeel', 'ropewalk', 'collegium_letter', 'Show Bartle Tonkin the letter', 'lore_letter_lead', /one lead-line/],
    ['Mother Jago and the Valuer\'s note (Tessary to Skeel)', 'skeel', 'skeel', 'taproom', 'surety_terms', 'Show Mother Jago the Ninth Valuer', 'lore_surety_jago', /standing for a plank/],
    ['Gammer Coller and the Collegium\'s letter (Low Water to Long Man)', 'the-long-man', 'longman', 'reeve_room', 'collegium_letter', 'Show Gammer Coller the letter', 'kin_letter_read', /welcome to write it down/],
    ['Mother Ysolt and the Valuer\'s note (Tessary to Long Man)', 'the-long-man', 'longman', 'nave', 'surety_terms', 'Show Mother Ysolt the Ninth Valuer', 'kin_surety_read', /We named no keeping/],
    ['Halm and the keeper\'s rubbing (Skeel to Low Water)', 'low-water', 'lowwater', 'dig', 'tally_rubbing', 'Show Halm the wax rubbing', 'lore_rubbing_halm', /Two places counting the same sum for the opposite reason/],
    ['the Registrar and the Valuer\'s note (Tessary to Low Water)', 'low-water', 'lowwater', 'registrar_room', 'surety_terms', 'Show the Registrar the Ninth Valuer', 'lore_surety_fenn', /liability for nine years/],
    ['the Valuer and the keeper\'s rubbing (Skeel to Tessary)', 'what-tessary-owes', 'tessary', 'withies', 'tally_rubbing', 'Show the Ninth Valuer the rubbing', 'lore_rubbing_valuer', /unruled/],
    ['the Keeper of the Seal and the Collegium\'s letter (Low Water to Tessary)', 'what-tessary-owes', 'tessary', 'seals_inner', 'collegium_letter', 'Show the Keeper the letter', 'lore_letter_deckle', /nothing to be got by it/],
    ['Lemuel Pitch and the bell-teeth (Long Man to Tessary)', 'what-tessary-owes', 'tessary', 'chandlery', 'bell_teeth', 'Show Lemuel Pitch the bell-teeth', 'lore_teeth_pitch', /would not sell these to him/],
  ];
  for (const [title, file, mod, place, kind, ask, fact, line] of cases) {
    it(`${title}: offered and answered only to a company holding the ${kind}`, async () => {
      const without = await arrive(file, mod, place);
      expect(without.offers(ask)).toBe(false);
      const j = await arrive(file, mod, place, [kind]);
      expect(j.offers(ask)).toBe(true);
      await j.play(ask);
      expect(told(j)).toMatch(line);
      expect(j.holds('knows', 'party', `${mod}__${fact}`)).toBe(true);
      expect(j.offers(ask)).toBe(false);
    }, 120000);
  }
});
