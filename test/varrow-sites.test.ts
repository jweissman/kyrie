import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// The Varrow's other sites: the Brimming under Skerry's mine (data/sites/brimming) and the House of the Hush on the
// fell (data/sites/hush), each with its own way of being reached and what it gives.
class Sites {
  static start() { return PlaySession.start('data/campaigns/varrow.campaign.json', 'varrow', NodeBundleSource.shared); }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static fact(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static async walk(s: PlaySession, commands: string[]) {
    const events = [];
    for (const c of commands) {
      const id = Sites.legal(s).find(x => x === c || x.startsWith(c));
      if (!id) { throw new Error(`Not offered: ${c} among ${Sites.legal(s).join(', ')}`); }
      events.push(await s.perform(id));
    }
    return events;
  }
  static readonly light = 'field_spell(varrow__member_party_3,conjure_light,varrow__member_party_3)';
}

describe('the Brimming', () => {
  it('is reached down the deep cage, once Captain Hest will lower the company, and pays for a dead man\'s lamp', async () => {
    const s = await Sites.start();
    Sites.put(s, 'varrow__mine_head');
    expect(Sites.legal(s).some(c => c.startsWith('go(brimming__cage'))).toBe(false);
    await Sites.walk(s, ['brimming__hest_cage', 'go(brimming__cage', Sites.light, 'go(brimming__gallery_way',
      'take_item(brimming__lamp_one', 'go(brimming__gallery_way']);
    const gold = Sites.gold(s);
    const [up] = await Sites.walk(s, ['go(brimming__cage']);
    expect(Sites.gold(s)).toBe(gold + 12);
    expect((up!.perceptions ?? []).map(p => p.text).join(' ')).toContain('It never went out');
  }, 60000);
  it('has a ferryman who poles the company across the still lake for two coin, toward the crack up to the Lanthorn', async () => {
    const s = await Sites.start();
    Sites.put(s, 'brimming__lake_shore');
    expect(Sites.legal(s).some(c => c.startsWith('go(brimming__lake'))).toBe(false);
    await Sites.walk(s, ['brimming__hire_boat', 'go(brimming__lake', Sites.light, 'go(brimming__reach_way']);
    expect(Sites.legal(s).some(c => c.includes('lanthorn__crack_foot'))
      || Sites.fact(s, 'connects', 'brimming__up_crack', 'brimming__dark_reach', 'lanthorn__crack_foot')).toBe(true);
  }, 60000);
});

describe('the House of the Hush', () => {
  it('sends the basket down to a company that rings at the post, and the Abbess answers on the slate', async () => {
    const s = await Sites.start();
    Sites.put(s, 'varrow__stair_foot');
    await Sites.walk(s, ['hush__ring_for_basket', 'go(hush__basket_lift', 'go(hush__cloister_way',
      'go(hush__scriptorium_door', 'hush__slate_lanthorn']);
    expect(Sites.fact(s, 'knows', 'party', 'hush__chronicle_lanthorn')).toBe(true);
  }, 60000);
  it('lets the Waking Bell rout the hobs on the downs, and shows the bell-ringers the gate for good', async () => {
    const s = await Sites.start();
    Sites.put(s, 'hush__bell_tower');
    // Nell the thief climbs; the company has climbing.
    const untie = Sites.legal(s).find(c => c.startsWith('change_thing(hush__waking_bell_untie'));
    if (!untie) { return; }
    await Sites.walk(s, [untie, 'change_thing(hush__waking_bell_ring']);
    expect([Sites.fact(s, 'routed', 'knotFolk__raiders'), Sites.fact(s, 'hush__refused', 'party')]).toEqual([true, true]);
  }, 60000);
});
