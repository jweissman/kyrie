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
    return [`  Rule ${door.id}_loosed when state(${wall}, broken) and at(${band}, ${from}) and able(${band})`
      + ` and untilLight(clock) == 1 and not (at(party, ?p) and deepLevelOf(?p, ${upper.id}))`
      + ` { Retract at(${band}, ${from}). Assert at(${band}, ${door.a}). }`,
    `  Observe ${door.id}_loosed at ${door.a} when at(${band}, ${door.a}) and able(${band}) ${q(loosed.scene)}.`];
  }
}
