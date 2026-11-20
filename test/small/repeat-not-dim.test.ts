import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Pip } from '../../web/reader/stage/pip';

// A repeatable act never goes dim, played (AP-19, split from AP-02): spent is a topic asked, idle a place left twice
// with nothing new; a wait, a rest and a buy done twice over are offered as before, present, with no condition, and
// the place they are done in is not idle for them.
const shop = `
  Place shop "the shop" is room at 0, 0.
  Place inn "the inn" is room at 1, 0.
  Passage door "the door" is door between shop and inn.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she. Sells torch for 1 coin from 6. }
  Company party "You" of 1 at shop.
  Initially Set quantity(party, rations) to 6.
  Goal false.`;
class Repeat {
  // Each row the scene offers whose command is one of these, as the engine gives it and as the page would mark it.
  static rows(t: Tiny, command: RegExp) {
    const offer = t.glance.offer!;
    const lensed = Object.values(t.glance.lenses ?? {}).flatMap(l => [...l.promoted, ...l.rest]);
    return [...offer.primary, ...offer.rest, ...lensed].filter(r => command.test(r.command ?? ''));
  }
  static undimmed(t: Tiny, command: RegExp) {
    const rows = Repeat.rows(t, command);
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect('disabled' in r && r.disabled).toBeFalsy();
      if ('why' in r) { expect(r.why).toBe('present'); }
    }
    const here = t.screen.place.id;
    expect(Pip.condition({ idle: (t.glance.idle ?? []).includes(here) })).toBeUndefined();
  }
}

describe('a repeatable act done twice', () => {
  it('is a wait, offered present and undimmed after it is waited twice', async () => {
    const t = await Tiny.start(shop);
    await t.play('Wait › A while', 'Wait › A while');
    Repeat.undimmed(t, /^wait$/);
  });
  it('is a buy, offered present and undimmed after the second', async () => {
    const t = await Tiny.start(shop);
    t.journey.coin(20);
    await t.play('Buy a torch', 'Buy a torch');
    Repeat.undimmed(t, /^buy_item\(/);
  });
  it('is a rest, offered present and undimmed after the company has camped twice', async () => {
    const t = await Tiny.start(shop);
    await t.play('Make camp', 'Make camp');
    Repeat.undimmed(t, /^camp\(/);
  });
});
