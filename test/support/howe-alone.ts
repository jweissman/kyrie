import { Alone } from './alone';
import { Placed } from './placed';
import { FOUR } from './howe-reading';
import type { CreatureGenerationContext } from '../../src/content';
import type { Journey } from '../../src/session/journey';

// The Bound Howe (data/situations/bound-howe) as a targeted scenario: the situation's own module on the shared rules,
// its imports bound to a host of a few lines instead of a generated country (see Alone). For the situation's own
// rules: its clock, its rival company, its levy, its face and seal. The host's town is the one nearest the howe (its
// green, taproom and shrine); its first town tells of it too. The seed is one whose draw sealed the howe from within,
// as a1's did (`HoweAlone.fate` says which).
const host = (size: number) => `
  Place land "the downs" is wilderness at 0, 0.
  Place outside "below the howe" is room within land at 0, 0 outdoors.
  Place town "Barrowby" is settlement.
  Place green "the green" is room within town at 0, 0 outdoors.
  Place taproom "the taproom" is room within town at 1, 0.
  Place shrine "the shrine" is room within town at 0, 1.
  Place first "Hythe" is settlement.
  Place first_green "the green at Hythe" is room within first at 0, 0 outdoors.
  Place first_taproom "the taproom at Hythe" is room within first at 1, 0.
  Person keeper "Mag" at taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns she. }
  Person priest "Father Odo" at shrine { Role "the priest". Ancestry human. Peaceable. Pronouns he. }
  Person first_keeper "Wat" at first_taproom { Role "who keeps the inn". Ancestry human. Peaceable. Pronouns he. }
  Company party "You" of ${size} at green.`;
const roles = ['land', 'outside', 'town', 'green', 'taproom', 'shrine', 'keeper', 'priest', 'first_green',
  'first_taproom', 'first_keeper'];
export class HoweAlone {
  static seed = 'alone';
  // A place of the host's town, as the drawn country's `Howe.town(seed)` gives one of its own.
  static town(part: string): string { return `host__${part}`; }
  static async start(party: CreatureGenerationContext[] = FOUR, seed = HoweAlone.seed): Promise<Journey> {
    return (await Alone.start({ id: 'howe', bundle: '../../data/situations/bound-howe/module.json', host: host(party.length),
      exports: roles, imports: Object.fromEntries(roles.map(r => [r, r])), party, seed })).journey;
  }
  static async at(place: string, party: CreatureGenerationContext[] = FOUR, seed = HoweAlone.seed): Promise<Journey> {
    const j = await this.start(party, seed);
    Placed.at(j, `howe__${place}`);
    return j;
  }
  static fate(j: Journey): string | undefined { return j.campaign.world.one('howe__fate', 'howe__howe'); }
}
