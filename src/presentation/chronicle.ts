import type { Campaign, CampaignEvent } from '../campaign/campaign';
import type { Change } from '../lang/module';
import { ModuleWriter } from '../lang/module-writer';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatProjection } from '../combat-projection';
import { ObservationText } from '../lang/observation-text';
import { Spoken } from './spoken';
import { VisitedPlaces } from './visited-places';
import { Fought } from './fought';
import type { ChronicleEntry } from './player-view';

// What has happened, as the company has it: what it did, what it saw others do, the deadlines come and what it
// noticed, told from the campaign's log (PlayerView.chronicle keeps it for each state of the game).
export class Chronicle {
  private static change(change: Change, labels: Map<string, string>): string {
    const call = { ...change.call, args: change.call.args.map(id => labels.get(id) ?? id) };
    return ModuleWriter.change({ ...change, call } as Change);
  }
  // Rebuilt from the authoritative event log, so it is identical after save/restore and in every host.
  static of(campaign: Campaign, actor: string, labels: Map<string, string>): ChronicleEntry[] {
    const entries: ChronicleEntry[] = [];
    const at = new Map<string, string>();
    for (const c of campaign.module.initial) {
      if (c.kind === 'assert' && c.call.name === 'at') { at.set(c.call.args[0]!, c.call.args[1]!); }
    }
    // Drawn as fighters only the creatures some fight of the log names (see Fought).
    const names = CombatProjection.told(campaign.catalog, Fought.of(campaign, campaign.history),
      campaign.readout.partyIds);
    const deadlines = campaign.installations.filter(m => m.deadline !== undefined);
    let previous = 0;
    const perceived = new Set<string>();
    for (const event of campaign.history) {
      entries.push(this.playerEntry(campaign, event, previous, { labels, names }));
      VisitedPlaces.moves(event.changes.filter(line => line.includes(`at(${actor}, `)), at);
      const here = at.get(actor);
      for (const decision of event.npc ?? []) {
        const before = at.get(decision.actor);
        VisitedPlaces.moves(decision.changes, at);
        // What the company saw as it happened, as the runtime decided then; a game kept before that, by where the
        // company was. An undertaking obstructed is told by what came of it, if its author said, and not as done.
        const seen = decision.seen ?? (!!here && (before === here || at.get(decision.actor) === here));
        const act = campaign.operator(decision.action), obstructed = decision.goal === 'obstructed';
        if (!seen || (obstructed && !act?.otherwise)) { continue; }
        // Told in its author's words or not at all: an act with none had been told by its label, the player's
        // imperative under whoever did it ("The raiding party: Fall on You", UNT-108, NP-13); what it changed is the
        // scene's to show.
        const told = obstructed ? act!.otherwise : act?.seen;
        if (!told) { continue; }
        entries.push({ at: decision.elapsed ?? event.elapsed, kind: 'npc',
          text: ObservationText.render(told, campaign.world), detail: [] });
      }
      VisitedPlaces.moves(event.changes, at);
      for (const m of deadlines.filter(m => m.deadline! > previous && m.deadline! <= event.elapsed)) {
        entries.push({ at: m.deadline!, kind: 'world', detail: [],
          text: `Deadline reached: ${m.pressures.map(id => labels.get(id) ?? id).join(', ')} (${m.name})` });
      }
      // The chronicle is what happened; what places and people look like is the scene's to tell.
      for (const o of (event.perceptions ?? []).filter(p => p.kind !== 'observation')) {
        if (!perceived.has(`${o.id}:${o.text}`)) {
          perceived.add(`${o.id}:${o.text}`);
          entries.push({ at: event.elapsed, kind: o.kind, text: o.text, detail: [] });
        }
      }
      previous = event.elapsed;
    }
    return entries;
  }
  private static playerEntry(campaign: Campaign, event: CampaignEvent, previous: number, { labels, names }: {
    labels: Map<string, string>; names: Parameters<typeof CombatPresenter.format>[1]; }): ChronicleEntry {
    const action = campaign.operator(event.action);
    const declared = action ? (event.result === 'success' ? action.success : action.failure) : [];
    return { at: previous, kind: 'player',
      text: `${action?.name ?? event.action}${event.result === 'failure' ? ' — failed' : ''}`,
      detail: [...Spoken.told(campaign, event, labels), ...event.combat.map(c => CombatPresenter.format(c, names)),
        ...(campaign.module.observations?.length ? [] : declared.map(change => this.change(change, labels)))] };
  }
}
