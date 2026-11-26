import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { NewsFold } from '../../src/ui/news-fold';
import type { Act } from '../../src/ui/screen-types';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';

// The first town knows less (the owner's playtest, 25 November: "First town still feels incredibly busy and like the
// character knows too much"; knowledge belongs to characters). The reference game's settlement keeps no roster of the
// road's strangers and posts no other country's errand, and hearsay is asked for as news, never by a matter the
// company has not heard of. The country's text only, no world.
const written = (seed: string) => {
  const region = WorldAssembler.region(seed, [0, 0]), t = region.settlements[0]!.id;
  return { t, text: RegionWriter.source(region, { size: 1, contacts: [] }, {}, CanonVocabulary.context()) };
};
describe('the first town', () => {
  it('has no traveller of the roads at its inn, nor a notice of another country\'s errand', () => {
    const { t, text } = written('s0');
    // The road's travellers camp by the road at its end here (they had stood at the inn, two strangers beside its two).
    expect(text).not.toMatch(new RegExp(`Person \\w+_way_t [^\\n]* at ${t}_taproom `));
    expect(text).not.toMatch(new RegExp(`Assert at\\(\\w+_way_t, ${t}_taproom\\)`));
    expect(text).toMatch(/Person \w+_way_t /);
    // No country's notice is nailed up in it ("Read the Watch's notice from Ombra", led at its inn).
    expect(text).not.toMatch(new RegExp(`Source \\w+_notice_${t} `));
  });
  it('asks a teller of hearsay for news, never about a thing the company has not heard of', () => {
    const ask = (n: number, about: string): Act => ({ key: `${n}`, label: `Ask Samwise about ${about}`, does: 'ask',
      command: `ask(s1_priest,word${n}__h1_s1_priest)` } as Act);
    const own: Act = { key: 'x', label: 'Ask Samwise about the old towers', does: 'ask', command: 'ask(s1_priest,towers)' } as Act;
    // One word of hearsay beside her own question (three or more fold whole, as before).
    const targets = new Map([['s1_priest', [ask(3, 'the silk from the sink at a cave in the hillside west of Oakhythe'),
      own]]]);
    NewsFold.of(targets, new Map([['s1_priest', 'Samwise, the priestess of Lugh']]));
    expect(targets.get('s1_priest')!.map(a => a.label).sort()).toEqual(['Ask Samwise about the old towers',
      'Ask Samwise for news']);
  });
});
