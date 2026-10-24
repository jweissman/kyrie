import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ItemNames } from '../src/item-names';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// People and things as the company would speak of them, found playing thorn with a ranger. The widow who sits on her
// step is "the woman in black" in every choice, as she is on the page, not a name nobody has told the company. A
// drover resting at an inn has news of where he came from, not of where he sits. What lies in wait in the cisterns
// makes no sound, but a ranger sees its slime at the mouth of the way. And heather is bought as heather.
class Thorn {
  static async start(calling = 'ranger') {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: calling }] });
    return PlaySession.start(w.path, 'thorn', w.source);
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${place}`) },
      { kind: 'retract', call: ModuleWriter.call('unlit', `region__${place}`) }]));
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text).join(' '); }
}

describe('as the company would tell it', () => {
  it('calls the widow on her step what the page calls her', async () => {
    const s = await Thorn.start();
    Thorn.put(s, 's1_green');
    expect(Thorn.names(s)).toEqual(expect.arrayContaining(['Talk to the woman in black',
      'Ask the woman in black what she is waiting for']));
  }, 60000);
  it('has a traveller resting at an inn tell of where they came from', async () => {
    const s = await Thorn.start();
    Thorn.put(s, 's1_taproom');
    expect(Thorn.names(s)).toContain('Ask Ralf for news of Meósdael');
    expect(Thorn.names(s)).not.toContain('Ask Ralf for news of Merscheald');
    // Eight in the morning is not the night: he is making ready for the road.
    expect(Thorn.seen(s)).toContain('Ralf the drover is out at the pens, counting the cattle before the road');
    expect(Thorn.seen(s)).not.toContain('penned for the night');
  }, 60000);
  it('lets someone who reads sign see what lies in wait, and nobody else', async () => {
    const ranger = await Thorn.start(), warrior = await Thorn.start('warrior');
    for (const s of [ranger, warrior]) { Thorn.put(s, 'w8_galleries_colonnade'); }
    expect(Thorn.seen(ranger)).toContain('The stone at the mouth of the way to the great wheel is slick');
    expect(Thorn.seen(warrior)).not.toContain('Something lies in wait in there');
  }, 60000);
  it('does not offer to try what is already undone, nor to look at what was gathered, nor to send a goat off', async () => {
    const s = await Thorn.start('warrior');
    Thorn.put(s, 'w8_galleries_deep_gate');
    const tear = PlayerView.choices(s.campaign).find(c => c.choice.name === 'Tear the bronze plate from the gate')!;
    await s.perform(tear.choice.id);
    expect(Thorn.names(s).filter(n => /^(Push and pull at|Listen at|Pry at) the seal/.test(n))).toEqual([]);
    Thorn.put(s, 'w8_gatehouse_gate_hall');
    await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.name === 'Gather up the coins')!.choice.id);
    expect(Thorn.names(s)).not.toContain('Look closely at scattered coins');
    Thorn.put(s, 's1_s2_way');
    expect(Thorn.names(s).some(n => /^Ask Gruff to come with you/.test(n))).toBe(true);
    expect(Thorn.names(s).some(n => /^Tell Gruff not to wait/.test(n))).toBe(false);
  }, 60000);
  it('says heather, comfrey and wine as they are said, and a dandelion as one', () => {
    expect(['Heather', 'Comfrey', 'Kingsfoil', 'Wine', 'Dandelion'].map(n => ItemNames.called(n)))
      .toEqual(['heather', 'comfrey', 'kingsfoil', 'wine', 'a dandelion']);
  });
});
