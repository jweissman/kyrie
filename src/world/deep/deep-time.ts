import { Canon } from '../../canon/canon';
import { Draw } from '../land/draw';
import type { DeepContent } from './deep-pacing';
import type { DeepPurpose } from './deep-purposes';
import type { DeepLayout } from './deep-layout';
import { DeepKnown } from './deep-known';
import { DeepSounds } from './deep-sounds';

// Who moves in (id), from where they wait (beyond), on which level, after whom (gone), and where (room).
interface Succession { id: string; beyond: string; level: string; gone: string; room: string }

// What a deep site does while the company is away. Its levels are not emptied for good: on each, a band from deeper
// in waits beyond the workings, and the first dawn after the company has killed a room's dwellers and gone off that
// level, it moves in there; whoever comes back finds the dead dragged into a corner and something else at home.
export class DeepTime {
  static readonly q = JSON.stringify;
  static lines(purpose: DeepPurpose, layout: DeepLayout, content: DeepContent[], key: string): string[] {
    return layout.levels.flatMap(level => {
      const held = content.filter(c => c.dwellers && !c.dwellers.elite && c.room.level === level.index);
      const pool = purpose.dwellers.find(d => d.depth === level.index)?.groups ?? [];
      if (!held.length || !pool.length) { return []; }
      // Newcomers are of a kind not already on the level: not a second band of bats. To the way in, those the purpose
      // says come in from outside (a pack of gnolls out of the hills, OR-1236), where it says any.
      const here = new Set(content.filter(c => c.room.level === level.index && c.dwellers)
        .map(c => c.dwellers!.group.label));
      const fresh = pool.filter(g => !here.has(g.label)), incomers = level.index === 0 ? purpose.incomers ?? [] : [];
      const draw = new Draw(`${key}:newcomers:${level.index}`), q = this.q;
      const group = draw.pick(incomers.length ? incomers : fresh.length ? fresh : pool);
      const id = `${level.id}_newcomers`, beyond = `${level.id}_beyond`, rank = 1 + level.index;
      const who = group.species ? `Species ${group.species}.` : `Ancestry ${group.ancestry}. Calling ${group.calling ?? 'warrior'}.`;
      return [`  Place ${beyond} "the workings beyond" is room within ${level.id}.`,
        `  Person ${id} ${q(group.label)} at ${beyond} { Role ${q(group.role)}. ${who} Numbers ${group.count}.`
          + ` Level ${rank}. Temperament ${group.temperament}. }`,
        ...this.seen({ id, beyond, level: level.id, entry: DeepKnown.entry(layout, level)?.id,
          temperament: group.temperament }),
        ...held.flatMap(c => [
          ...this.succession({ id, beyond, level: level.id, gone: c.dwellers!.id, room: c.room.id }),
          // Moved in, they are heard as whoever was there before them was.
          ...DeepSounds.lines(layout, { id, room: c.room.id, temperament: group.temperament,
            ...group.species ? { kind: Canon.creature(group.species).type } : {} })])];
    });
  }
  static readonly said = {
    sign: 'The dust at the way onto this level is trodden fresh, and not by you. New dwellers have come in since you were'
      + ' last down.',
    settled: 'The newcomers have made this place their own. They have heaped the old bones at the door, and they do not'
      + ' wait to warn.',
  };
  // Moved in, they are seen at the way onto the level (OR-1449); and a dawn later, with the company off the level,
  // they have made it their own, and fall on whoever comes in without warning (OR-1460: delay costs).
  private static seen(at: { id: string; beyond: string; level: string; entry?: string; temperament: string }):
    string[] {
    const { id, beyond, level, entry, temperament } = at, q = this.q;
    const off = `not (at(party, ?p) and deepLevelOf(?p, ${level}))`;
    return [...entry ? [`  Observe ${id}_sign at ${entry} as sign when not at(${id}, ${beyond}) and able(${id})`
      + ` ${q(this.said.sign)}.`] : [],
    ...temperament === 'savage' ? [] : [`  Rule ${id}_settles when not at(${id}, ${beyond}) and able(${id})`
      + ` and not dugIn(${id}) and deepMoved(${id}) < day(clock) and untilLight(clock) == 1 and ${off} {`
      + ` Assert dugIn(${id}). Retract temperament(${id}, temper_${temperament}). Assert temperament(${id}, temper_savage). }`]];
  }
  private static succession(at: Succession): string[] {
    const { id, beyond, level, gone, room } = at;
    return [`  Rule ${gone}_succeeded when dead(${gone}) and at(${id}, ${beyond}) and untilLight(clock) == 1`
      + ` and not (at(party, ?p) and deepLevelOf(?p, ${level}))`
      + ` { Retract at(${id}, ${beyond}). Assert at(${id}, ${room}). Set deepMoved(${id}) to day(clock). }`,
      `  Observe ${id}_settled_${room} at ${room} when dugIn(${id}) and at(${id}, ${room}) and able(${id})`
        + ` ${this.q(this.said.settled)}.`,
      `  Observe ${gone}_succession at ${room} when dead(${gone}) and at(${id}, ${room}) ${this.q('The dead you left here have been dragged into a corner and picked over, and the place smells of something else now: whoever lives here came after you went.')}.`];
  }
}
