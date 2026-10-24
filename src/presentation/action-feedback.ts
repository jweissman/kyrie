import { BandNames } from '../narrative/band-names';
import type { Campaign, CampaignEvent } from '../campaign/campaign';
import { PlayerView, type PlayerSnapshot } from './player-view';
import { CombatPresenter } from '../ui/combat-presenter';
import { CombatProjection } from '../combat-projection';
import { FictionalTime } from './fictional-time';

export interface ActionFeedback {
  attempt: string; result: string; resources: string[]; time: string; immediate: string[]; discoveries: string[];
  // Of the immediate, those that tell a roll made outside a fight (a check): what was rolled, against what.
  rolls: string[];
  observations: string[]; available: string[]; unavailable: string[]; events: string[];
}
export class ActionFeedbackView {
  static readonly probes = ['look_closely', 'prod', 'pry', 'burn', 'push', 'listen', 'search'];
  // A recovery that removes a status the member never had is not news.
  private static lacked(before: PlayerSnapshot, target: string, status: string): boolean {
    const member = before.party.find(p => p.id === target);
    return !!member && !member.conditions.includes(status);
  }
  private static taught(campaign: Campaign, event: CampaignEvent, learned: string[]): { id: string; text: string }[] {
    const observations = campaign.module.observations ?? [];
    return (event.perceptions ?? []).filter(p => p.kind === 'observation').filter(p => {
      const teaches = observations.find(o => o.id === p.id.split('@')[0])?.teaches;
      return !!teaches && learned.includes(teaches);
    }).map(p => ({ id: p.id, text: p.text }));
  }
  // How long it took, and the time it is now, to the minute.
  private static time(before: PlayerSnapshot, after: { elapsed: number; minutes?: number }): string {
    const spent = (after.elapsed - before.elapsed) * FictionalTime.minutesPerTick + (after.minutes ?? 0)
      - (before.minutes ?? 0);
    return `${FictionalTime.duration(0, spent)} · ${FictionalTime.at(after.elapsed, after.minutes)}`;
  }
  static read(campaign: Campaign, event: CampaignEvent, before: PlayerSnapshot): ActionFeedback {
    const after = PlayerView.observe(campaign);
    const action = campaign.operator(event.action)!;
    // A fight told after it names a band's members by the band (see BandNames), not by their numbers in it.
    const called = BandNames.of(campaign);
    const names = { combatants: campaign.readout.creatures.map(c => ({ ...CombatProjection.fighter(c, 'fighters'),
      name: called.get(c.id) ?? c.name })), turn: 0, actor: '', outcome: null };
    const combat = event.combat.filter(e => e.type !== 'action' && !('amount' in e && e.amount === 0 && e.type !== 'damage')
      && !(e.type === 'remove' && ActionFeedbackView.lacked(before, e.target, e.detail)))
      .map(e => CombatPresenter.format(e, names));
    const rolls = event.combat.filter(e => e.type === 'check' || (e.type === 'save' && !event.combat.some(x => x.type === 'initiative')))
      .map(e => CombatPresenter.format(e, names));
    const learned = after.knowledge.filter(k => !before.knowledge.some(b => b.id === k.id));
    // What taught the company something is what it saw, though once it knows, the place no longer shows it so.
    const taught = ActionFeedbackView.taught(campaign, event, learned.map(k => k.id))
      .filter(t => !before.observations.some(b => b.text === t.text));
    const changed = [...taught, ...after.observations.filter(o => !taught.some(t => t.text === o.text)
      && !before.observations.some(b => b.id === o.id && b.text === o.text))];
    const old = new Set(before.choices.map(c => c.id)), now = new Set(after.choices.map(c => c.id));
    const ended = event.combat.find(e => e.type === 'end');
    const fallen = after.party.filter(p => p.hp === 0 && before.party.some(b => b.id === p.id && b.hp > 0));
    const battleResult = ended?.type === 'end' ?
      `${ended.outcome === 'fighters' ? 'Your company prevails.' : ended.outcome === 'escaped' ? ended.fled?.team === 'goblins'
        ? 'Your opponent flees; the company holds the ground.' : 'Your company withdraws.'
        : ended.outcome === 'goblins' ? 'Your company is defeated.' : 'The encounter ends without a victor.'}`
      + `${fallen.length ? ` ${fallen.map(p => p.name).join(', ')} ${fallen.length === 1 ? 'is' : 'are'} down.` : ''}` : undefined;
    // A try or a search that turns up nothing says so, rather than leaving the player to wonder.
    const quiet = ActionFeedbackView.probes.includes(action.schema ?? '') && !learned.length && !changed.length
      && !combat.length && !(event.perceptions ?? []).some(p => p.kind === 'event');
    const nothing = quiet ? ` ${action.schema === 'search' ? 'You find nothing out of the ordinary.' : 'Nothing comes of it.'}` : '';
    const result = event.response ? `${event.response}${nothing}` : battleResult ?? (event.result === 'failure' ? 'Your attempt did not succeed.' :
      learned.length ? learned.map(k => k.text).join(' ') :
        before.location?.id !== after.location?.id ? `You arrive at ${after.location?.name}.` :
          combat.length ? '' :
            action.schema === 'wait' ? 'Time passes.' :
              changed[0] ? FictionalTime.prose(changed[0].text)
                // What happened is told by what came of it, when something did; only otherwise is it just done.
                : (event.perceptions ?? []).some(p => p.kind === 'event') ? '' : 'You carry out the action.');
    const resources = [...new Set([...(before.resources ?? []).map(r => r.id),
      ...(after.resources ?? []).map(r => r.id)])]
      .flatMap(id => {
        const a = before.resources?.find(r => r.id === id), b = after.resources?.find(r => r.id === id);
        return (a?.amount ?? 0) === (b?.amount ?? 0) ? [] :
          [`${a?.name ?? b?.name}: ${a?.amount ?? 0} → ${b?.amount ?? 0}`];
      });
    // What the company did, in the words it was offered in (a name it learns by doing it is not echoed back), where
    // the offer was one; several offered under one id (buy it for one of the company or another) say it as done.
    const offered = before.choices.filter(c => c.id === event.action);
    return { resources, attempt: offered.length === 1 ? offered[0]!.name
      : PlayerView.aliased(campaign.world, action.name, new Set(before.knowledge.map(k => k.id))),
      result: FictionalTime.prose(result),
      time: this.time(before, { elapsed: event.elapsed, minutes: after.minutes }),
      immediate: [...combat, ...PlayerView.chronicle(campaign).filter(e => e.kind === 'npc'
        && e.at > before.elapsed && e.at <= event.elapsed).map(e => `You witness: ${e.text}`)],
      rolls, discoveries: learned.map(k => k.text),
      events: (event.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text),
      observations: changed.map(o => FictionalTime.prose(o.text)),
      available: before.location?.id === after.location?.id ?
        after.choices.filter(c => !old.has(c.id)).map(c => c.name) : [],
      unavailable: before.location?.id === after.location?.id ?
        before.choices.filter(c => !now.has(c.id)).map(c => c.name) : [] };
  }
}
