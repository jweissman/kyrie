import { Canon } from '../../canon/canon';
import { Draw } from '../land/draw';
import type { DeepContent } from './deep-pacing';
import type { DeepPurpose } from './deep-purposes';
import type { DeepLayout } from './deep-layout';
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
      // Newcomers are of a kind not already on the level: not a second band of bats.
      const here = new Set(content.filter(c => c.room.level === level.index && c.dwellers)
        .map(c => c.dwellers!.group.label));
      const fresh = pool.filter(g => !here.has(g.label));
      const draw = new Draw(`${key}:newcomers:${level.index}`), group = draw.pick(fresh.length ? fresh : pool), q = this.q;
      const id = `${level.id}_newcomers`, beyond = `${level.id}_beyond`, rank = 1 + level.index;
      const who = group.species ? `Species ${group.species}.` : `Ancestry ${group.ancestry}. Calling ${group.calling ?? 'warrior'}.`;
      return [`  Place ${beyond} "the workings beyond" is room within ${level.id}.`,
        `  Person ${id} ${q(group.label)} at ${beyond} { Role ${q(group.role)}. ${who} Numbers ${group.count}.`
          + ` Level ${rank}. Temperament ${group.temperament}. }`,
        ...held.flatMap(c => [
          ...this.succession({ id, beyond, level: level.id, gone: c.dwellers!.id, room: c.room.id }),
          // Moved in, they are heard as whoever was there before them was.
          ...DeepSounds.lines(layout, { id, room: c.room.id, temperament: group.temperament,
            ...group.species ? { kind: Canon.creature(group.species).type } : {} })])];
    });
  }
  private static succession(at: Succession): string[] {
    const { id, beyond, level, gone, room } = at;
    return [`  Rule ${gone}_succeeded when dead(${gone}) and at(${id}, ${beyond}) and untilLight(clock) == 1`
      + ` and not (at(party, ?p) and deepLevelOf(?p, ${level}))`
      + ` { Retract at(${id}, ${beyond}). Assert at(${id}, ${room}). }`,
      `  Observe ${gone}_succession at ${room} when dead(${gone}) and at(${id}, ${room}) ${this.q('The dead you left here have been dragged into a corner and picked over, and the place smells of something else now: whoever lives here came after you went.')}.`];
  }
}
