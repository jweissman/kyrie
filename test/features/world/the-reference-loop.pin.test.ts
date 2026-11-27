import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ScreenModel } from '../../../src/ui/screen-model';
import { TalkWay } from '../../support/talk-way';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The reference loop (the owner, 25 November:
// doc/design/direction-2026-11-25-reference-game.md §1, "one tiny settlement → one nearby wilderness → discoverable
// dungeon entrances → repeated descents → retreat and recovery → another descent"; register OR-611). The forest world
// s0's Oakhythe, the first town of a forest country, made the reference game's settlement: buy a light and a ration
// from the store, ask the herb-wife about the old woods and take on the soldier at her fire, go up into the woods, find
// woundwort on the old ride and, by searching the burners' clearing and then the fallen stones, the way down; take what
// the last party left on the ledge, go down into the first level and fight what is there, come out, rest at the shrine,
// sell what was gathered, and after a night go down again, to find the first level as it was left and something new in
// it. A rope left in the halls' dead-shaft on the second trip, the third begins there from the way in, in one act,
// where the first two walked the whole first level; a rope in the king's chimney, and the next goes straight to the
// third level (the delver's way down, the cold play's D1: test/features/world/the-way-down.pin.test.ts). Every act
// by the rows the runner offers, ways by where they go and acts by their words; it fails on a first town
// that is not the reference game's (the woods, the way down among the stones, the three working places are none of them
// there).
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
describe('World › The reference loop', () => {
  it('trades with both traders, finds the way down in the old woods, descends, retreats, recovers, sells and descends again', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    let s = r.said('look');
    const P = (x: string) => `region__s1_${x}`, at = () => c.world.one('at', 'party');
    const coin = () => s.purse?.coin ?? NaN;
    let moves = 0;
    const say = async (id: string) => {
      moves++;
      const said = await r.ask(JSON.stringify({ act: id }));
      expect([id, 'error' in said ? said.error : '']).toEqual([id, '']);
      s = said as Said;
      for (let i = 0; i < 40 && s.moment === 'fight' && !s.end; i++) {
        s = await r.ask(JSON.stringify({ act: RunnerFight.through })) as Said;
      }
    };
    const to = (place: string) => say(`exit:${P(place)}`);
    const act = async (words: string) => {
      // Found as the page's player finds it, a talk open (TalkWay, OR-1451).
      const way = await TalkWay.find(r, s, x => new RegExp(words, 'i').test(x.label)), found = way.o;
      s = way.said;
      if (!found) { throw new Error(`${words} at ${at()} not among ways ${rows(s).filter(x => /^(exit|travel)/.test(x.id)).map(x => x.id).join(' ')}; ${rows(s).map(x => x.label).join(' | ')}`); }
      await say(found.id);
    };
    const maybe = async (words: string) => {
      const way = await TalkWay.find(r, s, x => new RegExp(words, 'i').test(x.label)), found = way.o;
      s = way.said;
      if (found) { await say(found.id); }
      return !!found;
    };
    // A light kept going: a torch gutters out every few rooms.
    const lit = async () => {
      if (/pitch dark|gutters out|burns down/.test(s.scene.lines.join(' '))) { await maybe('light a torch|light a candle'); }
    };
    // The first level's way to its back-stone: the rune on it read and sprung with the pole, the first time.
    const down = async () => {
      await to('ud_barrow_mouth'); await to('ud_barrow_passage'); await lit();
      await maybe('^Look closely at the glowing rune'); await maybe('pole'); await lit();
      await to('ud_barrow_chamber'); await lit(); await to('ud_barrow_back_stone'); await lit();
    };
    const dealer = c.module.entities.find(e => e.id === P('innkeeper'))!.name.split(', ')[0]!;
    // The store's wares are bought within its keeper's talk (OR-801: a trader's wares are the trader's), opened by
    // whatever she is first asked; the way out of the store leaves the talk.
    const keeper = c.module.entities.find(e => e.id === P('merchant'))!.name.split(', ')[0]!;
    const store = async () => { await to('shop'); await act(`^(Talk to|Ask) ${keeper}`); };
    // Someone's talk is opened by its row, the bare talk or the question it is led with, titled short (OR-802:
    // "Finnan: what is out in the country round"), which asks it and stays in the talk.
    // Or, where a life's aim leads to them (come over the hills, the work is asked after: OR-1075), the talk led with
    // that question ("Ask Finnan"), which it asks.
    const talk = (who: string) => act(`^(Talk to ${who}\\b|${who}: |Ask ${who}$)`);
    // The settlement: three working places off its heart, and the woods.
    await to('green');
    expect(['shop', 'taproom', 'shrine', 'wood_edge'].every(p => rows(s).some(x => x.id === `exit:${P(p)}`))).toBe(true);
    // Trader 1: a light and a ration, paid for.
    const purse = coin();
    await store(); await act('^Buy a torch'); await act('^Buy one ration');
    expect(coin()).toBe(purse - 3);
    // Trader 2: the woods asked about, and someone at the fire taken on.
    await to('green'); await to('taproom');
    await talk(dealer); await maybe('about the old woods');
    expect(s.scene.lines.join(' ')).toMatch(/Have you been into the old woods\?/);
    await act('^(Talk to .*come along|.*: whether .* would come along)'); await act('to join the company');
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
    await down(); await act('^Attack the');
    expect(rows(s).some(x => /^Attack the/.test(x.label))).toBe(false);
    // Retreat: out, the whole way, as one act; then the shrine, to rest.
    await act(`^Out to ${c.module.entities.find(e => e.id === P('green'))!.name}`);
    expect(at()).toBe(P('green'));
    await to('shrine'); await act('^Take a pallet|^Rest six hours');
    expect(ScreenModel.build(c).party.every(m => m.hp === m.maxHp)).toBe(true);
    // What the woods gave is sold where the woods' things are bought.
    const before = coin();
    await to('green'); await to('taproom'); await talk(dealer); await act('^Sell .*woundwort');
    expect(coin()).toBeGreaterThan(before);
    // The second trip prepared for: the shrine-keeper, asked what lies past the first level, says what the second
    // wants (bones turn a blade; the wrapped dead burn: WoodsCounsel, from what lives there), and the store sells it.
    const priest = c.module.entities.find(e => e.id === P('priest'))!.name.split(', ')[0]!;
    const heart = c.module.entities.find(e => e.id === P('green'))!.name;
    await to('green'); await to('shrine'); await talk(priest); await act('what lies past the passage-grave');
    // In either order (the halls' dwellers as drawn since OR-1234).
    expect(s.scene.lines.join(' ')).toContain('a club');
    expect(s.scene.lines.join(' ')).toContain('Take fire');
    await to('green'); await store(); await act('^Buy a club'); await act('^Buy an oil firebomb');
    // And a coil of rope, for the way down (the club and the bomb spent the purse: a spare axe sold for it).
    await maybe('^Buy a torch'); await maybe('^Sell a battleaxe'); await act('^Buy .*rope');
    // A night in the town, and down again: the ways found are still known, the bats lie dead where they fell, and
    // something from deeper has moved into the room they held (DeepTime: one band a level, the first dawn after the
    // company has gone off it).
    // (The store's talk put by first: its ways and waits are the place's, OR-1451.)
    if (TalkWay.talking(s)) { await say('focus:place'); }
    if (rows(s).some(x => /^Wait until dark/.test(x.label))) { await act('^Wait until dark'); }
    await act('^Wait until first light');
    await to('green'); await to('wood_edge'); await to('wood_ride'); await to('wood_burners'); await to('wood_stones');
    await act('^Light a torch'); await to('ud'); moves = 0; await down();
    expect(s.scene.lines.join(' ')).toMatch(/whoever lives here came after you went/);
    expect(rows(s).some(x => /^Attack /.test(x.label))).toBe(true);
    // Past the newcomers, and down: the second level, deeper than the first trip, and its bone hounds met.
    // The portal stone across the stair down: its jammed counterweight levered free.
    await act('^Attack '); await lit(); await act('^Lever the jammed counterweight'); await lit(); await act('^Down to');
    await lit();
    expect(at()).toMatch(new RegExp(`^${P('ud_halls')}_`));
    // From the ledge to the halls, the second trip: every room of the first level again, and the stair.
    const walked = moves;
    await maybe('^Attack '); await lit();
    // The delver's way down (the cold play's D1): a rope left hanging in the dead-shaft, from the halls to the way in.
    await act('^Climb the dead-shaft and leave a rope');
    // Out, rested, and asked again: what lies past the second level.
    await act(`^Out to ${heart}`); await to('shrine'); await act('^Take a pallet|^Rest six hours');
    await talk(priest); await act('what lies past the halls');
    expect(s.scene.lines.join(' ')).toMatch(/Take fire/);
    // The third trip: through the halls to the king's door, and down into the third level.
    await to('green'); await store(); await maybe('^Buy a torch'); await maybe('^Buy an oil firebomb');
    await maybe('^Sell scale mail'); await act('^Buy .*rope');
    await to('green'); await to('wood_edge'); await to('wood_ride'); await to('wood_burners'); await to('wood_stones');
    // The third trip begins at the depth reached: from the way in, down the rope to the halls in one act, where the
    // first two had walked the whole first level (the mouth, the passage, the chamber, the back-stone, the stair).
    await act('^Light a torch'); await to('ud');
    moves = 0; await to('ud_halls_stair_foot'); await lit();
    expect(at()).toBe(P('ud_halls_stair_foot'));
    expect(moves).toBeLessThan(walked);
    await maybe('^Attack '); await lit();
    for (const room of ['ud_halls_bone_hall', 'ud_halls_gallery', 'ud_halls_kings_door']) {
      const way = rows(s).find(x => x.id === `exit:${P(room)}` || x.id === `exit:${P(room)}/0:Go`);
      // A way refused while something here still bars it is fought for first (the halls' dead come at you).
      const went = way && await r.ask(JSON.stringify({ act: way.id }));
      if (went && 'error' in went) { await maybe('^Attack '); await to(room); } else if (went) { s = went as Said; }
      for (let i = 0; i < 40 && s.moment === 'fight' && !s.end; i++) {
        s = await r.ask(JSON.stringify({ act: RunnerFight.through })) as Said;
      }
      await lit(); await maybe('^Attack '); await lit();
    }
    // The king's door sealed with a stone, broken; and down.
    if (!await maybe('^Down to')) { await act('Break the seal-stone'); await lit(); await maybe('^Down to'); }
    expect(at()).toMatch(new RegExp(`^${P('ud_grave')}_`));
    // And a rope left in the king's chimney: the next trip goes from the way in straight to the third level.
    await lit(); await maybe('^Attack '); await lit();
    await act("^Climb the king's chimney and leave a rope");
    await act(`^Out to ${heart}`);
    await to('wood_edge'); await to('wood_ride'); await to('wood_burners'); await to('wood_stones');
    await act('^Light a torch'); await to('ud');
    moves = 0; await to('ud_grave_antechamber');
    expect([at(), moves]).toEqual([P('ud_grave_antechamber'), 1]);
  }, 600000);
});
