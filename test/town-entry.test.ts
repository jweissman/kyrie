import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Undertakings } from '../src/presentation/undertakings';

// In a town's own country, the way into the town is led with, by name (the owner, 11 November late: in the hex of a
// town the page had led toward a far aim and to look out over the country, and the town at hand was found only under
// Go…). A way about a settlement not yet taken had been worth leading with only inside one; in open country the row
// of ways is the compass. It carries what the company knows of the town from here (not been there; someone who might
// join, one place off), never who is within or what they would ask; and the aim's own step keeps its gold.
describe('a town at hand', () => {
  it('is entered by name from its own country, with only what is perceived of it', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'Ralf', raceId: 'human',
      classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    const at = (place: string) => {
      c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
        { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
      // The debt followed where the company stands, as the player chooses it: nothing is followed for them (the
      // owner, 12 November), and put here by hand, no command carries it on into the debt's next part.
      Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
      return Narrator.leaf(c, ScreenModel.build(c)).glance!;
    };
    const elmham = at('region__t205'), entry = elmham.acts.find(a => a.enters)!;
    expect(entry.label).toBe('Enter Elmham');
    expect(entry.command).toMatch(/^go\([^,]+,region__s3_green\)$/);
    expect(entry.aspects).toContain('exploration');
    expect(entry.aspects.every(a => ['exploration', 'companionship', 'undertaking'].includes(a))).toBe(true);
    expect(elmham.acts.find(a => a.continues)?.aspects).toContain('undertaking');
    expect(elmham.acts.indexOf(entry)).toBeLessThan(elmham.acts.findIndex(a => a.why === 'own'));
    // Not where the company is in the town already, nor across a hex.
    expect(at('region__s3_green').acts.some(a => a.enters)).toBe(false);
    expect(at('region__t206').acts.some(a => a.enters)).toBe(false);
  }, 120000);
});
