import { describe, expect, it } from 'bun:test';
// The campaign's tick first: Kyr's entry, loaded first, meets the language's inner cycle half-made (OR-542).
import { CampaignTick } from '../../src/campaign/campaign-tick';
import { ModuleParser, ModuleWriter, World } from '../../src/lang/index';
import { RuleWakes } from '../../src/campaign/rule-wakes';

// The world's rules woken by what was written (AX-10): a rule found idle is filed by the names it is held on, and a
// watch asks only those a write has woken. Three rules over a tiny world, each held by its own name: writing one name
// wakes exactly the rule held on it, and the rule that fires is no longer asleep anywhere. One asking of a fact with
// ?variables, where there is none such, is held on that fact's relation alone.
const m = ModuleParser.parse(`Module w "W" { Kind thing. Relation sent(thing). Relation rung(thing).
  Relation fed(thing). Relation done(thing). Entity reeve: thing "the reeve". Entity bell: thing "the bell".
  Entity hen: thing "the hen".
  Rule cry when sent(reeve) and not done(reeve) { Assert done(reeve). }
  Rule toll when rung(bell) and not done(bell) { Assert done(bell). }
  Rule feed when fed(?who) and not done(?who) { Assert done(?who). } }`);
const [cry, toll, feed] = m.rules!;
const asleep = (w: World) => m.rules!.filter(r => RuleWakes.of(m).sleeps(RuleWakes.of(m).asleep(w), r)).map(r => r.id);
describe('rules woken by what was written', () => {
  it('wakes exactly the rule held on the name written, in the same line', () => {
    let w = new World(m).apply(m.initial);
    for (const r of m.rules!) { expect(CampaignTick.instances(r, w)).toEqual([]); }
    expect(asleep(w)).toEqual(['cry', 'toll', 'feed']);
    w = w.apply([{ kind: 'assert', call: ModuleWriter.call('rung', 'bell') }]);
    expect(asleep(w)).toEqual(['cry', 'feed']);
    expect(CampaignTick.instances(toll!, w).length).toBe(1);
    expect(asleep(w)).toEqual(['cry', 'feed']);
    // The bell tolled: what is done is written, and the feed, held by there being no one fed, sleeps on.
    w = w.apply([{ kind: 'assert', call: ModuleWriter.call('done', 'bell') }]);
    expect(asleep(w)).toEqual(['cry', 'feed']);
    w = w.apply([{ kind: 'assert', call: ModuleWriter.call('fed', 'hen') }]);
    expect(asleep(w)).toEqual(['cry']);
    expect(CampaignTick.instances(feed!, w).length).toBe(1);
    expect(CampaignTick.instances(cry!, w)).toEqual([]);
  });
  // Held on what it asks of the one thing it names (OR-1438): the yard's gate rule waits on the reeve's whereabouts,
  // not on anyone's; the hen walking in wakes nothing, the reeve coming does.
  it('wakes a rule asking of one thing only when that thing\'s facts are written', () => {
    const y = ModuleParser.parse(`Module y "Y" { Kind thing. Kind place. Relation at(thing, place) exclusive.
      Relation opened(place). Entity reeve: thing "the reeve". Entity hen: thing "the hen". Entity yard: place "the yard".
      Entity lane: place "the lane". Initially Assert at(reeve, lane). Initially Assert at(hen, lane).
      Rule gate when at(reeve, yard) and not opened(yard) { Assert opened(yard). } }`);
    const gate = y.rules![0]!, wakes = RuleWakes.of(y);
    let w = new World(y).apply(y.initial);
    expect(CampaignTick.instances(gate, w)).toEqual([]);
    w = w.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'hen', 'yard') }]);
    expect(wakes.sleeps(wakes.asleep(w), gate)).toBe(true);
    w = w.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'reeve', 'yard') }]);
    expect(wakes.sleeps(wakes.asleep(w), gate)).toBe(false);
    expect(CampaignTick.instances(gate, w).length).toBe(1);
  });
  // A command that fails in its watches puts the world back as it was (test/command-faults): what was filed in the
  // failed watches is of another branch of the line, and a name written there and not here (the reeve marked, then
  // put back) wakes what it held, as a name written here does (OR-1438: the rim path's stoodAt, never asserted again
  // when the wait was done over).
  it('wakes in a world put back what was filed in the branch that failed', () => {
    const y = ModuleParser.parse(`Module b "B" { Kind thing. Kind place. Relation at(thing, place) exclusive.
      Relation marked(thing). Entity reeve: thing "the reeve". Entity yard: place "the yard".
      Entity lane: place "the lane". Initially Assert at(reeve, lane).
      Rule mark when at(reeve, yard) and not marked(reeve) { Assert marked(reeve). } }`);
    const mark = y.rules![0]!, wakes = RuleWakes.of(y), base = new World(y).apply(y.initial);
    const there = ModuleWriter.call('at', 'reeve', 'yard');
    expect(CampaignTick.instances(mark, base)).toEqual([]);
    wakes.asleep(base);
    // The branch that failed: the reeve came, the rule fired, and it was held again on his being marked.
    const failed = base.apply([{ kind: 'assert', call: there }]);
    expect(wakes.sleeps(wakes.asleep(failed), mark)).toBe(false);
    const marked = failed.apply([{ kind: 'assert', call: ModuleWriter.call('marked', 'reeve') }]);
    wakes.asleep(marked);
    expect(CampaignTick.instances(mark, marked)).toEqual([]);
    wakes.asleep(marked);
    // Put back, and done again: the reeve comes, unmarked, and the rule is awake to mark him.
    const again = base.apply([{ kind: 'assert', call: there }]);
    expect(wakes.sleeps(wakes.asleep(again), mark)).toBe(false);
    expect(CampaignTick.instances(mark, again).length).toBe(1);
  });
  it('holds nothing asleep in a world of another line', () => {
    const w = new World(m).apply(m.initial);
    for (const r of m.rules!) { CampaignTick.instances(r, w); }
    expect(asleep(new World(m).apply(m.initial))).toEqual([]);
  });
});
