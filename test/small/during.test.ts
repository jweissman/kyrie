import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// During (OR-225): what holds over everything written within it, said once, lowered to the conjunction the author
// would have written out on every rule, act and observation in it (Gosse's Company's night had written its scene's
// guard 113 times); so play is what it was, and what is written within it may neither say the guard again nor deny it.
// A bell rung in the first scene, then bowed to in the second.
const body = (bell: string) => `Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Measure scene(entity). Relation rung(entity). Relation bowed(entity). Entity bell: entity "the bell".
  ${bell}`;
const scoped = body(`During scene(bell) == 0 {
    Action ring(actor: group) "Ring the bell" { Requires at(actor, yard). On success { Assert rung(bell). } }
    During rung(bell) { Rule first when true { Set scene(bell) to 1. } }
  }
  During scene(bell) == 1 {
    Action bow(actor: group) "Bow to the bell" {
      Requires at(actor, yard) and not bowed(bell). On success { Assert bowed(bell). } }
  }`);
const written = body(`Action ring(actor: group) "Ring the bell" {
    Requires scene(bell) == 0 and at(actor, yard). On success { Assert rung(bell). } }
  Rule first when scene(bell) == 0 and rung(bell) { Set scene(bell) to 1. }
  Action bow(actor: group) "Bow to the bell" {
    Requires scene(bell) == 1 and at(actor, yard) and not bowed(bell). On success { Assert bowed(bell). } }`);
const conditions = (t: Tiny) => {
  const m = t.campaign.module, own = (id: string) => id.startsWith('t__');
  return [...(m.rules ?? []).filter(r => own(r.id)).map(r => [r.id, r.when]),
    ...m.actions.filter(a => own(a.id)).map(a => [a.id, a.requires])];
};
const offered = (t: Tiny) => t.glance.acts.map(a => a.label).filter(l => /bell/.test(l));
describe('During', () => {
  it('lowers to the conditions written out on each declaration within it, its own first', async () => {
    expect(conditions(await Tiny.start(scoped, { horizon: [] })))
      .toEqual(conditions(await Tiny.start(written, { horizon: [] })));
  });
  it('holds what is written within it to its scene, and moves on as the scene does', async () => {
    const t = await Tiny.start(scoped, { horizon: [] });
    expect(offered(t)).toEqual(['Ring the bell']);
    expect(t.journey.choices().map(c => c.label).filter(l => /bell/.test(l))).toEqual(['Ring the bell']);
    await t.play('Ring the bell');
    expect(offered(t)).toEqual(['Bow to the bell']);
    expect(t.journey.choices().map(c => c.label).filter(l => /bell/.test(l))).toEqual(['Bow to the bell']);
  });
  it('refuses a declaration that says its guard again or denies it', async () => {
    const said = scoped.replace('Requires at(actor, yard).', 'Requires at(actor, yard) and scene(bell) == 0.');
    await expect(Tiny.start(said, { horizon: [] })).rejects.toThrow(/ring says again what its During says/);
    await expect(Tiny.start(scoped.replace('Requires at(actor, yard) and not', 'Requires scene(bell) == 0 and not'),
      { horizon: [] }))
      .rejects.toThrow(/bow can never hold: it denies what its During says/);
    await expect(Tiny.start(scoped.replace('Rule first when true', 'Rule first when not rung(bell)'), { horizon: [] }))
      .rejects.toThrow(/first can never hold/);
  });
});
