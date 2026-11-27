import { PresentationResources } from '../ports/presentation-resources';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Call, Objective, Predicate } from '../lang/module';
import { World } from '../lang/world';
import { Undertakings } from './undertakings';
import type { Screen } from '../ui/screen-types';
import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Stakes } from '../ui/stakes';
import { Companions } from './companions';
import { DangerSense } from './danger-sense';
import { CompanyRecall } from './company-recall';

// A fight an aim leads to that is beyond the company, as the company itself reckons it (DangerSense: grave or
// deadly), for a company going alone (OR-64, the owner, 17 November: "way too easy for a starting mage to die …
// the initial quest-giver could hint 'you need to get some friends'"). Its giver says so as it is given, pointing to
// someone who could go with the company, where they are.
export class Outmatched {
  static readonly beyond = new Set(['grave', 'deadly']);
  // The first band the aim names, or that stands where it names, which the company reckons beyond it; none for a
  // company that is more than one already.
  static band(campaign: Campaign, o: Objective): string | undefined {
    // Beyond it or not, by as few fights as settle it (DangerSense.beyond: OR-145 (b)); or one that could fell the one
    // who goes alone, whose lead is then someone to take along, never the attack (OR-412).
    return this.bands(campaign, o).find(id => DangerSense.beyond(campaign, id)
      || !!DangerSense.reckon(campaign, id)?.mortal);
  }
  // The bands an aim names, or that stand where it names, that could be beyond a company going alone.
  private static bands(campaign: Campaign, o: Objective): string[] {
    const w = campaign.world, actor = campaign.playerActor, read = campaign.readout;
    if (!actor || read.partyIds.length > 1 || (w.relates('travelsWith') && w.related('travelsWith').length)) {
      return [];
    }
    const byId = EntityIndex.of(campaign.module.entities).byId, named = [...Stakes.named(campaign, o)];
    return [...new Set(named.flatMap(id => byId.get(id)?.space ? w.related('at').filter(r => r.args[1] === id)
      .map(r => r.args[0]!) : [id]).filter(id => id !== actor && byId.get(id)?.type === 'group'
      && w.test(ModuleWriter.call('able', id))
      && !(w.relates('peaceable') && w.test(ModuleWriter.call('peaceable', id)))))];
  }
  // The bands of the aims an act offered here would give (an act asserting what the aim holds by), whose warning the
  // giver says as it is given: reckoned ahead while the player reads (DangerAhead, OR-145 (b)), so that the act reads
  // its verdict kept. A guess at what is worth reckoning, never at what is said: the verdict is the same either way.
  static ahead(campaign: Campaign): string[] {
    const asserted = new Set(campaign.offered().flatMap(a => (a.success ?? [])
      .flatMap(c => c.kind === 'assert' ? [World.format(c.call)] : [])));
    const held = new Set(Undertakings.held(campaign).map(o => o.id));
    return [...new Set((campaign.module.objectives ?? []).filter(o => !held.has(o.id)
      && Outmatched.calls(o.when).some(c => asserted.has(c))).flatMap(o => this.bands(campaign, o)))];
  }
  private static calls(p: Predicate): string[] {
    const q = p as { kind: string; left?: Predicate; right?: Predicate; value?: Predicate };
    return q.kind === 'call' ? [World.format(q as Call)] : [q.left, q.right, q.value].flatMap(x => x ? this.calls(x) : []);
  }
  // Whoever would go along, and where, while the aim followed leads into a fight the company reckons beyond it alone:
  // the place then leads with the help as it leads with the aim (OR-64; see Affordances' help).
  static reading(campaign: Campaign, screen: Screen): { help?: { who: string; at: string } } {
    const followed = screen.aims?.find(a => a.followed);
    const o = followed && (campaign.module.objectives ?? []).find(x => x.id === followed.id);
    const help = o && this.band(campaign, o) ? this.helper(campaign) : undefined;
    return help ? { help } : {};
  }
  // Who to take along, and where, said as a need ("ask Arlen, at the taproom of the Laughing Flame, to go with you"):
  // where the company knows them to be (OR-881).
  static asked(campaign: Campaign, who: string): string {
    const w = campaign.world, at = CompanyRecall.where(campaign, who);
    return `ask ${ObservationText.label(w, who)}${at ? `, at ${ObservationText.label(w, at)},` : ''} to go with you.`;
  }
  // Someone who could go with the company: of those who could join it, the first.
  static help(campaign: Campaign): string | undefined { return [...Companions.possible(campaign)][0]; }
  // And where: of those who could join it, the first the company knows where to find (where it last saw them). The
  // world's truth of where they stood had been read, and the way led to someone never met (OR-881).
  static helper(campaign: Campaign): { who: string; at: string } | undefined {
    for (const who of Companions.possible(campaign)) {
      const at = CompanyRecall.where(campaign, who);
      if (at) { return { who, at }; }
    }
    return undefined;
  }
  // What the one who gave an aim says of it, where its fight is beyond the company: by those aims just taken.
  static warning(campaign: Campaign, event: CampaignEvent, taken: { id: string }[]): string | undefined {
    const giver = campaign.operator(event.action)?.speaker, ids = new Set(taken.map(t => t.id));
    const given = (campaign.module.objectives ?? []).filter(o => ids.has(o.id));
    if (!giver || !given.some(o => this.band(campaign, o))) { return undefined; }
    const w = campaign.world, helper = this.helper(campaign);
    const voice = PresentationResources.voice<{ help: string; alone: string }>('outmatched');
    const said = helper ? voice?.help ?? 'Ask {helper}, at {where}, to go with you.'
      : voice?.alone ?? 'The fight may be beyond you alone.';
    return said.replace('{giver}', ObservationText.label(w, giver))
      .replace('{helper}', helper ? ObservationText.label(w, helper.who) : '')
      .replace('{where}', helper ? ObservationText.label(w, helper.at) : '');
  }
}
