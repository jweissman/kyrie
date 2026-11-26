import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import type { Aspect, Sensed } from './glance-types';
import { Companions } from './companions';
import { PassageModel } from '../ui/passage-model';
import { CompanySenses } from './company-senses';

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
    return Math.max(r.base, ...Object.entries(r.by).filter(([cap]) => CompanySenses.capable(campaign, actor, cap))
      .map(([, n]) => n));
  }
  // By each way the company can see from here: what kind of thing lies along it within reach, and how many places
  // off the nearest is.
  static sensed(campaign: Campaign, screen: Screen): Sensed[] {
    const range = this.range(campaign, 'companionship'), who = Companions.possible(campaign);
    if (!range || !who.size) { return []; }
    // Where each who could join stands: a few lookups, not every fact of where everyone is.
    const at = CompanySenses.standing(campaign, who);
    if (!at.size) { return []; }
    // The ways on from each place, as the company would find them (PassageModel), read only where the reach goes past
    // the next place: a shut door, a guarded way or one that wants a skill is not seen past, as the first step's is
    // not (a Gregarious company had perceived someone three places off through a padlocked shed door: the atlas
    // characterized).
    const ways = range > 1 ? CompanySenses.passages(campaign, PassageModel) : undefined;
    const out: Sensed[] = [];
    for (const to of new Set(screen.exits.filter(e => !e.blocked).map(e => e.destination.id))) {
      const near = this.nearest(to, { ways, here: screen.place.id, range, at });
      if (near) { out.push({ to, aspect: 'companionship', far: near.far, ...near.who ? { who: near.who } : {} }); }
    }
    return out;
  }
  // How many places off the nearest place along a way holds one, counting the way's own end as one, and the first
  // one there; none past reach.
  private static nearest(first: string, { ways, here, range, at }: { ways?: PassageModel; here: string;
    range: number; at: Map<string, string[]> }): { far: number; who?: string } | undefined {
    const seen = new Set([here, first]);
    for (let frontier = [first], far = 1; frontier.length && far <= range; far++) {
      const held = frontier.find(p => at.has(p));
      if (held) { return { far, who: at.get(held)![0] }; }
      if (far === range || !ways) { break; }
      frontier = frontier.flatMap(p => ways.ways(p).filter(w => !Perception.shut.has(w.status) && !seen.has(w.to))
        .map(w => { seen.add(w.to); return w.to; }));
    }
    return undefined;
  }
  // What a way that is not gone along is: shut, guarded, or wanting what the company has not got.
  private static readonly shut = new Set(['blocked', 'guarded', 'needs']);
  // What a way's row says of whoever is perceived along it (the owner, 17 November: a companion's icon on the Go lens
  // and no one on its rows broke its promise): them by name where the company knows them (has met them and been told
  // their name), else someone; and further on where they are past the way's own end.
  static notes(campaign: Campaign, sensed: Sensed[]): Map<string, string> {
    return new Map(sensed.map(x => [x.to, x.who && CompanySenses.acquainted(campaign, x.who)
      ? `${CompanySenses.label(campaign, x.who)}${x.far > 1 ? ', further on,' : ','} who might go with you`
      : `someone${x.far > 1 ? ' further on' : ''} who might go with you`]));
  }
  static shown(campaign: Campaign, screen: Screen): { sensed?: Sensed[] } {
    const sensed = this.sensed(campaign, screen);
    return sensed.length ? { sensed } : {};
  }
}
