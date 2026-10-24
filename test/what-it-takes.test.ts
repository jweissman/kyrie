import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { SkillReading } from '../src/presentation/skill-reading';
import { ScreenModel } from '../src/ui/screen-model';
import { SceneModel } from '../src/ui/scene';
import type { Choice } from '../src/ui/choice-list';
import { Narrator } from '../src/presentation/narrator';
import { ObservationText } from '../src/lang/observation-text';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { CreatureStore } from '../src/creature-store';

// What the page tells a company of what it cannot do yet, and what something would do to it: found playing a1's
// king-barrow with a cleric and a pedlar, who have no brawn, no rope, no pole and no eye for traps. A thing that
// wants what the company lacks says so, and names everything that would do (brawn, or a crowbar); a way to a place
// says what bars every way there (a portal stone; a climb wanting a rope); a trap once understood says what it would
// do to whoever goes first, and where the way it is on goes; and what is here is said to be, the bats as well as
// the goblins.
class Barrow {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'cleric' }] });
    return PlaySession.start(w.path, 'a1', w.source);
  }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', `region__${place}`) },
      { kind: 'retract', call: ModuleWriter.call('unlit', `region__${place}`) }]));
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  // Every choice the page offers, those opened under others too.
  static every(cs: Choice[]): Choice[] { return cs.flatMap(c => [c, ...Barrow.every(c.children ?? [])]); }
  static wanting(s: PlaySession) {
    return SkillReading.read(s.campaign).wanting.map(w => `${w.choice.name}: ${ScreenModel.wanting(w)}`);
  }
  static exit(s: PlaySession, to: string) {
    return ScreenModel.build(s.campaign).exits.find(e => e.name === to)?.blocked;
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.events].join(' ');
  }
}

describe('what it takes, as the page tells it', () => {
  it('says everything that would free a thing, and what bars every way to a place', async () => {
    const s = await Barrow.start();
    Barrow.put(s, 'w8_barrow_back_stone');
    expect(Barrow.wanting(s)).toContain(
      'Lever the jammed counterweight free: Needs brawn or a crowbar, and the company has neither.');
    expect(Barrow.exit(s, 'the foot of the stair')).toMatch(
      /will not move\. Or by the gap over the portal stone: you would need climbing or a coil of rope\.$/);
    // With a rope, the climb is open, whatever else it might have wanted.
    Barrow.put(s, 's1_shop');
    await Barrow.take(s, /^Buy a coil of rope for Wenna/);
    Barrow.put(s, 'w8_barrow_back_stone');
    expect(Barrow.names(s)).toContain('Take the gap over the portal stone to the foot of the stair');
  }, 60000);
  it('says where a trap\'s way goes, and once the trap is understood, what it would do to whoever goes first', async () => {
    const s = await Barrow.start();
    const risk = /^Risk the hidden switch on the way to the hall of the bones; Wenna goes first/;
    Barrow.put(s, 'w8_halls_stair_foot');
    expect(Barrow.names(s).find(n => risk.test(n))).toBe(
      'Risk the hidden switch on the way to the hall of the bones; Wenna goes first');
    await Barrow.take(s, /^Look closely at the hidden switch$/);
    expect(Barrow.names(s).find(n => risk.test(n))).toMatch(/goes first · it could kill$/);
    expect(Barrow.wanting(s)).toContain(
      'Push the switch in with the pole\'s end, standing clear: Needs a ten-foot pole, and the company has none.');
  }, 60000);
  it('says the bats are here, as it says the goblins are', async () => {
    const s = await Barrow.start();
    Barrow.put(s, 'w8_barrow_chamber');
    expect(Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).presence).toContain('The bats are here.');
  }, 60000);
  it('tells a sale as a sale, not as setting the thing down', async () => {
    const s = await Barrow.start();
    Barrow.put(s, 'w8_barrow_mouth');
    await Barrow.take(s, /^Collect a jade idol for Wenna$/);
    Barrow.put(s, 's1_shop');
    // What it fetches is said before it is sold (the follow-up review sold a lamp and learned the price after).
    const offered = Barrow.every(SceneModel.build(ScreenModel.build(s.campaign)).subjects.flatMap(x => x.choices))
      .find(c => c.label === 'Sell a jade idol');
    const coin = () => s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')), before = coin();
    const told = await Barrow.take(s, /^Sell a jade idol to Mik$/);
    expect(offered?.note).toStartWith(`${coin() - before} coin`);
    expect(told).toContain('Mik turns a jade idol over in the light');
    expect(told).not.toContain('set down');
  }, 60000);
  it('lets what waits in the next room be heard before the company is in it', async () => {
    const s = await Barrow.start();
    Barrow.put(s, 'w8_halls_bone_hall');
    const heard = () => PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ');
    expect(heard()).toContain('From the ossuary comes a sound you do not like at all');
    expect(heard()).toContain('Something is moving about in the mourners\' hall');
  }, 60000);
  it('offers a remedy only to whoever it would help', async () => {
    const s = await Barrow.start();
    Barrow.put(s, 's4_green');
    await Barrow.take(s, /^Buy bandages for Wenna/);
    const offered = () => Barrow.names(s).some(n => /^Use bandages on Wenna$/.test(n));
    expect(offered()).toBe(false);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire([s.campaign.readout.partyIds[0]!]);
    try { lease.creatures[0]!.state.hp -= 3; lease.commit(lease.creatures); } finally { lease.release(); }
    await s.perform('wait');
    expect(offered()).toBe(true);
  }, 60000);
  it('goes on from a question into who asked it', () => {
    expect(ObservationText.sentences('‘Murkstede?’ says Hob. ‘Same as ever.’ the castellan nods.'))
      .toBe('‘Murkstede?’ says Hob. ‘Same as ever.’ The castellan nods.');
  });
});
