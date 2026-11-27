import { Canon } from '../canon/canon';
import { Likeness, type Asked } from './likeness';
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
  private static readonly cast = new WeakMap<object, WeakMap<object, { chosen: Map<string, string | undefined>;
    asked: Map<string, string | undefined> }>>();
  // The painting someone is met in, if any; someone the world's people are not (one asked of by name alone) is given
  // one none of them hangs in.
  static of(campaign: Campaign, id: string): string | undefined {
    return campaign.within(() => this.portrait(campaign, id));
  }
  private static portrait(campaign: Campaign, id: string): string | undefined {
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
    return campaign.within(() => [...new Set([...this.sat(campaign).chosen.values()]
      .filter((p): p is string => !!p))].sort());
  }
  private static sat(campaign: Campaign) {
    let installations = this.cast.get(campaign.module);
    if (!installations) { installations = new WeakMap(); this.cast.set(campaign.module, installations); }
    let sat = installations.get(campaign.installation);
    if (!sat) {
      sat = { chosen: this.sitting(campaign), asked: new Map() };
      installations.set(campaign.installation, sat);
    }
    return sat;
  }
  // Everyone the paintings are of, in the order the world came to hold them: each country's own likenesses taken
  // first, then each person given the next that fits their country, apart from what was given before them elsewhere.
  // Painted country by country, a country drawn later beyond the march, sharing the world's outermost place with the
  // first, had been painted before a ship's crew held long before it, and changed their faces (Aggie Nunn, when the
  // Wapshotts' fourth act came in): whoever the world holds later is painted after everyone it held before.
  private static sitting(campaign: Campaign): Map<string, string | undefined> {
    const chosen = new Map<string, string | undefined>(), given = new Map<string, string>();
    const creatures = new Map(campaign.readout.creatures.map(c => [c.id, c]));
    const countries = this.countries(campaign, creatures), of = new Map<string, number>(), taken: Set<string>[] = [];
    countries.forEach((people, n) => {
      taken.push(new Set(people.flatMap(id => this.own(campaign, id) ?? [])));
      for (const id of people) { of.set(id, n); }
    });
    const ids = campaign.module.entities.map(e => e.id).filter(x => of.has(x));
    const sole = this.sole(campaign, ids, creatures);
    for (const id of ids) {
      const n = of.get(id)!, held = new Set([...given].filter(([, c]) => c !== String(n)).map(([p]) => p));
      // A country drawn beyond the march gives its own people none the world holds already: where none is left,
      // they are met by their emblem (a ship's cook and an eel-man over the march had shared one).
      const beyond = /^x[mp]\d+y[mp]?\d+__/.test(id);
      const painting = this.fit(campaign, id, beyond ? { taken: new Set([...taken[n]!, ...held]), creatures, sole }
        : { taken: taken[n]!, held, creatures, sole });
      chosen.set(id, painting);
      if (painting) { taken[n]!.add(painting); if (!given.has(painting)) { given.set(painting, String(n)); } }
    }
    return chosen;
  }
  // The people of each country, as the world holds them: a country by the first of its people, and its people in
  // turn, so that whoever the world comes to hold later is painted after everyone it held before.
  private static countries(campaign: Campaign, creatures: Map<string, Creature>): string[][] {
    const entities = campaign.module.entities, parent = new Map(entities.map(e => [e.id, e.space?.parent]));
    const kind = new Map(entities.map(e => [e.id, e.space?.kind]));
    const start = new Map<string, string>(), by = new Map<string, string[]>(), groups = campaign.readout.inhabitants;
    for (const c of campaign.module.initial) {
      if (c.kind === 'assert' && c.call.name === 'at' && !start.has(c.call.args[0]!)) {
        start.set(c.call.args[0]!, c.call.args[1]!);
      }
    }
    for (const e of entities) {
      if (!Object.hasOwn(groups, e.id) || !this.member(campaign, e.id, creatures)) { continue; }
      let place = start.get(e.id) ?? '';
      for (let up = parent.get(place); up && kind.get(place) !== 'region'; up = parent.get(place)) { place = up; }
      // One who begins nowhere (offstage, to come aboard later) is a country of their own, painted where the world
      // first held them: lumped with everyone else who begins nowhere, a country drawn later beyond the march had
      // taken a circus cook's painting from her (Aggie Nunn, when the Wapshotts' fourth act came in).
      const country = place || `@${e.id}`;
      by.set(country, [...by.get(country) ?? [], e.id]);
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
  // Who of each work with a painting of its own is painted in it (CO-03): one worker in a world, the first in the
  // order the world holds them whom the world's seed favours (a hash of it and their id, one in four), so that it is
  // not the first town's innkeeper in every world, and those the world comes to hold later (a country drawn beyond
  // the march) change no one's held before. The first town's innkeeper had been the tavernkeeper's in every world.
  private static sole(campaign: Campaign, ids: string[], creatures: Map<string, Creature>): Map<string, string> {
    const first = new Map<string, string>(), seed = campaign.readout.seed;
    for (const id of ids) {
      const work = Likeness.work(this.asked(campaign, id, creatures));
      if (work && !first.has(work) && Sittings.hash(`${seed}\u0000${id}`) % 4 === 0) { first.set(work, id); }
    }
    return new Map([...first].map(([work, id]) => [id, work]));
  }
  private static hash(text: string): number {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 16777619); }
    return h >>> 0;
  }
  private static fit(campaign: Campaign, id: string, at: { taken: Set<string>; held?: Set<string>;
    creatures?: Map<string, Creature>; sole?: Map<string, string> }): string | undefined {
    const asked = this.asked(campaign, id, at.creatures);
    const sole = !at.sole || !Likeness.work(asked) ? undefined : at.sole.has(id);
    // A generated country's people are keyed by its world too: by id alone, the first town's innkeeper of every world
    // (region__s1_innkeeper) had been one face, the art-dealer's (CO-03).
    const key = id.startsWith('region__') ? `${campaign.readout.seed}:${id}` : id;
    return Likeness.of({ ...asked, key, taken: at.taken, ...at.held ? { held: at.held } : {},
      ...sole !== undefined ? { sole } : {} });
  }
  private static asked(campaign: Campaign, id: string, creatures?: Map<string, Creature>): Asked {
    const w = campaign.world, entities = campaign.module.entities, member = this.member(campaign, id, creatures);
    const [name, ...rest] = entities.find(e => e.id === id)?.name.split(', ') ?? [];
    const kinship = w.relates('kinship') ? w.one('kinship', id) : undefined;
    const role = [rest.join(' '), kinship && entities.find(e => e.id === kinship)?.name].filter(Boolean).join(', ');
    const pronoun = w.relates('pronouns') ? w.one('pronouns', id) : undefined;
    const sex = /pron_he$/.test(pronoun ?? '') ? 'man' as const : /pron_she$/.test(pronoun ?? '') ? 'woman' as const
      : undefined;
    const own = this.own(campaign, id);
    return { ...own ? { own } : {}, ...member?.backgroundId ? { background: member.backgroundId } : {},
      ...member?.professionId ? { profession: member.professionId } : {}, ...role ? { role } : {},
      ...name ? { name } : {}, ...sex ? { sex } : {} };
  }
  // Whether someone is painted at all: one person, of a people who look like the folk in the paintings (a band of
  // goblins is not, nor a lizardfolk). The one gate of every reading above, so that whoever is met by their emblem is
  // never given a painting elsewhere: Gesk, a lizardfolk met by his emblem in Gatesend's taproom, had been the
  // ascetic's painting on his page and in a fight, and a bare glyph on the scene once he joined (OR-1070).
  static painted(campaign: Campaign, id: string): boolean { return !!this.member(campaign, id); }

}
