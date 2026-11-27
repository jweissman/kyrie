import { DeepKnown } from './deep-known';
import type { DeepLayout } from './deep-layout';
import type { DeepContent } from './deep-pacing';
import type { MechanismWords } from './deep-purposes';

// A seal's answers read later (OR-1392, the maintained mechanism's grammar): the king's door read (operated: what is
// behind it told), broken (sabotaged: the way down open) or set back (repaired). While it stands broken, those who kept
// the far side come up through it at the first dawn the company is off that level, and are met at its upper side;
// set back across the door before then, it keeps them where they were.
export class DeepLoosed {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, content: DeepContent[], seal?: MechanismWords['seal']): string[] {
    const loosed = seal?.loosed, door = layout.links.find(l => l.mechanism === 'seal');
    if (!loosed || !door) { return []; }
    const below = content.find(c => c.room.role === loosed.role && c.dwellers
      && layout.levels.some(l => l.rooms.includes(c.room) && l.rooms.some(r => r.id === door.b)));
    const upper = layout.levels.find(l => l.rooms.some(r => r.id === door.a));
    if (!below?.dwellers || !upper) { return []; }
    const q = this.q, band = below.dwellers.id, from = below.room.id, wall = `${door.id}_wall`;
    const off = `untilLight(clock) == 1 and not (at(party, ?p) and deepLevelOf(?p, ${upper.id}))`;
    // Each dawn after, while the door stands broken, a room further up the level toward its way in (OR-1460: the
    // longer it is left, the more of the level is theirs).
    const through = DeepKnown.through(layout, upper), up = through?.rooms.at(-1)?.id === door.a
      ? [...through.rooms].reverse() : [];
    const entry = DeepKnown.entry(layout, upper)?.id;
    return [`  Rule ${door.id}_loosed when state(${wall}, broken) and at(${band}, ${from}) and able(${band}) and ${off}`
      + ` { Retract at(${band}, ${from}). Assert at(${band}, ${door.a}). Set deepMoved(${band}) to day(clock). }`,
    ...up.slice(1).map((r, i) => `  Rule ${door.id}_spread${i} when state(${wall}, broken) and at(${band}, ${up[i]!.id})`
      + ` and able(${band}) and deepMoved(${band}) < day(clock) and ${off}`
      + ` { Retract at(${band}, ${up[i]!.id}). Assert at(${band}, ${r.id}). Set deepMoved(${band}) to day(clock). }`),
    `  Observe ${door.id}_loosed at ${door.a} when at(${band}, ${door.a}) and able(${band}) ${q(loosed.scene)}.`,
    ...entry && loosed.sign ? [`  Observe ${door.id}_sign at ${entry} as sign when at(${band}, ?p) and deepLevelOf(?p,`
      + ` ${upper.id}) and able(${band}) ${q(loosed.sign)}.`] : []];
  }
}
