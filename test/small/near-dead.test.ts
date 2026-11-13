import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// What someone does is not done once they are dead: the Gaffer had come off his fleeces and stretched after his death
// (WM-01, the world forgets). What is told of their death, near them, still is. A shearing yard, its old shearer alive
// or dead by the second hour, and the flies that come to a body.
const yard = (dies: boolean) => `
  Place yard "the shearing yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person gaffer "the Gaffer" at yard { Role "the old shearer". Ancestry human. Peaceable. Pronouns he. }
  Event gaffer_rises near gaffer when watch(clock) >= 3 "The Gaffer comes off his fleeces and stretches.".
  Event gaffer_flies near gaffer when dead(gaffer) and watch(clock) >= 3 "Flies have found the Gaffer.".
  ${dies ? 'Rule gaffer_dies when watch(clock) >= 1 and not dead(gaffer) { Slay gaffer. }' : ''}
  Observe y at yard when true "A shearing yard.".
  Goal false.`;
const told = async (dies: boolean) => {
  const t = await Tiny.start(yard(dies));
  await t.perform('wait_hour');
  return (t.leaf.exchange?.lines ?? []).map(l => l.text);
};

describe('one who is dead', () => {
  it('does nothing more, and what is told of their death still is', async () => {
    expect(await told(false)).toContain('The Gaffer comes off his fleeces and stretches.');
    const dead = await told(true);
    expect(dead).not.toContain('The Gaffer comes off his fleeces and stretches.');
    expect(dead).toContain('Flies have found the Gaffer.');
  });
});
