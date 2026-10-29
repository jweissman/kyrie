import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame, Message } from '../web/engine/protocol';
import { ChoiceList } from '../src/ui/choice-list';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';

// A fight's page closed as the last blow landed, and the place came back at once with the fight told over again
// in it: the outcome, the wounds and what was gained were never seen together. The page now holds the fight once it
// has ended, the last blows, how it ended and what it was worth, until the player goes on; and the place does not
// tell the blows again. Wenna, made hard to kill, sees off the bone hounds in a1's barrow halls.
class Hounds {
  static async host(seen: Frame[] = []) {
    const host: EngineHost = new EngineHost((m: Message) => {
      if (m.kind === 'frame') { seen.push(m.frame); setTimeout(() => void host.handle({ kind: 'fight' }), 0); }
    });
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const held = host as unknown as { session: PlaySession }, checkpoint = held.session.checkpoint();
    const save = checkpoint.save;
    for (const m of save.creatures.filter(x => save.state.partyIds.includes(x.id))) {
      m.base.maxHp = 300; m.state.hp = 300;
    }
    const room = 'region__w8_halls_mourners', world = new World(save.module, save.state.world)
      .apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', room) },
        { kind: 'retract', call: ModuleWriter.call('unlit', room) }]);
    save.state.world = CreatureFacts.project(world, save.definition!.actors, new CreatureStore(save.creatures))
      .snapshot;
    held.session = PlaySession.resume(checkpoint);
    return { host, session: held.session };
  }
  static async attack(host: EngineHost, session: PlaySession) {
    const attack = PlayerView.choices(session.campaign).find(c => /^Attack/.test(c.choice.name))!;
    return await host.handle({ kind: 'perform', command: attack.choice.id }) as Frame;
  }
}

describe('a fight the company begins', () => {
  // It opens on what began it, never on what was told before (a fight with bats begun by the company had opened on
  // "Brann lights a torch.": play 13).
  it('does not open on what was told before the command that began it', async () => {
    const seen: Frame[] = [], { host, session } = await Hounds.host(seen);
    const before = (await host.handle({ kind: 'perform', command: 'wait' }) as Frame).leaf.exchange?.lines
      .map(l => l.text) ?? [];
    expect(before.length).toBeGreaterThan(0);
    await Hounds.attack(host, session);
    const opened = seen.find(f => f.combat)!.opening;
    expect(opened.filter(l => before.includes(l))).toEqual([]);
  }, 120000);
});

describe('a fight that has ended', () => {
  it('is held on its page, how it ended and what it was worth, until the player goes on', async () => {
    const { host, session } = await Hounds.host(), frame = await Hounds.attack(host, session);
    expect(frame.combat?.outcome).toBe('fighters');
    expect(frame.combat!.after).toContain('The fight is won.');
    expect(frame.combat!.after!.some(l => /^Wenna gains \d+ experience\.$/.test(l))).toBe(true);
    expect(frame.combat!.foes.every(f => f.down)).toBe(true);
    // Its page calls the hounds as the place did, and the account afterwards does: never by their number in the fight.
    expect(frame.combat!.foes.map(f => f.name)).toEqual(['the first of the agile bone hounds',
      'the second of the agile bone hounds']);
    expect(frame.combat!.exchanges.filter(e => /hound \d/.test(e.text))).toEqual([]);
    // Going on is all there is to do; the place it goes on to does not tell the blows over again.
    expect(ChoiceList.all(ChoiceList.combat(frame.combat!)).map(c => c.label)).toEqual(['Go on']);
    const told = frame.leaf.exchange?.lines.map(l => l.text) ?? [];
    expect(told.filter(l => / falls\.$| hits | damage /.test(l))).toEqual([]);
    // The journal keeps the fight as it was.
    expect(frame.entries.at(-1)!.lines.some(l => / falls\.$/.test(l))).toBe(true);
    // The next command's page is the place's.
    expect((await host.handle({ kind: 'perform', command: 'wait' }) as Frame)
      .combat).toBeUndefined();
  }, 120000);
});
