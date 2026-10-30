import { Canon } from '../canon/canon';
import { Likeness } from './likeness';
import type { Campaign } from '../campaign/campaign';

type Creature = Campaign['readout']['creatures'][number];

// Who in a world is painted in what, the same wherever they are met: their own likeness, or one for their work and
// what they are to others (see Likeness). No two people of one country hang in one painting: a country (all that is
// within the place its people's places are within: a generated country, an authored world) has its people's own
// likenesses taken first, then each of its people in the order the world holds them is given the best left that
// fits, or none. A widow in black and a sick child's mother of two villages had been one smiling woman gutting a fish
// (the cold evaluation), and the drover's wife a chandler's painting two towns off (M17-65): each home had been
// painted apart. Whoever comes later (a story begun in a town, a country beyond the march) takes nothing from anyone
// met before, and a painting held in a country before is given again only where nothing else fits as well, a march
// away; a country drawn beyond the march is drawn apart from them too (see held). It had been chosen apart from
// whoever else was on the page, so a brother met on the landing among five others was an old man in a window, and a
// young shepherd once he had joined (play 10). One of the company's own family is painted as what they are to the
// company (your mother), as well as what the world says of them.
export class Sittings {
  private static readonly cast = new WeakMap<object, { chosen: Map<string, string | undefined>;
    asked: Map<string, string | undefined> }>();
  // The painting someone is met in, if any; someone the world's people are not (one asked of by name alone) is given
  // one none of them hangs in.
  static of(campaign: Campaign, id: string): string | undefined {
    const { chosen, asked } = this.sat(campaign);
    if (chosen.has(id)) { return chosen.get(id); }
    if (!asked.has(id)) {
      const taken = new Set([...chosen.values(), ...asked.values()].filter((p): p is string => !!p));
      asked.set(id, this.fit(campaign, id, { taken }));
    }
    return asked.get(id);
  }
  // Every painting the world's people hang in: what the world holds, not whom a page has asked after, so the same
  // commands draw the same country beyond the march (see Frontier).
  static held(campaign: Campaign): string[] {
    return [...new Set([...this.sat(campaign).chosen.values()].filter((p): p is string => !!p))].sort();
  }
  private static sat(campaign: Campaign) {
    let sat = this.cast.get(campaign.module);
    if (!sat) {
      sat = { chosen: this.sitting(campaign), asked: new Map() };
      this.cast.set(campaign.module, sat);
    }
    return sat;
  }
  // Everyone the paintings are of, country by country: each country's own likenesses taken first, then each of its
  // people given the next that fits.
  private static sitting(campaign: Campaign): Map<string, string | undefined> {
    const chosen = new Map<string, string | undefined>(), held = new Set<string>();
    const creatures = new Map(campaign.readout.creatures.map(c => [c.id, c]));
    for (const people of this.countries(campaign, creatures)) {
      const taken = new Set(people.flatMap(id => this.own(campaign, id) ?? []));
      for (const id of people) {
        const painting = this.fit(campaign, id, { taken, held, creatures });
        chosen.set(id, painting);
        if (painting) { taken.add(painting); }
      }
      for (const painting of taken) { held.add(painting); }
    }
    return chosen;
  }
  // The people of each country, as the world holds them: a country by the first of its people, and its people in
  // turn, so that whoever the world comes to hold later is painted after everyone it held before.
  private static countries(campaign: Campaign, creatures: Map<string, Creature>): string[][] {
    const entities = campaign.module.entities, parent = new Map(entities.map(e => [e.id, e.space?.parent]));
    const start = new Map<string, string>(), by = new Map<string, string[]>(), groups = campaign.readout.inhabitants;
    for (const c of campaign.module.initial) {
      if (c.kind === 'assert' && c.call.name === 'at' && !start.has(c.call.args[0]!)) {
        start.set(c.call.args[0]!, c.call.args[1]!);
      }
    }
    for (const e of entities) {
      if (!Object.hasOwn(groups, e.id) || !this.member(campaign, e.id, creatures)) { continue; }
      let place = start.get(e.id) ?? '';
      for (let up = parent.get(place); up; up = parent.get(place)) { place = up; }
      by.set(place, [...by.get(place) ?? [], e.id]);
    }
    return [...by.values()];
  }
  // The one person a painting would be of: of a people the paintings are of (not a band, not a goblin), and not the
  // company itself. Whoever has joined the company is still the person they were met as.
  private static member(campaign: Campaign, id: string, creatures?: Map<string, Creature>): Creature | undefined {
    const members = campaign.readout.inhabitants[id];
    if (!members || members.length > 1 || id === campaign.playerActor) { return undefined; }
    const body = members[0] ?? `${id}_person`;
    const member = creatures ? creatures.get(body) : campaign.readout.creatures.find(c => c.id === body);
    return member && Canon.ancestries[member.raceId]?.playable === true ? member : undefined;
  }
  private static own(campaign: Campaign, id: string): string | undefined {
    const w = campaign.world, own = w.relates('likeness') ? w.one('likeness', id) : undefined;
    return own ? campaign.module.entities.find(e => e.id === own)?.name ?? own : undefined;
  }
  private static fit(campaign: Campaign, id: string,
    at: { taken: Set<string>; held?: Set<string>; creatures?: Map<string, Creature> }): string | undefined {
    const w = campaign.world, entities = campaign.module.entities, member = this.member(campaign, id, at.creatures);
    const [name, ...rest] = entities.find(e => e.id === id)?.name.split(', ') ?? [];
    const kinship = w.relates('kinship') ? w.one('kinship', id) : undefined;
    const role = [rest.join(' '), kinship && entities.find(e => e.id === kinship)?.name].filter(Boolean).join(', ');
    const pronoun = w.relates('pronouns') ? w.one('pronouns', id) : undefined;
    const sex = /pron_he$/.test(pronoun ?? '') ? 'man' as const : /pron_she$/.test(pronoun ?? '') ? 'woman' as const
      : undefined;
    const own = this.own(campaign, id);
    return Likeness.of({ ...own ? { own } : {}, ...member?.backgroundId ? { background: member.backgroundId } : {},
      ...member?.professionId ? { profession: member.professionId } : {}, ...role ? { role } : {},
      ...name ? { name } : {}, ...sex ? { sex } : {}, key: id, taken: at.taken, ...at.held ? { held: at.held } : {} });
  }
}
