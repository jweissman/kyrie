import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '../..');

// A hook names its first step (the owner's OR-60, 17 November: "most of the story hooks don't really onboard you"):
// what is going on in a town (data/goings-on) and what is still to find in a work of the makers once it is named (a
// work's `_sought`, the aim offered next when the first is seen through) is said as something to do, and where, before
// why: "Look at the boundary stones in the inn's back garden: the innkeeper and the merchant are at odds over them".
// They had been said as how things stand ("The innkeeper and the merchant are at odds over…", "Whatever was buried with
// the dead of Shadowrest lies there still"): 31 of 31 named no act (round 9's diagnosis, onboarding-diagnosis.md).
const verbs = new Set(['Look', 'Tell', 'Take', 'Find', 'Keep', 'Pay', 'Hear', 'Watch', 'Leave', 'Go', 'Follow', 'Open',
  'Climb', 'Get', 'Ask', 'Search', 'Give', 'Bring']);
class Hooks {
  static texts(dir: string, file: (name: string) => string, only?: RegExp): { at: string; text: string }[] {
    return readdirSync(join(root, dir)).flatMap(name => {
      const path = join(root, dir, file(name));
      let text: string;
      try { text = readFileSync(path, 'utf8'); } catch { return []; }
      return text.split('\n').filter(l => /^\s*Objective /.test(l) && (!only || only.test(l)))
        .map(l => ({ at: `${dir}/${name}`, text: /"([^"]*)"\.\s*$/.exec(l)![1]! }));
    });
  }
}
describe('a hook', () => {
  it('names its first step: every going-on of a town, and every work\'s next aim', () => {
    const hooks = [...Hooks.texts('data/goings-on', n => `${n}/situation.kyr`),
      ...Hooks.texts('data/generation/works', n => n, /_sought when knows\(party, \{w\}_named\)/)];
    expect(hooks.length).toBeGreaterThan(30);
    expect(hooks.filter(h => !verbs.has(h.text.split(' ')[0]!)).map(h => `${h.at}: ${h.text}`)).toEqual([]);
  });
});
