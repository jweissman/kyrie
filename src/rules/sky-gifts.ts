import { SettingPort } from '../setting-port';
import { Canon } from '../canon/canon';

// What the sky one is born under gives (the owner, 18 November, OR-89: "there should probably be perk selection
// happening when you select a star-sign"; OR-117: "Don't make people choose between the perk options for the birth
// sign. Just give them both things"): each of Imbar's twelve signs gives its gifts, traits of the sign category
// (data/catalog/traits.json), to everyone born under it. A gift is held as any trait is, its modifiers, perks and
// skills the rules' own.
export class SkyGifts {
  static of(sign?: string): string[] { return SettingPort.sky.signs.find(s => s.id === sign)?.gifts ?? []; }
  // One kept before every gift of a sign was given (a game saved holding the one gift chosen) holds them all on coming
  // back: what is missing of its sign's gifts is added to its traits. Nothing else is changed.
  static borne<T extends { sign?: string; traits?: string[] }>(creature: T): T {
    const gifts = SkyGifts.of(creature.sign).filter(g => Canon.traits[g]?.category === 'sign');
    if (!gifts.length || gifts.every(g => creature.traits?.includes(g))) { return creature; }
    creature.traits = [...new Set([...creature.traits ?? [], ...gifts])];
    return creature;
  }
}
