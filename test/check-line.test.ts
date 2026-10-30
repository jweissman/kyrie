import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CombatPresenter } from '../src/ui/combat-presenter';
import type { BattleState, CombatEvent } from '../src/model';
import type { ExchangeLine } from '../src/presentation/narrator';
import { Check } from '../web/reader/stage/check';
import { Told } from '../web/reader/stage/told';

// The die on the table: a roll made outside a fight is read back from the line the presenter tells it in, and drawn
// as the twenty faces of the die, those that would have done it lit, and where it came down. The lines are made by
// the presenter itself, so a change in its wording breaks this, not the page.
describe('a roll made outside a fight', () => {
  const state = { combatants: [], turn: 0, actor: '', outcome: null } as BattleState;
  const check = (e: Partial<Extract<CombatEvent, { type: 'check' }>>) => CombatPresenter.format({ type: 'check', turn: 0,
    actor: 'Wren', skill: 'perception', rolled: 0, difficulty: 13, success: false, ...e }, state);
  const save = (e: Partial<Extract<CombatEvent, { type: 'save' }>>) => CombatPresenter.format({ type: 'save', turn: 0,
    actor: '', target: 'Hild', rolled: 0, difficulty: 14, success: false, ...e }, state);
  it('reads a check made and one failed: who, what, the die, and the least face that would have done it', () => {
    const made = check({ die: 14, stat: 'wisdom', modifier: 2, trained: 3, rolled: 19, success: true });
    expect(made).toBe('Wren makes the perception check (d20 14 + wisdom 2 + perception 3 = 19 against 13).');
    expect(Check.read(made)).toEqual({ who: 'Wren', what: 'perception', kind: 'check', die: 14, need: 8, made: true });
    const failed = check({ skill: 'lockwork', die: 5, stat: 'dexterity', modifier: 1, rolled: 6, difficulty: 16 });
    expect(Check.read(failed)).toEqual({ who: 'Wren', what: 'lockwork', kind: 'check', die: 5, need: 15, made: false });
  });
  it('reads a modifier below nothing, and a skill of more than one word', () => {
    const line = check({ skill: 'sleight_of_hand', die: 12, stat: 'wisdom', modifier: -1, rolled: 11, success: false });
    expect(Check.read(line)).toMatchObject({ what: 'sleight of hand', die: 12, need: 14, made: false });
  });
  it('reads what needs no luck and what no luck could do, unrolled', () => {
    const sure = check({ unrolled: true, rolled: 15, success: true, stat: 'wisdom', modifier: 5, trained: 9 });
    expect(sure).toBe('Wren needs no luck for it (perception: at worst 15 against 13).');
    expect(Check.read(sure)).toEqual({ who: 'Wren', what: 'perception', kind: 'check', need: 1, made: true, sure: true });
    const beyond = check({ unrolled: true, rolled: 12, difficulty: 19, stat: 'wisdom', modifier: -8 });
    expect(Check.read(beyond)).toEqual({ who: 'Wren', what: 'perception', kind: 'check', need: 21, made: false,
      sure: false });
  });
  it('reads a save passed and one failed, and leaves one with no die as it was told', () => {
    const passed = save({ kind: 'reflex', die: 11, stat: 'dexterity', modifier: 2, level: 1, rolled: 14, success: true });
    expect(passed).toBe('Hild passes the reflex save (d20 11 + dexterity 2 + level 1 = 14 against 14).');
    expect(Check.read(passed)).toEqual({ who: 'Hild', what: 'reflex', kind: 'save', die: 11, need: 11, made: true });
    const failed = save({ kind: 'reflex', die: 3, stat: 'dexterity', modifier: 0, bonus: 1, rolled: 4, limit: true });
    expect(Check.read(failed)).toMatchObject({ kind: 'save', die: 3, need: 13, made: false });
    expect(Check.read(save({ kind: 'poison', rolled: 9 }))).toBeUndefined();
    expect(Check.read(check({ actor: '' }))).toBeUndefined();
  });
  it('needs a face of 2 to 20 whenever the die was rolled', () => {
    for (const [modifier, difficulty] of [[-5, 10], [5, 19], [0, 13], [9, 10], [-9, 19]] as const) {
      for (const die of [1, 10, 20]) {
        const t = Check.read(check({ die, stat: 'wisdom', modifier, rolled: die + modifier, difficulty }))!;
        expect(t.need).toBeGreaterThanOrEqual(2);
        expect(t.need).toBeLessThanOrEqual(20);
      }
    }
  });
  const html = (...lines: ExchangeLine[]) => renderToStaticMarkup(createElement(Told.Happened,
    { exchange: { lines, notes: [], tone: 'act' } }));
  it('is drawn as the twenty faces, those that would do it lit, and the die where it came down', () => {
    const out = html({ text: 'You look closely at the grate.', kind: 'event' },
      { text: check({ die: 14, stat: 'wisdom', modifier: 2, trained: 3, rolled: 19, success: true }), kind: 'roll' });
    expect(out).toContain('<p class="event">You look closely at the grate.</p>');
    expect(out).toContain('class="roll throw made"');
    expect(out.match(/<i( class="lit")?><\/i>/g)).toHaveLength(20);
    expect(out.match(/<i class="lit"><\/i>/g)).toHaveLength(13);
    expect(out).toContain('style="left:67.5%"');
    expect(out).toContain('Wren · perception');
    expect(out).toContain('14 on the die, needing 8');
  });
  it('draws what needs no luck all lit, with no die, and a failure in ember', () => {
    const sure = html({ text: check({ unrolled: true, rolled: 15, success: true }), kind: 'roll' });
    expect(sure).toContain('class="roll throw sure"');
    expect(sure.match(/<i class="lit"><\/i>/g)).toHaveLength(20);
    expect(sure).not.toContain('class="die"');
    const beyond = html({ text: check({ unrolled: true, rolled: 12, difficulty: 19 }), kind: 'roll' });
    expect(beyond).toContain('class="roll throw beyond"');
    expect(beyond).not.toContain('class="lit"');
    expect(html({ text: check({ die: 5, rolled: 6, difficulty: 16, stat: 'wisdom', modifier: 1 }), kind: 'roll' }))
      .toContain('class="roll throw missed"');
  });
  it('tells a roll it cannot read, and every other line, as it always did', () => {
    const plain = save({ kind: 'poison', rolled: 9 });
    expect(html({ text: plain, kind: 'roll' })).toContain(`<p class="roll">${plain}</p>`);
    const told = html({ text: 'Wren makes the perception check (d20 14 + wisdom 2 = 16 against 13).', kind: 'event' });
    expect(told).not.toContain('throw');
  });
});
