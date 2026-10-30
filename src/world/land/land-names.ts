import tongues from 'languages';
import { Draw } from './draw';
import { RegionLand } from '../region-land';
import { CommonNames } from '../common-names';

export type Feature = 'river' | 'lake' | 'wood' | 'fen' | 'heath' | 'fell' | 'peak' | 'pass';
// A piece of the land as the folk name it: the name in their tongue, what it means, and the words it was made of.
export interface Naming { name: string; gloss: string; tongue: string; modifier: string; word: string }

// The land's own names, in the tongue of the folk who live by it: a river for its swans or its colour, a wood for
// its trees or what lives in it, a fen for its mist, a moor for its wind, the fells for their iron or their snow.
// No two are named so alike that a traveller could take one for the other, nor alike any settlement or site. The folk
// of the human heartland name their land in plain Common (the Swanbourne, Oakhurst, Snowpike), which needs no gloss.
export class LandNames {
  static readonly modifiers: Record<Feature, string[]> = {
    river: ['swans', 'white', 'black', 'gray', 'quick', 'deep', 'willow', 'birch', 'cold', 'salt', 'red', 'fish', 'wide',
      'bitter'],
    lake: ['swans', 'black', 'gray', 'deep', 'moss', 'mist', 'silver', 'pale', 'fish', 'secret', 'cold', 'moon', 'stars'],
    wood: ['oak', 'elm', 'birch', 'holly', 'pine', 'thorn', 'ash', 'bears', 'secret', 'wild', 'wolves', 'dark', 'green',
      'shadow', 'deep'],
    fen: ['black', 'gray', 'mist', 'willow', 'moss', 'bitter', 'salt', 'snakes', 'swans', 'dread', 'cold', 'wet', 'gloom'],
    heath: ['wind', 'gray', 'bitter', 'red', 'high', 'lonely', 'wide', 'wolves', 'dry', 'frost', 'cloud'],
    fell: ['iron', 'tin', 'stone', 'flint', 'high', 'lonely', 'giant', 'sharp', 'gray', 'white', 'snow', 'eagles', 'black',
      'cloudy'],
    peak: ['iron', 'stone', 'high', 'lonely', 'giant', 'sharp', 'gray', 'white', 'snow', 'eagles', 'cloudy', 'stars'],
    pass: ['narrow', 'wind', 'cold', 'bitter', 'high', 'wolves', 'snow', 'mist'],
  };
  static readonly words: Record<Feature, string[]> = { river: ['river', 'stream', 'brook'], lake: ['lake', 'mere', 'pool'],
    wood: ['forest', 'grove', 'wood'], fen: ['fen', 'marsh', 'moss'], heath: ['field', 'hill', 'edge'],
    fell: ['mountain', 'ridge', 'hill'], peak: ['peak', 'crest', 'mountain'], pass: ['pass'] };
  // How a word reads in a gloss: "swan brook", not "swans brook".
  static readonly glossed: Record<string, string> = { swans: 'swan', eagles: 'eagle', wolves: 'wolf', bears: 'bear',
    snakes: 'snake', stars: 'star' };
  // A name for a feature, drawn in order from the key, the first that no name already taken could be mistaken for.
  static name(feature: Feature, tongue: string, at: { key: string; taken: string[]; word?: string }): Naming {
    const draw = new Draw(at.key), common = tongue === 'common';
    const dictionary = common ? undefined : tongues.getDictionary(tongue);
    const words = at.word ? [at.word] : draw.shuffle(this.words[feature]);
    const pairs = draw.shuffle(this.modifiers[feature]).flatMap(m => words.map(w => [m, w] as const));
    const named = pairs.flatMap(([modifier, word]) => {
      if (!dictionary) { return CommonNames.land(feature, modifier, word).map(name => ({ modifier, word, name })); }
      try { return [{ modifier, word, name: dictionary.translate(modifier as never, word as never).trim() }]; }
      catch { return []; }
    });
    const chosen = named.find(n => at.taken.every(t => !RegionLand.confusable(n.name, t))) ?? named[0]!;
    at.taken.push(chosen.name);
    return { name: chosen.name, gloss: common ? '' : `${this.glossed[chosen.modifier] ?? chosen.modifier} ${chosen.word}`,
      tongue: dictionary?.name ?? 'Common', modifier: chosen.modifier, word: chosen.word };
  }
}
