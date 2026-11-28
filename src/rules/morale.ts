import type { CombatEvent, Fighter, Outcome } from '../model';
import { Fighting } from './fighting';

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
  // Who of a band is to try their heart now, by the tests it has taken (tested, kept by the fight): a band half down
  // (the SRD's rule); and a band of beasts sooner, at the first of it fallen, as the old games try a pack at its first
  // death and again at half (B/X's morale): five rats had fought to the last over ten turns of a fight a warrior and a
  // halfling won with ease (cold round A1, OR-1855). Each test once in a fight; none for a lone foe, nor once none of
  // it stands.
  static due(fighters: Fighter[], departed: Fighter[], at: { tested: Set<string>; beasts: boolean }): Fighter[] {
    const all = [...fighters, ...departed].filter(f => f.team !== 'fighters' && !f.summoner);
    const standing = all.filter(f => fighters.includes(f) && f.hp > 0);
    if (all.length < 2 || !standing.length) { return []; }
    const test = standing.length * 2 <= all.length ? 'half' : at.beasts && standing.length < all.length ? 'first'
      : undefined;
    if (!test || at.tested.has(test)) { return []; }
    at.tested.add(test);
    if (test === 'half') { at.tested.add('first'); }
    return standing;
  }
  // The SRD's morale (the DMG's optional rule, faithful to it): once half a band is down, each of it standing makes a
  // DC 10 Wisdom save, and whoever fails it flees; whoever makes it fights on. A band is tested once in a fight.
  // Only a band its author has said nothing of (Terms.morale), and only thinking creatures (see Battle): a pack, the
  // dead and the made fight on.
  static readonly courage = 10;
  static shaken(band: { f: Fighter; wisdom: number }[],
    at: { turn: number; events: CombatEvent[]; dice: { number(expression: string): number } }): Fighter[] {
    return band.filter(({ f, wisdom }) => {
      const die = at.dice.number('1d20'), modifier = Fighting.statMod(wisdom), rolled = die + modifier;
      const success = rolled >= Morale.courage;
      at.events.push({ type: 'save', turn: at.turn, actor: f.id, target: f.id, rolled, difficulty: Morale.courage,
        success, die, stat: 'wisdom', modifier, kind: 'morale' });
      return !success;
    }).map(b => b.f);
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
