import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { TerminalWalk } from '../../src/cli/terminal-walk';
import { WalkStyle } from '../../src/cli/walk-style';

// The terminal, walked as a player would through a yard and a kitchen, staying in the kitchen a while: what it tells
// on arriving is held to the scene budget, and what has not changed is not said again: the place, the day and the
// part of it, the place's own telling, the commands (the owner, 14 November: TM-01, TM-02). The real output, by
// bin/kyrie's own terminal in the process.
const farm = `
  Place yard "the yard" is room at 0, 0 outdoors.
  Place kitchen "the kitchen" is room at 1, 0.
  Passage door "the back door" is door between yard and kitchen.
  Company party "You" of 1 at yard.
  Person wat "Wat" at kitchen { Role "your brother". Ancestry human. Peaceable. Pronouns he. }
  Observe y at yard when true "The yard, swept. A dog asleep by the trough.".
  Observe k at kitchen when true "The kitchen, warm, and smelling of bread. Wet wool steams by the fire.".
  Topic father with wat "Ask Wat about Father" when true once { Says "'He took the cart to Brough,' says Wat.". }
  Goal false.`;

describe('the terminal, walked', () => {
  it('tells an arrival within the budget, and after an act what came of it, not the place again', async () => {
    const t = await Tiny.start(farm);
    const walked = await TerminalWalk.run(t.session, WalkStyle.scripted(['1', 'wait', 'wait_hour', 'wait_hour',
      'wait_hour', 'wait_hour', 'Ask Wat about Father', 'look', 'Take the back door to the yard']));
    const text = walked.transcript.join('\n'), budget = TerminalWalk.budget(walked);
    expect(budget.scenes).toBe(3);
    expect(budget.mean).toBeLessThanOrEqual(3);
    // The kitchen's own telling: said on arriving and on the look, and after none of the acts between.
    expect(text.match(/smelling of bread/g)).toHaveLength(2);
    expect(walked.scenes.filter(s => s.turned === 'act').flatMap(s => s.lines).join(' ')).not.toMatch(/smelling/);
    // The day once, then the part of it as it turns (four hours from eight in the morning: the afternoon).
    expect(text.match(/Day 1, morning/g)).toHaveLength(1);
    expect(text).toMatch(/^Day 1, afternoon$/m);
    // No heading over the choices, and the commands only when asked: a word of where they are, once.
    expect([text.match(/^\(\? for commands\)$/gm)?.length, /^(Foreground|Said to them|Commands:)/m.test(text)])
      .toEqual([1, false]);
    expect(text).toContain('He took the cart to Brough');
  });
  // A lens changes what is led with, by kind, and takes no time: in the kitchen, people leads with Wat, time with the
  // waiting acts, and here with the scene's own again (CN-01, CN-05; TM-04).
  it('leads through a lens without time passing', async () => {
    const t = await Tiny.start(farm), walked = await TerminalWalk.run(t.session,
      WalkStyle.scripted(['1', 'people', 'time', 'here']));
    const text = walked.transcript.join('\n');
    const after = (cmd: string) => text.split(`> ${cmd}`)[1]!.split('\n> ')[0]!;
    expect(after('people')).toMatch(/^\(people[^)]*\)$/m);
    expect(after('people')).toMatch(/Wat/);
    expect(after('time')).toMatch(/^\(time[^)]*\)$/m);
    expect(after('time')).toMatch(/Wait/);
    expect(after('here')).not.toMatch(/^\((people|time)/m);
    const walkedIn = await Tiny.start(farm);
    await TerminalWalk.run(walkedIn.session, WalkStyle.scripted(['1']));
    expect(t.screen.elapsed).toBe(walkedIn.screen.elapsed);
  });
});
