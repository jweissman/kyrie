import { describe, expect, it } from 'bun:test';
import { Installed } from '../../../src/ports/installed';
import { Outcome } from '../../../src/presentation/outcome';
import { Embalmers } from '../../support/embalmers';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The spell foreseen (OR-1101; the research of
// 26 November, slice 3): a spell's row is marked for what it would do to the world, by inference, as any act's is by
// its success. The rules domain lowers Resolve invoke's effects to Kyr's changes before the act (the effects port on
// the campaign's installed context: src/ports/effects.ts), and the forecast (Outcome) reads them: Fire Bolt cast at the
// embalmers' linen would put it to the flame, whose light shows what the king cannot bear, so the linen is led with
// the cast, to learn, as it is led with a torch's "Hold a flame to" where there is a flame; with no lowering
// installed it is not. The mage sees by a conjured light, which is no flame.
describe('World › The spell foreseen', () => {
  it('marks Fire Bolt at the linen to learn by what it would burn, and it teaches what it showed', async () => {
    const at = await Embalmers.enter('human/mage/Wenna', /cast Light on Wenna$/i, j => Embalmers.firebolt(j));
    const cast = /^Have Wenna cast Firebolt at the embalmers' linen/, c = at.campaign;
    expect(Embalmers.rows(at.said).filter(x => cast.test(x.label)).flatMap(x => x.aspects)).toContain('knowledge');
    expect(Embalmers.rows(at.said).some(x => /^Hold a flame/.test(x.label))).toBe(false);
    // The same act, foreseen in an installation that lowers nothing, teaches nothing.
    const domain = Installed.current(), carrying = Outcome.carrying;
    const act = c.available().find(o => o.resolve?.name === 'invoke' && o.bindings?.target === at.linen)!;
    Outcome.carrying = false;
    try {
      expect(Outcome.taught(c.module, c.world, act, 'party').length).toBeGreaterThan(0);
      const bare = { ...domain, effects: { element: domain.effects!.element } };
      expect(Installed.within(bare, () => Outcome.taught(c.module, c.world, act, 'party'))).toEqual([]);
    } finally { Outcome.carrying = carrying; }
    const bane = c.module.entities.find(e => e.type === 'fact' && /_ud_bane$/.test(e.id))!.id;
    expect(c.world.test({ kind: 'call', name: 'knows', args: ['party', bane] })).toBe(false);
    await Embalmers.act(at, cast);
    expect(c.world.test({ kind: 'call', name: 'knows', args: ['party', bane] })).toBe(true);
    expect(at.said.scene.lines.join(' ')).toMatch(/sealing the noon sun into jars/);
  }, 60000);
});
