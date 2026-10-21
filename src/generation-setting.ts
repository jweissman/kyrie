import creatureTables from '../data/generation/tables/creatures.json';
import dragonTables from '../data/generation/tables/dragons.json';
import nameTables from '../data/generation/tables/names.json';
import placeTables from '../data/generation/tables/places.json';
import creatureTemplates from '../data/generation/templates/creatures.json';
import dragonTemplates from '../data/generation/templates/dragons.json';
import placeTemplates from '../data/generation/templates/places.json';

// Kyr's Deem setting, split by domain (creatures, dragons, names, places) as the Deem CLI reads the folder: each
// file adds tables or templates, and no name may be defined twice.
export class GenerationSetting {
  static merge<T extends object>(...parts: T[]): T {
    const merged: Record<string, unknown> = {};
    for (const part of parts) {
      for (const [name, value] of Object.entries(part)) {
        if (name in merged) { throw new Error(`${name} is defined twice in the generation setting`); }
        merged[name] = value;
      }
    }
    return merged as T;
  }
  static readonly tables = GenerationSetting.merge<Record<string, unknown>>(creatureTables, dragonTables, nameTables,
    placeTables) as typeof creatureTables & typeof dragonTables & typeof nameTables & typeof placeTables;
  static readonly templates = GenerationSetting.merge<Record<string, unknown>>(creatureTemplates, dragonTemplates,
    placeTemplates) as typeof creatureTemplates & typeof dragonTemplates & typeof placeTemplates;
}
