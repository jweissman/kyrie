import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { Content } from '../src/content';
import { GeneratedWorld } from './support/generated';
import { Frontier } from '../src/world/frontier';

// A companion who falls lies senseless until a rest, when they come round with 1 HP or die where they fell (Orsino's
// system shock). Their gear can be taken from them; a town's priest can call them back (Orsino's Raise Dead) for a
// long vigil and a great price, with half their health; and the dead can be laid to rest.
class Fallen {
  static async start(slain = false) {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { scenarios: 0, towns: 0, framework: null });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(s.campaign.state.partyIds);
    try {
      lease.creatures[0]!.state.hp = 0;
      if (slain) { lease.creatures[0]!.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' }); }
      lease.creatures[1]!.state.gold = 400;
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    return { w, s };
  }
  static choice(s: PlaySession, pattern: RegExp) {
    return PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
  }
}

describe('a fallen companion', () => {
  it('can be relieved of what they carried, and raised by a town\'s priest for 150 coin', async () => {
    const { w, s } = await Fallen.start(), town = w.report.region.settlements.find(t => t.size === 'town')!;
    const elen = () => s.campaign.state.party.find(m => m.name === 'Elen')!;
    GeneratedWorld.put(s, `${town.id}_shrine`);
    await s.perform('wait');
    // She cannot hand anything over; the others take it from her.
    const given = PlayerView.choices(s.campaign).map(x => x.choice.id);
    expect(given.some(id => id.startsWith('transfer_item(region__party_1__'))).toBe(false);
    expect(given.some(id => id.startsWith('transfer_item(region__party_2__'))).toBe(true);
    const take = Fallen.choice(s, /^Take a coil of rope from Elen for Bran$/);
    expect(take).toBeDefined();
    expect((await s.perform(take!.choice.id) as { response?: string }).response).toContain('Bran takes a coil of rope from Elen');
    const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    const raise = Fallen.choice(s, /^Ask .* to raise Elen from the dead/)!;
    expect(raise).toBeDefined();
    // What it costs is on the choice, as a bed's price is.
    const acts = ScreenModel.build(s.campaign).people.flatMap(p => p.acts.map(a => a.label));
    expect(acts).toContain('Ask them to raise Elen from the dead — 150 coin');
    await s.perform(raise.choice.id);
    expect(elen().hp).toBe(Math.floor(elen().maxHp / 2));
    expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(gold - 150);
    expect(Fallen.choice(s, /^Ask .* to raise Elen/)).toBeUndefined();
  }, 60000);
  it('dead, can be laid to rest, and leaves the company; senseless, cannot', async () => {
    expect(await Fallen.start().then(async ({ w, s }) => {
      GeneratedWorld.put(s, `${w.report.region.settlements[0]!.id}_green`);
      await s.perform('wait');
      return Fallen.choice(s, /^Lay Elen to rest$/);
    })).toBeUndefined();
    const { w, s } = await Fallen.start(true), town = w.report.region.settlements[0]!;
    GeneratedWorld.put(s, `${town.id}_green`);
    await s.perform('wait');
    const rest = Fallen.choice(s, /^Lay Elen to rest$/)!;
    expect(rest).toBeDefined();
    await s.perform(rest.choice.id);
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Bran', 'Dori']);
    expect(Fallen.choice(s, /Elen/)).toBeUndefined();
    // Kept and opened again, the company is still the two of them.
    const back = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(back.campaign.state.party.map(m => m.name)).toEqual(['Bran', 'Dori']);
    // Nor does she come back when the country beyond is drawn and installed.
    GeneratedWorld.put(s, 'edge_east');
    await s.perform('wait');
    expect(await new Frontier('a1', NodeBundleSource.shared).expand(s.campaign)).toBeDefined();
    expect(s.campaign.state.party.map(m => m.name)).toEqual(['Bran', 'Dori']);
    expect(Fallen.choice(s, /Elen/)).toBeUndefined();
  }, 60000);
  it('comes round at a rest with 1 HP, or dies where they fell, and once dead is not rolled for again', () => {
    const fallen = (seed: string, constitution: number) => {
      const elen = new Content('shock').createCreature('elen', { raceId: 'human', classId: 'warrior', constitution });
      elen.state.hp = 0;
      const bran = new Content('shock').createCreature('bran', { raceId: 'human', classId: 'warrior' });
      const store = new CreatureStore([elen, bran]), events = FieldUse.shock(store, ['elen', 'bran'], seed);
      return { elen: store.get('elen'), events };
    };
    expect(fallen('hardy', 30).elen.state.hp).toBe(1);
    const tries = Array.from({ length: 40 }, (_, i) => fallen(`s${i}`, 10));
    expect(tries.some(t => t.elen.state.hp === 1)).toBe(true);
    const died = tries.find(t => t.elen.state.hp === 0)!;
    expect(died.elen.state.conditions.map(c => c.id)).toContain('slain');
    expect(died.events.map(e => e.type)).toEqual(['save', 'status']);
    const bran = new Content('shock').createCreature('bran', { raceId: 'human', classId: 'warrior' });
    expect(FieldUse.shock(new CreatureStore([died.elen, bran]), ['elen', 'bran'], 'again')).toEqual([]);
    // Nobody is left on their feet to tend the fallen: nobody comes round.
    const alone = new Content('shock').createCreature('elen', { raceId: 'human', classId: 'warrior', constitution: 30 });
    alone.state.hp = 0;
    expect(FieldUse.shock(new CreatureStore([alone]), ['elen'], 'hardy')).toEqual([]);
  });
  it('is not raised by a village priest', async () => {
    const { w, s } = await Fallen.start(), village = w.report.region.settlements.find(t => t.size !== 'town')!;
    GeneratedWorld.put(s, `${village.id}_shrine`);
    await s.perform('wait');
    expect(Fallen.choice(s, /to raise Elen/)).toBeUndefined();
  }, 60000);
});
