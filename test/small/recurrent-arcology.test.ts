import { expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import type { Region } from '../../src/world/region-writer';
import { Terrain } from '../../src/world/land/terrain';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';

it('places the recurrent arcology on real unclaimed ground despite the unique-adventure exclusion list', async () => {
  const entries = await WorldAssembler.library(NodeBundleSource.shared, WorldAssembler.recurrent);
  expect(entries.map(e => e.manifest.id)).toContain('arcology');
  const installed = new Set<string>();
  for (let n = 0; n < 12; n++) {
    const region: Region = { name: `Country ${n}`, terrain: 'hills', ancestry: 'human', domain: 'craft',
      deity: 'berem', wonder: { kind: 'spring', description: 'a spring' },
      settlements: [{ id: 's0', name: 'Bookhaven', size: 'town', trade: 'grain', inn: 'the Dry Page',
        innkeeper: 'Wat', priest: 'Ann', merchant: 'Meg', traveller: 'Hal', calling: 'warrior', cell: 0 }],
      sites: [{ id: 'w0', name: 'the old dwelling', kind: 'ruin', hours: 1, cell: 10 }],
      atlas: { land: Terrain.make(`recurrence-${n}`, 'hills', { width: 5, height: 5 }),
        seats: [], ways: [], rivers: [], lakes: [], zones: [], borders: [] } };
    const placed = WorldAssembler.settle(region, [], { seed: `country-${n}`, rid: `r${n}`, rounds: [0, 0],
      exclude: ['arcology'], standing: entries }).placements;
    expect(placed).toHaveLength(1);
    expect(placed[0]).toMatchObject({ scenario: 'arcology', rid: `r${n}`, bindings: { works: 'w0' } });
    expect(placed[0]!.modules.every(id => !installed.has(id))).toBe(true);
    placed[0]!.modules.forEach(id => installed.add(id));
  }
});
