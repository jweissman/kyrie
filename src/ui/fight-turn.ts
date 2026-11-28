import type { CombatEvent, Fighter } from '../model';

// A fight the company cannot win by blows, seen in the fight itself once it has run a few rounds (OR-1858; cold round
// D4: three banshees resisting every weapon the company had, some sixteen rounds of misses and blunted blows, the
// reckoning honest beforehand, "It will be long: your weapons barely bite them", and the fight with no turn in it).
// By the third round, most of what the company has landed on its foes shrugged off (half or more of each blow, as
// DangerSense.grind reckons it before), and the foes keeping more than half their strength: the fight says so, and
// offers its way out beside the blow, as a fight reckoned grave does (ChoiceList.combat). Read from the fight's own
// blows, never from what the foes are said to be.
export class FightTurn {
  static readonly rounds = 3;
  static readonly landed = 2;
  static grind(events: readonly CombatEvent[], fighters: readonly Fighter[]): string | undefined {
    if (events.filter(e => e.type === 'initiative').length < this.rounds) { return undefined; }
    const ours = new Set(fighters.filter(f => f.team === 'fighters').map(f => f.id));
    const foes = fighters.filter(f => f.team !== 'fighters' && !f.summoner), against = new Set(foes.map(f => f.id));
    const landed = events.flatMap(e => e.type === 'damage' && ours.has(e.actor) && against.has(e.target)
      ? [e.modifiers?.resistance ?? 0] : []);
    const blunted = landed.filter(r => r >= 0.5).length;
    if (landed.length < this.landed || blunted * 2 <= landed.length) { return undefined; }
    const standing = foes.filter(f => f.hp > 0), strength = standing.reduce((t, f) => t + f.hp, 0);
    if (!standing.length || strength * 2 <= foes.reduce((t, f) => t + f.maxHp, 0)) { return undefined; }
    return standing.length > 1
      ? 'Your blows barely bite them, and they keep most of their strength: you could fall back.'
      : 'Your blows barely bite it, and it keeps most of its strength: you could fall back.';
  }
}
