import { Canon } from '../../canon/canon';
import { Draw } from '../land/draw';
import { DeepHistory } from './deep-history';
import { DeepRooms } from './deep-rooms';
import { Stones } from './stones';
import type { DeepLayout, DeepRoom } from './deep-layout';
import type { DeepPurpose } from './deep-purposes';

// The words a purpose gives its walled-up cache (data/generation/deep/<art>.json, cache): the room it is off, what
// gives it away there, and how each way of finding it is told. Every key is a placeholder of rooms.kyrt's `cache`.
export type CacheWords = Record<string, string> & { role: string };

// A deep site's cache (the sites commission, item 1): off a room of its second level, a chamber someone after the
// makers walled up, with what they meant to come back for: something to fight in or with, something to use, a thing
// of worth or two, and what they wrote of it in the kingdom's letters, which teaches who came after the makers. Its
// cue is in the room's look; it is found by search, lore or force (rooms.kyrt). What it holds is drawn by kind, not
// by tier alone, so that it is worth keeping and not only selling.
export class DeepCache {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, purpose: DeepPurpose,
    at: { values: Record<string, string>; key: string }): string[] {
    const words = (purpose as DeepPurpose & { cache?: CacheWords }).cache;
    const room = words && layout.levels[1]?.rooms.find(r => r.role === words.role);
    if (!words || !room) { return []; }
    const level = layout.levels[1]!, id = `${room.id}_cache`, [x, y] = this.free(level.rooms, room);
    const filled = Object.fromEntries(Object.entries(words).map(([k, v]) => [k, DeepHistory.fill(v, at.values)]));
    return [...DeepRooms.section('cache', { ...filled, id, room: room.id, level: level.id, x: String(x), y: String(y) }),
      ...this.kept(purpose, `${at.key}:cache`).map((kind, n) =>
        `  Item ${id}_kept${n} ${this.q(DeepRooms.called(kind, purpose))} is ${kind} at ${id}_chamber.`)];
  }
  // What was put by: an arm or armour, a thing of use, and one or two of the makers' own valuables (or a stone).
  static kept(purpose: DeepPurpose, key: string): string[] {
    // Of the second level's tier (minor): a cache put by, not a hoard (SI-07: what one trip brings home).
    const draw = new Draw(key), tiers = Stones.tiers.minor ?? [];
    const arms = this.of(tiers, ['weapon', 'armor']), use = this.of(tiers, ['tool', 'gear', 'consumable', 'equipment']);
    const own = (purpose.valuables?.minor ?? []).map(v => v.id);
    return [...arms.length ? [draw.pick(arms)] : [], ...use.length ? [draw.pick(use)] : [],
      ...own.length ? [draw.pick(own)] : [], ...own.length > 1 && draw.chance(0.5) ? [draw.pick(own)] : []];
  }
  private static of(kinds: string[], categories: string[]): string[] {
    return kinds.filter(k => categories.includes(Canon.items[k]?.category ?? ''));
  }
  // The chamber's cell: the nearest the room's own not taken by another room of its level.
  private static free(rooms: DeepRoom[], room: DeepRoom): [number, number] {
    const taken = new Set(rooms.map(r => `${r.x},${r.y}`));
    const near: [number, number][] = [[0, -1], [0, 1], [1, -1], [-1, 1], [1, 1], [-1, -1], [0, -2], [0, 2]];
    for (const [dx, dy] of near) {
      if (!taken.has(`${room.x + dx},${room.y + dy}`)) { return [room.x + dx, room.y + dy]; }
    }
    return [room.x, room.y + 3];
  }
}
