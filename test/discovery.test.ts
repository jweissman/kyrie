import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Content } from '../src/content';
import { Discovery } from '../src/information/discovery';
import { InformationView as View } from '../src/information/information-view';
import { ModuleAssembly, type SituationManifest } from '../src/campaign/module-assembly';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { World } from '../src/lang/world';
import { resolve } from 'node:path';
import templates from '../data/discovery/discovery.templates.json';
import tables from '../data/discovery/discovery.tables.json';
import source from '../data/discovery/glass-orchard.kyr' with { type: 'text' };
import direct from '../data/discovery/glass-orchard.direct.kyr' with { type: 'text' };
import adventure from '../data/rulesets/adventure.kyr' with { type: 'text' };
import discovery from '../data/rulesets/discovery.kyr' with { type: 'text' };

class Orchard {
  static path = resolve(import.meta.dir, '../data/discovery/orchard.campaign.json');
  static async create() { return Campaign.load(this.path, 'glass', NodeBundleSource.shared); }
  static test(c: Campaign, name: string, ...args: string[]) { return c.world.test(ModuleWriter.call(name, ...args)); }
  static follow(c: Campaign) {
    View.execute(c, 'travel(orchard__yard)'); View.execute(c, 'travel(orchard__glasshouse)');
  }
  static teach(c: Campaign) { View.execute(c, 'tell(orchard__orris,orchard__mirror_prisons)'); }
  static manifest(): SituationManifest {
    const setting = Content.settingWith(tables, templates);
    return new Content('glass:situation', setting).generate('orchard_situation') as unknown as SituationManifest;
  }
  static rules() {
    const a = ModuleParser.parse(adventure), d = ModuleParser.parse(discovery);
    return ModuleWriter.write({ ...a, kinds: [...a.kinds, ...d.kinds], relations: [...a.relations, ...d.relations],
      actions: [...a.actions, ...d.actions] });
  }
}

