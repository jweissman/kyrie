import { describe, expect, it } from 'bun:test';
// The language loaded whole before the page's modules (OR-542: Kyr's entry loaded first is half-made).
import '../support/tiny';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FightMoves } from '../../web/reader/stage/fight-moves';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';

// Whom to strike, asked in place of the hand's rows (the owner's playtest, 26 November, OR-1296: choosing a target had
// extended a copy of the menu beneath it): while aiming, the targets are the rows and the hand's are gone; put aside
// or chosen, the hand's rows come back.
const rat = (n: string): Choice => ({ id: `strike>${n}`, label: `Strike the ${n} rat`, tone: 'creature',
  command: `strike(${n})`, note: 'an even chance' });
const attack: Choice = { id: 'strike', label: 'Strike', tone: 'creature', children: [rat('first'), rat('second')] };
const app = { menu: { sections: [{ id: 'strike', title: 'Strike', tone: 'creature', glyph: '', choices: [attack] }],
  choices: [attack] }, state: {}, props: {}, choose: () => undefined } as unknown as ReaderApp;
const drawn = (aiming?: Parameters<typeof FightMoves.View>[0]['aiming']) => renderToStaticMarkup(createElement(
  FightMoves.View, { app, aim: () => undefined, open: () => undefined, ...aiming ? { aiming } : {} }));
describe('whom to strike', () => {
  it('is asked in place of the hand\'s rows, which come back without it', () => {
    const asked = drawn({ choice: attack, targets: new Map(attack.children!.map(c => [c.id, c])) });
    expect(asked).toContain('data-action="whom"');
    expect(asked).not.toContain('aria-label="What you can do"');
    expect(asked.match(/data-action="whom"/g)).toHaveLength(2);
    const back = drawn();
    expect(back).toContain('aria-label="What you can do"');
    expect(back).not.toContain('data-action="whom"');
  });
});
