import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';
import { FightStage } from '../../web/reader/stage/fight-stage';
import { Told } from '../../web/reader/stage/told';

// The page beside the engine's two rules of the blind playtest (foregone-fight, dice-behind): a fight the page never
// had to ask about is told by its end, a sentence of who fell, what it cost and the way on, with no hand, no cards and
// no round (BP-01); and an act's outcome is told in prose, its dice behind a deliberate look (BP-03).
const rat = (n: string, hp: number) => ({ id: n, name: `The ${n} rat`, line: 'rat', hp, maxHp: 3, mana: 0, maxMana: 0 });
const onward: Choice = { id: 'onward', label: 'Go on', tone: 'way', command: 'onward' };
const fight = (first: boolean) => {
  const combat = { turn: 3, actor: 'wat', actorName: 'Wat', ours: false, outcome: 'won', round: 2, order: [],
    foes: [rat('first', 0), rat('second', 0)], allies: [{ id: 'wat', name: 'Wat', line: 'human warrior', hp: 14,
      maxHp: 14, mana: 0, maxMana: 0 }], abilities: [], log: [], exchanges: [{ n: 0, text: 'Wat strikes the first rat.',
      detail: 'd20 15 against 11', round: 1 }], after: ['The rat-runs are quiet.'] };
  const app = { state: { frame: { combat, screen: { place: { name: 'the rat-runs' }, objectives: [], aims: [] },
    opening: [] }, fight: { seen: 0, hp: {}, first }, open: [], keyed: false, cursor: 0 },
    menu: { choices: [onward], sections: [{ id: 'onward', title: '', tone: 'way', choices: [onward] }] }, props: { query: new URLSearchParams() }, choose: () => undefined } as unknown as ReaderApp;
  return renderToStaticMarkup(createElement(FightStage.View, { app }));
};

describe('a foregone fight on the page', () => {
  it('is told by its end: who fell, what it gained and cost, and the way on, not a fight page', () => {
    const html = fight(true);
    expect(html).toContain('data-region="fight-told"');
    expect(html).toMatch(/The first rat and the second rat are down\./);
    expect(html).toContain('The rat-runs are quiet.');
    expect(html).toContain('data-act="onward"');
    expect(html).not.toMatch(/class="hand|class="sides|Round 2/);
    // The blows and their dice are behind a look.
    expect(html).not.toContain('d20 15');
  });
  it('is a fight page where the player has chosen in it', () => {
    expect(fight(false)).not.toContain('data-region="fight-told"');
  });
});

describe('an act\'s outcome on the page', () => {
  const exchange = { lines: [{ text: 'The keeper looks past you. The boy is gone.', kind: 'telling' },
    { text: 'Haze makes the deception check (d20 14 + 2 = 16 against 11).', kind: 'roll' }], notes: [], tone: 'act' };
  it('is told in prose, the dice behind a look', () => {
    const html = renderToStaticMarkup(createElement(Told.Happened, { exchange } as never));
    expect(html).toContain('The boy is gone');
    expect(html).not.toContain('d20');
    expect(html).toContain('data-action="dice"');
  });
});
