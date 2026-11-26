import { Tiny } from './tiny';
import { Content } from '../../src/content';
import { ItemCatalog } from '../../src/item-catalog';
import { Canon } from '../../src/canon/canon';
import { PlayerView } from '../../src/presentation/player-view';

// A world played with the shared definitions frozen (test/small/frozen-definitions), in a process of its own: frozen,
// they stay so for every spec after in the same process. Says how many acts were done, or fails on a change.
function freeze<T>(value: T, seen = new Set<unknown>()): T {
  if (value && typeof value === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const v of Object.values(value)) { freeze(v, seen); }
    Object.freeze(value);
  }
  return value;
}
const yard = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Item coil "a coil of rope" is rope at yard.
  Goal false.`;
const t = await Tiny.start(yard);
freeze(Content.abilities); freeze(Content.statuses); freeze(Content.rules);
for (const d of Object.values(ItemCatalog.ambient)) { freeze(d); }
for (const s of Object.values(Canon.species)) { freeze(s); }
for (const kind of ['take_item', 'light_item', 'wait']) {
  const c = PlayerView.choices(t.campaign).map(x => x.choice.id).find(id => id.startsWith(kind));
  if (c) { await t.perform(c); }
}
const again = await Tiny.start(yard);
console.log(JSON.stringify({ acts: t.campaign.history.length, again: again.screen.place.id }));
