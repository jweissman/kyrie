import { describe, expect, it } from 'bun:test';
import { RegionZones } from '../src/world/region-zones';
import { RegionGeography } from '../src/world/region-geography';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Composition } from '../src/world/compose/composition';
import { WorldAssembler } from '../src/world/world-assembler';
import type { CreatureStore } from '../src/creature-store';

// The assembler as a partner to Deem: kits (data/kits/raider-hold, data/kits/bounty) placed into an authored region
// (test/fixtures/fells), with slots fixed by an author or bound by requirement and preference, dimensions proposed by
// Deem and checked against what is committed.
class Compose {
  static readonly fells = 'test/fixtures/fells/campaign.json';
  static readonly outlaws = 'test/fixtures/fells/outlaws.campaign.json';
  static readonly kit = '../../../data/kits/raider-hold/kit.json';
  // The fells' manifest with its kit entry replaced, as an in-memory campaign.
  static async variant(kit: Record<string, unknown>) {
    const source = NodeBundleSource.shared, path = source.resolve(this.fells);
    const manifest = JSON.parse(await source.read(path)) as { modules: Record<string, unknown>[] };
    manifest.modules = [...manifest.modules.filter(m => !('kit' in m)), { kit: this.kit, ...kit }];
    const at = source.resolve('test/fixtures/fells/variant.campaign.json');
    return { path: at, source: new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }) };
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
}

describe('composing kits', () => {
  it('builds the fells\' Hob-Knot from the raider-hold kit with every slot and dimension fixed by its author', async () => {
    const m = await ModuleBundle.campaign(Compose.fells, NodeBundleSource.shared, 'fells');
    const text = m.composition!.trace.text().join('\n');
    expect(text).toContain('approach = fells__knot_foot (fixed)');
    expect(text).toContain('folk: fixed hobs, accepted');
    expect(m.modules.map(x => x.id)).toEqual(expect.arrayContaining(['knotHold', 'knotFolk']));
    expect(m.composition!.ledger.holds('ambushes', 'knot__band', 'fells__barrows')).toBe(true);
  }, 60000);
  it('binds what a proposal implies even when the author fixed the proposal: the settlement the hobs robbed of its bell', async () => {
    const m = await ModuleBundle.campaign(Compose.fells, NodeBundleSource.shared, 'fells');
    const placement = m.composition!.placements[0]!;
    expect(placement.bindings.chapel).toBe('fells__market');
    expect(m.composition!.trace.text().join('\n')).toMatch(/chapel = fells__market \(score \d+, of \d+ considered\)/);
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('The bell is gone from its frame');
  }, 60000);
  it('refuses a fixing that breaks a hard requirement, and names it', async () => {
    const { path, source } = await Compose.variant({ id: 'bad', fix: { approach: 'fells.market' } });
    await expect(ModuleBundle.campaign(path, source, 'fells')).rejects.toThrow(/approach.*fells__market.*does not meet/);
  }, 60000);
  it('binds open slots by requirement and preference, and Deem fills the dimensions, the same way for the same seed', async () => {
    const { path, source } = await Compose.variant({ id: 'open' });
    const a = await ModuleBundle.campaign(path, source, 'one'), b = await ModuleBundle.campaign(path, source, 'one');
    const placed = a.composition!.placements[0]!;
    expect(b.composition!.placements[0]).toEqual(placed);
    // Whatever was chosen meets the kit's requirements: a free waypoint, a road within six hours, prey within eight.
    const ledger = a.composition!.ledger;
    expect(ledger.holds('waypoint', placed.bindings.approach!)).toBe(true);
    expect(ledger.number('hours', placed.bindings.road!, placed.bindings.approach!)).toBeLessThanOrEqual(6);
    expect(ledger.number('hours', placed.bindings.prey!, placed.bindings.approach!)).toBeLessThanOrEqual(8);
    expect(['hobs', 'outlaws']).toContain(placed.choices.folk!);
    // In mountains Deem proposes a cave three times in four; the trace says what it proposed and why it fits.
    expect(a.composition!.trace.text().join('\n')).toMatch(/hold: Deem proposes (cave|ringfort), accepted/);
  }, 60000);
  it('places a kit into a campaign already under way, taking nothing already taken', async () => {
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    await s.perform('wait_hour');
    const before = s.campaign.world.describe().filter(f => f.startsWith('at('));
    const later = await Composition.introduce(NodeBundleSource.shared.resolve(Compose.fells),
      { kit: Compose.kit, id: 'later' }, { seed: 'fells', source: NodeBundleSource.shared });
    expect(later.placement).toBeDefined();
    expect(later.placement!.bindings.approach).not.toBe('fells__knot_foot');
    for (const request of later.placement!.modules) { await s.campaign.install(request, NodeBundleSource.shared); }
    const after = s.campaign.world.describe().filter(f => f.startsWith('at('));
    expect(after).toEqual(expect.arrayContaining(before));
    expect(s.campaign.world.test(ModuleWriter.call('able', 'laterFolk__raiders'))
      || s.campaign.world.test(ModuleWriter.call('able', 'laterFolk__band'))).toBe(true);
  }, 120000);
});

