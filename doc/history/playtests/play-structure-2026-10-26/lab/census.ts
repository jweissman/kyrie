import { AutoplayRun } from '../../../../src/autoplay/run';
import { Advancement } from '../../../../src/rules/advancement';
import { ModuleWriter } from '../../../../src/lang/module-writer';
const seed = process.argv[2]!, origin = process.argv[3] ?? 'debt';
const s = await AutoplayRun.start({ seed, origin, protagonist: { name: 'P', raceId: 'human', classId: 'warrior' }, policy: 'wander', steps: 0 });
const c: any = s.campaign, w = c.world, m = c.module;
const facts: any[] = [...w.allFacts()];
const measures: any[] = [...w.allMeasures()];
const num = (name: string, ...args: string[]) => { try { return w.number(ModuleWriter.call(name, ...args)); } catch { return 0; } };
const atOf = new Map<string, string>(); for (const f of facts) if (f.name === 'at') atOf.set(f.args[0], f.args[1]);
const kindOf = new Map<string, string>(); for (const f of facts) if (f.name === 'itemKind') kindOf.set(f.args[0], f.args[1]);
const name = (id: string) => m.entities.find((e: any) => e.id === id)?.name ?? id;
const siteOf = (place: string) => /^region__(w\d+)_/.exec(place ?? '')?.[1];
const sites: Record<string, any> = {};
const site = (k: string) => sites[k] ??= { coin: 0, coinPiles: 0, treasure: 0, items: 0, fightXp: 0, fights: 0, places: new Set(), name: '' };
for (const e of m.entities) if (e.type === 'place') { const k = siteOf(e.id); if (k) site(k).places.add(e.id); }
for (const r of m.rules) { const k = siteOf(r.id); if (k && /_coins_counted$/.test(r.id)) { const inc = r.effects.find((x: any) => x.kind === 'increase'); site(k).coin += inc?.value?.value ?? 0; site(k).coinPiles++; } }
for (const e of m.entities) if (e.type === 'item') { const k = siteOf(atOf.get(e.id) ?? ''); const kind = kindOf.get(e.id); if (k && kind) { const v = num('worth', kind); if (v) { site(k).treasure += v; site(k).items++; } } }
for (const [g, members] of Object.entries<string[]>(c.current.inhabitants)) {
  const k = siteOf(atOf.get(g) ?? ''); if (!k || !members.length) continue;
  const auth = num('encounterXp', g);
  let xp = auth; if (!xp) { try { xp = members.reduce((a, id) => a + Advancement.worth(c.creatures.get(id)), 0) + 10 * members.length ** 2 + 25; } catch { xp = 0; } }
  site(k).fightXp += xp; site(k).fights++;
}
const top = (k: string) => { const ids = [...site(k).places]; return ids.length ? name(ids[0]) : k; };
const out = Object.entries(sites).filter(([, v]) => v.places.size >= 3).map(([k, v]) => ({ site: k, name: top(k), rooms: v.places.size, coin: v.coin, piles: v.coinPiles, treasure: v.treasure, items: v.items, fightXp: v.fightXp, fights: v.fights }));
const prices = measures.filter(x => x.call.name === 'price').map(x => x.value);
const bed = measures.filter(x => x.call.name === 'fee').map(x => x.value);
const merchantGold = facts.length && measures.filter(x => x.call.name === 'quantity' && x.call.args[1] === 'gold' && x.call.args[0] !== 'party').map(x => x.value);
const modules = new Set(m.relations.map((r: any) => /^([a-zA-Z0-9]+)__/.exec(r.name)?.[1]).filter(Boolean));
const party = c.creatures.get(c.current.partyIds[0]);
console.log(JSON.stringify({ seed, title: name('region__region'), sites: out, shopPrices: { n: prices.length, max: Math.max(...prices), sum: prices.reduce((a: number, b: number) => a + b, 0), over20: prices.filter((p: number) => p > 20).length }, fees: bed, merchantGold, startCoin: num('quantity', 'party', 'gold'), modules: [...modules], partyHp: party?.state?.hp }));
