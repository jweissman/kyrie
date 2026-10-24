import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// The principal demonstration, kept: six expeditions into the Delvers' mine in the world of seed wren, played only by
// the choices on the page (test/fixtures/descent/wren.choices, one choice's words a line, matched as
// test/long-expedition matches them), from the road into Gothgiba to the heart of the vein brought up into daylight
// eight days later. It takes some minutes, so it is opt-in: KYRIE_LONG=1. A change that moves what the world offers
// (a new trap, a fight that goes otherwise) will stop it where the record no longer holds; the record is then played
// on from there.
class Descent {
  static readonly choices = readFileSync(new URL('./fixtures/descent/wren.choices', import.meta.url), 'utf8')
    .split('\n').filter(Boolean);
  static async play() {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'wren', w.source);
    for (const [i, step] of this.choices.entries()) {
      const re = new RegExp(step, 'i'), c = PlayerView.choices(s.campaign).find(x => re.test(x.choice.name));
      const offered = () => PlayerView.choices(s.campaign).map(x => x.choice.name).join(' | ');
      if (!c) { throw new Error(`Choice ${i + 1}, ${step}, is not offered: ${offered()}`); }
      await s.perform(c.choice.id);
    }
    return s;
  }
}

describe.skipIf(!process.env.KYRIE_LONG)('the descent to the heart of the vein, played through', () => {
  it('brings the heart up into daylight, by the page\'s own choices alone', async () => {
    const s = await Descent.play();
    expect(s.campaign.world.test(ModuleWriter.call('region__w9_raised'))).toBe(true);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Wenna', 'Thoradin', 'Veit']);
  }, 900000);
});
