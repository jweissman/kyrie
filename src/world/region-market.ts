import { Draw } from './land/draw';
import { Foundings } from './founding';
import { Communities } from './community/community';
import { CommunityWriter } from './community/community-writer';
import { RegionShops } from './region-shops';
import type { Region, Settlement } from './region-writer';
import { Canon } from '../canon/canon';
import folk from '../../data/generation/scenes/folk.json';
import text from '../../data/generation/town/teachers.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';

interface Teacher { kind: 'arms' | 'arcane'; name: string; pronoun: string; draw: Draw }

// What a company comes back to a town for besides selling what it found (REV-04, the owner's note of 31 October:
// "the full adventuring loop should be exploration, achievement, and adding new verbs and capabilities"). Every town
// has a drill-yard where a master-at-arms teaches three fighting techniques, each for coin and the proof of what the
// student has done (see train_member); a market town has a scrivener's, and behind its curtain, opened only to whoever
// asks after the older books, someone who teaches three spells to those who cast spells of their kind.
export class RegionMarket {
  // Who teaches in a town, where, and what is said of it: the author's, in data/generation/town/teachers.kyrt.
  static readonly template = KyrTemplates.parse(text);
  private static section(group: string, values: Record<string, string>): string[] {
    return KyrTemplates.fill(this.template.sections.filter(t => t.group === group).flatMap(t => t.lines), values);
  }
  static readonly techniques = ['cleave', 'riposte', 'shield_bash', 'second_wind', 'dodge', 'rapid_strike',
    'dirty_trick', 'reckless_attack', 'roundhouse', 'whirlwind', 'taunt', 'feint', 'guard', 'dig_in'];
  // The fine makes a master-at-arms has from the yard's smith to sell (see Canon.fine).
  static readonly blades = ['fine_longsword', 'fine_battleaxe', 'fine_shortsword', 'fine_spear', 'fine_scimitar',
    'fine_handaxe', 'fine_shortbow', 'fine_longbow', 'fine_morningstar', 'fine_greatsword', 'fine_dagger', 'fine_halberd'];
  static readonly spells = ['magic_missile', 'armor', 'blur', 'charm', 'firebolt', 'hex', 'spark', 'thunderclap',
    'ward', 'shrieking_missile', 'conjure_light', 'drench', 'acid_arrow'];
  static lines(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    if (s.size !== 'town') { return []; }
    const market = Foundings.of(region, i).kind === 'market';
    return [...this.yard(region, s), ...market ? this.scrivener(region, s) : []];
  }
  // The town the company begins in has both, whatever its size: the first place it comes back to with what it won
  // (the owner, 2 November: the town's economy with deep sinks, training, better weapons, new verbs).
  static home(region: Region, s: Settlement): string[] {
    const i = region.settlements.indexOf(s), market = Foundings.of(region, i).kind === 'market';
    return [...s.size === 'town' ? [] : this.yard(region, s), ...s.size === 'town' && market ? [] : this.scrivener(region, s)];
  }
  // Everyone who teaches, or would teach, in the country, by name, so that no one else is given theirs: any settlement
  // may be the one the company begins in, which keeps a yard and a scrivener whatever its size (seed wren's Dagny,
  // who taught spells there and carried messages on its road).
  static keepers(region: Region): string[] {
    return region.settlements.flatMap(s => [this.teacher(region, s, 'arms').name, this.teacher(region, s, 'arcane').name]);
  }
  private static teacher(region: Region, s: Settlement, kind: Teacher['kind']): Teacher {
    const draw = new Draw(`${region.name}:${s.id}:teacher:${kind}`), ancestry = s.folk ?? region.ancestry;
    const pronoun = draw.pick(['she', 'he']), given = folk.given as unknown as Record<string, Record<string, string[]>>;
    const names = (given[ancestry] ?? given.human!)[pronoun] ?? given.human!.she!;
    const taken = new Set([...Communities.everyone(region), ...RegionShops.keepers(region)]);
    return { kind, name: Communities.distinct(names, ancestry, { draw, taken, reserved: region.reserved }), pronoun,
      draw };
  }
  private static yard(region: Region, s: Settlement): string[] {
    const t = this.teacher(region, s, 'arms'), who = `${s.id}_drill_master`;
    const taught = t.draw.shuffle(this.techniques).slice(0, 3), fee = 20 + Math.floor(t.draw.next() * 4) * 5;
    const likeness = CommunityWriter.likenessOf(region, { pronoun: t.pronoun, painting: 'fencing-master', id: who });
    const blades = t.draw.shuffle(this.blades).slice(0, 3);
    const sells = blades.map(b => ` Sells ${b} for ${Canon.items[b]?.value ?? 40} coin from 1.`).join('');
    const rack = blades.map(b => `a ${Canon.items[b]?.name ?? b}`);
    const at = { s: s.id, inn: s.inn, folk: s.folk ?? region.ancestry, name: t.name, pronoun: t.pronoun,
      fee: String(fee), likeness, sells, sold: this.listed(rack), lessons: this.lessons(taught) };
    return [...this.section('yard', at), ...taught.map(a => `  Initially Assert teaches(${who}, ${a}).`),
      ...this.section('yardafter', at)];
  }
  // What a teacher teaches, by name: "Cleave, Sweeping Strike and Taunt".
  private static lessons(taught: string[]): string {
    return this.listed(taught.map(a => Canon.abilities[a]?.name ?? a.replaceAll('_', ' ')));
  }
  private static listed(names: string[]): string { return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`; }
  // The scrivener's, and the curtain at the back of it: shut, and saying so, until the company asks after the older
  // books; behind it someone who teaches arcane spells, found, not posted.
  private static scrivener(region: Region, s: Settlement): string[] {
    const t = this.teacher(region, s, 'arcane'), who = `${s.id}_scriv_reader`;
    const taught = t.draw.shuffle(this.spells).slice(0, 3), fee = 45 + Math.floor(t.draw.next() * 4) * 5;
    const likeness = CommunityWriter.likenessOf(region, { pronoun: t.pronoun, painting: 'esotericist', id: who });
    const at = { s: s.id, town: s.name, folk: s.folk ?? region.ancestry, name: t.name, pronoun: t.pronoun,
      fee: String(fee), likeness, lessons: this.lessons(taught) };
    return [...this.section('scrivener', at), ...taught.map(a => `  Initially Assert teaches(${who}, ${a}).`),
      ...this.section('scrivenerafter', at)];
  }
}
