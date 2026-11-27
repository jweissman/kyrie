import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import type { Frame } from '../src/creation/protocol';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { Digest } from '../src/session/digest';
import { PlayTool } from '../src/cli/play-tool';
import { Traces, type Kept } from '../src/cli/traces';

// A conversation is the session's (OR-1451; engine-focus.md §3): kept in the save (checkpoint version 2), so that a
// game reloaded mid-talk opens on the same talk, the same questions put and the same new replies standing out; the
// saved copy held equal to the replay of its steps, focus commands among them (taking no watch, changing no world
// fact). And cold captures are immutable: a trace kept before the focus was the session's replays unchanged.
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
async function begun(): Promise<{ host: EngineHost; frame: Frame }> {
  const host = new EngineHost(() => undefined);
  const frame = await host.handle({ kind: 'begin', campaign: Creation.generated, seed: 'wren', party, origin: 'wanderer' });
  return { host, frame: frame as Frame };
}
async function kept(host: EngineHost): Promise<SessionCheckpoint> {
  return (JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint }).checkpoint;
}
async function act(host: EngineHost, command: string): Promise<Frame> {
  return await host.handle({ kind: 'perform', command }) as Frame;
}
describe('a conversation kept with the game', () => {
  it('is the same talk reloaded, and the replay of its steps', async () => {
    const { host, frame } = await begun(), start = await kept(host);
    const talk = frame.menu.choices.find(c => c.does === 'talk_to' && c.command)!;
    let now = await act(host, talk.command!);
    const person = /^talk_to\((.+)\)$/.exec(talk.command!)![1]!;
    expect(now.question?.focus).toEqual({ kind: 'talk', with: person, page: 0, trading: false });
    // What they were doing as the company came over opens it, and the greeting's answer follows.
    expect(now.question?.talk?.lines.length).toBeGreaterThan(0);
    // A question put to them (not a way of leaving them: the wagoner's "Walk on").
    const reply = now.question!.talk!.rows.find(r => r.command && /^Ask\b/.test(r.label))!;
    now = await act(host, reply.command!);
    const live = now.question!.talk!;
    // Put, it is kept as asked (its row is asked again now, under words of its own: "Ask … again").
    expect((await kept(host)).conversation?.asked).toContain(reply.id);
    expect(live.lines.map(l => l.kind)).toContain('you');
    // Turned to again (a focus command): a step of the transcript, no watch, no world fact changed.
    const digest = Digest.of((host as unknown as { session: PlaySession }).session.campaign);
    now = await act(host, `focus:talk:${person}`);
    expect(Digest.of((host as unknown as { session: PlaySession }).session.campaign)).toBe(digest);
    const saved = await kept(host);
    expect(saved.version).toBe(2);
    expect(saved.focus).toEqual({ kind: 'talk', with: person, page: 0, trading: false });
    expect(saved.transcript.steps.at(-1)?.command).toBe(`focus:talk:${person}`);
    // Reloaded: the same talk, the same lines, the same questions put.
    const again = new EngineHost(() => undefined);
    const reloaded = await again.handle({ kind: 'resume', saved: JSON.stringify({ checkpoint: saved }) }) as Frame;
    expect(reloaded.question?.focus).toEqual(saved.focus);
    expect(reloaded.question?.talk?.lines).toEqual(now.question?.talk?.lines);
    expect(reloaded.question?.talk?.asked).toEqual(now.question?.talk?.asked);
    // The same rows (in the order the glance of the page reloaded leads them: a game taken up again is told anew).
    expect(reloaded.question?.talk?.rows.map(r => r.id).sort()).toEqual(now.question?.talk?.rows.map(r => r.id).sort());
    // Replayed from where it began, by the page's own requests: the saved copy is the replay's.
    const replay = new EngineHost(() => undefined);
    await replay.handle({ kind: 'resume', saved: JSON.stringify({ checkpoint: start }) });
    for (const step of saved.transcript.steps.slice(start.transcript.steps.length)) { await act(replay, step.command); }
    const replayed = await kept(replay);
    expect({ focus: replayed.focus, conversation: replayed.conversation })
      .toEqual({ focus: saved.focus, conversation: saved.conversation });
    // Its leave taken, back at the place, and nothing of the talk kept.
    now = await act(host, live.talk.leave.command!);
    expect(now.question?.focus).toEqual({ kind: 'place' });
    expect((await kept(host)).conversation).toBeUndefined();
  }, 120000);
  it('opens a checkpoint kept before the focus was the session\'s at the place', async () => {
    const { host } = await begun(), v2 = await kept(host);
    const v1 = { version: 1 as const, transcript: v2.transcript, save: v2.save };
    expect(PlaySession.resume(v1).focus).toEqual({ kind: 'place' });
  }, 120000);
});
describe('a cold capture', () => {
  it('replays unchanged, kept before the focus was the session\'s', async () => {
    const k = JSON.parse(readFileSync(join(Traces.dir, 'warmwall-door.json'), 'utf8')) as Kept;
    expect(await PlayTool.again(k.play!)).toEqual({ at: k.at, watch: k.watch, told: k.told });
  }, 120000);
});
