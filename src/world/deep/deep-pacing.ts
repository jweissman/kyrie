import world from '../../../data/generation/scenes/orsino-world.json';
import { Draw } from '../land/draw';
import { CreatureVariants } from '../../creature-variants';
import { RegionMarvels, type Trap } from '../region-marvels';
import type { DungeonTables } from '../../registry/orsino-world';
import type { DeepGroup, DeepPurpose } from './deep-purposes';
import type { DeepLayout, DeepLevel, DeepLink, DeepRoom } from './deep-layout';

// Who is met in a room: a group of a depth's dwellers, at a level, perhaps with an aspect; an elite is fewer and
// stronger.
export interface DeepDwellers { id: string; group: DeepGroup; level: number; aspect?: string; elite?: boolean }
// What a room holds, by its place in its level's run (Orsino's room guide: entrance, mob, trap, treasure, elite…).
export interface DeepContent {
  room: DeepRoom; guide: string; dwellers?: DeepDwellers; trap?: { way: DeepLink; trap: Trap; key: string };
  treasure?: { items: string[]; coin: number }; riddle?: string; wonder?: string; special?: boolean;
}

// How a deep site is paced, as Orsino paced a dungeon (roomSequences, roomOverlays): each level takes a run of room
// guides by its flavour (standard, dangerous, lucrative, balanced), given out along the level from where it is
// entered; each guide gives the odds of a fight, a trap, a riddle, a wonder and how much treasure. What is met rises
// with depth: Orsino's challenge (one at the top, one more for each level, more again a third of the way along each
// run), aspects rarer and stronger deeper, traps that do more harm the deeper they are set, treasure of a better
// tier. The deepest room is the keeper's.
export class DeepPacing {
  static readonly tables = (world as unknown as { dungeon: DungeonTables }).dungeon;
  static readonly flavors = ['standard', 'dangerous', 'lucrative', 'balanced'];
  // The most harm a trap may do on an average roll, by depth: a short fall at the top, a long one at the bottom.
  static readonly caps = [10.5, 17.5, 28, 45];
  // Treasure tiers by depth: Orsino's draw (mostly negligible or minor) at the top, a tier better each level down.
  static readonly tiers = ['negligible', 'minor', 'major', 'grand', 'legendary'];
  static plan(purpose: DeepPurpose, layout: DeepLayout, key: string): DeepContent[] {
    return layout.levels.flatMap(level => this.level({ purpose, layout, level }, new Draw(`${key}:pace:${level.index}`)));
  }
  private static level(at: { purpose: DeepPurpose; layout: DeepLayout; level: DeepLevel }, draw: Draw): DeepContent[] {
    const { purpose, layout, level } = at, order = this.order(layout, level);
    const sequence = draw.pick(this.tables.sequences[draw.pick(this.flavors)]!);
    const groups = draw.shuffle(this.groups(purpose.dwellers, level.index));
    const elites = draw.shuffle(this.groups(purpose.elites ?? purpose.dwellers, level.index));
    // The keeper's rooms are its own: nothing else lives where it does, or where it goes to ground.
    const kept = new Set(['heart', purpose.keeper.refuge]), laid = new Set<string>();
    return order.map(({ room, way }, i) => {
      const guide = i === 0 ? 'entrance' : sequence[i % sequence.length]!, odds = this.tables.overlays[guide]!;
      const content: DeepContent = { room, guide };
      if (draw.next() < odds.encounter && groups.length && !kept.has(room.role)) {
        content.dwellers = this.dwellers({ room, groups: odds.challenging ? elites : groups, depth: level.index, i },
          !!odds.challenging, draw);
      }
      if (way && !way.between && draw.next() < odds.trap) { content.trap = this.trap(way, level.index, draw, laid); }
      if (draw.next() < odds.puzzle) { content.riddle = this.riddle(level.index, draw); }
      if (draw.next() < odds.wonder) { content.wonder = draw.pick(this.wonders(purpose)); }
      content.treasure = this.treasure({ purpose, depth: level.index }, odds.treasure, draw);
      if (guide === 'special') { content.special = true; }
      return content;
    });
  }
  // The rooms of a level in the order they are reached from where it is entered (the first room a connector from
  // above arrives in, or the first of its spine), each with the way it is first reached by.
  static order(layout: DeepLayout, level: DeepLevel): { room: DeepRoom; way?: DeepLink }[] {
    const ids = new Set(level.rooms.map(r => r.id));
    const arrival = layout.links.find(l => l.between && ids.has(l.b) && !ids.has(l.a))?.b ?? level.rooms[0]!.id;
    const seen = new Map<string, DeepLink | undefined>([[arrival, undefined]]);
    for (const queue = [arrival]; queue.length;) {
      const here = queue.shift()!;
      for (const l of layout.links.filter(x => !x.between && (x.a === here || x.b === here))) {
        const there = l.a === here ? l.b : l.a;
        if (!seen.has(there)) { seen.set(there, l); queue.push(there); }
      }
    }
    return [...seen].map(([id, way]) => ({ room: level.rooms.find(r => r.id === id)!, ...way ? { way } : {} }));
  }
  private static groups(table: { depth: number; groups: DeepGroup[] }[], depth: number): DeepGroup[] {
    const rows = [...table].sort((a, b) => Math.abs(a.depth - depth) - Math.abs(b.depth - depth));
    return [...rows[0]?.groups ?? []];
  }
  // Orsino's challenge for a room: the run's level, one more each level down (as each dungeon of Orsino's module is
  // one more than the last), more a third of the way along; an elite two higher still, fewer, of a rarer aspect.
  private static dwellers(at: { room: DeepRoom; groups: DeepGroup[]; depth: number; i: number }, elite: boolean,
    draw: Draw): DeepDwellers {
    const { room, groups, depth, i } = at, group = groups.shift()!;
    groups.push(group);
    const level = 1 + depth + Math.max(0, Math.round(i / 3) - 1) + (elite ? 2 : 0);
    const tier = elite ? (depth > 1 ? 'epic' : 'rare') : depth === 0 ? 'common' : depth === 1 ? draw.pick(['common', 'uncommon'])
      : draw.pick(['uncommon', 'rare']);
    const aspected = elite || draw.next() < 0.3 + 0.2 * depth;
    const list = CreatureVariants.table.rarity[tier] ?? CreatureVariants.table.rarity.common!;
    // Orsino's wildtype is the kind as it is, with nothing to say of it: drawn like the rest, and not told.
    const aspect = aspected && group.species ? draw.pick(list) : undefined;
    return { id: `${room.id}_dwellers`, level, ...aspect && aspect !== 'wildtype' ? { aspect } : {},
      ...elite ? { elite: true } : {},
      group };
  }
  // A level's traps are of as many mechanisms as it can have: not two pressure plates where one room's ways meet.
  private static trap(way: DeepLink, depth: number, draw: Draw, laid: Set<string>): DeepContent['trap'] {
    const floor = depth ? this.caps[depth - 1]! : 0, cap = this.caps[Math.min(depth, this.caps.length - 1)]!;
    const fitting = RegionMarvels.within(cap).filter(([, t]) => RegionMarvels.harm(t.effect!) > floor * 0.6);
    const fresh = fitting.filter(([, t]) => !laid.has(t.mechanism));
    const [key, trap] = draw.pick(fresh.length ? fresh : fitting.length ? fitting : RegionMarvels.traps);
    laid.add(trap.mechanism);
    return { way, trap, key };
  }
  // Orsino's riddle difficulty, by depth: easy at the top, deadly at the bottom.
  private static riddle(depth: number, draw: Draw): string {
    return (['easy', 'medium', 'hard', 'deadly'] as const)[Math.min(3, depth + (draw.next() < 0.25 ? 1 : 0))]!;
  }
  // The wonders that would be in a place like it, of those Kyr can run; any of them, if its purpose does not say.
  private static wonders(purpose: DeepPurpose): string[] {
    const within = RegionMarvels.wonders.filter(([, w]) => w.where === 'within').map(([k]) => k);
    const fit = within.filter(k => purpose.wonders?.includes(k));
    return fit.length ? fit : within;
  }
  // Orsino's treasure for a room, at Orsino's odds for its guide (a treasure room is generous, an empty one is not)
  // and of the depth's tier (mostly the lesser of the depth's two); what it is, its purpose says: what its makers and
  // those after them would have left there; else Orsino's own tier. And coin.
  private static treasure(at: { purpose: DeepPurpose; depth: number }, generosity: number, draw: Draw):
    { items: string[]; coin: number } {
    const { purpose, depth } = at, low = this.tiers[Math.min(depth, 3)]!, better = this.tiers[Math.min(depth + 1, 4)]!;
    // No better than the purpose has: a mine of the Delvers has no Orsino legendary hoard at its bottom.
    const high = !purpose.finds || purpose.finds[better] ? better : low;
    const tier = draw.next() < 0.8 ? low : high;
    const list = purpose.finds?.[tier] ?? this.tables.treasure[tier] ?? [];
    const own = (purpose.valuables?.[tier] ?? []).map(v => v.id);
    const count = (draw.next() < 0.3 * generosity ? 1 : 0) + (draw.next() < 0.06 * generosity ? 1 : 0);
    // Most of what is worth carrying home is the makers' own; the rest is gear left lying.
    return { items: Array.from({ length: Math.min(count, list.length) },
      () => own.length && draw.next() < 0.6 ? draw.pick(own) : draw.pick(list)),
      coin: Math.round((1 + draw.int(20) + 2 * depth * 5) * generosity) };
  }
}
