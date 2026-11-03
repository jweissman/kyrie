import { describe, expect, it, spyOn } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Countries } from '../src/world/countries';
import { RegionBorders } from '../src/world/region-borders';
import type { Region } from '../src/world/region-writer';
import { SettlementWriter } from '../src/world/settlement-writer';

// The country next door says what came of a country by which way it went there, where the country says which: the
// Quiet in the Sky's after said one thing whether the Daily came back or Halt was chosen, so it had been written to
// say neither (its friction 4, QIS-02).
describe('what comes down of a country seen through', () => {
  const after = { talk: 'Quiet still.', told: 'They say it is quiet.', by: { loud: { told: 'They say it is loud.' } } };
  const beyond = { name: 'Larum', terrain: 'mountain', rumour: 'Larum is quiet.', heard: 'Larum is quiet.', after };
  const region = { name: 'Thorn', settlements: [{ id: 's1', name: 'Thorn' }] } as unknown as Region;
  it('is told by the way the country marks, and else by its one word', () => {
    const standing = spyOn(SettlementWriter, 'standing').mockReturnValue('s1_taproom');
    const lines = RegionBorders.rumour({ room: 'gate_larum', way: 'the road west', seat: 0 }, beyond, region).join('\n');
    standing.mockRestore();
    expect(lines).toContain('Entity gate_larum_beyond_loud: fact');
    const quiet = new RegExp('Topic gate_larum_beyond_back_s1 with .* when stale\\(gate_larum_beyond\\)'
      + ' and not stale\\(gate_larum_beyond_loud\\) once \\{\n\\s+Says "They say it is quiet\\."');
    const loud = new RegExp('Topic gate_larum_beyond_back_s1_loud with .* when stale\\(gate_larum_beyond\\)'
      + ' and stale\\(gate_larum_beyond_loud\\) once \\{\n\\s+Says "They say it is loud\\."');
    expect(lines).toMatch(quiet);
    expect(lines).toMatch(loud);
  });
  it('is marked by each country that keys it, by a word it imports', () => {
    for (const c of Countries.list.filter(c => c.after?.by)) {
      const bundle = JSON.parse(readFileSync(`data/adventures/${c.bundle}`, 'utf8')) as { optional?: string[] };
      for (const way of Object.keys(c.after!.by!)) { expect(bundle.optional).toContain(`word_${way}`); }
    }
    expect(Countries.list.find(c => c.id === 'larum')?.after?.by?.loud).toBeDefined();
  });
});
