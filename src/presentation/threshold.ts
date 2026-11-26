import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { EntityIndex } from '../lang/entity-index';
import { Spatial } from '../lang/spatial';
import { ItemNames } from '../lang/item-names';
import { Means, type Lead } from './means';
import { CompanyRecall } from './company-recall';

// The threshold of the place the followed aim is about: what bars the way on, and the ways that leave it.
export class Threshold {
  // A way on not yet taken, in a site or a place the aim names, that nothing open crosses and something barred would:
  // what that would take, said with what the company needs. A ranger alone at Ironkeep's portcullis had found push,
  // pull, listen and search all empty, and only the way out, while heaving it up needed brawn and the breach in the
  // curtain wall climbing or rope, said nowhere (the terminal's human session, 15 November).
  // With who sells what it needs, where the world says (Means): "…: needs climbing or a coil of rope; Orm Ashby
  // sells a coil of rope".
  static barred(screen: Screen, named: Set<string>, campaign?: Campaign): string[] {
    const ways = this.ways(screen, named, campaign);
    const leads = campaign && ways.length ? Means.leads(campaign, screen, new Set(ways.map(e => e.id))) : [];
    const byId = campaign && EntityIndex.of(campaign.module.entities).byId;
    return ways.flatMap(e => {
      const barred = e.acts.find(a => a.disabled), way = Threshold.upper(e.way ?? e.name);
      const from = leads.find(l => l.way === e.id)?.from[0], kind = from && campaign?.catalog.find(from.kind)?.name;
      const who = from && byId?.get(from.seller)?.name, called = who?.includes(',') ? `${who},` : who;
      const had = called && kind ? `; ${called} sells ${ItemNames.called(kind)}` : '';
      if (barred) { return [`${barred.label === 'Go' ? way : barred.label}: ${Threshold.clause(barred.disabled!)}${had}`]; }
      return !e.acts.length && e.blocked ? [`${way}: ${Threshold.clause(e.blocked)}${had}`] : [];
    });
  }
  // The same, typed, for every client and pin: each barred way on, what it needs, and who has it (Glance's leads).
  static leads(campaign: Campaign, screen: Screen, named: Set<string>): { leads?: Lead[] } {
    const ways = this.ways(screen, named, campaign);
    const leads = ways.length ? Means.leads(campaign, screen, new Set(ways.map(e => e.id))) : [];
    return leads.length ? { leads } : {};
  }
  // In a town, a barred way at the place the aim names is the aim's only where it goes toward something the aim names
  // (the corn-store's padlock, said at Porthalen's landing as the need of the reeve's claim, which names the landing
  // and nothing behind that door: S3-0, GR-11); in a site every way on not yet taken is.
  private static ways(screen: Screen, named: Set<string>, campaign?: Campaign): Screen['exits'] {
    const site = screen.path.some(p => p.kind === 'site');
    if (!named.has(screen.place.id) && !site) { return []; }
    return screen.exits.filter(e => !e.visited && !e.crosses && !e.acts.some(a => a.moves && !a.disabled)
      && (e.acts.some(a => a.disabled) || (!e.acts.length && !!e.blocked))
      && (site || !campaign || this.toward(campaign, screen, named, e.destination.id)));
  }
  // Whether a way goes to a place the aim names, or to where the company knows something it names to lie or stand
  // (OR-881: never where it stands unseen).
  private static toward(campaign: Campaign, screen: Screen, named: Set<string>, to: string): boolean {
    const byId = EntityIndex.of(campaign.module.entities).byId;
    return named.has(to) || [...named].some(id => id !== screen.place.id
      && [id, CompanyRecall.where(campaign, id) ?? ''].some(at => Spatial.ancestry(byId, at).some(a => a.id === to)));
  }
  // "Needs brawn: no one in the company can use it now." and "You would need climbing or a coil of rope." alike.
  private static clause(reason: string): string {
    return (reason.split(':')[0] ?? reason).replace(/\.$/, '').replace(/^(Needs|You would need)\b/, 'needs');
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Where the company stands at a place the followed aim names, or inside the site it names something in: the ways
  // that leave it (not those further in). There, a grave choice is the place's real business, promoted into the four
  // with its grave mark and no gold, and the way back out is not gilded: gold is the next step of what is followed, and
  // leaving is not that (the lead's ruling, 15 November, on Mistlake's speaking door: push, pull and listen spent, the
  // four had been the way out to the woods, a wait and a spell, the riddle's words buried in the rest).
  static leaving(campaign: Campaign, screen: Screen, named: Set<string>): Set<string> | undefined {
    const byId = EntityIndex.of(campaign.module.entities).byId, here = screen.place.id;
    const sites = new Set([...named].flatMap(id => {
      const at = CompanyRecall.where(campaign, id);
      return at ? Spatial.ancestry(byId, at).filter(e => e.space?.kind === 'site').map(e => e.id) : [];
    }));
    const scope = named.has(here) ? here : screen.path.find(p => p.kind === 'site' && sites.has(p.id))?.id;
    if (!scope) { return undefined; }
    return new Set(screen.exits.filter(e => !e.destination.underground && !['enter', 'descend'].includes(e.transition)
      && !Spatial.ancestry(byId, e.destination.id).some(a => a.id === scope)).map(e => e.id));
  }
}
