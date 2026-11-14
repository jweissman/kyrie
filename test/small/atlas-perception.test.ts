import { describe, expect, it, test } from 'bun:test';
import { Atlas } from '../support/atlas';
import { Indicator } from '../../src/presentation/indicator';
import { Signs } from '../../src/presentation/signs';
import { TerminalSigns } from '../../src/cli/terminal-signs';
import { TerminalColour } from '../../src/cli/terminal-colour';

// How the atlas tells an opportunity by where it lies and who looks (the owner, 15 November: atlas perception,
// characterized; the whole matrix and its findings in doc/architecture/mission-21/atlas-perception.md). A few cells as
// regressions, the page's reading and the terminal's agreeing; and, as failing cases, what the engine cannot yet say,
// each naming the generic capability it wants. A failing case that starts to pass is a capability come: move it up.
describe('the atlas, perceived', () => {
  it('tells a companion clearly here, vaguely a step off, and not two off, unless the company is Gregarious', async () => {
    const read = async (at: 'green' | 'lane' | 'yard', gregarious = false) => {
      const t = await Atlas.start('companion', at, { gregarious });
      return [Atlas.page(t, 'companionship', at), Atlas.terminal(t, 'companionship', at)];
    };
    expect([await read('green'), await read('lane'), await read('yard')])
      .toEqual([['clear', 'clear'], ['vague', 'vague'], ['absent', 'absent']]);
    expect(await read('yard', true)).toEqual(['vague', 'vague']);
  });
  // A Gregarious company had perceived someone three places off through the shed's padlocked door: perception is not
  // carried past a way the company could not take, a step off or three (Perception, through PassageModel).
  it('perceives nothing past a shut door, however far the reach', async () => {
    const t = await Atlas.start('companion', 'shed', { gregarious: true });
    expect(t.glance.sensed ?? []).toEqual([]);
  });
  // A way drawn silver had lost the companion perceived along it in both clients: the pip was the way's own, and the
  // words were said only on a way of no colour. Now its icon, said by how far off.
  it('keeps what is perceived along a way that has a colour of its own, as an icon said by how far', async () => {
    const t = await Atlas.start('companion', 'yard', { gregarious: true });
    const lane = new TerminalSigns(t.screen, t.glance).on('go(t__g_l,t__lane)');
    const ind = TerminalColour.indicated({ aspects: ['exploration'], ...lane });
    expect([ind.tone, ind.icons.map(i => i.said)]).toEqual(['silver', [Signs.sensed('companionship', 2)]]);
    expect(Signs.sensed('companionship', 2)).toBe('perhaps a companion, farther on');
    expect(Indicator.faint({ sensed: { aspect: 'payoff', far: 1 } })).toBe(true);
  });
  it('lights the aim\'s act gold, and the one way to it, and the world changing puts a facet out', async () => {
    const here = await Atlas.start('payoff', 'green', { aim: true }), step = await Atlas.start('payoff', 'lane',
      { aim: true });
    expect([Atlas.page(here, 'undertaking', 'green'), Atlas.page(step, 'undertaking', 'lane')]).toEqual(['clear', 'vague']);
    // The aim's box is gold and to be gained: one colour, gold, and its icon (TP-02).
    const box = here.glance.acts.find(a => a.continues)!;
    expect(Indicator.of({ aspects: box.aspects }).icons.map(i => i.said)).toEqual(['to gain']);
    const rats = await Atlas.start('danger', 'green');
    await rats.play('Attack');
    expect(Atlas.page(rats.look(), 'danger', 'green')).toBe('absent');
  });

  // What cannot yet be said. Each names the generic capability it wants; none is special-cased.
  // Perception.reach is a table in code with one row (companionship); no calling, skill or Kyr declaration extends the
  // reach of any other facet. Wanted: an authorable perception reach per facet and capability.
  test.failing('a ranger perceives danger a step off (wanted: authorable perception reach per facet)', async () => {
    const t = await Atlas.start('danger', 'lane', { calling: 'ranger' });
    expect(Atlas.page(t, 'danger', 'lane')).toBe('vague');
  });
  // A sign the company's skill lets it see (capable(party, woodcraft)) is perceived and told, and the atlas says
  // nothing of it: only a subject's sign is a reason. Wanted: a place's own sign as an opportunity's facet.
  test.failing('a sign seen by skill shows on the atlas (wanted: a place\'s sign as a facet)', async () => {
    const t = await Atlas.start('skilled-sign', 'green', { calling: 'ranger' });
    expect(t.screen.observed.map(o => o.id)).toContain('t__tracks');
    expect(Atlas.page(t, 'knowledge', 'green')).not.toBe('absent');
  });
  // The aim followed lights only the way to a place a step off; two steps off, nothing does. Wanted: the aim's route
  // carried along the known ways of a place, as the journeys over the country are.
  test.failing('gold two steps from the aim (wanted: the aim\'s route along known ways)', async () => {
    const t = await Atlas.start('payoff', 'yard', { aim: true });
    expect(Atlas.page(t, 'undertaking', 'yard')).toBe('vague');
  });
});
