import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// The Candle Tombs under Two Barrows (data/sites/candle-tombs): a gilded tomb that lies, the Lamp-Father's true
// tomb under his image, the rite of the threshold candle that keeps the dead asleep, and the dead door out.
class Tombs {
  static start() { return PlaySession.start('data/campaigns/varrow.campaign.json', 'varrow', NodeBundleSource.shared); }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static set(s: PlaySession, ...changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static put(s: PlaySession, place: string) { this.set(s, { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }); }
  static said(e: { response?: string; perceptions?: { text: string }[]; prelude?: { response?: string } }) {
    return [e.prelude?.response, e.response, ...(e.perceptions ?? []).map(p => p.text)].join(' ');
  }
  static async walk(s: PlaySession, commands: string[]) {
    const events = [];
    for (const c of commands) {
      const id = Tombs.legal(s).find(x => x === c || x.startsWith(c));
      if (!id) { throw new Error(`Not offered: ${c} among ${Tombs.legal(s).join(', ')}`); }
      events.push(await s.perform(id));
    }
    return events;
  }
  static readonly light = 'field_spell(varrow__member_party_3,conjure_light,varrow__member_party_3)';
  // A torch, bought at Ottar's, lit and carried: light and a flame.
  static async torch(s: PlaySession) {
    this.put(s, 'varrow__chandlery');
    await this.walk(s, ['buy_item(varrow__ottar_torch_1,varrow__member_party_1)', 'use_item(varrow__ottar_torch_1']);
  }
}

describe('the way in', () => {
  it('is found by searching the barrows', async () => {
    const s = await Tombs.start();
    Tombs.put(s, 'varrow__barrows');
    expect(Tombs.legal(s).some(c => c.startsWith('go(tombs__slot'))).toBe(false);
    const [found] = await Tombs.walk(s, ['search(varrow__barrows']);
    expect(Tombs.said(found!)).toContain('a slot low in the side goes into the mound');
    expect(Tombs.legal(s)).toContain('go(tombs__slot,tombs__antechamber)');
  }, 60000);
});

describe('the rite of the threshold', () => {
  it('keeps the dead asleep while a candle burns at the threshold; without it they wake within the hour', async () => {
    const lit = await Tombs.start();
    await Tombs.torch(lit);
    Tombs.put(lit, 'tombs__antechamber');
    await Tombs.walk(lit, ['change_thing(tombs__threshold_light', 'go(tombs__way_in', 'wait_hour']);
    expect(Tombs.fact(lit, 'tombs__restless', 'tombs__tombs')).toBe(false);
    const unlit = await Tombs.start();
    Tombs.put(unlit, 'tombs__antechamber');
    const events = await Tombs.walk(unlit, [Tombs.light, 'go(tombs__way_in', 'wait_hour']);
    expect(Tombs.fact(unlit, 'tombs__restless', 'tombs__tombs')).toBe(true);
    expect(events.map(e => Tombs.said(e)).join(' ')).toContain('tallowmen come at you');
  }, 60000);
});

describe('the gilded tomb and the true one', () => {
  it('shows a careful look that the crown is gilded lead, and Iselde pays two crowns for it', async () => {
    const s = await Tombs.start();
    Tombs.put(s, 'tombs__gilded');
    const [, look] = await Tombs.walk(s, [Tombs.light, 'look_closely(tombs__image']);
    expect(Tombs.said(look!)).toContain('gilded lead');
    await Tombs.walk(s, ['take_out(tombs__crown,tombs__image,varrow__member_party_1)']);
    Tombs.put(s, 'varrow__goldsmith');
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await Tombs.walk(s, ['sell(tombs__crown']);
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold + 2);
  }, 60000);
  it('opens the stair under the image to a push, and the coffin lid tells the Lamplighters\' Rule', async () => {
    const s = await Tombs.start();
    Tombs.put(s, 'tombs__gilded');
    const [, push] = await Tombs.walk(s, [Tombs.light, 'push(tombs__image']);
    expect(Tombs.said(push!)).toContain('a stair goes down');
    await Tombs.walk(s, ['go(tombs__under_image', 'examine(tombs__coffin_lid']);
    expect(Tombs.fact(s, 'knows', 'party', 'tombs__lamplighters_rule')).toBe(true);
  }, 60000);
  it('lets the company out by the dead door in the far barrow, and never in by it', async () => {
    const s = await Tombs.start();
    Tombs.put(s, 'tombs__far_barrow');
    await Tombs.walk(s, [Tombs.light, 'go(tombs__dead_door']);
    expect(s.campaign.world.test(ModuleWriter.call('at', 'party', 'varrow__barrows'))).toBe(true);
    expect(Tombs.legal(s).some(c => c.startsWith('go(tombs__dead_door'))).toBe(false);
  }, 60000);
});
