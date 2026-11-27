#!/usr/bin/env bun
// A fight's responsiveness by layer, headless first (the combat experiment's part (a), the acceptance ladder's cheapest
// rung): a1's first fight, the rats under the corn-store, played through the engine host as the page plays it (its
// requests, its posted frames). Each blow of the company's (a strike at a foe, chosen as the page sends it,
// "ability>target") timed from the request to the next frame posted where the company acts again or the fight is over:
// the engine's decision (the blow, the foes' turns between) and the frame built for it (EngineHost.frame, timed apart
// by building it again). Printed: p50, p95 and the worst of each, against the browser's 300 ms p95 for an act settled.
//   bun scripts/performance/fight-engine.ts [--fights 3]
import { EngineHost } from '../../web/engine/engine-host';
import { PlayerView } from '../../src/presentation/player-view';
import { GeneratedWorld } from '../../test/support/generated';
import type { Frame } from '../../src/creation/protocol';
import type { Battle } from '../../src/battle';

type Turned = { battle: Battle };
interface Blow { ms: number; frame: number; last: boolean }
export class FightEngine {
  static pct(xs: number[], p: number): number {
    const s = [...xs].sort((a, b) => a - b);
    return s.length ? s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]! : NaN;
  }
  static async fight(seed: number): Promise<Blow[]> {
    let posted: { frame: Frame; at: number } | undefined;
    const host = new EngineHost(m => { if (m.kind === 'frame') { posted = { frame: m.frame, at: performance.now() }; } });
    await host.handle({ kind: 'begin', campaign: 'world', seed: 'a1', origin: 'wanderer', opening: 'none',
      party: [{ name: 'Hamo', raceId: 'human', classId: seed % 2 ? 'mage' : 'thief' }] } as never);
    const session = host.played!;
    GeneratedWorld.put(session, 's1_u_warren');
    const attack = PlayerView.choices(session.campaign).find(x => x.choice.id === 'attack(region__s1_u_rats)');
    if (!attack) { throw new Error(`no attack on the rats at seed ${seed}`); }
    posted = undefined;
    const done = host.handle({ kind: 'perform', command: attack.choice.id });
    let over = false;
    void done.then(() => { over = true; });
    const blows: Blow[] = [];
    for (let i = 0; i < 40 && !over; i++) {
      const at = await this.ours(host, () => posted, () => over);
      if (!at) { break; }
      const turn = (host as unknown as { turn?: Turned }).turn!, b = turn.battle, legal = b.legalCommands();
      const blow = legal.find(c => c.actor === b.state.actor && c.target && /strike|attack/i.test(c.ability))
        ?? legal.find(c => c.actor === b.state.actor && c.target);
      if (!blow) { break; }
      posted = undefined;
      const t = performance.now();
      await host.handle({ kind: 'fight', choice: `${blow.ability}>${blow.target}` });
      const next = await this.ours(host, () => posted, () => over);
      if (!next) { await done.catch(() => undefined); }
      const ms = (next?.at ?? performance.now()) - t;
      const f0 = performance.now();
      (host as unknown as { frame(): Frame }).frame();
      blows.push({ ms, frame: performance.now() - f0, last: !next });
    }
    await done.catch(() => undefined);
    return blows;
  }
  // The next frame posted where the company acts (or none, the fight over).
  private static async ours(host: EngineHost, last: () => { frame: Frame; at: number } | undefined,
    over: () => boolean): Promise<{ frame: Frame; at: number } | undefined> {
    for (let i = 0; i < 20000; i++) {
      const p = last();
      if (p && (host as unknown as { turn?: Turned }).turn) { return p; }
      if (over()) { return undefined; }
      await new Promise(r => setTimeout(r, 0));
    }
    throw new Error('no frame came');
  }
  static async main(args: string[]): Promise<number> {
    const at = args.indexOf('--fights'), fights = at >= 0 ? Number(args[at + 1]) : 2, blows: Blow[] = [];
    for (let i = 0; i < fights; i++) {
      const b = await this.fight(i);
      console.log(`fight ${i + 1}: ${b.length} blows, ${b.map(x => Math.round(x.ms)).join(' ')} ms`);
      blows.push(...b);
    }
    const mid = blows.filter(b => !b.last).map(b => b.ms), lasts = blows.filter(b => b.last).map(b => b.ms);
    console.log(`  within the fight: ${mid.length} blows p50 ${Math.round(this.pct(mid, 0.5))} ms, p95 ${Math.round(this.pct(mid, 0.95))} ms;`
      + ` the last blow to the place again: ${lasts.length}, p50 ${Math.round(this.pct(lasts, 0.5))} ms, worst ${Math.round(Math.max(...lasts))} ms`);
    const ms = blows.map(b => b.ms), frame = blows.map(b => b.frame);
    console.log(`FIGHT-ENGINE ${blows.length} blows: request → next frame of the company's p50 ${Math.round(this.pct(ms, 0.5))} ms,`
      + ` p95 ${Math.round(this.pct(ms, 0.95))} ms, worst ${Math.round(Math.max(...ms))} ms; the frame built alone p50`
      + ` ${Math.round(this.pct(frame, 0.5))} ms, p95 ${Math.round(this.pct(frame, 0.95))} ms (the browser's target p95 300 ms)`);
    return 0;
  }
}

if (import.meta.main) { process.exit(await FightEngine.main(process.argv.slice(2))); }
