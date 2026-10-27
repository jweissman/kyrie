import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// The principal demonstration, kept four times over: deep sites played to their hearts by the page's own choices
// (test/fixtures/descent/<seed>.choices, one choice's words a line, matched as test/long-expedition matches them). In
// wren, six expeditions into the Delvers' mine by a warrior, from the road into Gothgiba to the heart of the vein
// brought up into daylight eight days later. In thorn, the Water-Wardens' cisterns by a ranger and a pilgrim, with a
// soldier fetched from Glōmstede to tear the seal off the deep gate, to the reading-glass brought up at first light on
// the fifth day. In d4, the Stone-Singers' hall by a bard, a pilgrim and a mason, with a crowbar for the pivot-door and
// a rope for the crack round the singing door, the dirge bell fought for in the unfinished hall and rung over the
// singers, to the tuning-stone brought out at first light on the second day. In a1, the king-barrow Lapistumul by a
// warrior and a healer in two expeditions: the outer barrow's grave-goods sold for a glossary of the old script, then
// over the toll-bridge for a pole and a lantern and a scholar, the stair's switch sprung with the pole, the jar of the
// embalmers' daylight carried before them so the king goes back from it, and the crown of the first king brought out at
// first light on the fourth day. They take some minutes, so they are opt-in: KYRIE_LONG=1. A change that moves what the
// world offers (a new trap, a fight that goes otherwise) will stop one where its record no longer holds; the record is
// then played on from there.
class Descent {
  static choices(seed: string): string[] {
    return readFileSync(new URL(`./fixtures/descent/${seed}.choices`, import.meta.url), 'utf8').split('\n').filter(Boolean);
  }
  static async play(seed: string, classId: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId }] });
    const s = await PlaySession.start(w.path, seed, w.source);
    for (const [i, step] of this.choices(seed).entries()) {
      const re = new RegExp(step, 'i'), c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
      const offered = () => PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ');
      if (!c) { throw new Error(`Choice ${i + 1}, ${step}, is not offered: ${offered()}`); }
      await s.perform(c.choice.id);
    }
    return s;
  }
}

describe.skipIf(!process.env.KYRIE_LONG)('deep sites played to their hearts', () => {
  it('brings the heart of the vein up into daylight, by the page\'s own choices alone', async () => {
    const s = await Descent.play('wren', 'warrior');
    expect(s.campaign.world.test(ModuleWriter.call('region__w9_raised'))).toBe(true);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Wenna', 'Thoradin', 'Veit']);
  }, 900000);
  it('brings the Wardens\' reading-glass up out of the cisterns, by a second company in a second world', async () => {
    const s = await Descent.play('thorn', 'ranger');
    expect(s.campaign.world.test(ModuleWriter.call('region__w8_raised'))).toBe(true);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Wenna', 'Arlen', 'Yoriel']);
  }, 900000);
  it('brings the Stone-Singers\' tuning-stone up out of their hall, by a bard who reads the old script', async () => {
    const s = await Descent.play('d4', 'bard');
    expect(s.campaign.world.test(ModuleWriter.call('region__w8_raised'))).toBe(true);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Wenna', 'Gareth', 'Akarn']);
  }, 900000);
  it('brings the crown of the first king out of the barrow, with the embalmers\' daylight carried before it', async () => {
    const s = await Descent.play('a1', 'warrior');
    expect(s.campaign.world.test(ModuleWriter.call('region__w8_raised'))).toBe(true);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Wenna', 'Cyril', 'Aghavan']);
  }, 900000);
});
