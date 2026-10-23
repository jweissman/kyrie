import world from '../../../data/generation/scenes/orsino-world.json';
import { Canon } from '../../canon/canon';
import { ItemNames } from '../../item-names';
import { Draw } from '../land/draw';
import { RegionMarvels } from '../region-marvels';
import type { DeepContent, DeepDwellers } from './deep-pacing';
import type { DeepPurpose } from './deep-purposes';

interface Riddle { question: string; answer: string; kind: string }

// What one room of a deep site holds, as Kyr: whoever lives there (with their aspect, and fewer and stronger when
// they are an elite); the trap on the way in; a riddle casket, Orsino's riddle of the depth's difficulty, which opens
// to its right word and pays by its difficulty, and breathes cold on a wrong one; a wonder; what lies about; coin; and
// where a room is special, an earlier party's camp, with what their notebook says of what is below.
export class DeepRooms {
  static readonly q = JSON.stringify;
  static readonly riddles = world.riddles as Record<string, Riddle[]>;
  static readonly answers = (world as unknown as { riddleAnswers: Record<string, string[]> }).riddleAnswers;
  // A wrong word's breath, by the riddle's difficulty.
  static readonly breath: Record<string, string> = { easy: '1d4', medium: '1d6', hard: '2d6', deadly: '4d6' };
  // What a right word pays: the treasure tier, by difficulty (Orsino's riddle loot).
  static readonly paid: Record<string, string> = { easy: 'minor', medium: 'minor', hard: 'major', deadly: 'grand' };
  static lines(c: DeepContent, at: { site: string; purpose: DeepPurpose }): string[] {
    const r = c.room;
    return [...c.dwellers ? this.dwellers(c.dwellers, r.id) : [],
      ...c.trap ? RegionMarvels.snare({ id: c.room.id, way: c.trap.way.id, trap: c.trap.trap }) : [],
      ...c.riddle ? this.casket(r.id, { difficulty: c.riddle, purpose: at.purpose }) : [],
      ...c.wonder ? this.wonder(c.wonder, r.id) : [],
      ...(c.treasure?.items ?? []).map((kind, n) => `  Item ${r.id}_find${n} ${this.q(this.called(kind, at.purpose))} is ${kind} at ${r.id}.`),
      ...c.treasure?.coin && ['treasure', 'elite', 'special', 'mob'].includes(c.guide) ? this.coins(r.id, c.treasure.coin) : [],
      ...c.special ? this.camp(r.id, { level: r.level, purpose: at.purpose }) : []];
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
    return [`  Hazard ${id}_cold "the casket's breath" means "Deal (${this.breath[difficulty]}) cold damage to ally unless constitution save against (12).".`,
      `  Thing ${id} "the stone casket" at ${room} {`, '    Holds.',
      `    State sealed closed ${q(`A casket of grey stone stands against the wall, its lid one piece with it. Words are cut across the lid in the old script, and under them, scratched in a later hand: '${riddle.question}' Below is a row of ${riddle.answer.length === 1 ? 'letters' : 'words'}, each with a hollow beside it for a finger.`)}.`,
      '    State open "The casket\'s lid has turned on a pivot you could not see, and stands open.".', '  }',
      ...reward ? [`  Item ${id}_gift ${q(this.called(reward, at.purpose))} is ${reward} in ${id}.`] : [],
      ...draw.shuffle([riddle.answer, ...wrong]).flatMap((word, n) => this.word({ id, room, word, n },
        word === riddle.answer))];
  }
  private static word(at: { id: string; room: string; word: string; n: number }, right: boolean): string[] {
    const q = this.q, { id, room, word, n } = at;
    return [`  Action ${id}_word${n}(actor: group) ${q(`Press the ${word.length === 1 ? 'letter' : 'word'} “${word}” on the casket`)} {`,
      `    Requires able(actor) and at(actor, ${room}) and state(${id}, sealed) and not benighted(actor).`, '    Time 1.',
      right ? `    On success { Retract state(${id}, sealed). Assert state(${id}, open). }`
        : `    On success { Assert strikes(${id}_cold, actor). }`,
      `    Result ${q(right ? 'The word sinks under your finger, and something in the stone turns over; the lid swings up on its pivot.'
        : 'The word sinks and comes back up. The casket breathes out, once, cold as a well in winter, and stays shut.')}.`, '  }'];
  }
  private static wonder(key: string, room: string): string[] {
    const found = RegionMarvels.wonders.find(([k]) => k === key);
    return found ? RegionMarvels.wonder(found, room, `${room}_wonder`) : [];
  }
  private static coins(room: string, coin: number): string[] {
    const q = this.q, id = `${room}_coins`;
    return [`  Thing ${id} "scattered coins" at ${room} {`,
      '    State lying "Coins lie scattered in the dust, green with age, where a purse rotted through.".',
      '    State gathered "Nothing is left in the dust but the shape of a purse.".',
      '    Change gather "Gather up the coins" from lying to gathered.', '  }', `  Relation ${id}_counted().`,
      `  Rule ${id}_counted when state(${id}, gathered) and not ${id}_counted() says ${q(`${coin} coin, all told, most of it old and some of it good.`)} {`,
      `    Assert ${id}_counted(). Increase quantity(party, gold) by ${coin}. }`];
  }
  private static camp(room: string, at: { level: number; purpose: DeepPurpose }): string[] {
    const q = this.q, camp = at.purpose.camp, journal = camp.journal[Math.min(at.level, camp.journal.length - 1)]!;
    return [`  Observe ${room}_camp at ${room} when true ${q(camp.scene)}.`,
      `  Thing ${room}_notebook "a damp notebook" at ${room} {`,
      '    State shut "A notebook lies by the dead fire, swollen with damp, its cover held shut with a strap.".',
      `    State read ${q(journal)}.`, '    Change read "Unstrap the notebook and read it" from shut to read.', '  }',
      `  Item ${room}_rope "a coil of rope" is rope at ${room}.`, `  Item ${room}_torch "a torch" is torch at ${room}.`];
  }
}
