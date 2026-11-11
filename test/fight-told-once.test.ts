import { describe, expect, it } from 'bun:test';
import { CombatTelling } from '../src/ui/combat-telling';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { Narrator } from '../src/presentation/narrator';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ScreenModel } from '../src/ui/screen-model';
import type { BattleState, CombatEvent } from '../src/model';

// A fight's end is told once (the owner, 11 November late: the rats' last blow was told, then told again with its
// rolls, its rat falling and the fight won; then "The fight is over"; and back at the place, "You attack the rats",
// "The fight is won" and "The rats lie dead"). How a blow fell is its dice, not the blow again; the end of the fight
// is a sentence the scene after it knows to leave to the fight's own page (see Told.Happened).
describe('a fight ended', () => {
  const state = { combatants: [{ id: 'h', name: 'Hamo' }, { id: 'r', name: 'the third rat' }] } as unknown as BattleState;
  const last: CombatEvent[] = [{ type: 'action', turn: 5, command: { actor: 'h', ability: 'melee', target: 'r' } },
    { type: 'attack', turn: 5, actor: 'h', target: 'r', die: 17, need: 9, toHit: 2, armorClass: 7, weapon: 'battleaxe',
      success: true, critical: false },
    { type: 'damage', turn: 5, actor: 'h', target: 'r', rolled: 8, amount: 1, hp: 0, damageType: 'slashing' },
    { type: 'death', turn: 5, actor: 'r' } as unknown as CombatEvent,
    { type: 'end', turn: 5, outcome: 'fighters', reason: 'elimination' } as unknown as CombatEvent];
  it('tells the last blow once, and how it fell by its dice alone', () => {
    const [told] = CombatTelling.exchanges(last, state);
    expect(told!.text).toContain('The third rat falls.');
    expect(told!.detail).toContain('rolled 17, needed 9');
    expect(told!.detail).not.toMatch(/falls|fight is won/);
  });
  // The fight's end is known as the fight's by what the game says happened (its end event), not by its sentence: the
  // scene after a fight leaves every line of that kind to the fight's own page.
  it('marks how a fight ended as the fight\'s', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, warren = 'region__s1_u_warren';
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', warren) }]));
    const before = PlayerView.observe(c), event = await s.leg('attack(region__s1_u_rats)');
    const leaf = Narrator.leaf(c, ScreenModel.build(c), { event, feedback: ActionFeedbackView.read(c, event, before),
      said: 'Attack the rats', moved: false });
    const won = leaf.exchange!.lines.find(l => l.text === 'The fight is won.');
    expect(leaf.exchange!.tone).toBe('fight');
    expect(won?.kind).toBe('fight');
  }, 120000);
});
