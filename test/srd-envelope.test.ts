import { describe, expect, it } from 'bun:test';
import { SrdFights } from './support/srd-fights';

// The combat envelope (§1's acceptance): rounds to defeat against a reference party of four of the creature's
// challenge, over twenty seeds, reported and not gated (the numbers are recorded in
// doc/architecture/mission-21/rules/srd-invariants.md). A divergence is a rule to name, not a number to tune.
describe('the combat envelope', () => {
  it.each([['ghoul', 1], ['unicorn', 3]] as const)('of the %s against four of level %d', (kind, level) => {
    const runs = Array.from({ length: 20 }, (_, n) => SrdFights.fight(kind, level, `${kind}-${n}`));
    const won = runs.filter(r => r.won), rounds = won.map(r => r.rounds).sort((a, c) => a - c);
    console.log(`${kind} vs four of level ${level}: won ${won.length}/20, rounds to defeat median ${rounds[
      Math.floor(rounds.length / 2)] ?? '-'} (${rounds[0] ?? '-'}–${rounds.at(-1) ?? '-'})`);
    expect(runs.length).toBe(20);
  });
});
