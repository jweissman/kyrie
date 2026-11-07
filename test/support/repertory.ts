import { expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';
import { PlaySession } from '../../src/session/play-session';

// The Repertory (doc/adventures/anthology/the-repertory.md): four engagements on the Fourways Circuit, played by the
// labels a page offers. Every spec begins where the King's Players' unbroken play ends Act IV: the Trial's own fixture
// to
// the verdict, the King's Road, Acts I-III and the Wick's opening night, all by labels and with natural dice
// (test/kings-players.test.ts plays the same road). That play is made once per file and saved as a checkpoint; each
// spec
// resumes it, so it begins with a real state and WALKS to the Fourways (the Concourse, the River Gate, the road, the
// inn,
// Hepzibah's letters). Nothing is asserted or placed. A spec's dice are re-keyed by its own tag (`rep2a-3`: the seed
// the
// spec names, suffixed by the sweep that found a luck the journey could use), because a "fair" check can miss; a spec
// forces a result only where it is showing that failure (`roll('fail')`, then reset). The Command cannot follow an Act
// V
// Ending, so the tour opens before it and holds it; one spec plays the Command itself and reads the road in it.
export const city = 'test/fixtures/gosse/city.campaign.json';
export const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
export const steps = (name: string): string[] => {
  const ph = JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return (Array.isArray(ph) ? ph : Object.values(ph).flat()).slice(0, -1);
};
// Pentrice to the Wick's opening night, as the unbroken play of the King's Players plays it. Variant A robs the
// strong-box
// (the heist), variant B has Swale hide his forgery and leaves the box alone.
export const bowCache = new Map<string, Promise<string>>();
export const bow = (variant: 'A' | 'B') => {
  if (!bowCache.has(variant)) {
    bowCache.set(variant, (async () => {
      const j = await Journey.start(city, 'g1');
      await j.play(...steps('bow'));
      await j.play('Wait › An hour', 'Out to the yard of the Painted Moon', "Take the King's writ", 'Out to the Westgate', 'To the Chepe', 'To Guildhall Square', 'To the Minster Close', 'To the Eastgate', "To the King's Road");
      await j.play('To the River Gate', 'Say who you are, since the sergeant has not asked', "We are. The Marchants' masquers, and we are late");
      await j.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Brazen Sparrow');
      if (j.offers("To the Sparrow's long loft")) { await j.play("To the Sparrow's long loft"); }
      await j.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one", 'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
      if (j.offers("To the Brazen Sparrow's taproom")) { await j.play("To the Brazen Sparrow's taproom"); }
      await j.play('Out to Playhouse Row', 'To the Concourse of the Seven', 'To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
      await j.play("Play the King The Miser's Wedding, as his grandfather had it");
      await j.play('To the long terrace', 'Go out on the terrace and stand where the Prince can say it', "Yes. I've met two");
      await j.play('To the Audience Chamber', "Out to the King's Court", 'To the steps of the Tower of Law', 'To the Concourse of the Seven', 'To Playhouse Row', 'To the Salt Quay');
      await j.play('Into the Tower of Salt', 'Ask the Salt-Wives what keeps a dead thing out of a house', 'Silence. When they stop listening');
      await j.play('Out to the Salt Quay', 'To Playhouse Row', '=06:00', '=17:50', 'Into the Rotunda');
      await j.play('=18:10', 'Lay a line of grey salt across the threshold', "To the Rotunda's stage");
      await j.play("To the Rotunda's wings", 'Ask Hepzibah to prompt the Mousetrap', 'No name. Cancel the trap. Play something else', '=06:30');
      await j.play('Wait › An hour', 'Wait › An hour');
      await j.play("To the Rotunda's stage", "To the Rotunda's front of house", 'Out to Playhouse Row', 'Into the Wick', "To the Wick's wardrobe", 'Ask Hepzibah to gather the company about the note', "Jem's: a false clerk, a false summons, and a good coat");
      if (variant === 'B') { await j.play('Ask Swale why he cannot meet your eye', "Say nothing. We'll get the paper back"); }
      await j.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Salt Quay', "To Mistress Pardew's draper's", 'Ask Mistress Pardew whether she dressed a clerk', "The note's a forgery. We mean to take it back");
      await j.play('?To the Salt Quay', 'To Playhouse Row', 'Into the Wick');
      await j.play('=+144', '=+144', '=+144', '=19:10');
      await j.play("To Lord Rask's box", "Take Lord Rask's box for the evening, and a bottle, and Master Mauger's whole attention");
      if (variant === 'A') {
        await j.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the Exchange under the Tower of Coin',
          "?Walk in at the counting-room door in the clerk's coat, as if you worked there", "?Open Master Mauger's strong-box, with a key or without");
      }
      await j.play('=22:10');
      expect(j.holds(p('heistOver'), p('rierdan'))).toBe(true);
      return JSON.stringify(j.session.checkpoint());
    })());
  }
  return bowCache.get(variant)!;
};
export class R {
  base = 0;
  constructor(public j: Journey) { this.base = this.measure('repertoire', 'rierdan'); }
  static async start(tag: string, variant: 'A' | 'B' = 'A') {
    const cp = JSON.parse(await bow(variant));
    cp.save.state.seed = `g1:${tag}`;
    return new R(Journey.of(PlaySession.resume(cp)));
  }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(f: string) { return this.j.holds('knows', 'party', p(f)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  offers(label: string) { return this.j.offers(label); }
  told() { return ((this.j as unknown as { taken: { told: string }[] }).taken.at(-1)?.told ?? ''); }
  // From wherever the opening night left the party: out of the Wick, the Concourse, the River Gate, the Fourways road,
  // the
  // inn for Hepzibah's letters, and back out to the Fourways.
  async tour() {
    for (const step of ["To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the River Gate']) { if (this.j.offers(step)) { await this.play(step); } }
    await this.play('To the Fourways', 'Into the Drum and Whistle', 'Ask Hepzibah what is in the heap of letters', 'Out to the Fourways');
    return this;
  }
  // Wait an hour at a time until a condition holds (a night is a clock hour, not a count of waits).
  async until(done: () => boolean, max = 48) { for (let i = 0; i < max && !done(); i++) { await this.play('Wait › An hour'); } expect(done()).toBe(true); return this; }
  // Wait a watch (ten minutes) at a time, for a beat whose deadline is an hour.
  async untilFine(done: () => boolean, max = 240) { for (let i = 0; i < max && !done(); i++) { await this.play('Wait › A while'); } expect(done()).toBe(true); return this; }
  hour() { return this.measure('hour', 'clock'); }
  async waits(n: number) { for (let i = 0; i < n; i++) { await this.play('Wait › An hour'); } return this; }
}
