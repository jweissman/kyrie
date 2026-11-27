import { describe, expect, it } from 'bun:test';
// The campaign's tick first: Kyr's entry, loaded first, meets the language's inner cycle half-made (OR-542).
import { CampaignTick } from '../../src/campaign/campaign-tick';
import { ModuleParser, ModuleWriter, World } from '../../src/lang/index';
import { RuleWakes } from '../../src/campaign/rule-wakes';

// A fact written to what it already is writes nothing (OR-1360), as a measure set to what it is writes nothing: a
// retract where it does not hold and an assert where it does leave the relation's stamp, and its order, as they were,
// so the rules held on it sleep on. The clock had written dark() every watch, day and night alike, and every rule
// reading dark woke each watch. An exclusive relation's assert is still written whole.
const m = ModuleParser.parse(`Module w "W" { Kind thing. Relation dark(). Relation lit(thing). Relation done(thing).
  Relation at(thing, thing) exclusive. Entity bell: thing "the bell". Entity hen: thing "the hen".
  Entity yard: thing "the yard".
  Rule mourn when dark() and not done(bell) { Assert done(bell). } }`);
const call = (name: string, ...args: string[]) => ModuleWriter.call(name, ...args);
describe('a fact written to what it already is', () => {
  it('writes nothing: a retract where it does not hold, an assert where it does', () => {
    const w = new World(m).apply([{ kind: 'assert', call: call('lit', 'bell') }, { kind: 'assert', call: call('lit', 'hen') }]);
    const stamps = [w.stamp('dark'), w.stamp('lit')];
    const after = w.apply([{ kind: 'retract', call: call('dark') }, { kind: 'assert', call: call('lit', 'bell') }]);
    expect([after.stamp('dark'), after.stamp('lit')]).toEqual(stamps);
    // Its order kept: the bell, written again, is not moved behind the hen.
    expect(after.related('lit').map(r => r.args[0])).toEqual(['bell', 'hen']);
    // A real change is written as before.
    expect(after.apply([{ kind: 'retract', call: call('lit', 'hen') }]).stamp('lit')).toBeGreaterThan(stamps[1]!);
  });
  it('lets the rules held on it sleep through a watch that changes nothing of it', () => {
    let w = new World(m).apply(m.initial);
    for (const r of m.rules!) { expect(CampaignTick.instances(r, w)).toEqual([]); }
    const asleep = () => m.rules!.filter(r => RuleWakes.of(m).sleeps(RuleWakes.of(m).asleep(w), r)).map(r => r.id);
    expect(asleep()).toEqual(['mourn']);
    // A day's watch, the clock retracting dark() that does not hold: the rule reading dark sleeps on.
    w = w.apply([{ kind: 'retract', call: call('dark') }]);
    expect(asleep()).toEqual(['mourn']);
  });
  it('still writes an exclusive relation whole', () => {
    const w = new World(m).apply([{ kind: 'assert', call: call('at', 'hen', 'yard') }]);
    expect(w.apply([{ kind: 'assert', call: call('at', 'hen', 'yard') }]).related('at').length).toBe(1);
  });
});
