import { Canon } from '../canon/canon';
import { Content } from '../content';
import { ItemCatalog } from '../item-catalog';
import { Overlays } from '../overlays';
import type { Ledger } from './orsino-registry';
import { CreatureVariants } from '../creature-variants';

// The Kyr side of an adaptation record: each linked id names a definition in a canonical catalog, and a definition
// claimed executable must pass that catalog's own validation.
export class KyrLinks {
  static exists(link: string): boolean {
    const [family, id = ''] = link.split(/:(.*)/s);
    switch (family) {
      case 'background': return Object.hasOwn(Canon.backgrounds, id);
      case 'item': return Object.hasOwn(Canon.items, id);
      case 'ability': return Object.hasOwn(Canon.abilities, id);
      case 'condition': return Object.hasOwn(Canon.conditions, id);
      case 'trait': return Object.hasOwn(Canon.traits, id);
      case 'ancestry': return Canon.isAncestry(id);
      case 'species': return Canon.isSpecies(id);
      case 'class': return Object.hasOwn(Canon.classes, id);
      case 'save': return Object.hasOwn(Canon.rules.saveKinds, id);
      case 'damage': return Canon.rules.damageTypes.includes(id);
      case 'deity': return Object.hasOwn(Canon.deities, id);
      case 'domain': return Object.hasOwn(Canon.domains, id);
      case 'aspect': return !!CreatureVariants.aspect(id);
      case 'undead': return !!CreatureVariants.template(id);
      case 'rarity': return Object.hasOwn(CreatureVariants.table.rarity, id);
      default: return false;
    }
  }
  static problems(ledger: Ledger): string[] {
    const problems: string[] = [];
    for (const r of ledger.records) {
      for (const link of r.kyr.filter(l => !this.exists(l))) { problems.push(`${r.orsino}: unknown Kyr definition ${link}`); }
      if (r.support === 'represented') { continue; }
      for (const link of r.kyr.filter(l => this.exists(l))) {
        try { this.validate(link); } catch (error) { problems.push(`${r.orsino}: ${link}: ${(error as Error).message}`); }
      }
    }
    return problems;
  }
  private static validate(link: string) {
    const [family, id] = link.split(/:(.*)/s) as [string, string];
    if (family === 'background') {
      const o = Overlays.get(id);
      Overlays.validate({ classId: o.requiredClass, ...o.role === 'background' ? { backgroundId: id } : { professionId: id } }, id);
    }
    if (family === 'item') {
      const item = ItemCatalog.get(id);
      if (item.ability && !Content.abilities.some(a => a.id === item.ability)) { throw new Error(`grants unknown ${item.ability}`); }
    }
    if (family === 'ability') { Content.validate(); }
  }
}
