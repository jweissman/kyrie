import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { EngineHost } from '../web/engine/engine-host';
import type { Frame } from '../web/engine/protocol';
import type { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';

// A game played in a generated world, replayed in the terminal from its transcript. Found by an architecture
// review: the terminal's replay could not start a generated world at all, since the world is drawn, not read from a
// file, and the transcript did not keep what it was drawn for. It keeps it now (Transcript.drawn), and the world is
// drawn again from it (DrawnWorld), by the same options the browser draws it by.
class Played {
  static async game() {
    const host = new EngineHost(() => undefined);
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const session = (host as unknown as { session: PlaySession }).session;
    for (const pick of [/^Wait/, /^Take /, /^Wait/]) {
      const c = PlayerView.choices(session.campaign).find(x => pick.test(x.choice.name))!;
      await host.handle({ kind: 'perform', command: c.choice.id }) as Frame;
    }
    return session;
  }
}

describe('a game in a generated world', () => {
  it('is replayed in the terminal from its transcript, to the same game', async () => {
    const session = await Played.game(), transcript = session.transcript;
    expect(transcript.drawn).toEqual({ party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }],
      origin: 'wanderer' });
    expect(transcript.steps.length).toBe(3);
    const dir = mkdtempSync(join(tmpdir(), 'kyrie-replay-')), file = join(dir, 'a1.transcript.json');
    try {
      writeFileSync(file, JSON.stringify(transcript));
      const replayed = spawnSync(resolve(import.meta.dir, '../bin/kyrie'), ['replay', file],
        { encoding: 'utf8', maxBuffer: 1 << 28 });
      expect([replayed.status, replayed.stderr]).toEqual([0, '']);
      // The same game, drawn where the terminal stands: only the world's path is the terminal's own.
      const game = JSON.parse(replayed.stdout) as { transcript: { scenario: string } };
      expect(game.transcript.scenario).toBe(resolve(transcript.scenario));
      game.transcript.scenario = transcript.scenario;
      expect(JSON.stringify(game)).toBe(session.canonical());
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 180000);
});
