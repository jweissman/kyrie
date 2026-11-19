import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import type { Operator, Predicate } from '../lang/module';
import type { World } from '../lang/world';

// Who could join the company (the owner, 11 November: companionship its own facet, grounded in a real recruitment,
// never in mere friendliness): someone willing to come now, or someone with something to be asked of them whose
// answer makes them willing (the inn's traveller, "Ask whether she would come along"). Read from what the world would
// do, never from a name or a role.
// Kept for each world as it stands, and the speakers whose answer makes them willing for each module, so that the
// glance, which asks every time, pays once (the glance is worked out in a few milliseconds: glance-kite).
export class Companions {
  private static readonly seen = new WeakMap<object, Set<string>>();
  private static readonly making = new WeakMap<object, Operator[]>();
  static possible(campaign: Campaign): Set<string> {
    const actor = campaign.playerActor, world = campaign.world;
    if (!actor || !world.relates('willing')) { return new Set(); }
    const kept = this.seen.get(world);
    if (kept) { return kept; }
    const ours = new Set(world.related('travelsWith').map(r => r.args[0]!));
    const who = new Set([...world.related('willing').filter(r => r.args[1] === actor).map(r => r.args[0]!),
      ...this.speakers(campaign).filter(o => this.askable(world, o, actor)).map(o => o.speaker!)]
      .filter(w => !ours.has(w) && world.test(ModuleWriter.call('able', w))));
    this.seen.set(world, who);
    return who;
  }
  // Whether such a topic could be asked now, were the company where they are: its author's condition, and not said
  // already (the aspect-truth spec, 19 November: a traveller whose asking was barred, "when false", had lit the way
  // to her as someone who might join, and nothing there could be done to have her).
  private static askable(world: World, o: Operator, actor: string): boolean {
    const site = world.one('at', o.speaker!);
    return !!site && world.test(this.there(o.requires), { actor, site });
  }
  // A topic's condition, the company's being there aside (at(actor, site)).
  private static there(p: Predicate): Predicate {
    if (p.kind === 'call') {
      return p.name === 'at' && p.args[0] === 'actor' && p.args[1] === 'site' ? { kind: 'boolean', value: true } : p;
    }
    if (p.kind === 'not') { return { kind: 'not', value: this.there(p.value) }; }
    return p.kind === 'and' || p.kind === 'or' ? { ...p, left: this.there(p.left), right: this.there(p.right) } : p;
  }
  // Those with a topic whose answer makes them willing (Assert willing(them, …)), by the module's own actions.
  private static speakers(campaign: Campaign): Operator[] {
    const module = campaign.module, kept = this.making.get(module);
    if (kept) { return kept; }
    const made = module.actions.filter(o => o.topic && o.speaker && o.success.some(c => c.kind === 'assert'
      && c.call.name.replace(/^.*__/, '') === 'willing' && c.call.args[0] === o.speaker));
    this.making.set(module, made);
    return made;
  }
}
