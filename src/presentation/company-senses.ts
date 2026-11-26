import type { Campaign } from '../campaign/campaign';
import { ModuleWriter, ObservationText, type Entity, type Observation, type World } from '../lang/index';
import type { PassageModel } from '../ui/passage-model';

// What the company perceives of itself and of what is about it, for the narrator and the glance's perception (OR-741,
// the knowledge door's slice of narration and perception): a part of the one door (see Knowing), read of the world
// here and nowhere else in those parts. It tells
// - what the one who plays is capable of (a skill, a perk, a gift), which sets how far the company perceives;
// - where those it could perceive along its ways stand, and the ways on as the company would find them;
// - whom the company knows by name, and how it names them;
// - which of the company, awake, brings what a sight wants noticing;
// - which things perceived are growing things;
// - what each observation is, as its author wrote it (its aspect, anchor, what it teaches and who would notice it).
export class CompanySenses {
  // Whether someone is capable of something.
  static capable(campaign: Campaign, actor: string, capability: string): boolean {
    const w = campaign.world;
    return w.relates('capable') && w.test(ModuleWriter.call('capable', actor, capability));
  }
  // Where each of these stands, by place: a few lookups, not every fact of where everyone is.
  static standing(campaign: Campaign, who: Iterable<string>): Map<string, string[]> {
    const at = new Map<string, string[]>(), w = campaign.world;
    for (const id of who) { const p = w.one('at', id); if (p) { at.set(p, [...at.get(p) ?? [], id]); } }
    return at;
  }
  // The ways on from each place, as the company would find them (a shut door, a guarded way, one wanting a skill): a
  // model of them made by the caller's own (the ui folder's PassageModel, which this part does not import: the
  // folders' cycle, test/small/cycles).
  static passages(campaign: Campaign, model: new (world: World, actor: string, byId: Map<string, Entity>) =>
    PassageModel): PassageModel | undefined {
    const actor = campaign.playerActor;
    return actor ? new model(campaign.world, actor, new Map(campaign.module.entities.map(e => [e.id, e]))) : undefined;
  }
  // Whether the company knows someone (has met them and been told their name), and how it names them.
  static acquainted(campaign: Campaign, who: string): boolean {
    const w = campaign.world;
    return w.relates('acquainted') && w.test(ModuleWriter.call('acquainted', who, campaign.playerActor ?? 'party'));
  }
  static label(campaign: Campaign, who: string): string { return ObservationText.label(campaign.world, who); }
  // The one of the company, awake, who brings what a sight wants noticing (see Narrator.noticed): a companion and a
  // member, never a traveller of the country not yet joined.
  static noticer(campaign: Campaign, brings: string): string | undefined {
    const w = campaign.world, company = campaign.playerActor;
    const known = new Set(w.module.relations.map(r => r.name));
    if (!company || !known.has('companion') || !known.has('memberOf')) { return undefined; }
    return w.related('brings').find(r => r.args[1] === brings && w.test(ModuleWriter.call('companion', r.args[0]!))
      && w.test(ModuleWriter.call('memberOf', r.args[0]!, company)) && w.test(ModuleWriter.call('awake', r.args[0]!)))
      ?.args[0];
  }
  // Those of these things that grow (a stand of willow, meadowsweet), where anything does.
  static growing(campaign: Campaign, things: Iterable<string>): Set<string> {
    const w = campaign.world;
    if (!w.module.relations.some(r => r.name === 'grows')) { return new Set(); }
    return new Set([...things].filter(t => w.test(ModuleWriter.call('grows', t))));
  }
  // Each observation as its author wrote it, by its id: read once for each module.
  private static readonly cached = new WeakMap<Campaign['module'], Map<string, Observation>>();
  static observations(campaign: Campaign): Map<string, Observation> {
    let defs = this.cached.get(campaign.module);
    if (!defs) {
      defs = new Map((campaign.module.observations ?? []).map(o => [o.id, o]));
      this.cached.set(campaign.module, defs);
    }
    return defs;
  }
}
