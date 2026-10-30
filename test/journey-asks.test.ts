import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { Travel } from '../src/session/travel';

// A journey goes only by ways: the roads, tracks and paths the company has walked or been told of. Toward a place
// in wild country whose way in it does not know, it goes as far as the wild country's edge and stops there, saying
// so: striking out across country is the company's own choice, asked of it there, never the journey's (the play-
// structure investigation's PT-16: journeys "strike cross-country unasked"). Kite's Paliduslac, known by its name
// only, lies in Birchwood.
describe('a journey toward a place in wild country', () => {
  it('goes by known ways to the edge, and asks before going across country', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w3_named') }]));
    const traveller = { campaign: c, perform: (command: string) => s.perform(command) }, commands: string[] = [];
    let stopped: string | undefined;
    for (let tries = 0; tries < 6; tries++) {
      const done = await Travel.go(traveller, 'region__w3');
      commands.push(...done.legs.map(l => l.command));
      stopped = done.stopped;
      if (done.arrived || /^You know no way on/.test(stopped ?? '')) { break; }
      await s.perform('wait_hour');
    }
    expect(commands.length).toBeGreaterThan(0);
    expect(commands.every(x => x.startsWith('go('))).toBe(true);
    expect(stopped).toMatch(/^You know no way on to /);
  }, 120000);
});
