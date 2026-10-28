import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';

// A trap's answers show on a closer look, and a risk taken without one says so: play 9 risked a hidden switch ("Hild
// goes first") whose answer, the cleric's insight, was a look away (M17-56).
class Switch {
  static async start() {
    return PlaySession.start('test/fixtures/probes/hidden-switch/probe.campaign.json', 'switch', NodeBundleSource.shared);
  }
  static ways(s: PlaySession) { return ChoiceList.ways(ScreenModel.build(s.campaign).exits).choices; }
  static hp(s: PlaySession) { return ScreenModel.build(s.campaign).party[0]!.hp; }
}

describe('a trap on the way', () => {
  it('says, risked, that it was not looked at closely, and offers the look beside it', async () => {
    const s = await Switch.start();
    const [risk, look] = Switch.ways(s);
    expect(look!.label).toBe('To the gallery — look at the hidden switch');
    expect(look!.children!.map(c => c.command)).toContain('look_closely(p__hall_snare)');
    expect(risk).toMatchObject({ label: 'To the gallery — risk the hidden switch — Hild goes first',
      note: ChoiceList.unexamined, risk: true });
  }, 60000);
  it('shows a cleric its answer on a closer look, and the way is gone by unharmed', async () => {
    const s = await Switch.start();
    await s.perform('look_closely(p__hall_snare)');
    const ways = Switch.ways(s), worn = ways.find(c => c.command === 'change_thing(p__hall_snare_worn)');
    expect(worn?.label).toMatch(/worn by hands that knew to miss the switch/);
    expect(ways.find(c => c.risk)?.note ?? '').not.toContain(ChoiceList.unexamined);
    const before = Switch.hp(s);
    await s.perform(worn!.command!);
    await s.perform(Switch.ways(s).find(c => /^To the gallery$/.test(c.label))!.command!);
    expect(Switch.hp(s)).toBe(before);
    expect(s.campaign.world.one('at', 'party')).toBe('p__gallery');
  }, 60000);
});
