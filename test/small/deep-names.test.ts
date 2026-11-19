import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { RegionLand } from '../../src/world/region-land';

// Whoever a deep site's dead are heard to quote is no near-namesake of the golden route's people (cold play 4,
// CL-47's 14): the barrow's notebook said "A bar under the weight would free it, Brann says" to a player who had Bran's
// tally-stick in hand, and read it as Bran.
const read = (dir: string) => readdirSync(dir, { recursive: true }).map(String).filter(f => f.endsWith('.kyr'))
  .map(f => readFileSync(`${dir}/${f}`, 'utf8')).join('\n');
// The golden route's lives (the drove, the pans, the weir) and Iscoed's goings-on.
const route = ['data/origins/drove', 'data/origins/pans', 'data/origins/weir', 'data/goings-on/iscoed-drove',
  'data/goings-on/iscoed-gate', 'data/goings-on/iscoed-pans'].map(read).join('\n');
const cast = [...route.matchAll(/Person \w+ "([A-Z][a-z]+)/g)].map(m => m[1]!).filter(n => n !== 'Reeve');
describe('the names a deep site\'s dead quote', () => {
  it('are none the golden route\'s people could be taken for', () => {
    expect(cast).toContain('Bran');
    const quoted = readdirSync('data/generation/deep').filter(f => f.endsWith('.json'))
      .flatMap(f => [...readFileSync(`data/generation/deep/${f}`, 'utf8').matchAll(/\b([A-Z][a-z]+) says\b/g)].map(m => m[1]!));
    expect(quoted.length).toBeGreaterThan(0);
    expect(quoted.flatMap(q => cast.filter(c => RegionLand.confusable(q, c)).map(c => `${q} ~ ${c}`))).toEqual([]);
  });
});
