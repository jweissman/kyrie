import voice from '../../data/voice/outmatched.json';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Objective } from '../lang/module';
import type { Screen } from '../ui/screen-types';
import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Stakes } from '../ui/stakes';
import { Companions } from './companions';
import { DangerSense } from './danger-sense';

// A fight an aim leads to that is beyond the company, as the company itself reckons it (DangerSense: grave or
// deadly), for a company going alone (OR-64, the owner, 17 November: "way too easy for a starting mage to die …
// the initial quest-giver could hint 'you need to get some friends'"). Its giver says so as it is given, pointing to
// someone who could go with the company, where they are.
export class Outmatched {
  static readonly beyond = new Set(['grave', 'deadly']);
  // The first band the aim names, or that stands where it names, which the company reckons beyond it; none for a
  // company that is more than one already.
  static band(campaign: Campaign, o: Objective): string | undefined {
    const w = campaign.world, actor = campaign.playerActor, read = campaign.readout;
    if (!actor || read.partyIds.length > 1 || (w.relates('travelsWith') && w.related('travelsWith').length)) {
      return undefined;
    }
    const byId = EntityIndex.of(campaign.module.entities).byId, named = [...Stakes.named(campaign, o)];
    const bands = named.flatMap(id => byId.get(id)?.space ? w.related('at').filter(r => r.args[1] === id)
      .map(r => r.args[0]!) : [id]).filter(id => id !== actor && byId.get(id)?.type === 'group'
      && w.test(ModuleWriter.call('able', id)) && !(w.relates('peaceable') && w.test(ModuleWriter.call('peaceable', id))));
    // Beyond it or not, by as few fights as settle it (DangerSense.beyond: OR-145 (b)).
    return [...new Set(bands)].find(id => DangerSense.beyond(campaign, id));
  }
  // Whoever would go along, and where, while the aim followed leads into a fight the company reckons beyond it alone:
  // the place then leads with the help as it leads with the aim (OR-64; see Affordances' help).
  static reading(campaign: Campaign, screen: Screen): { help?: { who: string; at: string } } {
    const followed = screen.aims?.find(a => a.followed);
    const o = followed && (campaign.module.objectives ?? []).find(x => x.id === followed.id);
    const who = o && this.band(campaign, o) ? this.help(campaign) : undefined;
    const at = who && campaign.world.one('at', who);
    return who && at ? { help: { who, at } } : {};
  }
  // Someone who could go with the company: of those who could join it, the first.
  static help(campaign: Campaign): string | undefined { return [...Companions.possible(campaign)][0]; }
  // What the one who gave an aim says of it, where its fight is beyond the company: by those aims just taken.
  static warning(campaign: Campaign, event: CampaignEvent, taken: { id: string }[]): string | undefined {
    const giver = campaign.operator(event.action)?.speaker, ids = new Set(taken.map(t => t.id));
    const given = (campaign.module.objectives ?? []).filter(o => ids.has(o.id));
    if (!giver || !given.some(o => this.band(campaign, o))) { return undefined; }
    const w = campaign.world, helper = this.help(campaign), where = helper && w.one('at', helper);
    return (helper && where ? voice.help : voice.alone).replace('{giver}', ObservationText.label(w, giver))
      .replace('{helper}', helper ? ObservationText.label(w, helper) : '')
      .replace('{where}', where ? ObservationText.label(w, where) : '');
  }
}
