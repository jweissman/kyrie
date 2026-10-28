import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { GeneratedWorld } from './support/generated';

// A frost country's sky is cold unless it is something else, whatever the month (and any country's in winter): a
// journey out of a frozen town does not set out "with the dew still on the grass" (A Winter in Carth's friction 9,
// the register's CTH-09). Kite drawn as frost country, in the month of Sowing, to its second town.
describe('setting out in a frost country', () => {
  it('is told in the cold', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { region: { terrain: 'frost' },
      origin: 'debt', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), told: string[] = [];
    for (const [passage, to] of GeneratedWorld.path(s, `${w.report.region.settlements[1]!.id}_green`)) {
      const event = await s.perform(`go(${passage},${to})`);
      told.push(...(event.voiced ?? []).filter(v => v.kind === 'journey-depart').map(v => v.id));
    }
    expect(told.length).toBeGreaterThan(0);
    expect(told.every(id => /^journey-depart\.(cold|fog|rain|wind|grey|any)\b/.test(id))).toBe(true);
  }, 120000);
});
