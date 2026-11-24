import type { Campaign } from '../src/campaign/campaign';
import type { Creature } from '../src/creature';
import type { CombatEvent } from '../src/model';
import type { Danger } from '../src/presentation/danger-sense';
import { Environment } from '../src/campaign/environment';
import { ModuleWriter } from '../src/lang/module-writer';
import { NoviceCountry, type Band } from './novice-country';
import { NoviceFights, type Setup } from './novice-fights';
import { NoviceMeeting } from './novice-meeting';

// A band of the first hour's reach fought by the route's company (CB-01; see scripts/first-hour-fights.ts), standing
// to the end, over seeded trials (the fight set up as the game sets one up: NoviceFights, NoviceMeeting): what the
// company's reckoning said of it before it began (DangerSense, as NoviceFights.said reads it), and per trial its
// rounds (one initiative a round), the hit points the company lost, whether the foes' leader (the stoutest) lived past
// the first round, whether it was won, and whether the one who plays fell.
export interface Banded {
  band: string; name: string; where: string; minutes: number; members: number; said: Danger; trials: number;
  won: number; fell: number; rounds: number[]; lost: number[]; hit: number; leaderLived: number;
}
export class FirstHourBands {
  // The first hour's reach: the bands within this many minutes of where a new life begins (the big ruin's barrow, the
  // first ruin's keeper, the raiders' ring-fort, Redkeep, the Numbered House), the nearest first.
  static readonly reach = 230;
  // The country's bands in reach of the start (begun: a new life's campaign as it stands at the start), fought by the
  // route's company: the warrior and the first town's hire (the walk takes on Carlin, the cheapest), whole.
  static bands(begun: Campaign, trials: number): Banded[] {
    const country = NoviceCountry.read(begun, 'iscoed'), creatures = begun.readout.creatures;
    const ids = [...new Set([...begun.readout.partyIds, ...country.hire?.members ?? []])];
    const company = ids.map(id => creatures.find(c => c.id === id))
      .filter((c): c is Creature => !!c).map(c => FirstHourBands.whole(c));
    const near = [...country.bands].filter(b => b.minutes <= this.reach).sort((a, b) => a.minutes - b.minutes);
    return near.flatMap(b => this.band(begun, b, company, trials));
  }
  // A member as a new life that has hired them stands: at full hit points.
  static whole(c: Creature): Creature {
    const made = structuredClone(c);
    made.state.hp = made.base.maxHp;
    return made;
  }
  static median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? 0;
  }
  private static band(campaign: Campaign, band: Band, company: Creature[], trials: number): Banded[] {
    const creatures = campaign.readout.creatures, world = campaign.world, party = campaign.playerActor!;
    const foes = band.members.map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c);
    const reading = NoviceMeeting.read(campaign, band, company);
    if (reading.tolerated || !foes.length) { return []; }
    const setup: Setup = { seed: `route:${band.id}`, company, foes, lead: company[0]!.id,
      prisoners: world.relates('takesPrisoners') && world.test(ModuleWriter.call('takesPrisoners', band.id)),
      place: Environment.encounter(world, party, company.map(c => c.id), band.id),
      ...reading.moment ? { moment: reading.moment } : {} };
    const out: Banded = { band: band.id, name: band.name, where: band.where, minutes: band.minutes,
      members: foes.length, said: NoviceFights.said(setup), trials, won: 0, fell: 0, rounds: [], lost: [], hit: 0,
      leaderLived: 0 };
    const leader = [...foes].sort((a, b) => b.base.maxHp - a.base.maxHp)[0]!.id;
    for (let t = 0; t < trials; t++) { this.trial(setup, `${setup.seed}:${t}`, leader, out); }
    return [out];
  }
  private static trial(setup: Setup, seed: string, leader: string, out: Banded) {
    const battle = NoviceFights.battle(setup, seed), told: CombatEvent[] = [];
    const ours = new Set(setup.company.map(c => c.id));
    while (!battle.state.outcome) { told.push(...battle.step(battle.chosen())); }
    let r = 0, died = 0, lost = 0;
    for (const x of told) {
      if (x.type === 'initiative') { r++; }
      if (x.type === 'death' && x.actor === leader && !died) { died = r; }
      if (x.type === 'damage' && ours.has(x.target)) { lost += x.amount; }
    }
    out.rounds.push(r); out.lost.push(lost);
    if (lost > 0) { out.hit++; }
    if (!died || died > 1) { out.leaderLived++; }
    if (battle.state.outcome === 'fighters') { out.won++; }
    if ((battle.state.combatants.find(f => f.id === setup.lead)?.hp ?? 0) === 0) { out.fell++; }
  }
}
