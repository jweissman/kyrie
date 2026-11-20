import type { Act, Screen } from '../ui/screen-types';
import type { Glance } from './glance-types';
import { Doable, type Row } from './doable';

// Every selectable action in the player's frame says what it is in words (the owner, 20 November, P0: a blank row
// that asked the company's brother to join it, and did; "Every selectable action has a nonempty, intelligible,
// player-facing label. Invalid or missing labels must be detected before display, with a clear diagnostic identifying
// the originating action and projection stage"). What the engine hands a client, stage by stage: the screen's acts
// (each person's, thing's, way's, member's, carried thing's, the camp's), the glance's four and its offer and lenses,
// and Doable's rows. A word standing alone (Act.alone) that is there must say something too: a client draws it in
// place of the label, and an empty one had been drawn as nothing. The page's own gate is RowWords (web/reader).
export interface Unworded { act: string; stage: string; words: string }
export class Worded {
  // Words a player can read: a letter or a digit, not only spaces and marks.
  static said(words: string | undefined): boolean { return !!words && /[\p{L}\p{N}]/u.test(words); }
  static of(screen: Screen, glance?: Glance): Unworded[] {
    const out: Unworded[] = [];
    const acts: [string, Act[]][] = [['screen.people', screen.people.flatMap(p => p.acts)],
      ['screen.exits', screen.exits.flatMap(e => e.acts)], ['screen.items', screen.items.flatMap(i => i.acts)],
      ['screen.party', screen.party.flatMap(m => m.acts)], ['screen.camp', screen.camp],
      ['screen.unplaced', screen.unplaced ?? []]];
    for (const [stage, list] of acts) { this.acts(list, stage, out); }
    if (!glance) { return out; }
    for (const a of glance.acts) { this.check(a.command ?? a.choice, 'glance.acts', a.label, out); }
    for (const o of [...glance.offer?.primary ?? [], ...glance.offer?.rest ?? []]) {
      this.check(o.command ?? o.choice, 'glance.offer', o.label, out);
    }
    for (const [lens, l] of Object.entries(glance.lenses ?? {})) {
      for (const a of [...l.promoted, ...l.rest, ...Object.values(l.leaves ?? {}).flat()]) {
        this.check(a.command ?? a.choice, `glance.lenses.${lens}`, a.label, out);
      }
    }
    for (const r of Doable.flat(Doable.of(glance, screen))) { this.row(r, out); }
    return out;
  }
  private static acts(list: Act[], stage: string, out: Unworded[]): void {
    for (const a of list) {
      this.check(a.command ?? a.label, stage, a.label, out);
      if (a.alone !== undefined) { this.check(a.command ?? a.label, `${stage} (alone)`, a.alone, out); }
      this.acts(a.children ?? [], stage, out);
    }
  }
  private static row(r: Row, out: Unworded[]): void {
    this.check(r.does ?? r.id, 'Doable', r.label, out);
    if (r.called !== undefined) { this.check(r.does ?? r.id, 'Doable (called)', r.called, out); }
  }
  private static check(act: string, stage: string, words: string | undefined, out: Unworded[]): void {
    if (!this.said(words)) { out.push({ act, stage, words: words ?? '' }); }
  }
}
