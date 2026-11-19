import { describe, expect, it } from 'bun:test';
import { Doable, type Row } from '../../src/presentation/doable';
import { Tiny } from '../support/tiny';
import { Glanced } from '../support/glanced';

// An executable row is made one way, and a blank or targetless one cannot be (AT-07 I3; the owner's playtest of 19
// November, AT-04: a row with no words that went back to the landing; the probe's 50 rows in the a1 and kite walks
// that did nothing and said nothing, "Steal a sack of meal off the cart" among them, its reason lost).
const legal = new Set(['change_thing(t__cart_heave)']);
const row = (r: Partial<Row>): Row => ({ id: 'r', label: 'Heave the wheel out', witnesses: [], ...r });

describe('a row is made with words and something it does, opens, or says it cannot', () => {
  it('refuses a row with no words', () => {
    expect(() => Doable.made(row({ label: '  ', does: 'change_thing(t__cart_heave)' }), legal)).toThrow(/no words/);
  });
  it('refuses a row that does what nothing here offers', () => {
    expect(() => Doable.made(row({ does: 'change_thing(t__nothing)' }), legal)).toThrow(/nothing here offers/);
  });
  it('refuses a row that does nothing, opens nothing, and says nothing of why', () => {
    expect(() => Doable.made(row({}), legal)).toThrow(/says nothing/);
    expect(() => Doable.made(row({ opens: [] }), legal)).toThrow(/says nothing/);
  });
  it('makes one that does an offered command, a journey or a book, opens rows, or says why it cannot', () => {
    for (const r of [row({ does: 'change_thing(t__cart_heave)' }), row({ does: 'travel:t__road' }), row({ does: 'view:pack' }),
      row({ opens: [row({ id: 'k', does: 'change_thing(t__cart_heave)' })] }), row({ shut: 'Needs brawn.' })]) {
      expect(Doable.made(r, legal)).toBe(r);
    }
  });
  it('gives a shut act its reason, in a tiny world: a sack that cannot be stolen says why', async () => {
    const t = await Tiny.start(`
      Place road "the road" is room at 0, 0 outdoors.
      Thing cart "a cart in the ditch" at road {
        State stuck "A cart lies with one wheel in the ditch.".
        State out "The cart stands on the road again.".
        State robbed "The cart is a sack lighter.".
        Change heave2 "Heave the wheel out with the horse" from stuck to out needing brawn or crowbar.
        Change heave "Heave the wheel out of the ditch" from stuck to out.
        Change steal "Steal a sack of meal off the cart" from stuck to robbed needing stealth.
      }
      Company party "You" of 1 at road.
      Goal false.`, { party: [{ name: 'Ysolde', raceId: 'human', classId: 'mage' }] });
    const p = Glanced.of(t.session), rows = Doable.flat(Doable.of(p.leaf.glance!, p.screen));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter(r => r.shut).map(r => r.label)).toContain('Steal a sack of meal off the cart');
    expect(rows.filter(r => !r.does && !r.opens?.length).every(r => !!r.shut)).toBe(true);
  });
});
