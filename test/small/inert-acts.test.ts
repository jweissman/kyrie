import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from '../support/tiny';
import { InertCensus } from '../support/inert-census';
import { Consequence } from '../../src/lang/consequence';
import { CampaignLint } from '../../src/cli/campaign-lint';
import { AuthorLint } from '../../src/cli/author-lint';

// Acts that change nothing that matters (the owner, 24 November, AU-56): an act or topic whose words are all it does,
// or that writes only what nothing else asks after (no rule, act, topic, observation, aim, ending or query, nor the
// shared rules and the engine), or only what its own condition asks. Counted over every authored adventure and held
// to a baseline that can only fall: a few set-pieces are the author's (the seals sung to on the skerry), and the
// plotting stays tight. A yard with a dog in it shows each kind; kyrie lint gives an act of them as advice.
const kept = JSON.parse(readFileSync(join(import.meta.dir, 'inert-acts.baseline.json'), 'utf8')) as
  { works: Record<string, string[]> };
const yard = `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
  Entity dog: entity "the dog". Entity cat: entity "the cat".
  Relation stroked(entity). Relation sung(entity). Relation fed(entity). Measure regard(entity).
  Action pat(actor: group) "Pat the dog" { Requires at(actor, yard). Result "He leans on you.". }
  Action stroke(actor: group) "Stroke the dog" { Requires at(actor, yard). On success { Assert stroked(dog). } }
  Action sing(actor: group) "Sing to the dog" { Requires at(actor, yard) and not sung(dog). On success { Assert sung(dog). } }
  Action feed(actor: group) "Feed the dog" { Requires at(actor, yard). On success { Assert fed(dog). } }
  Observe fed_dog at yard when fed(dog) "The dog is asleep in the sun.".
  Action praise(actor: group) "Praise the dog" { Requires at(actor, yard). On success { Increase regard(dog) by 1. } }
  Observe cat_fond at yard when regard(cat) >= 1 "The cat watches you.".`;
describe('acts that change nothing that matters', () => {
  it('tells words only, a fact nobody asks after, and one only its own condition asks, from an act that matters', async () => {
    const t = await Tiny.start(yard);
    expect(Consequence.census(t.campaign.module).map(x => `${x.why} ${x.id}`)).toEqual(['words t__pat',
      'unread t__stroke', 'self t__sing', 'unread t__praise']);
  });
  it('is told by kyrie lint as advice', async () => {
    const l = new CampaignLint('tiny', (await Tiny.start(yard)).session);
    AuthorLint.inert(l);
    expect(l.findings.map(f => `${f.level} ${f.check}`)).toEqual(Array(4).fill('advice inert'));
    expect(l.findings[1]!.message).toMatch(/Action t__stroke writes only what nothing asks after \(t__stroked\)/);
  });
  it('adds none to the authored adventures, and one mended leaves the baseline', async () => {
    const now = await InertCensus.all();
    for (const work of new Set([...Object.keys(now), ...Object.keys(kept.works)])) {
      const was = kept.works[work] ?? [], is = now[work] ?? [];
      expect([work, is.filter(x => !was.includes(x))]).toEqual([work, []]);
      expect([work, was.filter(x => !is.includes(x))]).toEqual([work, []]);
    }
  }, 30000);
});
