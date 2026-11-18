import type { Act, Screen } from '../ui/screen-types';
import { TalkFocus } from '../ui/talk-focus';
import { Typography } from '../presentation/typography';
import type { Offered } from './runner';

// What can be said to each of the people here, one row a person, as the page holds it under their talk (CL-07, the
// cold plays: 30 asks to six people in the rest at the Stone Horn). The one the company is talking with (see
// Runner.with) has theirs first, talk before trade; anyone else is their talk alone: its own row where it is one
// ("Talk to Kynes", a world act), else talk:<id>, which turns to them taking no time.
export class RunnerTalks {
  static talks(screen: Screen, rest: Offered[], primary: Offered[], talking?: string): Offered[] {
    const whose = this.whose(screen, [...primary, ...rest]), paid = this.services(screen);
    const many = new Set([...whose.values()].filter((p, i, all) => all.indexOf(p) !== i && p !== talking));
    const theirs = rest.filter(o => talking && whose.get(o.id) === talking);
    const out: Offered[] = [...theirs.filter(o => !paid.has(o.id)), ...theirs.filter(o => paid.has(o.id))];
    const led = new Set(primary.map(o => whose.get(o.id) && /^talk_to\(/.test(o.id) ? whose.get(o.id) : ''));
    const told = new Set<string>();
    for (const o of rest.filter(x => !theirs.includes(x))) {
      const p = whose.get(o.id);
      if (!p || !many.has(p)) { out.push(o); continue; }
      if (told.has(p) || led.has(p)) { continue; }
      told.add(p);
      const own = rest.find(x => x.id === `talk_to(${p})`), name = screen.people.find(x => x.id === p)!.name;
      out.push({ ...own ?? { id: `talk:${p}`, label: Typography.plain(this.called(screen, p)
        ?? `Talk to ${name.split(', ')[0]}`), type: 'talk' as const, marks: [] },
      aspects: [...new Set(rest.filter(x => whose.get(x.id) === p).flatMap(x => x.aspects))] });
    }
    return out;
  }
  // Each command done with one of the people here, by whom: their own acts as the screen holds them under them.
  // A word asked of someone (ask(informant, topic)) is theirs too, where the screen holds it apart from them.
  static whose(screen: Screen, rest: Offered[] = []): Map<string, string> {
    const here = screen.people.filter(p => p.kind === 'person' && !p.state), ids = new Set(here.map(p => p.id));
    return new Map([...rest.flatMap(o => [/^ask\(([^,]+),/.exec(o.id)?.[1] ?? ''].filter(p => ids.has(p))
      .map(p => [o.id, p] as const)),
    ...here.flatMap(p => this.flat(p.acts).flatMap(a => a.command ? [[a.command, p.id] as const] : []))]);
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
