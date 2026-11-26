import type { ItemCatalog, ItemDefinition } from '../item-catalog';
import type { World } from '../lang/world';
import type { Names } from './known-names';

// What a thing for sale is beside what its buyer has on in the same place (body, hand): armour that turns less than
// the scale mail worn, a weapon lighter than the longsword carried, said on the purchase before it is made (the cold
// review of 1 November: inferior chitin armour bought with nothing to compare it to).
export class PurchaseCompare {
  static versus(catalog: ItemCatalog, world: World, kind: string, at: { recipient: string; names: Names }): string {
    const { recipient, names } = at, it = catalog.find(kind), slot = it?.slot;
    if (!it || !slot || !world.relates('wearing')) { return ''; }
    const worn = world.related('wearing').filter(r => r.args[1] === recipient).map(r => r.args[0]!)
      .find(id => catalog.find(world.one('itemKind', id) ?? '')?.slot === slot);
    const had = worn && catalog.find(world.one('itemKind', worn) ?? '');
    if (!worn || !had) { return ''; }
    const [mine, theirs] = [this.strength(it), this.strength(had)];
    if (mine === undefined || theirs === undefined) { return ''; }
    const yours = `your ${names.get(worn) ?? had.name.toLowerCase()}`.replace(/^your (a|an|the) /, 'your ');
    return mine > theirs ? ` · better than ${yours}` : mine < theirs ? ` · worse than ${yours}` : ` · as good as ${yours}`;
  }
  // Armour by what it turns; a weapon by its die's average blow.
  private static strength(it: ItemDefinition): number | undefined {
    if (it.armorAc !== undefined || it.armor) { return it.armorAc ?? it.armor?.ac; }
    const dice = it.weapon && /(\d+)d(\d+)/.exec(String((it.weapon as { damage?: string }).damage ?? ''));
    return dice ? Number(dice[1]) * (Number(dice[2]) + 1) / 2 : undefined;
  }
}
