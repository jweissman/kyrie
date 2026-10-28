import { Canon } from '../canon/canon';
import { Likeness } from '../paintings/likeness';
import type { Campaign } from '../campaign/campaign';
import type { TargetRow } from './screen-types';

// The painting each person is met in, the same wherever they are met: their own likeness, or one for their work and
// what they are to others (see Likeness), apart from those of the people of the place they belong to, their own
// likenesses first and then each in turn by id. It had been chosen apart from whoever else was on the page, so a
// brother met on the landing among five others was an old man in a window, and a young shepherd once he had joined
// (play 10). One of the company's own family is painted as what they are to the company (your mother), as well as
// what the world says of them.
export class Portraits {
  private static readonly chosen = new WeakMap<object, Map<string, string | undefined>>();
  static of(campaign: Campaign, id: string): TargetRow['portrait'] {
    const chosen = this.chosen.get(campaign.module) ?? new Map<string, string | undefined>();
    this.chosen.set(campaign.module, chosen);
    if (!chosen.has(id)) { this.choose(campaign, this.home(campaign, id), chosen); }
    if (!chosen.has(id)) { chosen.set(id, this.fit(campaign, id, new Set())); }
    const painting = chosen.get(id);
    return painting ? Likeness.portrait(painting) : undefined;
  }
  // Everyone of one home, in turn: their own likenesses taken first, then each given the next that fits.
  private static choose(campaign: Campaign, home: string, chosen: Map<string, string | undefined>) {
    const people = Object.keys(campaign.readout.inhabitants).filter(id => this.likened(campaign, id)
      && this.home(campaign, id) === home).sort();
    const taken = new Set(people.flatMap(id => this.own(campaign, id) ?? []));
    for (const id of people) {
      const painting = this.fit(campaign, id, taken);
      chosen.set(id, painting);
      if (painting) { taken.add(painting); }
    }
  }
  // One person of a people the paintings are of (not a band, not a goblin).
  private static likened(campaign: Campaign, id: string): boolean {
    const members = campaign.readout.inhabitants[id] ?? [];
    const member = members.length === 1 ? campaign.readout.creatures.find(c => c.id === members[0]) : undefined;
    return !!member && Canon.ancestries[member.raceId]?.playable === true;
  }
  // Where they were at the start, as far up as the settlement it is in (or the country, out of one).
  private static home(campaign: Campaign, id: string): string {
    const at = campaign.module.initial.find(c => c.kind === 'assert' && c.call.name === 'at' && c.call.args[0] === id);
    let place = at?.kind === 'assert' ? at.call.args[1] : undefined;
    const entities = new Map(campaign.module.entities.map(e => [e.id, e]));
    while (place && entities.get(place)?.space?.kind !== 'settlement' && entities.get(place)?.space?.parent) {
      place = entities.get(place)!.space!.parent;
    }
    return place ?? '';
  }
  private static own(campaign: Campaign, id: string): string | undefined {
    const w = campaign.world, own = w.relates('likeness') ? w.one('likeness', id) : undefined;
    return own ? campaign.module.entities.find(e => e.id === own)?.name ?? own : undefined;
  }
  private static fit(campaign: Campaign, id: string, taken: Set<string>): string | undefined {
    const w = campaign.world, entities = campaign.module.entities, members = campaign.readout.inhabitants[id] ?? [];
    const member = campaign.readout.creatures.find(c => c.id === members[0]);
    const [name, ...rest] = entities.find(e => e.id === id)?.name.split(', ') ?? [];
    const kinship = w.relates('kinship') ? w.one('kinship', id) : undefined;
    const role = [rest.join(' '), kinship && entities.find(e => e.id === kinship)?.name].filter(Boolean).join(', ');
    const pronoun = w.relates('pronouns') ? w.one('pronouns', id) : undefined;
    const sex = /pron_he$/.test(pronoun ?? '') ? 'man' as const : /pron_she$/.test(pronoun ?? '') ? 'woman' as const
      : undefined;
    const own = this.own(campaign, id);
    return Likeness.of({ ...own ? { own } : {}, ...member?.backgroundId ? { background: member.backgroundId } : {},
      ...member?.professionId ? { profession: member.professionId } : {}, ...role ? { role } : {},
      ...name ? { name } : {}, ...sex ? { sex } : {}, key: id, taken });
  }
}
