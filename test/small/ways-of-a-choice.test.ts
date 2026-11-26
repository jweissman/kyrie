import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { MenuModel } from '../../src/frame/menu-model';
import { GlanceStage } from '../../web/reader/stage/glance';
import type { Frame } from '../../src/creation/protocol';
import type { ReaderApp } from '../../web/reader/reader-app';
import { MenuTree } from '../../src/frame/menu-tree';

// The ways of one choice are led side by side, or not at all (OR-242: the first blind cold play of the page, P142-144:
// after Ifan Rhys was spoken to, the four led his boat for "wind the gate up" alone, and "keep it shut" was under the
// boat's look). A choice, in Kyr, is acts each of which asserts what the other's requirement says must not hold (see
// Alternatives). Held at every turn of the talk beside it, in the engine's four, the page's and each lens's.
const gate = `
  Place gatehouse "the gatehouse" is room at 0, 0.
  Company party "You" of 1 at gatehouse.
  Relation through(group). Relation back(group).
  Person ifan "Ifan" at gatehouse { Role "an eel-man at the pole". Ancestry human. Peaceable. Pronouns he. }
  Topic ifan_toll with ifan "Ask Ifan about the toll" when true once { Says "'Shut it, and my children go hungry.'". }
  Thing boat "Ifan's boat, under the gate" at gatehouse { State waiting "Ifan holds his boat against the gate.". }
  Action let_through(actor: group, site: place) "Wind the gate up and let Ifan's boat through" {
    Time 30 minutes.
    Requires able(actor) and at(actor, site) and at(boat, site) and not through(actor) and not back(actor).
    Result "The boat slides through.".
    On success { Retract at(boat, gatehouse). Assert through(actor). }
  }
  Action turn_back(actor: group, site: place) "Keep the gate shut, and send Ifan's boat back" {
    Time 10 minutes.
    Requires able(actor) and at(actor, site) and at(boat, site) and not through(actor) and not back(actor).
    Result "He turns the boat in the cut.".
    On success { Retract at(boat, gatehouse). Assert back(actor). }
  }`;
const ways = /^t__boat\/0:(Wind|Keep) /;
// Where the two are drawn among a list of rows, by the row each is: both, next to each other, or neither.
const together = (does: string[]) => {
  const at = does.flatMap((d, i) => ways.test(d) ? [i] : []);
  return at.length === 0 || (at.length === 2 && at[1] === at[0]! + 1);
};
const drawn = (t: Tiny) => {
  const frame = MenuTree.framed({ screen: t.screen, leaf: t.leaf } as unknown as Frame), menu = MenuModel.build(frame, 'here', []);
  const app = { state: { frame, open: [], keyed: false, cursor: 0 }, menu, props: { query: new URLSearchParams() },
    choose: () => undefined } as unknown as ReaderApp;
  return GlanceStage.offered(app)!.map(a => a.choice);
};
const check = (t: Tiny) => {
  const g = t.glance, four = g.offer!.primary.map(o => o.choice);
  const lenses = Object.values(g.lenses ?? {}).map(l => l.promoted.map(p => p.choice));
  return { four: together(four), page: together(drawn(t)), lenses: lenses.every(together),
    led: four.filter(d => ways.test(d)).length };
};
describe('the ways of one choice', () => {
  it('are led side by side, before the talk beside them, during it and after', async () => {
    const t = await Tiny.start(gate);
    expect(check(t)).toEqual({ four: true, page: true, lenses: true, led: 2 });
    await t.perform('talk_to(t__ifan)');
    expect(check(t)).toMatchObject({ four: true, page: true, lenses: true });
    await t.perform('t__ifan_toll');
    expect(check(t)).toEqual({ four: true, page: true, lenses: true, led: 2 });
    await t.perform('take_leave(t__ifan)');
    expect(check(t)).toEqual({ four: true, page: true, lenses: true, led: 2 });
  });
});
