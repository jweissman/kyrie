import type { Act, Screen } from '../ui/screen-types';
import { TalkFocus } from '../ui/talk-focus';
import { TradeModel } from '../ui/trade-model';
import type { Offered } from './runner';
import { Doable, type Row } from '../presentation/doable';
import type { Question } from '../frame/talk-question';

// What can be said to each of the people here, as the engine holds it (MT-18, mt18-grouping.md): a row within a
// person's talk (Doable's within) is drawn when the company turns to them, by their talk (talk_to, the engine's own
// row for them, bearing the fold of what it holds); never grouped by rules of the runner's own. The one the company is
// talking with (see Runner.with) has theirs first, talk before trade. A ware on a thing's shelf
// stays the thing's, but for a trader's counter (TradeModel.laid).
export class RunnerTalks {
  static talks(screen: Screen, rows: readonly Row[], rest: Offered[], talking?: string): Offered[] {
    const whose = this.whose(rows), paid = this.services(screen);
    const counter = TradeModel.laid(screen);
    const shelved = new Set(screen.things.filter(t => !counter.has(t.id)).flatMap(t => this.flat(t.acts))
      .flatMap(a => a.command ? [a.command] : []));
    const theirs = rest.filter(o => talking && whose.get(this.act(o)) === talking);
    const loose = rest.filter(o => !theirs.includes(o) && (!whose.has(this.act(o)) || shelved.has(this.act(o))));
    return [...theirs.filter(o => !paid.has(this.act(o))), ...theirs.filter(o => paid.has(this.act(o))), ...loose,
      ...this.holders(rows, rest, loose, whose)].map(o => {
      const p = /^talk_to\((.+)\)$/.exec(this.act(o))?.[1];
      const held = p ? rest.filter(x => whose.get(this.act(x)) === p) : [];
      return held.length ? { ...o, aspects: [...new Set([...o.aspects, ...held.flatMap(x => x.aspects)])] } : o;
    });
  }
  // The engine's talk of each person whose acts are held within it and who is not otherwise drawn by it: led for a
  // question (the four drawn as that question), their talk is still offered, so that what it holds can be reached
  // (Kynes at the Stone Horn, led for what the waterfront is saying, her other words and her trade had gone). It is
  // offered as the engine has it: by what it does, or, a companion's that only holds, by its own id.
  private static holders(rows: readonly Row[], rest: Offered[], drawn: Offered[], whose: Map<string, string>):
    Offered[] {
    const people = [...new Set(rest.flatMap(o => whose.get(o.does ?? o.id) ?? []))];
    return people.filter(p => !drawn.some(o => [`talk_to(${p})`, `focus:talk:${p}`].includes(o.does ?? o.id)
      || o.id === `${p}#talk`)).flatMap(p => {
      // Never one the four lead with: it is drawn there.
      const row = Doable.flat(rows).find(r => r.id === `${p}#talk` && !r.led);
      return row ? [{ id: row.id, label: row.label, does: row.does ?? `focus:talk:${p}`, aspects: [],
        type: 'talk' as const, marks: [] }] : [];
    });
  }
  private static act(o: Offered): string { return o.does ?? o.id; }
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
  // The talk's question as the runner offers it (OR-1451): the engine's rows (MenuTree.question), each as the scene
  // offers its act (its words, minutes and note), marked as the question marks it, and every row of the question's own
  // (Trade, the next page, Back, a leave the world has none of) by its command; nothing of the place beside it.
  static asked(question: Question, all: Offered[]): Offered[] {
    const talk = question.talk;
    if (!talk) { return []; }
    return talk.rows.flatMap(r => {
      if (!r.command) { return []; }
      const known = all.find(o => o.does === r.command || o.id === r.command);
      const aspects = [...new Set((talk.marks[r.id] ?? []).flatMap(l => l.witnesses.flatMap(w => w.aspects)))]
        .map(String);
      return [{ ...known ?? { id: r.command, label: r.label, type: 'talk' as const, marks: [] }, does: r.command,
        aspects, ...r.note && !known ? { note: r.note } : {} }];
    });
  }
  // A talk called as the page calls it ("Talk to Kynes", not "Talk to Kynes, innkeeper").
  private static called(screen: Screen, person: string): string | undefined {
    const talk = this.flat(screen.people.find(x => x.id === person)?.acts ?? []).find(a => a.does === 'talk_to');
    return talk && (talk.alone || talk.label);
  }
  private static flat(acts: Act[]): Act[] { return acts.flatMap(a => [a, ...this.flat(a.children ?? [])]); }
}
