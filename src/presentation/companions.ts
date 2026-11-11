import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';

// Who could join the company (the owner, 11 November: companionship its own facet, grounded in a real recruitment,
// never in mere friendliness): someone willing to come now, or someone with something to be asked of them whose
// answer makes them willing (the inn's traveller, "Ask whether she would come along"). Read from what the world would
// do, never from a name or a role.
export class Companions {
  static possible(campaign: Campaign): Set<string> {
    const actor = campaign.playerActor, world = campaign.world;
    if (!actor || !world.relates('willing')) { return new Set(); }
    const making = campaign.module.actions.filter(o => o.topic && o.speaker && o.success.some(c => c.kind === 'assert'
      && c.call.name.replace(/^.*__/, '') === 'willing' && c.call.args[0] === o.speaker)).map(o => o.speaker!);
    const ours = new Set(world.related('travelsWith').map(r => r.args[0]!));
    return new Set([...world.related('willing').filter(r => r.args[1] === actor).map(r => r.args[0]!), ...making]
      .filter(who => !ours.has(who) && world.test(ModuleWriter.call('able', who))));
  }
}
