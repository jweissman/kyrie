import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ModuleWriter } from '../src/lang/module-writer';

// The cold pans given a second claim on the boat (Sprint 2, S2-7; mission-22/story-sheets.md, the cold pans' sheet):
// Ffion Wyn's pans stand cold beside the salter's, and the boat has always gone to the bigger man. Told of her, the
// company that poles the boat down may give her a third: two chimneys smoke, the salter pays ten and not fifteen, and
// Ffion pays four for her third. Given all to the salter, her pans stay cold and her rakers go up the river road.
class Pans {
  static async begin(): Promise<Journey> {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'pans',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    j.roll('pass');
    return j;
  }
  static coin(j: Journey): number { return j.session.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  // To Ffion on the landing, and down to the staithe to pole the boat down the cut.
  static async poled(j: Journey) {
    await j.play('To the landing at Porthalen', 'Talk to Ffion Wyn', 'Ask Ffion about her pans');
    expect(j.latest).toMatch(/a third of that load/);
    const fuel = /at (\w+): the salt-pans/.exec((j.screen().aims ?? []).map(a => a.text).join(' | '))![1]!;
    await j.play(`map:${fuel}`, `?map:${fuel}`, `?map:${fuel}`, 'To the staithe');
    // Who is here is said by what their role names, filled in: "the fuel boatman of Reedbridge", not "of {region__s5}".
    expect(j.latest).toMatch(new RegExp(`Ianto, the fuel boatman of ${fuel}`));
    expect(JSON.stringify(j.screen().people)).not.toMatch(/\{region/);
    // Poled off the staithe, the boat comes down the cut with the company's own journey to the town, on the map
    // (TR-20: the act had put the company in the boiling-house, hexes off, with no journey).
    await j.play('Ask Ianto about the fuel boat', 'Pole Ianto\'s fuel boat down the cut');
    await j.play('map:Porthalen', '?map:Porthalen', '?map:Porthalen', 'To Holgar\'s salt-house');
  }
}
describe('the cold pans, with Ffion\'s beside them', () => {
  it('shares the boat: two chimneys, the salter\'s ten coin and Ffion\'s four', async () => {
    const j = await Pans.begin();
    await Pans.poled(j);
    const before = Pans.coin(j);
    await j.play('Tell Holgar the fuel boat is at the quay, and that a third of it is Ffion\'s');
    expect(j.latest).toMatch(/You.re free with my fuel/);
    // The milestone says the salter's name, not his id (ObservationText, as all authored text is).
    expect(j.latest).toMatch(/kept Holgar.s pans burning/);
    expect(Pans.coin(j)).toBe(before + 10);
    await j.play('To the landing at Porthalen');
    expect(j.latest).toMatch(/two chimneys are smoking/);
    await j.play('Talk to Ffion Wyn', 'Ask Ffion how her pans go');
    expect(j.latest).toMatch(/For the third/);
    expect(Pans.coin(j)).toBe(before + 14);
  }, 240000);
  it('gives the salter the whole load, and Ffion\'s pans stay cold', async () => {
    const j = await Pans.begin();
    await Pans.poled(j);
    await j.play('Tell Holgar the fuel boat is at the quay');
    expect(j.latest).toMatch(/The whole load/);
    await j.play('To the landing at Porthalen');
    expect(j.latest).toMatch(/nobody stands at Ffion.s door/);
    await j.play('Talk to Ffion Wyn', 'Ask Ffion how her pans go');
    expect(j.latest).toMatch(/gone up the river road/);
  }, 240000);
});
