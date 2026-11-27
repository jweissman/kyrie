import { describe, expect, it } from 'bun:test';
// The language loaded whole before the page's modules (OR-542: Kyr's entry loaded first is half-made).
import '../support/tiny';
import { createElement, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FightMoves, type Aiming } from '../../web/reader/stage/fight-moves';
import type { Choice } from '../../src/ui/choice-list';
import type { ReaderApp } from '../../web/reader/reader-app';

// Whom to strike, asked in place of the hand's rows (the owner's playtest, 26 November, OR-1296: choosing a target had
// extended a copy of the menu beneath it): while aiming, the targets are the rows and the hand's are gone; put aside
// or chosen, the hand's rows come back. A target chosen is the engine's own choice, done by its command; a move aimed
// from a kind opened (a spell from Spells) comes back to that kind when the aim is put aside, at the page it was on
// (OR-1561: Not now had dropped the kind for the hand's first rows). The targets stand where the hand's rows stood, in
// its menu, never in a column of their own (OR-1563).
const rat = (n: string, verb = 'Strike'): Choice => ({ id: `${verb.toLowerCase()}>t__${n}`, label: `${verb} the ${n} rat`,
  tone: 'creature', command: `${verb.toLowerCase()}(${n})`, note: 'an even chance' });
const attack: Choice = { id: 'strike', label: 'Strike', tone: 'creature', children: [rat('first'), rat('second')] };
const bolt: Choice = { id: 'bolt', label: 'Fire bolt', tone: 'ability', children: [rat('first', 'Bolt'), rat('second', 'Bolt')] };
const spells = ['Light', 'Mend', 'Guidance', 'Shield', 'Sleep'].map(l => ({ id: l.toLowerCase(), label: l,
  tone: 'ability', command: l.toLowerCase() }) as Choice);
const chosen: Choice[] = [];
const app = { menu: { sections: [{ id: 'strike', title: 'Strike', tone: 'creature', glyph: '', choices: [attack] },
  { id: 'spells', title: 'Spells', tone: 'ability', glyph: '', choices: [bolt, ...spells] }],
choices: [attack] }, state: {}, props: {}, choose: (c: Choice) => { chosen.push(c); } } as unknown as ReaderApp;
const drawn = (aiming?: Aiming, panel?: string) => renderToStaticMarkup(createElement(FightMoves.View,
  { app, aim: () => undefined, open: () => undefined, ...aiming ? { aiming } : {}, ...panel ? { panel } : {} }));
// What a move aims at, as the hand works it out when it is taken (FightMoves.take), and what became of the taking.
const taken = (c: Choice) => {
  const said: { aimed?: Aiming; opened: (string | undefined)[] } = { opened: [] };
  FightMoves.take(app, c, a => { said.aimed = a; }, p => { said.opened.push(p); });
  return said;
};
// The rows a drawn part holds, by the action their row does (a row's data, or a quiet row's own: FightMoves.Quiet),
// each pressed as a hand presses it.
type Row = { press: () => void; choice?: string };
const rows = (node: ReactNode, action: string): Row[] => {
  if (Array.isArray(node)) { return node.flatMap(n => rows(n as ReactNode, action)); }
  if (!isValidElement(node)) { return []; }
  const props = node.props as { data?: { action?: string; choice?: string }; action?: string; onClick?: () => void;
    go?: () => void; children?: ReactNode };
  const own = props.data?.action === action || props.action === action
    ? [{ press: () => (props.onClick ?? props.go)!(), choice: props.data?.choice }] : [];
  return [...own, ...rows(props.children, action)];
};
describe('whom to strike', () => {
  it('is asked in place of the hand\'s rows, which come back without it', () => {
    const asked = drawn({ choice: attack, targets: new Map(attack.children!.map(c => [c.id, c])) });
    expect(asked.startsWith('<div class="hand aiming">')).toBe(true);
    expect(asked).toContain('data-action="whom"');
    expect(asked).not.toContain('aria-label="What you can do"');
    expect(asked.match(/data-action="whom"/g)).toHaveLength(2);
    // One menu of whom, and no other: the hand's rows and its kinds are gone while it is asked. The targets are the
    // hand's menu, where its rows stood (OR-1563: they had been drawn in the details column, at a wide screen's left),
    // the question and Not now beside them in the details region.
    expect(asked.match(/role="toolbar"/g)).toHaveLength(1);
    // The hand's height kept: room for its two rows (Attack and Spells), whatever the number of targets.
    const menu = new RegExp('^<div class="hand aiming"><div class="hand-menu whom" role="toolbar" '
      + 'aria-label="Whom" style="grid-template-rows:repeat\\(2, var\\(--choice-h\\)\\)"');
    expect(asked).toMatch(menu);
    const beside = /<div class="hand-detail"[^>]*><div class="aiming" role="status"><p class="hand-say">[^<]*whom/;
    expect(asked).toMatch(beside);
    expect(asked.match(/class="hand-menu/g)).toHaveLength(1);
    expect(asked).not.toContain('data-action="panel"');
    const back = drawn();
    expect(back).toContain('aria-label="What you can do"');
    expect(back).not.toContain('data-action="whom"');
  });
  it('does what the engine offered when a target is chosen, and Not now puts the aim aside', () => {
    const { aimed } = taken(attack);
    expect([...aimed!.targets.values()]).toEqual(attack.children!);
    let put: Aiming | undefined | 'kept' = 'kept';
    const whom = FightMoves.Whom({ aiming: aimed!, app, aim: a => { put = a; } });
    const targets = rows(whom, 'whom');
    expect(targets.map(t => t.choice)).toEqual(attack.children!.map(c => c.id));
    chosen.length = 0;
    targets[1]!.press();
    expect(chosen).toEqual([attack.children![1]!]);
    rows(whom, 'unaim')[0]!.press();
    expect(put).toBeUndefined();
  });
  it('comes back to the kind it was aimed from, at its page, once put aside', () => {
    // Aimed from Spells: the kind is kept open beneath the aim (nothing closes it), the aim asked in its place.
    const said = taken(bolt);
    expect(said.opened).toEqual([]);
    const aiming = said.aimed!;
    const asked = drawn(aiming, 'spells');
    expect(asked.startsWith('<div class="hand aiming">')).toBe(true);
    expect(asked).not.toContain('aria-label="Spells"');
    // Put aside: Spells again, not the hand's first rows.
    const back = drawn(undefined, 'spells');
    expect(back).toContain('aria-label="Spells"');
    expect(back).toContain('data-choice="bolt"');
    expect(back).not.toContain('aria-label="What you can do"');
    // The kind's page is the hand's to hold, so that it is the same page when it comes back.
    const page = (n: number) => renderToStaticMarkup(createElement(FightMoves.Kind, { section: app.menu.sections[1]!,
      take: () => undefined, note: () => ({}), close: () => undefined, room: 4, said: null, page: n,
      turn: () => undefined }));
    expect(page(1)).not.toContain('data-choice="bolt"');
    expect(page(1)).toContain('data-choice="sleep"');
    // A move done at once, or at the one target there is, puts the kind away as it is done.
    expect(taken(spells[0]!).opened).toEqual([undefined]);
  });
});
