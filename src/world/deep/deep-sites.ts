import { Canon } from '../../canon/canon';
import { ItemNames } from '../../item-names';
import { DeepLayouts, type DeepLayout, type DeepLink } from './deep-layout';
import { DeepMechanisms } from './deep-mechanisms';
import { DeepPacing, type DeepContent } from './deep-pacing';
import { DeepRooms } from './deep-rooms';
import { DeepTime } from './deep-time';
import { DeepHistory } from './deep-history';
import { DeepArgument } from './deep-argument';
import { DeepRivals } from './deep-rivals';
import { DeepSounds } from './deep-sounds';
import type { DeepPurpose, Valuable } from './deep-purposes';
import type { Region, Site } from '../region-writer';

// A region's deep site, as Kyr: one of its first makers' works that goes down level after level, written from what
// it was for (its purpose: data/generation/deep) rather than from a plan's sections. Its levels and rooms where the
// layout put them, every way between them, the working parts that open and shut them, what each room holds by its
// place in its level's run, and at the bottom the keeper and what the makers died for. It is placed, named, told of
// and found as the makers' other works are (Histories, RegionSites); the rumours of it are its own.
export class DeepSites {
  static readonly q = JSON.stringify;
  static lines(region: Region, site: Site, at: { purpose: DeepPurpose; values: Record<string, string> }): string[] {
    const { purpose, values } = at, key = `${region.name}:${site.id}:deep`;
    const layout = DeepLayouts.make(purpose, site.id, key), content = DeepPacing.plan(purpose, layout, key);
    const handled = this.handled(layout);
    // What the kingdom after the makers did with it, and what its fall left there.
    const after = [...purpose.after?.[values.kingdomkind!] ?? [], ...purpose.fallen?.[values.fallen!] ?? []];
    return [`  Measure deepWater(place). Measure deepPumped(place).`, ...this.kinds(purpose, DeepHistory.kinds(after)),
      `  Place ${site.id}_site ${this.q(values.name!)} is site within ${values.land} at ${values.x}, ${values.y}.`,
      `  Observe ${site.id}_outside at ${site.id} when true ${this.q(purpose.outside.replaceAll('{oldup}', values.oldup!))}`
        + ` teaches ${site.id}_named.`,
      ...this.places(layout), ...this.ways(layout, handled),
      ...DeepMechanisms.lines(layout, { fate: values.fate!, oldup: values.oldup!,
        ...purpose.bane ? { bane: purpose.bane.cut, taught: `${site.id}_bane` } : {} }, purpose.mechanisms),
      ...content.flatMap(c => DeepRooms.lines(c, { site: site.id, purpose })),
      ...this.ore(purpose, layout), ...this.rest(purpose, layout, content), ...this.heard(layout, content),
      ...DeepTime.lines(purpose, layout, content, key), ...DeepHistory.lines(layout, after, values),
      ...this.keeper(purpose, layout),
      ...this.bane(purpose, layout), ...this.raised(purpose, layout, values), ...this.hooks(purpose, values),
      ...DeepArgument.lines(layout, values, purpose), ...DeepRivals.lines(region, site, { layout, purpose, values }),
      ...this.land(purpose, layout)];
  }
  // The levels and their rooms, each with how it looks; every room below the mouth is dark.
  private static places(layout: DeepLayout): string[] {
    const q = this.q, site = layout.site;
    return layout.levels.flatMap(level => [`  Place ${level.id} ${q(level.name)} is level within ${site}_site.`,
      ...level.rooms.flatMap(r => [`  Place ${r.id} ${q(r.name)} is room within ${level.id} at ${r.x}, ${r.y}.`,
        `  Observe ${r.id}_scene at ${r.id} when true ${q(r.scene)}.`,
        ...r.lit ? [] : [`  Initially Assert unlit(${r.id}).`]])]);
  }
  // The ways the mechanisms do not write themselves: the mouth, the galleries, the ladders, the ore pass.
  private static ways(layout: DeepLayout, handled: Set<string>): string[] {
    const q = this.q, mouth = layout.levels[0]!.rooms[0]!;
    return [`  Passage ${layout.site}_in "the way in" is tunnel between ${layout.site} and ${mouth.id} taking 2 minutes.`,
      ...layout.links.filter(l => !handled.has(l.id)).map(l => `  Passage ${l.id} ${q(l.name)} is ${l.kind} between ${l.a} and ${l.b}${l.oneWay ? ' one way' : ''} taking ${l.minutes} minutes${l.needs ? ` needing ${l.needs.join(' or ')}` : ''}.`)];
  }
  private static handled(layout: DeepLayout): Set<string> {
    const flooded = new Set(layout.levels.filter(l => l.flooded).flatMap(l => l.rooms.map(r => r.id)));
    const vent = DeepMechanisms.room(layout, 'vent');
    return new Set(layout.links.filter((l: DeepLink) => l.mechanism || (!l.between && flooded.has(l.a))
      || (vent && l.b === vent.id && !l.between)).map(l => l.id));
  }
  // Where a company can rest (a hall, a store-room, an old camp), and what may find it there: the savage and the
  // territorial of a level go about it, and now and then one comes to wherever the company is on their level, the
  // longer it stays the likelier.
  private static rest(purpose: DeepPurpose, layout: DeepLayout, content: DeepContent[]): string[] {
    const rooms = layout.levels.flatMap(l => l.rooms);
    const restful = rooms.filter(r => purpose.rest?.includes(r.role) || content.some(c => c.room === r && c.special));
    const lines = ['  Relation deepLevelOf(place, place).', ...rooms.map(r => `  Initially Assert deepLevelOf(${r.id}, ${layout.levels[r.level]!.id}).`),
      ...restful.map(r => `  Initially Assert restful(${r.id}).`)];
    for (const c of content.filter(x => x.dwellers && !x.dwellers.elite && ['savage', 'territorial'].includes(x.dwellers.group.temperament))) {
      const id = c.dwellers!.id, level = layout.levels[c.room.level]!.id;
      lines.push(`  Rule ${id}_wanders when able(${id}) and at(${id}, ?o) and at(party, ?p) and deepLevelOf(?p, ${level}) and deepLevelOf(?o, ${level}) and distinct(?o, ?p) and dice(${id}) <= 1 says ${this.q(`Something is coming along the gallery toward you: ${c.dwellers!.group.label}.`)} {`,
        `    Retract at(${id}, ?o). Assert at(${id}, ?p). }`);
    }
    return lines;
  }
  // The land round it, while what keeps its bottom is there and after: told outside, and what each skill reads in it.
  private static land(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const land = purpose.land, site = layout.site, keeper = `${site}_keeper`, q = this.q;
    if (!land) { return []; }
    return [`  Observe ${site}_blight at ${site} as sign when able(${keeper}) ${q(land.blight)}.`,
      ...Object.entries(land.signs).map(([skill, text]) => `  Observe ${site}_${skill}_sign at ${site} as sign`
        + ` noticed by ${skill} when able(${keeper}) ${q(text)}.`),
      `  Observe ${site}_healed at ${site} as sign when not able(${keeper}) ${q(land.healed)}.`];
  }
  // Who can be heard from the next room before they are met (see DeepSounds).
  private static heard(layout: DeepLayout, content: DeepContent[]): string[] {
    return content.filter(c => c.dwellers).flatMap(c => DeepSounds.lines(layout, { id: c.dwellers!.id, room: c.room.id,
      temperament: c.dwellers!.group.temperament, ...c.dwellers!.elite ? { elite: true } : {} }));
  }
  // What the site was worked for, where it was left: lumps of ore in the stopes and the tubs.
  private static ore(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const ore = purpose.ore;
    if (!ore) { return []; }
    return layout.levels.flatMap(l => l.rooms).flatMap(r => Array.from({ length: ore.roles[r.role] ?? 0 },
      (_, n) => `  Item ${r.id}_ore${n} ${this.q(ore.name)} is ${ore.kind} at ${r.id}.`));
  }
  // At the bottom: whatever the makers broke into, and what they died for, which it keeps.
  // It shrinks back into its refuge from what it fears, and keeps the heart while it is there.
  private static keeper(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const bottom = layout.levels.at(-1)!.rooms, heart = bottom.find(r => r.role === 'heart') ?? bottom.at(-1)!;
    const q = this.q, k = purpose.keeper, id = `${layout.site}_keeper`, words = Object.entries(k.words ?? {})
      .map(([w, text]) => ` ${w} ${q(text)}.`).join('');
    const refuge = bottom.find(r => r.role === k.refuge);
    const shrinks = refuge && k.fears ? ` Refuge ${refuge.id}. Fears ${k.fears}.` : '';
    return [`  Person ${id} ${q(k.label)} at ${heart.id} { Role ${q(k.role)}. Species ${k.species}. Level ${k.level}.`
      + ` Temperament ${k.temperament}. Lair ${heart.id}.${shrinks}${words} }`,
      `  Item ${layout.site}_heart ${q(purpose.objective.item)} is ${purpose.objective.kind} at ${heart.id}.`];
  }
  // Where the makers left what the keeper cannot bear, and what reading their words tells of it.
  private static bane(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const b = purpose.bane, room = b && layout.levels.flatMap(l => l.rooms).find(r => r.role === b.role);
    if (!b || !room) { return []; }
    const q = this.q, id = `${layout.site}_bane`;
    const name = b.like?.name ?? DeepRooms.called(b.item);
    return [`  Entity ${id}: fact ${q(b.fact)}.`, `  Item ${id}_item ${q(name)} is ${b.item} at ${room.id}.`,
      `  Observe ${id}_seen at ${room.id} when at(${id}_item, ${room.id}) ${q(b.seen)}.`];
  }
  // Bringing up what they died for: to be done once its story is known, and told when it is done, which is when it
  // is first in daylight (come out by night, at first light, wherever the company then is).
  private static raised(purpose: DeepPurpose, layout: DeepLayout, values: Record<string, string>): string[] {
    const o = purpose.objective, site = layout.site, q = this.q;
    if (!o.goal || !o.raised) { return []; }
    const [goal, raised] = [o.goal, o.raised].map(t => t.replaceAll('{name}', values.name!));
    return [`  Entity ${site}_story: fact ${q(o.text)}.`, `  Relation ${site}_raised().`,
      `  Objective ${site}_bring when knows(party, ${site}_story) and not ${site}_raised() ${q(goal)}.`,
      `  Rule ${site}_brought when at(party, ?p) and not unlit(?p) and not dark() and ownedItem(${site}_heart, ?m)`
        + ` and memberOf(?m, party) and not ${site}_raised() says ${q(raised)} { Assert ${site}_raised(). }`];
  }
  // Who tells of it: the innkeeper and the merchant of the settlement nearest it, each in their own words, and the
  // merchant pays well for its ore.
  private static hooks(purpose: DeepPurpose, values: Record<string, string>): string[] {
    const q = this.q, w = values.w!, trade = purpose.hook.trade, ore = purpose.ore;
    const [first, second] = purpose.rumours.map(t => t.replaceAll('{name}', values.name!));
    return [`  Topic ${w}_rumour with ${values.keeper} ${q(`Ask {${values.keeper}} about ${purpose.hook.topic}`)} when not knows(actor, ${w}_named) once {`,
      `    Says ${q(`${first} {${values.keeper}} wipes the counter. 'It is out in ${values.where}. Go in daylight, and take more light than you think.'`)}.`,
      `    On discuss { Assert knows(actor, ${w}_named). Assert knows(actor, ${w}_found). }`, '  }',
      ...second && trade ? [`  Topic ${w}_rumour2 with ${values.merchant} ${q(`Ask {${values.merchant}} ${trade.topic}`)} when true once {`,
        `    Says ${q(`${second} {${values.merchant}} ${trade.says}`)}.`,
        ...purpose.objective.goal ? [`    On discuss { Assert knows(actor, ${values.w}_story). }`] : [], '  }'] : [],
      ...ore ? [`  Initially Set pays(${values.merchant}, ${ore.kind}) to ${ore.worth}.`] : [],
      ...this.home(purpose, values)];
  }
  // When it is brought home: the innkeeper who told of it hears what the company brought up, and keeps it a night.
  private static home(purpose: DeepPurpose, values: Record<string, string>): string[] {
    const q = this.q, w = values.w!, k = values.keeper!, home = purpose.hook.home;
    if (!home || !purpose.objective.goal) { return []; }
    return [`  Topic ${w}_home with ${k} ${q(`Tell {${k}} what you brought up out of ${values.name}`)} when ${w}_raised() once {`,
      `    Says ${q(home.replaceAll('{keeper}', `{${k}}`).replaceAll('{name}', values.name!))}.`,
      `    On discuss { Assert guest(${k}, actor). }`, '  }'];
  }
  // What a deep site holds that no catalog does: its ore, and what the makers died for.
  private static kinds(purpose: DeepPurpose, left: Valuable[]): string[] {
    const q = this.q;
    const ore = purpose.ore, o = purpose.objective, b = purpose.bane;
    return [...ore ? [`  Kind ${ore.kind} ${q(ore.name)} is treasure worth ${ore.worth} weighing ${ore.weight} described ${q(ore.text)}.`] : [],
      ...b?.like ? [`  Kind ${b.item} ${q(b.like.name)} like ${b.like.base} described ${q(b.like.text)}`
        + `${b.like.grants ? ` granting ${b.like.grants}` : ''}.`] : [],
      `  Kind ${o.kind} ${q(o.item)} is treasure worth ${o.worth ?? 2000} weighing ${o.weight ?? 30} described ${q(o.text)}.`,
      ...[...Object.values(purpose.valuables ?? {}).flat(), ...left].map(v =>
        `  Kind ${v.id} ${q(v.name)} is treasure worth ${v.worth} weighing ${v.weight} described ${q(v.text)}.`)];
  }
  // A catalog item by its own name: "a lantern".
  static called(id: string): string { return ItemNames.called(Canon.items[id]?.name ?? id.replace(/_/g, ' ')); }
}
