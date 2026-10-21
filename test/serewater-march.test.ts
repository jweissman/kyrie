import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

class March {
  static readonly manifest = 'data/campaigns/serewater-march.campaign.json';
  static readonly skellfold = 'data/campaigns/skellfold.campaign.json';
  static async start(manifest: string, ...commands: string[]) {
    const s = await PlaySession.start(manifest, 'serewater', NodeBundleSource.shared);
    for (const c of commands) { await this.perform(s, c); }
    return s;
  }
  // Torches from Nera, carried by Elen; the refuge and the ossuary are dark.
  static readonly torches = ['go(march__shop_door,march__shop_floor)', 'buy_item(march__nera_torch_1,march__member_party_1)',
    'buy_item(march__nera_torch_2,march__member_party_1)', 'buy_item(march__nera_torch_3,march__member_party_1)',
    'go(march__shop_door,march__quay)'];
  // A player in the dark lights the next torch when a step needs seeing.
  static async perform(s: PlaySession, command: string) {
    if (!this.legal(s).includes(command) && this.fact(s, 'benighted', 'party')) {
      const torch = this.legal(s).find(c => c.startsWith('use_item(march__nera_torch_'));
      if (torch) { await s.perform(torch); }
    }
    return s.perform(command);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static where(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === id)?.args[1];
  }
  // Over the ridge, through the upper works and down the dry stair, into the refuge's name room.
  static readonly toNameRoom = [...March.torches, 'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
    'go(hill__yard_track,hill__yard)', 'go(hill__arch,hill__vestibule)', 'go(hill__workshop_door,hill__workshop)',
    'change_thing(hill__padlock_pick)', 'go(hill__stores_door,hill__stores)',
    'take_item(hill__line_cache,march__member_party_1)', 'equip_item(hill__line_cache,march__member_party_1)',
    'go(hill__dry_stair,hill__hall)', 'go(hill__kitchen_door,hill__kitchen)', 'risk(hill__crock,march__member_party_2)'];
  static readonly lantern = ['take_item(hill__names_lantern,march__member_party_3)',
    'equip_item(hill__names_lantern,march__member_party_3)'];
  // Down the concealed stair to the court, out by the cleft and the chalk fault, home past the boar.
  static readonly outByChalk = ['examine(hill__lantern_letters)', 'go(hill__hidden_stair,hill__crypt)',
    'go(hill__cleft,hill__founders)', 'go(hill__chalk_passage,hill__chalk)', 'examine(hill__survey_scratches)',
    'go(hill__chalk_fault,hill__drain_mouth)', 'change_thing(hill__boar_pass)', 'go(hill__low_path,march__causeway)',
    'go(march__causeway_path,march__quay)', 'go(march__shrine_door,march__shrine)'];
}

describe('Censer Hill, reconstructed', () => {
  it('composes a region, an institution, a site and two situations into one world', async () => {
    const s = await March.start(March.manifest);
    expect(s.campaign.installations.map(m => m.id)).toEqual(['march', 'keepers', 'hill', 'rescue', 'salvage', 'east',
      'sink', 'brood', 'tower', 'word']);
    expect(March.where(s, 'hill__custodian')).toBe('hill__court');
    expect(March.where(s, 'keepers__keeper')).toBe('march__shrine');
    expect(March.where(s, 'salvage__prize')).toBe('hill__hoist');
    expect(March.fact(s, 'assumesFalse', 'keepers__keeper', 'keepers__register_survives')).toBe(true);
  }, 30000);
  it('needs the lantern of names to read the concealed stair', async () => {
    const dark = await March.start(March.manifest, ...March.toNameRoom);
    expect(March.legal(dark)).not.toContain('examine(hill__lantern_letters)');
    await March.perform(dark, March.lantern[0]!); await March.perform(dark, March.lantern[1]!);
    expect(March.legal(dark)).toContain('examine(hill__lantern_letters)');
    expect(March.legal(dark).some(c => c.includes('hidden_stair'))).toBe(false);
    await dark.perform('examine(hill__lantern_letters)');
    expect(March.legal(dark)).toContain('go(hill__hidden_stair,hill__crypt)');
  }, 60000);
  it('opens the vault lawfully: the register persuades the keeper, whose writ the Custodian honours', async () => {
    const s = await March.start(March.manifest, ...March.toNameRoom, ...March.lantern, 'examine(hill__register_pages)',
      'examine(hill__lantern_letters)', 'go(hill__hidden_stair,hill__crypt)', 'go(hill__court_arch,hill__court)');
    expect(March.legal(s)).not.toContain('change_thing(hill__custodian_admit)');
    expect(March.legal(s)).not.toContain('go(hill__vault_gate,hill__vault)');
    await March.perform(s, 'go(hill__court_arch,hill__crypt)');
    for (const c of March.outByChalk.slice(2)) { await March.perform(s, c); }
    expect(March.legal(s)).toContain('keepers__writ');
    await s.perform('keepers__writ');
    expect(March.fact(s, 'knows', 'party', 'keepers__custody_writ')).toBe(true);
    expect(March.fact(s, 'assumesFalse', 'keepers__keeper', 'keepers__register_survives')).toBe(false);
    for (const c of ['go(march__shrine_door,march__quay)', 'go(march__causeway_path,march__causeway)',
      'go(hill__low_path,hill__drain_mouth)', 'go(hill__chalk_fault,hill__chalk)', 'go(hill__chalk_passage,hill__founders)',
      'go(hill__cleft,hill__crypt)', 'go(hill__court_arch,hill__court)', 'change_thing(hill__custodian_admit)',
      'go(hill__vault_gate,hill__vault)']) { await March.perform(s, c); }
    expect(March.where(s, 'party')).toBe('hill__vault');
    expect(March.fact(s, 'able', 'hill__custodian')).toBe(true);
    expect(s.campaign.events.some(e => e.action.startsWith('attack'))).toBe(false);
  }, 120000);
  it('remembers a learned way out, and a guardian can be dealt with from either end of its passage', async () => {
    const s = await March.start(March.manifest, ...March.toNameRoom, ...March.lantern,
      ...March.outByChalk.slice(0, 6));
    expect(March.where(s, 'party')).toBe('hill__drain_mouth');
    expect(March.legal(s)).toContain('change_thing(hill__boar_pass)');
    expect(March.legal(s)).toContain('go(hill__chalk_fault,hill__chalk)');
  }, 60000);
});

