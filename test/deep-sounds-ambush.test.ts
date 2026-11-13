import { describe, expect, it } from 'bun:test';
import { DeepSounds } from '../src/world/deep/deep-sounds';
import type { DeepLayout } from '../src/world/deep/deep-layout';

// Every lethal band is told before it is engaged (PL-07, the lead's decision 4; placements.md): what lies in wait is
// read for what it is only by one who reads sign, but anyone sees at the mouth of each way to it that something is
// there; it still springs. A band that falls on whoever comes in is heard from every way to it, as before.
describe('a deep band, from the rooms beside it', () => {
  const layout = { links: [{ a: 'gallery', b: 'ossuary' }, { a: 'ossuary', b: 'hall' }],
    levels: [{ rooms: [{ id: 'gallery' }, { id: 'ossuary' }, { id: 'hall' }] }] } as unknown as DeepLayout;
  const told = (temperament: string) => DeepSounds.lines(layout, { id: 'b', room: 'ossuary', temperament });
  it('tells anyone an ambush is there, at every way to it, and the reader of sign what it is', () => {
    const lines = told('ambush');
    expect(lines.filter(l => / at (gallery|hall) when able\(b\)/.test(l) && !l.includes('noticed by')).length).toBe(2);
    expect(lines.filter(l => l.includes('as sign noticed by woodcraft')).length).toBe(2);
  });
  it('tells a savage band by its sound, to anyone, and adds no sign to it', () => {
    const lines = told('savage');
    expect(lines.filter(l => l.includes('Observe b_heard_')).length).toBe(2);
    expect(lines.some(l => l.includes('_seen_'))).toBe(false);
  });
  it('tells what is heard as a sound, in the dark too, and what is seen as a sign, by a light alone', () => {
    expect(told('savage').filter(l => l.includes('Observe b_heard_')).every(l => l.includes(' as sound when'))).toBe(true);
    const ambush = told('ambush');
    expect(ambush.filter(l => l.includes('_heard_')).every(l => l.includes(' as sign noticed by woodcraft'))).toBe(true);
    expect(ambush.filter(l => l.includes('_seen_')).some(l => l.includes(' as sound'))).toBe(false);
  });
});
