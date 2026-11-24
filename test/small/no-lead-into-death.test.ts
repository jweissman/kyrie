import { describe, expect, it } from 'bun:test';
import { Affordances, type Reading } from '../../src/ui/affordances';
import type { Scene } from '../../src/ui/scene';
import type { Screen } from '../../src/ui/screen-types';
import type { Danger } from '../../src/presentation/danger-sense';

// The page never leads into a fight that can end the life of the one who plays (OR-412; the creative director's call
// on OR-321). Where the reckoning is grave, deadly, or one whose fights felled the one who plays, the attack is no
// candidate to lead with: the lead goes to the way back, someone to take along, or rest, and the attack stays a plain
// row, asked. A fight the company would win, unfelled, is led as it was.
const reading = { schema: new Map([['attack(party,keeper)', 'attack']]), args: new Map(), speakers: new Set(),
  authored: new Set(), named: new Set(), held: new Set(), toward: new Map(), inward: new Set(), here: 'vault',
  signs: new Map(), pointed: new Set(), done: new Set(), talked: new Set(),
  needs: { hungry: false, rations: 0, hurt: new Set(), night: false, weary: false, settled: true, open: false },
} as unknown as Reading;
const screen = (danger: Danger, mortal?: boolean) => ({ people: [{ id: 'keeper', name: 'the keeper',
  reckoning: { danger, text: '', ...mortal ? { mortal } : {} } }], exits: [], map: [], around: [], path: [],
  place: { id: 'vault', name: 'the vault' }, elapsed: 0 }) as unknown as Screen;
const scene: Scene = { subjects: [{ id: 'keeper', kind: 'creature', name: 'the keeper', danger: 'beyond you',
  choices: [{ id: 'keeper#attack', label: 'Attack', command: 'attack(party,keeper)', tone: 'creature' }] }], near: [], far: [], you: [] };
const attacks = (s: Screen) => Affordances.of(scene, s, reading).filter(c => c.kind === 'attack' && c.whys.length);
const rows = (s: Screen) => Affordances.of(scene, s, reading).filter(c => c.kind === 'attack');
describe('a fight that can kill', () => {
  it('is never led with', () => {
    expect(attacks(screen('deadly'))).toEqual([]);
    expect(attacks(screen('grave'))).toEqual([]);
    expect(attacks(screen('hard', true))).toEqual([]);
    // Still a row, with its asking mark, for one who chooses it.
    expect(rows(screen('deadly')).map(c => c.choice)).toEqual(['keeper#attack']);
  });
  it('is led as before where the company would win and no one who plays falls', () => {
    expect(attacks(screen('hard')).map(c => c.whys)).toEqual([['danger']]);
    expect(attacks(screen('fair')).length).toBe(1);
  });
});
