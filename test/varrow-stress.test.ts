import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// Pushing on the Varrow the way players do: the wrong thing in the cradle, the treasure sold to the wrong buyer, a
// strongbox robbed and the company coming back, a captive taken home, a save and a load in the middle of it. The
// world should answer each with its own rules and remember what was done.
class Push {
  static start(seed = 'varrow') {
    return PlaySession.start('data/campaigns/varrow.campaign.json', seed, NodeBundleSource.shared);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  static async walk(s: PlaySession, commands: string[]) {
    const events = [];
    for (const c of commands) {
      const id = Push.legal(s).find(x => x === c || x.startsWith(c));
      if (!id) { throw new Error(`Not offered: ${c} among ${Push.legal(s).join(', ')}`); }
      events.push(await s.perform(id));
    }
    return events;
  }
  static readonly light = 'field_spell(varrow__member_party_3,conjure_light,varrow__member_party_3)';
}

describe('things put where they do not belong', () => {
  it('lights nothing when a jar of moonlight is set in the beacon\'s cradle', async () => {
    const s = await Push.start();
    Push.put(s, 'lanthorn__bottle_cellar');
    await Push.walk(s, [Push.light, 'take_out(lanthorn__moon_jar,lanthorn__racks,varrow__member_party_1)']);
    Push.put(s, 'lanthorn__lantern');
    await Push.walk(s, ['put_in(lanthorn__moon_jar']);
    expect([Push.fact(s, 'lanthorn__kindled', 'lanthorn__beacon'), Push.fact(s, 'inside', 'lanthorn__moon_jar', 'lanthorn__cradle')])
      .toEqual([false, true]);
  }, 60000);
  it('lets the First Light be sold to the goldsmith, after which the beacon can never be lit', async () => {
    const s = await Push.start();
    Push.put(s, 'lanthorn__first_vault');
    await Push.walk(s, [Push.light, 'take_item(lanthorn__first']);
    Push.put(s, 'varrow__goldsmith');
    await Push.walk(s, ['sell(lanthorn__first']);
    expect(Push.fact(s, 'keeps', 'varrow__iselde', 'lanthorn__first')).toBe(true);
    Push.put(s, 'lanthorn__lantern');
    expect(Push.legal(s).some(c => c.startsWith('put_in(lanthorn__first'))).toBe(false);
  }, 60000);
});

describe('coming back after doing something', () => {
  it('remembers a robbed strongbox: the Lanthorn is roused, and on the company\'s return the wardens shoot on sight', async () => {
    const s = await Push.start();
    Push.put(s, 'lanthorn__solar');
    await s.perform('wait');
    Push.put(s, 'lanthorn__lantern');
    await Push.walk(s, ['wait']);
    // Picked in the solar while Ninefingers is out of it: the bell rings below.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('state', 'lanthorn__strongbox', 'lanthorn__open') }]));
    await s.perform('wait');
    expect([Push.fact(s, 'alarmed', 'lanthorn__ninefingers'), Push.fact(s, 'hostile', 'lanthorn__ninefingers', 'party')])
      .toEqual([true, true]);
    // Saved and loaded; days later, back at the gate.
    const back = PlaySession.resume(structuredClone(s.checkpoint()));
    Push.put(back, 'varrow__toll_gate');
    const [shot] = await Push.walk(back, ['wait']);
    expect((shot!.perceptions ?? []).map(p => p.text).join(' ')).toContain("That's them!");
    expect(shot!.combat.some(e => e.type === 'save' || e.type === 'damage')).toBe(true);
  }, 60000);
  it('takes Tamsin home to Skerry and is thanked there, and Skerry remembers it', async () => {
    const s = await Push.start();
    Push.put(s, 'lanthorn__kitchen');
    // The crew are not in the kitchen; Hulda strikes off the chain.
    await Push.walk(s, ['change_thing(lanthorn__tamsin_unchain', 'lead(lanthorn__tamsin']);
    // Out through the postern, and down to Skerry; she keeps up.
    await Push.walk(s, ['change_thing(lanthorn__postern_bar_lift', 'go(lanthorn__postern']);
    await Push.walk(s, ['go(varrow__heights_road', 'go(varrow__skerry_road']);
    // She walks the road behind the company, and is home within the hour.
    for (let h = 0; h < 3 && !Push.fact(s, 'lanthorn__lifted', 'lanthorn__captivity'); h++) { await s.perform('wait_hour'); }
    expect(Push.fact(s, 'lanthorn__lifted', 'lanthorn__captivity')).toBe(true);
  }, 60000);
});
