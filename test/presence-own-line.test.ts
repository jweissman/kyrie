import { describe, expect, it } from 'bun:test';
import { Narrator } from '../src/presentation/narrator';
import type { Screen } from '../src/ui/screen-types';

// Someone with a line of their own beside them is still said to be here, unless that line names them (the Grand
// Tour's X02, GTR-X02: Aubrey's line of the letters on his desk had left him unsaid in his own rooms).
describe('who is here, beside their own lines', () => {
  const presence = (people: object[]) => (Narrator as unknown as { presence(s: Screen): string[] })
    .presence({ people, things: [], dark: false } as unknown as Screen);
  it('says someone is here when their own line does not name them', () => {
    expect(presence([{ id: 'a', name: 'Aubrey, gentleman', kind: 'person', says: ['Letters lie in a tray on the desk.'] }]))
      .toEqual(['Letters lie in a tray on the desk.', 'Aubrey, a gentleman, is here.']);
  });
  it('does not say it again when their own line names them', () => {
    expect(presence([{ id: 'a', name: 'Aubrey, gentleman', kind: 'person', says: ['Aubrey is reading his letters.'] }]))
      .toEqual(['Aubrey is reading his letters.']);
  });
});
