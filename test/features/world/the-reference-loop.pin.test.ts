import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ScreenModel } from '../../../src/ui/screen-model';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The reference loop (the owner, 25 November:
// doc/design/direction-2026-11-25-reference-game.md §1, "one tiny settlement → one nearby wilderness → discoverable
// dungeon entrances → repeated descents → retreat and recovery → another descent"; register OR-611). Kite's Newmeet,
// the first town of a forest country, made the reference game's settlement: buy a light and a ration from the store,
// ask the herb-wife about the old woods and take on the soldier at her fire, go up into the woods, find woundwort on
// the old ride and, by searching the burners' clearing and then the fallen stones, the way down; take what the last
// party left on the ledge, go down into the first level and fight what is there, come out, rest at the shrine, sell
// what was gathered, and go down again, to find the first level as it was left. Every act by the rows the runner
// offers, ways by where they go and acts by their words; it fails on a first town that is not the reference game's
// (the woods, the way down among the stones, the three working places are none of them there).
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
describe('World › The reference loop', () => {
  it('trades with both traders, finds the way down in the old woods, descends, retreats, recovers, sells and descends again', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'kite', '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    let s = r.said('look');
    const P = (x: string) => `region__s1_${x}`, at = () => c.world.one('at', 'party');
    const coin = () => s.purse?.coin ?? NaN;
    const say = async (id: string) => {
      const said = await r.ask(JSON.stringify({ act: id }));
      expect([id, 'error' in said ? said.error : '']).toEqual([id, '']);
      s = said as Said;
      for (let i = 0; i < 40 && s.moment === 'fight' && !s.end; i++) {
        s = await r.ask(JSON.stringify({ act: RunnerFight.through })) as Said;
      }
    };
    const to = (place: string) => say(`exit:${P(place)}`);
    const act = async (words: string) => {
      const found = rows(s).find(x => new RegExp(words, 'i').test(x.label));
      expect([words, found?.label]).toEqual([words, expect.any(String)]);
      await say(found!.id);
    };
    const dealer = c.module.entities.find(e => e.id === P('innkeeper'))!.name.split(', ')[0]!;
    // The settlement: three working places off its heart, and the woods.
    await to('green');
    expect(['shop', 'taproom', 'shrine', 'wood_edge'].every(p => rows(s).some(x => x.id === `exit:${P(p)}`))).toBe(true);
    // Trader 1: a light and a ration, paid for.
    const purse = coin();
    await to('shop'); await act('^Buy a torch'); await act('^Buy one ration');
    expect(coin()).toBe(purse - 3);
    // Trader 2: the woods asked about, and someone at the fire taken on.
    await to('green'); await to('taproom');
    await act(`^Talk to ${dealer}`); await act('about the old woods');
    expect(s.scene.lines.join(' ')).toMatch(/Have you been into the old woods\?/);
    await act('^Talk to .*come along'); await act('to join the company');
    expect(c.readout.partyIds.length).toBe(2);
    // The woods: woundwort on the ride, the way to the stones from the burners' clearing, the way down at the stones.
    await to('green'); await to('wood_edge'); await to('wood_ride');
    await act('^Search here'); await act('^Collect a stand of woundwort');
    await to('wood_burners');
    expect(rows(s).some(x => x.id === `exit:${P('wood_stones')}`)).toBe(true);
    await act('^Search here'); await to('wood_stones');
    expect(rows(s).some(x => x.id === `exit:${P('ud')}`)).toBe(false);
    await act('^Search here');
    await act('^Light a torch'); await to('ud');
    expect(s.scene.lines.join(' ')).toMatch(/older than the woods above it/);
    // The ledge: what the last party left. Then the first level, and what holds it.
    await act('^Search here'); await act('^Collect a hooded lantern');
    await to('ud_barrow_mouth'); await to('ud_barrow_passage');
    await act('^Search here'); await act('^To the light-box'); await act('^Attack the rats');
    expect(rows(s).some(x => /^Attack the rats/.test(x.label))).toBe(false);
    // Retreat: out, the whole way, as one act; then the shrine, to rest.
    await act(`^Out to ${c.module.entities.find(e => e.id === P('green'))!.name}`);
    expect(at()).toBe(P('green'));
    await to('shrine'); await act('^Take a pallet|^Rest six hours');
    expect(ScreenModel.build(c).party.every(m => m.hp === m.maxHp)).toBe(true);
    // What the woods gave is sold where the woods' things are bought.
    const before = coin();
    await to('green'); await to('taproom'); await act(`^Talk to ${dealer}`); await act('^Sell .*woundwort');
    expect(coin()).toBeGreaterThan(before);
    // And down again: the ways found are still known, and the first level is as it was left.
    await to('green'); await to('wood_edge'); await to('wood_ride'); await to('wood_burners'); await to('wood_stones');
    await to('ud'); await to('ud_barrow_mouth'); await to('ud_barrow_passage'); await act('^To the light-box');
    expect(rows(s).some(x => /^Attack the rats/.test(x.label))).toBe(false);
  }, 600000);
});
