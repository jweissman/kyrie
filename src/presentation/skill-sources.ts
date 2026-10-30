import type { Campaign } from '../campaign/campaign';
import { Canon } from '../canon/canon';
import { ItemNames } from '../item-names';

// Where a skill the company lacks is to be had: someone who sells a thing that gives it to whoever carries it (a
// glossary of the old script, for lore), and where they keep it (the first the world names). "Needs lore" had
// said nothing of where lore was to be had, so the singing hall's door of notes was a wall (the expedition diagnosis).
export class SkillSources {
  static where(campaign: Campaign, skill: string): string | undefined {
    const kinds = new Set(Object.entries(Canon.items).filter(([, i]) => i.grants?.skill === skill).map(([k]) => k));
    if (!kinds.size) { return undefined; }
    const world = campaign.world, byId = new Map(campaign.module.entities.map(e => [e.id, e]));
    const ware = world.related('itemKind').find(r => kinds.has(r.args[1]!)
      && world.related('soldBy').some(s => s.args[0] === r.args[0]));
    if (!ware) { return undefined; }
    const seller = world.related('soldBy').find(s => s.args[0] === ware.args[0])!.args[1]!;
    const place = world.one('at', seller), who = byId.get(seller)?.name, kind = Canon.items[ware.args[1]!]!.name;
    if (!who) { return undefined; }
    const at = place && byId.get(place)?.name;
    return `${who}${at ? `, at ${at},` : ''} sells ${ItemNames.called(kind)}.`;
  }
}
