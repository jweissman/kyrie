import type { Campaign } from '../campaign/campaign';
import { ItemNames } from '../lang/item-names';
import { EntityIndex } from '../lang/entity-index';

// Where a skill the company lacks is to be had: someone who sells a thing that gives it to whoever carries it (a
// glossary of the old script, for lore; a ladder, for a climb), and where they keep it (the first the world names).
// "Needs lore" had said nothing of where lore was to be had, so the singing hall's door of notes was a wall (the
// expedition diagnosis).
export class SkillSources {
  static where(campaign: Campaign, skill: string): string | undefined {
    const kinds = new Set(campaign.catalog.ids.filter(id => {
      const item = campaign.catalog.find(id);
      return item?.capability === skill || item?.aids?.includes(skill);
    }));
    if (!kinds.size) { return undefined; }
    // By the indexes of the module's entities and of who sells each thing, not by going through every sale for each
    // thing of every kind.
    const world = campaign.world, byId = EntityIndex.of(campaign.module.entities).byId;
    const ware = world.related('itemKind').find(r => kinds.has(r.args[1]!) && world.related('soldBy', r.args[0]).length);
    if (!ware) { return undefined; }
    const seller = world.related('soldBy', ware.args[0])[0]!.args[1]!;
    const place = world.one('at', seller), who = byId.get(seller)?.name;
    const kind = campaign.catalog.find(ware.args[1]!)?.name;
    if (!kind) { return undefined; }
    if (!who) { return undefined; }
    const at = place && byId.get(place)?.name;
    return `${who}${at ? `, at ${at},` : ''} sells ${ItemNames.called(kind)}.`;
  }
}
