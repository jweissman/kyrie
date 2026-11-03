import type { CombatEvent, Fighter, Outcome } from '../model';

// When a side gives up a fight its world says it will (see Terms). A band half down breaking and running was tried
// for every band and taken out (the cold review's REV-16): authored fights wait on a band's fall (the corn-store rats
// paid for once not able, Skell's sons fallen), and a band fled stood able where it was. So it is a band's own, said
// of it by its author, and what it ends in (routed) is a fact the author's conditions read.
export class Morale {
  // A band that breaks (breaks): once half its number are down, the rest of it runs, all at once. A lone foe never
  // does; one that should give up is one that yields.
  static broken(fighters: Fighter[], departed: Fighter[]): Fighter[] {
    const all = [...fighters, ...departed].filter(f => f.team !== 'fighters' && !f.summoner);
    const standing = all.filter(f => fighters.includes(f) && f.hp > 0);
    return all.length >= 2 && standing.length > 0 && standing.length * 2 <= all.length ? standing : [];
  }
  // A bout to yielding (yields: Fair Weather's FWR-17, three village lads with their fists who killed or were killed;
  // the Quiet in the Sky's QIS-04, a sparring bout): whoever falls first in it is beaten, not killed, and is left with
  // a little life. Those who stood when it began, of either side; what was summoned does not count. The side that has
  // won, if the bout is over.
  static yielded(fighters: Fighter[], upright: Set<string>, at: { events: CombatEvent[]; turn: number }):
    Outcome | undefined {
    const fallen = fighters.filter(f => f.hp === 0 && upright.has(f.id) && !f.summoner);
    for (const f of fallen) {
      f.hp = 1;
      at.events.push({ type: 'revive', turn: at.turn, actor: f.id, target: f.id, detail: 'yields', amount: 1 });
    }
    const sides = new Set(fallen.map(f => f.team));
    return !sides.size ? undefined : sides.size > 1 ? 'draw' : sides.has('fighters') ? 'goblins' : 'fighters';
  }
}
