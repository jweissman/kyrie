import { Content } from '../content';
import { RandomStreams } from '../random-streams';
import { GenerationSetting } from '../generation-setting';
import type { Atlas } from './land/atlas';
import type { Seat as Seated } from './land/settling';
import type { Region, Settlement } from './region-writer';

// Where a region's people live and what they live by: a settlement on each seat its atlas found (the first the
// town), each living by what lies around it.
export class Livelihoods {
  // The region's settlements where its atlas settled people, the first the town; each lives by what lies around it.
  static seat(region: Region, atlas: Atlas, seed: string): Region {
    const used = new Set<string>();
    const settlements = atlas.seats.map((seat, i) => {
      const drawn = region.settlements[i] ?? new Content(RandomStreams.key(seed, 'world', 'settlement', i))
        .generate('settlement', { terrain: region.terrain, ancestry: region.ancestry, _index: i }) as unknown as Settlement;
      return { ...drawn, id: `s${i + 1}`, size: seat.size, cell: seat.cell, ...this.livelihood(region, seat, { drawn, used }) };
    });
    return { ...region, atlas, settlements };
  }
  // What a settlement lives by, from what lies around it: the sea, a fen, the fells, woods, moor or fields.
  static readonly livelihoods: Record<string, Partial<Record<Seated['lie'][number], string>>> = {
    forest: { harbour: 'salt', coast: 'salt', fen: 'reed', fells: 'slate', woods: 'timber', heath: 'honey', meadows: 'honey' },
    marsh: { harbour: 'salt', coast: 'salt', fen: 'eels', fells: 'slate', woods: 'charcoal', meadows: 'reed' },
    mountain: { harbour: 'salt', coast: 'salt', fen: 'peat', fells: 'tin', woods: 'charcoal', heath: 'wool', meadows: 'wool' },
    frost: { harbour: 'whale oil', coast: 'whale oil', fen: 'peat', fells: 'slate', woods: 'furs', heath: 'furs' } };
  // The most telling of what lies around it (the sea before the fen, the fen before the fells, the fells before the
  // woods), and one its neighbours do not already live by when it can.
  private static livelihood(region: Region, seat: Seated, at: { drawn: Settlement; used: Set<string> }):
    Pick<Settlement, 'trade' | 'merchantType'> {
    const table = this.livelihoods[region.terrain] ?? {};
    const fits = (Object.keys(table) as Seated['lie'][number][]).filter(l => seat.lie.includes(l)).map(l => table[l]!);
    const trade = fits.find(t => !at.used.has(t)) ?? fits[0] ?? at.drawn.trade;
    at.used.add(trade);
    const merchants = (GenerationSetting.tables as unknown as { tradeMerchant: { groups: Record<string, string[]> } })
      .tradeMerchant.groups[trade];
    return { trade, merchantType: merchants?.[0] ?? at.drawn.merchantType ?? 'chandler' };
  }
}
