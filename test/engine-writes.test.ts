import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { KyrLint } from '../src/cli/kyr-lint';
import { readdirSync, readFileSync } from 'node:fs';
import { EngineWrites } from '../src/campaign/engine-writes';

// What only the engine writes is not a constant of the world. The Patient Star's "Let Saro hold on" waits on whoever
// joined as Saro (joinedAs), and lint, holding a list of the engine's writes of its own without it, said the action
// could never be taken. The probe's company of one asks Wil Hobb to join, and can then thank him.
describe('an action that waits on someone having joined', () => {
  const probe = 'test/fixtures/probes/joined/probe.campaign.json';
  it('is not called impossible by lint', async () => {
    expect((await KyrLint.campaign(probe)).filter(f => f.check === 'applicability')).toEqual([]);
  }, 60000);
  it('is offered once they have joined', async () => {
    const s = await PlaySession.start(probe, 'joined', NodeBundleSource.shared);
    const choice = (name: string) => PlayerView.choices(s.campaign).find(c => c.choice.name.startsWith(name));
    expect(choice('Thank Wil for coming')).toBeUndefined();
    await s.perform(choice('Ask Wil Hobb')!.choice.id);
    expect((await s.perform(choice('Thank Wil for coming')!.choice.id)).result).toBe('success');
  }, 60000);
});

// What the engine writes, lint and the world audit know (the architecture review's M1, from its probe
// engine-written): an action waiting on a fire's exposing a place, or on a witness to an attack, was called
// impossible, and two names nothing writes were listed. The list is read against the engine itself: every relation
// it asserts as play goes is on it (what it writes as a world is made, its constants, is not).
describe('what the engine writes', () => {
  it('is every relation the engine asserts as play goes', () => {
    const asserted = /kind: 'assert'(?: as const)?, call: ModuleWriter\.call\('([A-Za-z_]+)'/g;
    const found = new Set<string>();
    for (const dir of ['src/campaign', 'src']) {
      for (const file of readdirSync(dir).filter(f => f.endsWith('.ts'))) {
        for (const line of readFileSync(`${dir}/${file}`, 'utf8').split('\n').filter(l => !/initial\.push/.test(l))) {
          for (const m of line.matchAll(asserted)) { found.add(m[1]!); }
        }
      }
    }
    expect([...found].filter(n => !EngineWrites.names.has(n))).toEqual([]);
    expect(EngineWrites.names.has('defeated')).toBe(false);
  });
  it('lint knows: an action waiting on what the engine writes can be taken, one on what nothing writes cannot', async () => {
    const findings = await KyrLint.campaign('test/fixtures/probes/engine-written/probe.campaign.json');
    const impossible = findings.filter(f => /no possible target/.test(f.message)).map(f => f.message);
    expect(impossible.filter(m => /sift|answer/.test(m))).toEqual([]);
    expect(impossible.some(m => /gloat/.test(m))).toBe(true);
  }, 60000);
});
