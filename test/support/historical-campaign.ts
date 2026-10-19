import { Content } from '../../src/content';
import type { CampaignSave } from '../../src/campaign/campaign';

export class HistoricalCampaign {
  static gameplay(save: CampaignSave, historicalAbilities: Set<string>) {
    const catalogPredicates = new Set(['canTrain', 'canCast', 'treatable', 'fieldUsable', 'persistentWard']);
    // Catalog projections are compared only for abilities that exist both then and now: abilities added since, and
    // site hazards or dead entries retired from the global catalog since, were never part of the play itself.
    const current = new Set(Content.abilities.map(a => a.id));
    const inHistoricalCatalog = (name: string, args: string[]) => !catalogPredicates.has(name)
      || (historicalAbilities.has(args[args.length - 1]!) && current.has(args[args.length - 1]!));
    const changes = (lines: string[]) => lines.filter(line => {
      const call = /^[+-] (\w+)\((.*)\)$/.exec(line);
      return !call || inHistoricalCatalog(call[1]!, call[2]!.split(',').map(a => a.trim()));
    });
    return {
      state: { ...save.state, world: { ...save.state.world,
        relations: save.state.world.relations.filter(c => inHistoricalCatalog(c.name, c.args)) } },
      creatures: save.creatures, encounter: save.encounter, observations: save.observations, rewarded: save.rewarded,
      events: save.events.map(event => ({ ...event, changes: changes(event.changes) })),
      actors: save.definition?.actors, pressures: save.definition?.pressures, outcomes: save.definition?.outcomes,
    };
  }
}
