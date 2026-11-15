import type { Promoted } from './glance-types';

// One foreground menu of at most four items (the owner, 15 November: every gameplay action is committed through one
// of four; nothing beside them is another bank of buttons). The rows a scene draws beside its acts (the way out and the
// way on of an enclosed place, a way back) are items of the four: the acts give way to them, never the other way, and
// what matters stays: the urgent first, then the aim's next step (gold), then the scene's order.
export class Foreground {
  static readonly four = 4;
  static fit(acts: Promoted[], beside: number): Promoted[] {
    const room = Math.max(1, this.four - beside);
    if (acts.length <= room) { return acts; }
    const urgent = [...acts.filter(a => a.tier === 0), ...acts.filter(a => a.continues)];
    const keep = new Set<Promoted>(urgent.slice(0, room));
    for (const a of acts) { if (keep.size < room) { keep.add(a); } }
    return acts.filter(a => keep.has(a));
  }
}
