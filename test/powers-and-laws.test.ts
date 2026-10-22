import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Environment } from '../src/campaign/environment';

// The shared world rules at work with nothing in a place's own rules naming them: a power takes a stronghold that
// stands empty, by night, with the men it posts (dominion); and a place's law holds every creature fighting there.
class Proving {
  static start() { return PlaySession.start('test/fixtures/proving/campaign.json', 'proving', NodeBundleSource.shared); }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static move(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    const here = s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')!.args[1]!;
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', here) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
}

describe('powers and laws', () => {
  it('lets a power that covets an empty stronghold take it by night, with the men it posts', async () => {
    const s = await Proving.start();
    for (let i = 0; i < 30 && !Proving.holds(s, 'holds', 'world__thane', 'world__gatehouse'); i++) { await s.perform('wait_hour'); }
    expect(Proving.holds(s, 'holds', 'world__thane', 'world__gatehouse')).toBe(true);
    expect(Proving.holds(s, 'at', 'world__men', 'world__gatehouse')).toBe(true);
    expect(Proving.holds(s, 'vacant', 'world__gatehouse')).toBe(false);
  }, 60000);
  it('holds every creature in a fight to the law of the place it is fought in', async () => {
    const s = await Proving.start();
    Proving.move(s, 'world__vault');
    expect(Environment.laws(s.campaign.world, 'party')).toEqual(['unlit_law']);
    const attack = s.campaign.available().find(a => a.resolve?.name === 'combat' && a.resolve.args[0] === 'world__ghoul')!;
    const battle = s.campaign.encounterBattle(attack.id);
    expect(battle.state.combatants.every(f => f.statuses.some(x => x.id === 'unlit_law'))).toBe(true);
    expect(battle.state.combatants.find(f => f.team === 'fighters')!.statuses.find(x => x.id === 'unlit_law')!.clock)
      .toBe('until-removed');
  }, 60000);
});
