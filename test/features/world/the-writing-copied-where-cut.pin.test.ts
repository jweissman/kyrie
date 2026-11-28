import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter, type Change } from '../../../src/lang/index';
import { DeepPurposes } from '../../../src/world/deep/deep-purposes';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The writing copied where it is cut (cold
// round C3, 28 November, OR-1856): the brothers' errand had been split over two places and two orders. The old writing
// was read at the stair under the fallen stones, and "Copy the old writing" was offered again further in, at the adit
// mouth with wolves coming; and the aim of what the makers feared below said to find it "before you go down", while
// the errand's place was down the stair. Now the writing is read and copied at the one place it is cut, and the aim
// says the jar is found on the way down, after the stair.
const copy = /^Copy the old writing/;
describe('World › The writing copied where it is cut', () => {
  it('is copied at the stair where it is read, and not offered further in', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none', '--origin', 'order']));
    const c = j.session.campaign;
    const w = c as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    // Put where the way goes, by light: a test of where the copying is offered, not of the walk there.
    const put = (to: string) => w.commit(w.world.apply([
      { kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', to) },
      { kind: 'retract', call: ModuleWriter.call('unlit', to) }]));
    const aims = () => ((new Runner(j.session).said('look') as Said).aims ?? []).map(a => a.text).join(' ');
    const offered = () => j.choices().some(x => copy.test(x.label));
    await j.play('^Give .* the brothers');
    put('region__s1_ud');
    expect(aims()).toMatch(/old writing at the stair under the fallen stones/);
    expect(offered()).toBe(false);
    await j.play('^Read the marks on the');
    expect(offered()).toBe(true);
    // Further in, the barrow's mouth: the writing is not there, and the aim sends the company back to where it is.
    put('region__s1_ud_barrow_mouth');
    expect(offered()).toBe(false);
    expect(aims()).toMatch(/You have read the old writing at the stair under the fallen stones\. .* set it down there/);
    put('region__s1_ud');
    await j.play(copy.source);
    expect(aims()).toMatch(/You have read and set down the old writing at the stair under the fallen stones\./);
  }, 30000);
  it('says of what the makers feared below that it is found on the way down, after the way in', () => {
    const said = Object.values(DeepPurposes.all).flatMap(p => p.bane?.aim ? [p.bane.aim] : []);
    expect(said.length).toBe(Object.keys(DeepPurposes.all).length);
    expect(said.filter(a => !/, on the way down to [^,]+\.$/.test(a))).toEqual([]);
  });
});
