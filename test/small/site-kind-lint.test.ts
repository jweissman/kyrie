import { describe, expect, it } from 'bun:test';
import { SiteKindLint } from '../../src/cli/site-kind-lint';
import { KyrLint } from '../../src/cli/kyr-lint';

// A new kind of small site is said in three places (the Kyr requests' R39: the Silent Lord's author found a kind
// missing from one placed nowhere, and nothing said so): `kyrie lint` says which file it is missing from.
describe('the kinds of small site', () => {
  it('are said in all three places in data', () => {
    expect(SiteKindLint.findings(SiteKindLint.read(KyrLint.root))).toEqual([]);
  });
  it('says a kind missing from one, by the file', () => {
    const found = SiteKindLint.findings({ terrains: ['cave', 'folly'], nouns: ['cave'], scenes: ['cave', 'folly'] });
    expect(found.map(f => `${f.level} ${f.message}`)).toEqual(['error the site kind folly is missing from '
      + 'data/generation/tables/places.json (siteNoun): a kind is said in all three, or it is not placed']);
  });
});
