import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';
import { HonestPlayer } from '../../support/honest-player';
import { ReferenceSettlement } from '../../../src/world/reference-settlement';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The start is the dungeon (the owner, 26
// November: "I still feel like we're being sent on random pointless fetchquests that don't have meaningful combat or
// resistance; that the world is still too full (ideally in the starting area, I'd like the First Town and the Big
// Dungeon and not much else around at all; at least one companion in the Dungeon)"; register OR-1074, OR-1075). A new
// life come over the hills to the reference game's town, following only the page's gold: work is asked after at the
// house of the one who buys what the woods give, and it is the woods; the shrine-keeper, asked what lies under the
// fallen stones, tests what the company says was cut on them, and sends it up to look; told then, the way down is
// taken, with someone on the ledge who would come down with the company for a fee, and below, a fight. Nowhere but the
// town, its woods and the deep place under them is gone to.
type Row = { label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(x => [x, ...flat(x.opens ?? [])]);
describe('World › The start is the dungeon', () => {
  it('leads a new life from the town to the shrine, the stones and down into resistance, and nowhere else', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none', '--origin', 'wanderer']));
    const s = journey.session, c = s.campaign, h = new HonestPlayer(s), r = new Runner(s);
    const been = new Set<string>();
    // Poor to start (OR-1081): the purse does not buy the store's gear and the ledge's hire together.
    const purse = r.said('look').purse?.coin ?? 0;
    const store = ReferenceSettlement.provisions.concat(ReferenceSettlement.arms).reduce((t, [, fee]) => t + fee, 0);
    expect(purse).toBeLessThan(store / 4);
    let fights = 0, ledge: string[] = [];
    for (let i = 0; i < 70 && c.running && fights === 0; i++) {
      const at = c.world.one('at', 'party') ?? '';
      been.add(at);
      if (at === 'region__s1_ud' && !ledge.length) {
        const said = r.said('look');
        const offered = [...said.offer.primary, ...said.offer.rest, ...Object.values(said.offer.lenses ?? {}).flat()];
        ledge = flat(offered as Row[]).map(x => x.label);
      }
      if (!await h.step()) { break; }
      fights = c.history.filter(e => e.combat.some(x => x.type === 'initiative')).length;
    }
    // The town's three, its woods, and the deep place under them: nothing else in the country.
    expect([...been].filter(p => !/^region__s1_(approach|green|taproom|shop|shrine|wood|ud)/.test(p))).toEqual([]);
    expect(been.has('region__s1_shrine') && been.has('region__s1_wood_stones')).toBe(true);
    expect([...been].some(p => p.startsWith('region__s1_ud_'))).toBe(true);
    // Someone on the ledge, inside, to take on for a fee, and talked to there.
    const waiting = c.module.entities.find(e => e.id === 'region__s1_ud_waiting')!;
    expect(c.world.one('at', waiting.id)).toBe('region__s1_ud');
    expect(c.world.number({ kind: 'call', name: 'hire', args: [waiting.id] })).toBeGreaterThan(0);
    expect(ledge.some(l => l.includes(waiting.name.split(', ')[0]!))).toBe(true);
    expect(fights).toBeGreaterThan(0);
  });
});
