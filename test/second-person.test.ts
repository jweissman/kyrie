import { describe, expect, it } from 'bun:test';
import { SecondPerson } from '../src/presentation/second-person';
import { Scenery } from '../src/ui/scenery';
import type { Screen } from '../src/ui/screen-types';

// One who has come alone is "you" in the telling of their own acts (Mission 17's fresh play heard "Ilse pays Dain,
// and takes a torch"); and the country a chapter opens on is painted for the season it is.
describe('the telling of one who has come alone', () => {
  it('turns their own acts to the second person, and nobody else\'s', () => {
    expect(SecondPerson.turn('Ilse pays Dain, and takes a torch.', 'Ilse')).toBe('You pay Dain, and take a torch.');
    expect(SecondPerson.turn('Ilse readies the shortbow. Dain watches.', 'Ilse')).toBe('You ready the shortbow. Dain watches.');
    expect(SecondPerson.turn('Ilse is weary.', 'Ilse')).toBe('You are weary.');
    expect(SecondPerson.turn('Dain pays Ilse.', 'Ilse')).toBe('Dain pays Ilse.');
    expect(SecondPerson.turn('Ilse meets Dain and his son.', 'Ilse')).toBe('You meet Dain and his son.');
    expect(SecondPerson.turn('Ilse often waits.', 'Ilse')).toBe('Ilse often waits.');
    expect(SecondPerson.turn('Ilse carries the lamp and goes in.', 'Ilse')).toBe('You carry the lamp and go in.');
    expect(SecondPerson.turn("Ilse's dog barks.", 'Ilse')).toBe("Ilse's dog barks.");
  });
});
describe('the country a chapter opens on', () => {
  const screen = (long: string) => ({ path: [{ id: 's', name: 'A town', kind: 'settlement' }], place: { id: 'p', name: 'x',
    kind: 'room' }, region: { areas: [], terrain: 'frost', edges: [], within: {} }, dark: false,
    date: { short: '', long } }) as unknown as Screen;
  it('is painted in winter only in winter', () => {
    expect(Scenery.winter.has(Scenery.of(screen('the 23rd of Midsummer, in the 1st year of the Sun and Moon; summer'))!))
      .toBe(false);
    expect(Scenery.winter.has(Scenery.of(screen('the 3rd of Deepwinter, in the 1st year of the Sun and Moon; winter'))!))
      .toBe(true);
  });
});
