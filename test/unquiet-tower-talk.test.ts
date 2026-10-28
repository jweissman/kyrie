import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';

// The unquiet tower, for a company that would sooner talk than fight (play 8: a bard at the tower found the
// necromancer with nothing to say, and his drowned sister among the animals, with nothing to say either). Asked
// while he works, he says it is one of the dead he wants; the letters say who; the priest at the shrine who wrote her
// name gives it back; called by it, she asks to be let go; and told so, he puts out the flame himself.
class Tower {
  static async start() {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'bard' }] });
    return PlaySession.start(w.path, 'kite', w.source);
  }
  static held(s: PlaySession) {
    return s.campaign as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(x: unknown): void };
  }
  static put(s: PlaySession, place: string) {
    const held = this.held(s);
    held.commit(held.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }, { kind: 'retract', call: ModuleWriter.call('unlit', place) }]));
  }
  static say(s: PlaySession, words: RegExp): Promise<unknown> {
    const choice = PlayerView.choices(s.campaign).find(c => words.test(c.choice.name));
    if (!choice) { throw new Error(`Nothing to say like ${words}: ${PlayerView.choices(s.campaign).map(c => c.choice.name).join('; ')}`); }
    return s.perform(choice.choice.id);
  }
}

describe('the unquiet tower, talked through', () => {
  it('gives the drowned girl back her name, and her brother puts out the flame', async () => {
    const s = await Tower.start(), c = s.campaign;
    Tower.put(s, 'tower__study');
    await Tower.say(s, /what he wants with the dead$/);
    Tower.held(s).commit(Tower.held(s).world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'tower__sister') }]));
    const shrines = c.module.entities.filter(e => /^region__s\d+_shrine$/.test(e.id)).map(e => e.id);
    for (const shrine of shrines) {
      Tower.put(s, shrine);
      if (PlayerView.choices(c).some(x => /about .+'s sister$/.test(x.choice.name))) { break; }
    }
    await Tower.say(s, /about .+'s sister$/);
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'tower__her_name'))).toBe(true);
    Tower.put(s, 'tower__cell');
    const girl = ScreenModel.build(c).people.find(p => p.id === 'tower__maren');
    expect(girl?.kind).toBe('person');
    await Tower.say(s, /^Call the drowned girl by her name/);
    await Tower.say(s, /^Ask the drowned girl what she wants/);
    Tower.put(s, 'tower__study');
    await Tower.say(s, /what his sister asked$/);
    expect(c.world.test(ModuleWriter.call('tower__ended', 'tower__necromancer'))).toBe(true);
  }, 120000);
});
