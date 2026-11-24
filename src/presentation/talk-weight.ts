import type { Campaign } from '../campaign/campaign';
import type { Change, Objective } from '../lang/module';
import { EntityIndex } from '../lang/entity-index';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { ChoiceGrouping } from '../ui/choice-grouping';
import type { World } from '../lang/world';
import { AimAdvances } from './aim-advances';
import { PlayerView } from './player-view';
import { Undertakings } from './undertakings';
import type { Promoted } from './glance-types';

// What the company has come to say or to settle with someone, by what saying it does, never by its words: what bears
// on an aim it holds (the rats' report to Bask, the debt paid to Tuck), asking someone to come along (willing), and
// being told where something is to be found (a fact that leads somewhere, not yet known). The talk had found these by
// their labels ("Tell …", "Pay …", "… would come along?", "… what is out in the country round"): M21's playability
// list, PL-15.
export class TalkWeight {
  static of(campaign: Campaign, rows = PlayerView.choices(campaign).filter(r => r.action.speaker),
    sought = this.sought(campaign, rows)): Set<string> {
    if (!rows.length) { return new Set(); }
    const w = campaign.world, actor = campaign.playerActor ?? 'party';
    const bearing = Undertakings.held(campaign).flatMap(o => [...AimAdvances.of(campaign, rows, o)]);
    const leads = new Set(w.relates('leadsTo') ? w.related('leadsTo').map(l => l.args[0]!)
      .filter(f => !w.test(ModuleWriter.call('knows', actor, f))) : []);
    const joining = rows.filter(r => (r.action.success ?? []).some(c => c.kind === 'assert'
      && c.call.name.replace(/^.*__/, '') === 'willing' && c.call.args[0] === r.action.speaker));
    const telling = rows.filter(r => (r.action.success ?? []).some(c => c.kind === 'assert' && c.call.name === 'knows'
      && leads.has(c.call.args[1] ?? '')));
    return new Set([...bearing, ...[...joining, ...telling].map(r => r.choice.id), ...sought]);
  }
  // The questions that make an aim of a lead (see asked), by id: the talk leads with them (TalkFocus).
  static sought(campaign: Campaign, rows = PlayerView.choices(campaign).filter(r => r.action.speaker)): string[] {
    return rows.length ? this.asked(campaign, rows, campaign.playerActor ?? 'party').map(r => r.choice.id) : [];
  }
  // A question that makes an aim of a lead: put to someone a thing the company knows names ("Ask Holgar at the
  // salt-house for the key", on the notice), and by its doing giving an aim the company does not hold. The notice's
  // jobs are leads, not aims (HP-01), and asking their giver is what the company came for (CL-25).
  private static asked(campaign: Campaign, rows: ReturnType<typeof PlayerView.choices>, actor: string) {
    const w = campaign.world, named = new Set<string>(), byId = EntityIndex.of(campaign.module.entities).byId;
    for (const r of w.related('knows', actor)) {
      const text = byId.get(r.args[1]!)?.name ?? '';
      ObservationText.map(text, () => '', id => { named.add(id); return ''; });
    }
    const asked = rows.filter(r => named.has(r.action.speaker!));
    if (!asked.length) { return []; }
    const idle = (campaign.module.objectives ?? []).filter(o => !w.test(o.when));
    return asked.filter(r => this.begins(w, r.action.success ?? [], idle));
  }
  private static begins(w: World, success: Change[], idle: Objective[]): boolean {
    return !!this.begun(w, success, idle);
  }
  // The aim asking it would make. By what it does, not what it tells: taking on work (the merchant's job given), never
  // hearing of a place, which a rumour's aim arises from (the old kingdom's hook, asked of the same merchant).
  private static begun(w: World, success: Change[], idle: Objective[]): Objective | undefined {
    const changes = success.filter(c => (c.kind === 'assert' || c.kind === 'retract')
      && !ChoiceGrouping.learnt.has(c.call.name));
    if (!changes.length) { return undefined; }
    const after = w.apply(changes);
    return idle.find(o => after.test(o.when));
  }
  // A talk led for the question a lead sent the company to ask (Affordances, OR-199) is held for the aim that asking
  // would make, and says so, as one held for an aim already taken up does (Undertakings.heldFor).
  static heldFor(campaign: Campaign, acts: Promoted[]): Promoted[] {
    if (!acts.some(a => a.why === 'held' && !a.aim && a.for)) { return acts; }
    const rows = PlayerView.choices(campaign).filter(r => r.action.speaker), w = campaign.world;
    const idle = (campaign.module.objectives ?? []).filter(o => !w.test(o.when));
    return acts.map(a => {
      const row = a.why === 'held' && !a.aim ? rows.find(r => r.choice.id === a.for) : undefined;
      const aim = row && this.begun(w, row.action.success ?? [], idle)?.id;
      return aim ? { ...a, aim } : a;
    });
  }
  static shown(campaign: Campaign): { weighty?: string[]; sought?: string[] } {
    const rows = PlayerView.choices(campaign).filter(r => r.action.speaker), sought = this.sought(campaign, rows);
    const weighty = [...this.of(campaign, rows, sought)];
    return { ...weighty.length ? { weighty } : {}, ...sought.length ? { sought } : {} };
  }
}
