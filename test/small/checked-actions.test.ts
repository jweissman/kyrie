import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleCompiler } from '../../src/lang/module-compiler';
import { RuntimeCapabilities } from '../../src/campaign/runtime-capabilities';
import type { Module } from '../../src/lang/module';

// An action checked once is passed again only where every lookup its check made answers the same (AX-04's validator
// split; CheckedActions): the same action object, checked in a module where it holds, and then in one where a relation
// it writes is gone, takes another arity, or an entity it names is no longer there, is refused there with the very
// message a fresh check gives; and a module refused is refused the same every time.
class Checked {
  static readonly kyr = `Module m "m" {
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Entity bell: fact "A bell.".
  Relation rung(entity).
  Action ring(actor: group, site: place) "Ring the bell" { Requires at(actor, site). On success { Assert rung(bell). } }
  Goal false.
}`;
  // The module, with the few kinds and the relation its world would give it (the shared rules', here its own).
  static parse(kyr = Checked.kyr): Module {
    const m = ModuleParser.parse(kyr);
    return { ...m, kinds: [...new Set([...m.kinds, 'place', 'group', 'fact', 'good', 'clock'])],
      relations: [...m.relations, { name: 'at', types: ['entity', 'entity'], exclusive: false }] };
  }
  static said(module: Module): string {
    try { new ModuleCompiler(RuntimeCapabilities.signatures, false).validate(module); return 'held'; }
    catch (e) { return (e as Error).message; }
  }
  // The same action objects in a module changed about them, and what a check that never met them says of it.
  static both(changed: (m: Module) => Module): [string, string] {
    const base = Checked.parse();
    expect(Checked.said(base)).toBe('held');
    const fresh = changed(Checked.parse());
    return [Checked.said(changed(base)), Checked.said(fresh)];
  }
}
describe('an action checked once', () => {
  it('is refused where a relation it writes is gone, as a fresh check refuses it', () => {
    const [again, fresh] = Checked.both(m => ({ ...m, relations: m.relations.filter(r => r.name !== 'rung') }));
    expect(again).not.toBe('held');
    expect(again).toBe(fresh);
  });
  it('is refused where the relation takes another arity, or the thing it names is gone', () => {
    const arity = Checked.both(m => ({ ...m, relations: m.relations.map(r => r.name === 'rung'
      ? { ...r, types: ['entity', 'entity'] } : r) }));
    const gone = Checked.both(m => ({ ...m, entities: m.entities.filter(e => e.id !== 'bell') }));
    for (const [again, fresh] of [arity, gone]) { expect([again === 'held', again]).toEqual([false, fresh]); }
  });
  it('is passed where nothing it looked up has changed, and a refused module is refused alike each time', () => {
    const base = Checked.parse();
    expect([Checked.said(base), Checked.said(base)]).toEqual(['held', 'held']);
    const bad = Checked.parse(Checked.kyr.replace('Assert rung(bell)', 'Assert rung(nobell)'));
    expect(Checked.said(bad)).toBe(Checked.said(bad));
    expect(Checked.said(bad)).toMatch(/Invalid argument nobell/);
  });
});
