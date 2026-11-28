import { describe, expect, it } from 'bun:test';
import { ItemNames } from '../../src/lang/item-names';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';

// A thing named for whose it is is said by that name (OR-262: the first blind cold play's pack held "a tegwen's lease",
// the weir life's own aunt's lease said as a kind of thing); a catalog's heading, every word capitalized, is a kind
// like any other ("a healer's kit").
const weir = `
  Place hut "the hut" is room at 0, 0.
  Company party "You" of 1 at hut.
  Kind lease_kind "Tegwen's lease" is document worth 0 weighing 1 described "A strip of parchment, much folded.".
  Item lease_scroll "Tegwen's lease" is lease_kind at hut.
  Goal false.`;
describe('a thing named for its owner', () => {
  it('is said by its name, and a heading as a kind', () => {
    expect(["Tegwen's lease", "Bran's tally-stick", "Healer's Kit", "Thieves' Tools", 'Torch'].map(n => ItemNames.called(n)))
      .toEqual(["Tegwen's lease", "Bran's tally-stick", "a healer's kit", "thieves' tools", 'a torch']);
    // Whoever uses a kind is no owner: Pryor's store sells a climber's harness (test/muster-played's walks).
    expect(["Climber's harness", "Tinker's tools", "Fisherman's net"].map(n => ItemNames.called(n)))
      .toEqual(["a climber's harness", "tinker's tools", "a fisherman's net"]);
  });
  it('is carried in the pack by that name', async () => {
    const t = await Tiny.start(weir, { horizon: ['belongings'] });
    await t.play("Tegwen's lease: Take");
    expect(JSON.stringify(ScreenModel.build(t.campaign).items.map(i => i.name))).toContain("Tegwen's lease");
    expect(JSON.stringify(ScreenModel.build(t.campaign).items.map(i => i.name))).not.toMatch(/a tegwen/i);
  });
});
