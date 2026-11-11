import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import type { Frame } from '../web/engine/protocol';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator, type Told } from '../src/presentation/narrator';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Digest } from '../src/session/digest';

// The browser's engine host and the terminal's session, from one generated world and checkpoint, given the same
// public commands, come to the same world, the same place, and the same opportunities led with, for the same reasons
// and of the same kinds; and a save made by the one reloads as the other (the headless investigation, 11 November: the
// two clients share one kernel, and this holds them to it). Screenshots and whitespace are not compared.
class Pair {
  static async start() {
    const host = new EngineHost(() => undefined);
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
    await host.handle({ kind: 'begin', campaign: Creation.generated, seed: 'wren', party, origin: 'wanderer' });
    const kept = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint };
    return { host, terminal: PlaySession.resume(kept.checkpoint) };
  }
  static session(host: EngineHost): PlaySession { return (host as unknown as { session: PlaySession }).session; }
  // What each says now: the world's digest, where the company is, and what is led with and why.
  static said(session: PlaySession, frame?: Frame, told?: Told) {
    const screen = frame?.screen ?? ScreenModel.build(session.campaign);
    const glance = frame?.leaf.glance ?? Narrator.leaf(session.campaign, screen, told).glance;
    return { digest: Digest.of(session.campaign), at: screen.place.id,
      led: (glance?.acts ?? []).map(a => [a.choice, a.why, a.aspects.join('+')]) };
  }
}

describe('the browser and the terminal', () => {
  it('go the same way from one checkpoint, by the same public commands, and save as each other', async () => {
    const { host, terminal } = await Pair.start();
    expect(Pair.said(terminal).digest).toBe(Pair.said(Pair.session(host)).digest);
    // A step about where the company is, a wait, a word with someone, and a journey across country.
    const pick = (s: PlaySession, test: (id: string) => boolean) => PlayerView.choices(s.campaign)
      .map(r => r.choice.id).find(id => test(id) && !s.crosses(id));
    const steps: (() => string | undefined)[] = [
      () => pick(terminal, id => /^go\(/.test(id)),
      () => 'wait',
      () => pick(terminal, id => /^talk_to\(/.test(id)),
    ];
    for (const step of steps) {
      const command = step();
      if (!command) { continue; }
      const frame = await host.handle({ kind: 'perform', command }) as Frame;
      // As the terminal tells it (see Terminal.play): what came of it, read against the view before.
      const name = PlayerView.choices(terminal.campaign).find(r => r.choice.id === command)?.choice.name ?? command;
      const before = PlayerView.observe(terminal.campaign), event = await terminal.leg(command);
      const told: Told = { event, feedback: ActionFeedbackView.read(terminal.campaign, event, before), said: name,
        moved: before.location?.id !== PlayerView.observe(terminal.campaign).location?.id };
      expect(Pair.said(terminal, undefined, told)).toEqual(Pair.said(Pair.session(host), frame));
    }
    const away = ScreenModel.build(terminal.campaign).destinations?.[0];
    if (away) {
      const frame = await host.handle({ kind: 'travel', destination: away.id }) as Frame;
      await terminal.leg(`travel:${away.id}`);
      expect(Pair.said(terminal).at).toBe(frame.screen.place.id);
      expect(Pair.said(terminal).digest).toBe(Pair.said(Pair.session(host)).digest);
    }
    // Saved by the browser, reloaded as the terminal: the same world.
    const kept = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint };
    expect(Digest.of(PlaySession.resume(kept.checkpoint).campaign)).toBe(Digest.of(terminal.campaign));
  }, 300000);
});
