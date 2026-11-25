import { describe, expect, it } from 'bun:test';
// The parser first: Kyr's entry, loaded first, meets the language's inner cycle half-made (OR-542).
import { ModuleParser } from '../../src/lang/module-parser';
import { ModuleWriter, World } from '../../src/lang/index';
import { CampaignTick } from '../../src/campaign/campaign-tick';

// A rule found idle is held idle by the part of its condition that keeps it from holding, where a part asking of no
// variable fails alone, not by everything it reads: a sale cried once the reeve is sent is not asked again every watch
// for asking the hour too (AX-10). Asked again the moment that part's reads are written, it fires as it always did.
const m = ModuleParser.parse(`Module p "P" { Kind thing. Relation sent(thing). Relation cried(thing).
  Measure hour(thing). Entity reeve: thing "the reeve". Entity clock: thing "the clock".
  Rule cry when sent(reeve) and hour(clock) >= 3 and not cried(reeve) { Assert cried(reeve). } }`);
const rule = m.rules![0]!;
const at = (w: World, hour: number) => w.apply([{ kind: 'set', call: ModuleWriter.call('hour', 'clock'),
  value: ModuleWriter.number(hour) }]);
describe('a rule held idle by its failing part', () => {
  it('is not solved again while the clock moves, and fires once the part that failed holds', () => {
    let w = at(new World(m).apply(m.initial), 1);
    expect(CampaignTick.instances(rule, w)).toEqual([]);
    const asked: unknown[] = [], test = World.prototype.test;
    World.prototype.test = function (this: World, ...a: Parameters<World['test']>) { asked.push(a[0]); return test.apply(this, a); };
    try {
      for (let h = 2; h <= 6; h++) { w = at(w, h); expect(CampaignTick.instances(rule, w)).toEqual([]); }
      expect(asked).toEqual([]);
    } finally { World.prototype.test = test; }
    w = w.apply([{ kind: 'assert', call: ModuleWriter.call('sent', 'reeve') }]);
    expect(CampaignTick.instances(rule, w).map(([effects]) => effects.map(c => World.format(c.call)))).toEqual([['cried(reeve)']]);
  });
  it('held by the clock where the clock is what fails, is asked as the hour moves', () => {
    let w = at(new World(m).apply([...m.initial, { kind: 'assert', call: ModuleWriter.call('sent', 'reeve') }]), 1);
    expect(CampaignTick.instances(rule, w)).toEqual([]);
    w = at(w, 2); expect(CampaignTick.instances(rule, w)).toEqual([]);
    w = at(w, 3); expect(CampaignTick.instances(rule, w).length).toBe(1);
  });
});
// A part that compares a variable's measure is no part asking of no variable: a ware's price, once its seller is
// grateful, is lowered (data/rules/services.kyr's thanks_priced_item; test/small/payoff).
describe('a part comparing a variable', () => {
  it('holds nothing idle by itself', () => {
    const w0 = ModuleParser.parse(`Module q "Q" { Kind thing. Relation grateful(thing). Relation forSale(thing).
      Measure price(thing). Entity halm: thing "Halm". Entity torch: thing "a torch".
      Initially Assert forSale(torch). Initially Set price(torch) to 3.
      Rule thanks when grateful(halm) and forSale(?ware) and price(?ware) > 1 { Decrease price(?ware) by 1. } }`);
    // Halm's thanks written since the price was (given and taken back), so that the price is what was read longest ago.
    const grateful = ModuleWriter.call('grateful', 'halm'), rule = w0.rules![0]!;
    const w = new World(w0).apply(w0.initial).apply([{ kind: 'assert', call: grateful }])
      .apply([{ kind: 'retract', call: grateful }]);
    expect(CampaignTick.instances(rule, w)).toEqual([]);
    const thanked = w.apply([{ kind: 'assert', call: grateful }]);
    expect(CampaignTick.instances(rule, thanked).length).toBe(1);
  });
});
