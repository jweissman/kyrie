import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { ScreenModel } from '../../src/ui/screen-model';
import { ModuleWriter } from '../../src/lang/module-writer';

// The rats under the corn-store, two ways (M21's FF-04 and FF-06, in the laboratory): by force, the hasp wrenched
// and the rats fought; by craft, the key asked for and the rats laid with ratsbane. Both are paid, and the merchant
// remembers which: a door torn open is docked from the pay, or set back and forgiven; ratsbane is smelt on the one
// who laid it. And the torn door is the next thing asked, in the merchant's words.
class Lab {
  static async as(build: string) {
    const { journey } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', build]));
    return journey;
  }
  static gold(j: Awaited<ReturnType<typeof Lab.as>>): number {
    return j.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
  }
  static holds(j: Awaited<ReturnType<typeof Lab.as>>, name: string, ...args: string[]): boolean {
    return j.campaign.world.test(ModuleWriter.call(`lab__low_u_${name}`, ...args.map(a => `lab__low_u_${a}`)));
  }
}
const down = ['corn-store cellar', ': light a', 'rat-runs'];
const back = ['rat-runs', 'corn-store cellar', 'old corn-store', 'landing at Lowmouth', "Mik's salt-house"];

describe('the rats under the corn-store', () => {
  it('by force: the hasp wrenched, the rats fought, the door docked from the pay, and the door the next thing asked', async () => {
    const j = await Lab.as('human/warrior/Brann');
    await j.play('wrench the padlock', 'old corn-store', ...down, '^Attack', 'To the nest', '^Attack');
    await j.play(...back);
    const told = await j.play('Tell Mik the rats under the corn-store are dead, nest and all');
    expect(told).toMatch(/For my door/);
    expect(Lab.holds(j, 'docked', 'store_lock')).toBe(true);
    expect(Lab.gold(j)).toBe(6 + 10 - 2);
  }, 60000);
  it('by craft: the key, ratsbane laid, the nest burned, paid whole and the ratsbane smelt', async () => {
    const j = await Lab.as('human/thief/Haze');
    await j.play("Mik's salt-house", 'Ask Mik about the rats', 'ratsbane', 'oil firebomb');
    await j.play('landing at Lowmouth', 'old corn-store', 'corn-store cellar', ': light a', 'Lay ratsbane');
    await j.play('Until dark', 'Wait');
    expect(Lab.holds(j, 'done', 'rats_job')).toBe(true);
    await j.play('?To the rat-runs', 'Throw an oil firebomb');
    await j.play(...back.slice(1));
    const told = await j.play('Tell Mik the rats under the corn-store are dead, nest and all');
    expect(told).toMatch(/Ratsbane/);
    expect(Lab.holds(j, 'docked', 'store_lock')).toBe(false);
  }, 60000);
  it('asks for the torn door back, in the merchant\'s words, having been seen to find it', async () => {
    const j = await Lab.as('human/warrior/Brann');
    // What Mik does is seen first (FF-05): out at the door with the torn hasp, then the word of it.
    await j.play('wrench the padlock', 'old corn-store');
    expect(await j.play('landing at Lowmouth')).toMatch(/turning the torn hasp over/);
    expect(await j.play("Mik's salt-house")).toMatch(/I'll know them by the splinters/);
    expect(ScreenModel.build(j.campaign).objectives.join(' ')).toMatch(/know you by the splinters/);
  }, 60000);
});
