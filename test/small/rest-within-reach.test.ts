import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { MenuTree } from '../../src/frame/menu-tree';
import type { Frame } from '../../src/creation/protocol';

// Going and waiting, within reach of the one menu at a place at rest (OR-1490, OR-1495): with no lens earned
// (OR-1491), every way out of the place and every wait the company can make stands on one of the place's pages,
// reached from its first by the rows a player presses (Something else…, a kind's row, More…, Back), never only in a
// lens. At a yard first come to, where every way leads somewhere not yet seen, and again once one of them is known.
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 0, 1 outdoors.
  Place kitchen "the kitchen" is room at 1, 0.
  Place byre "the byre" is room at 1, 1.
  Passage gate "the yard gate" is path between yard and lane.
  Passage door "the back door" is path between yard and kitchen.
  Passage arch "the byre arch" is path between yard and byre.
  Thing well "the well" at yard { State full "The well is full.". Change draw "Draw a bucket" from full to full. }
  Thing pail "a pail" at yard { State dry "A dry pail.". State wet "A wet pail.".
    Change dip "Dip the pail" from dry to wet. }
  Thing bench "a bench" at yard { State bare "A bench.". State swept "A swept bench.".
    Change sweep "Sweep the bench" from bare to swept. }
  Person dog "Fly" at yard { Role "the yard dog". Species dog. Peaceable. }
  Company party "You" of 1 at yard.`;
// Every command on a page reached from the first by pressing the rows that turn pages, as a player would.
const reached = (t: Tiny): Set<string> => {
  const framed = MenuTree.framed({ screen: t.screen, leaf: t.leaf } as unknown as Omit<Frame, 'menu'>);
  const seen = new Set<number>(), commands = new Set<string>(), next = [0];
  while (next.length) {
    const n = next.pop()!;
    if (seen.has(n)) { continue; }
    seen.add(n);
    for (const r of MenuTree.question(framed, { kind: 'place', page: n })!.place!.rows) {
      const turn = /^focus:page:(\d+)$/.exec(r.command ?? '');
      if (turn) { next.push(Number(turn[1])); } else if (r.command) { commands.add(r.command); }
    }
  }
  return commands;
};
const missing = (t: Tiny): string[] => {
  const has = reached(t), framed = MenuTree.framed({ screen: t.screen, leaf: t.leaf } as unknown as Omit<Frame, 'menu'>);
  // Each way within the hex as the scene's menu does it (its exit's row), never one into another hex (the map's).
  const ways = t.screen.exits.filter(e => !e.crosses)
    .map(e => framed.menu.choices.find(c => c.id === e.id)?.command ?? e.id);
  const waits = t.screen.camp.map(a => a.command ?? a.label);
  return [...ways, ...waits].filter(c => !has.has(c));
};
describe('going and waiting at a place at rest', () => {
  it('are on the one menu\'s pages, every way out and every wait, before a way is known and after', async () => {
    const t = await Tiny.start(yard, { horizon: ['probing'] });
    expect(t.screen.exits.length).toBe(3);
    expect(t.screen.camp.some(a => a.command === 'wait')).toBe(true);
    expect(missing(t)).toEqual([]);
    await t.play('To the lane');
    expect(t.where()).toBe('t__lane');
    await t.play('To the yard');
    expect(t.where()).toBe('t__yard');
    expect(missing(t)).toEqual([]);
  });
});
