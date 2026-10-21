import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import companies from '../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../src/content';

// Holt keep (the unquiet tower as the March installs it): several ways in, a hidden stair, a flooded drift, a ghost
// who answers to his name, and the drowned girl everything is for.
class Keep {
  static async start(company = 'fellowship') {
    const members = companies.companies.find(c => c.id === company)!.members as CreatureGenerationContext[];
    const s = await PlaySession.start('data/campaigns/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared, members);
    // Two of Nera's torches for Dori, then (as if the ferry had taken them across) to the foot of the tower.
    await this.walk(s, ['go(march__shop_door,march__shop_floor)', 'buy_item(march__nera_torch_1,march__member_party_3)',
      'buy_item(march__nera_torch_2,march__member_party_3)', 'go(march__shop_door,march__quay)']);
    this.put(s, 'east__tower_foot');
    return s;
  }
  // Moves the company without the walk, for tests about what is found there.
  static put(s: PlaySession, place: string) {
    const here = s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')!.args[1]!;
    const campaign = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    campaign.commit(campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', here) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  static async walk(s: PlaySession, commands: string[]) { for (const c of commands) { await s.perform(c); } }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static readonly crypt = ['go(tower__postern,tower__crypt)', 'use_item(march__nera_torch_1,march__member_party_3)'];
}

describe('Holt keep', () => {
  it('is entered by the postern, the well or the breach; the gate opens only when wound from inside, and stays open', async () => {
    const s = await Keep.start();
    // A locksmith opens the postern; the portcullis keeps the gate; nobody here climbs, so the breach is no way in.
    expect(Keep.legal(s)).toContain('go(tower__postern,tower__crypt)');
    expect(Keep.legal(s).some(c => c.startsWith('go(tower__gate') || c.startsWith('go(tower__breach'))).toBe(false);
    Keep.put(s, 'tower__bailey');
    await s.perform('change_thing(tower__winch_wind)');
    expect(Keep.fact(s, 'state', 'tower__portcullis', 'tower__raised')).toBe(true);
    await s.perform('go(tower__gate,east__tower_foot)');
    expect(Keep.legal(s)).toContain('go(tower__gate,tower__bailey)');
  }, 60000);
  it('lets a company that climbs come over the breach into the bailey, where a locksmith would take the postern', async () => {
    const pilgrims = await Keep.start('pilgrims');
    expect([Keep.legal(pilgrims).includes('go(tower__breach,tower__bailey)'),
      Keep.legal(pilgrims).includes('go(tower__postern,tower__crypt)')]).toEqual([true, false]);
    await pilgrims.perform('go(tower__breach,tower__bailey)');
    // Over the wall they are in the bailey, with the tower door ahead and no way to wind the gate.
    expect([Keep.legal(pilgrims).includes('go(tower__door,tower__hall)'),
      Keep.legal(pilgrims).some(c => c.startsWith('change_thing(tower__winch'))]).toEqual([true, false]);
  }, 60000);
  it('hides its back stair until someone finds the worn steps behind a niche', async () => {
    const s = await Keep.start();
    await Keep.walk(s, Keep.crypt);
    expect(Keep.legal(s)).not.toContain('go(tower__crypt_steps,tower__study)');
    await s.perform('examine(tower__worn_steps)');
    expect(Keep.legal(s)).toContain('go(tower__crypt_steps,tower__study)');
  }, 60000);
  it('keeps its strongroom behind black water: swum at a cost, or drained by someone told where the sluice is', async () => {
    const swum = await Keep.start();
    await Keep.walk(swum, [...Keep.crypt, 'go(tower__cistern_steps,tower__cistern)']);
    expect(Keep.legal(swum)).not.toContain('change_thing(tower__flood_drain)');
    await swum.perform('risk(tower__flood,march__member_party_2)');
    const gold = Keep.gold(swum);
    await swum.perform('change_thing(tower__chest_smash)');
    expect(Keep.gold(swum)).toBe(gold + 25);
    // The garrison plan in the stable tells where the sluice is; then the drift can be drained instead.
    const drained = await Keep.start();
    Keep.put(drained, 'tower__stable');
    await drained.perform('examine(tower__plan)');
    Keep.put(drained, 'tower__cistern');
    await drained.perform('use_item(march__nera_torch_1,march__member_party_3)');
    await drained.perform('change_thing(tower__flood_drain)');
    expect(Keep.legal(drained)).toContain('go(tower__drift,tower__strongroom)');
  }, 60000);
  it('has a captain who answers to the name in the garrison roll, and tells where the sluice is', async () => {
    const s = await Keep.start();
    Keep.put(s, 'tower__chapel');
    expect(Keep.legal(s)).not.toContain('tower__captain_named');
    Keep.put(s, 'tower__library');
    await s.perform('examine(tower__roll)');
    Keep.put(s, 'tower__chapel');
    await s.perform('tower__captain_named');
    expect([Keep.fact(s, 'knows', 'party', 'tower__sluice_known'), Keep.fact(s, 'at', 'tower__captain', 'tower__chapel')])
      .toEqual([true, false]);
  }, 60000);
  it('ends when the drowned girl is given her rest: the lantern goes out and the risen fall, without a blow', async () => {
    const s = await Keep.start();
    await Keep.walk(s, [...Keep.crypt, 'examine(tower__worn_steps)', 'go(tower__crypt_steps,tower__study)',
      'take_item(tower__key,march__member_party_2)', 'go(tower__crypt_steps,tower__crypt)', 'go(tower__cell_door,tower__cell)',
      'use_item(march__nera_torch_2,march__member_party_3)', 'change_thing(tower__maren_lay)']);
    expect([Keep.fact(s, 'tower__ended', 'tower__necromancer'), Keep.fact(s, 'state', 'tower__risen', 'tower__fallen')])
      .toEqual([true, true]);
  }, 60000);
  it('lets Sorgen call his sister back once he has the register; told what she asks, he puts out the lantern himself', async () => {
    const s = await Keep.start();
    // Left alone, Corvin brings him the register in the night; by morning she has her voice.
    while (!Keep.fact(s, 'state', 'tower__maren', 'tower__named') && s.campaign.state.elapsed < 200) { await s.perform('wait_hour'); }
    expect(Keep.fact(s, 'state', 'tower__maren', 'tower__named')).toBe(true);
    Keep.put(s, 'tower__cell');
    await s.perform('use_item(march__nera_torch_1,march__member_party_3)');
    await s.perform('tower__maren_asks');
    Keep.put(s, 'tower__study');
    await s.perform('tower__tell_him');
    expect([Keep.fact(s, 'tower__ended', 'tower__necromancer'), Keep.fact(s, 'serves', 'rising__digger', 'tower__necromancer')])
      .toEqual([true, false]);
  }, 120000);
});
