import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { ModuleWriter } from '../lang/module-writer';
import type { Aspect, Sensed } from './glance-types';
import { Companions } from './companions';

// What a company perceives beyond where it stands, apart from what it can do here (the owner, 11 November: perception
// range is not actionability). Each kind of opportunity is perceived so many ways off along the world's connections:
// a possible companion one place away, for anyone; a Gregarious company (a perk or a bard's gift, not yet in the
// game) three. What is perceived farther off is less said: which way, and what kind of thing, never who or what to do.
// It guides going to look; it never offers the act from here. Nothing hidden is perceived: only the ways the company
// can see from here are gone along, and only those within the reach.
export class Perception {
  static readonly reach: Partial<Record<Aspect, { base: number; by: Record<string, number> }>> = {
    companionship: { base: 1, by: { gregarious: 3 } } };
  // How far the company perceives a kind of thing: the most its capabilities give, at least the base.
  static range(campaign: Campaign, aspect: Aspect): number {
    const r = this.reach[aspect], actor = campaign.playerActor;
    if (!r || !actor) { return 0; }
    return Math.max(r.base, ...Object.entries(r.by).filter(([cap]) => campaign.world.relates('capable')
      && campaign.world.test(ModuleWriter.call('capable', actor, cap))).map(([, n]) => n));
  }
  // By each way the company can see from here: what kind of thing lies along it within reach, and how many places
  // off the nearest is.
  static sensed(campaign: Campaign, screen: Screen): Sensed[] {
    const range = this.range(campaign, 'companionship'), who = Companions.possible(campaign);
    if (!range || !who.size) { return []; }
    const at = new Map<string, string[]>();
    for (const r of campaign.world.related('at')) {
      if (who.has(r.args[0]!)) { at.set(r.args[1]!, [...at.get(r.args[1]!) ?? [], r.args[0]!]); }
    }
    const links = campaign.world.related('connects'), out: Sensed[] = [];
    for (const to of new Set(screen.exits.filter(e => !e.blocked).map(e => e.destination.id))) {
      const far = this.nearest(to, { links, here: screen.place.id, range, at });
      if (far !== undefined) { out.push({ to, aspect: 'companionship', far }); }
    }
    return out;
  }
  // How many places off the nearest place along a way holds one, counting the way's own end as one; none past reach.
  private static nearest(first: string, { links, here, range, at }: { links: readonly { args: readonly string[] }[];
    here: string; range: number; at: Map<string, string[]> }): number | undefined {
    const seen = new Set([here, first]);
    for (let frontier = [first], far = 1; frontier.length && far <= range; far++) {
      if (frontier.some(p => at.has(p))) { return far; }
      frontier = frontier.flatMap(p => links.filter(l => l.args[1] === p && !seen.has(l.args[2]!))
        .map(l => { seen.add(l.args[2]!); return l.args[2]!; }));
    }
    return undefined;
  }
  static shown(campaign: Campaign, screen: Screen): { sensed?: Sensed[] } {
    const sensed = this.sensed(campaign, screen);
    return sensed.length ? { sensed } : {};
  }
}
