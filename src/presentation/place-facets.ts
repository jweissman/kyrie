import type { Screen } from '../ui/screen-types';
import type { Aspect, Lensed, Sensed } from './glance-types';
import { Emphasis } from './emphasis';
import { Indicator } from './indicator';

// What each place the map shows is to the company, by what it knows from where it stands (the owner, 17 November:
// a gold act and no gold on the map; a town with something in it and nothing on its label): the aim followed's places,
// the aim's; another aim's, somewhere worth going; who might join, perceived along a way; and whatever the ways from
// here are led with for (the places lens's four). A room's is its town's too, as the map draws a town by its name
// alone. The map's marks and its menu are drawn from this one reading, so the map, its rows and the scene's agree.
export class PlaceFacets {
  static readonly order: readonly Aspect[] = [...Emphasis.precedence, ...Indicator.iconed];
  static of(screen: Screen, glance?: { sensed?: Sensed[]; lenses?: { places?: Lensed } }): Record<string, Aspect[]> {
    const out = new Map<string, Set<Aspect>>(), within = screen.region?.within ?? {};
    for (const aim of screen.aims ?? []) {
      (aim.places ?? []).forEach(p => this.add(out, [p, within[p] ?? p], [aim.followed ? 'undertaking' : 'exploration']));
    }
    (glance?.sensed ?? []).forEach(s => this.add(out, [s.to, within[s.to] ?? s.to], [s.aspect]));
    const exits = new Map(screen.exits.map(e => [e.id, e.destination.id]));
    for (const p of glance?.lenses?.places?.promoted ?? []) {
      const to = p.choice.startsWith('travel:') ? p.choice.slice('travel:'.length) : exits.get(p.exit ?? p.choice);
      // The aim's gold only on the followed aim's own (Promotion.gilded keeps it on the next step alone).
      if (to) { this.add(out, [to, within[to] ?? to], p.aspects.filter(a => a !== 'undertaking')); }
    }
    const drawn = [...out].map(([id, has]): [string, Aspect[]] => [id, this.order.filter(a => has.has(a))]);
    return Object.fromEntries(drawn.filter(([, aspects]) => aspects.length));
  }
  // A place's, and its town's.
  private static add(out: Map<string, Set<Aspect>>, ids: string[], aspects: readonly Aspect[]) {
    for (const id of new Set(ids)) {
      const has = out.get(id) ?? new Set<Aspect>();
      aspects.forEach(a => has.add(a));
      out.set(id, has);
    }
  }
}
