import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Checks, type Odds } from '../rules/checks';
import type { Campaign } from '../campaign/campaign';
import type { Call } from '../lang/module';
import type { Operator } from '../campaign/planner';

// The last words on a choice, once it is grounded: a way not named twice, nor for where the company stands; what a
// thing costs; and how a check looks to the one who would make it.
export class ChoiceWording {
  static readonly chances: Record<Odds, string> = { sure: 'sure', likely: 'likely', even: 'an even chance',
    unlikely: 'unlikely', beyond: 'beyond you' };
  // Where the company stands, as it knows the place.
  static here(campaign: Campaign): string | undefined {
    const world = campaign.world, at = world.one('at', campaign.playerActor ?? '');
    const place = at && world.module.entities.find(e => e.id === at);
    return place ? ObservationText.known(world, place) : undefined;
  }
  static word(campaign: Campaign, action: Operator, at: { name: string; here?: string }): string {
    // A way named for where it goes is not told twice: "Take the track to Obscurusport", not "… to Obscurusport";
    // nor is it named for here when taken from here: "Take the track to the foot of the fell".
    // Nor is a way told as going to itself: "Take the sealed stair", not "… to the sealed stair".
    let name = at.name.replace(/ to (.+) to \1$/, ' to $1').replace(/^(\S+ )(.+) to \2$/, '$1$2');
    if (at.here) { name = name.replace(` to ${at.here} to `, ' to '); }
    const resolve = action.resolve, world = campaign.world;
    if (resolve?.name === 'purchase') { name += ` · ${world.number(ModuleWriter.call('price', resolve.args[0]!))} coin`; }
    // An offering costs what its shrine asks.
    if (resolve?.name === 'bless') { name += ` · ${world.number(ModuleWriter.call('offering', resolve.args[0]!))} coin`; }
    // A check says how it looks to the one who would make it: likely, an even chance, beyond you.
    if (resolve?.name === 'check') { name += ` · ${this.odds(campaign, resolve)}`; }
    return name;
  }
  private static odds(campaign: Campaign, check: Call): string {
    const read = campaign.readout, company = read.creatures.filter(c => read.partyIds.includes(c.id));
    return this.chances[Checks.odds(company, Checks.skill(check.args[1]!), Checks.difficulty(check.args[2]!))];
  }
}
