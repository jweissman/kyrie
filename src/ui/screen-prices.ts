import { EntityIndex, ModuleWriter, type World } from '../lang/index';
import type { Campaign } from '../campaign/campaign';
import { KeptParts } from './kept-parts';

// What the screen's rows are priced at (ScreenModel's), each map kept while no read it rests on is written.
export class ScreenPrices {
  // What each item is priced at, where prices are measured: its items read by the entities' index, not every entity;
  // kept from one world to the next while no price read is written (see KeptParts).
  static items(world: World): Map<string, number> {
    if (!world.module.measures.some(m => m.name === 'price')) { return new Map(); }
    return KeptParts.of(world, 'prices', '', () => new Map(EntityIndex.of(world.module.entities).typed('item')
      .map(e => [e.id, world.number(ModuleWriter.call('price', e.id))])));
  }
  // What things cost: a service's fee, goods by the measure, and what a sale fetches (what a buyer pays for a kind, and
  // what a valuable is worth).
  static fees(campaign: Campaign): Map<string, number> {
    const world = campaign.world, measures = world.module.measures;
    return KeptParts.of(world, 'fees', `${KeptParts.token(measures)}.${measures.length}`, () => new Map([
      ...EntityIndex.of(campaign.module.entities).typed('service').map(e => [e.id, world.number(ModuleWriter.call('fee', e.id))] as const),
      ...world.measured('goodsPrice').map(m => [`${m.call.args[0]}:${m.call.args[1]}`, m.value] as const),
      ...world.measured('pays').map(m => [`pays:${m.call.args[0]}:${m.call.args[1]}`, m.value] as const),
      ...world.measured('hire').map(m => [`hire:${m.call.args[0]}`, m.value] as const),
      // What a dealer pays for a treasure, as the sale is labelled: the dealer's price, not its worth.
      ...world.measured(world.module.measures.some(m => m.name === 'dealerPays') ? 'dealerPays' : 'worth')
        .map(m => [`worth:${m.call.args[0]}`, m.value] as const)]));
  }
}
