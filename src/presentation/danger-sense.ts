import { Canon } from '../canon/canon';
import { Battle } from '../battle';
import { CreatureStore } from '../creature-store';
import { Tactics } from '../tactics';
import { Environment } from '../campaign/environment';
import type { Campaign } from '../campaign/campaign';
import type { Creature } from '../creature';

export type Danger = 'slight' | 'fair' | 'hard' | 'grave' | 'deadly';
export interface Reckoning { danger: Danger; text: string }

// How a fight with a group would likely go, as the company reckons it before it starts: the fight played out a few
// times from where everyone stands now, both sides fighting as the game's own tactics would. It decides nothing; it
// is what a seasoned eye makes of the odds, said by the most seasoned member in words, not numbers.
interface Trial { won: boolean; fell: string[]; hurt: number }
export class DangerSense {
  static readonly trials = 6;
  private static readonly reckoned = new Map<string, Reckoning>();
  static reckon(campaign: Campaign, group: string): Reckoning | undefined {
    const read = campaign.readout;
    const foes = this.standing(campaign, read.inhabitants[group] ?? []), ours = this.standing(campaign, read.partyIds);
    if (!foes.length || !ours.length) { return undefined; }
    const key = JSON.stringify([group, ...[...ours, ...foes].map(c => [c.id, c.state.hp, c.state.mana, c.base.level,
      c.state.conditions.map(s => s.id)])]);
    let reckoning = this.reckoned.get(key);
    if (!reckoning) {
      reckoning = this.judge(this.play(campaign, ours, foes, key), ours, foes);
      if (this.reckoned.size > 200) { this.reckoned.clear(); }
      this.reckoned.set(key, reckoning);
    }
    return reckoning;
  }
  private static standing(campaign: Campaign, ids: readonly string[]): Creature[] {
    const creatures = campaign.readout.creatures;
    return ids.map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c && c.state.hp > 0);
  }
  // The fight played out: how often the company wins, and in a win, how many of it fall, how hurt it is, and who fell
  // most often.
  private static play(campaign: Campaign, ours: Creature[], foes: Creature[], key: string) {
    const place = Environment.encounter(campaign.world, campaign.playerActor), played: Trial[] = [];
    for (let trial = 0; trial < this.trials; trial++) {
      played.push(this.trial(ours, foes, `${key}:${trial}`, place));
      // Half the trials lost leave no doubt.
      if (trial === this.trials / 2 - 1 && played.every(t => !t.won)) {
        return { odds: 0, fallen: ours.length, hurt: 1 };
      }
    }
    // Six fights decide most reckonings; one in the uneven middle (could be lost, or likely won) is played six more
    // times before it is said (M16's free play heard "you would likely beat them" of a fight won less than half the
    // time, from four wins in six).
    const first = played.filter(t => t.won).length / this.trials;
    for (let trial = this.trials; first >= 0.25 && first < 0.9 && trial < this.trials * 2; trial++) {
      played.push(this.trial(ours, foes, `${key}:${trial}`, place));
    }
    const won = played.filter(t => t.won), falls = new Map<string, number>();
    for (const id of won.flatMap(t => t.fell)) { falls.set(id, (falls.get(id) ?? 0) + 1); }
    const frail = [...falls].sort((a, b) => b[1] - a[1])[0]?.[0];
    return { odds: won.length / played.length,
      fallen: won.length ? won.reduce((n, t) => n + t.fell.length, 0) / won.length : ours.length,
      hurt: won.length ? won.reduce((n, t) => n + t.hurt, 0) / won.length : 1, ...frail ? { frail } : {} };
  }
  // One fight played out: whether the company won it, who of it fell, and how hurt it came out.
  private static trial(ours: Creature[], foes: Creature[], seed: string,
    place: ReturnType<typeof Environment.encounter>): Trial {
    const store = new CreatureStore(structuredClone([...ours, ...foes]));
    const battle = Battle.encounter(store, [...ours.map(c => ({ creatureId: c.id, team: 'fighters' as const })),
      ...foes.map(c => ({ creatureId: c.id, team: 'goblins' as const }))], { seed, maxTurns: 150, ...place });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
    if (battle.state.outcome !== 'fighters') { return { won: false, fell: [], hurt: 1 }; }
    const company = battle.state.combatants.filter(f => f.team === 'fighters');
    return { won: true, fell: company.filter(f => f.hp === 0).map(f => f.id),
      hurt: 1 - company.reduce((sum, f) => sum + f.hp, 0) / ours.reduce((sum, c) => sum + c.state.hp, 0) };
  }
  // Anyone falling in any of the fights played out makes it a hard one: one who falls may not get up. Who would
  // fall is said by name (Wenna, at seven hit points, where the beetles are no match for Tharash).
  private static judge(fight: { odds: number; fallen: number; hurt: number; frail?: string }, ours: Creature[],
    foes: Creature[]): Reckoning {
    // One who is of a people is spoken of as they are, as a band is: not "it"; one person alone, by name ("Sir Hamo
    // Ashdown is more than you can take", where a challenge to single combat had read "They are more than the company
    // can take" to one who had come alone).
    const people = foes.length > 1 || foes.some(f => !!Canon.ancestries[f.raceId]);
    const one = foes.length === 1 && people ? foes[0]!.name.split(', ')[0] : undefined;
    const they = one ? `${one} is` : people ? 'they are' : 'it is', them = one ?? (people ? 'them' : 'it');
    const danger: Danger = fight.odds < 0.25 ? 'deadly' : fight.odds < 0.6 ? 'grave'
      : fight.odds < 0.9 || fight.fallen > 0 ? 'hard' : fight.hurt > 0.25 ? 'fair' : 'slight';
    // The most seasoned says it; of one who would fall, someone else does.
    const judge = [...ours].sort((a, b) => Number(a.id === fight.frail) - Number(b.id === fight.frail)
      || b.base.level - a.base.level || b.state.experience - a.state.experience)[0]!;
    // Alone, the one who could fall is you, and no one would get you up (a lone warrior took on hobs reckoned only
    // "someone could fall", and died).
    const frail = ours.length === 1 ? 'you' : ours.find(c => c.id === fight.frail)?.name;
    const said: Record<Danger, string> = {
      deadly: `${they} more than ${ours.length === 1 ? 'you' : 'the company'} can take`,
      grave: `a fight with ${them} could be lost`,
      hard: `you would likely beat ${them}, but ${frail ?? 'someone'} could fall${ours.length === 1
        ? ', with no one to get you up' : ''}`,
      fair: `you should beat ${them}, though not unhurt`,
      slight: `${they} no match for you`,
    };
    return { danger, text: ours.length > 1 ? `${judge.name} reckons ${said[danger]}.`
      : `${said[danger].charAt(0).toUpperCase()}${said[danger].slice(1)}.` };
  }
}
