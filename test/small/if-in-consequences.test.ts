import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Outcome } from '../../src/presentation/outcome';
import { ModuleCompiler, ModuleParser, ModuleWriter, type Module } from '../../src/lang';

// `If` in an act's consequences (OR-1333's first slice; AU-57, the authors' most repeated ask: "No `If` in an
// effect"): `If <condition>, <change>.` within On success or On failure, a guard on the change itself (Change.when),
// read against the world as the act begins, before any of its changes are made. It does what the ladder authors wrote
// for want of it does: an act that latches a flag, and two rules that answer the flag, one for each branch. Both reach
// the same world on each branch; what the act would teach is foreseen on the branch the world is on; the guard is
// written back as it was read; and a guard that reads what a change above it writes is refused, said where it is.
const yard = (lit: boolean, acts: string) => `Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Relation lit(entity). Relation peered(group). Relation peering(group). Measure owls(group).
  Entity lamp: entity "the lamp".
  Entity door_seen: fact "A door stands in the hedge where the lamp falls.".
  Entity owl_heard: fact "An owl calls out of the dark hedge.".
  ${lit ? 'Initially Assert lit(lamp).' : ''}
  ${acts}
  Goal false.`;
const conditional = `Action peer(actor: group) "Peer into the hedge" {
    Requires at(actor, yard) and not peered(actor).
    On success {
      Assert peered(actor).
      If lit(lamp), Assert knows(actor, door_seen).
      If not lit(lamp), Assert knows(actor, owl_heard).
      If not lit(lamp), Increase owls(actor) by 1.
    }
  }`;
const ladder = `Action peer(actor: group) "Peer into the hedge" {
    Requires at(actor, yard) and not peered(actor).
    On success { Assert peered(actor). Assert peering(actor). }
  }
  Rule peer_lit when peering(party) and lit(lamp) says "The lamplight finds the hedge." teaches door_seen {
    Retract peering(party).
  }
  Rule peer_dark when peering(party) and not lit(lamp) says "Something calls in the dark." teaches owl_heard {
    Retract peering(party). Increase owls(party) by 1.
  }`;
// What the world holds of the company's knowing and of the fragment's own, but for the ladder's latch.
const state = (t: Tiny) => [...t.world.related('knows', 'party').map(r => `knows ${r.args[1]}`),
  ...t.world.related('t__peered').map(r => `peered ${r.args[0]}`),
  `owls ${t.world.number({ kind: 'call', name: 't__owls', args: ['party'] })}`].sort();
const peer = (t: Tiny) => t.campaign.offered().find(o => o.id.startsWith('t__peer('))!;
describe('If in an act\'s consequences', () => {
  for (const lit of [true, false]) {
    it(`reaches what the ladder of two rules reaches, the lamp ${lit ? 'lit' : 'dark'}`, async () => {
      const once = await Tiny.start(yard(lit, conditional), { horizon: [] });
      const twice = await Tiny.start(yard(lit, ladder), { horizon: [] });
      await once.play('Peer into the hedge'); await twice.play('Peer into the hedge');
      expect(state(once)).toEqual(state(twice));
      expect(state(once)).toContain(lit ? 'knows t__door_seen' : 'knows t__owl_heard');
      expect(state(once)).not.toContain(lit ? 'knows t__owl_heard' : 'knows t__door_seen');
    });
    it(`foresees the branch the world is on, the lamp ${lit ? 'lit' : 'dark'}, as the ladder does`, async () => {
      const fact = lit ? 't__door_seen' : 't__owl_heard';
      for (const acts of [conditional, ladder]) {
        const t = await Tiny.start(yard(lit, acts), { horizon: [] });
        expect(Outcome.taught(t.campaign.module, t.world, peer(t), 'party')).toEqual([fact]);
      }
    });
  }
  it('is written back as it was read', () => {
    const read = (text: string): Module => ModuleParser.parse(text);
    const once = read(`Module t "t" { ${yard(false, conditional)} }`);
    expect(once.actions[0]!.success.filter(c => c.when).length).toBe(3);
    const written = ModuleWriter.write(once), again = read(written);
    expect(written).toContain('If not (lit(lamp)), Increase owls(actor) by 1.');
    expect(again.actions).toEqual(once.actions);
    const acts = (text: string) => text.slice(text.indexOf('  Action'));
    expect(acts(ModuleWriter.write(again))).toBe(acts(written));
  });
  it('is bound as the act is: a guard on the act\'s own parameters reads what they are bound to', async () => {
    const own = conditional.replace('If lit(lamp), Assert knows', 'If at(actor, yard), Assert knows');
    const t = await Tiny.start(yard(false, own), { horizon: [] });
    await t.play('Peer into the hedge');
    expect(state(t)).toEqual(['knows t__door_seen', 'knows t__owl_heard', 'owls 1', 'peered party']);
  });
  it('refuses a guard that reads what a change above it writes, said where it is written', async () => {
    const reads = conditional.replace('If lit(lamp), Assert knows', 'If peered(actor), Assert knows');
    await expect(Tiny.start(yard(false, reads), { horizon: [] })).rejects
      .toThrow(/site\.kyr:9:3: Action peer: its guard "If peered\(actor\)" reads peered, which a change above/);
    const text = `Module one "One" {
  Kind group. Kind place. Entity yard: place "the yard". Entity lane: place "the lane". Entity reeve: group "the reeve".
  Relation at(group, place) exclusive. Relation saw(group). Measure owls(group). Query rested(g: group) means saw(g).
  Action peer(actor: group) "Peer" {
    On success { Assert saw(actor). If at(reeve, yard), Assert saw(reeve). }
    On failure { If owls(actor) > 2, Increase owls(actor) by 1. If at(reeve, yard), Assert at(reeve, lane). }
  }
}`;
    // What is written below a guard, or by its own change, it reads as it was: the reeve moved only where she was.
    expect(() => new ModuleCompiler().validate(ModuleParser.parse(text))).not.toThrow();
    // What a change above writes, of the same things, it is refused as the act is read, at the act.
    const above = [['If at(reeve, yard), Assert saw(reeve).', 'If saw(reeve), Assert at(reeve, yard).', 'saw'],
      ['If at(reeve, yard), Assert at(reeve, lane).', 'If owls(actor) > 3, Assert saw(actor).', 'owls'],
      ['Assert saw(actor). If at', 'Assert at(reeve, lane). If at', 'at']];
    for (const [was, now, name] of above) {
      for (const read of [(t: string) => ModuleParser.whole(t), (t: string) => ModuleParser.parse(t)]) {
        expect(() => read(text.replace(was!, now!)))
          .toThrow(new RegExp(`^Line 4, col 3: Action peer: its guard .* reads ${name}, which a change above it writes`));
      }
    }
    // Of other things, it is not: another's place, a fact of another's.
    expect(() => ModuleParser.parse(text.replace('Assert saw(actor). If at', 'Assert at(lane, yard). If at'))).not.toThrow();
    // Read through a query, it is refused as the module is checked, at the query's call in the guard.
    const asked = text.replace('If at(reeve, yard), Assert saw(reeve).', 'If rested(actor), Assert at(reeve, yard).');
    for (const module of [ModuleParser.whole(asked), ModuleParser.chunked(asked)!, ModuleParser.parse(asked)]) {
      expect(() => new ModuleCompiler().validate(module))
        .toThrow(/^Line 5, col 40: Action peer: its guard "If rested\(actor\)" reads saw, which a change above it/);
    }
  });
});
