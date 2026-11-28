import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { EngineHost } from '../../../web/engine/engine-host';
import { OracleMark } from '../../../web/reader/oracle-mark';
import { Oracle, type OracleReport } from '../../../src/presentation/oracle';
import { Terminal } from '../../../src/cli/terminal';
import { PlayerFrame } from '../../../src/presentation/player-frame';
import type { Frame } from '../../../src/creation/protocol';
import type { PlaySession } from '../../../src/session/play-session';

// The oracle (OR-1151, the owner, 26 November): what a developer needs to reproduce what is seen, the engine's to say
// ({ kind: 'about' }), drawn by the page in a dev build or under ?oracle alone, and printed by the terminal's `oracle`.
describe('Interface › The oracle', () => {
  it('is the engine\'s report: the seed, the commit, the place and the last act\'s command and timings', async () => {
    const t = await Tiny.start(`
      Place lane "the lane" is room at 0, 0 outdoors.
      Place hall "the hall" is room at 1, 0.
      Passage door "the door" is door between lane and hall taking 2 minutes.
      Company party "You" of 1 at lane.`, { horizon: [] });
    // The game the host plays, as begin would have left it (a world's begin is seconds; a fragment's is not).
    const host = new EngineHost(() => undefined);
    (host as unknown as { session: PlaySession }).session = t.session;
    const command = PlayerFrame.of(t.campaign).rows.find(r => /hall/.test(r.choice.name))!.choice.id;
    const frame = await host.handle({ kind: 'perform', command }) as Frame;
    const report = await host.handle({ kind: 'about' }) as OracleReport;
    expect(report.world?.seed).toBe(t.session.seed);
    expect(report.build.commit).toBeTruthy();
    expect(report.where?.place).toBe(frame.screen.place.id);
    expect(report.where?.place).toBe('t__hall');
    expect(report.last?.command).toBe(command);
    expect(report.last?.timing?.engine).toBeGreaterThanOrEqual(0);
    const text = Oracle.text(report, { viewport: '390×844', agent: 'test' });
    for (const said of [`seed ${t.session.seed}`, `commit ${report.build.commit}`, '(t__hall)', command, 'viewport 390×844']) {
      expect(text).toContain(said);
    }
    // The terminal's `oracle` is the same report.
    expect(Terminal.oracle(t.session, {})).toContain(`seed ${t.session.seed}`);
  });
  it('is offered by the page only in a dev build, on this machine, or under ?oracle', () => {
    const none = new URLSearchParams(''), asked = new URLSearchParams('?oracle');
    const played = { host: 'jweissman.github.io', dev: false, automated: false };
    expect(OracleMark.shown(none, played)).toBe(false);
    expect(OracleMark.shown(asked, played)).toBe(true);
    expect(OracleMark.shown(none, { ...played, dev: true })).toBe(true);
    expect(OracleMark.shown(none, { ...played, host: 'localhost' })).toBe(true);
    // Automation sees the page as a player does, unless it asks.
    expect(OracleMark.shown(none, { ...played, host: 'localhost', automated: true })).toBe(false);
    expect(OracleMark.shown(asked, { ...played, automated: true })).toBe(true);
  });
});
