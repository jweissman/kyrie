import type { DeepLayout } from './deep-layout';
import type { DeepShortcut } from './deep-purposes';

// A delver's way down to a depth already reached (the cold play of 25 November, D1: out of a deep site was one move
// from anywhere, and in was every cleared room again, eight to eleven moves a trip, so that a fifth expedition was
// mostly walking). Each level below the first has one, made by the company from below, where it first comes down to
// that level: a rope left hanging in an old shaft, a cage hooked to a winding wheel set working, a bar drawn from a
// door on its far side. Until it is made it is a thing there to be worked, at what it costs (a rope bought in town,
// oil for the gear); once made it stays made, and from then on the way in offers it as a way of its own, straight
// down to that level in one act. A place in the world and an act in the menu, within the site: no map click.
export class DeepShortcuts {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, shortcuts: readonly DeepShortcut[]): string[] {
    return shortcuts.flatMap(s => this.one(layout, s));
  }
  // The room it serves (the level's room of that role), and the gear that must be working first, if any: the way
  // into that room worked by a winch (the mine's cage on its winding wheel).
  private static one(layout: DeepLayout, s: DeepShortcut): string[] {
    const level = layout.levels.find(l => l.id === `${layout.site}_${s.level}`);
    const room = level?.index ? level.rooms.find(r => r.role === s.at) : undefined;
    if (!room) { return []; }
    const q = this.q, id = `${room.id}_short`, known = `${id}_known`;
    const gear = s.geared ? layout.links.find(l => l.between && l.b === room.id && l.mechanism === 'winch') : undefined;
    const needs = [s.needs ? ` needing ${s.needs}` : '', s.consumes ? ` consuming ${s.consumes}` : '',
      gear ? ` when state(${gear.id}_wheel, turning)${s.geared ? ` ${q(s.geared)}` : ''}` : ''].join('');
    return [`  Discovery ${known} ${q(s.told)}.`,
      `  Thing ${id} ${q(s.thing)} at ${room.id} {`, `    State unmade ${q(s.unmade)}.`, `    State made ${q(s.made)}.`,
      `    Change make ${q(s.make)} from unmade to made${needs}.`, '  }',
      `  Observe ${id}_made at ${room.id} when state(${id}, made) and not knows(party, ${known}) ${q(s.told)}`
        + ` teaches ${known}.`,
      // Made, it secures the room it hangs into: a staging point gone down to from above in one act (Descents).
      `  Initially Assert securedBy(${id}, ${room.id}). Initially Assert secureWhen(${id}, made).`,
      `  Passage ${id}_way ${q(s.way)} is ${s.kind} between ${layout.site} and ${room.id} taking ${s.minutes} minutes`
        + ` hidden until ${known}.`];
  }
}
