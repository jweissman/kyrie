import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { FictionalTime } from '../src/presentation/fictional-time';
import { ModuleWriter } from '../src/lang/module-writer';
import companies from '../data/campaigns/companies.json';
import type { CreatureGenerationContext } from '../src/content';

// Three expeditions out of Reedwake with one company, each answered without a fight: what the fellowship can do,
// what it carries and what it has been told open the quiet ways. Each leg starts where the last one left off.
class Journey {
  static readonly hill = [
    'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
    'go(hill__yard_track,hill__yard)', 'go(hill__arch,hill__vestibule)', 'examine(hill__survey_board)',
    'go(hill__workshop_door,hill__workshop)', 'change_thing(hill__padlock_pick)',
    'go(hill__stores_door,hill__stores)', 'take_item(rescue__bar,march__member_party_2)',
    'take_item(hill__line_cache,march__member_party_1)', 'go(hill__tram_crawl,hill__hoist)',
    'rescue__lift_free(march__member_party_2)', 'lead(rescue__guest)',
    'take_item(salvage__prize,march__member_party_2)', 'go(hill__tram_crawl,hill__stores)',
    'go(hill__stores_door,hill__workshop)', 'go(hill__workshop_door,hill__vestibule)', 'go(hill__arch,hill__yard)',
    'sell(salvage__prize,salvage__salvager)', 'go(hill__yard_track,march__ridge)',
    'go(march__ridge_track,march__causeway)', 'go(march__causeway_path,march__quay)', 'rescue__thanks_escorted',
    'go(march__ferry_door,march__ferry_room)', 'wait', 'rescue__home_thanks'];
  static readonly silkholme = [
    'go(march__ferry_door,march__quay)', 'go(march__oar_door,march__taproom)', 'word__maud_lights',
    'take_lodging(march__maud_lodging,march__maud)', 'go(march__oar_door,march__quay)',
    'go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)', 'brood__complaint',
    'take_item(brood__spare_torch,march__member_party_3)', 'go(sink__sink_path,sink__lip)',
    'go(sink__terrace_steps,sink__frames)', 'brood__plea', 'go(sink__terrace_steps,sink__lip)',
    'go(sink__sink_path,march__ridge)', 'brood__carcass', 'go(sink__sink_path,sink__lip)',
    'go(sink__shaft,sink__cave)', 'light_item(brood__spare_torch)',
    'change_thing(brood__webs_hack)', 'go(sink__web_gallery,sink__nest)', 'change_thing_paying(brood__mother_feed)',
    'go(sink__web_gallery,sink__cave)', 'go(sink__seep,sink__frames)', 'brood__grateful',
    'go(sink__terrace_steps,sink__lip)', 'go(sink__sink_path,march__ridge)', 'brood__wait_and_see'];
  static readonly rest = [
    'go(march__ridge_track,march__causeway)', 'go(march__causeway_path,march__quay)',
    'go(march__oar_door,march__taproom)', 'take_lodging(march__maud_lodging,march__maud)',
    'raise_quality(march__member_party_1,dexterity)', 'raise_quality(march__member_party_2,strength)',
    'raise_quality(march__member_party_3,wisdom)', 'learn_spell(march__member_party_3,smite)'];
  static readonly tower = [
    'go(march__oar_door,march__quay)', 'go(march__shrine_door,march__shrine)', 'word__iven_graves',
    'go(march__shrine_door,march__quay)', 'go(march__shop_door,march__shop_floor)',
    'buy_item(march__nera_torch_1,march__member_party_3)', 'buy_item(march__nera_torch_2,march__member_party_3)',
    'go(march__shop_door,march__quay)', 'go(east__ferry_crossing,east__landing)',
    'go(east__landing_lane,east__holt_green)', 'go(east__holly_door,east__holly_room)', 'word__cutter_well',
    'word__osric_lights', 'go(east__holly_door,east__holt_green)', 'go(east__tower_lane,east__tower_foot)',
    'go(tower__well,tower__crypt)', 'light_item(march__nera_torch_1)',
    'examine(tower__worn_steps)', 'go(tower__crypt_steps,tower__study)', 'examine(tower__daybook)', 'change_thing(tower__lantern_smash)',
    // He went over the downs in the night with the register, and is still on the corpse road home: wait for him.
    'wait_hour', 'wait_hour', 'tower__why', 'tower__send_away', 'go(tower__crypt_steps,tower__crypt)', 'go(tower__well,east__tower_foot)',
    'go(east__tower_lane,east__holt_green)', 'go(east__landing_lane,east__landing)',
    'go(east__ferry_crossing,march__quay)', 'go(march__shrine_door,march__shrine)', 'tower__graves'];
  static async start(company = 'fellowship') {
    const members = companies.companies.find(c => c.id === company)!.members as CreatureGenerationContext[];
    return PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'serewater', NodeBundleSource.shared, members);
  }
  static async walk(s: PlaySession, commands: readonly string[]) { for (const c of commands) { await s.perform(c); } }
  static experience(s: PlaySession) {
    return s.campaign.state.party.map(f => s.campaign.state.creatures.find(c => c.id === f.id)!.state.experience);
  }
  static outcome(s: PlaySession, id: string) { return s.campaign.state.modules?.find(m => m.id === id)?.outcome; }
  static test(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
}

