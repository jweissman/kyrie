import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from '../support/tiny';
import { Consequence } from '../../src/lang/index';

const source = readFileSync('data/adventures/sallowfield/parley.kyr', 'utf8');
const piece = (kind: 'Topic' | 'Action', id: string) => {
  const found = source.match(new RegExp(`  ${kind} ${id}\\b[\\s\\S]*?\\n  }`));
  if (!found) { throw new Error(`Missing Sallowfield ${id}`); }
  return found[0];
};

describe('a frightened prisoner gives the company a question', () => {
  it('opens the existing kindness and coercion choices without giving trivia or loot', async () => {
    const t = await Tiny.start(`
      Place yard "the cellar" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.
      Person lowes "Kit Lowes" at yard { Role "a captured scout". Peaceable. }
      Relation heldScout(group). Relation lowesAsked(group).
      Relation lowesKind(group). Relation lowesHard(group). Relation lowesBristled(group).
      Relation lowesGone(group). Relation lowesTruth(group).
      Entity fothergill_known: fact "Fothergill wants revenge; Wyre restrains him.".
      Initially Assert heldScout(lowes).
      ${piece('Topic', 'lowes_ask')}
      ${piece('Action', 'question_kindly')}
      ${piece('Action', 'question_hard')}`);
    const kindness = 'Tell the boy he will be fed and sent home when it is over';
    const coercion = 'Frighten it out of the boy';
    expect(t.journey.offers(kindness)).toBe(false);
    expect(t.journey.offers(coercion)).toBe(false);
    expect(Consequence.census(t.campaign.module).map(a => a.id)).not.toContain('t__lowes_ask');
    await t.perform('t__lowes_ask');
    expect(t.journey.offers(kindness)).toBe(true);
    expect(t.journey.offers(coercion)).toBe(true);
    expect(t.journey.holds('knows', 'party', 'fothergill_known')).toBe(false);
    await t.play(kindness);
    expect(t.journey.holds('lowesKind', 'party') || t.journey.holds('lowesBristled', 'party')).toBe(true);
  });
});
