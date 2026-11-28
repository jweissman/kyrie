import { Canon } from '../../canon/canon';
import { Draw } from '../land/draw';
import type { DeepContent } from './deep-pacing';
import type { DeepGroup, DeepPurpose } from './deep-purposes';
import type { DeepLayout, DeepLevel } from './deep-layout';
import { DeepKnown } from './deep-known';
import { DeepSounds } from './deep-sounds';
import { DeepCarried } from './deep-carried';

// Who moves in (id), from where they wait (beyond), on which level, after whom (gone), where (room), and the room's
// place among those they may move into (n).
interface Succession { id: string; beyond: string; level: string; gone: string; room: string; n: number;
  first: boolean }
// A band of newcomers: its id, its kind, the rank it comes in at, and the band it follows (none for the first).
interface Wave { id: string; group: DeepGroup; rank: number; after?: string }

// What a deep site does while the company is away. Its levels are not emptied for good: on each, bands from deeper
// in wait beyond the workings, one after another. The first dawn after the company has killed a room's dwellers and
// gone off that level, the first band moves in there; once it too is killed, the next comes the dawn after, a rank
// stronger, into the room where the last fell. Each brings what such dwellers carry (DeepCarried), and leaves it
// where it falls: a return finds danger and reward both (OR-1622).
export class DeepTime {
  static readonly q = JSON.stringify;
  // How many bands wait beyond a level, one after another, under the reference game's woods: its dungeon is the one
  // gone down again and again. Elsewhere one, as before: three in every deep site of a country had put a new world's
  // start from 7.1-8.0 s to 8.8-13.3 s, and there is no realising them when first needed yet (SP-02, OR-1720).
  static readonly waves = 3;
  static lines(purpose: DeepPurpose, layout: DeepLayout, content: DeepContent[], at: { key: string; waves?: number }):
    string[] {
    const { key, waves = 1 } = at;
    return layout.levels.flatMap(level => {
      const held = content.filter(c => c.dwellers && !c.dwellers.elite && c.room.level === level.index);
      const pool = purpose.dwellers.find(d => d.depth === level.index)?.groups ?? [];
      if (!held.length || !pool.length) { return []; }
      const beyond = `${level.id}_beyond`;
      return [`  Place ${beyond} "the workings beyond" is room within ${level.id}.`,
        ...this.drawn({ purpose, level, content, key, pool }, waves).flatMap(wave =>
          this.wave(wave, { layout, level, beyond, held, purpose, key }))];
    });
  }
  // Newcomers are of a kind not already on the level, nor one come before them: not a second band of bats, where
  // the depth has others. To the way in, the first are those the purpose says come in from outside (a pack of gnolls
  // out of the hills, OR-1236), where it says any. The first band is drawn as it was before there were more.
  private static drawn(at: { purpose: DeepPurpose; level: DeepLevel; content: DeepContent[]; key: string;
    pool: DeepGroup[] }, count: number): Wave[] {
    const { purpose, level, content, key, pool } = at, rank = 1 + level.index;
    const here = new Set(content.filter(c => c.room.level === level.index && c.dwellers)
      .map(c => c.dwellers!.group.label));
    const fresh = pool.filter(g => !here.has(g.label)), incomers = level.index === 0 ? purpose.incomers ?? [] : [];
    const first = new Draw(`${key}:newcomers:${level.index}`).pick(incomers.length ? incomers : fresh.length ? fresh
      : pool);
    const waves: Wave[] = [{ id: `${level.id}_newcomers`, group: first, rank }];
    for (let n = 1; n < count; n++) {
      const used = new Set(waves.map(w => w.group.label));
      const from = [fresh.filter(g => !used.has(g.label)), pool.filter(g => !used.has(g.label)), pool]
        .find(x => x.length)!;
      const group = new Draw(`${key}:newcomers:${level.index}:${n}`).pick(from);
      waves.push({ id: `${level.id}_newcomers${n + 1}`, group, rank: rank + n, after: waves.at(-1)!.id });
    }
    return waves;
  }
  private static wave(w: Wave, at: { layout: DeepLayout; level: DeepLevel; beyond: string; held: DeepContent[];
    purpose: DeepPurpose; key: string }): string[] {
    const { layout, level, beyond, held } = at, { id, group } = w, q = this.q;
    const who = group.species ? `Species ${group.species}.` : `Ancestry ${group.ancestry}. Calling ${group.calling ?? 'warrior'}.`;
    const kind = group.species ? Canon.creature(group.species).type : undefined;
    return [`  Person ${id} ${q(group.label)} at ${beyond} { Role ${q(group.role)}. ${who} Numbers ${group.count}.`
      + ` Level ${w.rank}. Temperament ${group.temperament}. }`,
    ...this.seen({ id, beyond, level: level.id, entry: DeepKnown.entry(layout, level)?.id,
      temperament: group.temperament }),
    ...w.after ? [this.moves({ id, beyond, level: level.id, rule: `${id}_follows`,
      when: `dead(${w.after}) and at(${w.after}, ?r) and distinct(?r, ${beyond})`, to: '?r' })] : [],
    // The first follow whoever the company killed in a room, wherever they fell; those after them, the band before
    // them, into the room it held.
    ...held.flatMap((c, n) => [...this.succession({ id, beyond, level: level.id, gone: w.after ?? c.dwellers!.id,
      room: c.room.id, n, first: !w.after }),
    // Moved in, they are heard as whoever was there before them was.
    ...DeepSounds.lines(layout, { id, room: c.room.id, temperament: group.temperament, ...kind ? { kind } : {} })]),
    ...DeepCarried.lines({ id, beyond, purpose: at.purpose, key: `${at.key}:${id}`,
      kind: kind ?? 'humanoid', depth: level.index })];
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
  // The first band's rules keep the names they had when it was the only one (gone_succeeded), so a kept trace reads
  // them as it did; a later band's are its own, and it comes only where the band before it fell.
  // A band moving in at the first dawn the company is off the level: the first into the room it was written for, one
  // after it into wherever the band before it fell, by one rule, not one a room (a new world's start).
  private static moves(at: { id: string; beyond: string; level: string; rule: string; when: string; to: string }):
    string {
    const { id, beyond, level, rule, when, to } = at;
    return `  Rule ${rule} when ${when} and at(${id}, ${beyond}) and untilLight(clock) == 1`
      + ` and not (at(party, ?p) and deepLevelOf(?p, ${level}))`
      + ` { Retract at(${id}, ${beyond}). Assert at(${id}, ${to}). Set deepMoved(${id}) to day(clock). }`;
  }
  private static succession(at: Succession): string[] {
    const { id, beyond, level, gone, room, n, first } = at;
    const seen = first ? `${gone}_succession` : `${id}_after_${n}`;
    return [...first ? [this.moves({ id, beyond, level, rule: `${gone}_succeeded`, when: `dead(${gone})`, to: room })] : [],
      `  Observe ${id}_settled_${room} at ${room} when dugIn(${id}) and at(${id}, ${room}) and able(${id})`
        + ` ${this.q(this.said.settled)}.`,
      `  Observe ${seen} at ${room} when dead(${gone}) and at(${id}, ${room}) ${this.q('The dead you left here have been dragged into a corner and picked over, and the place smells of something else now: whoever lives here came after you went.')}.`];
  }
}