describe('bounded discovery and information transfer', () => {
  it('keeps objective truth, sources, private knowledge, mistaken belief and player visibility distinct', async () => {
    const c = await Orchard.create();
    expect(Orchard.test(c, 'established', 'orchard__mirror_prisons')).toBe(true);
    expect(Orchard.test(c, 'reveals', 'orchard__mirror', 'orchard__mirror_prisons')).toBe(true);
    expect(Orchard.test(c, 'knows', 'party', 'orchard__mirror_prisons')).toBe(false);
    expect(Orchard.test(c, 'assumesFalse', 'orchard__orris', 'orchard__mirror_prisons')).toBe(true);
    expect(Orchard.test(c, 'knows', 'orchard__orris', 'orchard__stair_plan')).toBe(true);
    const visible = View.observe(c), serialized = JSON.stringify(visible);
    expect(visible.knowledge).toEqual([]);
    expect(serialized).not.toContain('mirror_prisons');
    expect(serialized).not.toContain('stair_plan');
    expect(serialized).not.toContain('journal');
    expect(serialized).not.toContain('assumesFalse');
    expect(visible.sources.map(s => s.id)).toEqual(['orchard__mirror']);
    expect(visible.choices.map(choice => choice.id)).toContain('examine(orchard__mirror)');
    const before = c.save();
    expect(() => c.execute('tell(party,orchard__orris,orchard__mirror_prisons,orchard__gate)')).toThrow('Unavailable');
    expect(() => View.execute(c, 'examine(orchard__journal)')).toThrow('Unavailable');
    expect(() => c.execute('examine(party,orchard__journal,orchard__mirror_prisons,orchard__glasshouse)'))
      .toThrow('Unavailable');
    expect(c.save()).toEqual(before);
    View.execute(c, 'wait'); View.execute(c, 'wait'); View.execute(c, 'wait');
    expect(Orchard.test(c, 'at', 'orchard__orris', 'orchard__glasshouse')).toBe(true);
    expect(Orchard.test(c, 'knows', 'orchard__orris', 'orchard__mirror_prisons')).toBe(false);
  });
  it('teaches the examiner alone; truth or the player learning does not trigger NPC knowledge', async () => {
    const c = await Orchard.create();
    const visible = View.execute(c, 'examine(orchard__mirror)');
    expect(visible.knowledge.map(f => f.id)).toEqual(['orchard__mirror_prisons']);
    expect(JSON.stringify(visible)).not.toContain('stair_plan');
    expect(Orchard.test(c, 'knows', 'orchard__orris', 'orchard__mirror_prisons')).toBe(false);
    expect(Orchard.test(c, 'assumesFalse', 'orchard__orris', 'orchard__mirror_prisons')).toBe(true);
    Orchard.follow(c); View.execute(c, 'wait');
    expect(Orchard.test(c, 'at', 'orchard__orris', 'orchard__glasshouse')).toBe(true);
    expect(c.events.flatMap(e => e.npc ?? []).every(n => n.goal === 'keep_rounds')).toBe(true);
  });
  it('accepts either independent source and records corroboration without duplicating a known fact', async () => {
    for (const first of ['mirror', 'journal']) {
      const c = await Orchard.create();
      if (first === 'mirror') { View.execute(c, 'examine(orchard__mirror)'); }
      else { View.execute(c, 'destroy_source(orchard__mirror)'); }
      Orchard.follow(c); View.execute(c, 'examine(orchard__journal)');
      expect(View.observe(c).knowledge.map(f => f.id)).toEqual(['orchard__mirror_prisons']);
      expect(Orchard.test(c, 'learnedFrom', 'party', 'orchard__journal', 'orchard__mirror_prisons')).toBe(true);
      expect(Orchard.test(c, 'learnedFrom', 'party', 'orchard__mirror', 'orchard__mirror_prisons'))
        .toBe(first === 'mirror');
      Orchard.teach(c); View.execute(c, 'wait');
      expect(Orchard.test(c, 'at', 'orchard__orris', 'orchard__loft')).toBe(true);
    }
  });
  it('source destruction prevents future examination without erasing objective truth or acquired memory', async () => {
    let c = await Orchard.create();
    View.execute(c, 'destroy_source(orchard__mirror)');
    expect(View.observe(c).sources[0]!.intact).toBe(false);
    expect(() => View.execute(c, 'examine(orchard__mirror)')).toThrow('Unavailable');
    Orchard.follow(c); View.execute(c, 'destroy_source(orchard__journal)');
    expect(() => View.execute(c, 'examine(orchard__journal)')).toThrow('Unavailable');
    expect(Orchard.test(c, 'established', 'orchard__mirror_prisons')).toBe(true);
    expect(View.observe(c).knowledge).toEqual([]);
    c = Campaign.restore(JSON.parse(JSON.stringify(c.save())));
    expect(Orchard.test(c, 'intact', 'orchard__mirror')).toBe(false);
    expect(Orchard.test(c, 'intact', 'orchard__journal')).toBe(false);
    const remembered = await Orchard.create();
    View.execute(remembered, 'examine(orchard__mirror)');
    View.execute(remembered, 'destroy_source(orchard__mirror)');
    Orchard.follow(remembered); Orchard.teach(remembered);
    expect(Orchard.test(remembered, 'knows', 'orchard__orris', 'orchard__mirror_prisons')).toBe(true);
    expect(Orchard.test(remembered, 'toldBy', 'orchard__orris', 'party', 'orchard__mirror_prisons')).toBe(true);
  });
  it('requires co-location and explicit trust for reports, then changes the NPC course through acquired knowledge', async () => {
    const c = await Orchard.create();
    View.execute(c, 'examine(orchard__mirror)');
    const before = c.save();
    expect(() => Orchard.teach(c)).toThrow('Unavailable');
    expect(c.save()).toEqual(before);
    expect(c.events[0]!.npc![0]!.goal).toBe('keep_rounds');
    Orchard.follow(c);
    expect(Orchard.test(c, 'at', 'orchard__orris', 'orchard__glasshouse')).toBe(true);
    Orchard.teach(c);
    expect(Orchard.test(c, 'assumesFalse', 'orchard__orris', 'orchard__mirror_prisons')).toBe(false);
    expect(c.events.at(-1)!.npc![0]!).toMatchObject({ actor: 'orchard__orris', goal: 'reach_captives',
      action: 'travel(orchard__orris,orchard__glasshouse,orchard__yard)' });
    View.execute(c, 'wait');
    expect(Orchard.test(c, 'at', 'orchard__orris', 'orchard__loft')).toBe(true);
    const instance = ModuleAssembly.compose(source.replace('Initially Assert trusts(orris, party).', ''),
      Orchard.rules(), Orchard.manifest(), 'untrusted');
    const untrusted = new Campaign('untrusted', undefined, instance);
    untrusted.execute('examine(party,mirror,mirror_prisons,gate)');
    untrusted.execute('travel(party,gate,yard)'); untrusted.execute('travel(party,yard,glasshouse)');
    expect(() => untrusted.execute('tell(party,orris,mirror_prisons,glasshouse)')).toThrow('Unavailable');
    expect(Orchard.test(untrusted, 'knows', 'orris', 'mirror_prisons')).toBe(false);
  });
  it('preserves private learning and source loss through save/reload and replays identical histories', async () => {
    const first = await Orchard.create();
    View.execute(first, 'examine(orchard__mirror)'); View.execute(first, 'destroy_source(orchard__mirror)');
    const resumed = Campaign.restore(JSON.parse(JSON.stringify(first.save())));
    expect(View.observe(resumed)).toEqual(View.observe(first));
    for (const c of [first, resumed]) {
      Orchard.follow(c); Orchard.teach(c);
      View.execute(c, 'travel(orchard__yard)'); View.execute(c, 'travel(orchard__gate)');
      View.execute(c, 'travel(orchard__road)'); View.execute(c, 'wait');
      expect(Orchard.test(c, 'at', 'orchard__orris', 'orchard__loft')).toBe(true);
      expect(c.state.modules![0]!.deadline).toBeUndefined();
      expect(c.running).toBe(true);
    }
    expect(resumed.save()).toEqual(first.save());
    const replay = await Orchard.create();
    for (const command of ['examine(orchard__mirror)', 'destroy_source(orchard__mirror)',
      'travel(orchard__yard)', 'travel(orchard__glasshouse)', 'tell(orchard__orris,orchard__mirror_prisons)',
      'travel(orchard__yard)', 'travel(orchard__gate)', 'travel(orchard__road)', 'wait']) {
      View.execute(replay, command);
    }
    expect(replay.save()).toEqual(first.save());
  });
  it('uses one compositional DEEM constructor for different sources, facts, actors and places', () => {
    const setting = Content.settingWith(tables, templates);
    const bindings = tables.discoveryBindings.groups.orchard;
    const generated = Orchard.manifest();
    expect(generated.discoveries).toEqual(bindings);
    expect(generated.creatures).toHaveLength(2); expect(generated.actors.order).toHaveLength(2);
    for (const b of bindings) {
      expect(new Content('bindings', setting).generate('discovery', b)).toEqual(b);
      expect(new Content('bindings', setting).generate('discovery', { _binding: b })).toEqual(b);
    }
    const other = { actor: 'researcher', source: 'inscription', fact: 'lost_city', place: 'quarry' };
    expect(new Content('other', setting).generate('discovery', other)).toEqual(other);
    expect(Discovery.lower([other]).map(c => ModuleWriter.change(c))).toEqual([
      'Assert reveals(inscription, lost_city).', 'Assert at(inscription, quarry).', 'Assert intact(inscription).',
      'Assert noticeable(inscription).', 'Assert mayExamine(researcher, inscription).',
    ]);
  });
  it('lowers to existing Kyr declarations, matches direct authorship and rejects ambiguous or untrue sources', () => {
    const manifest = Orchard.manifest(), rules = Orchard.rules();
    const generated = ModuleAssembly.compose(source, rules, manifest, 'authored');
    const authored = ModuleAssembly.compose(direct, rules, { ...manifest, discoveries: [] }, 'authored');
    expect(new World(generated.module, generated.world).key()).toBe(new World(authored.module, authored.world).key());
    const expanded = ModuleWriter.write({ ...generated.module, actions: generated.campaign!.schemas! });
    const reparsed = new ModuleCompiler([{ name: 'combat', types: ['group'], exclusive: false }])
      .instantiate(ModuleParser.parse(expanded), 'inspection');
    expect(new World(reparsed.module, reparsed.world).key()).toBe(new World(generated.module, generated.world).key());
    expect(() => ModuleAssembly.compose(source.replace('Initially Assert established(mirror_prisons).', ''),
      rules, manifest, 'invalid')).toThrow('established');
    expect(() => ModuleAssembly.compose(source, rules, { ...manifest, discoveries: [...manifest.discoveries!,
      { actor: 'party', source: 'mirror', fact: 'stair_plan', place: 'gate' }] }, 'invalid')).toThrow('one fact');
  });
});
