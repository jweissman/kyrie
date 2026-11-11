import { describe, expect, it } from 'bun:test';
import { Wayfinder } from '../web/reader/stage/wayfinder';
import type { ReaderApp } from '../web/reader/reader-app';

// Go…'s preview turns to a way the pointer rests on, not to each one it passes over on the way to the preview's Go
// (round 5: crossing the next column to reach "Go there" had turned the preview to another place).
describe('a way in Go…', () => {
  const app = () => {
    const shown: string[] = [];
    return { shown, app: { menu: { choices: [] }, state: { cursor: 0 },
      setState: (s: { hovered: string }) => shown.push(s.hovered) } as unknown as ReaderApp };
  };
  const way = (id: string) => ({ c: { id } }) as unknown as Parameters<typeof Wayfinder.pick>[1];
  it('is shown when the pointer rests on it, and not when it only passes over', async () => {
    const { shown, app: a } = app();
    Wayfinder.linger(a, way('taproom'));
    await Bun.sleep(250);
    Wayfinder.linger(a, way('sundial'));
    Wayfinder.passed();
    Wayfinder.linger(a, way('churchyard'));
    Wayfinder.passed();
    await Bun.sleep(250);
    expect(shown).toEqual(['taproom']);
  });
});
