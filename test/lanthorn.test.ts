import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// The Lanthorn (data/sites/lanthorn) in the Varrow: the Toll and its gate, Ninefingers' bargain, the Wick's bottled
// light, the Unlight and the beacon, and what the crew do when their store runs out.
class Lanthorn {
  static start(seed = 'varrow') {
    return PlaySession.start('data/campaigns/varrow.campaign.json', seed, NodeBundleSource.shared);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static state(s: PlaySession, id: string) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'state' && r.args[0] === id)?.args[1];
  }
  static where(s: PlaySession, who = 'party') {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === who)?.args[1];
  }
  static set(s: PlaySession, ...changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static put(s: PlaySession, place: string) { this.set(s, { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }); }
  static said(event: { response?: string; perceptions?: { text: string }[]; prelude?: { response?: string } }) {
    return [event.prelude?.response, event.response, ...(event.perceptions ?? []).map(p => p.text)].join(' ');
  }
  // Each command by its prefix among the legal ones, so a test names what the player would pick.
  static async walk(s: PlaySession, commands: string[]) {
    const events = [];
    for (const c of commands) {
      const id = Lanthorn.legal(s).find(x => x === c || x.startsWith(c));
      if (!id) { throw new Error(`Not offered: ${c} among ${Lanthorn.legal(s).join(', ')}`); }
      events.push(await s.perform(id));
    }
    return events;
  }
  static readonly light = 'field_spell(varrow__member_party_3,conjure_light,varrow__member_party_3)';
  static readonly noon = ['take_out(lanthorn__noon_jar,lanthorn__racks,varrow__member_party_2)',
    'equip_item(lanthorn__noon_jar'];
}

describe('the Toll', () => {
  it('opens the gate to a company that pays, and shuts it behind them on the far side', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'varrow__toll_gate');
    expect(Lanthorn.legal(s).some(c => c.startsWith('go(lanthorn__outer_gate'))).toBe(false);
    await Lanthorn.walk(s, ['lanthorn__pay_toll', 'go(lanthorn__outer_gate', 'go(lanthorn__far_gate']);
    expect(Lanthorn.where(s)).toBe('varrow__gap_far');
    await s.perform('wait');
    expect([Lanthorn.state(s, 'lanthorn__portcullis'), Lanthorn.fact(s, 'tolerates', 'lanthorn__wardens', 'party')])
      .toEqual(['lanthorn__down', false]);
  }, 60000);
  it('rouses the Lanthorn when a paying company picks the guardroom lock under the wardens\' noses', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'varrow__toll_gate');
    const [, , pick] = await Lanthorn.walk(s, ['lanthorn__pay_toll', 'go(lanthorn__outer_gate',
      'change_thing(lanthorn__guard_lock_pick']);
    expect(pick!.prelude?.response).toContain('gate wardens come at you');
    expect(Lanthorn.fact(s, 'lanthorn__roused', 'lanthorn__lanthorn')).toBe(true);
  }, 60000);
  it('takes a company that asks for an audience up to Ninefingers, who names her price', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'varrow__toll_gate');
    await Lanthorn.walk(s, ['lanthorn__ask_audience', 'go(lanthorn__outer_gate', 'go(lanthorn__guard_door',
      'go(lanthorn__guard_stair', 'go(lanthorn__winch_door', 'go(lanthorn__court_steps', 'go(lanthorn__tower_door',
      'go(lanthorn__tower_stair']);
    expect(Lanthorn.where(s)).toBe('lanthorn__solar');
    const [talk] = await Lanthorn.walk(s, ['lanthorn__nine_toll']);
    expect(Lanthorn.said(talk!)).toContain('Bring me a jar of noonlight');
  }, 60000);
});

describe('the crew', () => {
  it('fall on anyone who walks into the chapter house by day, and can be heard from the court', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__court');
    await s.perform('wait');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('a lot of voices');
    const [fight] = await Lanthorn.walk(s, ['go(lanthorn__chapter_doors']);
    expect(fight!.prelude?.response).toContain('crew come at you');
  }, 60000);
  it('sleep at night, so a company can search the chapter house and find the stair behind the counterweight', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__court');
    for (let h = 0; h < 14; h++) { await s.perform('wait_hour'); }
    await Lanthorn.walk(s, ['go(lanthorn__chapter_doors', 'search(lanthorn__chapter_house']);
    expect(Lanthorn.fact(s, 'knows', 'party', 'lanthorn__wick_stair_known')).toBe(true);
    expect(Lanthorn.legal(s)).toContain('go(lanthorn__wick_stair,lanthorn__stair_foot)');
  }, 60000);
  it('send the carters down to Crake\'s Ford when the store runs low, and bring meal back up', async () => {
    const s = await Lanthorn.start('d');
    for (let h = 0; h < 60; h++) { await s.perform('wait_hour'); }
    expect(s.campaign.world.number(ModuleWriter.call('lanthorn__provisions', 'lanthorn__lanthorn'))).toBeGreaterThan(2);
  }, 120000);
  it('go down to Skerry and rob it when the store is empty', async () => {
    const s = await Lanthorn.start('d');
    Lanthorn.set(s, { kind: 'set', call: ModuleWriter.call('lanthorn__provisions', 'lanthorn__lanthorn'), value: ModuleWriter.number(0) },
      { kind: 'retract', call: ModuleWriter.call('able', 'lanthorn__carters') });
    let robbed = false;
    for (let h = 0; h < 12 && !robbed; h++) {
      await s.perform('wait_hour');
      robbed = Lanthorn.fact(s, 'lanthorn__plundered', 'varrow__square');
    }
    expect(robbed).toBe(true);
  }, 120000);
});

