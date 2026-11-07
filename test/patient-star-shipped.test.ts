import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import phases from './fixtures/patient/journeys.json';

// The campaign as shipped (a lone first-level thief, Tamsin), from the cutter of Quell with a debt to the twelfth word
// at
// Doran's brick. The thief's door is hers; nothing on this path is locked behind another calling. No put, no assert,
// no give.
const quell = phases.quell_to_hour as string[];
const toRing = quell.slice(0, quell.indexOf('To the Granary Ring') + 1);
const homeToEnnick = ['To the Granary Ring', 'Up to the Plate Hall', 'Mirror Road, south stretch', 'Mirror Road, north stretch', 'To the West Gate', 'To the West Gallery, at the Neck',
  'To the foot of the North Well', 'To the North Well head', 'To the Shift Market', 'To the Ramp head', "To Ennick's lower road"];
const toDoran = ['To the upper terraces', "To the holders' cord", 'To the edge of the glass', 'To three hundred paces', "Doran's brick"];

describe('The Patient Star as shipped (a lone thief)', () => {
  it('sees the second bolt, takes the twelfth word from the kept clerk, and says it over Doran', async () => {
    const j = await Journey.start('data/campaigns/the-patient-star.campaign.json', 'p');
    await j.play(...toRing);
    const page = () => j.taken.map(t => `${t.page} ${t.told}`).join('\n');
    expect(page()).toContain('the second bolt is up in the lintel');
    await j.play('To the twelfth vault', 'Lay a hand on the clerk');
    expect(page()).toContain("'Venn.'");
    expect(page()).not.toContain('eleven strokes');
    await j.play(...homeToEnnick, ...toDoran, 'Say the twelfth word');
    expect(page()).toContain('Is the fire kept?');
    expect(j.holds('season__twelfthSaid', 'season__ennick')).toBe(true);
  }, 600000);
});
