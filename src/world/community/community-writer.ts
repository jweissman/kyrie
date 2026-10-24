import { Voice } from '../../narrative/voice';
import { Overlays } from '../../overlays';
import { Canon } from '../../canon/canon';
import { RegionGrowth } from '../region-growth';
import trades from '../../../data/generation/scenes/occupations.json';
import { RegionGeography } from '../region-geography';
import { RegionNews } from '../region-news';
import type { Region } from '../region-writer';
import type { Animal, Community, Resident } from './community';
import { Likeness } from '../../paintings/likeness';
import { Portraits } from '../../paintings/portraits';

// A community written as Kyr: its workplaces off the green; each of its people at their work by day, at the inn or
// at home of an evening, and indoors at night, seen at what they do and ready to say something of it; its animals,
// which can be made much of; and its one small trouble.
export class CommunityWriter {
  static readonly q = JSON.stringify;
  // Where the workplaces stand about the green: the spots of its grid the green, inn, shrine and shop leave free.
  static readonly spots: [number, number][] = [[0, 0], [2, 0], [0, 2], [1, 2], [2, 2]];
  static lines(region: Region, c: Community): string[] {
    const s = c.settlement, q = this.q;
    return [
      `  Place ${s.id}_houses ${q(`the houses of ${s.name}`)} is room within ${s.id} indoors.`,
      ...c.workplaces.flatMap((w, i) => {
        const [x, y] = this.spots[i] ?? [3, i];
        return [`  Place ${w.id} ${q(w.name)} is room within ${s.id} at ${x}, ${y}${w.indoors ? ' indoors' : ''}.`,
          `  Passage ${w.id}_way ${q(w.indoors ? `the door of ${w.name}` : `the way to ${w.name}`)} is ${w.indoors ? 'door' : 'path'} between ${s.id}_green and ${w.id}.`,
          `  Observe ${w.id}_scene at ${w.id} as fixture when true ${q(w.scene)}.`];
      }),
      ...c.residents.flatMap(r => this.resident(region, c, r)),
      ...c.animals.filter(a => a.at).flatMap(a => this.animal(a)),
      ...this.concern(region, c),
    ];
  }
  private static said(text: string, r: { name: string; pronoun: string }, place: string): string {
    return Voice.render(text.replace(/\{Name\}/g, r.name).replace(/\{place\}/g, place), { pronoun: r.pronoun });
  }
  // A painting of someone who could be them: of their sex, and of their work or its station; each one's own in the
  // country (see Portraits).
  private static readonly portraits = new WeakMap<Region, Portraits>();
  private static likeness(region: Region, r: Resident): string {
    return this.likenessOf(region, { pronoun: r.pronoun, painting: r.work.painting, id: r.id });
  }
  // The same for anyone of the country (a traveller on its roads): no two of its people hang in the same painting.
  static likenessOf(region: Region, who: { pronoun: string; painting: string; id: string }): string {
    const portraits = this.portraits.get(region) ?? this.portraits.set(region, new Portraits()).get(region)!;
    const station = Likeness.stations[who.painting];
    const id = portraits.take({ ...who.pronoun === 'she' ? { sex: 'woman' as const } : who.pronoun === 'he' ? { sex: 'man' as const } : {},
      concept: who.painting, ...station ? { stations: [station] } : {} }, `${region.name}:${who.id}`);
    return id ? ` Likeness ${this.q(id)}.` : '';
  }
  private static resident(region: Region, c: Community, r: Resident): string[] {
    const s = c.settlement, q = this.q, work = r.workplace ?? `${s.id}_green`;
    const kin = r.kin ? `, ${c.residents.find(x => x.id === r.kin!.to)?.name}'s ${r.kin.as}` : '';
    const role = `the ${r.work.name}${kin}`, their = Voice.pronouns[r.pronoun]!.their;
    const about = r.workplace ? c.workplaces.find(w => w.id === r.workplace)!.name : `${their} work`;
    const evening = r.evening === 'inn' && c.inn ? `${s.id}_taproom` : `${s.id}_houses`;
    const free = `able(${r.id}) and not travelsWith(${r.id}, party) and not following(${r.id}, party)`;
    return [
      `  Person ${r.id} ${q(r.name)} at ${work} { Role ${q(role)}. Ancestry ${r.ancestry}.`
        + ` ${Overlays.has(r.work.background, 'profession') ? 'Profession' : 'Background'} ${r.work.background}.`
        + `${this.calling(r.work.background)}${this.likeness(region, r)}`
        + ` Peaceable. Pronouns ${r.pronoun}. Manner ${r.manner}. }`,
      `  Observe ${r.id}_seen near ${r.id} of ${r.id} when at(${r.id}, ${work}) ${q(this.said(r.seen, r, s.name))}.`,
      ...r.evening === 'inn' && c.inn ? [`  Observe ${r.id}_evening near ${r.id} of ${r.id} when at(${r.id}, ${s.id}_taproom) ${q(this.said(r.tavern, r, s.name))}.`] : [],
      // Asked once: asked again, the same answer would only come again.
      `  Topic ${r.id}_work with ${r.id} ${q(`Ask ${r.name} about ${about}`)} when true once {`,
      `    Says ${q(this.said(r.talk, r, s.name))}.`, '  }',
      ...this.knowing(region, c, r), ...this.telling(region, c, r), ...this.recognising(r),
      // The day's round: at work from seven, of an evening from six, indoors from nine; wherever they ought to be
      // and are not, they go.
      `  Rule ${r.id}_day when hour(clock) >= 7 and hour(clock) < 18 and not at(${r.id}, ${work}) and ${free} { Assert at(${r.id}, ${work}). }`,
      `  Rule ${r.id}_evening when hour(clock) >= 18 and hour(clock) < 21 and not at(${r.id}, ${evening}) and ${free} { Assert at(${r.id}, ${evening}). }`,
      `  Rule ${r.id}_night when (hour(clock) >= 21 or hour(clock) < 7) and not at(${r.id}, ${s.id}_houses) and ${free} { Assert at(${r.id}, ${s.id}_houses). }`,
    ];
  }
  // Someone whose work is by the water knows where the willow grows (and so what to strip for a fever): they say
  // where, and the company knows it.
  private static knowing(region: Region, c: Community, r: Resident): string[] {
    const q = this.q, s = c.settlement;
    if (!r.work.knows?.some(k => k === 'water' || k === 'herbs') || s.cell === undefined) { return []; }
    const where = RegionGrowth.near(region, 'willow', s.cell);
    if (!where.length) { return []; }
    const fact = `${r.id}_willows`, places = where.length > 1 ? `${where[0]}, and along ${where[1]}` : where[0]!;
    return [`  Entity ${fact}: fact ${q(`Willows grow by the water on ${places}: willow bark breaks a fever.`)}.`,
      `  Topic ${r.id}_where with ${r.id} ${q(`Ask ${r.name} where willow grows`)} when not knows(actor, ${fact}) {`,
      `    Says ${q(`'Willow? By the water, same as everywhere,' says ${r.name}. 'There's a good stand on ${places}. Strip the bark, not the wood.'`)}.`,
      `    On discuss { Assert knows(actor, ${fact}). }`, '  }'];
  }
  // Someone whose work takes them round the roads (a tinker crying "news for nothing") has news of a neighbour.
  private static telling(region: Region, c: Community, r: Resident): string[] {
    const s = c.settlement, road = RegionGeography.roads(region).find(x => x.from.id === s.id || x.to.id === s.id);
    if (!r.work.knows?.includes('roads') || !road) { return []; }
    const near = road.from.id === s.id ? road.to : road.from;
    return [`  Topic ${r.id}_news with ${r.id} ${this.q(`Ask ${r.name} for the news`)} when true once {`,
      `    Says ${this.q(RegionNews.heard(region, near, { name: r.name, pronoun: r.pronoun, key: r.id }))}.`, '  }'];
  }
  // Someone who has done the same kind of work knows the company for it, and is kind to it.
  private static recognising(r: Resident): string[] {
    const family = Canon.backgrounds[r.work.background]?.kind, line = family && this.recognition[family];
    if (!line) { return []; }
    return [`  Topic ${r.id}_shop with ${r.id} ${this.q(`Talk shop with ${r.name}`)} when craft(actor, craft_${family}) once {`,
      `    Says ${this.q(this.said(line, r, ''))}.`, '    On discuss { Increase quantity(actor, rations) by 1. }', '  }'];
  }
  static readonly recognition = (trades as unknown as { recognition: Record<string, string> }).recognition;
  // The calling some work asks of whoever does it: a trapper is a ranger, an old soldier a warrior, a fiddler a bard.
  private static calling(background: string): string {
    const needs = Overlays.has(background) ? Overlays.get(background).requiredClass : undefined;
    return needs ? ` Calling ${needs}.` : '';
  }
  private static animal(a: Animal): string[] {
    const q = this.q;
    return [`  Person ${a.id} ${q(a.name)} at ${a.at} { Role ${q(a.role)}. Species ${a.species}. Pronouns ${a.pronoun}. Peaceable. }`,
      ...a.seen ? [`  Observe ${a.id}_seen near ${a.id} of ${a.id} when at(${a.id}, ${a.at})${a.night ? ' and not dark()' : ''} ${q(this.said(a.seen, a, ''))}.`] : [],
      ...a.night ? [`  Observe ${a.id}_dark near ${a.id} of ${a.id} when at(${a.id}, ${a.at}) and dark() ${q(this.said(a.night, a, ''))}.`] : []];
  }
  // The road a settlement's strayed animal is up: each settlement its own, so that two goats are not on one road.
  private static strayRoad(region: Region, id: string) {
    const roads = RegionGeography.roads(region), taken = new Map<string, (typeof roads)[number]>();
    for (const s of region.settlements) {
      const free = roads.find(x => (x.from.id === s.id || x.to.id === s.id) && ![...taken.values()].includes(x));
      if (free) { taken.set(s.id, free); }
    }
    return taken.get(id);
  }
  // A goat got out: she is up the road, eating a hedge, and comes home led; a coin from her people for it. Or someone
  // needs a thing the shop sells, and pays for it brought.
  private static concern(region: Region, c: Community): string[] {
    const concern = c.concern, s = c.settlement, q = this.q;
    if (!concern) { return []; }
    const r = c.residents.find(x => x.id === concern.resident)!;
    if (concern.kind === 'strayed') {
      const goat = c.animals.find(a => a.id === concern.animal)!;
      const road = this.strayRoad(region, s.id);
      const where = road ? road.way : `${s.id}_green`, other = road ? (road.from.id === s.id ? road.to : road.from).name : '';
      return [`  Person ${goat.id} ${q(goat.name)} at ${where} { Role ${q(`${r.name}'s goat`)}. Species goat. Pronouns she. Peaceable. }`,
        `  Observe ${goat.id}_seen near ${goat.id} of ${goat.id} when at(${goat.id}, ${where}) ${q(`A goat with a broken tether is cropping the verge, with her whole attention.`)}.`,
        `  Initially Assert home(${goat.id}, ${s.id}_green). Initially Assert acceptsEscort(${goat.id}, party).`,
        `  Topic ${r.id}_goat with ${r.id} ${q(`Ask ${r.name} what the matter is`)} when not cameHome(${goat.id}) once {`,
        `    Says ${q(`'${goat.name} has had her tether through again,' says ${r.name}. '${road ? `She'll be off up the road to ${other}, eating somebody's hedge` : 'She will be in somebody\'s garden'}. If you see her, bring her home. She comes for anyone who walks like they mean it.'`)}.`, '  }',
        `  Rule ${goat.id}_thanks when cameHome(${goat.id}) and not grateful(${r.id}, party) says ${q(`${r.name} catches ${goat.name}'s broken tether and ties it twice. 'Thank you. Here.' A coin, warm from a pocket.`)} {`,
        `    Assert grateful(${r.id}, party). Increase quantity(party, gold) by 1. Retract acceptsEscort(${goat.id}, party). }`];
    }
    return [`  Initially Assert wants(${r.id}, ${concern.wants}).`,
      `  Topic ${r.id}_wants with ${r.id} ${q(`Ask ${r.name} what the matter is`)} when not grateful(${r.id}, party) once {`,
      `    Says ${q(`'I need a ${concern.wants === 'herbs' ? 'bundle of herbs' : concern.wants} and I've no time to go for one,' says ${r.name}. 'If you can get one, I'd pay you back and a bit over.'`)}.`, '  }',
      `  Rule ${r.id}_thanks when keeps(${r.id}, ?g) and not grateful(${r.id}, party) says ${q(`'That's the one,' says ${r.name}, and pays you for it and a coin besides.`)} {`,
      `    Assert grateful(${r.id}, party). Increase quantity(party, gold) by price(?g).`
        + ` Increase quantity(party, gold) by 1. }`];
  }
}
