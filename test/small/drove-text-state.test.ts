import { describe, expect, it } from 'bun:test';
import { Alone } from '../support/alone';
import { ObservationText } from '../../src/lang/observation-text';
import type { Journey } from '../../src/session/journey';

// The held drove's text against its state (ST-10, the AT-09 analysis of 19 November): Bran told as he is, held or let
// out; his thanks at the sales for what was done, not for four found on the ink; and his "come up the pass" an aim.
// The drove alone on a host of a few lines (see Alone); what the country binds stays in test/drove-reeve.
const host = `
  Place town "Porthalen" is settlement.
  Place green "the landing" is room within town at 0, 0 outdoors.
  Place taproom "the taproom" is room within town at 1, 0.
  Person keeper "Mag" at taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Company party "You" of 1 at green.`;
class Drove {
  static async start(): Promise<Journey> {
    const a = await Alone.start({ id: 'drove', bundle: '../../data/goings-on/iscoed-drove/module.json', host,
      exports: ['town', 'green', 'taproom', 'keeper'],
      imports: { town: 'town', green: 'green', taproom: 'taproom', keeper: 'keeper' } });
    return a.journey;
  }
  static bran(j: Journey): string { return ObservationText.presented(j.campaign.world).get('drove__bran')!.name; }
  static aims(j: Journey): string[] { return (j.screen().aims ?? []).map(a => a.text); }
}

describe('the held drove says what has become of Bran', () => {
  it('has Bran held behind the grille only until he is let out', async () => {
    const j = await Drove.start();
    expect(Drove.bran(j)).toContain('held behind the customs-house grille');
    j.assert('freed', 'party');
    expect(Drove.bran(j)).toBe('Bran ap Ifor, the Brynach lead-drover, let out of the customs-house');
  });
  it('thanks the company at the sales for the four only when the four were found', async () => {
    const j = await Drove.start();
    j.assert('knows', 'party', 'altered');
    j.put('party', 'customs');
    const told = await j.play('Tell Mardle you saw what is under the forty');
    expect(told).not.toContain('For the four you found');
    j.put('party', 'pens');
    j.put('bran', 'pens');
    const sold = await j.play('Help Bran take the drove to the sales');
    expect(sold).toContain('For the ink you read');
    expect(sold).not.toContain('For the four you found');
  });
  it('makes his road west an aim, asked of him once the drove is sold, and gone once asked', async () => {
    const j = await Drove.start();
    j.assert('knows', 'party', 'found_drowned');
    j.put('party', 'customs');
    await j.play('Tell Mardle where the four bullocks are');
    j.put('party', 'pens');
    j.put('bran', 'pens');
    expect(await j.play('Help Bran take the drove to the sales')).toContain('For the four you found');
    expect(j.holds('knows', 'party', 'road_west')).toBe(true);
    expect(Drove.aims(j)).toContain('Ask Bran about the work up the pass in Brynach: the lord there pays for a sword.');
    await j.play('Ask Bran about the work in Brynach');
    expect(Drove.aims(j).some(a => a.includes('up the pass in Brynach'))).toBe(false);
  });
});
