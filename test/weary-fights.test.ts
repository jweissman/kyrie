import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';
import { Tactics } from '../src/tactics';
import { HeldConditions } from '../src/campaign/held-conditions';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// What a fight is fought under (a company's weariness, its readiness for what it waited for, the place's laws) is the
// fight's, and goes with it (Battle.held). Before, a fight wrote a weary company's weariness onto whoever fought, for
// good, and the next weary fight added it again: "Invalid creature conditions", met by the owner attacking a raiding
// party and in a cave gallery, and by What Tessary Owes's author, set upon by the ebb-runners (its friction E3).
class Weary {
  static fight(store: CreatureStore, us: string, them: string, seed: string) {
    const battle = Battle.encounter(store, [{ creatureId: us, team: 'fighters' }, { creatureId: them, team: 'goblins' }],
      { seed, weary: [us], ready: [us] });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
  }
  static carried(store: CreatureStore, id: string): string[] { return store.get(id).state.conditions.map(c => c.id); }
  static async start() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'wren', w.source);
  }
  static attack(s: PlaySession): string {
    return PlayerView.choices(s.campaign).find(c => /^attack\(/.test(c.choice.id))!.choice.id;
  }
  static party(s: PlaySession): string[] {
    const r = s.campaign.readout;
    return r.creatures.filter(c => r.partyIds.includes(c.id)).flatMap(c => c.state.conditions.map(x => x.id));
  }
}

describe('a weary company\'s fights', () => {
  it('leave nothing of what they were fought under on those who fought them, fight after fight', () => {
    const content = new Content('weary');
    const store = new CreatureStore([content.createCreature('wenna', { raceId: 'human', classId: 'warrior' }),
      ...['w1', 'w2'].map(id => content.createCreature(id, { raceId: 'wolf' }))]);
    Weary.fight(store, 'wenna', 'w1', 'first');
    expect(Weary.carried(store, 'wenna').filter(id => id === 'weary' || id === 'ready')).toEqual([]);
    expect(() => Weary.fight(store, 'wenna', 'w2', 'second')).not.toThrow();
    expect(Weary.carried(store, 'wenna').filter(id => id === 'weary' || id === 'ready')).toEqual([]);
  });
  it('are let go of as a game kept before is opened, and nothing else is', () => {
    const wenna = new Content('kept').createCreature('wenna', { raceId: 'human', classId: 'warrior' });
    wenna.state.conditions = [{ id: 'weary', remaining: 1, clock: 'until-removed' },
      { id: 'ready', remaining: 1, clock: 'until-removed' }, { id: 'weary', remaining: 6, clock: 'world-time', source: 'x' }];
    const store = new CreatureStore([wenna]);
    expect(HeldConditions.release(store)).toBe(true);
    expect(store.get('wenna').state.conditions).toEqual([{ id: 'weary', remaining: 6, clock: 'world-time', source: 'x' }]);
    expect(HeldConditions.release(store)).toBe(false);
  });
  // The owner's two ways in: a weary company fights in a cave gallery, goes on by the offered ways into the next, and
  // fights there; and the game is the same kept, opened again, and played again from its commands.
  it('fights in one cave gallery, walks on into the next, and fights again, kept and replayed alike', async () => {
    const s = await Weary.start();
    for (const wait of ['wait_for_dark', 'wait_watch']) { await s.perform(wait); }
    expect(s.campaign.world.test(ModuleWriter.call('weary', 'party'))).toBe(true);
    await GeneratedWorld.travel(s, 'w9_adit_mouth');
    await s.perform(Weary.attack(s));
    expect(Weary.party(s).filter(id => id === 'weary')).toEqual([]);
    await s.perform('light_item(region__party_1__torch)');
    await GeneratedWorld.travel(s, 'w9_adit_crossing');
    const second = await s.perform(Weary.attack(s));
    expect(second.combat.some(e => e.type === 'end')).toBe(true);
    expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
    const replay = await Weary.start();
    await replay.replay(s.transcript.steps);
    expect(replay.canonical()).toBe(s.canonical());
  }, 180000);
});
