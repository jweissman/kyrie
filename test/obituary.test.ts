import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Obituary } from '../src/narrative/obituary';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// How it came to this, when nobody is left standing, as the company would tell it: what it was doing when it was
// set upon, and who struck the last blow, by what the company knew them as. Found when a1's company was killed by
// the bone hounds of the king-barrow's mourners' hall while one of them reached for a cloak-pin, and the ending said
// "while you were busy: collect a gold cloak-pin" and named the killer "Knitted bone hound 1". One of a band is named
// by its place in the band, as a fight is told after it (see BandNames).
describe('the ending', () => {
  it('says what the company was about, and who killed it, as the company knew them', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'cleric' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source), hall = 'region__w8_halls_mourners';
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', hall) },
      { kind: 'retract', call: ModuleWriter.call('unlit', hall) }]));
    for (let i = 0; i < 12 && s.campaign.readout.creatures.some(x => s.campaign.readout.partyIds.includes(x.id)
      && x.state.hp > 0); i++) { await s.perform('wait'); }
    const told = Obituary.of(s.campaign);
    expect(told.title).toBe('Wenna is dead');
    expect(told.lines).toContain('You were set upon as you went to wait a while.');
    const blow = /^The (first|second) of the agile bone hounds struck the last blow/;
    expect(told.lines.some(l => blow.test(l))).toBe(true);
    expect(told.lines.join(' ')).not.toMatch(/hound \d/);
  }, 60000);
});
