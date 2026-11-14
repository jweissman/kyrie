import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { CombatModel } from '../../src/ui/combat-model';
import { ChoiceList } from '../../src/ui/choice-list';
import type { Fighter } from '../../src/model';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FightMoves } from '../../web/reader/stage/fight-moves';
import type { ReaderApp } from '../../web/reader/reader-app';

// What cannot be done now is in the hand, saying why (the completion plan, §2.4: a technique on cooldown had simply
// vanished from the fight's acts, and nothing said it would come back). A warrior against a rat, his cleave cooling.
const fight = (cooling: number) => {
  type Cooling = Fighter & { cooldowns: Record<string, number> };
  const warrior = new Content('w').character('warrior', 'w', 'fighters', 'human') as Cooling;
  const rat = new Content('rat-1').creature('rat', 'r', 'goblins', 1);
  const cleave = warrior.abilities.find(a => a === 'cleave');
  if (cleave && cooling) { warrior.cooldowns = { ...warrior.cooldowns, cleave: cooling }; }
  const battle = new Battle({ id: 'bout', combatants: [warrior, rat], abilities: Content.abilities }, 'unusable');
  while (battle.state.actor !== 'w' && !battle.state.outcome) { battle.step(battle.legalCommands()[0]!); }
  return CombatModel.build(battle);
};

describe('a fight\'s unavailable acts', () => {
  it('are drawn in their place, disabled, saying why', () => {
    const c = fight(2), cleave = c.unavailable?.find(u => u.id === 'cleave');
    expect(cleave?.why).toMatch(/^again in \d turns?$/);
    const hand = ChoiceList.combat(c).flatMap(s => s.choices);
    expect(hand.find(x => x.id === 'unusable:cleave')?.disabled).toMatch(/^again in/);
  });
  it('are none when everything known can be used', () => {
    expect(fight(0).unavailable?.find(u => u.id === 'cleave')).toBeUndefined();
  });
  // In the page, what cannot be done says why in its own row, and touching it aims at no one: an unusable move had
  // opened "choose whom, on the field" with nothing to choose and nothing said (the second blind playtest, BL-02:
  // Ander's Charm Person, its one slot spent).
  it('say why in the page, and are never aimed', () => {
    const sections = ChoiceList.combat(fight(2)), app = { menu: { sections, choices: ChoiceList.all(sections) },
      state: { keyed: false, cursor: 0, open: [] }, choose: () => undefined } as unknown as ReaderApp;
    const html = renderToStaticMarkup(createElement(FightMoves.View, { app, aim: () => undefined, panel: 'abilities',
      open: () => undefined }));
    expect(html).toMatch(/data-choice="unusable:cleave" data-disabled="true"[^>]*>[\s\S]*?again in \d turns?</);
    const cleave = sections.flatMap(x => x.choices).find(x => x.id === 'unusable:cleave')!;
    const aimed: unknown[] = [];
    FightMoves.take(app, cleave, a => { aimed.push(a); }, () => undefined);
    expect(aimed).toEqual([]);
  });
});
