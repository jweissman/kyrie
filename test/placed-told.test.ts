import { beforeAll, describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Beside } from '../src/campaign/beside';
import { CombatProjection } from '../src/combat-projection';
import { Content } from '../src/content';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Tactics } from '../src/tactics';
import { WorldAssembler } from '../src/world/world-assembler';
import type { Campaign } from '../src/campaign/campaign';
import type { Observation } from '../src/lang/module';

// Placement invariants (engine-pressure.md, section 6(b); PL-07's decision 4): of a1's hostile groups where real play
// places them (an origin, one life: the undertown written for a company of one), every one a lone first-level warrior
// beats less than half the time is told before it is engaged, and escapable. A temper that warns first, or one that
// bars a way (inhabitants.kyr), tells itself and lets a company go before it closes: its escape is leaving. Any other
// falls on whoever comes in, so it must be heard or seen from a place beside it by anyone, not only by a reader of
// sign, and in the fight Flight must be open: the warrior offered it on his first turn, every time. (Of the keepers
// that warn, three can end him before his first turn, one to three fights in ten: the barrow's recess2 raider, the
// halls' mummy, the vault's barrow ghoul. Warned, he need not stay; were any of them to fall on him unwarned, this
// would fail.) Ten fights a group, as placements.md's tools fight them; a group not yet come (newcomers, elsewhere or
// beyond) is not placed.
interface Group { id: string; temper: string; at: string; won: number; flight: boolean }
const fights = 10;
class Placed {
  static async campaign(): Promise<Campaign> {
    const party = [{ name: 'Wat', raceId: 'human', classId: 'warrior' }];
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'debt', party });
    return (await PlaySession.start(w.path, 'a1', w.source)).campaign;
  }
  static groups(c: Campaign): Group[] {
    const world = c.world, read = c.readout;
    return Object.keys(read.inhabitants).filter(g => /__(s1_u_|w\d+_|e1_)/.test(g) && world.one('temperament', g)
      && !/elsewhere|_beyond$/.test(world.one('at', g) ?? 'elsewhere'))
      .map(id => ({ id, temper: world.one('temperament', id)!, at: world.one('at', id)!,
        ...this.fought(c, Beside.foes(world, read, id)),
        ...world.holds(JSON.stringify(['drawable', id])) ? { flight: this.fought(c, Beside.foes(world, read, id), true)
          .flight } : {} }));
  }
  // How often a lone first-level warrior beats them, and whether he was offered Flight on his first turn each time.
  // A band that can be drawn out (heard from the next room: inhabitants.kyr) is met ready by a company that drew it
  // out and waited for it: its Flight is reckoned so, as that is the way out the telling gives.
  static fought(c: Campaign, members: string[], ready = false): { won: number; flight: boolean } {
    let won = 0, flight = true;
    for (let n = 0; n < fights; n++) {
      const content = new Content(`told-${n}`);
      const made = CombatProjection.fighter(content.createCreature('hero', { raceId: 'human', classId: 'warrior' },
        `hero:${n}`), 'fighters');
      const hero = ready ? { ...made, statuses: [...made.statuses, { id: 'ready', remaining: 1,
        clock: 'until-removed' as const }] } : made;
      const foes = members.map((id, k) => ({ ...CombatProjection.fighter(structuredClone(
        c.readout.creatures.find(x => x.id === id)!), 'goblins'), id: `foe${k}` }));
      // At play's limit of turns (Battle's 500): at 60 a long fight had ended a draw, and was counted lost.
      const b = new Battle({ id: 'told', combatants: [hero, ...foes], abilities: Content.abilities }, `told:${n}`);
      let first = true;
      for (let s = 0; !b.state.outcome && s < 5000; s++) {
        const legal = b.legalCommands();
        if (first && b.state.actor === 'hero') { first = false; flight &&= legal.some(x => x.ability === 'flee'); }
        b.step(Tactics.choose(b.state, b.plain(legal)));
      }
      flight &&= !first;
      if (b.state.outcome === 'fighters') { won++; }
    }
    return { won: won / fights, flight };
  }
  // What is wrong with each lethal group that falls on whoever comes in: untold, or no Flight.
  static offenders(groups: Group[], observations: readonly Observation[], tells: Set<string>): string[] {
    return groups.filter(g => g.won < 0.5 && !tells.has(g.temper)).flatMap(g => {
      const beside = observations.filter(o => !o.by && o.place !== g.at && JSON.stringify(o.when).includes(`"${g.id}"`));
      return [...beside.length ? [] : [`${g.id}: ${g.temper}, not told before it is engaged`],
        ...g.flight ? [] : [`${g.id}: no Flight`]];
    });
  }
  // The tempers that tell themselves: those that warn first, and the obedient, which bar a way and do not close.
  static tells(c: Campaign): Set<string> {
    return new Set([...c.world.related('warnsFirst').map(f => f.args[0]!), 'temper_obedient']);
  }
}

describe('a1\'s lethal placements, for a lone first-level warrior', () => {
  let c: Campaign, groups: Group[];
  beforeAll(async () => { c = await Placed.campaign(); groups = Placed.groups(c); }, 120000);
  // The band that falls on whoever comes in and is lethal (at play's 500 turns, the barrow's ossuary, which lies in
  // wait and is heard by anyone as one of the worst).
  const falls = () => groups.find(g => g.won < 0.5 && !Placed.tells(c).has(g.temper))!;
  it('are each told before they are engaged, and escapable', () => {
    expect(groups.filter(g => g.won < 0.5).length).toBeGreaterThan(3);
    expect(falls()).toBeDefined();
    expect(Placed.offenders(groups, c.module.observations ?? [], Placed.tells(c))).toEqual([]);
  });
  it('would be caught: a band that falls on whoever comes in, with its sound taken away', () => {
    const band = falls(), quiet = (c.module.observations ?? []).filter(o => !JSON.stringify(o.when)
      .includes(`"${band.id}"`));
    expect(Placed.offenders(groups, quiet, Placed.tells(c))).toEqual([`${band.id}: ${band.temper}, not told before `
      + 'it is engaged']);
  });
  it('would be caught: its sound heard only by a reader of sign', () => {
    const band = falls(), signed = (c.module.observations ?? []).map(o => JSON.stringify(o.when)
      .includes(`"${band.id}"`) ? { ...o, by: 'woodcraft' } : o);
    expect(Placed.offenders(groups, signed, Placed.tells(c))).toHaveLength(1);
  });
  it('would be caught: a warning keeper made savage, or a fight with no Flight', () => {
    const keeper = groups.find(g => g.won < 0.5 && g.temper === 'temper_territorial' && g.flight)!;
    const changed = groups.map(g => g === keeper ? { ...g, temper: 'temper_savage' } : g);
    expect(Placed.offenders(changed, c.module.observations ?? [], Placed.tells(c))).toEqual([`${keeper.id}: `
      + 'temper_savage, not told before it is engaged']);
    const band = falls(), held = groups.map(g => g === band ? { ...g, flight: false } : g);
    expect(Placed.offenders(held, c.module.observations ?? [], Placed.tells(c))).toEqual([`${band.id}: no Flight`]);
  });
});
