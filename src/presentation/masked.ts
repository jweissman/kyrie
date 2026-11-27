import type { World } from '../lang/world';
import { EntityIndex } from '../lang/entity-index';
import { ObservationText } from '../lang/observation-text';

export interface Unnamed { id: string; name: string; called: string }
// A name said as it is known: where it stands as a whole name, never inside another word (Tibb in "Tibbet's yard",
// the handoff's §7), the longest names first where the caller gives them so.
export class Masked {
  static said(text: string, name: string, as: string): string {
    if (!name || !text.includes(name)) { return text; }
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'gu'), () => as);
  }
  // What the company does not yet call by its name, and what it calls it instead: a place not learned, as it is seen;
  // someone or something known as something while that holds, as that (the Book of Faces' BOF-01). Longest first.
  static unnamed(world: World): Unnamed[] {
    const index = EntityIndex.of(world.module.entities);
    return [...index.aliased, ...index.roled]
      .map(e => ({ id: e.id, name: e.name,
        called: ObservationText.knownAs(world, e) ?? ObservationText.known(world, e) }))
      .filter(u => u.called !== u.name).sort((a, b) => b.name.length - a.name.length);
  }
  // A choice's words, each name the company does not know said as it is known; but a name that what the choice is
  // done to or with has come to be called by is left as it is, though another of that name is still unknown (two
  // traps alike in one barrow, one understood: CB-19; UNT-121, names matched as strings).
  static choice(world: World, name: string, bindings: Record<string, string> | undefined,
    unnamed: Unnamed[]): string {
    const byId = EntityIndex.of(world.module.entities).byId;
    // Of what it binds, what could be called otherwise and is now called by its name.
    const plain = new Set(Object.values(bindings ?? {}).map(id => byId.get(id))
      .filter(e => (e?.roles || e?.alias) && !unnamed.some(u => u.id === e.id)).map(e => e!.name));
    // And another bound thing's own name is said whole, as it was written: a name the company does not know inside it
    // is a part of that name (a clause "that the Imprimatur may burn as it judges", put to a parliament before the
    // Imprimatur was named, had been offered with the building's look in it: UNT-203).
    const whole = Object.values(bindings ?? {}).map(id => byId.get(id)?.name ?? '')
      .filter(n => n && !unnamed.some(u => u.name === n) && unnamed.some(u => n !== u.name && n.includes(u.name)));
    return this.outside(name, whole.sort((a, b) => b.length - a.length), { unnamed, plain });
  }
  // The text with each name the company does not know said as it is known, but within the names kept.
  private static outside(text: string, kept: string[], by: { unnamed: Unnamed[]; plain: Set<string> }): string {
    const at = kept.map(k => ({ k, i: text.indexOf(k) })).filter(x => x.i >= 0).sort((a, b) => a.i - b.i)[0];
    if (at) {
      return `${this.outside(text.slice(0, at.i), [], by)}${at.k}${this.outside(text.slice(at.i + at.k.length), kept, by)}`;
    }
    return by.unnamed.reduce((t, u) => by.plain.has(u.name) ? t : this.said(t, u.name, u.called), text);
  }
}
