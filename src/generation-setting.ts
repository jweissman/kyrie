import creatureTables from '../data/generation/tables/creatures.json';
import dragonTables from '../data/generation/tables/dragons.json';
import nameTables from '../data/generation/tables/names.json';
import placeTables from '../data/generation/tables/places.json';
import creatureTemplates from '../data/generation/templates/creatures.json';
import dragonTemplates from '../data/generation/templates/dragons.json';
import placeTemplates from '../data/generation/templates/places.json';
import backgroundTables from '../data/catalog/backgrounds.json';
import tradeTables from '../data/generation/tables/trade.json';
import peopleTables from '../data/generation/tables/peoples.json';
import ecologyTables from '../data/generation/tables/ecology.json';

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
  // The background tables are the catalog's own (what each kind of background means), so templates can draw a
  // background of a kind: lookup(backgroundKind, wild).
  static readonly tables = GenerationSetting.merge<Record<string, unknown>>(creatureTables, dragonTables, nameTables,
    placeTables, tradeTables, peopleTables, ecologyTables,
    GenerationSetting.tablesOf(backgroundTables)) as typeof creatureTables
    & typeof dragonTables
    & typeof nameTables & typeof placeTables & typeof tradeTables;
  static tablesOf<T extends { about?: string }>(file: T): Omit<T, 'about'> {
    const tables = { ...file };
    delete tables.about;
    return tables;
  }
  static readonly templates = GenerationSetting.merge<Record<string, unknown>>(creatureTemplates, dragonTemplates,
    placeTemplates) as typeof creatureTemplates & typeof dragonTemplates & typeof placeTemplates;
}
