import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';

// The expedition the diagnosis of 30 October chose to repair, walked in by the default company from the bridge-foot
// of Brightbridge in kite, coming home, and played only by what the aims say and the page offers: the empty frame
// says where the bell went; the map sets out for Joygate; in the hold the company is let in by parley, is caught
// with the bell and told so, rings it and the hobs run; the boy untied names his town; home, the bell goes back in
// its frame and the innkeeper who told of it thanks the company; and at Brockfield the boy's mother has him back.
// Nothing in the world is set by hand.
class Walk {
  static async start(): Promise<Journey> {
    const s = await DrawnWorld.start('kite', { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }],
      origin: 'kin' }, NodeBundleSource.shared);
    return Journey.of(s);
  }
  static aims(j: Journey): string[] { return ScreenModel.build(j.campaign).objectives; }
  // Set out as the map does: the way it plans to a place, a leg at a time, each leg one the page offers.
  static async setOut(j: Journey, to: string): Promise<string> {
    const plan = Itineraries.plan(j.campaign, to);
    expect(plan).toBeDefined();
    return j.play(...plan!.legs.map(l => `@go(${l.passage},${l.to})`));
  }
  static told(j: Journey): string { return j.taken.at(-1)!.told; }
}

describe('the bell the hobs took, walked in from the bridge-foot', () => {
  it('goes to Joygate, through the hold, and home with the bell and the boy', async () => {
    const j = await Walk.start();
    await j.step('^To the bridge-foot');
    expect(Walk.aims(j)).toContain('Hobs took a bell from its frame, and hold out at Joygate.');
    await Walk.setOut(j, 'region__w1');
    expect(Walk.aims(j)).toContain('The stolen bell is somewhere in the hobs\' hold at Joygate, where bells hang '
      + 'on the walls with their clappers torn out.');

    // The hold is in the country its approach is in, and its way out is to the place the aims name.
    await j.play('^Call to the hobs for a parley', '>raidersHold__mouth');
    expect(j.screen().path.map(p => p.name)).toContain('Lonecrag');
    expect(j.offers('Out to Joygate')).toBe(true);
    await j.play('>raidersHold__cache', '^Wenna: light a torch', '^a chapel handbell: Take');
    expect(Walk.told(j)).toContain('THIEVES!');
    expect(Walk.told(j)).toContain('nobody here will let you by');
    await j.play('^Ring the bell', '>raidersHold__cavern', '^Ring the bell');
    expect(Walk.told(j)).toContain('The Gaffer screams like a kettle');
    // Out on the hillside they are as the bell left them, not at their dice, their fire or their fleeces (round 7).
    for (const who of ['raidersFolk__gaffer', 'raidersFolk__raiders', 'raidersFolk__watchers']) {
      expect(j.campaign.world.related('state', who).map(r => r.args[1])).toEqual(['raidersFolk__fled']);
    }
    // With every hob gone off, the bell is not offered to be rung where nobody would hear it (round 6, J: "Ring the
    // bell" in every room to no effect; the register's AP-11).
    await j.step('>raidersHold__pit');
    expect(j.offers('Ring the bell')).toBe(false);
    await j.step('^Untie the shepherd');
    expect(Walk.told(j)).toContain('It\'s Brockfield.');
    expect(Walk.aims(j)).toContain('The shepherd\'s boy you untied in the hobs\' pens wants taking home to Brockfield.');
    expect(Walk.aims(j)).toContain('The bell the hobs took belongs back in its frame over the well at Brightbridge.');
    await j.play('^Ask \\w+ to come with you', '>raidersHold__mouth', '>w1');

    await Walk.setOut(j, 'region__s2_green');
    await j.step('^Hang the bell back in its frame');
    expect(Walk.told(j)).toContain('The bell goes up into its frame');
    expect(Walk.aims(j).join(' ')).not.toContain('bell');
    await j.step('>s2_innkeeper');
    expect(j.offers('Ask Aspen about the bell the hobs took')).toBe(false);
    await j.step('^Tell Aspen about the bell the hobs took');
    expect(Walk.told(j)).toContain('will not take your money tonight');

    await Walk.setOut(j, 'region__s4_green');
    expect(j.page).toContain('mother sees him from a doorway and comes running');
    expect(Walk.aims(j).join(' ')).not.toContain('shepherd\'s boy');
  }, 300000);
});
