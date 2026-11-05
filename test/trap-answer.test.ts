import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { Marks } from '../src/ui/marks';
import { WorldAssembler } from '../src/world/world-assembler';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

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
  // Risked blind, a novice had died of four harm in one round: the risk says what going off would do, against the one
  // with least left (the product-design review's PD-01).
  it('says, risked, how much harm it does if it goes off', async () => {
    const s = await Switch.start(), screen = ScreenModel.build(s.campaign);
    const risk = Marks.on(screen, [ChoiceList.ways(screen.exits)])[0]!.choices.find(c => c.risk)!;
    expect(risk.marks?.find(m => m.kind === 'trap')?.said).toMatch(/If it goes off: about \d+ harm to whoever goes first\./);
  }, 60000);
});

// Whoever has a skill that reads and deals with a snare knows it on sight, without looking closely (PD-01: a diviner
// was told nothing of a humming enchanted object). Strength deals with a thing; it does not say what it is.
describe('a snare in a generated country', () => {
  it('is read on sight by a company with the skill that answers it', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Nan', raceId: 'human', classId: 'mage' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    k.commit(k.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w5_counting') }]));
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__w5_snare_known'))).toBe(false);
    const light = PlayerView.choices(c).find(x => /^Light/.test(x.choice.name))!;
    await s.perform(light.choice.id);
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__w5_snare_known'))).toBe(true);
    expect(PlayerView.choices(c).some(x => /^Say over it what quiets such things/.test(x.choice.name))).toBe(true);
  }, 120000);
  // Looked at closely by a company that can take none of its answers, it says what would (PD-01: a calling with no
  // answer had been told nothing of who or what would help).
  it('tells a company with no answer to it what would deal with it', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'kin', party: [{ name: 'Nan', raceId: 'human', classId: 'thief' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const k = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    // A thief has no lore, rites or strength for a humming thing; and here, no pole either.
    const poles = c.world.related('ownedItem').filter(r => c.world.one('itemKind', r.args[0]!) === 'pole')
      .map(r => ({ kind: 'retract', call: ModuleWriter.call('ownedItem', r.args[0]!, r.args[1]!) }));
    k.commit(k.world.apply([...poles, { kind: 'assert', call: ModuleWriter.call('at', 'party', 'region__w5_counting') }]));
    const light = PlayerView.choices(c).find(x => /^Light/.test(x.choice.name));
    if (light) { await s.perform(light.choice.id); }
    const look = PlayerView.choices(c).find(x => /^look_closely\(region__w5_snare/.test(x.choice.id))!;
    const seen = (await s.perform(look.choice.id)).perceptions?.map(p => p.text).join(' ') ?? '';
    expect(seen).toMatch(/None of you knows how to deal with it as you are: it wants .+\./);
  }, 120000);
});
