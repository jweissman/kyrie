import { Harm } from '../rules/harm';
import { Canon } from '../canon/canon';
import { parseAbility, type Effect } from '../lang/parse';
import { Draw } from './land/draw';
import { RegionGeography } from './region-geography';
import { RegionZones } from './region-zones';
import type { Region, Site } from './region-writer';
import world from '../../data/generation/scenes/orsino-world.json';
import met from '../../data/generation/scenes/wonders.json';
import snares from '../../data/generation/scenes/snares.json';

interface Piece { name: string; text: string; effect?: string; omits?: Record<string, string>; source: string }
export interface Trap extends Piece { mechanism: string; sign: string }
// How a wonder stands in a country (data/generation/scenes/wonders.json): where, what it is called, how it is met,
// how it looks before anyone meets it, what it does to whoever does, and how it is after.
interface Met { where: 'wild' | 'within'; name: string; verb: string; seen: string; taken: string; after: string }
export type Wonder = [string, Piece & Met];
// How a mechanism is understood and dealt with (data/generation/scenes/snares.json).
interface Snare { sign: string; seen: string; ways: { id: string; label: string; needing: string; to: string }[] }

// Orsino's wonders and traps in a generated country (data/generation/scenes/orsino-world.json): a wonder or two deep
// in its wild country, and within some of the makers' works, past their inner ways, things that do what Orsino says
// they do to whoever meets them, once; and on a work's inner way, a mechanism that goes off on whoever crosses it
// unless they see it and deal with it first. Only those whose effect Kyr can run are drawn.
export class RegionMarvels {
  static readonly wonders: Wonder[] = Object.entries((world as unknown as { wonders: Record<string, Piece> }).wonders)
    .filter(([key, w]) => w.effect && (met.wonders as Record<string, Met>)[key])
    .map(([key, w]) => [key, { ...w, ...(met.wonders as Record<string, Met>)[key]! }]);
  // No trap in a work does more harm than a fall down a short stair would: three dice of six at the most. Deeper in
  // a deep site, worse ones are set (see within).
  static readonly traps = RegionMarvels.within(10.5);
  // The traps that do no more harm than so much on an average roll.
  static within(cap: number): [string, Trap][] {
    return Object.entries((world as unknown as { traps: Record<string, Trap> }).traps)
      .filter(([, t]) => t.effect && RegionMarvels.harm(t.effect) <= cap);
  }
  // The inner way of each plan a trap is set on, and past which a wonder may be.
  static readonly inner: Record<string, string> = { barrow: 'far', cistern: 'down', galleries: 'iron',
    abbey: 'cellar_stair', keep: 'cellar_door', singing_hall: 'through', tollhouse: 'strong_door', watchtower: 'spiral' };
  // The wild country's wonders: one in each of up to two of its parts, at the heart or the deep of it.
  static lines(region: Region): string[] {
    const atlas = RegionGeography.atlas(region);
    const deep = atlas.zones.map(z => RegionZones.landmarks(region, z).find(l => /_(heart|deep)$/.test(l.id)))
      .filter(l => l !== undefined);
    const wild = new Draw(`${region.name}:wonders`).shuffle(this.wonders.filter(([, w]) => w.where === 'wild'));
    return wild.slice(0, Math.min(2, deep.length)).flatMap((w, i) => this.wonder(w, deep[i]!.id));
  }
  // What is in a work past its inner way: a trap on the way, more often than not; and in half the works that have
  // one, a wonder in the room beyond it, no two works of a country the same.
  static work(region: Region, site: Site, plan: string, written: string[]): string[] {
    const suffix = this.inner[plan], way = `${site.id}_${suffix}`;
    const line = suffix && written.find(l => l.includes(`Passage ${way} `));
    if (!line) { return []; }
    const draw = new Draw(`${region.name}:${site.id}:within`), beyond = /between \S+ and (\w+)/.exec(line)?.[1];
    const works = region.sites.filter(s => s.work).map(s => s.id), at = works.indexOf(site.id);
    const within = new Draw(`${region.name}:within`).shuffle(this.wonders.filter(([, w]) => w.where === 'within'));
    const wonder = beyond && draw.chance(0.5) ? within[at % within.length] : undefined;
    return [...this.trap(region, site, way), ...wonder ? this.wonder(wonder, beyond!) : []];
  }
  static wonder([key, w]: Wonder, room: string, prefix = 'wonder'): string[] {
    const q = JSON.stringify, id = `${prefix}_${key}`, power = this.runs(w.effect!);
    // How it looks is told with the place, until it is met: a wonder is the first thing anyone would see there. One
    // whose power the game cannot yet bring about (Orsino's arcane symbols, whose focus also gives spell slots) is
    // met, and does nothing, rather than fail when it is touched.
    return [...power ? [`  Hazard ${id}_power ${q(this.upper(w.name))} means ${q(w.effect!)}.`] : [],
      `  Thing ${id} ${q(w.name)} at ${room} is scenery {`,
      `    State unwoken ${q(w.seen)}.`,
      `    State woken ${q(w.after)}.`,
      `    Change meet ${q(`${w.verb} ${w.name}`)} from unwoken to woken.`, '  }',
      `  Observe ${id}_seen at ${room} when state(${id}, unwoken) ${q(w.seen)}.`,
      ...power ? [`  Relation ${id}_given().`,
        `  Rule ${id}_answers when state(${id}, woken) and not ${id}_given() says ${q(w.taken)} {`,
        `    Assert strikes(${id}_power, party). Assert ${id}_given(). }`] : []];
  }
  // Whether every condition an effect applies is one the game runs.
  static runs(effect: string): boolean {
    return parseAbility('wonder', 'wonder', effect).effects.flatMap(e => this.applied(e))
      .every(id => { const c = Canon.conditions[Canon.resolve('conditions', id)]; return !!c && !c.unsupported; });
  }
  private static applied(e: Effect): string[] {
    return e.kind === 'apply' ? [e.status] : e.kind === 'random' || e.kind === 'cycle' ? e.effects.flatMap(x => this.applied(x)) : [];
  }
  // A trap on a work's inner way: the mechanism, as anyone can see it; what looking closely at it shows, and the
  // ways of dealing with it that knowing that opens; what it does when it goes off; and the way after.
  private static trap(region: Region, site: Site, way: string): string[] {
    const draw = new Draw(`${region.name}:${site.id}:trap`);
    if (!draw.chance(0.6)) { return []; }
    return this.snare({ id: site.id, way, trap: draw.pick(this.traps)[1] });
  }
  // A mechanism on a way, as a thing with its sign, what looking closely shows, the ways of dealing with it, what it
  // does when it goes off, and the way after; its ids begin with id (id_snare, id_trap).
  static snare(at: { id: string; way: string; trap: Trap }): string[] {
    const q = JSON.stringify, { way, trap: t } = at, site = { id: at.id }, id = `${at.id}_snare`;
    const how = (snares.mechanisms as Record<string, Snare>)[t.mechanism]!;
    return [`  Hazard ${site.id}_trap ${q(`the ${t.mechanism}`)} means ${q(t.effect!)}.`,
      `  Discovery ${id}_known ${q(how.seen)}.`,
      `  Thing ${id} ${q(`the ${t.mechanism}`)} on ${way} {`,
      `    State primed dangerous ${q(how.sign)}.`,
      `    State sprung ${q(`The ${t.mechanism} has gone off, and is spent.`)}.`,
      `    State made_safe ${q(`The ${t.mechanism} is made safe. Whoever goes by now goes by unharmed.`)}.`,
      ...how.ways.map(w => `    Change ${w.id} ${q(w.label)} from primed to ${w.to} needing ${w.needing} after learning ${id}_known.`),
      `    Hurts with ${site.id}_trap when primed then sprung.`, '  }',
      `  Event ${id}_goes beside ${way} when state(${id}, sprung) ${q(`${t.text}.`)}.`,
      `  Observe ${id}_read beside ${way} of ${id} when tried(${id}, looking) and state(${id}, primed) ${q(how.seen)} teaches ${id}_known.`];
  }
  // The harm an effect does on an average roll (see Harm).
  static harm(effect: string): number { return Harm.average(effect); }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
