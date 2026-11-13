import type { Campaign } from '../campaign/campaign';
import type { Entity, Operator } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../spatial';
import { Stakes } from '../ui/stakes';
import { AimAdvances } from './aim-advances';
import type { PlayerView } from './player-view';
import { Undertakings } from './undertakings';
import type { Screen } from '../ui/screen-types';

// The aim followed is a destination, leads and a route (review-mitigations U1; the lead's ruling, 13 November, PL-13):
// a place it names, been to already, is the aim's only while something there would now bring about what it waits on,
// with what the company has; and an act that tells where what it waits on is to be had, or where a place it names
// lies, is a lead, and its next step. On Gothgiba's waterside the gold had gone back to the fevered child's bailey,
// where nothing could be done without herbs, beside "Ask Harbek where willow grows".
export class AimLeads {
  // What brings the aim followed about here (see AimAdvances), and its leads.
  static advances(campaign: Campaign, rows: ReturnType<typeof PlayerView.choices>): Set<string> {
    return new Set([...AimAdvances.of(campaign, rows), ...this.of(campaign, rows)]);
  }
  // The acts that tell where a place the aim names lies, or where what it waits on someone keeping (the herbs or
  // willow bark the child's mother wants) grows to be gathered: their facts lead there (leadsTo), not yet known.
  static of(campaign: Campaign, rows: ReturnType<typeof PlayerView.choices>): Set<string> {
    const def = Undertakings.followed(campaign), w = campaign.world;
    if (!def || !w.relates('leadsTo')) { return new Set(); }
    const places = new Set([...Stakes.named(campaign, def), ...this.supplies(campaign, def)]);
    const actor = campaign.playerActor ?? 'party';
    const facts = new Set(w.related('leadsTo').filter(l => places.has(l.args[1]!)).map(l => l.args[0]!)
      .filter(f => !w.test(ModuleWriter.call('knows', actor, f))));
    return new Set(rows.filter(r => (r.action.success ?? []).some(c => c.kind === 'assert' && c.call.name === 'knows'
      && facts.has(c.call.args[1] ?? ''))).map(r => r.choice.id));
  }
  // The places the aim followed names, been to, where nothing would now bring it about: nothing new there for now
  // (drawn as idle places are, and never the aim's way).
  static spent(campaign: Campaign, screen: Screen, named: Set<string>): Set<string> {
    const been = new Set(screen.map.filter(p => p.visited).map(p => p.id)), here = screen.place.id;
    return new Set([...named].filter(id => id !== here && been.has(id) && !this.there(campaign, id)));
  }
  private static readonly kinds = new WeakMap<object, Map<string, Set<string>>>();
  private static could(campaign: Campaign, def: NonNullable<ReturnType<typeof Undertakings.followed>>): Set<string> {
    const kept = this.kinds.get(campaign.module) ?? this.kinds.set(campaign.module, new Map()).get(campaign.module)!;
    if (!kept.has(def.id)) {
      const coin = AimAdvances.wants(campaign);
      const names = new Set(AimAdvances.waits(campaign.module, def).map(c => c.name));
      kept.set(def.id, new Set(campaign.module.actions.filter(a => ['combat', 'acquire'].includes(a.resolve?.name ?? '')
        || (coin && /^sell_/.test(a.schema ?? a.id)) || (a.success ?? []).some(c => c.call && names.has(c.call.name)))
        .map(a => a.id)));
    }
    return kept.get(def.id)!;
  }
  // Whether what the aim followed waits on is known to lie within the site the company is in, or at the door of: it
  // names someone or something there, or a place in it, or what it waits on is hidden or to be learned there, or a lead
  // the company holds says where in it (the lead's ruling, 13 November, PL-23). Not so, the site's unseen rooms are
  // exploration, never the aim's: the debt's gold had walked the hobs' hold room by room into an empty spy-crack. Away
  // from any site there is nothing to hold back.
  static within(campaign: Campaign, screen: Screen, named: Set<string>): boolean {
    const byId = EntityIndex.of(campaign.module.entities).byId, w = campaign.world, here = screen.place.id;
    const sites = new Set([here, ...screen.exits.map(e => e.destination.id)]
      .flatMap(id => this.site(byId, id) ?? []));
    if (!sites.size) { return true; }
    const actor = campaign.playerActor ?? 'party', at = { campaign, byId, sites, here };
    const told = w.relates('leadsTo') ? w.related('leadsTo')
      .filter(l => w.test(ModuleWriter.call('knows', actor, l.args[0]!))).map(l => l.args[1]!) : [];
    return [...[...named].filter(id => id !== actor), ...AimAdvances.sought(campaign),
      ...AimAdvances.taughtAt(campaign), ...told]
      .some(id => this.inside(id, at));
  }
  private static site(byId: Map<string, Entity>, id: string): string | undefined {
    return Spatial.ancestry(byId, id).find(e => e.space?.kind === 'site')?.id;
  }
  // Somewhere in one of those sites, or whoever or whatever stands in it, but not the site itself nor where the
  // company stands.
  private static inside(id: string, at: { campaign: Campaign; byId: Map<string, Entity>; sites: Set<string>;
    here: string }): boolean {
    const w = at.campaign.world;
    const place = at.byId.get(id)?.space ? id : w.one('at', id) ?? (w.relates('inside') ? w.one('inside', id) : undefined);
    return !!place && !at.sites.has(id) && place !== at.here
      && Spatial.ancestry(at.byId, place).some(e => at.sites.has(e.id));
  }
  // Where what the aim waits on someone keeping grows: each place a stand of a kind they want stands in, and the
  // places round it.
  private static supplies(campaign: Campaign, def: NonNullable<ReturnType<typeof Undertakings.followed>>): string[] {
    const w = campaign.world, keepers = AimAdvances.waits(campaign.module, def)
      .filter(c => c.name === 'keeps' && !c.args[0]!.startsWith('?')).map(c => c.args[0]!);
    if (!keepers.length || !w.relates('wants') || !w.relates('crop')) { return []; }
    const wanted = new Set(w.related('wants').filter(r => keepers.includes(r.args[0]!)).map(r => r.args[1]!));
    const byId = EntityIndex.of(campaign.module.entities).byId;
    return w.related('crop').filter(r => wanted.has(w.one('itemKind', r.args[0]!) ?? ''))
      .flatMap(r => Spatial.ancestry(byId, w.one('at', r.args[1]!) ?? '').map(e => e.id));
  }
  // Whether anything the company could do at a place, were it standing there as it is now, would bring about what
  // the aim followed waits on (see AimAdvances): its acts there grounded on the world with the company moved.
  // Only the kinds of act that could: those that change a relation the aim waits on, or end in a fight or a find.
  // Worked out once for each world (a world is never changed, only replaced), as the glance is drawn again and again.
  private static readonly answered = new WeakMap<object, Map<string, boolean>>();
  static there(campaign: Campaign, place: string): boolean {
    const w = campaign.world, known = this.answered.get(w) ?? this.answered.set(w, new Map()).get(w)!;
    const key = `${Undertakings.followed(campaign)?.id ?? ''}|${place}`;
    if (!known.has(key)) { known.set(key, this.reckoned(campaign, place)); }
    return known.get(key)!;
  }
  private static reckoned(campaign: Campaign, place: string): boolean {
    const w = campaign.world, actor = campaign.playerActor ?? 'party', here = w.one('at', actor);
    const def = Undertakings.followed(campaign);
    if (!here || here === place || !def) { return true; }
    const moved = w.apply([{ kind: 'retract', call: ModuleWriter.call('at', actor, here) },
      { kind: 'assert', call: ModuleWriter.call('at', actor, place) }]);
    const rows = campaign.operators.applicable(moved, actor, this.could(campaign, def))
      .map((action: Operator) => ({ action, choice: { id: action.id } }));
    return AimAdvances.of(campaign, rows as unknown as ReturnType<typeof PlayerView.choices>).size > 0;
  }
}
