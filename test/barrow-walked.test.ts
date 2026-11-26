import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';

// The forewarning, played (Sprint 3, S3-R3; the audit of 19 November found S2-4's pin carried the company past the
// halls, and its unwarned company passed the king with the jar too, so what the forewarning changed was never
// measured). Two companies of the drove life, Wenna and Carlin hired at the Stone Horn, each told of the king-barrow by
// Holgar (the crown's story, and the way to Holyking); one asks Kynes about it too, and hears her grandmother's
// saying. Each walks the barrow from its forecourt through the passage-grave and the halls of the dead, fighting what
// meets it there, to the king's hall. Every act is taken by its verb and target. What the saying changes: in the long
// gallery the warned company is led into the embalmers' room, past its mourners, to the jar; the unwarned is led
// nowhere and walks on to the king's door. In the king's hall the jar sends the king back and the crown is had with no
// fight; without it the king rises when his crown is lifted and the company goes down.
const halls = 'region__w8_halls', grave = 'region__w8_grave';
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
class Walk {
  readonly fought: string[] = [];
  readonly been: string[] = [];
  private constructor(readonly r: Runner) {}
  static async begin(warned: boolean): Promise<Walk> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const w = new Walk(new Runner(journey.session));
    await w.act('go(region__s1_inn_door,region__s1_taproom)');
    if (warned) { await w.act('region__s1_innkeeper_matter'); await w.act('region__w8_rumour'); await w.act('region__w8_saying'); }
    for (const id of ['region__s1_traveller_brings', 'recruit(region__s1_traveller)', 'go(region__s1_inn_door,region__s1_green)',
      'go(region__s1_shop_door,region__s1_shop)', 'region__s1_merchant_matter', 'region__w8_rumour2', 'go(region__s1_shop_door,region__s1_green)',
      'travel:region__w8']) { await w.act(id); }
    said(await w.r.ask(JSON.stringify({ follow: warned ? 'region__w8_bane_aim' : 'region__w8_bring' })));
    return w;
  }
  get at(): string | undefined { return this.r.said().at; }
  holds(fact: string, ...args: string[]): boolean {
    return this.r.session.campaign.world.test(ModuleWriter.call(fact, ...args));
  }
  // An act by its id, refused if it is not offered; a fight it opens is fought through by the company's own tactics,
  // and kept by where.
  async act(id: string): Promise<Said> {
    let s = said(await this.r.ask(JSON.stringify({ act: id })));
    if (s.moment === 'fight') { this.fought.push(this.r.session.campaign.world.one('at', 'party') ?? ''); }
    while (s.moment === 'fight') { s = said(await this.r.ask(JSON.stringify({ act: 'fight:through' }))); }
    this.been.push(this.r.session.campaign.world.one('at', 'party') ?? '');
    return s;
  }
  // The way to a room, by where it goes.
  async to(room: string): Promise<Said> {
    const way = offered(this.r.said()).map(o => RunnerOffer.act(o))
      .find(id => id.startsWith('go(') && id.endsWith(`,${room})`));
    if (!way) { throw new Error(`no way from ${this.at} to ${room}`); }
    return this.act(way);
  }
  // From the mound's forecourt to the long gallery: the rune on the way to the cross-chamber risked, the portal stone's
  // counterweight levered free, the stair down, the hall of the bones and whatever keeps it.
  async down(): Promise<Said> {
    await this.act('light_item(region__party_1__torch)');
    for (const room of ['region__w8_barrow_mouth', 'region__w8_barrow_passage']) { await this.to(room); }
    await this.act('risk(region__w8_barrow_chamber_snare,region__member_party_1)');
    await this.to('region__w8_barrow_back_stone');
    await this.act('change_thing(region__w8_barrow_back_stone__w8_halls_stair_foot_wheel_free)');
    for (const room of ['stair_foot', 'bone_hall', 'gallery']) { await this.to(`${halls}_${room}`); }
    return this.r.said();
  }
  // From the gallery through the king's door, its seal-stone broken, to the king's hall.
  async on(): Promise<Said> {
    await this.to(`${halls}_kings_door`);
    await this.act(`change_thing(${halls}_kings_door__w8_grave_antechamber_wall_break)`);
    await this.to(`${grave}_antechamber`);
    return this.to(`${grave}_heart`);
  }
  get led(): string[] { return this.r.said().led ?? []; }
  get standing(): number { return this.r.session.campaign.readout.creatures.filter(c => this.party.includes(c.id)
    && c.state.hp > 0).length; }
  private get party(): readonly string[] { return this.r.session.campaign.readout.partyIds; }
}
const toEmbalmers = (id: string) => id.endsWith(`,${halls}_embalmers)`);
describe('the king-barrow, walked through its halls', () => {
  it('warned, is led to the jar past the mourners, and the king gives the crown up without a fight', async () => {
    const w = await Walk.begin(true);
    await w.down();
    expect(w.at).toBe(`${halls}_gallery`);
    expect(w.fought).toEqual([`${halls}_bone_hall`]);
    expect(w.led.some(toEmbalmers)).toBe(true);
    const room = await w.act(w.led.find(toEmbalmers)!);
    expect(w.at).toBe(`${halls}_embalmers`);
    expect(room.scene.lines.join(' ')).toContain('banshees');
    await w.act('take_item(region__w8_bane_item,region__member_party_1)');
    await w.to(`${halls}_gallery`);
    const hall = await w.on();
    expect(w.fought).toEqual([`${halls}_bone_hall`, `${halls}_kings_door`]);
    expect(hall.scene.lines.join(' ')).toContain('The king sits up on his bier');
    const back = await w.act('equip_item(region__w8_bane_item,region__member_party_1)');
    expect(back.scene.lines.join(' ')).toContain('goes back from it, step by step, into the deep grave');
    const crown = await w.act('take_item(region__w8_heart,region__member_party_1)');
    expect(crown.moment).toBe('outcome');
    expect(w.fought).toHaveLength(2);
    expect(w.holds('ownedItem', 'region__w8_heart', 'region__member_party_1')).toBe(true);
    expect(w.standing).toBe(2);
  }, 120000);
  it('unwarned, is led nowhere near the jar, walks on to the king, and goes down when it lifts his crown', async () => {
    const w = await Walk.begin(false);
    const gallery = await w.down();
    expect(w.fought).toEqual([`${halls}_bone_hall`]);
    expect(w.led.some(toEmbalmers)).toBe(false);
    expect(gallery.going?.kind).toBe('frontier');
    const hall = await w.on();
    expect(w.fought).toEqual([`${halls}_bone_hall`, `${halls}_kings_door`]);
    expect(w.been).not.toContain(`${halls}_embalmers`);
    expect(hall.scene.lines.join(' ')).toContain('The king sits up on his bier');
    expect(hall.scene.lines.join(' ')).not.toContain('goes back from it');
    expect(offered(hall).some(o => o.id.startsWith('equip_item(region__w8_bane_item'))).toBe(false);
    await w.act('take_item(region__w8_heart,region__member_party_1)');
    expect(w.fought).toEqual([`${halls}_bone_hall`, `${halls}_kings_door`, `${grave}_heart`]);
    expect(w.standing).toBe(0);
  }, 120000);
});
