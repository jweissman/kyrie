// Scratch: item kinds that can be had in play with no plate to draw them by, by catalog file.
const W = process.env.W ?? process.cwd();
const { Canon } = await import(`${W}/src/canon/canon`);
const { CanonValidation } = await import(`${W}/src/canon/canon-validation`);
const { readFileSync } = await import('node:fs');
const plants = JSON.parse(readFileSync(`${W}/data/catalog/plants.json`, 'utf8'));
const yields = new Set<string>();
const P = plants.plants ?? plants.species ?? plants;
for (const p of Object.values(P) as any[]) for (const k of [p.yields, p.harvest, p.gives, p.item].flat().filter(Boolean)) yields.add(typeof k === 'string' ? k : k.item ?? k.id);
const byFile: Record<string, string[]> = {};
for (const f of ['natural', 'consumables', 'gear', 'valuables', 'gems', 'arms', 'armour', 'wonders']) {
  const d = JSON.parse(readFileSync(`${W}/data/catalog/items/${f}.json`, 'utf8')), items = d.items ?? d;
  for (const id of Object.keys(items)) {
    const plate = Canon.items[id]?.portrait;
    if (!plate || !CanonValidation.paintings.has(plate)) (byFile[f] ??= []).push(id + (plate ? `(${plate}?)` : ''));
  }
}
console.log('plant yields:', yields.size, [...yields].filter(y => { const p = Canon.items[y]?.portrait; return !p || !CanonValidation.paintings.has(p); }).join(', ') || 'all drawn');
for (const [f, ids] of Object.entries(byFile)) console.log(f, ids.length, ids.slice(0, 40).join(', '));
const { ItemPlates } = await import(`${W}/src/paintings/item-plates`);
console.log('after: plant yields still undrawn:', [...yields].filter(y => !ItemPlates.kind(y)).join(', ') || 'none');