describe('a kit that builds on another', () => {
  it('puts a price on the band an earlier placement put in the world, bound through the ledger', async () => {
    const m = await ModuleBundle.campaign(Compose.fells, NodeBundleSource.shared, 'fells');
    const price = m.composition!.placements.find(p => p.kit === 'bounty')!;
    expect(price.bindings).toEqual({ victim: 'fells__ford_green', power: 'knot__band', chief: 'knotFolk__chief',
      band: 'knotFolk__raiders', lair: 'fells__knot_foot' });
    expect(m.modules.find(x => x.id === 'pricePatron')!.imports).toMatchObject({ chief: 'knotFolk.chief', band: 'knotFolk.raiders' });
  }, 60000);
  it('pays when the band is broken, whichever patron Deem proposed', async () => {
    for (const patron of ['widow', 'elders']) {
      const source = NodeBundleSource.shared, path = source.resolve(Compose.fells);
      const manifest = JSON.parse(await source.read(path)) as { modules: Record<string, unknown>[] };
      manifest.modules = manifest.modules.map(x => x.id === 'price' ? { ...x, fix: { patron } } : x);
      const at = source.resolve(`test/fixtures/fells/fells-${patron}.campaign.json`);
      const s = await PlaySession.start(at, 'fells', new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }));
      Compose.put(s, 'fells__ford_green');
      await s.perform(Compose.legal(s).find(c => c.startsWith('pricePatron__offer'))!);
      // The offer says where the raiders hold out, and puts it on the company's map: somewhere to set out for.
      expect(s.campaign.world.test(ModuleWriter.call('leadsTo', 'pricePatron__price', 'fells__knot_foot'))).toBe(true);
      const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
      c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('routed', 'knotFolk__raiders') },
        { kind: 'assert', call: ModuleWriter.call('routed', 'knotFolk__gaffer') }]));
      await s.perform('wait');
      const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
      await s.perform(Compose.legal(s).find(c => c.startsWith('pricePatron__claim'))!);
      expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')) - gold).toBe(patron === 'widow' ? 15 : 25);
    }
  }, 120000);
});

