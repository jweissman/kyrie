import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('The Book of Faces, under the count', () => {
  it('finds a coin under the Hospice cot and lets Mother Tibb protect the Bare', async () => {
    const quiet = await Journey.start('data/campaigns/the-book-of-faces.campaign.json', 'reach-faces-coin');
    Placed.at(quiet, 'ombra__hospice_dorm');
    await quiet.play('=+1');
    await quiet.play('Lift the loose board beneath cot nine');
    expect(quiet.holds('ombra__bfCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/the-book-of-faces.campaign.json', 'reach-faces-ash');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'ombra__hospice_hall');
    await j.play('=+1');
    expect(j.holds('at', 'ombra__bf_assessor', 'ombra__hospice_hall')).toBe(true);
    await j.play('Ask Mother Tibb for a bed');
    await j.play('Ask Mother Tibb to enter your company under the ninth bed');
    expect(j.holds('ombra__bfTibbShelter', 'party')).toBe(true);
    expect(j.holds('at', 'ombra__bf_assessor', 'ombra__hospice_hall')).toBe(false);
  }, 20000);
});
