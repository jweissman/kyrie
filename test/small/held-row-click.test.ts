import { describe, expect, it } from 'bun:test';
import type { MouseEvent } from 'react';
import { Hold } from '../../web/reader/instrument/hold';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';

// The map's Travel to and Go on are held (OR-111, OR-134; web/reader/map-menu.tsx draws them by Hold.row): a plain
// click or tap on them sets out on nothing, for a journey is taken only by a hold completed; an assistive technology's
// activation, which no hand holds (a click of detail 0), is done at once. The browser specs press them by
// MonoDriver.press, which holds, so this is the negative half they cannot say.
class Pressing {
  static app(chosen: Choice[]): ReaderApp {
    return { state: {}, choose: (c: Choice) => { chosen.push(c); } } as unknown as ReaderApp;
  }
  static click(detail: number) {
    return { detail, preventDefault() { /* swallowed */ }, stopPropagation() { /* swallowed */ } } as unknown as
      MouseEvent<HTMLElement>;
  }
}
describe('a held row of the map', () => {
  const journey = { id: 'travel:region__t89', label: 'Travel to Millholm', command: 'travel:region__t89' } as Choice;
  it('sets out on nothing at a plain click or tap', () => {
    const chosen: Choice[] = [], row = Hold.row(Pressing.app(chosen), journey);
    expect(row.onClick).toBeUndefined();
    expect(row.own?.['data-hold']).toBe('sustained');
    row.own!.onClick(Pressing.click(1));
    expect(chosen).toEqual([]);
  });
  it('is taken at once by an activation no hand makes', () => {
    const chosen: Choice[] = [], row = Hold.row(Pressing.app(chosen), journey);
    row.own!.onClick(Pressing.click(0));
    expect(chosen.map(c => c.id)).toEqual([journey.id]);
  });
  it('leaves a row that is not held to a tap', () => {
    const chosen: Choice[] = [], look = { id: 'look:x', label: 'Look', command: 'look_closely(party,x)' } as Choice;
    const row = Hold.row(Pressing.app(chosen), look);
    expect(row.own).toBeUndefined();
    row.onClick!();
    expect(chosen.map(c => c.id)).toEqual(['look:x']);
  });
});
