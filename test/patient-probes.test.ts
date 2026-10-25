import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice, type Section } from '../src/ui/choice-list';
import { KyrLint } from '../src/cli/kyr-lint';

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

  it('P4: two things whose changes are worded alike: lint is silent, and only the first is offered', async () => {
    expect((await Probe.lint('collide'))).toEqual([]);
    const s = await Probe.start('collide');
    // PlayerView.choices drops a choice whose schema and wording repeat one already offered.
    const plays = Probe.choices(s).filter(c => /Draw a stylus/.test(c.label));
    expect(plays.map(c => c.label)).toEqual(['a granary plate: Draw a stylus along the plate']);
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

  it('P7: a rule cannot put two known things together into a third, and the refusal names no rule', async () => {
    let error = '';
    try { await Probe.start('knows-rule'); } catch (e) { error = (e as Error).message; }
    expect(error).toBe('Rules cannot change canonical projections, clocks, records or discovery knowledge');
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

  it('P10: a companion a rule sends home is told as gone, stays in the company, and is found dead where she went', async () => {
    const s = await Probe.start('leaves');
    await Probe.act(s, 'Ask Mirel to join');
    await Probe.act(s, 'To the held field');
    await Probe.act(s, 'Dig out');
    // Her parting words are told on the page (the narrator reads her leaving); the company keeps her body.
    expect(Probe.holds(s, 'travelsWith', 'p__mirel', 'party')).toBe(false);
    expect(Probe.holds(s, 'memberOf', 'p__member_mirel_person', 'party')).toBe(true);
    await Probe.act(s, "To the holders' cord");
    expect(ScreenModel.build(s.campaign).people.some(p => /Mirel/.test(p.name))
      || JSON.stringify(ScreenModel.build(s.campaign)).includes('Mirel lies dead')).toBe(true);
  }, 60000);
});
