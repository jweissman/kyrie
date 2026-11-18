import sky from '../../data/imbar/sky.json';
import { Canon } from '../canon/canon';

// What the sky one is born under gives (the owner, 18 November, OR-89: "there should probably be perk selection
// happening when you select a star-sign"): each of Imbar's twelve signs offers two gifts, traits of the sign category
// (data/catalog/traits.json), and one born under it chooses one at creation. A gift is held as any trait is, its
// modifiers and perks the rules' own; one of another sign's is refused.
export class SkyGifts {
  static of(sign?: string): string[] { return sky.signs.find(s => s.id === sign)?.gifts ?? []; }
  // The gift held by one made with it: none, or the one chosen, checked.
  static held(sign: string | undefined, gift: string | undefined, who: string): string[] {
    return gift ? [SkyGifts.check(sign, gift, who)] : [];
  }
  // The gift chosen, if it is one the sign gives (else an error naming both).
  static check(sign: string | undefined, gift: string, who: string): string {
    if (!SkyGifts.of(sign).includes(gift) || Canon.traits[gift]?.category !== 'sign') {
      throw new Error(`${who}: ${gift} is not a gift of ${sign ?? 'no sign'}`);
    }
    return gift;
  }
}
