// What a line of the telling is, said by the engine that wrote it, so that no client reads it back from its words
// (AR-05, MT-18's remainder: the page had read "seen through", "reaches level", a roll's sum and a panorama's bearings
// out of the sentences, each a regex over prose that a rewording would have silently broken).
// A roll made outside a fight, as it fell (CombatPresenter.check and .save): the face that came up, when the die was
// rolled; the least face that would have done it (2 to 20 for a roll; 1 when nothing was needed of luck, 21 when no
// luck could have done it); whether it was done; unrolled, sure when it could not fail.
export interface Throw {
  who: string; what: string; kind: 'check' | 'save'; die?: number; need: number; made: boolean; sure?: boolean;
}
// Something seen through, worth experience to who gained it ("Elen and Bran each gain 300 experience: the fever").
export interface Ended { who: string; gain: string; amount: string; what: string }
// A level gained, and the hit points it gave.
export interface Levelled { who: string; level: string; hp: string }
// One part of what is seen from up high (Mission 17's vantage points, see RegionSights): a sight round the compass,
// the knowing of it by its look, whose knowledge that was, the way to it, and over a march what lies beyond.
export type SightPart = { part: 'sight'; bearing: string; distance: string; place: string }
  | { part: 'known'; place: string } | { part: 'credit' } | { part: 'way'; way: string } | { part: 'beyond'; beyond: string };
export interface Typed { ended?: Ended; levelled?: Levelled; roll?: Throw; sight?: SightPart }
export class LineMoments {
  static readonly ending = /^(.+?) (each gain|gains) (\d+) experience: (.+), seen through\.$/;
  static readonly levelling = /^(.+) reaches level (\d+) \(\+(\d+) HP\)\.$/;
  static readonly sightAt = new RegExp('^To the (north|north-east|east|south-east|south|south-west|west|north-west), '
    + '(not far off|some way off|a long way off|far off, through the glass): (.+)\\.$');
  static readonly known = /^You know it by its look: that is (.+)\.$/;
  static readonly credit = /^It is .+ that makes it out\.$/;
  static readonly way = /^The way to .+?: (.+)\.$/;
  static readonly beyond = /^Beyond it, over the march: (.+)\.$/;
  static readonly rolled = new RegExp(String.raw`^(.+?) (makes|fails) the (.+?) check \(d20 (\d+) \+ .+ = (-?\d+)`
    + String.raw` against (\d+)(?:; natural twenty resolves mathematics)?\)\.$`);
  static readonly unrolled = new RegExp(String.raw`^(.+?) (needs no luck for it|has no chance of it) \((.+?): `
    + String.raw`(?:at (?:worst|best) (-?\d+)|by proof) against (\d+)\)\.$`);
  static readonly saved =
    /^(.+?) (passes|fails) the (.*?) save \(d20 (\d+) \+ .+ = (-?\d+) against (\d+)(?:; [^)]+)?\)\.$/;
  // Each line with what it is, where it is one of these; the rest as they were.
  static typed<L extends { text: string }>(lines: L[]): (L & Typed)[] {
    return lines.map(l => ({ ...l, ...this.of(l.text) }));
  }
  static of(text: string): Typed {
    const e = this.ending.exec(text), v = this.levelling.exec(text), roll = this.roll(text), sight = this.sight(text);
    return { ...e ? { ended: { who: e[1]!, gain: e[2]!, amount: e[3]!, what: e[4]! } } : {},
      ...v ? { levelled: { who: v[1]!, level: v[2]!, hp: v[3]! } } : {}, ...roll ? { roll } : {},
      ...sight ? { sight } : {} };
  }
  private static sight(text: string): SightPart | undefined {
    const m = this.sightAt.exec(text), k = this.known.exec(text), w = this.way.exec(text), b = this.beyond.exec(text);
    return m ? { part: 'sight', bearing: m[1]!, distance: m[2]!, place: m[3]! } : k ? { part: 'known', place: k[1]! }
      : this.credit.test(text) ? { part: 'credit' } : w ? { part: 'way', way: w[1]! }
      : b ? { part: 'beyond', beyond: b[1]! } : undefined;
  }
  static roll(text: string): Throw | undefined {
    const plain = this.unrolled.exec(text);
    if (plain) {
      const [, who, said, what] = plain, sure = said === 'needs no luck for it';
      return { who: who!, what: this.named(what!), kind: 'check', need: sure ? 1 : 21, made: sure, sure };
    }
    const check = this.rolled.exec(text), save = check ? undefined : this.saved.exec(text), m = check ?? save;
    if (!m) { return undefined; }
    const [, who, said, what, die, total, against] = m, face = Number(die);
    const need = Math.min(20, Math.max(2, Number(against) - (Number(total) - face)));
    return { who: who!, what: this.named(what!), kind: check ? 'check' : 'save', die: face, need,
      made: said === 'makes' || said === 'passes' };
  }
  // A skill as the page says it ("sleight_of_hand" is "sleight of hand").
  private static named(skill: string): string { return skill.replace(/_/g, ' ').trim(); }
}
