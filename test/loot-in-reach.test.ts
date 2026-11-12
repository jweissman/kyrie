import { beforeAll, describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import type { CreatureStore } from '../src/creature-store';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { Glanced } from './support/glanced';
import { MenuModel } from '../web/reader/menu-model';
import { AtHand } from '../web/reader/stage/at-hand';
import type { ReaderApp } from '../web/reader/reader-app';
import { ChoiceGrouping } from '../src/ui/choice-grouping';

// The fresh playtest of 7 November came home to Elmford as a dwarf named Harbek, and his brother, who joined him, was
// Harbek too. The choices offer the two as one ("Collect a coil of rope for Harbek", for the first of them), and the
// page offered each thing only to whoever carried least, which was as often the other: in a barrow's hall of bones a
// rope, a wand and an elixir came into the list and went out of it as either brother picked something up, the gift
// in the king's hall's casket was never there to take, and nor, once the king fell, was his crown. The family is named
// apart from the protagonist now (kin-names), and companions are made with names of their own, so the two of a name
// no longer come about; the page offers each thing by who can be handed it all the same (Carriers.hands). Here a1's
// barrow, by the drover's son and a protagonist come home under the name he had been drawn: each thing is at hand, to
// be taken, whoever carries least.
class Reach {
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static async start(seed: string, name: string): Promise<PlaySession> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'kin', party: [{ name, raceId: 'dwarf', classId: 'warrior' }] });
    return PlaySession.start(w.path, seed, w.source);
  }
  // Come home under the drover's son's own name, and gone with him.
  static async company(seed: string): Promise<PlaySession> {
    const first = await this.start(seed, 'Harbek');
    const son = first.campaign.module.entities.find(e => e.id === 'drover__son')!.name.split(',')[0]!;
    const s = await this.start(seed, son);
    const green = s.campaign.world.one('at', 'drover__son')!;
    this.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', green) }]);
    for (const id of ['talk_to(drover__son)', 'drover__son_plan', 'recruit(drover__son)']) { await s.leg(id); }
    return s;
  }
  // Into a room of the barrow by light, with whoever lives there gone (or, with them, to fight them).
  static enter(s: PlaySession, room: string, alone = true) {
    const here = s.campaign.world.related('at').filter(r => alone && r.args[1] === room && r.args[0] !== 'party'
      && s.campaign.module.entities.some(e => e.id === r.args[0] && e.type === 'group'));
    this.set(s, [...here.map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...r.args) })),
      { kind: 'retract', call: ModuleWriter.call('unlit', room) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]);
  }
  // What is at hand under Look…, by name, with the commands each offers.
  static hand(s: PlaySession): Map<string, string[]> {
    const frame = Glanced.of(s).frame(), app = { state: { frame, open: [] }, menu: MenuModel.build(frame, 'here', []) };
    return new Map(AtHand.of(app as unknown as ReaderApp).map(h => [h.name, h.choices.flatMap(c => c.command ?? [])]));
  }
}

describe('what lies in a deep site, with a brother of one\'s own name in the company', () => {
  let s: PlaySession;
  beforeAll(async () => { s = await Reach.company('a1'); }, 120000);
  it('keeps the camp\'s rope and the pack\'s contents at hand after something else is taken', async () => {
    expect(s.campaign.world.related('memberOf').filter(r => r.args[1] === 'party').length).toBe(2);
    Reach.enter(s, 'region__w8_halls_well');
    const before = Reach.hand(s);
    await s.leg([...before.get('a torch')!][0]!);
    const after = Reach.hand(s);
    for (const name of ['a coil of rope', 'a potion of barkskin', 'a scroll of domination']) {
      expect([name, after.get(name)?.length]).toEqual([name, 1]);
    }
    expect(after.get('a potion of barkskin')![0]).toStartWith('take_out(region__w8_halls_well_left0,');
  }, 30000);
  it('shows a riddle casket\'s gift, to be taken, once the right word opens it', async () => {
    Reach.enter(s, 'region__w8_halls_kings_door');
    const casket = 'region__w8_halls_kings_door_casket', module = s.campaign.module;
    const gift = module.entities.find(e => e.id === `${casket}_gift`)!;
    const right = module.actions.find(a => a.id.startsWith(`${casket}_word`) && !ChoiceGrouping.hurts(a))!;
    expect(Reach.hand(s).has(gift.name)).toBe(false);
    await s.leg(right.id);
    expect(Reach.hand(s).get(gift.name)?.[0]).toStartWith(`take_out(${gift.id},${casket},`);
  }, 30000);
  it('offers the king\'s crown once the king has fallen', async () => {
    Reach.enter(s, 'region__w8_grave_heart', false);
    // The king fallen (whether this company can bring him down is the fights' to say: since the standing scenarios
    // joined the country a lone warrior no longer does), and the place looked at again.
    const keeper = () => s.campaign.world.test(ModuleWriter.call('able', 'region__w8_keeper'));
    const lease = (s.campaign as unknown as { creatures: CreatureStore }).creatures.acquire(['region__w8_keeper_person']);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    await s.leg('wait');
    expect(keeper()).toBe(false);
    expect(Reach.hand(s).get('the crown of the first king')?.[0]).toStartWith('take_item(region__w8_heart,');
  }, 30000);
});
