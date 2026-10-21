import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Composition } from '../src/world/compose/composition';
import { WorldAssembler } from '../src/world/world-assembler';

// The assembler as a partner to Deem: kits placed into the Varrow (data/kits/raider-hold), with slots fixed by an
// author or bound by requirement and preference, dimensions proposed by Deem and checked against what is committed.
class Compose {
  static readonly varrow = 'data/campaigns/varrow.campaign.json';
  static readonly outlaws = 'test/fixtures/varrow-outlaws/campaign.json';
  // The Varrow's manifest with its kit entry replaced, as an in-memory campaign.
  static async variant(kit: Record<string, unknown>) {
    const source = NodeBundleSource.shared, path = source.resolve(this.varrow);
    const manifest = JSON.parse(await source.read(path)) as { modules: Record<string, unknown>[] };
    manifest.modules = [...manifest.modules.filter(m => !('kit' in m)), { kit: '../kits/raider-hold/kit.json', ...kit }];
    const at = source.resolve('data/campaigns/varrow-variant.campaign.json');
    return { path: at, source: new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }) };
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
}

describe('composing kits', () => {
  it('builds the Varrow\'s Hob-Knot from the raider-hold kit with every slot and dimension fixed by its author', async () => {
    const m = await ModuleBundle.campaign(Compose.varrow, NodeBundleSource.shared, 'varrow');
    const text = m.composition!.trace.text().join('\n');
    expect(text).toContain('approach = varrow__knot_foot (fixed)');
    expect(text).toContain('folk: fixed hobs, accepted');
    expect(m.modules.map(x => x.id)).toEqual(expect.arrayContaining(['knotHold', 'knotFolk']));
    expect(m.composition!.ledger.holds('ambushes', 'knot__band', 'varrow__barrows')).toBe(true);
  }, 60000);
  it('binds what a proposal implies even when the author fixed the proposal: the settlement the hobs robbed of its bell', async () => {
    const m = await ModuleBundle.campaign(Compose.varrow, NodeBundleSource.shared, 'varrow');
    const placement = m.composition!.placements[0]!;
    expect(placement.bindings.chapel).toBe('varrow__market');
    expect(m.composition!.trace.text().join('\n')).toMatch(/chapel = varrow__market \(score \d+, of \d+ considered\)/);
    const s = await PlaySession.start(Compose.varrow, 'varrow', NodeBundleSource.shared);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('The bell is gone from its frame');
  }, 60000);
  it('refuses a fixing that breaks a hard requirement, and names it', async () => {
    const { path, source } = await Compose.variant({ id: 'bad', fix: { approach: 'varrow.market' } });
    await expect(ModuleBundle.campaign(path, source, 'varrow')).rejects.toThrow(/approach.*varrow__market.*does not meet/);
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
    const s = await PlaySession.start(Compose.varrow, 'varrow', NodeBundleSource.shared);
    await s.perform('wait_hour');
    const before = s.campaign.world.describe().filter(f => f.startsWith('at('));
    const later = await Composition.introduce(NodeBundleSource.shared.resolve(Compose.varrow),
      { kit: '../kits/raider-hold/kit.json', id: 'later' }, { seed: 'varrow', source: NodeBundleSource.shared });
    expect(later.placement).toBeDefined();
    expect(later.placement!.bindings.approach).not.toBe('varrow__knot_foot');
    for (const request of later.placement!.modules) { await s.campaign.install(request, NodeBundleSource.shared); }
    const after = s.campaign.world.describe().filter(f => f.startsWith('at('));
    expect(after).toEqual(expect.arrayContaining(before));
    expect(s.campaign.world.test(ModuleWriter.call('able', 'laterFolk__raiders'))
      || s.campaign.world.test(ModuleWriter.call('able', 'laterFolk__band'))).toBe(true);
  }, 120000);
});

