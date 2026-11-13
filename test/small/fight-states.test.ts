import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { Narrator } from '../../src/presentation/narrator';
import { ScreenModel } from '../../src/ui/screen-model';
import { CombatModel } from '../../src/ui/combat-model';
import type { CombatScreen } from '../../src/ui/screen-types';

// A fight offers every state the company can be in, and each is told (the completion plan, §2.4: combat that works
// and reads): the odds of getting away while it lasts, how it stands each turn, what cannot be done and why, a foe
// falling, the end; won, the place again as it was, the danger gone; run from, back the way the company came, told
// that it is clear. Rats in a den off a lane: three weak ones to beat, three strong ones to run from.
const den = (level: number) => `
  Place lane "the lane" is room at 0, 0 outdoors.
  Place den "the den" is room at 1, 0 outdoors.
  Passage track "the track" is path between lane and den.
  Company party "You" of 1 at lane.
  Person rats "the rats" at den { Role "rats, fat and bold". Species rat. Numbers 3. Level ${level}. Lair den. }
  Goal false.`;
type Step = { ability: string };
class Fought {
  static async run(level: number, choose: (legal: Step[]) => Step) {
    const t = await Tiny.start(den(level)), c = t.campaign, screens: CombatScreen[] = [];
    await t.play('the den');
    const before = PlayerView.observe(c);
    const event = await t.session.leg('attack(t__rats)', async (b: unknown) => {
      const battle = b as Parameters<typeof CombatModel.build>[0];
      screens.push(CombatModel.build(battle));
      return choose(battle.legalCommands() as unknown as Step[]) as never;
    });
    const feedback = ActionFeedbackView.read(c, event, before), screen = ScreenModel.build(c);
    const leaf = Narrator.leaf(c, screen, { event, feedback, said: 'attack', moved: before.location?.id !== t.where() });
    return { t, screens, feedback, leaf, told: (leaf.exchange?.lines ?? []).map(l => l.text) };
  }
}

describe('a fight\'s states', () => {
  it('while it lasts: the odds of getting away, how it stands, and what cannot be done and why', async () => {
    const { screens } = await Fought.run(1, legal => legal.find(x => x.ability === 'melee') ?? legal[0]!);
    const first = screens[0]!;
    expect(first.abilities.find(a => a.id === 'flee')?.odds).toBeGreaterThan(0);
    expect(first.standing?.text).toBeTruthy();
    expect((first.unavailable ?? []).every(u => u.why.length > 0)).toBe(true);
  });
  it('won: a foe falling and the end told, and the place again with the danger gone', async () => {
    const { t, feedback, leaf, told } = await Fought.run(1, legal => legal.find(x => x.ability === 'melee') ?? legal[0]!);
    expect(told.some(l => /falls\.$/.test(l))).toBe(true);
    expect(feedback.result).toBe('The fight is won.');
    expect([t.where(), leaf.glance?.arrival]).toEqual(['t__den', 'stay']);
    expect(leaf.glance?.acts.some(a => a.aspects.includes('danger'))).toBe(false);
  });
  it('run from: back the way the company came, told that it is clear', async () => {
    const { t, feedback, leaf } = await Fought.run(6, legal => legal.find(x => x.ability === 'flee') ?? legal[0]!);
    expect(feedback.result).toBe('You are clear of the fight.');
    expect([t.where(), leaf.glance?.arrival]).toEqual(['t__lane', 'return']);
  });
});
