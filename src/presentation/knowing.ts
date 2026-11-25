import type { Campaign } from '../campaign/campaign';
import type { Call, Operator } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { Outcome } from './outcome';
import { PlayerView, type PlayerSnapshot } from './player-view';

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
  private static readonly kept = new WeakMap<Campaign, Knowing>();
  private readonly sights: { inView?: ReadonlySet<string>; present?: ReadonlySet<string>;
    visited?: ReadonlySet<string> } = {};
  private constructor(readonly campaign: Campaign, readonly world: Campaign['world'],
    readonly perceived: PlayerSnapshot) {}
  static of(campaign: Campaign): Knowing {
    const perceived = PlayerView.observe(campaign), kept = this.kept.get(campaign);
    if (kept && kept.world === campaign.world && kept.perceived === perceived) { return kept; }
    const now = new Knowing(campaign, campaign.world, perceived);
    this.kept.set(campaign, now);
    return now;
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
}
