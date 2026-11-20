import type { Act, Screen } from '../ui/screen-types';
import { TalkFocus } from '../ui/talk-focus';
import type { Offered } from './runner';
import { Doable, type Row } from '../presentation/doable';

// What can be said to each of the people here, as the engine holds it (MT-18, mt18-grouping.md): a row within a
// person's talk (Doable's within) is drawn when the company turns to them, by their talk (talk_to, the engine's own
// row for them, bearing the fold of what it holds); never grouped by rules of the runner's own. The one the company is
// talking with (see Runner.with) has theirs first, talk before trade. A ware on a thing's shelf stays the thing's.
export class RunnerTalks {
  static talks(screen: Screen, rows: readonly Row[], rest: Offered[], talking?: string): Offered[] {
    const whose = this.whose(rows), paid = this.services(screen);
    const shelved = new Set(screen.things.flatMap(t => this.flat(t.acts)).flatMap(a => a.command ? [a.command] : []));
    const theirs = rest.filter(o => talking && whose.get(o.id) === talking);
    const loose = rest.filter(o => !theirs.includes(o) && (!whose.has(o.id) || shelved.has(o.id)));
    return [...theirs.filter(o => !paid.has(o.id)), ...theirs.filter(o => paid.has(o.id)), ...loose,
      ...this.holders(rows, rest, loose, whose)].map(o => {
      const p = /^talk_to\((.+)\)$/.exec(o.id)?.[1], held = p ? rest.filter(x => whose.get(x.id) === p) : [];
      return held.length ? { ...o, aspects: [...new Set([...o.aspects, ...held.flatMap(x => x.aspects)])] } : o;
    });
  }
  // The engine's talk of each person whose acts are held within it and who is not otherwise drawn by it: led for a
  // question (the four drawn as that question), their talk is still offered, so that what it holds can be reached
  // (Kynes at the Stone Horn, led for what the waterfront is saying, her other words and her trade had gone). It is
  // offered as the engine has it: by what it does, or, a companion's that only holds, by its own id.
  private static holders(rows: readonly Row[], rest: Offered[], drawn: Offered[], whose: Map<string, string>):
    Offered[] {
    const people = [...new Set(rest.flatMap(o => whose.get(o.id) ?? []))];
    return people.filter(p => !drawn.some(o => o.id === `talk_to(${p})`)).flatMap(p => {
      const row = Doable.flat(rows).find(r => r.id === `${p}#talk`);
      return row ? [{ id: row.does ?? row.id, label: row.label, aspects: [], type: 'talk' as const, marks: [] }] : [];
    });
  }
  // Each command done with one of the people here, by whom, as the engine holds it (Doable's within).
  static whose(rows: readonly Row[]): Map<string, string> {
    return new Map(Doable.flat(rows).flatMap(r => {
      const p = /^(.+)#talk$/.exec(r.within ?? '')?.[1];
      return p && r.does ? [[r.does, p] as const] : [];
    }));
  }
  // What is had of someone for coin or work, said after what is said to them (TalkFocus.services: the page's own, and
  // the haggling and buying of a trader's wares, which the page keeps with them).
  private static services(screen: Screen): Set<string> {
    return new Set(screen.people.flatMap(p => this.flat(p.acts)).filter(a => a.command
      && (TalkFocus.services.has(a.does ?? '') || ['haggle', 'buy_item'].includes(a.does ?? ''))).map(a => a.command!));
  }
  // A talk called as the page calls it ("Talk to Kynes", not "Talk to Kynes, innkeeper").
  private static called(screen: Screen, person: string): string | undefined {
    const talk = this.flat(screen.people.find(x => x.id === person)?.acts ?? []).find(a => a.does === 'talk_to');
    return talk && (talk.alone ?? talk.label);
  }
  private static flat(acts: Act[]): Act[] { return acts.flatMap(a => [a, ...this.flat(a.children ?? [])]); }
}
