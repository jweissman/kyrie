// The perks a life may begin with, one of each of the Atlas's five families (the owner, 26 November: "perk selection at
// startup is very important for character differentiation"; perks organised by the Atlas's tones; OR-153): gold's
// wisdom and insight, blue's perception and lore, red's tactics, green's trade, violet's mathematics (proof, and the
// Mathematical Age's relics). Each is a trait of the perk category (data/catalog/traits.json), held as any trait is;
// the lens each will earn comes with the surfaces compactification earns. The tone is the family's, for the reference
// to say; no row is coloured by it.
export class CreationPerks {
  static readonly offered: readonly (readonly [string, 'gold' | 'blue' | 'red' | 'green' | 'violet'])[] = [
    ['far_seeing', 'gold'], ['keen_eyed', 'blue'], ['tactician', 'red'], ['haggler', 'green'],
    ['mathematician', 'violet']];
  // Each perk's emblem, of those the page draws (data: Emblems).
  static readonly emblems: Readonly<Record<string, string>> = { far_seeing: 'wise', keen_eyed: 'sight',
    tactician: 'discipline', haggler: 'life_trade', mathematician: 'craft' };
  // What a perk is said to be where it is considered: what it is, in its first words, then what it buys in play
  // (OR-1684): "Knows what things are worth and how to talk a price down. Persuasion +2, for talking people round."
  static said(perk: { line: string; buys?: string }): string {
    const what = perk.line.split(':')[0]!.replace(/\.$/, '');
    return perk.buys ? `${what}. ${perk.buys.charAt(0).toUpperCase()}${perk.buys.slice(1)}.` : perk.line;
  }
  // The one a life begun at once is given, by its name, so the same life is given the same.
  static drawn(name: string): string {
    const n = [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    return this.offered[n % this.offered.length]![0];
  }
}
