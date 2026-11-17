import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The first undertown inhabited, not stocked (BP-07): every danger in it has a reason to be there that the world
// says, a job given for it, a story it belongs to, or a way past it that knowledge opens; the beetles in the spoil
// had none, and were a fight between the spiders' gallery and the undercroft. Read from the template every first town
// is written from (data/generation/town/undertown.kyrt).
const template = readFileSync('data/generation/town/undertown.kyrt', 'utf8');
const hostile = [...template.matchAll(/^ {2}Person (\{t\}_u_\w+) "([^"]+)".* \{\n((?: {4}.*\n)+?) {2}\}/gm)]
  .filter(([, , , body]) => !/Peaceable/.test(body!))
  .map(([, id, name, body]) => ({ id: id!, name: name!, body: body! }));
// Its story, where its role names another of them ("the raiser's first tries", the dead in the charnel passage).
const story = (b: { id: string; body: string }) => hostile.some(o => o.id !== b.id
  && b.body.includes(o.id.replace('{t}_u_', '')));
// Every line that names a band but its own: its Person, its experience, its lair.
const named = (id: string) => template.split('\n').filter(line => line.includes(id)
  && !/^\s*(Person|Initially Set encounterXp)\b/.test(line) && !/Lair /.test(line));
describe('the first undertown', () => {
  it('holds no danger without a job, a story or a way past it', () => {
    expect(hostile.length).toBeGreaterThan(5);
    expect(hostile.filter(b => !named(b.id).length && !story(b)).map(b => b.name)).toEqual([]);
    expect(hostile.map(b => b.name)).not.toContain('the beetles in the spoil');
  });
});
