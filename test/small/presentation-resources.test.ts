import { describe, expect, it } from 'bun:test';
import { Installed, type InstalledDomain } from '../../src/ports/installed';
import { Voice } from '../../src/narrative/voice';
import { Fits } from '../../src/ui/fits';

describe('installed presentation resources', () => {
  it('uses each installation’s voice tables and none when no voice is installed', () => {
    const domain = (id: string, text: string): InstalledDomain => ({ id, presentation: {
      voice: [{ about: id, kinds: ['join'], lines: [{ id: 'join.1', text }] }],
    } });
    const a = domain('a', 'First'), b = domain('b', 'Second'), plain: InstalledDomain = { id: 'plain' };
    const lines = (d: InstalledDomain) => Installed.within(d, () => Voice.fitting('join', {}).map(l => l.text));
    expect([lines(a), lines(b), lines(plain), lines(a)]).toEqual([['First'], ['Second'], [], ['First']]);
  });
  it('uses each installation’s painting observations and rules, or no restrictions', () => {
    const a: InstalledDomain = { id: 'a', presentation: {
      paintingFit: [{ id: 'no-banner', forbids: 'banner' }], paintingSeen: { p: { shows: 'a banner' } },
    } };
    const b: InstalledDomain = { id: 'b', presentation: { paintingSeen: { p: { shows: 'a tree' } } } };
    const plain: InstalledDomain = { id: 'plain' };
    const screen = { place: { name: 'a room' } };
    const look = (d: InstalledDomain) => Installed.within(d, () => [Fits.fits(screen, 'p'), Fits.words('p')]);
    expect([look(a), look(b), look(plain), look(a)]).toEqual([
      [false, 'a banner'], [true, 'a tree'], [true, ''], [false, 'a banner'],
    ]);
  });
});