describe('the raider-hold kit in play', () => {
  it('lets the hobs\' own stolen bell drive them off their gate', async () => {
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    Compose.put(s, 'knotHold__pit');
    await s.perform('field_spell(fells__member_party_3,conjure_light,fells__member_party_3)');
    await s.perform(Compose.legal(s).find(c => c.startsWith('take_out(knotFolk__handbell'))!);
    Compose.put(s, 'knotHold__ditch');
    const event = await s.perform(Compose.legal(s).find(c => c.startsWith('knotFolk__ring_bell'))!);
    expect([event.response, ...(event.perceptions ?? []).map(p => p.text)].join(' ')).toContain('run, howling');
    expect(Compose.legal(s)).toContain('go(knotHold__stake_gate,knotHold__yard)');
  }, 60000);
  // The hobs' plunder is theirs, as far as they are concerned: taken under the Gaffer's eyes it is not let go (PT-33:
  // "Don't touch nothing," and nothing came of touching).
  it('has the Gaffer object to his plunder taken under his eyes', async () => {
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    Compose.put(s, 'knotHold__pit');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'knotFolk__gaffer',
      c.world.one('at', 'knotFolk__gaffer')) }, { kind: 'assert', call: ModuleWriter.call('at', 'knotFolk__gaffer',
      'knotHold__pit') }]));
    await s.perform('field_spell(fells__member_party_3,conjure_light,fells__member_party_3)');
    const event = await s.perform(Compose.legal(s).find(x => x.startsWith('take_out(knotFolk__rings'))!);
    expect([event.response, ...(event.perceptions ?? []).map(p => p.text)].join(' ')).toContain('Said don\'t touch nothing');
    expect(s.campaign.world.test(ModuleWriter.call('hostile', 'knotFolk__gaffer', 'party'))).toBe(true);
  }, 60000);
  it('has outlaws who stop a company on their road by day, and let it go for road-money', async () => {
    const s = await PlaySession.start(Compose.outlaws, 'a', NodeBundleSource.shared);
    Compose.put(s, 'fells__alders');
    let stopped;
    for (let h = 0; h < 10 && !stopped; h++) {
      const e = await s.perform('wait_hour');
      if ([e.response, ...(e.perceptions ?? []).map(p => p.text)].join(' ').includes('Road-money')) { stopped = e; }
    }
    expect(stopped).toBeDefined();
    const pay = Compose.legal(s).find(c => c.startsWith('fellFolk__pay_road_money'))!;
    const paid = await s.perform(pay);
    expect(paid.combat).toHaveLength(0);
    expect(s.campaign.world.test(ModuleWriter.call('tolerates', 'fellFolk__band', 'party'))).toBe(true);
  }, 60000);
  it('lets a demand die with the men who made it', async () => {
    const s = await PlaySession.start(Compose.outlaws, 'a', NodeBundleSource.shared);
    Compose.put(s, 'fells__alders');
    const demanding = () => s.campaign.world.test(ModuleWriter.call('fellFolk__demanding', 'fellFolk__band'));
    for (let h = 0; h < 10 && !demanding(); h++) { await s.perform('wait_hour'); }
    expect(demanding()).toBe(true);
    const c = s.campaign as unknown as { creatures: CreatureStore;
      tickState: { definition: { actors: { id: string; members: string[] }[] } } };
    const band = c.tickState.definition.actors.find(a => a.id === 'fellFolk__band')!, lease = c.creatures.acquire(band.members);
    try {
      for (const m of lease.creatures) { m.state.hp = 0; }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    const told: string[] = [];
    for (let w = 0; w < 3; w++) { told.push(...((await s.perform('wait')).perceptions ?? []).map(p => p.text)); }
    expect(told.join(' ')).not.toContain('Have it your way');
    expect(demanding()).toBe(false);
    expect(Compose.legal(s).some(id => id.startsWith('fellFolk__pay_road_money'))).toBe(false);
  }, 60000);
});

describe('kits in generated regions', () => {
  async function generated(seed: string, terrain: string) {
    const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain } });
    const manifest = await ModuleBundle.campaign(world.path, world.source, seed);
    return { world, placement: manifest.composition!.placements[0]! };
  }
  it('holds the raiders off the roads, at a site or in the depths of wild country', async () => {
    const { world, placement } = await generated('fen', 'marsh'), region = world.report.region;
    const approach = placement.bindings.approach!.replace('region__', '');
    const off = [...region.sites.map(w => w.id), ...region.atlas!.zones.flatMap(z => z.parts.slice(1)
      .map((_, i) => RegionZones.room(z, i + 1)))];
    expect(off).toContain(approach);
    expect(RegionGeography.roads(region).map(r => r.way)).not.toContain(approach);
    const s = await PlaySession.start(world.path, 'fen', world.source);
    expect(s.campaign.module.entities.some(e => e.id.startsWith('raidersFolk__'))).toBe(true);
  }, 120000);
  it('realizes the kit differently in different regions, in who the raiders are and what their hold is', async () => {
    const marsh = await generated('fen', 'marsh'), mountain = await generated('tor', 'mountain');
    expect([marsh.placement.choices, mountain.placement.choices]).toEqual([
      { hold: 'ringfort', folk: 'hobs' }, { hold: 'cave', folk: 'outlaws' }]);
    // Different folk, different ways to deal with them: a bell for hobs, a challenge for outlaws.
    const s = await PlaySession.start(mountain.world.path, 'tor', mountain.world.source);
    expect(s.campaign.module.entities.some(e => e.id === 'raidersFolk__challenge')
      || s.campaign.module.actions.some(a => a.id === 'raidersFolk__challenge')).toBe(true);
  }, 180000);
});

