import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { WorldAssembler } from '../src/world/world-assembler';
import { Origins } from '../src/world/origins';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// The reference start (mission-22/world/orientation.md §4, step 2): Iscoed, the atlas's salt fen, begins a life already
// in it, one of three, each in its own place with its own people, and from any of them the other two are in the world
// to be taken up: a drover held by the customs-men (an inquiry: testimony that disagrees), a salter's cold pans (a
// practical errand against the clock, then a wage), the last sea-gate (a repair down a dark well, against the tide).
class Iscoed {
  static readonly seed = 'iscoed';
  static async begin(origin: string): Promise<Journey> {
    return Journey.of(await DrawnWorld.start(this.seed, { origin,
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
  }
  static aims(j: Journey): string { return (j.screen().aims ?? []).map(a => a.text).join(' | '); }
}
describe('the reference start, Iscoed', () => {
  it('begins only its own three lives, and every other country the lives it began before', async () => {
    const loaded = await Origins.load(NodeBundleSource.shared);
    const offered = async (seed: string) => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
      return Origins.choices(loaded, w.report.region, w.report.placements, CanonVocabulary.context()).map(o => o.id);
    };
    expect(await offered(Iscoed.seed)).toEqual(['drove', 'pans', 'weir']);
    expect(await offered('a1')).not.toContain('drove');
  }, 120000);
  it('begins each life in its own place, none on the road in, and the other two invitations are met at once',
    async () => {
      const drove = await Iscoed.begin('drove'), pans = await Iscoed.begin('pans'), weir = await Iscoed.begin('weir');
      const starts = [drove, pans, weir].map(j => j.screen().place.id);
      expect(new Set(starts).size).toBe(3);
      for (const id of starts) { expect(id).not.toMatch(/_approach$/); }
      expect(Iscoed.aims(drove)).toMatch(/Ask Owain how many head came down/);
      expect(Iscoed.aims(pans)).toMatch(/fuel boat/);
      expect(Iscoed.aims(weir)).toMatch(/sea-gate .* will not shut/);
      // Met at once as leads, each with who to ask, not as aims held (HP-01): the drove holds its own errand alone.
      await drove.play('Wait a while');
      const held = Iscoed.aims(drove);
      expect(held).toMatch(/how many head came down/);
      for (const aim of [/fuel boat/, /sea-gate/]) { expect(held).not.toMatch(aim); }
      const leads = (drove.screen().leads ?? []).map(l => `${l.text} (${l.ask.join(', ')})`).join(' | ');
      for (const lead of [/chimney.*\(Holgar/, /sea-gate.*\(Reeve Annis Talfryn\)/]) { expect(leads).toMatch(lead); }
    }, 180000);
  it('frees the drover by what the drove itself shows: the four drowned in the rhyne, against the clerk\'s count',
    async () => {
      const j = await Iscoed.begin('drove');
      await j.play('Ask Owain how many head came down', 'To the drove pens', 'To the Black Rhyne', 'Search');
      expect(Iscoed.aims(j)).toMatch(/Tell the customs clerk what you found/);
      await j.play('To the drove pens', 'To the landing', 'To the customs-house', 'Tell Mardle where the four bullocks are');
      expect(j.latest).toMatch(/Let him out/);
      expect(Iscoed.aims(j)).not.toMatch(/Bran/);
    }, 180000);
  it('lights the cold pans by poling the fuel boat down, and then pays a shift\'s wage', async () => {
    const j = await Iscoed.begin('pans');
    j.roll('pass');
    const fuel = /at (\w+): the salt-pans/.exec(Iscoed.aims(j))![1]!;
    await j.play(`map:${fuel}`, `?map:${fuel}`, `?map:${fuel}`, 'To the staithe', 'Ask Ianto about the fuel boat',
      'Pole Ianto\'s fuel boat down the cut');
    // Down the cut by the company's own journey, walked on the map (TR-20), not by the act.
    await j.play('map:Porthalen', '?map:Porthalen', '?map:Porthalen', 'To Holgar\'s salt-house',
      'Tell Holgar the fuel boat is at the quay');
    expect(j.latest).toMatch(/The whole load/);
    await j.play('Ask Holgar for your week\'s wage', 'To the boiling-house', 'Work a shift at the pans');
    expect(j.latest).toMatch(/three coin into your hand/);
  }, 180000);
  it('shuts the sea-gate with the pawl brought up out of the dark well, and finds it was sawn loose', async () => {
    const j = await Iscoed.begin('weir');
    j.roll('pass');
    await j.play('To the sea-bank', 'To the Wardens\' gatehouse', 'Search');
    expect(Iscoed.aims(j)).toMatch(/lost pawl/);
    await j.play('Pack › A torch › Light', 'To the gate-well', 'Search', 'Take', 'To the Wardens\' gatehouse');
    expect(j.latest).toMatch(/sawn through/);
    await j.play('Set the pawl in its socket and wind the sea-gate shut');
    expect(Iscoed.aims(j)).toMatch(/Tell the reeve/);
  }, 180000);
});
