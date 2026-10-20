import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { PlayerView, type PlayerSnapshot } from './player-view';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatProjection } from '../combat-projection';
import { FictionalTime } from './fictional-time';

export interface ActionFeedback {
  attempt: string; result: string; resources: string[]; time: string; immediate: string[]; discoveries: string[];
  observations: string[]; available: string[]; unavailable: string[]; events: string[];
}
export class ActionFeedbackView {
  // A recovery that removes a status the member never had is not news.
  private static lacked(before: PlayerSnapshot, target: string, status: string): boolean {
    const member = before.party.find(p => p.id === target);
    return !!member && !member.conditions.includes(status);
  }
  static read(campaign: Campaign, event: CampaignEvent, before: PlayerSnapshot): ActionFeedback {
    const after = PlayerView.observe(campaign);
    const action = campaign.operator(event.action)!;
    const names = { combatants: campaign.state.creatures.map(c => CombatProjection.fighter(c, 'fighters')),
      turn: 0, actor: '', outcome: null };
    const combat = event.combat.filter(e => e.type !== 'action' && !('amount' in e && e.amount === 0 && e.type !== 'damage')
      && !(e.type === 'remove' && ActionFeedbackView.lacked(before, e.target, e.detail)))
      .map(e => CombatPresenter.format(e, names));
    const learned = after.knowledge.filter(k => !before.knowledge.some(b => b.id === k.id));
    const changed = after.observations.filter(o => !before.observations.some(b => b.id === o.id && b.text === o.text));
    const old = new Set(before.choices.map(c => c.id)), now = new Set(after.choices.map(c => c.id));
    const ended = event.combat.find(e => e.type === 'end');
    const fallen = after.party.filter(p => p.hp === 0 && before.party.some(b => b.id === p.id && b.hp > 0));
    const battleResult = ended?.type === 'end' ?
      `${ended.outcome === 'fighters' ? 'Your company prevails.' : ended.outcome === 'escaped' ? ended.fled?.team === 'goblins'
        ? 'Your opponent flees; the company holds the ground.' : 'Your company withdraws.'
        : ended.outcome === 'goblins' ? 'Your company is defeated.' : 'The encounter ends without a victor.'}`
      + `${fallen.length ? ` ${fallen.map(p => p.name).join(', ')} ${fallen.length === 1 ? 'is' : 'are'} down.` : ''}` : undefined;
    const result = event.response ?? battleResult ?? (event.result === 'failure' ? 'Your attempt did not succeed.' :
      learned.length ? `You learn: ${learned.map(k => k.text).join(' ')}` :
        before.location?.id !== after.location?.id ? `You arrive at ${after.location?.name}.` :
          combat.length ? '' :
            action.schema === 'wait' ? 'You remain here while time passes.' :
              changed[0] ? FictionalTime.prose(changed[0].text) : 'You carry out the action.');
    const resources = [...new Set([...(before.resources ?? []).map(r => r.id),
      ...(after.resources ?? []).map(r => r.id)])]
      .flatMap(id => {
        const a = before.resources?.find(r => r.id === id), b = after.resources?.find(r => r.id === id);
        return (a?.amount ?? 0) === (b?.amount ?? 0) ? [] :
          [`${a?.name ?? b?.name}: ${a?.amount ?? 0} → ${b?.amount ?? 0}`];
      });
    return { resources, attempt: action.name, result: FictionalTime.prose(result),
      time: `${FictionalTime.duration(event.elapsed - before.elapsed)} · ${FictionalTime.at(event.elapsed)}`,
      immediate: [...combat, ...PlayerView.chronicle(campaign).filter(e => e.kind === 'npc'
        && e.at > before.elapsed && e.at <= event.elapsed).map(e => `You witness: ${e.text}`)],
      discoveries: learned.map(k => k.text),
      events: (event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text),
      observations: changed.map(o => FictionalTime.prose(o.text)),
      available: before.location?.id === after.location?.id ?
        after.choices.filter(c => !old.has(c.id)).map(c => c.name) : [],
      unavailable: before.location?.id === after.location?.id ?
        before.choices.filter(c => !now.has(c.id)).map(c => c.name) : [] };
  }
}