describe('salvage against the dead', () => {
  it('installs in two settings with the same rules and different people', async () => {
    const river = await March.start(March.manifest), quarry = await March.start(March.skellfold);
    const schemas = (s: PlaySession) => s.campaign.schemas.filter(a => a.id.startsWith('salvage__')).map(a => a.id).sort();
    expect(schemas(river)).toEqual(schemas(quarry));
    const name = (s: PlaySession, id: string) => s.campaign.module.entities.find(e => e.id === id)?.name;
    expect(name(river, 'salvage__salvager')).toContain('Edda');
    expect(name(quarry, 'salvage__salvager')).toContain('Corran');
    expect(March.where(river, 'salvage__offering')).toBe('hill__vault');
    expect(March.where(quarry, 'salvage__offering')).toBe('world__drowned_drift');
  }, 60000);
  it('the salvager goes home when the permit runs out, and selling grave goods costs the warden\'s help', async () => {
    const s = await March.start(March.skellfold, 'go(world__beck_path,world__lane_foot)', 'go(world__beck_lane,world__quarry_floor)',
      'go(world__smithy_door,world__smithy)', 'take_item(world__coil,world__member_party_1)', 'go(world__smithy_door,world__quarry_floor)',
      'go(world__adit_mouth,world__adit)', 'go(world__gallery_way,world__upper_gallery)', 'change_thing(world__ladder_brace)',
      'go(world__ladder_shaft,world__lower_gallery)', 'go(world__drift_seal,world__drowned_drift)',
      'take_item(salvage__offering,world__member_party_2)');
    const expires = s.campaign.world.number(ModuleWriter.call('salvage__expiresAt', 'salvage__permit'));
    for (let i = 0; i < 80 && !March.fact(s, 'salvage__departed', 'salvage__salvager'); i++) { await s.perform('wait'); }
    expect(s.campaign.state.elapsed).toBeGreaterThanOrEqual(expires);
    expect(March.where(s, 'salvage__salvager')).toBe('world__green');
    for (const c of ['go(world__drift_seal,world__lower_gallery)', 'go(world__ladder_shaft,world__upper_gallery)',
      'go(world__gallery_way,world__adit)', 'go(world__adit_mouth,world__quarry_floor)',
      // Snow has closed the beck lane by now (Caught Below's closing way); the fell track is the long way round.
      'go(world__fell_descent,world__fell_track)', 'go(world__fell_climb,world__green)']) { await s.perform(c); }
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await s.perform('salvage__sell_offering(party,world__member_party_2,world__green)');
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + 10);
    expect(March.legal(s)).not.toContain('salvage__deliver_prize(party,world__member_party_2,world__green)');
    await s.perform('go(world__chapel_door,world__chapel)');
    expect(March.fact(s, 'refusesService', 'world__sexton', 'party')).toBe(true);
    expect(March.legal(s).some(c => c.startsWith('take_healing(world__sexton'))).toBe(false);
  }, 180000);
});
