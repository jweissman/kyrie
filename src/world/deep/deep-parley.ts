import { DeepKnown } from './deep-known';
import type { DeepLayout, DeepLink } from './deep-layout';
import type { DeepContent } from './deep-pacing';

// What a band that talks says, and what comes of each answer to it (OR-1392, the thinking inhabitants' grammar): a
// problem with more than one answer, each read later by the place or by the band itself.
// - Talked round (talk_round), it lets the company be, and says what it has found when asked: the way it dug.
// - Lied to (pass_off), it takes the company for its own and lets the same slip at once; but after a night it knows
//   it was lied to, and falls on the company the next time it is met (data/rules/inhabitants.kyr).
// - Warned off (face_down), with nowhere of its own to fall back to, it quits the place once the company has gone,
//   and leaves what it had where it was.
// - Fought, it is dead, as any band.
// The way it dug is hidden until told, or found by searching where it starts.
export interface Parley {
  // The topic's label and the band's answer; the way it tells of ([level, role] of the connector's upper room), what
  // knowing it says, and what the band lets slip to one it takes for its own; its place once it has quit, and the
  // band again after a night to think, lied to.
  ask: string; tells: string; way: [string, string]; found: string; slips: string; quit: string; known: string;
  // What shows at the way onto its level once it has quit (OR-1449).
  sign?: string;
}
export class DeepParley {
  static readonly q = JSON.stringify;
  // The connectors the bands met there hide (written here, not as a plain way).
  static ways(layout: DeepLayout, content: DeepContent[]): DeepLink[] {
    return content.flatMap(c => c.dwellers?.group.parley ? this.way(layout, c.dwellers.group.parley) ?? [] : []);
  }
  static lines(layout: DeepLayout, content: DeepContent[]): string[] {
    return content.flatMap(c => {
      const p = c.dwellers?.group.parley, b = c.dwellers?.id;
      const level = layout.levels[c.room.level], entry = level && DeepKnown.entry(layout, level)?.id;
      return p && b ? [...this.band(layout, { b, room: c.room.id, p }),
        ...p.sign && entry ? [`  Observe ${b}_gone at ${entry} as sign when quit(${b}) ${this.say(b, p.sign)}.`] : []] : [];
    });
  }
  private static way(layout: DeepLayout, p: Parley): DeepLink | undefined {
    const level = layout.levels.find(l => l.id === `${layout.site}_${p.way[0]}`);
    const from = level?.rooms.find(r => r.role === p.way[1]);
    return from && layout.links.find(l => l.between && l.a === from.id);
  }
  // A line of the band's, with the band named where it says {band}.
  private static say(b: string, s: string): string { return this.q(s.replaceAll('{band}', `{${b}}`)); }
  private static band(layout: DeepLayout, at: { b: string; room: string; p: Parley }): string[] {
    const { b, room, p } = at, q = this.q, told = `${b}_told`, way = this.way(layout, p);
    const say = this.say.bind(this, b);
    return [...way ? [`  Discovery ${told} ${q(p.found)} { Found by searching ${way.a}. }`,
      `  Passage ${way.id} ${q(way.name)} is ${way.kind} between ${way.a} and ${way.b} taking ${way.minutes} minutes`
        + ` hidden until ${told}.`] : [`  Discovery ${told} ${q(p.found)}.`],
    `  Topic ${b}_tells with ${b} ${say(p.ask)} when tolerates(${b}, actor) and not deceived(${b}, actor)`
      + ` and not knows(actor, ${told}) once {`,
    `    Says ${say(p.tells)}.`, `    On discuss { Assert knows(actor, ${told}). }`, '  }',
    `  Rule ${b}_lets_slip when deceived(${b}, party) and not knows(party, ${told}) says ${say(p.slips)}`
      + ` teaches ${told} { }`,
    `  Rule ${b}_quits when warnedOff(${b}, party) and not together(${b}, party) and at(${b}, ${room}) {`,
    `    Retract at(${b}, ${room}). Assert quit(${b}).`, '  }',
    `  Observe ${b}_quit at ${room} when quit(${b}) ${say(p.quit)}.`,
    `  Observe ${b}_known at ${room} when seenThrough(${b}, party) and able(${b}) ${say(p.known)}.`];
  }
}
