import { describe, expect, it } from 'bun:test';
import table from '../../data/generation/scenes/foundings.json';

// A place's description names only what the place holds (CO-17, the owner on Wrenbridge's market: "is there even a
// fishmonger there?"): a founding's scene and life lines name no trade but its own works. The market had smelt of
// the fish-stall at the corner and had a woman cutting cheese and a man crying eels, none of whose trades it has.
// Each trade a line may name, by the words that name it; a line naming one the founding's works do not hold fails.
// A trade on offer at the place (its stall, its seller, its crier), not every object: a yard's passing cart or the
// workers' own bread and cheese are no stall.
const trades: Record<string, RegExp> = {
  fisher: /\bfish-stall\b|\bfishmonger|\bfishwife\b/i, eel_catcher: /\bprice of eels\b|\beels? for sale\b/i,
  baker: /\bbaker|\bloaves\b/i, brewer: /\bbrewer|\bale-stall\b/i, shepherd: /\bcart of fleeces\b/i,
  cowherd: /\bcuts cheese\b|\bcheese by the slice\b/i, smith: /\banvil\b|\bsmithy\b/i,
  beekeeper: /\bhoney\b/i, tinker: /\btinker\b/i, carter: /\bcarter\b/i,
};
type Founding = { works: string[]; scene?: string[] | Record<string, string[]>; life?: string[] };
describe('a founding\'s description', () => {
  it('names no trade but its own works', () => {
    const strays: string[] = [];
    for (const [kind, f] of Object.entries(table.foundings as Record<string, Founding>)) {
      const lines = [...Array.isArray(f.scene) ? f.scene : Object.values(f.scene ?? {}).flat(), ...f.life ?? []];
      for (const line of lines) {
        for (const [trade, named] of Object.entries(trades)) {
          if (named.test(line) && !f.works.includes(trade)) { strays.push(`${kind}: ${trade} in "${line.slice(0, 60)}…"`); }
        }
      }
    }
    expect(strays).toEqual([]);
  });
});
