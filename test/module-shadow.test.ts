import { describe, expect, it } from 'bun:test';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { KyrLint } from '../src/cli/kyr-lint';

// An adventure's own names are its own, whatever the shared rules come to name. Found by an architecture review:
// the shared rules growing a name an adventure already used (guest, confided, light_lamp) made it a load error, so
// every addition to them could break every adventure written against them. The probe has a relation confided where
// the shared rules have a measure, a relation fellow of its own, and its own action light_lamp.
class Shadow {
  static readonly probe = resolve(import.meta.dir, 'fixtures/probes/shadow/probe.campaign.json');
  static errors(findings: Awaited<ReturnType<typeof KyrLint.campaign>>) {
    return findings.filter(f => f.level === 'error').map(f => f.message);
  }
}

describe('an adventure that names what the shared rules name', () => {
  it('loads, says which names are its own, and means its own by them', async () => {
    const findings = await KyrLint.campaign(Shadow.probe);
    expect(Shadow.errors(findings)).toEqual([]);
    expect(findings.filter(f => f.check === 'shadow').map(f => f.message.split(' is ')[0])).toEqual(
      ['p: confided', 'p: fellow', 'p: action light_lamp']);
    const s = await PlaySession.start(Shadow.probe, 'shadow', NodeBundleSource.shared);
    const light = PlayerView.choices(s.campaign).find(c => c.choice.name === 'Light the lamp on the pole')!;
    expect((await s.perform(light.choice.id)).result).toBe('success');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text))
      .toContain('The lamp is lit, and the barley knows you now.');
    expect(s.campaign.world.test(ModuleWriter.call('p__own_confided', 'party'))).toBe(true);
  }, 60000);
  // What the language's own constructs say (a company at a place, a thing in a state, a change of it) keeps the shared
  // meaning, though every shared name is the module's own.
  it('loads and plays though it declares every relation and measure the shared rules have', async () => {
    const shared = (await PlaySession.start(Shadow.probe, 'shadow', NodeBundleSource.shared)).campaign.module;
    const own = (names: { name: string }[], kind: string) => names.filter(f => !f.name.includes('__'))
      .map(f => `  ${kind} ${f.name}(group).`).join('\n');
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-shadow-'));
    try {
      cpSync(resolve(import.meta.dir, 'fixtures/probes/shadow'), dir, { recursive: true });
      writeFileSync(join(dir, 'site.kyr'), ['Module every "Every name its own" {', '  Place field "a field" is wilderness.',
        '  Place barley "the barley" is room within field at 0, 0.', '  Company party "You" of 1 at barley.',
        '  Thing gate "a gate" at barley { State shut blocking "The gate is shut.". State open "The gate stands open.".',
        '    Change open "Open the gate" from shut to open. }', '  Item ox "a little ox" is simple_ring at barley.',
        '  Observe quiet at barley when true "The barley is quiet.".',
        own(shared.relations, 'Relation'), own(shared.measures, 'Measure'), '}'].join('\n'));
      const findings = await KyrLint.campaign(join(dir, 'probe.campaign.json'));
      expect(Shadow.errors(findings)).toEqual([]);
      expect(findings.filter(f => f.check === 'shadow').length)
        .toBe([...shared.relations, ...shared.measures].filter(f => !f.name.includes('__')).length);
      const s = await PlaySession.start(join(dir, 'probe.campaign.json'), 'every', NodeBundleSource.shared);
      expect(PlayerView.observe(s.campaign).observations.map(o => o.text)).toContain('The barley is quiet.');
      const open = PlayerView.choices(s.campaign).find(c => c.choice.name === 'Open the gate')!;
      expect((await s.perform(open.choice.id)).result).toBe('success');
      expect(PlayerView.observe(s.campaign).observations.map(o => o.text)).toContain('The gate stands open.');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 120000);
});
