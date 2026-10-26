import type { Campaign } from '../campaign/campaign';
import type { CampaignEvent } from '../campaign/campaign-types';
import type { CombatEvent } from '../model';
import { Content } from '../content';
import { FictionalTime } from '../presentation/fictional-time';
import { Telling } from './telling';
import { BandNames } from './band-names';
import { CombatProjection } from '../combat-projection';
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
    // Everyone of the company who fell, the one who began it first (the cold playtest's epitaph named only the last
    // companion to fall, and not the one the player made).
    const first = campaign.readout.partyIds[0], all = [...new Set(fallen.map(c => c.actor))]
      .sort((a, b) => Number(b === first) - Number(a === first)).map(id => names.get(id) ?? 'You');
    const place = campaign.module.entities.find(e => e.id === campaign.world.one('at', campaign.playerActor ?? 'party'))?.name;
    const title = party.size > 1 ? 'No one is left standing' : `${who} is dead`;
    if (!last || !one) { return { title, lines: [`It is over${place ? `, at ${place}` : ''}.`] }; }
    // Where they fell, and where they lie, which is where the company is: it may have carried them on.
    const where = campaign.world.one('at', campaign.playerActor ?? 'party') ?? '';
    const fell = campaign.module.entities.find(e => e.id === this.scene(campaign, last))?.name ?? place;
    const blow = [...last.combat].reverse().find((c): c is Harm => c.type === 'damage' && c.target === one);
    const killer = blow ? names.get(blow.actor) ?? this.thing(campaign, blow.actor) : undefined;
    const weapon = blow ? this.weapon(campaign, last.combat, blow) : '';
    const rounds = last.combat.filter(c => c.type === 'initiative').length;
    const foes = new Set(last.combat.filter((c): c is Of<'action'> => c.type === 'action' && !party.has(c.command.actor))
      .map(c => c.command.actor));
    return { title, lines: [
      `${this.list(all.length ? all : [who])} fell${fell ? ` at ${fell}` : ''}, ${FictionalTime.part(last.elapsed)} of ${
        this.day(last.elapsed)}.`,
      this.began(campaign, last, names),
      killer ? `${this.upper(killer)} struck the last blow${weapon ? ` with ${weapon}` : ''}${blow!.amount ? `, for ${blow!.amount}` : ''}.` : '',
      // How many against how many, as it was: not "one against one" for one against two (the cold playtest).
      `${rounds > 1 ? `It lasted ${rounds} rounds` : 'It was over in a round'}; ${this.count(Math.max(1, foes.size))
      } against ${this.count(party.size)}.`,
      'The country goes on without you. What you did there is in the story so far.',
    ].filter(Boolean), memorial: { name: who, place: where,
      how: killer ? `${this.upper(killer)} killed ${who}.` : 'Nobody saw how.' } };
  }
  // What began it: being fallen on while doing something, or the company's own command.
  private static began(campaign: Campaign, event: CampaignEvent, names: Map<string, string>): string {
    const action = campaign.operator(event.prelude?.action ?? event.action);
    const words = action ? action.name.replace(/\{(\w+)\}/g, (_, k: string) => names.get(action.bindings?.[k] ?? '')
      ?? Telling.called(campaign, action.bindings?.[k] ?? k)) : '';
    if (event.prelude) {
      return words ? `You were set upon as you went to ${this.lower(words)}.` : 'You were set upon going about your business.';
    }
    if (action?.resolve?.name === 'combat') {
      const foe = action.bindings?.opponent;
      return `It began when you attacked ${foe ? Telling.called(campaign, foe) : 'them'}.`;
    }
    return words ? `It began when you chose to ${this.lower(words).replace(/\.$/, '')}.` : '';
  }
  // Who each creature is, as the company knew them (see BandNames).
  private static names(campaign: Campaign): Map<string, string> { return BandNames.of(campaign); }
  private static thing(campaign: Campaign, id: string): string {
    return Telling.called(campaign, id.replace(/^.*?:/, ''));
  }
  // Where the company was when it happened: where the last move up to then had taken it (it may have gone on since,
  // carrying whoever fell).
  private static scene(campaign: Campaign, event: CampaignEvent): string | undefined {
    const moved = new RegExp(`^\\+ at\\(${campaign.playerActor ?? 'party'}, ([^)]+)\\)$`), history = campaign.history;
    for (const e of history.slice(0, history.indexOf(event) + 1).reverse()) {
      const at = e.changes.map(c => moved.exec(c)?.[1]).find(Boolean);
      if (at) { return at; }
    }
    return undefined;
  }
  // What the blow was struck with: a weapon, or its own (its mandibles), or an ability.
  private static weapon(campaign: Campaign, combat: CombatEvent[], blow: Harm): string {
    const attack = [...combat].reverse().find((c): c is Of<'attack'> => c.type === 'attack' && c.target === blow.target
      && c.actor === blow.actor);
    const striker = campaign.readout.creatures.find(c => c.id === blow.actor);
    const own = striker && CombatProjection.fighter(striker, 'goblins').equipment?.weapon?.natural;
    if (attack?.weapon) { return `${own ? 'its' : 'a'} ${attack.weapon.replace(/_/g, ' ')}`; }
    const action = [...combat].reverse().find((c): c is Of<'action'> => c.type === 'action' && c.command.actor === blow.actor);
    const ability = action && Content.abilities.find(a => a.id === action.command.ability);
    return ability && !['melee', 'ranged'].includes(ability.id) ? ability.name.toLowerCase() : '';
  }
  private static day(elapsed: number): string {
    const n = Number(/^Day (\d+)/.exec(FictionalTime.at(elapsed))?.[1] ?? 1);
    return ['the first day', 'the second day', 'the third day', 'the fourth day', 'the fifth day'][n - 1] ?? `day ${n}`;
  }
  private static count(n: number): string { return ['one', 'two', 'three', 'four', 'five', 'six'][n - 1] ?? String(n); }
  private static list(items: string[]): string {
    return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)!}`;
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  private static lower(s: string): string { return s.charAt(0).toLowerCase() + s.slice(1); }
}
