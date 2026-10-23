import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import type { CombatEvent } from '../model';
import { Content } from '../content';
import { FictionalTime } from '../presentation/fictional-time';
import { Telling } from './telling';
import type { Memorial } from '../world/memorial';

type Of<T extends CombatEvent['type']> = Extract<CombatEvent, { type: T }>;
type Death = Extract<CombatEvent, { type: 'defend' | 'death' | 'skip' | 'random' }>;
type Harm = Extract<CombatEvent, { type: 'damage' | 'heal' }>;
// How it came to this, when no one of the company is left standing: where and when, what began it, who struck the
// last blow and with what, and how long it went on. Told from the record of what happened, nothing more.
export class Obituary {
  static of(campaign: Campaign): { title: string; lines: string[]; memorial?: Memorial } {
    const events = campaign.history, last = [...events].reverse().find(e => e.combat.some(c => c.type === 'death'));
    const party = new Set(campaign.readout.partyIds), names = this.names(campaign);
    const fallen = (last?.combat ?? []).filter((c): c is Death => c.type === 'death' && party.has(c.actor));
    const one = fallen.at(-1)?.actor, who = one ? names.get(one) ?? 'You' : 'You';
    const place = campaign.module.entities.find(e => e.id === campaign.world.one('at', campaign.playerActor ?? 'party'))?.name;
    const title = party.size > 1 ? 'No one is left standing' : `${who} is dead`;
    if (!last || !one) { return { title, lines: [`It is over${place ? `, at ${place}` : ''}.`] }; }
    const where = campaign.world.one('at', campaign.playerActor ?? 'party') ?? '';
    const blow = [...last.combat].reverse().find((c): c is Harm => c.type === 'damage' && c.target === one);
    const killer = blow ? names.get(blow.actor) ?? this.thing(campaign, blow.actor) : undefined;
    const weapon = blow ? this.weapon(last.combat, blow) : '';
    const rounds = last.combat.filter(c => c.type === 'initiative').length;
    const foes = new Set(last.combat.filter((c): c is Of<'action'> => c.type === 'action' && !party.has(c.command.actor))
      .map(c => c.command.actor));
    return { title, lines: [
      `${who} fell${place ? ` at ${place}` : ''}, ${FictionalTime.part(last.elapsed)} of ${this.day(last.elapsed)}.`,
      this.began(campaign, last, names),
      killer ? `${this.upper(killer)} struck the last blow${weapon ? ` with ${weapon}` : ''}${blow!.amount ? `, for ${blow!.amount}` : ''}.` : '',
      `${rounds > 1 ? `It lasted ${rounds} rounds` : 'It was over in a round'}; ${foes.size > 1 ? `${foes.size} against ${party.size === 1 ? 'one' : party.size}` : 'one against one'}.`,
      'The country goes on without you. What you did there is in the story so far.',
    ].filter(Boolean), memorial: { name: who, place: where,
      how: killer ? `${this.upper(killer)} killed ${who}.` : 'Nobody saw how.' } };
  }
  // What began it: being fallen on while doing something, or the company's own command.
  private static began(campaign: Campaign, event: CampaignEvent, names: Map<string, string>): string {
    const action = campaign.operator(event.prelude?.action ?? event.action);
    const words = action ? action.name.replace(/\{(\w+)\}/g, (_, k: string) => names.get(action.bindings?.[k] ?? '')
      ?? Telling.called(campaign, action.bindings?.[k] ?? k)) : '';
    if (event.prelude) { return `You were set upon while you were busy: ${this.lower(words || 'going about your business')}.`; }
    if (action?.resolve?.name === 'combat') {
      const foe = action.bindings?.opponent;
      return `It began when you attacked ${foe ? Telling.called(campaign, foe) : 'them'}.`;
    }
    return words ? `It began when you chose to ${this.lower(words).replace(/\.$/, '')}.` : '';
  }
  private static names(campaign: Campaign): Map<string, string> {
    return new Map(campaign.readout.creatures.map(c => [c.id, c.name ?? c.id]));
  }
  private static thing(campaign: Campaign, id: string): string {
    return Telling.called(campaign, id.replace(/^.*?:/, ''));
  }
  private static weapon(combat: CombatEvent[], blow: Harm): string {
    const attack = [...combat].reverse().find((c): c is Of<'attack'> => c.type === 'attack' && c.target === blow.target
      && c.actor === blow.actor);
    if (attack?.weapon) { return `a ${attack.weapon.replace(/_/g, ' ')}`; }
    const action = [...combat].reverse().find((c): c is Of<'action'> => c.type === 'action' && c.command.actor === blow.actor);
    const ability = action && Content.abilities.find(a => a.id === action.command.ability);
    return ability && !['melee', 'ranged'].includes(ability.id) ? ability.name.toLowerCase() : '';
  }
  private static day(elapsed: number): string {
    const n = Number(/^Day (\d+)/.exec(FictionalTime.at(elapsed))?.[1] ?? 1);
    return ['the first day', 'the second day', 'the third day', 'the fourth day', 'the fifth day'][n - 1] ?? `day ${n}`;
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  private static lower(s: string): string { return s.charAt(0).toLowerCase() + s.slice(1); }
}
