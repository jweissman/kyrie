import { describe, expect, it } from 'bun:test';
import { Introduced } from '../../src/presentation/introduced';
import type { Exchange } from '../../src/presentation/narrator';
import type { Glance } from '../../src/presentation/glance-types';
import type { Screen } from '../../src/ui/screen-types';

// A danger named by the glance as the company comes is not named again by what it does (cold play 5, CL-37's 19:
// "The rats under the corn-store are here, each a brown rat … / The rats under the corn-store stand their ground").
const rats = { id: 'rats', name: 'the rats under the corn-store', kind: 'creature', many: true };
const glance = { life: { text: 'The rats under the corn-store are here, each a brown rat of the barns.', subject: 'rats',
  danger: true } } as unknown as Glance;
const exchange = (text: string): Exchange => ({ lines: [{ text, kind: 'event' }], notes: [], tone: 'act' });
const said = (leaf: { exchange: Exchange; glanced?: { unsaid?: string[] } }, people = [rats]) =>
  Introduced.said(leaf, glance, { people } as unknown as Pick<Screen, 'people'>).exchange.lines.map(l => l.text);
describe('a danger the glance has named', () => {
  it('is "They" in what it does next, not named again', () => {
    expect(said({ exchange: exchange('The rats under the corn-store stand their ground and watch you.') }))
      .toEqual(['They stand their ground and watch you.']);
  });
  it('keeps its name where the glance did not name it first, or is someone, or the line is held back', () => {
    const line = 'The rats under the corn-store stand their ground and watch you.';
    expect(said({ exchange: exchange(line), glanced: { unsaid: [line] } })).toEqual([line]);
    expect(said({ exchange: exchange(line) }, [{ ...rats, kind: 'person' }])).toEqual([line]);
    expect(said({ exchange: exchange('Gesk sneers.') })).toEqual(['Gesk sneers.']);
  });
});

// And a band is named so that "… are here" reads: "Rats in the cellar are here." (cold play 5, CL-37's 19).
describe('a band a generated place is written with', () => {
  it('is named with its article', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const files = readdirSync('data/generation', { recursive: true }).map(String).filter(f => f.endsWith('.kyrt'));
    const bare = files.flatMap(f => [...readFileSync(`data/generation/${f}`, 'utf8')
      .matchAll(/Person \{\w\}_\w+ "([a-z][^"]*)"/g)].map(m => m[1]!))
      .filter(n => !/^(the|a|an|some|two|three|four) /.test(n));
    expect(bare).toEqual([]);
  });
});