describe('a kit that builds on another', () => {
  it('puts a price on the band an earlier placement put in the world, bound through the ledger', async () => {
    const m = await ModuleBundle.campaign(Compose.varrow, NodeBundleSource.shared, 'varrow');
    const price = m.composition!.placements.find(p => p.kit === 'bounty')!;
    expect(price.bindings).toEqual({ victim: 'varrow__ford_green', power: 'knot__band', chief: 'knotFolk__chief',
      band: 'knotFolk__raiders' });
    expect(m.modules.find(x => x.id === 'pricePatron')!.imports).toMatchObject({ chief: 'knotFolk.chief', band: 'knotFolk.raiders' });
  }, 60000);
  it('pays when the band is broken, whichever patron Deem proposed', async () => {
    for (const patron of ['widow', 'elders']) {
      const source = NodeBundleSource.shared, path = source.resolve(Compose.varrow);
      const manifest = JSON.parse(await source.read(path)) as { modules: Record<string, unknown>[] };
      manifest.modules = manifest.modules.map(x => x.id === 'price' ? { ...x, fix: { patron } } : x);
      const at = source.resolve(`data/campaigns/varrow-${patron}.campaign.json`);
      const s = await PlaySession.start(at, 'varrow', new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }));
      Compose.put(s, 'varrow__ford_green');
      await s.perform(Compose.legal(s).find(c => c.startsWith('pricePatron__offer'))!);
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
    const s = await PlaySession.start(Compose.varrow, 'varrow', NodeBundleSource.shared);
    Compose.put(s, 'knotHold__pit');
    await s.perform('field_spell(varrow__member_party_3,conjure_light,varrow__member_party_3)');
    await s.perform(Compose.legal(s).find(c => c.startsWith('take_out(knotFolk__handbell'))!);
    Compose.put(s, 'knotHold__ditch');
    const event = await s.perform(Compose.legal(s).find(c => c.startsWith('knotFolk__ring_bell'))!);
    expect([event.response, ...(event.perceptions ?? []).map(p => p.text)].join(' ')).toContain('run, howling');
    expect(Compose.legal(s)).toContain('go(knotHold__stake_gate,knotHold__yard)');
  }, 60000);
  it('has outlaws who stop a company on their road by day, and let it go for road-money', async () => {
    const s = await PlaySession.start(Compose.outlaws, 'a', NodeBundleSource.shared);
    Compose.put(s, 'varrow__switchbacks');
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
});

describe('kits in generated regions', () => {
  async function generated(seed: string, terrain: string) {
    const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain } });
    const manifest = await ModuleBundle.campaign(world.path, world.source, seed);
    return { world, placement: manifest.composition!.placements[0]! };
  }
  it('asks Deem for one more site when the region\'s scenarios have taken every one the kit could use', async () => {
    const { world, placement } = await generated('fen', 'marsh');
    expect(world.report.requests[0]).toMatch(/raiders: .*nothing can be approach.*; Deem proposes .+ \(\w+\)/);
    expect(placement.bindings.approach).toBe(`region__w${world.report.region.sites.length}`);
    const s = await PlaySession.start(world.path, 'fen', world.source);
    expect(s.campaign.module.entities.some(e => e.id.startsWith('raidersFolk__'))).toBe(true);
  }, 120000);
  it('realizes the kit differently in different regions, in who the raiders are and what their hold is', async () => {
    const marsh = await generated('fen', 'marsh'), mountain = await generated('pike', 'mountain');
    expect([marsh.placement.choices, mountain.placement.choices]).toEqual([
      { hold: 'ringfort', folk: 'hobs' }, { hold: 'cave', folk: 'outlaws' }]);
    // Different folk, different ways to deal with them: a bell for hobs, a challenge for outlaws.
    const s = await PlaySession.start(mountain.world.path, 'pike', mountain.world.source);
    expect(s.campaign.module.entities.some(e => e.id === 'raidersFolk__challenge')
      || s.campaign.module.actions.some(a => a.id === 'raidersFolk__challenge')).toBe(true);
  }, 180000);
});

