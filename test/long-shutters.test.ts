import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the linked shutters', () => {
  it('keeps their coupled positions and opens a real route around the dragon', async () => {
    const j = await Journey.start(campaign, 'shutters');
    Placed.at(j, 'tallow__lc_ring');
    await j.play('Examine the balance beside the arch', 'Place the one-dot weight',
      'Place the three-dot weight', 'Place the five-dot weight',
      'Examine the pool beneath the balanced weights', 'To the reflected landing',
      'Lift the hook out of the standing water', 'To the room of panes', 'Examine the linked shutters');
    expect(j.seen()).toContain('left shutter is at 0, the middle at 1, and the right at 2');
    const start = j.watch();
    await j.play('Turn the middle shutter handle');
    expect(j.measure('lcShutterLeft', 'party')).toBe(0);
    expect(j.measure('lcShutterMiddle', 'party')).toBe(2);
    expect(j.measure('lcShutterRight', 'party')).toBe(0);
    expect(j.holds('lcShuttersAligned', 'party')).toBe(false);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Turn the middle shutter handle', 'Turn the middle shutter handle',
      'Turn the left shutter handle', 'Turn the left shutter handle', 'Turn the right shutter handle');
    expect(resumed.watch()).toBe(start + 6);
    expect(resumed.measure('lcShutterLeft', 'party')).toBe(0);
    expect(resumed.measure('lcShutterMiddle', 'party')).toBe(0);
    expect(resumed.measure('lcShutterRight', 'party')).toBe(0);
    expect(resumed.holds('lcShuttersAligned', 'party')).toBe(true);
    expect(resumed.holds('able', 'lc_young_dragon')).toBe(true);
    expect(resumed.holds('tolerates', 'lc_young_dragon', 'party')).toBe(false);
    await resumed.play('To the field of the returning');
    expect(resumed.at('party')).toBe('tallow__lc_battlefield');
    expect(resumed.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
    await resumed.play('To the room of panes');
    expect(resumed.at('party')).toBe('tallow__lc_mirror_array');
  }, 10000);
});
