import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';

// The cold pans tied to the sea-gate's cut and to the reeve's tally (ST-04; mission-22/story-sheets.md, the cold pans'
// sheet): nobody at the staithe takes the boat through because Ifan Rhys has told them not to; with the sea-gate shut
// the cut runs out clean and the boat comes down without a check; poled down it by day, Gatesend's eel-men saw; and
// which pans burned is a line the reeve writes into her tally before it goes north.
class Cut {
  static async begin(): Promise<Journey> {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'pans',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    j.roll('pass');
    return j;
  }
  static knows(j: Journey, fact: string) {
    const c = j.session.campaign;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', fact) }]));
  }
  static holds(j: Journey, call: string, ...args: string[]): boolean {
    return j.session.campaign.world.test(ModuleWriter.call(call, ...args));
  }
  // Down to the staithe at the fuel village, and Ianto asked about his boat.
  static async staithe(j: Journey): Promise<string> {
    await j.play('To the landing at Porthalen');
    const fuel = /at (\w+): the salt-pans/.exec((j.screen().aims ?? []).map(a => a.text).join(' | '))![1]!;
    await j.play(`map:${fuel}`, `?map:${fuel}`, `?map:${fuel}`, 'To the staithe', 'Ask Ianto about the fuel boat');
    return fuel;
  }
}
describe('the cold pans and the sea-gate\'s cut', () => {
  it('names who keeps the cut, and brings the boat down clean once the gate is shut', async () => {
    const open = await Cut.begin();
    await Cut.staithe(open);
    await open.play('Ask Ianto why nobody will take her through the cut');
    expect(open.latest).toMatch(/Ifan Rhys came up this staithe/);
    const shut = await Cut.begin();
    Cut.knows(shut, 'pans__cut_clear');
    await Cut.staithe(shut);
    await shut.play('Ask Ianto why nobody will take her through the cut');
    expect(shut.latest).toMatch(/she.ll go down clean at the ebb/);
    // No check to fail: the sea is off the cut.
    shut.roll('fail');
    await shut.play('Pole Ianto\'s fuel boat down the cut');
    expect(shut.latest).toMatch(/she does not ground once/);
    // The act leaves the company at the staithe with the boat afloat: down the cut is the company's own journey, on
    // the map (TR-20), and the dice its own again past the staithe.
    expect(Cut.holds(shut, 'pans__afloat', 'party')).toBe(true);
    expect(Cut.holds(shut, 'knows', 'party', 'pans__poled')).toBe(true);
    shut.roll('pass');
    // And on the eel-men's water by day, seen: Ifan says so at his door, by the cut on the way down.
    await shut.play('map:Gatesend', '?map:Gatesend', '?map:Gatesend', '?map:Gatesend');
    expect(shut.latest).toMatch(/You poled Ianto.s boat down our cut in broad day/);
    // Come down to the town, the boat is at the quay.
    await shut.play('map:Porthalen', '?map:Porthalen', '?map:Porthalen');
    expect(Cut.holds(shut, 'pans__carted', 'party')).toBe(true);
  }, 240000);
  it('has the salt written into the reeve\'s tally, by whichever pans burned', async () => {
    const j = await Cut.begin();
    await Cut.staithe(j);
    // The act takes the boat off the staithe and leaves the company where it stands: the town is a journey, walked on
    // the map (TR-20, the owner, 19 November: "I got from my quest destination back to town without the map").
    const staithe = j.session.campaign.world.one('at', 'party');
    await j.play('Pole Ianto\'s fuel boat down the cut');
    expect(j.session.campaign.world.one('at', 'party')).toBe(staithe);
    expect(Cut.holds(j, 'pans__afloat', 'party')).toBe(true);
    await j.play('map:Porthalen', '?map:Porthalen', '?map:Porthalen');
    expect(j.latest).toMatch(/noses into Porthalen.s quay/);
    await j.play('To Holgar\'s salt-house', 'Tell Holgar the fuel boat is at the quay');
    expect(Cut.holds(j, 'knows', 'party', 'pans__salt_whole')).toBe(true);
    const c = j.session.campaign;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('gate__mended', 'party') }]));
    await j.play('To the landing at Porthalen', 'Talk to Reeve Annis Talfryn',
      'Tell the reeve the sea-gate at Gatesend shuts');
    expect(j.latest).toMatch(/Salt of Porthalen: one salter.s pans, a month.s boiling; Ffion Wyn.s, none/);
  }, 240000);
});
