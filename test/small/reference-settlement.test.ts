import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../../src/world/world-assembler';
import { RegionWriter } from '../../src/world/region-writer';
import { ReferenceSettlement } from '../../src/world/reference-settlement';
import { Canon } from '../../src/canon/canon';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { QuantityLadder } from '../../scripts/quantity/ladder';

// The reference game's settlement (the owner, 25 November: doc/design/direction-2026-11-25-reference-game.md §2;
// register OR-611). The first town of a forest country, the terrain the first country draws most often (16 of 40
// seeds; marsh 11, mountain 7, frost 6), but for the worlds the specs walk by name (kite, kahitude), works three ways
// and has nothing else: Trader 1 sells provisions and gear and buys what comes back, Trader 2 sells what the country
// gives and buys what the woods give, and the shrine rests, heals and keeps the altar. Kite's Newmeet, written as
// before, has a chandlery, a general store, shops, a Hall, a hill of old stones, a roster of townsfolk and a notice of
// troubles under the town. The old woods lie beside it, and the deep place under them is reached from the fallen
// stones, found by searching. A country of another terrain keeps its first town as it was (Iscoed's Porthalen, a
// marsh's). The country's text only, no world.
const written = (seed: string) => {
  const region = WorldAssembler.region(seed, [0, 0]), t = region.settlements[0]!.id;
  const text = RegionWriter.source(region, { size: 1, contacts: [] }, {}, CanonVocabulary.context());
  return { region, t, text, people: [...text.matchAll(new RegExp(`^\\s*Person (${t}_\\w+) `, 'gm'))].map(m => m[1]!) };
};
describe('the reference game\'s settlement', () => {
  it('is the first town of a forest country, and only of one', () => {
    const s0 = WorldAssembler.region('s0', [0, 0]), iscoed = WorldAssembler.region('iscoed', [0, 0]);
    expect([s0.terrain, ReferenceSettlement.of(s0)?.name, iscoed.terrain, ReferenceSettlement.of(iscoed)])
      .toEqual(['forest', 'Oakhythe', 'marsh', undefined]);
    expect(ReferenceSettlement.is({ ...s0, at: [0, 1] } as typeof s0, s0.settlements[0]!)).toBe(false);
    // A forest world the specs walk by name keeps the first town they were written against (OR-645).
    const kite = WorldAssembler.region('kite', [0, 0]);
    expect([kite.terrain, ReferenceSettlement.of(kite)]).toEqual(['forest', undefined]);
  });
  it('has two traders and a shrine-keeper, someone who would come along, and its old woods', () => {
    const { t, text, people } = written('s0');
    // (Its road's travellers are the road's, s1_s4_way_t: not the town's.)
    const own = people.filter(p => !new RegExp(`^${t}_(wood_|ud|s\\d+_way)`).test(p));
    expect(own.sort()).toEqual([`${t}_innkeeper`, `${t}_merchant`, `${t}_priest`, `${t}_traveller`]);
    const places = [...text.matchAll(new RegExp(`^\\s*Place (${t}_\\w+) .* is room within ${t} `, 'gm'))].map(m => m[1]!);
    expect(places.sort()).toEqual([`${t}_green`, `${t}_room`, `${t}_shop`, `${t}_shrine`, `${t}_taproom`, `${t}_ud`].sort());
    // No chandlery, general store, Hall or hill, notice of troubles, nor a letter sent up.
    expect(text).not.toMatch(new RegExp(`${t}_(chandlery|general|manor|stones_top|u_notice|letter_sent_up)\\b`));
    // The loft is the long haul's (OR-1130): asked for only once the company has been below.
    expect(text).toContain(`Topic ${t}_room_rent with ${t}_innkeeper "Ask {${t}_innkeeper} for the loft, by the week" when been(actor, ${t}_ud) and not`);
    // Trader 1 sells provisions, light and arms, and buys valuables; Trader 2 buys what is gathered.
    const person = (id: string) => new RegExp(`^\\s*Person ${id} [^\\n]*`, 'm').exec(text)![0];
    expect(person(`${t}_merchant`)).toMatch(/Sells rations .* Sells torch .* Sells spear /);
    // And a dearer shelf, the economy's first rung (OR-1127): each at its catalog worth, beyond a start's purse.
    for (const [what, fee] of ReferenceSettlement.dearer) {
      expect(person(`${t}_merchant`)).toContain(`Sells ${what} for ${fee} coin from 1.`);
      expect(Canon.items[what]?.value).toBe(fee);
      expect(fee).toBeGreaterThanOrEqual(30);
    }
    // And Trader 2's chest, the ladder above it (OR-1124): the SRD's wonders, each at its catalog worth, one of each.
    for (const [what, fee, n] of ReferenceSettlement.chest) {
      expect(person(`${t}_innkeeper`)).toContain(`Sells ${what} for ${fee} coin from ${n}.`);
      expect([Canon.items[what]?.value, n]).toEqual([fee, 1]);
      expect(Canon.items[what]?.source?.orsino).toBeTruthy();
    }
    // Every rung of the ladder has a ware on it, each a few times the last's dearest.
    const wares = [...ReferenceSettlement.provisions, ...ReferenceSettlement.arms, ...ReferenceSettlement.dearer,
      ...ReferenceSettlement.remedies, ...ReferenceSettlement.chest];
    const on = QuantityLadder.rungs.map(r => wares.filter(([, fee]) => fee >= r.floor && fee <= r.ceiling)
      .map(w => w[1]));
    expect(on.map(fees => fees.length > 0)).toEqual([true, true, true, true]);
    expect(Math.max(...on[0]!)).toBeLessThanOrEqual(25);
    expect([Math.max(...on[1]!), Math.min(...on[2]!), Math.max(...on[2]!), Math.min(...on[3]!)])
      .toEqual([250, 300, 1200, 2500]);
    expect(text).toContain(`Initially Assert buysValuables(${t}_merchant).`);
    expect(person(`${t}_innkeeper`)).toMatch(/Buys herbs for \d+ coin/);
    // Trader 2 buys back the wonders the chest holds, at half their worth, as far as the purse goes (OR-1621).
    expect(text).toContain(`Initially Assert dealsIn(${t}_innkeeper, trade_rare).`);
    expect(person(`${t}_priest`)).toMatch(/Offers lodging .* Offers healing /);
    expect(text).toContain(`Initially Assert restful(${t}_shrine).`);
    // The woods are entered from the heart; the way down is found at the fallen stones.
    expect(text).toContain(`is path between ${t}_green and ${t}_wood_edge`);
    expect(text).toMatch(new RegExp(`Passage ${t}_wood_down .* between ${t}_wood_stones and ${t}_ud hidden until ${t}_wood_door`));
  });
  it('says of the deep place under the woods only what is so there: no town over it (OR-643)', () => {
    const { t, text } = written('s0');
    const deep = text.split('\n').filter(l => new RegExp(`\\b${t}_ud`).test(l)).join('\n');
    expect(deep).toContain('the old dead under the beeches');
    expect(deep.match(/under Oakhythe|the town was built|smelling of the town|town's cellars/g)).toBeNull();
  });
  it('has its shrine-keeper say what each depth below the first wants, once the company has been above it (OR-644)', () => {
    const { t, text } = written('s0');
    const from = text.indexOf(`Topic ${t}_ud_counsel_2`), counsel = text.slice(from, text.indexOf(`Topic ${t}_ud_counsel_3`)
      + 600);
    // s0's halls of the dead keep bone hounds by the well and a mummy among their dwellers (every room of them has
    // some, OR-1234); under the halls lies the king, a mummy.
    expect(counsel).toContain('Topic s1_ud_counsel_2 with s1_priest "Ask {s1_priest} what lies past the passage-grave"'
      + ' when been(party, ?p) and deepLevelOf(?p, s1_ud_barrow)');
    const second = counsel.slice(0, counsel.indexOf('counsel_3'));
    expect(second).toContain('Take fire');
    expect(second).toContain('a club');
    expect(counsel).toMatch(/counsel_3[^]*Take fire/);
    expect(counsel).not.toMatch(/counsel_3[^]*a club/);
    expect(text).toMatch(new RegExp(`Person ${t}_merchant .*Sells oil_firebomb .*Sells club `));
  });
  it('leaves a first town of another terrain as it was', () => {
    const { t, text } = written('iscoed');
    expect(text).toContain(`${t}_u_notice`);
    expect(text).not.toContain(`${t}_wood_edge`);
  });
});
