import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { ScreenModel } from '../../src/ui/screen-model';
import { Marks } from '../../src/ui/marks';
import { ChoiceList, type Choice } from '../../src/ui/choice-list';
import { DeepSounds } from '../../src/world/deep/deep-sounds';
import type { DeepLayout, DeepRoom } from '../../src/world/deep/deep-layout';

// Truthful foreboding (OR-1854; the owner, 27 November: an unwarned fight is only very occasionally lethal, and the
// place itself forebodes it). The barrow's forecourt dead came at a company the moment it went in, and the stair it
// came down had told it nothing: the generator heard a band only from the rooms of its own layout, never from the way
// in outside, and the way in said only "Something is in there". Now a band that falls on whoever comes in (or one of
// the deep's worst) is told at every way to it by two signs of its own kind, its sound and its spoor, the first room
// heard from the way in outside too; and the way in says the fight is met on the threshold.
const room = (id: string, role: string): DeepRoom => ({ id, level: 0, role, x: 0, y: 0, name: id, scene: '', lit: true });
const layout: DeepLayout = { site: 'stair', levels: [{ id: 'barrow', index: 0, name: 'the barrow', flooded: false,
  rooms: [room('court', 'mouth'), room('passage', 'passage')] }],
links: [{ id: 'run', a: 'court', b: 'passage', kind: 'passage', name: 'the low run', minutes: 2 }] };
const lines = DeepSounds.lines(layout, { id: 'dead', room: 'court', temperament: 'savage', kind: 'undead' });
const at = (place: string) => lines.filter(l => new RegExp(`^ {2}Observe dead_\\w+ at ${place} `).test(l));
const world = `
  Place stair "the stair" is room at 0, 0 underground.
  Place court "the forecourt" is room at 1, 0 underground.
  Place passage "the long passage" is room at 2, 0 underground.
  Passage way_in "the way in" is tunnel between stair and court.
  Passage run "the low run" is passage between court and passage.
  Person dead "the dead of the mound" at court { Role "the restless dead". Species zombie. Numbers 3. Level 1. Temperament savage. Lair court. }
  Company party "You" of 1 at stair.
${lines.join('\n')}
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };

describe('a band that falls on whoever comes in, foreboded', () => {
  it('is told by two signs of its kind at every way to it, the way in from outside among them', () => {
    for (const place of ['stair', 'passage']) {
      const signs = at(place);
      expect(signs.length).toBe(2);
      expect(signs.some(l => / as sound /.test(l) && /never drawn in/.test(l))).toBe(true);
      expect(signs.some(l => /feet that drag/.test(l))).toBe(true);
    }
  });
  it('is heard from the stair, its spoor seen on a look, and the way in says it may come at you', async () => {
    const t = await Tiny.start(world, { horizon: ['inhabitants', 'canon'],
      party: [{ name: 'Odile', raceId: 'human', classId: 'warrior' }] });
    const r = new Runner(t.session);
    expect(r.said().scene.lines.join(' ')).toMatch(/never drawn in/);
    expect(said(await r.ask(JSON.stringify({ look: true }))).scene.lines.join(' ')).toMatch(/feet that drag/);
    const screen = ScreenModel.build(t.campaign), [ways] = Marks.on(screen, [ChoiceList.ways(screen.exits)]);
    const flat = (cs: Choice[]): Choice[] => cs.flatMap(c => [c, ...flat(c.children ?? [])]);
    const heard = flat(ways!.choices).filter(c => c.id.includes('t__court')).flatMap(c => c.marks ?? [])
      .filter(m => m.kind === 'heard').map(m => m.said);
    expect(heard[0]).toBe('What is in there may come at you as you go in.');
  });
});
