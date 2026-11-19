import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { OfficeLint } from '../src/cli/office-lint';

// The offices of a drawn world's towns (`kyrie lint --world`; the owner, 19 November: "Porthalen has two reeves,
// Aldous Fenn and the drove's Annis Talfryn"): who holds one is read from their title, their role or their id, and
// two holders of one office in one town is a warning (it may be meant), each said where it is written.
describe('the office lint', () => {
  it('reads an office from a title, a role or an id, and not from a kinsman or a former holder', () => {
    const office = (id: string, name: string) => OfficeLint.office({ id, name, type: 'group' })?.office;
    expect(office('gate__reeve', 'Reeve Annis Talfryn, the reeve of Iscoed')).toBe('reeve');
    expect(office('region__s1_fenn', 'Aldous Fenn, reeve of the wood-wardens, who license the cutting')).toBe('reeve');
    expect(office('region__s1_reeve', 'Aldous Fenn, a man of the green')).toBe('reeve');
    expect(office('region__s1_daughter', "Bet Fenn, the reeve's daughter")).toBeUndefined();
    expect(office('region__s1_old', 'Old Hob, once reeve here')).toBeUndefined();
  });
  it('finds Porthalen\'s two reeves in iscoed, each at its line, as a warning', async () => {
    const [findings] = Object.values(await KyrLint.worlds(['iscoed']));
    const offices = findings!.filter(f => f.check === 'office');
    expect(offices.map(f => f.level)).toEqual(['warning']);
    expect(offices[0]!.message).toStartWith('Porthalen (region__s1) has 2 holding the office of reeve');
    expect(offices[0]!.message).toContain('"Aldous Fenn" ("reeve of the wood-wardens")');
    expect(offices[0]!.message).toContain('by data/generation/town/outskirts-deep.kyrt:141');
    // At the line that declares her, wherever the gate's file has it now (it had moved under the reeve at the gate).
    const gate = 'data/goings-on/iscoed-gate/situation.kyr';
    const line = readFileSync(gate, 'utf8').split('\n').findIndex(l => /^\s*Person reeve\b/.test(l)) + 1;
    expect(offices[0]!.message).toContain(`"Reeve Annis Talfryn" (titled "Reeve Annis Talfryn"), ${gate}:${line}`);
  }, 120000);
});
