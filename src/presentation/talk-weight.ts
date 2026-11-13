import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { AimAdvances } from './aim-advances';
import { PlayerView } from './player-view';
import { Undertakings } from './undertakings';

// What the company has come to say or to settle with someone, by what saying it does, never by its words: what bears
// on an aim it holds (the rats' report to Bask, the debt paid to Tuck), asking someone to come along (willing), and
// being told where something is to be found (a fact that leads somewhere, not yet known). The talk had found these by
// their labels ("Tell …", "Pay …", "… would come along?", "… what is out in the country round"): M21's playability
// list, PL-15.
export class TalkWeight {
  static of(campaign: Campaign): Set<string> {
    const rows = PlayerView.choices(campaign).filter(r => r.action.speaker);
    if (!rows.length) { return new Set(); }
    const w = campaign.world, actor = campaign.playerActor ?? 'party';
    const bearing = Undertakings.held(campaign).flatMap(o => [...AimAdvances.of(campaign, rows, o)]);
    const leads = new Set(w.relates('leadsTo') ? w.related('leadsTo').map(l => l.args[0]!)
      .filter(f => !w.test(ModuleWriter.call('knows', actor, f))) : []);
    const joining = rows.filter(r => (r.action.success ?? []).some(c => c.kind === 'assert'
      && c.call.name.replace(/^.*__/, '') === 'willing' && c.call.args[0] === r.action.speaker));
    const telling = rows.filter(r => (r.action.success ?? []).some(c => c.kind === 'assert' && c.call.name === 'knows'
      && leads.has(c.call.args[1] ?? '')));
    return new Set([...bearing, ...[...joining, ...telling].map(r => r.choice.id)]);
  }
  static shown(campaign: Campaign): { weighty?: string[] } {
    const weighty = [...this.of(campaign)];
    return weighty.length ? { weighty } : {};
  }
}
