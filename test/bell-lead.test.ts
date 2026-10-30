import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';

// The start town's own hook leads somewhere (the expedition diagnosis of 30 October, change 1). In kite a company
// coming home to Brightbridge finds the bell gone from its frame at the bridge-foot, and is told there, without a word
// asked, that hobs took it to their hold at Gaudumport: an aim, and somewhere to set out for. At the hold the bells on
// its walls make the aim more particular; the boy in the hobs' pens says whose bell it was and what hobs cannot
// abide, and that is an aim too. Played by the page's own choices, from the default company's start.
class Bell {
  static async start(): Promise<Journey> {
    const s = await DrawnWorld.start('kite', { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }],
      origin: 'kin' }, NodeBundleSource.shared);
    return Journey.of(s);
  }
  static aims(j: Journey): string[] { return ScreenModel.build(j.campaign).objectives; }
}

describe('the bell the hobs took', () => {
  it('is an aim, and Gaudumport somewhere to set out for, from the bridge-foot of Brightbridge', async () => {
    const j = await Bell.start();
    expect(Bell.aims(j).join(' ')).not.toMatch(/[Hh]obs/);
    await j.step('^To the bridge-foot');
    expect(j.taken.at(-1)!.told).toContain('carried it off to their hold at Gaudumport');
    expect(Bell.aims(j)).toContain('Hobs took a bell from its frame, and hold out at Gaudumport.');
    expect(Itineraries.destinations(j.campaign).map(d => d.name)).toContain('Gaudumport');
  }, 120000);
  it('is more particular at the hold, and the boy\'s word on bells is an aim', async () => {
    const j = await Bell.start();
    await j.play('^To the bridge-foot', '>w1');
    expect(Bell.aims(j)).toContain('The stolen bell is somewhere in the hobs\' hold at Gaudumport, where bells hang on '
      + 'the walls with their clappers torn out.');
    expect(Bell.aims(j).join(' ')).not.toContain('Hobs took a bell');
    await j.play('^Call to the hobs for a parley', '>raidersHold__pit', '^Wenna: light a torch', '^Untie the shepherd',
      '^Ask the shepherd\'s boy about the hobs');
    expect(j.taken.at(-1)!.told).toContain('They took the bell out of the frame at Brightbridge');
    expect(Bell.aims(j)).toContain('Hobs cannot abide a bell: rung in their hold at Gaudumport, one would send them '
      + 'running.');
  }, 240000);
});