describe('the Serewater March, three expeditions with one company', () => {
  it('rescues Pell and settles the salvage, quiets the brood, then crosses on Wren\'s ferry to still the tower', async () => {
    const s = await Journey.start();
    await Journey.walk(s, Journey.hill);
    // Censer Hill: Pell lifted free and home, the bearing handed to Edda; and Wren's ferry runs.
    expect([Journey.outcome(s, 'rescue'), Journey.outcome(s, 'salvage')]).toEqual(['success', 'success']);
    // The fights' experience, and the bronze bearing's worth for selling it to Edda.
    expect(Journey.experience(s)).toEqual([712, 712, 712]);
    expect(Journey.test(s, 'state', 'east__ferry', 'east__running')).toBe(true);
    await Journey.walk(s, Journey.silkholme);
    // A bed at the Oar in the afternoon is a night's sleep: the company wakes at seven on the second day, and
    // Garth, two ewes down, has not yet gone for his fire. Fed, the brood is quiet and the rumours of it are done.
    expect(Journey.outcome(s, 'brood')).toBe('success');
    expect(Journey.test(s, 'state', 'brood__webs', 'brood__burnt')).toBe(false);
    expect(Journey.experience(s)).toEqual([1212, 1212, 1212]);
    await Journey.walk(s, Journey.rest);
    expect(s.campaign.state.party.map(f => f.level)).toEqual([2, 2, 2]);
    expect(FictionalTime.at(s.campaign.state.elapsed)).toMatch(/^Day 3, 7:/);
    const shop = Journey.tower.indexOf('go(march__shop_door,march__shop_floor)') + 1;
    await Journey.walk(s, Journey.tower.slice(0, shop));
    // Nera has silk on her shelves again, so she no longer says why there is none.
    expect(PlayerView.choices(s.campaign).map(c => c.choice.id)).not.toContain('word__nera_silk');
    await Journey.walk(s, Journey.tower.slice(shop));
    // Holt tower by Wat's old well, a torch lit in the crypt, the lantern smashed: the tower module is resolved.
    expect(Journey.outcome(s, 'tower')).toBe('success');
    expect(Journey.experience(s)).toEqual([2012, 2012, 2012]);
    expect(s.campaign.events.every(e => !e.combat.some(x => x.type === 'initiative'))).toBe(true);
  }, 120000);
  it('a company without brawn, locks or woodcraft rescues Pell another way, and it costs them their food', async () => {
    // The pilgrims (cleric, monk, bard) climb the hoist side, dig Pell out by hand, and toss the hound their ration.
    const s = await Journey.start('pilgrims');
    await Journey.walk(s, ['go(march__causeway_path,march__causeway)', 'go(march__ridge_track,march__ridge)',
      'go(hill__yard_track,hill__yard)', 'go(hill__climbing_scar,hill__hoist)', 'rescue__dig_free(party,hill__hoist)',
      'lead(rescue__guest)', 'change_thing_paying(hill__hound_feed)', 'go(hill__hoist_passage,hill__gallery)',
      'go(hill__gallery_steps,hill__workshop)', 'go(hill__workshop_door,hill__vestibule)', 'go(hill__arch,hill__yard)',
      'go(hill__yard_track,march__ridge)', 'go(march__ridge_track,march__causeway)', 'go(march__causeway_path,march__quay)',
      'rescue__thanks_escorted', 'wait']);
    // A word takes no time; the relative takes Pell home while the company waits.
    expect(Journey.outcome(s, 'rescue')).toBe('success');
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(0);
  }, 60000);
  it('while the lantern burns the dead walk down to Brackenholt at night, and each dawn another grave is open', async () => {
    const s = await Journey.start();
    await Journey.walk(s, [...Journey.hill, 'go(march__ferry_door,march__quay)', 'go(east__ferry_crossing,east__landing)',
      'go(east__landing_lane,east__holt_green)']);
    const opened = () => s.campaign.world.number(ModuleWriter.call('tower__opened', 'tower__churchyard'));
    expect([Journey.test(s, 'at', 'tower__risen', 'tower__hall'), opened()]).toEqual([true, 5]);
    while (!Journey.test(s, 'dark')) { await s.perform('wait'); }
    // On the green after dark: the dead stand about it, and nobody stands at the foot of the tower stair.
    expect(Journey.test(s, 'at', 'tower__risen', 'east__holt_green')).toBe(true);
    expect(Journey.test(s, 'watched', 'tower__stair')).toBe(false);
    expect(PlayerView.choices(s.campaign).map(c => c.choice.id)).toContain('attack(tower__risen)');
    await s.perform('wait_for_light');
    expect([Journey.test(s, 'at', 'tower__risen', 'tower__hall'), Journey.test(s, 'watched', 'tower__stair'), opened()])
      .toEqual([true, true, 6]);
  }, 120000);
});