describe('the Wick', () => {
  it('has a Tender that leaves a lit company alone and falls on one in the dark', async () => {
    const lit = await Lanthorn.start();
    Lanthorn.put(lit, 'lanthorn__stair_foot');
    await Lanthorn.walk(lit, [Lanthorn.light, 'go(lanthorn__works_arch']);
    const [calm] = await Lanthorn.walk(lit, ['wait']);
    expect(calm!.prelude).toBeUndefined();
    const dark = await Lanthorn.start();
    Lanthorn.put(dark, 'lanthorn__stair_foot');
    const [met] = await Lanthorn.walk(dark, ['go(lanthorn__works_arch']);
    expect(met!.prelude?.response).toContain('Tender comes at you');
  }, 60000);
  it('keeps noonlight in the racks, and a soured jar that bursts when a crowbar is put to it', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__bottle_cellar');
    await Lanthorn.walk(s, [Lanthorn.light, ...Lanthorn.noon]);
    expect(Lanthorn.fact(s, 'capable', 'party', 'sunlight')).toBe(true);
    const [look] = await Lanthorn.walk(s, ['look_closely(lanthorn__soured']);
    expect(Lanthorn.said(look!)).toContain('follows you when you move');
  }, 60000);
});

describe('the Unlight and the beacon', () => {
  it('sets the glooms on a company without sunlight, and they flee from noonlight', async () => {
    const blind = await Lanthorn.start();
    Lanthorn.put(blind, 'lanthorn__bottle_cellar');
    const [fall] = await Lanthorn.walk(blind, [Lanthorn.light, 'go(lanthorn__deep_stair']).then(e => e.slice(1));
    expect(fall!.prelude?.response).toContain('glooms come at you');
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__bottle_cellar');
    const [, , , down] = await Lanthorn.walk(s, [Lanthorn.light, ...Lanthorn.noon, 'go(lanthorn__deep_stair']);
    expect(Lanthorn.said(down!)).toContain('flinch from the noonlight');
    expect(Lanthorn.where(s, 'lanthorn__glooms')).toBe('lanthorn__crack_foot');
  }, 60000);
  it('opens the sun-door to noonlight, and spends the jar scorching the Unlight', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__bottle_cellar');
    await Lanthorn.walk(s, [Lanthorn.light, ...Lanthorn.noon, 'go(lanthorn__deep_stair', 'change_thing(lanthorn__sun_lock_open',
      'go(lanthorn__sun_door', 'take_item(lanthorn__first', 'go(lanthorn__sun_door']);
    const [scorch] = await Lanthorn.walk(s, ['change_thing_spending(lanthorn__unlight_scorch']);
    expect(Lanthorn.said(scorch!)).toContain('The dark screams');
    // The jar is spent; the First Light that Nell carries out of the vault gives no light until she readies it.
    expect([Lanthorn.state(s, 'lanthorn__unlight'), Lanthorn.fact(s, 'lightless', 'lanthorn__deep_cellar'),
      Lanthorn.fact(s, 'capable', 'party', 'sunlight')]).toEqual(['lanthorn__scorched', false, false]);
    expect(s.campaign.state.creatures.some(c => c.state.inventory?.some(i => i.id === 'lanthorn__noon_jar'))).toBe(false);
  }, 60000);
  it('ends the Unlight for good when the First Light is set in the beacon, and the valley\'s lamps steady', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__first_vault');
    await Lanthorn.walk(s, [Lanthorn.light, 'take_item(lanthorn__first']);
    Lanthorn.put(s, 'lanthorn__lantern');
    const [lit] = await Lanthorn.walk(s, ['put_in(lanthorn__first']);
    expect(Lanthorn.said(lit!)).toContain('too bright to look at');
    expect(Lanthorn.state(s, 'lanthorn__unlight')).toBe('lanthorn__gone');
    Lanthorn.put(s, 'varrow__lamp_temple');
    await s.perform('wait');
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('burns tall and steady');
  }, 60000);
  it('lets the dark spread up through the Wick night by night while nobody stops it', async () => {
    const s = await Lanthorn.start();
    Lanthorn.set(s, { kind: 'set', call: ModuleWriter.call('lanthorn__gloom', 'lanthorn__unlight'), value: ModuleWriter.number(7) });
    expect(Lanthorn.fact(s, 'lightless', 'lanthorn__bottle_cellar')).toBe(false);
    for (let h = 0; h < 24; h++) { await s.perform('wait_hour'); }
    expect(Lanthorn.fact(s, 'lightless', 'lanthorn__bottle_cellar')).toBe(true);
  }, 120000);
});

describe('Ninefingers\' bargain', () => {
  it('ends the Toll when she is given the First Light: the crew pack up and the gate stands open', async () => {
    const s = await Lanthorn.start();
    Lanthorn.put(s, 'lanthorn__first_vault');
    await Lanthorn.walk(s, [Lanthorn.light, 'take_item(lanthorn__first']);
    Lanthorn.put(s, 'lanthorn__solar');
    await Lanthorn.walk(s, ['give(lanthorn__first']);
    expect([Lanthorn.fact(s, 'lanthorn__lifted', 'lanthorn__toll'), Lanthorn.where(s, 'lanthorn__crew')])
      .toEqual([true, 'lanthorn__south']);
  }, 60000);
});
