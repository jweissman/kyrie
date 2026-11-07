import plants from '../../data/catalog/plants.json';
import type { Instance } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { Canon } from '../canon/canon';

// Remedies of what grows (the owner, 6 November: the plants' uses, so that what is gathered can be made into
// something, without a second item system): a herb good for healing laid on with bandages makes a herb poultice; one
// good as medicine, steeped with healing herbs, a minor potion of healing; one that purifies, boiled with healing
// herbs, an antidote. Each a recipe of the making rules (data/rules/making.kyr), a mender's work that can spoil, made
// for every herb a world holds. The authored recipes (steeped willow, dandelion tisane) stand beside them.
export class HerbRecipes {
  static readonly by: [string, string, string, string][] = [
    ['healing', 'bandages', 'herb_poultice', 'laid on with a bandage'],
    ['medicine', 'herbs', 'minor_healing_potion', 'steeped with healing herbs'],
    ['purification', 'herbs', 'antidote', 'boiled down with healing herbs']];
  static declare(instance: Instance) {
    const module = instance.module;
    if (!module.relations.some(r => r.name === 'takes')) { return; }
    const kinds = new Set(module.entities.filter(e => e.type === 'itemkind').map(e => e.id)), authored = HerbRecipes.pairs(instance);
    const all = plants.plants as Record<string, { name: string; yields?: string; uses?: string[] }>;
    for (const [id, p] of Object.entries(all)) {
      const herb = p.yields === id ? `${id}_gathered` : p.yields;
      if (!herb || !kinds.has(herb)) { continue; }
      for (const [use, aid, made, how] of HerbRecipes.by.filter(([u]) => (p.uses ?? []).includes(u))) {
        if (authored.has(`${herb},${aid}`)) { continue; }
        HerbRecipes.recipe(instance, { herb, name: p.name.toLowerCase(), use, aid, made, how });
      }
    }
  }
  // The two kinds an authored recipe already takes (steeped willow: willow bark and herbs), so no second recipe of the
  // same two is offered beside it under the same name.
  private static pairs(instance: Instance): Set<string> {
    const first = HerbRecipes.facts(instance, 'takes'), second = HerbRecipes.facts(instance, 'takesWith');
    return new Set([...first].flatMap(([r, k]) => second.has(r) ? [`${k},${second.get(r)}`] : []));
  }
  private static facts(instance: Instance, name: string): Map<string, string> {
    return new Map(instance.module.initial.flatMap(i => i.kind === 'assert' && i.call.kind === 'call'
      && i.call.name === name ? [[i.call.args[0]!, i.call.args[1]!] as const] : []));
  }
  private static recipe(instance: Instance, r: { herb: string; name: string; use: string; aid: string; made: string;
    how: string }) {
    const module = instance.module, id = `${r.herb}_${r.use}`;
    for (const kind of [r.aid, r.made]) {
      if (!module.entities.some(e => e.id === kind)) {
        module.entities.push({ id: kind, type: 'itemkind', name: Canon.items[kind]?.name ?? kind });
      }
    }
    module.entities.push({ id, type: 'recipe', name: `${r.name} ${r.how}` });
    module.initial.push(...[['takes', id, r.herb], ['takesWith', id, r.aid], ['makes', id, r.made], ['remedy', id]]
      .map(([name, ...args]) => ({ kind: 'assert' as const, call: ModuleWriter.call(name!, ...args) })));
  }
}
