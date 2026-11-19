import type { Screen } from '../ui/screen-types';
import type { Aspect, Glance, Promoted } from '../presentation/glance-types';
import type { ActType } from '../presentation/offer';
import { Doable, type Row } from '../presentation/doable';
import { Typography } from '../presentation/typography';

// What the terminal lists each offered choice by, read from Doable and nothing else (TB-12): a row by the command it
// does, one led for an act within it by that act (the page's "Ask Wat about Father"), an opener by its own id, with
// the commands of its rows under it. An opener is never done by its first: the speaking door's gold "Look at the
// speaking door" had been led as "Push and pull" (cold play 5, CL-34).
export class TerminalDoable {
  // The four, by what each is listed by (Glance.offer, as the page draws them: TB-01, TB-02).
  static led(glance: Glance | undefined, screen: Screen): string[] {
    return glance ? Doable.of(glance, screen).filter(r => r.led).map(r => r.for ?? this.by(r)) : [];
  }
  // A choice of the glance (a lens's, the offer's) by what it is listed by: what it does, or an opener by its own id
  // (only the four are led with what a row is led for).
  static key(glance: Glance, screen: Screen, choice: string, command?: string): string {
    return this.by(Doable.flat(Doable.of(glance, screen)).find(r => r.id === choice)
      ?? Doable.one(glance, screen, choice, command));
  }
  static keyed(glance: Glance | undefined, screen: Screen): (o: { choice: string; command?: string }) => string {
    return this.keying.bind(this, glance, screen);
  }
  private static keying(glance: Glance | undefined, screen: Screen, o: { choice: string; command?: string }): string {
    return glance ? this.key(glance, screen, o.choice, o.command) : o.command ?? o.choice;
  }
  // What each of the rest is to the company, as the glance's offer says it (Offers.scene): the rest unfolded carries
  // the same indicator as the four (TP-02); and what kind of act each is (Offers' types), by which the human mode folds
  // the rest. An act within an opener (the question a talk is led for) is of the opener's kind.
  static kinds(glance: Glance | undefined, screen: Screen)
    : { aspects: Map<string, Aspect[]>; types: Map<string, ActType> } {
    const offer = glance?.offer, key = this.keyed(glance, screen);
    // Each by what it bears (Doable.borne), as the page folds it: never the offer's words for it read apart.
    const aspects = new Map((offer?.rest ?? []).map(o => [key(o), Doable.borne(glance!, screen, o.choice)]));
    const types = new Map([...offer?.primary ?? [], ...offer?.rest ?? []].map(o => [key(o), o.type]));
    for (const x of (glance?.acts ?? []).flatMap(a => (a.inside ?? []).map(i => [i.command, a.choice] as const))) {
      if (!types.has(x[0])) { types.set(x[0], types.get(x[1]) ?? 'talk'); }
    }
    return { aspects, types };
  }
  // The openers offered, each with the commands of its rows: what taking it lists.
  static openers(glance: Glance | undefined, screen: Screen)
    : { id: string; name: string; opens: string[]; says?: string }[] {
    const lensed = Object.values(glance?.lenses ?? {}).flatMap(l => [...l.promoted, ...l.rest])
      .map(a => Doable.one(glance!, screen, a.choice, a.command));
    return [...glance ? Doable.of(glance, screen) : [], ...lensed].filter(r => r.opens)
      .map(r => ({ id: r.id, name: r.label, opens: this.leaves(r).flatMap(k => k.does ?? []),
        ...r.says ? { says: r.says } : {} }));
  }
  // The openers as the terminal lists them, beside every act: taken, each lists its rows (see Terminal.act).
  static listed(glance: Glance | undefined, screen: Screen, types: Map<string, ActType>)
    : { id: string; name: string; opens: string[]; says?: string; time: number; type: ActType }[] {
    return this.openers(glance, screen).map(o => ({ ...o, time: 0, type: types.get(o.id) ?? 'act' }));
  }
  // The glance's acts, an opener's without the command its first row does: what the page draws on the opener is
  // drawn on it, never on its first try (see Terminal.drawn).
  static acts(glance: Glance | undefined, screen: Screen): Promoted[] {
    const openers = new Set(this.openers(glance, screen).map(o => o.id));
    return (glance?.acts ?? []).map(a => openers.has(a.choice) ? this.bare(a) : a);
  }
  private static bare(a: Promoted): Promoted {
    const { command, ...rest } = a;
    return command ? rest : a;
  }
  // An opener taken, its rows: the four first; one with a focus reads it out, and every row of it is among the first
  // (a riddle and all its answers: CL-34).
  static unfolded<T>(rows: T[], says?: string): { first: T[]; rest: T[]; says?: string } {
    const four = says ? rows.length : 4;
    return { first: rows.slice(0, four), rest: rows.slice(four), ...says ? { says } : {} };
  }
  // Its name, and what it reads out whole (the speaking door's riddle), as lines over its rows.
  static heading(o: { opened?: string; says?: string }): string[] {
    return [...o.opened ? [`${Typography.plain(o.opened)}:`] : [], ...o.says ? [Typography.plain(o.says)] : []];
  }
  private static leaves(r: Row): Row[] { return r.opens ? r.opens.flatMap(k => this.leaves(k)) : [r]; }
  private static by(r: Row): string { return r.opens ? r.id : r.does ?? r.id; }
}
