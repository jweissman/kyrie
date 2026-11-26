import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Content } from '../../src/content';
import { FoeIntents } from '../../src/foe-intents';
import { RunnerFight } from '../../src/cli/runner-fight';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerOffer } from '../../src/cli/runner-offer';
import { Tiny } from '../support/tiny';

// What the other side means to do is said, in words, before the company answers it, by every client (the cold play of
// 25 November: the fight rated best was the one that said the she-bear was rearing up to strike; the terminal and the
// runner had said nothing of what was coming, the page only "Bite → Wenna" on a card).
const fight = (foes: string[], klass: 'mage' | 'warrior' = 'warrior') => {
  const hero = new Content('w').character(klass, 'w', 'fighters', 'human');
  const against = foes.map((kind, i) => new Content(`f${i}`).creature(kind, `f${i}`, 'goblins', 1));
  const battle = new Battle({ id: 'bout', combatants: [hero, ...against], abilities: Content.abilities }, 'intents');
  while (battle.state.actor !== 'w' && !battle.state.outcome) { battle.step(battle.chosen()); }
  return battle;
};
const hall = `
  Place hall "the hall" is room at 0, 0 underground.
  Company party "You" of 1 at hall.
  Person king "the barrow-king" at hall {
    Role "the last king". Species revenant. Level 8. Temperament territorial. Lair hall.
  }
  Goal false.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const called = new Map([['w', 'Wenna'], ['f0', 'the first rat'], ['f1', 'the second rat'], ['f2', 'the third rat']]);

describe("the other side's intents", () => {
  it('say who is going for whom, the blows at one said together', () => {
    const battle = fight(['rat', 'rat']), pending = (battle.state.order ?? []).filter(id => id !== 'w');
    const lines = FoeIntents.lines(battle, called);
    expect(lines.length).toBe(pending.length ? 1 : 0);
    if (pending.length === 2) { expect(lines[0]).toMatch(/^The first rat and the second rat scurry at Wenna/); }
    if (pending.length === 1) { expect(lines[0]).toMatch(/^The (first|second) rat darts at Wenna's ankles/); }
  });
  it('say when a blow could bring one of the company down', () => {
    const lines = FoeIntents.lines(fight(['bear'], 'mage'), new Map([['w', 'Iselde'], ['f0', 'the bear']]));
    expect(lines.join(' ')).toMatch(/The bear .*Iselde.* could bring Iselde down\./);
  });
  it('are none for a foe that has acted this round, its blow already struck', () => {
    const battle = fight(['rat']), acted = !(battle.state.order ?? []).includes('f0');
    expect(FoeIntents.lines(battle).length).toBe(acted ? 0 : 1);
  });
  // The runner (the cold players' client) tells them with the turn, and hands a press on back when the king's blow
  // could kill: the barrow-king against a warrior alone.
  it('are told by the runner with the turn, and stop a press on', async () => {
    const t = await Tiny.start(hall, { party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
    const r = new Runner(t.session), offer = r.said().offer;
    const attack = RunnerOffer.flat([...offer.primary, ...offer.rest]).find(o => o.type === 'fight')!;
    const first = said(await r.ask(JSON.stringify({ act: attack.id })));
    const pressed = first.moment === 'fight' ? said(await r.ask(JSON.stringify({ act: RunnerFight.through }))) : first;
    expect(pressed.moment).toBe('fight');
    expect(pressed.scene.lines.join(' ')).toMatch(/Choose again\./);
    expect([...first.scene.lines, ...pressed.scene.lines].join(' ')).toMatch(/reaches for Ama|at Ama/);
  });
});
