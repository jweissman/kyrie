import type { Screen } from '../ui/screen-types';
import type { Aspect } from './glance-types';
import { Attest, type Projected, type Witness } from './attest';
import { Emphasis } from './emphasis';
import { Indicator } from './indicator';

// What each place the map shows is to the company, by what it knows from where it stands (the owner, 17 November:
// a gold act and no gold on the map; a town with something in it and nothing on its label): the aim followed's places,
// the aim's; another aim's, somewhere worth going; who might join, perceived along a way; and whatever the ways from
// here are led with for (the places lens's four). A room's is its town's too, as the map draws a town by its name
// alone. The map's marks and its menu are drawn from this one reading, so the map, its rows and the scene's agree.
export class PlaceFacets {
  static readonly order: readonly Aspect[] = [...Emphasis.precedence, ...Indicator.iconed];
  private static readonly read = new WeakMap<object, WeakMap<object, Map<string, Witness[]>>>();
  // Each place's witnesses (Attest): directional, a step toward somewhere, never a thing to do there.
  static of(screen: Screen, glance?: Projected): Map<string, Witness[]> {
    const key = glance ?? screen, kept = this.read.get(key)?.get(screen);
    if (kept) { return kept; }
    const out = new Map<string, Witness[]>(), within = screen.region?.within ?? {};
    for (const aim of screen.aims ?? []) {
      const said = [aim.followed ? 'undertaking' as const : 'exploration' as const];
      (aim.places ?? []).forEach(p => this.add(out, [p, within[p] ?? p], Attest.toward(`aim:${aim.id}`, said)));
    }
    (glance?.sensed ?? []).forEach(s => this.add(out, [s.to, within[s.to] ?? s.to], Attest.sensed(glance, s.to)));
    const exits = new Map(screen.exits.map(e => [e.id, e.destination.id]));
    for (const p of glance?.lenses?.places?.promoted ?? []) {
      const to = p.choice.startsWith('travel:') ? p.choice.slice('travel:'.length) : exits.get(p.exit ?? p.choice);
      // The aim's gold only on the followed aim's own (Promotion.gilded keeps it on the next step alone).
      const w = Attest.witness(glance, p.choice);
      if (to && w) { this.add(out, [to, within[to] ?? to], Attest.toward(w.id, w.aspects.filter(a => a !== 'undertaking'))); }
    }
    const inner = this.read.get(key) ?? new WeakMap<object, Map<string, Witness[]>>();
    inner.set(screen, out); this.read.set(key, inner);
    return out;
  }
  // A place's aspects, as its witnesses have them, in the one precedence.
  static aspects(witnesses: readonly Witness[] | undefined): Aspect[] {
    const has = new Set((witnesses ?? []).flatMap(w => w.aspects));
    return this.order.filter(a => has.has(a));
  }
  // A place's, and its town's.
  private static add(out: Map<string, Witness[]>, ids: string[], w: Witness | undefined) {
    if (!w || !w.aspects.length) { return; }
    for (const id of new Set(ids)) { out.set(id, [...out.get(id) ?? [], w]); }
  }
}
