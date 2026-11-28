import type { Campaign } from '../campaign/campaign';
import type { Call, Operator } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { Outcome } from './outcome';
import { PlayerView, type PlayerSnapshot } from './player-view';
import { PlayerRevision } from './player-revision';
import { ObservationText } from '../lang/observation-text';
import type { World } from '../lang/world';

// The knowledge boundary's one door (OR-527; platform-separation.md, the trust thread, point 3, adopted by the owner on
// 25 November): what the company knows and perceives, derived from the authoritative state here and nowhere else in
// the player layer, for one player revision. The presentation, the screen's model and the clients ask it, never the
// world, and scripts/knowledge-door.ts counts each read of the world they still make outside it (its manifest names
// this door's parts: PlayerView's perception, CompanyKnowledge, CompanyMap, the Outcome). It tells apart
// - what is perceived now: the place the company stands in and its nesting, whoever and whatever is in view there,
//   the company's own members and what they carry (inView);
// - what was perceived before and is remembered: the places gone to (visited);
// - what was learnt: the facts the company knows (knows);
// - what is mechanically available but not narratively known: an act the rules allow whose teaching turns on what the
//   company cannot see, which is no lesson to it (teaches: the chest's letter, foreseen only by one who could see in).
// Legality stays the runtime's: the rows are the acts the rules offer (PlayerFrame), and this warrants only their
// wording and facets. A second projection for a revision is the one kept.
export class Knowing {
  private readonly sights: { inView?: ReadonlySet<string>; present?: ReadonlySet<string>;
    visited?: ReadonlySet<string> } = {};
  private constructor(readonly campaign: Campaign, readonly world: Campaign['world'],
    readonly perceived: PlayerSnapshot) {}
  // The projection of the campaign's player revision, kept with it.
  static of(campaign: Campaign): Knowing {
    return PlayerRevision.of(campaign).reading('knowing', () =>
      new Knowing(campaign, campaign.world, PlayerView.observe(campaign)));
  }
  get actor(): string { return this.perceived.actor; }
  // Where the company stands (the place itself, whatever kind of place): asked of the campaign as well, by what works
  // its own rows out (which the projection of the revision is built from) and by any reader of where it is.
  get here(): string | undefined { return Knowing.here(this.campaign); }
  static here(campaign: Campaign): string | undefined {
    return campaign.playerActor ? campaign.world.one('at', campaign.playerActor) : undefined;
  }
  // Whoever and whatever is in view where the company stands (PlayerView.present), by id: someone there unseen is not.
  get present(): ReadonlySet<string> { return this.sights.present ??= new Set(this.perceived.present.map(e => e.id)); }
  // The marvels among what is in view (`Marvel.`: marvel(thing)), by id: the Atlas's uncanny, of what the company sees
  // (the screen's people and things, for the glance, which has them without asking the perception again).
  static marvels(campaign: Campaign, inView: Iterable<string>): ReadonlySet<string> {
    const w = campaign.world;
    return new Set(w.relates('marvel') ? [...inView].filter(id => w.test(ModuleWriter.call('marvel', id))) : []);
  }
  // Perceived now, by id: the place and the places it is within, those in view there, the company, its members and
  // what they carry.
  get inView(): ReadonlySet<string> {
    const p = this.perceived;
    return this.sights.inView ??= new Set([p.actor, ...p.location ? [p.location.id] : [],
      ...(p.spatial?.ancestry ?? []).map(a => a.id), ...p.present.map(e => e.id), ...p.party.map(m => m.id),
      ...(p.items ?? []).map(i => i.id)]);
  }
  // Perceived before and remembered: the places the company has been.
  get visited(): ReadonlySet<string> {
    return this.sights.visited ??= new Set(this.perceived.map.places.filter(p => p.visited).map(p => p.id));
  }
  // What the company sees and has been, in words: what an act would teach it is carried from one world to the next
  // while this is as it was (see Outcome.carried).
  get sight(): string {
    return this.seen ??= `${[...this.inView].sort().join(',')}|${[...this.visited].sort().join(',')}`;
  }
  private seen?: string;
  // Learnt: whether the company knows a fact (or has heard of a thing).
  knows(fact: string): boolean { return this.world.test(ModuleWriter.call('knows', this.actor, fact)); }
  // Whether the company could tell that a fact holds or does not, by what it perceives, remembers or knows: a fact of
  // the company itself, of what is in view, of a place it has been, or of what it knows of. One of something unseen
  // (a letter inside a shut chest) it cannot.
  foresees(call: Call): boolean {
    const of = call.args[0];
    return of === undefined || of.startsWith('?') || this.inView.has(of) || this.visited.has(of) || this.knows(of);
  }
  // What an offered act would teach the company that it could foresee (an Atlas row's "to learn"): what its success
  // tells outright, and what the world would then show, where what else that turns on is the company's to tell.
  taught(action: Operator): readonly string[] {
    return Outcome.foreseen(this.world, action, this);
  }
  teaches(action: Operator): boolean { return this.taught(action).length > 0; }
  // Whether one who could be fought here lets the company be, as it shows (tolerates the company): no threat to it.
  // Read of the world as it stands, without working out what is perceived (so a leg's reading costs no perception).
  static tolerates(campaign: Campaign, group: string): boolean {
    const w = campaign.world, actor = campaign.playerActor ?? 'party';
    return w.relates('tolerates') && w.test(ModuleWriter.call('tolerates', group, actor));
  }
  // Whether one here warns the company off (warned: data/rules/inhabitants.kyr; how long they wait is Patience's).
  static warns(campaign: Campaign, group: string): boolean {
    const w = campaign.world, actor = campaign.playerActor ?? 'party';
    return w.relates('warned') && w.test(ModuleWriter.call('warned', group, actor));
  }
  // Whether a thing lying here is spoils to the company: of a valuable kind, and no one else's.
  // Whether a thing lies loose where the company stands, to be gathered up with the rest of what lies there (the
  // rules' loose: seen, no one's, not for sale, not in an unfriendly keeper's lair; OR-1870's pile).
  static loose(campaign: Campaign, item: string): boolean {
    const w = campaign.world, actor = campaign.playerActor ?? 'party', here = Knowing.here(campaign);
    return !!here && w.module.queries.some(q => q.name === 'loose')
      && w.test(ModuleWriter.call('loose', item, actor, here));
  }
  static spoils(campaign: Campaign, item: string): boolean {
    const w = campaign.world;
    return Knowing.valuable(w, item) && !Knowing.theirs(w, item, campaign.playerActor ?? 'party');
  }
  // Whether something is a treasure (its kind valuable, by the catalog: see Overlays.declareWorth). An engine reading,
  // read through this door by the screen too (ui/treasure).
  static valuable(w: World, id: string): boolean {
    const kind = w.module.relations.some(r => r.name === 'valuable') ? w.one('itemKind', id) : undefined;
    return !!kind && w.test(ModuleWriter.call('valuable', kind));
  }
  // Whose a thing is, when it is someone's other than the company's: theirs, not spoils to be led to (the page led with
  // the hobs' rings in their own store after "Don't touch nothing", and brought the raiders down on a lone newcomer:
  // register M19-233).
  // Not once they have been routed from it: the Gaffer gone out of the back way from the bell, his chest is plunder.
  static theirs(w: World, id: string, company: string): string | undefined {
    const owner = w.relates('owns') ? w.related('owns').find(r => r.args[1] === id && r.args[0] !== company)?.args[0]
      : undefined;
    const routed = !!owner && w.relates('routed') && w.test(ModuleWriter.call('routed', owner));
    return owner && !routed ? ObservationText.label(w, owner) : undefined;
  }
}
