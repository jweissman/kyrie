import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import companies from '../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../src/content';
import type { CreatureStore } from '../src/creature-store';

// The register of names: Sorgen's operations against the March, and what the company can do about them.
class March {
  // From Reedwake quay to the flood refuge's name room before noon on the first day.
  static readonly refuge = ['go(march__shop_door,march__shop_floor)', 'buy_item(march__nera_torch_1,march__member_party_3)',
    'go(march__shop_door,march__quay)', 'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
    'go(hill__yard_track,hill__yard)', 'go(hill__arch,hill__vestibule)', 'go(hill__workshop_door,hill__workshop)',
    'change_thing(hill__padlock_pick)', 'go(hill__stores_door,hill__stores)', 'go(hill__dry_stair,hill__hall)',
    'use_item(march__nera_torch_1,march__member_party_3)', 'go(hill__kitchen_door,hill__kitchen)',
    'examine(hill__crock_label)', 'risk(hill__crock,march__member_party_2)'];
  // From the name room, with the register, back to the Reedwake shrine.
  static readonly take = [...March.refuge, 'take_item(hill__register_copy,march__member_party_1)', 'go(hill__name_way,hill__kitchen)',
    'go(hill__kitchen_door,hill__hall)', 'go(hill__dry_stair,hill__stores)', 'go(hill__stores_door,hill__workshop)',
    'go(hill__workshop_door,hill__vestibule)', 'go(hill__arch,hill__yard)', 'go(hill__yard_track,march__ridge)',
    'go(march__ridge_track,march__causeway)', 'go(march__causeway_path,march__quay)', 'go(march__shrine_door,march__shrine)'];
  static async start() {
    const members = companies.companies.find(c => c.id === 'fellowship')!.members as CreatureGenerationContext[];
    return PlaySession.start('data/campaigns/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared, members);
  }
  static async walk(s: PlaySession, commands: string[]) { for (const c of commands) { await s.perform(c); } }
  static async until(s: PlaySession, tick: number) { while (s.campaign.state.elapsed < tick) { await s.perform('wait'); } }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static where(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === id)?.args[1];
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  // Moves the company without the walk, for tests about what is found there.
  static put(s: PlaySession, place: string) {
    const here = this.where(s, 'party')!;
    const campaign = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    campaign.commit(campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', here) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  static decisions(s: PlaySession) { return s.campaign.events.flatMap(e => e.npc ?? []); }
}

describe('the register of names: a power that acts while the company is elsewhere', () => {
  it('left alone, Sorgen takes the churchyard, gets the register, raises the compact and holds the roads by night', async () => {
    const s = await March.start();
    await March.until(s, 144);
    // Night one: the first warden called up out of his grave, and the sexton fled across the river.
    expect([March.where(s, 'rising__gravewarden'), March.where(s, 'east__agnes')]).toEqual(['east__churchyard', 'march__shrine']);
    expect(March.fact(s, 'holds', 'tower__necromancer', 'east__churchyard')).toBe(true);
    // Corvin went down the smugglers' path for the register and brought it back to his master.
    expect(March.fact(s, 'keeps', 'tower__necromancer', 'hill__register_copy')).toBe(true);
    expect(March.fact(s, 'rising__ransacked', 'hill__name_room')).toBe(true);
    // With the register in his hands, the first thing he did was call his sister back by her name.
    expect(March.fact(s, 'state', 'tower__maren', 'tower__named')).toBe(true);
    await March.until(s, 340);
    // Night two: Sorgen walked the corpse road and read the compact's founders up by name.
    expect([March.where(s, 'rising__compact'), March.where(s, 'tower__necromancer')]).toEqual(['hill__founders', 'tower__study']);
    await March.until(s, 400);
    // Night three: the founders walk the downs, across both roads off the ridge.
    expect(March.where(s, 'rising__compact')).toBe('march__ridge');
    expect([March.fact(s, 'watched', 'march__drove_road'), March.fact(s, 'watched', 'march__ridge_track')]).toEqual([true, true]);
  }, 120000);
  it('Sorgen broken after the founders rise ends his schemes, but the founders still walk the roads', async () => {
    const s = await March.start();
    await March.until(s, 340);
    expect(March.where(s, 'tower__necromancer')).toBe('tower__study');
    const world = s.campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'march__quay') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'tower__study') }]);
    (s.campaign as unknown as { commit(w: unknown): void }).commit(world);
    await s.perform('change_thing(tower__lantern_smash)');
    expect([March.fact(s, 'tower__ended', 'tower__necromancer'), March.fact(s, 'serves', 'rising__digger', 'tower__necromancer')])
      .toEqual([true, false]);
    await March.until(s, 400);
    expect(March.where(s, 'rising__compact')).toBe('march__ridge');
    expect(March.fact(s, 'watched', 'march__drove_road')).toBe(true);
  }, 120000);
  it('the churchyard rings, brought to Agnes, give the warden\'s name; said with the rites, it lays him without a fight', async () => {
    const s = await March.start();
    await March.walk(s, ['go(march__shop_door,march__shop_floor)', 'buy_item(march__nera_torch_1,march__member_party_3)',
      'go(march__shop_door,march__quay)']);
    await March.until(s, 150);
    expect(March.where(s, 'east__agnes')).toBe('march__shrine');
    // From Sorgen's bone store (the hound is left alone), the rings; then to Agnes, who fled to the Reedwake shrine.
    March.put(s, 'tower__ossuary');
    await s.perform('use_item(march__nera_torch_1,march__member_party_3)');
    await s.perform('take_item(tower__rings,march__member_party_1)');
    March.put(s, 'march__shrine');
    expect(March.legal(s)).toContain('give(tower__rings,east__agnes)');
    await s.perform('give(tower__rings,east__agnes)');
    await s.perform('rising__iron_band');
    March.put(s, 'east__churchyard');
    await s.perform('change_thing(rising__gravewarden_name_him)');
    expect([March.fact(s, 'state', 'rising__gravewarden', 'rising__laid'), March.fact(s, 'holds', 'tower__necromancer', 'east__churchyard')])
      .toEqual([true, false]);
    await March.until(s, 200);
    expect(March.where(s, 'east__agnes')).toBe('east__holt_green');
  }, 120000);
  it('a company that takes the register first leaves Corvin nothing to find, and the compact sleeps on', async () => {
    const s = await March.start();
    await March.walk(s, [...March.refuge, 'take_item(hill__register_copy,march__member_party_1)']);
    await March.until(s, 160);
    // Corvin came, went through the shelves for an hour, and went home with nothing; the shelves show it.
    expect(March.decisions(s).some(d => d.actor === 'rising__digger' && d.action.startsWith('rising__search_in_vain')))
      .toBe(true);
    expect(March.fact(s, 'rising__ransacked', 'hill__name_room')).toBe(true);
    expect(March.fact(s, 'keeps', 'tower__necromancer', 'hill__register_copy')).toBe(false);
    await March.until(s, 350);
    expect([March.where(s, 'rising__compact'), March.fact(s, 'rising__slumbers', 'rising__compact', 'hill__founders')])
      .toEqual(['rising__below_plinths', true]);
  }, 120000);
  it('given back to Iven, the register is held until Corvin comes by night; a company keeping watch catches him', async () => {
    const s = await March.start();
    await March.walk(s, March.take);
    expect(March.legal(s)).toContain('give(hill__register_copy,keepers__keeper)');
    await s.perform('give(hill__register_copy,keepers__keeper)');
    expect(March.fact(s, 'keeps', 'keepers__keeper', 'hill__register_copy')).toBe(true);
    expect(s.campaign.events.at(-1)!.perceptions!.some(p => p.text.includes('You have brought them home'))).toBe(true);
    await s.perform('keepers__custody_given');
    expect(March.fact(s, 'knows', 'party', 'keepers__custody_writ')).toBe(true);
    // Corvin searches the refuge in vain, goes home, and is sent again, by night, to the shrine. The company stays in
    // the shrine through the night: Corvin comes, and cannot take the register while they are there.
    await March.until(s, 270);
    expect(March.where(s, 'rising__digger')).toBe('march__shrine');
    expect(March.fact(s, 'keeps', 'keepers__keeper', 'hill__register_copy')).toBe(true);
    expect(March.legal(s)).toContain('attack(rising__digger)');
  }, 120000);
  it('a company waiting out the night in the shrine is roused when Corvin comes for the register', async () => {
    const s = await March.start();
    await March.walk(s, [...March.take, 'give(hill__register_copy,keepers__keeper)']);
    // Waiting an hour at a time by day and until first light by night: a long wait breaks off when someone arrives.
    let roused = '';
    for (let i = 0; i < 80 && !roused; i++) {
      const event = await s.perform(March.legal(s).includes('wait_for_light') ? 'wait_for_light' : 'wait_hour');
      if (event.response?.startsWith('You are interrupted')) { roused = event.response; }
    }
    expect(roused).toContain('Corvin');
    expect([March.where(s, 'rising__digger'), March.fact(s, 'keeps', 'keepers__keeper', 'hill__register_copy')])
      .toEqual(['march__shrine', true]);
    expect(March.legal(s)).toContain('attack(rising__digger)');
  }, 120000);
  it('the rites spoken over the founders\' plinths first leave nothing for Sorgen to call up', async () => {
    const s = await March.start();
    await March.walk(s, ['go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
      'go(hill__yard_track,hill__yard)']);
    // Dori keeps the rites; the founders' gallery is reached here by the keepers' stair for the test's sake.
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    expect(store.get('march__party_3').name).toBe('Dori');
    const world = s.campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'hill__yard') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'hill__founders') }]);
    (s.campaign as unknown as { commit(w: unknown): void }).commit(world);
    expect(March.legal(s)).toContain('rising__keep_custody(hill__founders)');
    await s.perform('rising__keep_custody(hill__founders)');
    await March.until(s, 360);
    expect(March.fact(s, 'rising__slumbers', 'rising__compact', 'hill__founders')).toBe(true);
    expect(March.decisions(s).some(d => d.action.startsWith('rising__complete_rite'))).toBe(false);
  }, 120000);
  it('the rites spoken while Sorgen reads the founders up break the rite, and he goes home with nothing', async () => {
    const s = await March.start();
    await March.until(s, 262);
    expect(March.fact(s, 'rising__chanting', 'tower__necromancer')).toBe(true);
    const world = s.campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'march__quay') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'hill__founders') }]);
    (s.campaign as unknown as { commit(w: unknown): void }).commit(world);
    // The company sees what is happening, and Dori speaks the keepers' rites over the plinths.
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('reading names into the dark');
    await s.perform('rising__keep_custody(hill__founders)');
    await March.until(s, 280);
    expect(March.decisions(s).some(d => d.goal === 'obstructed' && d.action.startsWith('rising__complete_rite'))).toBe(true);
    expect([March.fact(s, 'rising__slumbers', 'rising__compact', 'hill__founders'),
      March.fact(s, 'rising__disturbed', 'hill__founders'), March.fact(s, 'rising__chanting', 'tower__necromancer')])
      .toEqual([true, true, false]);
  }, 120000);
  it('the first warden destroyed frees the churchyard, and the sexton goes home by day', async () => {
    const s = await March.start();
    await March.until(s, 100);
    expect(March.fact(s, 'holds', 'tower__necromancer', 'east__churchyard')).toBe(true);
    // As if the company had fought him: the warden's creature is brought down.
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(['rising__gravewarden_person']);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    await March.until(s, 150);
    expect(March.fact(s, 'holds', 'tower__necromancer', 'east__churchyard')).toBe(false);
    expect([March.where(s, 'east__agnes'), March.fact(s, 'rising__fled', 'east__agnes')]).toEqual(['east__holt_green', false]);
  }, 120000);
  it('a campaign saved while Corvin is on the smugglers\' path resumes to the same world', async () => {
    const a = await March.start();
    await March.until(a, 30);
    expect(March.fact(a, 'travelling', 'rising__digger', 'rising__river_down')).toBe(true);
    const b = PlaySession.resume(JSON.parse(JSON.stringify(a.checkpoint())) as ReturnType<PlaySession['checkpoint']>);
    await Promise.all([March.until(a, 160), March.until(b, 160)]);
    expect(b.campaign.world.key()).toBe(a.campaign.world.key());
    expect(March.fact(b, 'keeps', 'tower__necromancer', 'hill__register_copy')).toBe(true);
  }, 120000);
});
