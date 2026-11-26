import { ModuleWriter } from '../lang/module-writer';
import { Knowing } from './knowing';
import { ObservationText } from '../lang/observation-text';
import { Checks, type Odds } from '../rules/checks';
import { Harm } from '../rules/harm';
import type { Campaign } from '../campaign/campaign';
import type { Call, Module, Predicate, Value } from '../lang/module';
import { World } from '../lang/world';
import { OutOf } from './out-of';
import type { Operator } from '../campaign/planner';

// The last words on a choice, once it is grounded: a way not named twice, nor for where the company stands; what a
// thing costs; and how a check looks to the one who would make it.
export class ChoiceWording {
  static readonly chances: Record<Odds, string> = { sure: 'sure', likely: 'likely', even: 'an even chance',
    unlikely: 'unlikely', beyond: 'beyond you' };
  // Where the company stands, as it knows the place.
  static here(campaign: Campaign): string | undefined {
    const world = campaign.world, at = Knowing.here(campaign);
    const place = at && world.module.entities.find(e => e.id === at);
    return place ? ObservationText.known(world, place) : undefined;
  }
  static word(campaign: Campaign, action: Operator, at: { name: string; here?: string }): string {
    // A way named for where it goes is not told twice: "Take the track to Obscurusport", not "… to Obscurusport";
    // nor is it named for here when taken from here: "Take the track to the foot of the fell".
    // Nor is a way told as going to itself: "Take the sealed stair", not "… to the sealed stair".
    let name = at.name.replace(/ to (.+) to \1$/, ' to $1').replace(/^(\S+ )(.+) to \2$/, '$1$2');
    if (at.here) { name = name.replace(` to ${at.here} to `, ' to '); }
    // Nor where where it comes to is called by the place its name goes to: "Take the road to the Lull", not "… to the
    // way into the Lull" (round 12, B: T24-19).
    if (action.movement || action.schema === 'go') { name = OutOf.once(this.once(name)); }
    const resolve = action.resolve, world = campaign.world;
    // A hazard is risked on the way to somewhere, and says where (the command stays the trap and who goes first).
    const to = action.schema === 'risk' && world.module.entities.find(e => e.id === action.bindings?.destination);
    if (to) { name = name.replace(/^Risk (.+?); /, `Risk $1 on the way to ${ObservationText.known(world, to)}; `); }
    if (resolve?.name === 'purchase') { name += ` · ${world.number(ModuleWriter.call('price', resolve.args[0]!))} coin`; }
    // And what any other act takes from the purse, by what it does: an offering what its shrine asks, a bed, a
    // healing, a lesson, a toll. "Take a bed and supper from Warryn" had taken three coin unsaid (OR-694, cold play
    // 2). A hire says its own fee (its row's), and words that say the price already are not said twice.
    const fee = action.schema === 'recruit' ? 0 : this.fee(world, action, campaign.playerActor);
    if (fee > 0 && !name.includes(`${fee} coin`)) { name += ` · ${fee} coin`; }
    // A check says how it looks to the one who would make it: likely, an even chance, beyond you; and one that cannot
    // be tried again if it fails says so.
    if (resolve?.name === 'check') {
      const odds = this.odds(campaign, resolve);
      name += `${odds ? ` · ${odds}` : ''}${this.final(action, campaign.module) ? ' · one try' : ''}`;
    }
    // Risking a hazard says what it would do to whoever goes first, once it is understood.
    const hurt = resolve?.name === 'expose' && action.schema === 'risk' ? this.hurt(campaign, action, resolve) : undefined;
    if (hurt) { name += ` · ${hurt}`; }
    // A spell prepared where the one it replaces was already cast says before it is chosen that it waits for a rest
    // (cold play 5, CL-38: "ready after the next rest" had been said only after the hour was spent).
    if (resolve?.name === 'prepare' && this.spent(campaign, resolve)) { name += ' · ready after the next rest'; }
    // What is someone else's says so before it is taken (cold play 5, CL-39's 33: the Hall's silver music box had been
    // "Collect a silver music box for Ilse", nothing said of whose it was until the steward showed the company out).
    const theirs = resolve?.name === 'acquire' && Knowing.theirs(world, resolve.args[0]!, campaign.playerActor ?? 'party');
    if (theirs) { name += ` · ${theirs}'s, not yours`; }
    return name;
  }
  // What the act takes from the company's coin when it comes off (Decrease quantity(actor, gold) by …).
  private static fee(world: World, action: Operator, player?: string): number {
    const actor = action.bindings?.actor ?? player ?? 'party';
    const values = action.success.flatMap(c => c.kind === 'decrease' && c.call.name === 'quantity'
      && c.call.args[0] === actor && c.call.args[1] === 'gold' ? [c.value] : []);
    return values.reduce((n, v: Value) => n + (v.kind === 'number' ? v.value : v.kind === 'call' ? world.number(v) : 0), 0);
  }
  // Whether the spell a preparation replaces is no longer ready in its slot (Spellcasting.prepare: ready at once only
  // in place of one still ready).
  private static spent(campaign: Campaign, prepare: Call): boolean {
    const [caster, tier, outgoing] = prepare.args, index = Number(tier?.split('_')[1]) - 1;
    const member = campaign.world.module.entities.find(e => e.id === caster) as { creatureId?: string } | undefined;
    const c = campaign.readout.creatures.find(x => x.id === (member?.creatureId ?? caster));
    return !!c?.state.prepared?.[index]?.includes(outgoing!) && !c.state.ready?.[index]?.includes(outgoing!);
  }
  // "A to B to C", where C ends with B or B with C, is "A to B".
  private static once(name: string): string {
    const m = /^(.* to (.+?)) to (.+)$/.exec(name);
    if (!m) { return name; }
    const [, way, goes, comes] = m, b = this.plain(goes!), c = this.plain(comes!);
    return c.endsWith(b) || b.endsWith(c) ? way! : name;
  }
  private static plain(words: string): string { return words.replace(/^the /i, '').toLowerCase(); }
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
  // None where its difficulty is the module's own and its rules have not yet set it (see Checks.known).
  private static odds(campaign: Campaign, check: Call): string | undefined {
    const read = campaign.readout, company = read.creatures.filter(c => read.partyIds.includes(c.id));
    const hard = Checks.known(check.args[2]!, id => campaign.world.number(ModuleWriter.call('toBeat', id)));
    const rests = Checks.rests(campaign.world, check.args[1]!);
    return hard === undefined ? undefined
      : this.chances[Checks.odds(campaign.catalog, company, Checks.skill(check.args[1]!), { difficulty: hard, rests })];
  }
}
