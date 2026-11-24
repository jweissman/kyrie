import type { Screen } from '../ui/screen-types';
import type { Aspect } from './glance-types';
import { Attest, type Projected } from './attest';
import { Emphasis } from './emphasis';
import { Indicator } from './indicator';
import { Fold, type Leaf } from './fold';

// What each place the map shows is to the company, by what it knows from where it stands (the owner, 17 November:
// a gold act and no gold on the map; a town with something in it and nothing on its label): the aim followed's, by
// the ways and journeys its route goes by first; another aim's, somewhere worth going, by the ways toward it; who might
// join, perceived along a way; and whatever the ways from here are led with for (the places lens's four). A room's is
// its town's too, as the map draws a town by its name alone. The map's marks and its menu are drawn from this one
// reading, so the map, its rows and the scene's agree.
// Each is a fold of steps (Fold.step): a place is marked only through a way or a journey from here that goes toward
// it, by a directional witness on that first step (AT-07 §4 I7), never by an aim's naming it alone.
export class PlaceFacets {
  static readonly order: readonly Aspect[] = [...Emphasis.precedence, ...Indicator.iconed];
  private static readonly read = new WeakMap<object, WeakMap<object, Map<string, Leaf[]>>>();
  // Each place's leaves: the first steps toward it, each with its directional witness, never a thing to do there.
  static of(screen: Screen, glance?: Projected): Map<string, Leaf[]> {
    const key = glance ?? screen, kept = this.read.get(key)?.get(screen);
    if (kept) { return kept; }
    const out = new Map<string, Leaf[]>(), within = screen.region?.within ?? {};
    const exits = new Map(screen.exits.map(e => [e.id, e.destination.id])), whither = this.whither.bind(this, exits);
    const at = this.at.bind(this, within);
    // The aims' ways and journeys (Glance.aimed): the followed aim's gold (its following), another's worth going.
    // Of the followed aim's steps, the one the engine says is next (its continuance) where it says one: weary in open
    // fields on the night road to Gatesend, the way west across country and "Set out for Gatesend" had both been gold
    // on the map (test/one-gold-on-map), as Promotion.gilded keeps the scene's gold on one step.
    const c = glance?.continuance, next = c && 'witness' in c ? c.witness : undefined;
    const following = new Set((glance?.following ?? []).filter(id => !next || id === next
      || !(glance?.following ?? []).includes(next)));
    for (const id of glance?.aimed ?? []) {
      const to = whither(id);
      const w = following.has(id) ? Attest.only(Attest.witness(glance, id), 'undertaking')
        : Attest.toward(id, ['exploration']);
      if (to) { this.add(out, at(to), Fold.step(id, [w])); }
    }
    // And a journey the map knows straight to a place an aim names, or to its town: itself the first step of the way
    // there (the map's set-out on the followed aim's road, gold: test/follow-offered-browser, where the aim named a
    // road the room's way out did not reach and the map's journey there had been cream).
    const plans = [...screen.destinations ?? [], ...screen.roads ?? [], ...screen.around ?? [], ...screen.mapped ?? []];
    for (const aim of screen.aims ?? []) {
      const said = [aim.followed ? 'undertaking' as const : 'exploration' as const];
      for (const d of plans.filter(x => (aim.places ?? []).some(p => x.id === p || x.id === within[p]))) {
        this.add(out, at(d.id), Fold.step(`travel:${d.id}`, [Attest.toward(`travel:${d.id}`, said)]));
      }
    }
    (glance?.sensed ?? []).forEach(s => this.add(out, at(s.to), Fold.step(`sensed:${s.to}`, [Attest.sensed(glance, s.to)])));
    for (const p of glance?.lenses?.places?.promoted ?? []) {
      const to = p.choice.startsWith('travel:') ? whither(p.choice) : exits.get(p.exit ?? p.choice);
      // The aim's gold only on the followed aim's own (Promotion.gilded keeps it on the next step alone).
      const w = Attest.witness(glance, p.choice);
      if (to && w) { this.add(out, at(to), Fold.step(w.id, [Attest.toward(w.id, w.aspects.filter(a => a !== 'undertaking'))])); }
    }
    const inner = this.read.get(key) ?? new WeakMap<object, Map<string, Leaf[]>>();
    inner.set(screen, out); this.read.set(key, inner);
    return out;
  }
  // Where a way or a journey from here goes.
  private static whither(exits: Map<string, string>, id: string): string | undefined {
    return id.startsWith('travel:') ? id.slice('travel:'.length) : exits.get(id.split('/')[0]!);
  }
  // A place, and the town it is in.
  private static at(within: Record<string, string>, to: string): string[] { return [to, within[to] ?? to]; }
  // A place's aspects, as its leaves bear them, in the one precedence.
  static aspects(leaves: readonly Leaf[] | undefined): Aspect[] {
    const has = new Set((leaves ?? []).flatMap(l => l.witnesses.flatMap(w => w.aspects)));
    return this.order.filter(a => has.has(a));
  }
  // A place's, and its town's.
  private static add(out: Map<string, Leaf[]>, ids: string[], leaf: Leaf) {
    if (!leaf.witnesses.some(w => w.aspects.length)) { return; }
    for (const id of new Set(ids)) {
      if (!out.get(id)?.some(l => l.id === leaf.id)) { out.set(id, [...out.get(id) ?? [], leaf]); }
    }
  }
}
