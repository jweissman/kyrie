import { expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { CombatPresenter } from '../src/ui/combat-presenter';
import type { Battle } from '../src/battle';

class Rout {
  // The company only guards; the hound tries to flee whenever it can.
  static async play(battle: Battle) {
    while (!battle.state.outcome) {
      const legal = battle.legalCommands(), actor = battle.state.combatants.find(f => f.id === battle.state.actor)!;
      const wanted = actor.team === 'goblins' ? 'flee' : 'defend';
      battle.step(legal.find(c => c.ability === wanted) ?? legal.find(c => c.ability === 'flee') ?? legal[0]!);
    }
    return Promise.resolve();
  }
}

it('an opponent that flees is reported as fleeing, is routed, and no longer holds its passage', async () => {
  const s = await PlaySession.start('data/campaigns/serewater-march.campaign.json', 'rout', NodeBundleSource.shared);
  for (const c of ['go(march__causeway_path,march__causeway)', 'change_thing(hill__boar_pass)',
    'go(hill__low_path,hill__drain_mouth)', 'go(hill__culvert,hill__workshop)', 'go(hill__gallery_steps,hill__gallery)']) {
    await s.perform(c);
  }
  const blocked = () => s.campaign.world.test(ModuleWriter.call('obstructed', 'hill__hoist_passage'));
  expect(blocked()).toBe(true);
  const attack = PlayerView.resolve(s.campaign, 'attack(hill__hound)');
  const event = await s.campaign.executeAsync(attack, battle => Rout.play(battle));
  const end = event.combat.find(e => e.type === 'end')!;
  expect(end).toMatchObject({ outcome: 'escaped', fled: { team: 'goblins' } });
  expect(CombatPresenter.format(end, { combatants: [], turn: 0, actor: '', outcome: null })).toMatch(/flees the fight/);
  expect(event.result).toBe('success');
  expect(s.campaign.world.test(ModuleWriter.call('routed', 'hill__hound'))).toBe(true);
  expect(blocked()).toBe(false);
  expect(PlayerView.choices(s.campaign).map(c => c.choice.id)).toContain('go(hill__hoist_passage,hill__hoist)');
  const view = PlayerView.observe(s.campaign);
  expect(JSON.stringify(view)).not.toContain('stands across the hoist passage');
  expect(JSON.stringify(view)).toContain('routed');
}, 60000);
