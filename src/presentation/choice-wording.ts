import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Checks, type Odds } from '../rules/checks';
import { Harm } from '../rules/harm';
import type { Campaign } from '../campaign/campaign';
import type { Call, Module, Predicate } from '../lang/module';
import { World } from '../lang/world';
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
    // A check says how it looks to the one who would make it: likely, an even chance, beyond you; and one that cannot
    // be tried again if it fails says so.
    if (resolve?.name === 'check') {
      name += ` · ${this.odds(campaign, resolve)}${this.final(action, campaign.module) ? ' · one try' : ''}`;
    }
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
  // Whether a check, failed, cannot be tried again: what it needs not to hold, failing it makes hold (a band talked to
  // badly is not talked to again), or what it needs, failing it takes away, and nothing in the world undoes that (a
  // word put badly in a disputation can be put again the next day). A cold playtest failed one and learnt only after
  // that it had been the only try (the audit's SLIP-08).
  static final(action: Operator, module: Module): boolean {
    const needs = this.needs(action.requires);
    const closing = action.failure.filter(c => (c.kind === 'assert' && needs.not.has(World.key(c.call)))
      || (c.kind === 'retract' && needs.so.has(World.key(c.call))));
    const undoing = [...(module.rules ?? []).flatMap(r => r.effects), ...module.actions.flatMap(a => a.success)];
    return closing.some(c => !undoing.some(u => u.call.name === c.call.name && u.kind !== c.kind
      && ['assert', 'retract'].includes(u.kind)));
  }
  // What a condition asks, as a chain of ands: what must hold, and what must not.
  private static needs(p: Predicate, out = { so: new Set<string>(), not: new Set<string>() }) {
    if (p.kind === 'and') { this.needs(p.left, out); this.needs(p.right, out); }
    if (p.kind === 'call') { out.so.add(World.key(p)); }
    if (p.kind === 'not' && p.value.kind === 'call') { out.not.add(World.key(p.value)); }
    return out;
  }
  private static odds(campaign: Campaign, check: Call): string {
    const read = campaign.readout, company = read.creatures.filter(c => read.partyIds.includes(c.id));
    return this.chances[Checks.odds(company, Checks.skill(check.args[1]!), Checks.difficulty(check.args[2]!))];
  }
}
