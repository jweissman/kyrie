import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from '../support/tiny';
import { CharacterPage } from '../../web/reader/character-page';

// What was done is told with the act's own name (the exchange's act), and the sheet tells what is done from it by
// that name: it had read the act's words ("Have …", "Raise …", "Take up …"): AR-05. Each name the sheet keeps is an
// action of the rules.
describe('the act an exchange tells', () => {
  it('is named, and the sheet\'s are actions of the rules', async () => {
    const t = await Tiny.start(`
      Place adit "the old adit" is room at 0, 0 underground.
      Company party "You" of 1 at adit.
      Initially Assert unlit(adit).
      Goal false.`);
    await t.perform('light_item(t__party_1__torch)');
    expect(t.leaf.exchange?.act).toBe('light_item');
    const care = readFileSync('data/rules/care.kyr', 'utf8');
    expect([...CharacterPage.grows].filter(a => !new RegExp(`Action ${a}\\(`).test(care))).toEqual([]);
  });
});
