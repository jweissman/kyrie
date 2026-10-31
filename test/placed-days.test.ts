import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Frontier } from '../src/world/frontier';
import type { Predicate } from '../src/lang/module';
import { GeneratedWorld } from './support/generated';

// A country reached after the game began counts its days from a morning, as its author did (ClockShift). Merrowdale,
// reached at night in the Bushweald play, told its storm's end ("The rain stops before dawn") at nine in the evening.
class Days {
  // The watch a rule waits for the clock to reach.
  static due(p: Predicate): number | undefined {
    if (p.kind === 'and' || p.kind === 'or') { return this.due(p.left) ?? this.due(p.right); }
    if (p.kind === 'compare' && p.left.kind === 'call' && p.left.name === 'watch' && p.right.kind === 'number') {
      return p.right.value;
    }
    return undefined;
  }
}

describe('a country reached partway through a day', () => {
  it('counts its days from the next morning, so its storm comes at the hour its author meant', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), c = s.campaign;
    // Merrowdale a province of the country (Gate B): reached at its way in.
    await GeneratedWorld.travel(s, 'gate_longman');
    const reached = c.state.elapsed;
    await new Frontier('thorn', NodeBundleSource.shared).expand(c);
    const storm = Days.due(c.module.rules!.find(r => r.id.endsWith('__storm_comes'))!.when)!;
    // Its third day at noon, as written (312 watches from a morning), counted from the first morning after it was
    // reached: never sooner, and not a day later.
    expect([(storm - 312) % 144, storm - 312 >= reached, storm - 312 - reached < 144]).toEqual([0, true, true]);
  }, 120000);
});
