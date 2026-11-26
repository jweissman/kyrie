import type { Campaign } from '../campaign/campaign';
import type { Objective, Predicate } from '../lang/module';
import { EntityIndex } from '../lang/entity-index';
import { ItemNames } from '../lang/item-names';
import { ModuleWriter } from '../lang/module-writer';
import { AimAdvances } from './aim-advances';
import { Means } from './means';

// What the aim followed waits on to be learned at a place, behind a thing the company cannot change: the fact it
// waits on is seen there only once the thing is so (the reeve's receipt held up against the road-grant's seal, the
// grant read), and every change that would make it so asks what the company has not got (reading the grant wants
// lore: OR-175). Gone in, a warrior with the press-door open had read the steward's papers and gone back to the town,
// and the gold had led back in, again and again. As a shut way is (Shut), no step, and the need says so.
export interface Unreadable { thing: string; name: string; needs: string[] }
export class Unread {
  static at(campaign: Campaign, place: string, def: Objective): Unreadable | undefined {
    const w = campaign.world, party = campaign.playerActor ?? 'party';
    const facts = new Set(AimAdvances.waits(campaign.module, def).filter(c => c.name === 'knows'
      && !w.test(ModuleWriter.call('knows', party, c.args[1]!))).map(c => c.args[1]!));
    const shown = (campaign.module.observations ?? []).filter(o => o.place === place && o.teaches
      && facts.has(o.teaches));
    if (!shown.length) { return undefined; }
    let found: Unreadable | undefined;
    for (const o of shown) {
      const wanting = Unread.leaves(o.when).flatMap(l => l.kind === 'call' && l.name === 'state'
        && !w.test(l) ? [l.args as [string, string]] : []);
      if (!wanting.length) { return undefined; }
      for (const [thing, state] of wanting) {
        const changes = w.related('changeTo').filter(r => r.args[1] === state && w.test(ModuleWriter.call('changeOf',
          r.args[0]!, thing))).map(r => r.args[0]!);
        if (!changes.length || changes.some(c => w.test(ModuleWriter.call('equippedFor', party, c)))) { return undefined; }
        const needs = [...new Set(changes.flatMap(c => w.related('needs').filter(r => r.args[0] === c)
          .map(r => r.args[1]!)))];
        found ??= { thing, name: EntityIndex.of(campaign.module.entities).byId.get(thing)?.name ?? thing, needs };
      }
    }
    return found;
  }
  // "The road-grant in the press: it wants lore, and the company has none of it."
  static said(campaign: Campaign, u: Unreadable): string {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    const named = u.needs.map(n => Means.item(campaign.catalog, n)
      ? ItemNames.called(Means.item(campaign.catalog, n)!)
      : (byId.get(n)?.name ?? n.replace(/_/g, ' ')).toLowerCase());
    const list = named.length > 1 ? `${named.slice(0, -1).join(', ')} or ${named.at(-1)}` : named[0] ?? 'more';
    return `${u.name.charAt(0).toUpperCase()}${u.name.slice(1)}: it wants ${list}, and the company has none of it.`;
  }
  private static leaves(p: Predicate | undefined): Predicate[] {
    if (!p) { return []; }
    return p.kind === 'and' ? [...Unread.leaves(p.left), ...Unread.leaves(p.right)] : [p];
  }
}
