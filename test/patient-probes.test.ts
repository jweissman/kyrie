import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice, type Section } from '../src/ui/choice-list';
import { KyrLint } from '../src/cli/kyr-lint';
import { Campaign } from '../src/campaign/campaign';
import type { CampaignSave } from '../src/campaign/campaign-types';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';

// The smallest modules that show what an independent author met writing Hold One Season (a slice of The Patient Star;
// doc/adventures/patient-star/ledger.md). Each test pins what Kyr does today, and names the ledger entry. Where
// the behaviour is a defect, the test says so, so that a repair turns it red and the ledger can be updated.
class Probe {
  static start(name: string) {
    return PlaySession.start(`test/fixtures/patient/${name}/probe.campaign.json`, 'p', NodeBundleSource.shared);
  }
  static async lint(name: string) {
    return KyrLint.campaign(`test/fixtures/patient/${name}/probe.campaign.json`, new NodeBundleSource());
  }
  private static leaves(list: Choice[], trail: string): { label: string; command?: string }[] {
    return list.flatMap(c => c.children ? this.leaves(c.children, `${trail}${c.label} › `)
      : [{ label: trail + c.label, ...c.command ? { command: c.command } : {} }]);
  }
  static choices(s: PlaySession) {
    const screen = ScreenModel.build(s.campaign);
    return [...ChoiceList.explore(screen), ...ChoiceList.pack(screen)]
      .flatMap((x: Section) => this.leaves(x.choices, `${x.title}: `)).filter(c => c.command);
  }
  static async act(s: PlaySession, label: string) {
    const c = this.choices(s).find(x => new RegExp(label, 'i').test(x.label));
    if (!c) { throw new Error(`No /${label}/ among ${this.choices(s).map(x => x.label).join(' | ')}`); }
    const e = await s.perform(c.command!);
    return [...(e.perceptions ?? []).map(p => p.text), e.response ?? ''].join(' ');
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
}

describe('The Patient Star probes', () => {
  // Repaired at integration: a module sets a member's speed, and nothing is said of weight. (The probe pinned the
  // workaround, no capacity to carry, which said "What you carry drags at you", and was laden.)
  it('P1: a slowed member slows the company, told in the module\'s own words', async () => {
    const s = await Probe.start('light');
    const minutes = () => s.campaign.world.number(ModuleWriter.call('watch', 'clock')) * 10 + (s.campaign.state.minutes ?? 0);
    await Probe.act(s, 'To the margin of the glass');
    const told = await Probe.act(s, 'Wait › An hour');
    expect(told).toContain('Ama\'s own footsteps sound late');
    expect(told).not.toMatch(/What you carry/);
    expect(Probe.holds(s, 'laden', 'party')).toBe(false);
    const before = minutes();
    await Probe.act(s, 'To two hundred paces');
    expect(minutes() - before).toBe(40);
  }, 60000);

  it('P2: a kind of the module\'s own cannot say it is worn; like a plain cloak it cannot be, like a magic one it is magic', async () => {
    const s = await Probe.start('worn');
    await Probe.act(s, 'plain felt cloak: Take'); await Probe.act(s, 'like the magic one: Take');
    const labels = Probe.choices(s).map(c => c.label);
    expect(labels.some(l => /plain felt cloak › Equip/i.test(l))).toBe(false);
    expect(labels.some(l => /like the magic one › Equip/i.test(l))).toBe(true);
  }, 60000);

  it('P3: a description cannot be anchored at a variable place: one line per gallery the mirror lights', async () => {
    const s = await Probe.start('mirror');
    await Probe.act(s, 'To the north stretch');
    const page = ScreenModel.build(s.campaign).observed.map(o => o.text).join(' ');
    expect(Probe.holds(s, 'p__bright', 'p__north')).toBe(true);
    expect(page).not.toMatch(/Grey-gold light lies along/);
  }, 60000);

  // Repaired at integration: only the first was offered (a choice whose schema and wording repeated one already
  // offered was dropped, as one torch of three is).
  it('P4: two things whose changes are worded alike are each offered, under their own names', async () => {
    expect((await Probe.lint('collide'))).toEqual([]);
    const s = await Probe.start('collide');
    const plays = Probe.choices(s).filter(c => /Draw a stylus/.test(c.label));
    expect(plays.map(c => c.label)).toEqual(['a granary plate: Draw a stylus along the plate',
      'a song plate: Draw a stylus along the plate']);
    // Things alike are still one choice: of two flasks of lamp oil bought, one is used, or set down.
    const j = await Journey.start('data/campaigns/hold-one-season.campaign.json', 'p');
    await j.play('Rusk.*Buy › A flask', 'Rusk.*Buy › A flask');
    expect(PlayerView.choices(j.campaign).filter(c => /^(Use|Set down) a flask of lamp oil/.test(c.choice.name))
      .map(c => c.choice.name)).toEqual(['Use a flask of lamp oil on Tamsin', 'Set down a flask of lamp oil']);
  }, 60000);

  // Repaired at integration: it stopped play ("Invalid quantity for p__dose(party)"), naming neither rule nor line.
  it('P5: a decrease past nothing stops at nothing', async () => {
    const s = await Probe.start('below-zero');
    await Probe.act(s, 'Wait › A while');
    expect(s.campaign.world.number(ModuleWriter.call('p__dose', 'party'))).toBe(0);
  }, 60000);

  it('P6: a person with somewhere to go stays put unless the module also says Uses go, and lint is silent', async () => {
    expect((await Probe.lint('stand'))).toEqual([]);
    const s = await Probe.start('stand');
    for (let i = 0; i < 6; i++) { await Probe.act(s, 'Wait › A while'); }
    expect(s.campaign.world.one('at', 'p__garret')).toBe('p__yard');
  }, 60000);

  // Repaired at integration: a rule's words teach what they say (it could only assert knows, which was refused, and
  // the refusal named no rule; it now names the rule, and how to teach).
  it('P7: a rule puts two known things together into a third, and says so', async () => {
    const s = await Probe.start('knows-rule');
    expect(Probe.holds(s, 'knows', 'party', 'p__same')).toBe(false);
    const told = await Probe.act(s, 'Wait › A while');
    expect(told).toContain("The words of the holding prayer are the clerk's line");
    expect(Probe.holds(s, 'knows', 'party', 'p__same')).toBe(true);
    expect(await Probe.act(s, 'Wait › A while')).toContain('the granary bell rings once');
    expect(Probe.holds(s, 'knows', 'party', 'p__rung')).toBe(true);
    let error = '';
    try { await Probe.start('knows-assert'); } catch (e) { error = (e as Error).message; }
    expect(error).toMatch(/^Rule put_together cannot change .* discovery knowledge \(a rule teaches what it says/);
  }, 60000);

  it('P8: a kind declared in a shared law cannot be sold by a person in the module that uses the law', async () => {
    let error = '';
    try { await Probe.start('law-sells'); } catch (e) { error = (e as Error).message; }
    expect(error).toMatch(/'umber_felt' is already declared by the shared rules/);
  }, 60000);

  it('P9: an event happens once, seen or not: a man who wakes in the next room never says so to anyone', async () => {
    const s = await Probe.start('unseen-event');
    await Probe.act(s, 'Wait › An hour');
    expect(Probe.holds(s, 'p__woke', 'p__garret')).toBe(true);
    const told = await Probe.act(s, 'To the vault');
    expect(told).not.toMatch(/Where.s the light gone/);
  }, 60000);

  // Repaired at integration (and the audit's F4): she stayed in the company, and was found dead where she went.
  it('P10: a companion a rule sends home leaves the company, and is there, herself, when it comes', async () => {
    const s = await Probe.start('leaves');
    await Probe.act(s, 'Ask Mirel to join');
    expect(s.campaign.readout.partyIds).toEqual(['p__party_1', 'p__mirel_person']);
    await Probe.act(s, 'To the held field');
    await Probe.act(s, 'Dig out');
    expect(Probe.holds(s, 'travelsWith', 'p__mirel', 'party')).toBe(false);
    expect(Probe.holds(s, 'memberOf', 'p__member_mirel_person', 'party')).toBe(false);
    expect(Probe.holds(s, 'memberOf', 'p__member_mirel_person', 'p__mirel')).toBe(true);
    expect(s.campaign.readout.partyIds).toEqual(['p__party_1']);
    await Probe.act(s, "To the holders' cord");
    const here = ScreenModel.build(s.campaign).people.find(p => /Mirel/.test(p.name));
    expect([here?.name, here?.state]).toEqual(['Mirel, a Holdfolk carrier', undefined]);
    const kept = Campaign.restore(JSON.parse(JSON.stringify(s.campaign.save())) as CampaignSave);
    expect(kept.readout.partyIds).toEqual(['p__party_1']);
  }, 60000);
});
