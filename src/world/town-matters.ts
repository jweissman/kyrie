import type { Settlement } from './region-writer';

// What is the matter here: the broad question a stranger can put to whoever keeps a town's travellers, its merchant
// and its priest (the owner, OR-423: "the player knows too much"; doc/design/conversation-and-combat.md §1). A new
// life had been offered at once some seventeen questions about things it had never heard of: the quarry, the drain,
// the scholar upstairs, the king-barrow. Each of those is asked of someone only once they have told the company what
// the matter is (toldMatter(them, actor), the discovery rules'); this is the asking, in their own words, and the few
// broad questions besides (what is out in the country round, a room, news) stay open from the first.
export class TownMatters {
  static readonly q = JSON.stringify;
  static lines(s: Settlement): string[] {
    const town = s.name, keeper = `${s.id}_innkeeper`, merchant = `${s.id}_merchant`, priest = `${s.id}_priest`;
    return [
      TownMatters.topic(keeper, `Ask {${keeper}} what the matter is in ${town}`, `'Where do I start?' says {${keeper}}, `
        + `leaning on the counter. 'Who owes the house, who lodges upstairs, and what is under the town that nobody goes `
        + `near now. Ask me.'`),
      TownMatters.topic(merchant, `Ask {${merchant}} what the matter is in ${town}`, `'Trade is poor,' says `
        + `{${merchant}}. 'Folk would rather talk about the old places out in the country than buy. There is trouble `
        + `under the town too, if you have the stomach for it.'`),
      TownMatters.topic(priest, `Ask {${priest}} what the matter is in ${town}`, `'The dead do not all lie quiet here,' `
        + `says {${priest}}, 'and the living bring me their quarrels. Ask, and I will tell you what I can.'`)];
  }
  // In the reference game's town, thin and mundane (the owner, 26 November: "extremely simple and mostly mundane, and
  // very thin for the first town, so that plot hooks stand out as you uncover them"): there is no lodger, debt or
  // cellar to ask after, and its three say so in their own words (OR-1082).
  static plain(s: Settlement): string[] {
    const town = s.name, keeper = `${s.id}_innkeeper`, merchant = `${s.id}_merchant`, priest = `${s.id}_priest`;
    return [
      TownMatters.topic(keeper, `Ask {${keeper}} what the matter is in ${town}`, `'In ${town}?' says {${keeper}}. 'Rain on `
        + `the thatch, and the price of skins. What comes out of the woods comes through here.'`),
      TownMatters.topic(merchant, `Ask {${merchant}} what the matter is in ${town}`, `'Trade is slow,' says {${merchant}}. `
        + `'Folk buy rope and lamp-oil when they mean to go up the hill, and sell me what they bring down.'`),
      TownMatters.topic(priest, `Ask {${priest}} what the matter is in ${town}`, `'Births and burials,' says `
        + `{${priest}}. 'A sprain, now and then, from the woods. Sit by the fire if you are tired.'`)];
  }
  private static topic(who: string, label: string, says: string): string {
    const q = TownMatters.q;
    return `  Topic ${who}_matter with ${who} ${q(label)} when not toldMatter(${who}, actor) once {\n`
      + `    Says ${q(says)}.\n    On discuss { Assert toldMatter(${who}, actor). }\n  }`;
  }
}
