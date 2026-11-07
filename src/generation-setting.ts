import creatureTables from '../data/generation/tables/creatures.json';
import nameTables from '../data/generation/tables/names.json';
import placeTables from '../data/generation/tables/places.json';
import creatureTemplates from '../data/generation/templates/creatures.json';
import placeTemplates from '../data/generation/templates/places.json';
import backgroundTables from '../data/catalog/backgrounds.json';
import tradeTables from '../data/generation/tables/trade.json';
import peopleTables from '../data/generation/tables/peoples.json';
import ecologyTables from '../data/generation/tables/ecology.json';
import faithTables from '../data/generation/tables/faith.json';
import weatherTables from '../data/generation/tables/weather.json';
import treasureTables from '../data/generation/tables/treasure.json';
import treasureTemplates from '../data/generation/templates/treasure.json';
import gems from '../data/catalog/items/gems.json';
import { LootTables } from './loot-tables';

// Kyr's Deem setting, split by domain (who a creature is drawn as, names, places) as the Deem CLI reads the folder:
// each file adds tables or templates, and no name may be defined twice.
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
  static readonly tables = GenerationSetting.merge<Record<string, unknown>>(creatureTables, nameTables,
    placeTables, tradeTables, peopleTables, ecologyTables, faithTables, weatherTables,
    GenerationSetting.orsino(), LootTables.table(), GenerationSetting.stones(),
    GenerationSetting.tablesOf(backgroundTables)) as typeof creatureTables
    & typeof nameTables & typeof placeTables & typeof tradeTables;
  // Orsino's gemstone tables, from the catalog's stones (data/catalog/items/gems.json): the stones by rank, and the
  // cuts, sizes and clarities a stone found may have.
  // Orsino's treasure file, but its tiers: those are within the catalog's own table (see LootTables).
  static orsino(): Record<string, unknown> {
    const rest: Record<string, unknown> = { ...treasureTables };
    delete rest.treasure;
    return rest;
  }
  static stones(): Record<string, unknown> {
    const byRank: Record<string, string[]> = {}, any = GenerationSetting.any;
    for (const [id, g] of Object.entries(gems.items)) { (byRank[g.rank] ??= []).push(id); }
    return { gems: { discriminator: 'tier', groups: byRank }, gemCut: any(gems.cuts), gemSize: any(gems.sizes),
      gemQuality: any(gems.qualities) };
  }
  private static any(of: object) { return { discriminator: 'any', groups: { any: Object.keys(of) } }; }
  static tablesOf<T extends { about?: string }>(file: T): Omit<T, 'about'> {
    const tables = { ...file };
    delete tables.about;
    return tables;
  }
  static readonly templates = GenerationSetting.merge<Record<string, unknown>>(creatureTemplates,
    placeTemplates, treasureTemplates) as typeof creatureTemplates & typeof placeTemplates;
}
