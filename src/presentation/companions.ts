import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';

// Who could join the company (the owner, 11 November: companionship its own facet, grounded in a real recruitment,
// never in mere friendliness): someone willing to come now, or someone with something to be asked of them whose
// answer makes them willing (the inn's traveller, "Ask whether she would come along"). Read from what the world would
// do, never from a name or a role.
// Kept for each world as it stands, and the speakers whose answer makes them willing for each module, so that the
// glance, which asks every time, pays once (the glance is worked out in a few milliseconds: glance-kite).
export class Companions {
  private static readonly seen = new WeakMap<object, Set<string>>();
  private static readonly making = new WeakMap<object, string[]>();
  static possible(campaign: Campaign): Set<string> {
    const actor = campaign.playerActor, world = campaign.world;
    if (!actor || !world.relates('willing')) { return new Set(); }
    const kept = this.seen.get(world);
    if (kept) { return kept; }
    const ours = new Set(world.related('travelsWith').map(r => r.args[0]!));
    const who = new Set([...world.related('willing').filter(r => r.args[1] === actor).map(r => r.args[0]!),
      ...this.speakers(campaign)].filter(w => !ours.has(w) && world.test(ModuleWriter.call('able', w))));
    this.seen.set(world, who);
    return who;
  }
  // Those with a topic whose answer makes them willing (Assert willing(them, …)), by the module's own actions.
  private static speakers(campaign: Campaign): string[] {
    const module = campaign.module, kept = this.making.get(module);
    if (kept) { return kept; }
    const made = module.actions.filter(o => o.topic && o.speaker && o.success.some(c => c.kind === 'assert'
      && c.call.name.replace(/^.*__/, '') === 'willing' && c.call.args[0] === o.speaker)).map(o => o.speaker!);
    this.making.set(module, made);
    return made;
  }
}
