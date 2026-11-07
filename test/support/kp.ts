import { readFileSync } from 'node:fs';
import { Journey } from '../../src/session/journey';

// The King's Players, played by label from the Trial's verdict. No teleports: every step is a choice the page offers.
export const city = 'test/fixtures/gosse/city.campaign.json';
export const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
export class KP {
  constructor(readonly j: Journey) {}
  static async start(seed = 'g1') { return new KP(await Journey.start(city, seed)); }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  offers(label: string) { return this.j.offers(label); }
  natural = false; // true: nothing is forced; the dice fall where the seed puts them
  pass() { if (!this.natural) {this.j.roll('pass');} }
  unforce() { this.j.roll(undefined); }
  get pages() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  reached() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
}
const steps = (name: string): string[] => {
  const ph = JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return (Array.isArray(ph) ? ph : Object.values(ph).flat()).slice(0, -1);
};
export const nod = 'Give Hepzibah the nod for the next scene';

// The Trial to the River Gate: the 'bow' fixture, the herald, the writ, East Street, the Eastgate and the King's Road.
export async function toTheCity(seed = 'g1') {
  const k = await KP.start(seed);
  await k.play(...steps('bow'));
  await k.play('Wait › An hour', 'Out to the yard of the Painted Moon', "Take the King's writ", 'Out to the Westgate', 'To the Chepe',
    'To Guildhall Square', 'To the Minster Close', 'To the Eastgate', "To the King's Road");
  await k.play('To the River Gate', 'Say who you are, since the sergeant has not asked', "We are. The Marchants' masquers, and we are late");
  return k;
}
// Act I: the Sparrow, the bill (the Miser), Gosse, and the rug.
export async function actI(k: KP) {
  await k.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Brazen Sparrow');
  if (k.offers("To the Sparrow's long loft")) {await k.play("To the Sparrow's long loft");}
  await k.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one",
    'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
  if (k.offers("To the Brazen Sparrow's taproom")) {await k.play("To the Brazen Sparrow's taproom");}
  await k.play('Out to Playhouse Row', 'To the Concourse of the Seven', 'To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
  k.pass();
  await k.play("Play the King The Miser's Wedding, as his grandfather had it");
  k.unforce();
}
// Act II: the Prince, the Salt-Wives, the night, and the Mousetrap in the named mode ('cancel' | 'point').
export async function actII(k: KP, mode: 'cancel' | 'point') {
  await k.play('To the long terrace', 'Go out on the terrace and stand where the Prince can say it', "Yes. I've met two");
  await k.play('To the Audience Chamber', "Out to the King's Court", 'To the steps of the Tower of Law', 'To the Concourse of the Seven', 'To Playhouse Row', 'To the Salt Quay');
  await k.play('Into the Tower of Salt', 'Ask the Salt-Wives what keeps a dead thing out of a house', 'Silence. When they stop listening');
  await k.play('Out to the Salt Quay', 'To Playhouse Row', '=06:00', '=17:50', 'Into the Rotunda');
  await k.play('=18:10', 'Lay a line of grey salt across the threshold', "To the Rotunda's stage", "To the Rotunda's wings");
  if (mode === 'cancel') {await k.play('Ask Hepzibah to prompt the Mousetrap', 'No name. Cancel the trap. Play something else', '=06:30');}
  else {
    await k.play('Ask Hepzibah to prompt the Mousetrap', "The Marshal's. Plainly", '=21:05');
    k.pass(); // the one throw that decides the night: the play lands on the Marshal
    await k.play('Give the signal for the curtain, and the play', '=06:30');
    k.unforce();
  }
}
// From the wings to the King's Tower, to the Bells, to the Field: the walks of Act III.
export const wingsToTower = (k: KP) => k.play("To the Rotunda's stage", "To the Rotunda's front of house", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
// Acts IV and V in the shortest honest way: the Wick given, the opening night waited out, the Command played.
export async function actIVquick(k: KP) {
  await k.play('=+144', '=+144', '=+144', '=19:10', '=22:10');
}
export async function actV(k: KP, opts: { chorus?: boolean } = {}) {
  await k.play('=+144', '=+144', '=+144', '=19:10');
  for (let n = 0; n < 7; n++) {
    await k.play(nod);
    if (n === 5 && opts.chorus) {await k.play('Give Gosse the Chorus, and let him say it as it is written');}
  }
  await k.play('Take the company down for the call, in front of the bear');
}
