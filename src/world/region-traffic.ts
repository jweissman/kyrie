import { Draw } from './land/draw';
import { RegionGeography, type Road } from './region-geography';
import { Communities } from './community/community';
import { RegionShops } from './region-shops';
import { SettlementWriter } from './settlement-writer';
import { Voice } from '../narrative/voice';
import { CommunityWriter } from './community/community-writer';
import { RegionSites } from './region-sites';
import { RegionNews } from './region-news';
import { DeepPurposes } from './deep/deep-purposes';
import type { Region, Settlement } from './region-writer';
import tables from '../../data/generation/scenes/traffic.json';
import folk from '../../data/generation/scenes/folk.json';

interface Trouble { kind: string; seen: string; act: string; about: string; done: string; freed: string;
  reward: number }
interface Kind { role: string; background: string; painting: string; road: string[]; rest: string[]; morning?: string;
  going: string; tracks: string; trouble?: Trouble; sells?: [string, number, number][] }
interface Traveller { id: string; name: string; pronoun: string; kind: Kind; road: Road; draw: Draw }

// Who is on the roads. One traveller to a road (a carrier, a drover, a pedlar, a pilgrim, a messenger, a family
// moving house), out on it from nine until three going one way, and the next day the other, and spending the night
// where travellers are kept at the end they came to. Met on the road, they say where they are going and why, what news
// there is of the place they left, and what people are saying of the company, once there is anything to say; a
// carrier's cart can go into the ditch and a drover's cow through a hedge, and whoever helps is thanked and paid. What
// they say of a place is what that place is: its founding's gossip and the life of it.
export class RegionTraffic {
  static readonly kinds = tables.kinds as unknown as Record<string, Kind>;
  static lines(region: Region): string[] {
    const roads = RegionGeography.roads(region), draw = new Draw(`${region.name}:traffic`);
    if (!roads.length) { return []; }
    const kinds = draw.shuffle(Object.keys(this.kinds)), used = new Set<string>();
    const travellers = roads.slice(0, 6).map((road, i) => this.traveller(region, road, kinds[i % kinds.length]!, used));
    return ['  Relation journeysTo(group, place). Relation inTrouble(group). Relation helpedBy(group, group).',
      '  Relation renowned(group).',
      // Once anyone in the country is grateful to the company, the roads hear of it.
      '  Rule renown when grateful(?someone, party) and not renowned(party) { Assert renowned(party). }',
      ...travellers.flatMap(t => [...this.person(region, t), ...this.rounds(region, t), ...this.talk(region, t),
        ...this.trouble(t)])];
  }
  private static traveller(region: Region, road: Road, key: string, used: Set<string>): Traveller {
    const draw = new Draw(`${road.way}:traveller`), ancestry = road.from.folk ?? region.ancestry;
    const pronoun = key === 'family' ? draw.pick(['she', 'he']) : draw.chance(0.05) ? 'they' : draw.pick(['she', 'he']);
    const given = folk.given as unknown as Record<string, Record<string, string[]>>;
    const names = given[ancestry] ?? given.human!;
    // A name nobody settled in the country has, so that a traveller is never taken for one of them.
    const name = Communities.distinct(names[pronoun] ?? names.she!, ancestry,
      { draw, taken: new Set([...used, ...Communities.everyone(region), ...RegionShops.keepers(region)]) });
    used.add(name);
    return { id: `${road.way}_t`, name, pronoun, kind: this.kinds[key]!, road, draw };
  }
  private static person(region: Region, t: Traveller): string[] {
    const q = JSON.stringify, k = t.kind, from = t.road.from, rest = SettlementWriter.standing(region, from, 'innkeeper');
    const likeness = CommunityWriter.likenessOf(region, { pronoun: t.pronoun, painting: k.painting, id: t.id });
    const sells = (k.sells ?? []).map(([what, fee, n]) => ` Sells ${what} for ${fee} coin from ${n}.`).join('');
    return [`  Person ${t.id} ${q(t.name)} at ${rest} { Role ${q(k.role)}. Ancestry ${from.folk ?? region.ancestry}.`
      + ` Background ${k.background}.${likeness} Peaceable. Pronouns ${t.pronoun}.`
      + ` Manner ${t.draw.pick(['cheerful', 'grim', 'stoic', 'jovial', 'acerbic', 'compassionate'])}.${sells} }`,
    `  Initially Assert journeysTo(${t.id}, ${t.road.to.id}_green).`];
  }
  // The day's round: out on the road from nine to three, then into the end it was going to, and the next day back.
  private static rounds(region: Region, t: Traveller): string[] {
    const q = JSON.stringify, way = t.road.way, free = `able(${t.id}) and not travelsWith(${t.id}, party) and not inTrouble(${t.id})`;
    const ends: [Settlement, Settlement][] = [[t.road.to, t.road.from], [t.road.from, t.road.to]];
    return [`  Rule ${t.id}_out when hour(clock) >= 9 and hour(clock) < 15 and not at(${t.id}, ${way}) and ${free} { Assert at(${t.id}, ${way}). }`,
      ...ends.flatMap(([to, back], i) => [
        `  Rule ${t.id}_in${i} when (hour(clock) >= 15 or hour(clock) < 9) and at(${t.id}, ${way}) and journeysTo(${t.id}, ${to.id}_green)`
          + ` and ${free} { Assert at(${t.id}, ${SettlementWriter.standing(region, to, 'innkeeper')}). Retract journeysTo(${t.id}, ${to.id}_green).`
          + ` Assert journeysTo(${t.id}, ${back.id}_green). }`,
        `  Observe ${t.id}_road${i} near ${t.id} of ${t.id} when at(${t.id}, ${way}) and journeysTo(${t.id}, ${to.id}_green)`
          + ` and not inTrouble(${t.id}) ${q(this.say(t, t.draw.pick(t.kind.road), { to: to.name }))}.`]),
      // At the inn of an evening and a night; in the morning, making ready for the road.
      `  Observe ${t.id}_rest near ${t.id} of ${t.id} when not at(${t.id}, ${way}) and (hour(clock) >= 15 or hour(clock) < 6)`
        + ` ${q(this.say(t, t.draw.pick(t.kind.rest), {}))}.`,
      `  Observe ${t.id}_morning near ${t.id} of ${t.id} when not at(${t.id}, ${way}) and hour(clock) >= 6 and hour(clock) < 15`
        + ` ${q(this.say(t, t.kind.morning ?? t.kind.rest[0]!, {}))}.`,
      // What they leave behind them: the day they have gone by, the road shows which way.
      ...ends.map(([to, back], i) => `  Observe ${t.id}_tracks${i} at ${way} as sign when not at(${t.id}, ${way})`
        + ` and journeysTo(${t.id}, ${back.id}_green) and hour(clock) >= 15 ${q(this.say(t, t.kind.tracks, { to: to.name }))}.`)];
  }
  // Where they are going, the news of where they came from, and what is said of the company. Out on the road they
  // came from the end behind them this morning; resting at an end, from the end they go back to, the day before.
  private static talk(region: Region, t: Traveller): string[] {
    const q = JSON.stringify, ends: [Settlement, Settlement][] = [[t.road.to, t.road.from], [t.road.from, t.road.to]];
    const way = t.road.way, news = t.draw.pick(tables.news);
    return [...ends.flatMap(([to, from], i) => [
      `  Topic ${t.id}_going${i} with ${t.id} ${q(`Ask ${t.name} where ${this.they(t)} ${t.pronoun === 'they' ? 'are' : 'is'} going`)}`
        + ` when journeysTo(${t.id}, ${to.id}_green) { Says ${q(this.say(t, t.kind.going, { to: to.name }))}. }`,
      `  Topic ${t.id}_news${i} with ${t.id} ${q(`Ask ${t.name} for news of ${from.name}`)} when journeysTo(${t.id}, ${to.id}_green)`
        + ` and at(${t.id}, ${way}) { Says ${q(this.say(t, news, this.news(region, from, t.id)))}. }`,
      `  Topic ${t.id}_rested${i} with ${t.id} ${q(`Ask ${t.name} for news of ${to.name}`)} when journeysTo(${t.id}, ${to.id}_green)`
        + ` and not at(${t.id}, ${way}) { Says ${q(this.say(t, news.replace('this morning', 'yesterday'), this.news(region, to, t.id)))}. }`]),
    `  Topic ${t.id}_deeds with ${t.id} ${q(`Ask ${t.name} what people are saying`)} when renowned(party)`
      + `${this.raised(region) ? ` and not ${this.raised(region)}()` : ''} once { Says ${q(this.say(t, tables.deeds, {}))}. }`,
    ...this.heard(region, t), ...this.knows(region, t)];
  }
  // The deep site whose heart can be brought up, and the fact that it has been.
  private static raised(region: Region): string | undefined {
    const deep = region.sites.find(s => s.work?.deep), o = deep?.work && DeepPurposes.of(deep.work.art)?.objective;
    return deep && o?.goal && o.raised ? `${deep.id}_raised` : undefined;
  }
  // Once what a deep site's makers died for is up in the daylight, it is what everyone on the roads is saying.
  private static heard(region: Region, t: Traveller): string[] {
    const raised = this.raised(region), deep = region.sites.find(s => s.work?.deep);
    if (!raised || !deep?.work) { return []; }
    const item = DeepPurposes.of(deep.work.art)!.objective.item;
    const said = `'Word is,' says {Name}, 'somebody went down into ${deep.name} and brought ${item} up into the daylight. `
      + `I'd want to see it before I believed it. Strangers, they say.'`;
    return [`  Topic ${t.id}_heart with ${t.id} ${JSON.stringify(`Ask ${t.name} what people are saying`)} when ${raised}() once {`
      + ` Says ${JSON.stringify(this.say(t, said, {}))}. }`];
  }
  // A place off the road they know of, near one of its ends, and would tell a company that asked about the country.
  private static knows(region: Region, t: Traveller): string[] {
    const q = JSON.stringify, seat = RegionGeography.seats(region).find(x => !x.site.work?.great
      && [t.road.from.id, t.road.to.id].includes(x.town.id));
    if (!seat) { return []; }
    const named = `${seat.site.id}_named`, look = RegionSites.look(seat.site, region), called = RegionSites.seenAs(seat, region);
    // By its name, as the folk know it, and what it looks like: what they say teaches its name (NAR-12: a note had
    // named a toll-house nobody had named).
    const seen = called === look ? `${look} in ${RegionSites.where(seat, region)}` : called;
    const words = { seen: `${seat.site.name}, ${seen}`, near: seat.town.name };
    return [`  Topic ${t.id}_country with ${t.id} ${q(`Ask ${t.name} about the country off the road`)} when not knows(actor, ${named}) {`,
      `    Says ${q(this.say(t, t.draw.pick(tables.knows), words))}.`, `    On discuss { Assert knows(actor, ${named}). }`, '  }'];
  }
  private static news(region: Region, s: Settlement, teller: string): Record<string, string> {
    return RegionNews.of(region, s, teller);
  }
  // A trouble on the road: it comes on some mornings, and whoever helps is thanked; if nobody does, it is sorted out
  // by evening anyway.
  private static trouble(t: Traveller): string[] {
    const tr = t.kind.trouble, q = JSON.stringify;
    if (!tr) { return []; }
    const way = t.road.way, id = t.id;
    return [`  Rule ${id}_trouble when at(${id}, ${way}) and hour(clock) >= 10 and hour(clock) < 13 and dice(clock) <= 15`
      + ` and not inTrouble(${id}) and not helpedBy(${id}, party) and not staged(${way}, ?story) { Assert inTrouble(${id}). }`,
    `  Observe ${id}_troubled near ${id} of ${id} when at(${id}, ${way}) and inTrouble(${id}) ${q(this.say(t, tr.seen, {}))}.`,
    `  Action ${id}_help(actor: group, site: place) ${q(this.say(t, tr.act, {}))} {`,
    `    Description ${q(tr.about)}.`,
    `    Requires able(actor) and at(actor, site) and at(${id}, site) and inTrouble(${id}).`, '    Time 2.',
    `    On success { Retract inTrouble(${id}). Assert helpedBy(${id}, actor). Assert grateful(${id}, actor).`
      + ` Increase quantity(actor, gold) by ${tr.reward}. }`,
    `    Result ${q(this.say(t, tr.done, {}))}.`, '  }',
    `  Rule ${id}_sorted when inTrouble(${id}) and hour(clock) >= 17 { Retract inTrouble(${id}). }`];
  }
  private static they(t: Traveller): string { return Voice.pronouns[t.pronoun]?.they ?? 'they'; }
  private static say(t: Traveller, text: string, words: Record<string, string>): string {
    const filled = text.replace(/\{Name\}/g, t.name)
      .replace(/\{(to|from|life|gossip|seen|where|near)\}/g, (m, k: string) => words[k] ?? m);
    return Voice.render(filled, { pronoun: t.pronoun });
  }
}
