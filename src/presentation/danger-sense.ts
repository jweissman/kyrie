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
    const place = Environment.encounter(campaign.world, campaign.playerActor), falls = new Map<string, number>();
    let wins = 0, fallen = 0, hurt = 0;
    for (let trial = 0; trial < this.trials; trial++) {
      const store = new CreatureStore(structuredClone([...ours, ...foes]));
      const battle = Battle.encounter(store, [...ours.map(c => ({ creatureId: c.id, team: 'fighters' as const })),
        ...foes.map(c => ({ creatureId: c.id, team: 'goblins' as const }))], { seed: `${key}:${trial}`, maxTurns: 150,
        ...place });
      while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
      if (battle.state.outcome !== 'fighters') { continue; }
      const company = battle.state.combatants.filter(f => f.team === 'fighters');
      wins++; fallen += company.filter(f => f.hp === 0).length;
      for (const f of company.filter(x => x.hp === 0)) { falls.set(f.id, (falls.get(f.id) ?? 0) + 1); }
      hurt += 1 - company.reduce((sum, f) => sum + f.hp, 0) / ours.reduce((sum, c) => sum + c.state.hp, 0);
      // Half the trials lost leave no doubt.
      if (trial === this.trials / 2 - 1 && wins === 0) { return { odds: 0, fallen: ours.length, hurt: 1 }; }
    }
    const frail = [...falls].sort((a, b) => b[1] - a[1])[0]?.[0];
    return { odds: wins / this.trials, fallen: wins ? fallen / wins : ours.length, hurt: wins ? hurt / wins : 1,
      ...frail ? { frail } : {} };
  }
  // Anyone falling in any of the fights played out makes it a hard one: one who falls may not get up. Who would
  // fall is said by name (Wenna, at seven hit points, where the beetles are no match for Tharash).
  private static judge(fight: { odds: number; fallen: number; hurt: number; frail?: string }, ours: Creature[],
    foes: Creature[]): Reckoning {
    const they = foes.length > 1 ? 'they are' : 'it is', them = foes.length > 1 ? 'them' : 'it';
    const danger: Danger = fight.odds < 0.25 ? 'deadly' : fight.odds < 0.6 ? 'grave'
      : fight.odds < 0.9 || fight.fallen > 0 ? 'hard' : fight.hurt > 0.25 ? 'fair' : 'slight';
    // The most seasoned says it; of one who would fall, someone else does.
    const judge = [...ours].sort((a, b) => Number(a.id === fight.frail) - Number(b.id === fight.frail)
      || b.base.level - a.base.level || b.state.experience - a.state.experience)[0]!;
    const frail = ours.length === 1 ? fight.frail && 'you' : ours.find(c => c.id === fight.frail)?.name;
    const said: Record<Danger, string> = {
      deadly: `${they} more than the company can take`,
      grave: `a fight with ${them} could be lost`,
      hard: `you would likely beat ${them}, but ${frail ?? 'someone'} could fall`,
      fair: `you should beat ${them}, though not unhurt`,
      slight: `${they} no match for you`,
    };
    return { danger, text: ours.length > 1 ? `${judge.name} reckons ${said[danger]}.`
      : `${said[danger].charAt(0).toUpperCase()}${said[danger].slice(1)}.` };
  }
}
