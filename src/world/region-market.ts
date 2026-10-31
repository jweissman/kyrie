import { Draw } from './land/draw';
import { Foundings } from './founding';
import { Communities } from './community/community';
import { CommunityWriter } from './community/community-writer';
import { RegionShops } from './region-shops';
import type { Region, Settlement } from './region-writer';
import { Canon } from '../canon/canon';
import folk from '../../data/generation/scenes/folk.json';

interface Teacher { kind: 'arms' | 'arcane'; name: string; pronoun: string; draw: Draw }

// What a company comes back to a town for besides selling what it found (REV-04, the owner's note of 31 October:
// "the full adventuring loop should be exploration, achievement, and adding new verbs and capabilities"). Every town
// has a drill-yard where a master-at-arms teaches three fighting techniques, each for coin and the proof of what the
// student has done (see train_member); a market town has a scrivener's, and behind its curtain, opened only to whoever
// asks after the older books, someone who teaches three spells to those who cast spells of their kind.
export class RegionMarket {
  static readonly techniques = ['cleave', 'riposte', 'shield_bash', 'second_wind', 'dodge', 'rapid_strike',
    'dirty_trick', 'reckless_attack', 'roundhouse', 'whirlwind', 'taunt', 'feint', 'guard', 'dig_in'];
  static readonly spells = ['magic_missile', 'armor', 'blur', 'charm', 'firebolt', 'hex', 'spark', 'thunderclap',
    'ward', 'shrieking_missile', 'conjure_light', 'drench', 'acid_arrow'];
  static lines(region: Region, i: number): string[] {
    const s = region.settlements[i]!;
    if (s.size !== 'town') { return []; }
    const market = Foundings.of(region, i).kind === 'market';
    return [...this.yard(region, s), ...market ? this.scrivener(region, s) : []];
  }
  // Everyone who teaches in the country, by name, so that no one else is given theirs.
  static keepers(region: Region): string[] {
    return region.settlements.flatMap((s, i) => s.size !== 'town' ? []
      : [this.teacher(region, s, 'arms').name,
        ...Foundings.of(region, i).kind === 'market' ? [this.teacher(region, s, 'arcane').name] : []]);
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
    const q = JSON.stringify, t = this.teacher(region, s, 'arms'), id = `${s.id}_drill`, who = `${id}_master`;
    const taught = t.draw.shuffle(this.techniques).slice(0, 3), fee = 20 + Math.floor(t.draw.next() * 4) * 5;
    const likeness = CommunityWriter.likenessOf(region, { pronoun: t.pronoun, painting: 'fencing-master', id: who });
    return [`  Place ${id} ${q(`the drill-yard behind ${s.inn}`)} is room within ${s.id} outdoors.`,
      `  Passage ${id}_gate ${q('the yard gate')} is door between ${id} and ${s.id}_green.`,
      `  Person ${who} ${q(t.name)} at ${id} { Role ${q(`a master-at-arms, who teaches for ${fee} coin a lesson`)}.`
        + ` Ancestry ${s.folk ?? region.ancestry}.${likeness} Peaceable. Pronouns ${t.pronoun}. Manner stoic. }`,
      ...taught.map(a => `  Initially Assert teaches(${who}, ${a}).`),
      `  Initially Set lessonFee(${who}) to ${fee}.`,
      `  Observe ${id}_scene at ${id} as fixture when true ${q(`A square of beaten earth behind ${s.inn}, a rack of `
        + 'blunted blades along one wall and a post hacked pale at the height of a man\'s neck. Whoever teaches here '
        + 'will show a technique to anyone who has done enough to be worth the showing, and can pay for it.')}.`,
      `  Observe ${id}_lessons at ${id} as ambience when true ${q(this.offer(t.name, taught, [fee, 'one']))}.`];
  }
  // What a teacher teaches, said where they teach it: the lessons by name, the fee, and what a lesson asks.
  private static offer(name: string, taught: string[], [fee, to]: [number, string]): string {
    const names = taught.map(a => Canon.abilities[a]?.name ?? a.replaceAll('_', ' '));
    return `${name} teaches ${names.slice(0, -1).join(', ')} and ${names.at(-1)}, ${fee} coin a lesson: an hour's `
      + `work, and only to ${to} who has done enough out in the world to have earned it.`;
  }
  // The scrivener's, and the curtain at the back of it: shut, and saying so, until the company asks after the older
  // books; behind it someone who teaches arcane spells, found, not posted.
  private static scrivener(region: Region, s: Settlement): string[] {
    const q = JSON.stringify, t = this.teacher(region, s, 'arcane'), id = `${s.id}_scriv`, who = `${id}_reader`;
    const clerk = `${id}_clerk`, back = `${id}_back`, known = `${id}_curtain`;
    const taught = t.draw.shuffle(this.spells).slice(0, 3), fee = 45 + Math.floor(t.draw.next() * 4) * 5;
    const likeness = CommunityWriter.likenessOf(region, { pronoun: t.pronoun, painting: 'esotericist', id: who });
    return [`  Place ${id} ${q('the scrivener\'s')} is room within ${s.id} indoors.`,
      `  Passage ${id}_door ${q('the scrivener\'s door')} is door between ${id} and ${s.id}_green.`,
      `  Place ${back} ${q('the room behind the scrivener\'s curtain')} is room within ${s.id} indoors.`,
      `  Passage ${back}_curtain ${q('the curtain at the back')} is door between ${id} and ${back}`
        + ` opening when knows(party, ${known}) ${q('A heavy curtain hangs across the back of the shop. The scrivener '
        + 'keeps a chair in front of it, and keeps sitting in it.')}.`,
      `  Observe ${id}_scene at ${id} as fixture when true ${q('A narrow shop that smells of ink and sand: a counter, '
        + 'letters waiting under a stone to be called for, a price for each kind of hand chalked on a board.')}.`,
      `  Person ${clerk} ${q('the scrivener')} at ${id} { Role ${q('who writes letters for those who cannot')}.`
        + ` Ancestry ${s.folk ?? region.ancestry}. Peaceable. Manner acerbic. }`,
      `  Discovery ${known} ${q(`Behind the scrivener's curtain in ${s.name}, ${t.name} teaches spells, to those who `
        + 'cast them, for coin.')}.`,
      `  Topic ${known}_asked with ${clerk} ${q('Ask {' + clerk + '} after the older books')} when not knows(actor, ${known}) {`,
      `    Says ${q(`{${clerk}} looks at you over the pen for a long moment, then gets up and draws the curtain back. `
        + `'Not books,' {${clerk}} says. 'Better. Mind the step.'`)}.`,
      `    On discuss { Assert knows(actor, ${known}). }`, '  }',
      `  Person ${who} ${q(t.name)} at ${back} { Role ${q(`who teaches spells, for ${fee} coin a lesson`)}.`
        + ` Ancestry ${s.folk ?? region.ancestry}.${likeness} Peaceable. Pronouns ${t.pronoun}. Manner proud. }`,
      ...taught.map(a => `  Initially Assert teaches(${who}, ${a}).`),
      `  Initially Set lessonFee(${who}) to ${fee}.`,
      `  Observe ${back}_scene at ${back} as fixture when true ${q('A low room lined with shelves of things that are '
        + 'not books: jars, a skull with a candle in it, a slate covered in figures. It smells of hot wax and iron.')}.`,
      `  Observe ${back}_lessons at ${back} as ambience when true ${q(this.offer(t.name, taught, [fee, 'a caster of such spells']))}.`];
  }
}
