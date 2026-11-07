import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';

// The King's Players (doc/adventures/anthology/the-kings-players.md): Gosse's Company in Dun Rierdan, played by the
// labels a page offers, on the Pentrice city campaign with the Trial's verdict staged as read. Each act is a spec of
// its own; Act III has both its tragic path and a path on which everyone is saved.
const city = 'test/fixtures/gosse/city.campaign.json';
const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
class KP {
  constructor(readonly j: Journey) {}
  static async start(seed = 'kp') { return new KP(await Journey.start(city, seed)); }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  assert(name: string, ...args: string[]) { this.j.assert(p(name), ...args.map(p)); return this; }
  set(name: string, ...rest: string[]) {
    const value = Number(rest.at(-1)), args = rest.slice(0, -1).map(p);
    const c = this.j as unknown as { campaign: { world: { apply(c: unknown[]): unknown }; commitWorld(w: unknown): void } };
    c.campaign.commitWorld(c.campaign.world.apply([{ kind: 'set', call: ModuleWriter.call(p(name), ...args), value: ModuleWriter.number(value) }]));
    return this;
  }
  put(who: string, place: string) { this.j.put(p(who), p(place)); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(f: string) { return this.j.holds('knows', 'party', p(f)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  // The Trial over and the writ taken: the road to Dun Rierdan, and the city's gate.
  async toTheRoad() {
    this.assert('verdictRead', 'pentrice').set('tday', 'pentrice', '6').put('party', 'moon_yard');
    await this.play('Wait › An hour', 'Wait › An hour', "Take the King's writ");
    this.put('party', 'eastgate');
    await this.play('To the King\'s Road', 'To the River Gate');
    return this;
  }
}

describe("The King's Players, Act I: the Marchants' Men", () => {
  it('goes in under a false name, takes Kit to the Chancellor, unmasks a page, and ends in a fiasco on the rug', async () => {
    const k = await KP.start();
    await k.toTheRoad();
    expect(k.holds('summoned', 'pentrice')).toBe(true);
    await k.play('Say who you are, since the sergeant has not asked', "We are. The Marchants' masquers, and we are late");
    expect(k.holds('posing', 'party')).toBe(true);
    await k.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Brazen Sparrow', "To the Sparrow's long loft",
      "Take Kit Arden along to the Marchants' house", "To the Brazen Sparrow's taproom", 'Out to Playhouse Row');
    expect(k.j.holds('following', p('kit'), 'party')).toBe(true);
    // The Chancellor takes Kit for his daughter; the company says so, or does not.
    await k.play('To the Concourse of the Seven', 'To Lamp Hill', "Into the Marchants' house on Lamp Hill");
    expect(k.holds('kitTaken', 'party')).toBe(true);
    await k.play('Answer the Chancellor, who has put a hand on Kit\'s shoulder', 'No, my lord. He is a boy called Kit Arden, and he plays the girls');
    k.j.roll('pass');
    await k.play('Prove Kit is a boy, with Kit\'s help and some dignity');
    expect(k.holds('kitProved', 'party')).toBe(true);
    // Orrin in the Rotunda's wings: the page is the Chancellor's daughter, and asks whether she will be told on.
    k.j.roll(undefined);
    await k.play('Out to Lamp Hill', 'To the Concourse of the Seven', 'To Playhouse Row', 'Into the Rotunda');
    k.put('party', 'rot_wings');
    await k.play('Ask the page Orrin why a Rotunda boy has such a look', 'No. Not a word, on my word');
    expect(k.knows('oriel_unmasked')).toBe(true);
    expect(k.holds('orielSworn', 'party')).toBe(true);
    await k.play('Ask Oriel to come with the company, as herself', 'Ask Oriel Marchant to join the company');
    expect(k.j.holds('travelsWith', p('oriel'), 'party')).toBe(true);
    // Hepzibah asks which play, and Gosse how he wants the King to see him: the answers decide what can be played.
    k.put('party', 'sparrow_loft');
    await k.play('Ask Hepzibah what the company will give the King', 'A farce, tonight, made of the mistakes of this week',
      'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
    expect(k.holds('masqueFarce', 'party')).toBe(true);
    expect(k.holds('gosseHam', 'party')).toBe(true);
    // The audition: the real masquers have come; the King, the Chancellor, a bear and the wrong column.
    k.assert('realMasquers', 'rierdan');
    k.put('party', 'audience');
    k.j.roll('pass');
    await k.play('Play the King The Marchants\' Men, with the two companies and the two Oriels');
    expect(k.holds('auditioned', 'rierdan')).toBe(true);
    await k.play('Wait › A while');
    expect(k.holds('titleByAccident', 'rierdan')).toBe(true);
    expect(k.measure('favour', 'rierdan')).toBeGreaterThanOrEqual(4);
  }, 280000);
});
