import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';

// A whole first expedition, as it was played by the words on the page (doc/architecture/mission-14/expedition.md):
// from the road into Gothgiba, the inn and the smith, out over the fell to the mine; the adit level's riddles, its
// goblins, the glyph made safe, the air shaft found by its draft and climbed out of; home to sell what was carried
// up, a companion raised at the shrine, a night at the inn. Its record replays it to the same world, and a game
// saved halfway and taken up again ends where the unbroken game ends.
class Expedition {
  static readonly steps = [
    'bailey', 'Wooden.Wolf', 'old.workings', 'Ask.Thoradin.what.brings', 'Ask.Thoradin.to.join', 'Buy.one.ration',
    'door.of.the.Wooden', "Ulfgar's.door", 'what.the.old.workings', 'Buy.a.torch.for.Wenna',
    'Buy.a.crowbar.for.Wenna', "Ulfgar's.door", 'path.up.onto.Barzelrehes.to.the.foot',
    'scree.path.to.the.foot.of.Barzelrehes.by.Muzgkom', 'track.to.Obscurusport$', 'way.in', 'passage.to.the.adit$',
    'Light.a.torch', 'Darkness', 'Take .* out of the stone casket for Wenna', 'gallery to the smithy', 'Collect',
    'gallery to the adit$', 'gallery to the crossing', 'Attack the goblins', 'Gather up the coins',
    'Collect a Delver', 'Look closely at the arcane glyph', "Hold the pole's end", 'to the old stope',
    'Collect a lump of star-iron', 'Collect a lump of star-iron', 'Collect a lump of star-iron',
    'Search the old stope', 'Light a torch', 'Search the old stope', 'gap behind the rubble',
    'Unstrap the notebook', 'Gather up the coins', 'Collect a coil of rope', 'Collect a torch for Wenna',
    'gap behind the rubble to the old stope', 'drift to the shaft head', 'shirt',
    'Take .* out of the stone casket for Wenna', 'Touch the singing crystal', 'Collect a lump of star-iron',
    'Gather up the coins', 'drift to the ore pass', 'Light a torch', 'Collect a lump of star-iron',
    'Collect a lump of star-iron', 'Pass a hand through the cold flame', 'drift to the shaft head',
    'drift to the old stope', 'gap behind the rubble to the air shaft', 'iron rungs', 'track to the foot',
    'scree path to the foot of Barzelrehes by Gothgiba', 'path up onto Barzelrehes to the bailey', "Ulfgar's door",
    'Sell a lump of star-iron', 'Sell a lump of star-iron', 'Sell a lump of star-iron', 'Sell a lump of star-iron',
    'Sell a lump of star-iron', 'Sell a lump of star-iron', "Sell a Delver's pay-token",
    "Sell a Delver's pay-token", "Sell a Delver's ring", "Ulfgar's door", 'shrine porch',
    'Ask Baern to raise Thoradin', 'Buy a glossary of the old script', 'shrine porch in Gothgiba to the bailey',
    'door of the Wooden Wolf', 'Take a bed and supper'];
  static async start() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'wren', w.source);
  }
  static async play(s: PlaySession, steps: readonly string[]) {
    for (const step of steps) {
      const re = new RegExp(step, 'i'), c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
      if (!c) { throw new Error(`No choice ${step}: ${PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ')}`); }
      await s.perform(c.choice.id);
    }
  }
}

describe('a first expedition, played through', () => {
  it('comes home with what it carried up, sold, and a companion raised: and replays to the same world', async () => {
    const s = await Expedition.start(), fight = Expedition.steps.indexOf('Attack the goblins') + 1;
    // Thoradin falls fighting the goblins: fallen, he cannot be asked anything; raised, he can again.
    const asks = () => PlayerView.choices(s.campaign).some(c => /^Ask Thoradin /.test(c.choice.name));
    await Expedition.play(s, Expedition.steps.slice(0, fight - 1));
    expect(asks()).toBe(true);
    await Expedition.play(s, Expedition.steps.slice(fight - 1, fight));
    expect(asks()).toBe(false);
    await Expedition.play(s, Expedition.steps.slice(fight));
    expect(asks()).toBe(true);
    const wenna = s.campaign.readout.creatures.find(c => c.name === 'Wenna')!;
    expect(wenna.state.experience).toBeGreaterThan(400);
    expect(s.campaign.readout.creatures.find(c => c.name === 'Thoradin')!.state.hp).toBeGreaterThan(0);
    const again = await Expedition.start();
    await again.replay(s.transcript.steps);
    expect(again.canonical()).toBe(s.canonical());
  }, 240000);
  it('saved halfway down and taken up again, ends where the unbroken game ends', async () => {
    const half = Expedition.steps.indexOf('Search the old stope') + 2;
    const whole = await Expedition.start(), broken = await Expedition.start();
    await Expedition.play(whole, Expedition.steps);
    await Expedition.play(broken, Expedition.steps.slice(0, half));
    const resumed = PlaySession.resume(JSON.parse(JSON.stringify(broken.checkpoint())));
    await Expedition.play(resumed, Expedition.steps.slice(half));
    expect(resumed.canonical()).toBe(whole.canonical());
  }, 360000);
});
