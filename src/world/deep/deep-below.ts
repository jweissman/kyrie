import below from '../../../data/generation/deep/below.json';
import { Draw } from '../land/draw';
import type { DeepLayout } from './deep-layout';
import type { DeepGroup, DeepLevelSpec, DeepPurpose, DeepRole } from './deep-purposes';
import { DeepCarried } from './deep-carried';
import { DeepSounds } from './deep-sounds';

// The level below the bottom of a deep site's makers' works (data/generation/deep/below.json; OR-1622: the reference
// dungeon had no level below the grave, and was spent by the fourth expedition). The reference game's deep place is
// one dungeon of descents: past its makers' last level, the old dark they dug down to. Its level is written as theirs
// are, by the same generator (DeepLayouts, DeepPacing, DeepRooms): its rooms by role, a way down from the room of the
// bottom level the purpose names (its `below`), its dwellers and its worst drawn for its depth, its treasure of that
// depth's tier. Its den is its warden's, drawn from the file's wardens by the site's key: a band of serious
// resistance lying on a hoard rolled on Deem's `carried` template (DeepCarried, the `hoard` kind), set down where the
// warden falls. Drawn by its own key, apart from the levels above, so that they are as they were.
// It is written with its site, eagerly, as the rest of the country is until SP-02's lazy materialization; nothing in
// it depends on the order the site is gone through.
// A warden: its kind of creature said with it (the sound it makes), as the deep's sounds read it.
export interface Warden extends DeepGroup { level: number; kind: string }
interface Below {
  level: DeepLevelSpec & { warden: string }; walks: string[]; roles: Record<string, DeepRole>;
  dwellers: DeepGroup[]; elites: DeepGroup[]; wardens: Warden[]; hoard: { seen: string; said: string };
}
export class DeepBelow {
  static readonly file = below as unknown as Below;
  static readonly q = JSON.stringify;
  // The purpose with its level below: the file's level after the makers' last, reached from the room the purpose
  // names, its dwellers and its worst at the new depth. A purpose that names no way down is as it was.
  static extend(purpose: DeepPurpose): DeepPurpose {
    const way = purpose.below, bottom = purpose.levels.at(-1);
    if (!way || !bottom) { return purpose; }
    const f = this.file, depth = purpose.levels.length;
    return { ...purpose, levels: [...purpose.levels, f.level],
      connectors: [...purpose.connectors, { kind: way.kind, from: [bottom.id, way.from],
        to: [f.level.id, f.level.spine[0]!], minutes: way.minutes, names: way.names }],
      roles: { ...f.roles, ...purpose.roles },
      dwellers: [...purpose.dwellers, { depth, groups: f.dwellers }],
      elites: [...purpose.elites ?? [], { depth, groups: f.elites }] };
  }
  // The level's warden, in its den, and the hoard it lies on.
  static lines(purpose: DeepPurpose, layout: DeepLayout, key: string): string[] {
    const level = layout.levels.find(l => l.id === `${layout.site}_${this.file.level.id}`);
    const den = level?.rooms.find(r => r.role === this.file.level.warden);
    if (!purpose.below || !level || !den) { return []; }
    const w = new Draw(`${key}:below:warden`).pick(this.file.wardens), q = this.q, id = `${level.id}_warden`;
    const hoard = `${level.id}_hoard`, varied = (w.variations ?? []).map(v => ` Variant ${v}.`).join('');
    return [`  Person ${id} ${q(w.label)} at ${den.id} { Role ${q(w.role)}. Species ${w.species}.${varied}`
      + ` Numbers ${w.count}. Level ${w.level}. Temperament ${w.temperament}. Lair ${den.id}. }`,
    `  Place ${hoard} "under the hoard" is room within ${level.id}.`,
    `  Observe ${id}_hoard_seen at ${den.id} when able(${id}) ${q(this.file.hoard.seen)}.`,
    ...DeepSounds.lines(layout, { id, room: den.id, temperament: w.temperament, elite: true,
      kind: w.kind }),
    ...DeepCarried.lines({ id, beyond: hoard, purpose, key: `${key}:below:hoard`, kind: 'hoard', depth: level.index,
      said: this.file.hoard.said })];
  }
}
