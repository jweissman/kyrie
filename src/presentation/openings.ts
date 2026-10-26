import type { Campaign } from '../campaign/campaign';
import { ObservationText } from '../lang/observation-text';
import type { Entity } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { VisitedPlaces } from './visited-places';

// What a skill would open that the company has come to and cannot do now: a way it has stood at the end of that
// wants it (the gauge shaft, climbing or a rope), and a change to something it has seen that wants it (the spade-cuts
// staked, digging or a shovel), once it knows what the change is for. Read from the rules' own needs, so a level's
// development says what it changes in the world, not only on the sheet.
export class Openings {
  static of(campaign: Campaign): Map<string, string[]> {
    const world = campaign.world, actor = campaign.playerActor, out = new Map<string, string[]>();
    if (!actor || !world.relates('needs')) { return out; }
    const entities = new Map(campaign.module.entities.map(e => [e.id, e])), visited = VisitedPlaces.of(campaign, actor);
    for (const [x, need] of world.related('needs').map(r => r.args)) {
      if (entities.get(need!)?.type !== 'capability' || world.test(ModuleWriter.call('capable', actor, need!))
        || world.test(ModuleWriter.call('equippedFor', actor, x!))) { continue; }
      const said = this.said(campaign, entities, x!, visited);
      if (said && !out.get(need!)?.includes(said)) { out.set(need!, [...out.get(need!) ?? [], said]); }
    }
    return out;
  }
  // A way, by its name and where it goes from where the company has been; a change, by what it does.
  private static said(campaign: Campaign, entities: Map<string, Entity>, x: string, visited: Set<string>) {
    const world = campaign.world, actor = campaign.playerActor!, e = entities.get(x);
    if (e?.type === 'passage') {
      const from = world.related('connects').find(r => r.args[0] === x && visited.has(r.args[1]!));
      const shown = !world.relates('revealedBy') || world.test(ModuleWriter.call('visibleTo', x, actor));
      return from && shown ? `${ObservationText.label(world, x)}, to ${ObservationText.label(world, from.args[2]!)}`
        : undefined;
    }
    if (e?.type !== 'change') { return undefined; }
    const thing = world.related('changeOf').find(r => r.args[0] === x)?.args[1], at = thing && world.one('at', thing);
    const informed = !world.relates('changeKnows') || world.test(ModuleWriter.call('informedFor', actor, x));
    return at && visited.has(at) && informed ? e.name.replace(/\{[^}]+\}/g, entities.get(thing)?.name ?? '') : undefined;
  }
}
