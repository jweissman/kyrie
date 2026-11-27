import { describe, expect, it } from 'bun:test';
import { KeptReading, ModuleParser, ModuleWriter, World } from '../../src/lang/index';

// A fact taken away and put back is listed after every fact its relation held all along, and so may change what a
// reading of the relation in order found first. Only such a fact is held to have changed, as one written: a reading
// that picked none of it holds (a door's state set back had made every reading of any thing's state stale, the
// chart's, the quarters' and the ways', after a fight or a search: 27 November, the warrior's golden walk), and one
// that picked it, or read the relation whole, is read again.
const m = ModuleParser.parse(`Module k "K" { Kind thing. Relation at(thing, thing). Relation state(thing, thing).
  Entity reeve: thing "the reeve". Entity miller: thing "the miller". Entity green: thing "the green".
  Entity door: thing "the door". Entity lamp: thing "the lamp". Entity shut: thing "shut". Entity lit: thing "lit".
  Initially Assert at(reeve, green). Initially Assert at(miller, green).
  Initially Assert state(door, shut). Initially Assert state(lamp, lit). }`);
const call = ModuleWriter.call;
class PutBack {
  static readonly w0 = new World(m).apply(m.initial);
  // The world in which this fact was taken away and then put back, a world apart.
  static of(name: string, ...args: string[]): World {
    return this.w0.apply([{ kind: 'retract', call: call(name, ...args) }])
      .apply([{ kind: 'assert', call: call(name, ...args) }]);
  }
}
describe('a fact taken away and put back', () => {
  it('leaves a reading that picked none of it as it was', () => {
    const door = KeptReading.read(PutBack.w0, () => PutBack.w0.one('state', 'door')).kept!;
    expect(PutBack.w0.related('state').map(r => r.args[0])).toEqual(['door', 'lamp']);
    const w1 = PutBack.of('state', 'door', 'shut');
    expect(w1.related('state').map(r => r.args[0])).toEqual(['lamp', 'door']);
    const lamp = KeptReading.read(PutBack.w0, () => PutBack.w0.one('state', 'lamp')).kept!;
    expect(KeptReading.holds(w1, lamp)).toBe(true);
    expect(KeptReading.holds(w1, door)).toBe(false);
  });
  it('is read again by a reading of facts it is among, whose order it changed', () => {
    const w0 = PutBack.w0, here = KeptReading.read(w0, () => w0.relatedTo('at', 'green').map(r => r.args[0])).kept!;
    expect(here.value).toEqual(['reeve', 'miller']);
    const w1 = PutBack.of('at', 'reeve', 'green');
    expect(w1.relatedTo('at', 'green').map(r => r.args[0])).toEqual(['miller', 'reeve']);
    expect(KeptReading.holds(w1, here)).toBe(false);
  });
  it('is read again by a reading of its whole relation', () => {
    const w0 = PutBack.w0, all = KeptReading.read(w0, () => w0.related('state').map(r => r.args[0])).kept!;
    expect(KeptReading.holds(PutBack.of('state', 'lamp', 'lit'), all)).toBe(false);
    expect(KeptReading.holds(PutBack.of('state', 'door', 'shut'), all)).toBe(false);
  });
});
