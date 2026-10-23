import { Canon } from '../../canon/canon';
import { ItemNames } from '../../item-names';
import { DeepLayouts, type DeepLayout, type DeepLink } from './deep-layout';
import { DeepMechanisms } from './deep-mechanisms';
import { DeepPacing, type DeepContent } from './deep-pacing';
import { DeepRooms } from './deep-rooms';
import type { DeepPurpose } from './deep-purposes';
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
    return [`  Measure deepWater(place).`, ...this.kinds(purpose),
      `  Place ${site.id}_site ${this.q(values.name!)} is site within ${values.land} at ${values.x}, ${values.y}.`,
      `  Observe ${site.id}_outside at ${site.id} when true ${this.q(purpose.outside.replaceAll('{oldup}', values.oldup!))}`
        + ` teaches ${site.id}_named.`,
      ...this.places(layout), ...this.ways(layout, handled),
      ...DeepMechanisms.lines(layout, { fate: values.fate!, oldup: values.oldup! }),
      ...content.flatMap(c => DeepRooms.lines(c, { site: site.id, purpose })),
      ...this.ore(purpose, layout), ...this.rest(purpose, layout, content), ...this.keeper(purpose, layout),
      ...this.hooks(purpose, values)];
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
      lines.push(`  Rule ${id}_wanders when able(${id}) and at(${id}, ?o) and at(party, ?p) and deepLevelOf(?p, ${level}) and deepLevelOf(?o, ${level}) and distinct(?o, ?p) and dice(${id}) <= 1 says ${this.q(`Something is coming along the gallery toward your light: ${c.dwellers!.group.label}.`)} {`,
        `    Retract at(${id}, ?o). Assert at(${id}, ?p). }`);
    }
    return lines;
  }
  // What the site was worked for, where it was left: lumps of ore in the stopes and the tubs.
  private static ore(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const ore = purpose.ore;
    if (!ore) { return []; }
    return layout.levels.flatMap(l => l.rooms).flatMap(r => Array.from({ length: ore.roles[r.role] ?? 0 },
      (_, n) => `  Item ${r.id}_ore${n} ${this.q(ore.name)} is ${ore.kind} at ${r.id}.`));
  }
  // At the bottom: whatever the makers broke into, and what they died for, which it keeps.
  private static keeper(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const heart = layout.levels.at(-1)!.rooms.find(r => r.role === 'heart') ?? layout.levels.at(-1)!.rooms.at(-1)!;
    const q = this.q, k = purpose.keeper, id = `${layout.site}_keeper`, words = Object.entries(k.words ?? {})
      .map(([w, text]) => ` ${w} ${q(text)}.`).join('');
    return [`  Person ${id} ${q(k.label)} at ${heart.id} { Role ${q(k.role)}. Species ${k.species}. Level ${k.level}. Temperament ${k.temperament}. Lair ${heart.id}.${words} }`,
      `  Item ${layout.site}_heart ${q(purpose.objective.item)} is ${purpose.objective.kind} at ${heart.id}.`];
  }
  // Who tells of it: the innkeeper and the merchant of the settlement nearest it, each in their own words, and the
  // merchant pays well for its ore.
  private static hooks(purpose: DeepPurpose, values: Record<string, string>): string[] {
    const q = this.q, w = values.w!;
    const [first, second] = purpose.rumours.map(t => t.replaceAll('{name}', values.name!));
    return [`  Topic ${w}_rumour with ${values.keeper} ${q(`Ask {${values.keeper}} about the old workings`)} when not knows(actor, ${w}_named) once {`,
      `    Says ${q(`${first} {${values.keeper}} wipes the counter. 'It is out in ${values.where}. Go in daylight, and take more light than you think.'`)}.`,
      `    On discuss { Assert knows(actor, ${w}_named). Assert knows(actor, ${w}_found). }`, '  }',
      ...second ? [`  Topic ${w}_rumour2 with ${values.merchant} ${q(`Ask {${values.merchant}} what the old workings are worth`)} when true once {`,
        `    Says ${q(`${second} {${values.merchant}} turns a lump of something pale in his fingers. 'Bring me star-iron and I will pay for it. Thirty coin a lump, and no questions.'`)}.`, '  }'] : [],
      `  Initially Set pays(${values.merchant}, star_iron) to 30.`];
  }
  // What a deep site holds that no catalog does: its ore, and what the makers died for.
  private static kinds(purpose: DeepPurpose): string[] {
    const q = this.q;
    return [`  Kind star_iron "a lump of star-iron" is treasure worth 30 weighing 2 described "Pale ore, heavier than it looks, that glitters faintly in the dark.".`,
      `  Kind ${purpose.objective.kind} ${q(purpose.objective.item)} is treasure worth 2000 weighing 20 described ${q(purpose.objective.text)}.`];
  }
  // A catalog item by its own name: "a lantern".
  static called(id: string): string { return ItemNames.called(Canon.items[id]?.name ?? id.replace(/_/g, ' ')); }
}
