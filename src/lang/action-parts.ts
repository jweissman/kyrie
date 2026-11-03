import type * as ohm from 'ohm-js';
import { ModuleParser } from './module-parser';
import { ObservationText } from './observation-text';
import type { Operator, Predicate } from './module';
import type { World } from './world';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// What an action says it takes and what it tells, beyond the one fixed number and the one fixed sentence: hours as an
// author counts them, the hour of the clock it lasts until, and words told only while something holds.
export class ActionParts {
  static readonly actions = { Time_hours: ActionParts.hours, Time_until: ActionParts.until, TimeUntil: ActionParts.at,
    Result: ActionParts.result, Otherwise: ActionParts.otherwise };
  // "Time 3 hours.": six watches an hour, as a passage's `taking 3 hours` is (Quittance's bg 16, QTC-A13: an author
  // wrote `Time 18.` for three hours, not knowing whether hours were said).
  static hours(_time: Node, value: Node, _unit: Node, _dot: Node): Field {
    return { field: 'time', value: Number(value.sourceString) * 6 };
  }
  // "Time until hour 19." or "Time until day 2 hour 6.": until that hour comes round, or that hour of that day,
  // reckoned by the engine from the clock as the hours until dark are (Wapshott's Circus friction 10, WPC-10: a
  // measure of its own, set by a rule every watch, for an action that waited until the show).
  static until(_time: Node, _until: Node, at: Node, _dot: Node): Field {
    return { field: 'until', value: ModuleParser.ast(at) };
  }
  // TimeUntil = TimeDay? "hour" integer, where TimeDay = "day" integer.
  static at(day: Node, _hour: Node, hour: Node): NonNullable<Operator['until']> {
    const h = Number(hour.sourceString), d = day.children.length ? Number(day.children[0]!.children[1]!.sourceString)
      : undefined;
    if (h > 23 || d === 0) { throw new Error(`No such hour: ${d ? `day ${d} ` : ''}hour ${h}`); }
    return { hour: h, ...d ? { day: d } : {} };
  }
  // "Result "…" when dark()." told in place of the plain Result while that holds, the first of them that does; so
  // too Otherwise (the Grand Tour's friction 6, GTR-06: the basket's ride told of a fine afternoon at ten at night).
  static result(_r: Node, text: Node, when: Node, _dot: Node): Field { return ActionParts.words('report', text, when); }
  static otherwise(_o: Node, text: Node, when: Node, _dot: Node): Field {
    return ActionParts.words('otherwise', text, when);
  }
  private static words(field: 'report' | 'otherwise', text: Node, when: Node): Field {
    const said = ModuleParser.ast(text) as string;
    if (!when.children.length) { return { field, value: said }; }
    return { field: 'told', value: { text: said, when: ModuleParser.ast(when.children[0]!.children[1]!) as Predicate,
      ...field === 'otherwise' ? { failed: true } : {} } };
  }
  // What an action tells as it comes off or does not: the first of its words for the moment that holds as it is
  // done, or else its plain Result or Otherwise.
  static told(action: Operator, success: boolean, world: World): string | undefined {
    const fits = action.told?.find(t => !t.failed === success && world.test(t.when));
    const told = fits?.text ?? (success ? action.report : action.otherwise);
    return told ? ObservationText.render(told, world) : undefined;
  }
}
