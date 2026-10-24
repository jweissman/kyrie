import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Checks, type Odds } from '../rules/checks';
import { Harm } from '../rules/harm';
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
    // A hazard is risked on the way to somewhere, and says where (the command stays the trap and who goes first).
    const to = action.schema === 'risk' && world.module.entities.find(e => e.id === action.bindings?.destination);
    if (to) { name = name.replace(/^Risk (.+?); /, `Risk $1 on the way to ${ObservationText.known(world, to)}; `); }
    if (resolve?.name === 'purchase') { name += ` · ${world.number(ModuleWriter.call('price', resolve.args[0]!))} coin`; }
    // An offering costs what its shrine asks.
    if (resolve?.name === 'bless') { name += ` · ${world.number(ModuleWriter.call('offering', resolve.args[0]!))} coin`; }
    // A check says how it looks to the one who would make it: likely, an even chance, beyond you.
    if (resolve?.name === 'check') { name += ` · ${this.odds(campaign, resolve)}`; }
    // Risking a hazard says what it would do to whoever goes first, once it is understood.
    const hurt = resolve?.name === 'expose' && action.schema === 'risk' ? this.hurt(campaign, action, resolve) : undefined;
    if (hurt) { name += ` · ${hurt}`; }
    return name;
  }
  // A trap that has a workings to learn (looked at closely) says how bad it is once the company knows it; anything
  // else (a ford in spate) at once. Its harm on an average roll, against the one who goes first as they are now.
  private static hurt(campaign: Campaign, action: Operator, expose: Call): string | undefined {
    const world = campaign.world, known = `${action.bindings?.trap ?? ''}_known`, entities = world.module.entities;
    if (entities.some(e => e.id === known) && !world.test(ModuleWriter.call('knows', campaign.playerActor ?? '', known))) {
      return undefined;
    }
    const hazard = entities.find(e => e.id === expose.args[0] && e.type === 'hazard');
    const member = entities.find(e => e.id === expose.args[1]) as { creatureId?: string } | undefined;
    const victim = campaign.readout.creatures.find(c => c.id === (member?.creatureId ?? expose.args[1]));
    if (!hazard?.effect || !victim) { return undefined; }
    const harm = Harm.average(hazard.effect), hp = victim.state.hp;
    return harm >= hp ? 'it could kill' : harm * 3 >= hp ? 'it would hurt badly' : 'it would hurt a little';
  }
  private static odds(campaign: Campaign, check: Call): string {
    const read = campaign.readout, company = read.creatures.filter(c => read.partyIds.includes(c.id));
    return this.chances[Checks.odds(company, Checks.skill(check.args[1]!), Checks.difficulty(check.args[2]!))];
  }
}
