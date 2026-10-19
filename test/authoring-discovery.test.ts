import type { DeemValue } from 'deem';
import { describe, expect, it } from 'bun:test';
import { Discovery, type DiscoveryDefinition } from '../src/information/discovery';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { Content } from '../src/content';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { Scenarios } from '../web/scenarios';
import templates from '../data/sanctuary/templates.json';
import tables from '../data/sanctuary/tables.json';
import before from './fixtures/blackvein-authoring-before.json';

class Authorship {
  static manifest = 'data/sanctuary/campaign.json';
  static state(s: PlaySession) {
    return { world: s.campaign.world.describe().sort(), creatures: s.campaign.state.creatures,
      outcomes: s.campaign.state.outcomes, npc: s.campaign.events.flatMap(e => e.npc ?? []).map(n => ({
        actor: n.actor, goal: n.goal, action: n.action, elapsed: n.elapsed,
      })) };
  }
  static native() {
    const campaign = JSON.parse(Scenarios.files[this.manifest]!);
    campaign.modules[0].context = { direct: true };
    return new MemoryBundleSource({ ...Scenarios.files,
      [this.manifest]: JSON.stringify(campaign),
      'data/sanctuary/sanctuary.kyr': Scenarios.files['data/sanctuary/sanctuary.direct.kyr']!,
    });
  }
  static definition: DiscoveryDefinition = { id: 'oath', text: 'The founders offered refuge.',
    knownBy: [], deniedBy: ['cira'], sources: [{ id: 'charter', text: 'A founding charter', place: 'porch',
      readers: ['party'], speakers: ['cira'], destructible: true }] };
}

describe('coherent discovery authorship', () => {
  it('lowers native and generated definitions identically and exports ordinary inspectable Kyr', () => {
    const native = ModuleParser.parse(`Module example "Example" {
      Discovery oath "The founders offered refuge." {
        Denied by cira.
        Source charter "A founding charter" at porch readable by party spoken by cira destructible.
      }
      Goal false.
    }`);
    const generated = Discovery.describe([Authorship.definition]);
    expect(native.entities).toEqual(generated.entities);
    expect(native.initial).toEqual(generated.initial);
    expect(ModuleParser.parse(ModuleWriter.write(native))).toEqual(native);
    expect(native.initial.filter(c => c.call.name === 'knows')).toEqual([]); // offering is not acquired knowledge
  });
  it('rejects conflicting beliefs, duplicate entities, misspelled fields and invalid references', async () => {
    const d = Authorship.definition;
    expect(() => Discovery.describe([{ ...d, knownBy: ['cira'] }])).toThrow('knowledge');
    expect(() => Discovery.describe([d, d])).toThrow('duplicate');
    expect(() => Discovery.describe([{ ...d, sources: [{ ...d.sources[0]!, readers: [] }] }]))
      .toThrow('bindings');
    expect(() => Discovery.describe([{ ...d, knownby: ['cira'] } as DiscoveryDefinition])).toThrow('Unknown');
    expect(() => ModuleParser.parse('Module x "X" { Discovery f "F" { Known by a. Known by b. } Goal false. }'))
      .toThrow('Duplicate discovery');
    const session = await PlaySession.start(Authorship.manifest, 'oath', Scenarios.source());
    const source = ModuleWriter.write({ ...session.campaign.module, actions: session.campaign.schemas });
    const module = ModuleParser.parse(source);
    const malformed = Discovery.describe([{ id: 'bad', text: 'Bad reference', sources: [{
      id: 'bad_source', text: 'Invalid source', place: 'missing', readers: ['party'],
    }] }]);
    module.entities.push(...malformed.entities); module.initial.push(...malformed.initial);
    expect(() => new ModuleCompiler([{ name: 'combat', types: ['group'], exclusive: false }]).validate(module))
      .toThrow('Invalid argument missing');
  });
  it('composes independently bound source/reader/place overlays through the actual DEEM template', () => {
    const content = new Content('composition', Content.settingWith(tables as unknown as Parameters<typeof Content.settingWith>[0], templates));
    const alternate = [{ id: 'copy', text: 'A second copy', place: 'hall', readers: ['cira'] }];
    const generated = content.generate('information_unit', { _information: Authorship.definition as unknown as DeemValue, sources: alternate });
    expect(generated).toEqual({ ...Authorship.definition, sources: alternate });
    const lowered = Discovery.describe([generated as unknown as DiscoveryDefinition]);
    expect(lowered.initial.some(c => c.call.name === 'at' && c.call.args.join(',') === 'copy,hall')).toBe(true);
    expect(lowered.initial.some(c => c.call.name === 'mayExamine' && c.call.args.join(',') === 'cira,copy')).toBe(true);
    expect(lowered.entities.map(e => e.id)).toEqual(['oath', 'copy']);
  });
  it('executes the sanctuary through native and generated forms, with private learning, NPC action and reload', async () => {
    const generated = await PlaySession.start(Authorship.manifest, 'oath', Scenarios.source());
    const native = await PlaySession.start(Authorship.manifest, 'oath', Authorship.native());
    expect(Authorship.state(native)).toEqual(Authorship.state(generated));
    for (const s of [native, generated]) {
      expect(s.campaign.state.outcomes!['refuge.hall_open']).toBe(false);
      expect(PlayerView.observe(s.campaign).knowledge).toEqual([]);
      await s.perform('examine(refuge__charter)');
      expect(s.campaign.state.outcomes!['refuge.hall_open']).toBe(false); // Cira has not learned it
      const restored = PlaySession.resume(s.checkpoint());
      await s.perform('tell(refuge__cira,refuge__founding_oath)');
      await restored.perform('tell(refuge__cira,refuge__founding_oath)');
      expect(restored.canonical()).toBe(s.canonical());
      expect(s.campaign.events.at(-1)!.npc!.some(n => n.action.startsWith('open('))).toBe(true);
      await s.perform('travel(refuge__hall)');
      expect(s.campaign.running).toBe(true);
    }
    expect(Authorship.state(native)).toEqual(Authorship.state(generated));
  }, 30000);
  it.each(before.map(history => [history.name, history] as const))(
    'preserves pre-migration Blackvein %s behavior', async (_name, expected) => {
      const session = await PlaySession.start('data/blackvein/campaign.json', 'bells', Scenarios.source());
      await session.replay(expected.steps);
      expect(Authorship.state(session)).toEqual({ world: expected.world, creatures: expected.creatures,
        outcomes: expected.outcomes, npc: expected.npc });
    }, 60000);
});
