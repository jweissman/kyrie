import text from '../../../data/generation/deep/rooms.kyrt' with { type: 'text' };
import world from '../../../data/generation/scenes/orsino-world.json';
import table from '../../../data/generation/deep/hoards.json';
import { Canon } from '../../canon/canon';
import { ItemNames } from '../../item-names';
import { Draw } from '../land/draw';
import { RegionMarvels } from '../region-marvels';
import type { DeepContent, DeepDwellers } from './deep-pacing';
import type { DeepPurpose } from './deep-purposes';
import { Counted } from '../../presentation/counted';
import { KyrTemplates } from '../kyr-template';

interface Riddle { question: string; answer: string; kind: string }

// What one room of a deep site holds, as Kyr: whoever lives there (with their aspect, and fewer and stronger when
// they are an elite); the trap on the way in; a riddle casket, Orsino's riddle of the depth's difficulty, which opens
// to its right word and pays by its difficulty, and breathes cold on a wrong one; a wonder; what lies about; coin; and
// where a room is special, an earlier party's camp, with what their notebook says of what is below. The casket, the
// coin and the camp are the author's, in data/generation/deep/rooms.kyrt; this chooses and draws them.
export class DeepRooms {
  static readonly q = JSON.stringify;
  static readonly template = KyrTemplates.parse(text);
  private static section(group: string, values: Record<string, string>): string[] {
    return KyrTemplates.fill(this.template.sections.filter(t => t.group === group).flatMap(t => t.lines), values);
  }
  static readonly riddles = world.riddles as Record<string, Riddle[]>;
  static readonly answers = (world as unknown as { riddleAnswers: Record<string, string[]> }).riddleAnswers;
  // A wrong word's breath, by the riddle's difficulty.
  static readonly breath: Record<string, string> = { easy: '1d4', medium: '1d6', hard: '2d6', deadly: '4d6' };
  // What a right word pays: the treasure tier, by difficulty (Orsino's riddle loot).
  static readonly paid: Record<string, string> = { easy: 'minor', medium: 'minor', hard: 'major', deadly: 'grand' };
  static lines(c: DeepContent, at: { site: string; purpose: DeepPurpose; first?: string }): string[] {
    const r = c.room;
    return [...c.dwellers ? this.dwellers(c.dwellers, r.id) : [],
      ...c.dwellers ? this.device(r.id, c.dwellers.level, at.purpose) : [],
      ...c.trap ? RegionMarvels.snare({ id: c.room.id, way: c.trap.way.id, trap: c.trap.trap, under: !c.room.open })
        : [],
      ...c.riddle ? this.casket(r.id, { difficulty: c.riddle, purpose: at.purpose }) : [],
      ...c.wonder ? this.wonder(c.wonder, r.id) : [],
      ...(c.treasure?.items ?? []).map((kind, n) => `  Item ${r.id}_find${n} ${this.q(this.called(kind, at.purpose))} is ${kind} at ${r.id}.`),
      ...c.treasure?.coin && ['treasure', 'elite', 'special', 'mob'].includes(c.guide) ? this.coins(r.id, c.treasure.coin) : [],
      ...c.special ? this.camp(r.id, { level: r.level, purpose: at.purpose, first: at.first === r.id }) : [],
      ...c.special ? this.left(r.id) : []];
  }
  // A thing by its own name: the makers' own by the name the site gives it, a catalog item by the catalog's.
  static called(id: string, purpose?: DeepPurpose): string {
    const own = Object.values(purpose?.valuables ?? {}).flat().find(v => v.id === id);
    return own ? own.name : ItemNames.called(Canon.items[id]?.name ?? id.replace(/_/g, ' '));
  }
  private static dwellers(d: DeepDwellers, room: string): string[] {
    const q = this.q, g = d.group, label = d.aspect ? g.label.replace(/^the /, `the ${d.aspect} `) : g.label;
    const who = g.species ? `Species ${g.species}.` : `Ancestry ${g.ancestry}. Calling ${g.calling ?? 'warrior'}.`;
    return [`  Person ${d.id} ${q(label)} at ${room} { Role ${q(g.role)}. ${who} Numbers ${g.count}. Level ${d.level}.`
      + ` Temperament ${g.temperament}.${d.aspect && g.species ? ` Aspect ${d.aspect}.` : ''} Lair ${room}. }`];
  }
  // A device among the dwellers, as Orsino sets one in a fifth of its encounters, of the kind the place keeps (a tomb's
  // charge, a temple's ward): set where it stands, and never a creature (data/catalog/devices.json).
  private static device(room: string, level: number, purpose: DeepPurpose): string[] {
    const kinds = purpose.devices ?? [], draw = new Draw(`${room}:device`);
    if (!kinds.length || !draw.chance(0.2)) { return []; }
    const d = kinds[Math.floor(draw.next() * kinds.length)]!, q = this.q;
    return [`  Person ${room}_device ${q(d.label)} at ${room} { Role ${q(d.role)}. Device ${d.id}. Level ${level}.`
      + ` Temperament obedient. Lair ${room}. }`];
  }
  // A casket with a riddle on its lid and four words with a hollow beside each; the right one opens it.
  private static casket(room: string, at: { difficulty: string; purpose: DeepPurpose }): string[] {
    const difficulty = at.difficulty;
    const draw = new Draw(`${room}:riddle`), q = this.q, id = `${room}_casket`;
    const pool = (this.riddles[difficulty] ?? []).filter(r => (this.answers[r.kind]?.length ?? 0) >= 4);
    if (!pool.length) { return []; }
    const riddle = draw.pick(pool), wrong = draw.shuffle(this.answers[riddle.kind]!
      .filter(a => a.toLowerCase() !== riddle.answer.toLowerCase())).slice(0, 3);
    const tiers = (world as unknown as { dungeon: { treasure: Record<string, string[]> } }).dungeon.treasure;
    const tier = at.purpose.finds?.[this.paid[difficulty]!] ?? tiers[this.paid[difficulty]!] ?? [];
    const own = (at.purpose.valuables?.[this.paid[difficulty]!] ?? []).map(v => v.id);
    const reward = own.length && draw.next() < 0.6 ? draw.pick(own) : tier.length ? draw.pick(tier) : undefined;
    return [...this.section('casket', { id, room, breath: this.breath[difficulty]!, question: riddle.question,
      row: riddle.answer.length === 1 ? 'letters' : 'words' }),
    ...reward ? [`  Item ${id}_gift ${q(this.called(reward, at.purpose))} is ${reward} in ${id}.`] : [],
    ...draw.shuffle([riddle.answer, ...wrong]).flatMap((word, n) => this.section(word === riddle.answer ? 'right' : 'wrong',
      { id, room, word, n: String(n), unit: word.length === 1 ? 'letter' : 'word' }))];
  }
  private static wonder(key: string, room: string): string[] {
    const found = RegionMarvels.wonders.find(([k]) => k === key);
    return found ? RegionMarvels.wonder(found, room, `${room}_wonder`) : [];
  }
  // How the coin left in a room lies there, each room its own way (one purse rotted through in nearly every room
  // of one barrow: the play-structure investigation's PT-15): the author's, in data/generation/deep/hoards.json.
  static readonly hoards = table.hoards as [string, string][];
  private static coins(room: string, coin: number): string[] {
    const [lying, gathered] = new Draw(`${room}:coins`).pick(this.hoards);
    return this.section('coins', { id: `${room}_coins`, room, lying, gathered, coin: String(coin),
      count: String(Counted.words[coin] ?? coin) });
  }
  // What the earlier party left at their camp, of what a company carries against the worst (hoards.json#left).
  static readonly kept = table.left;
  private static left(room: string): string[] {
    const draw = new Draw(`${room}:left`), stocks = world.shops as unknown as Record<string, { stock: [string, number][] }>;
    const kinds = this.kept.flatMap((kind, n) => {
      const pool = stocks[kind]?.stock ?? [];
      return pool.length && (n === 0 || draw.next() < 0.5) ? [draw.pick(pool)[0]] : [];
    });
    return kinds.length ? [...this.section('pack', { room }),
      ...kinds.map((kind, n) => `  Item ${room}_left${n} ${this.q(this.called(kind))} is ${kind} in ${room}_pack.`)] : [];
  }
  private static camp(room: string, at: { level: number; purpose: DeepPurpose; first: boolean }): string[] {
    const camp = at.purpose.camp, journal = camp.journal[Math.min(at.level, camp.journal.length - 1)]!;
    return this.section('camp', { room, journal, scene: at.first ? camp.scene : camp.later ?? camp.scene });
  }
}
