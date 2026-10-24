import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Environment } from '../src/campaign/environment';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList, type Choice } from '../src/ui/choice-list';
import { Canon } from '../src/canon/canon';
import { KyrLint } from '../src/cli/kyr-lint';

// What an independent author met writing The House That Grows (doc/adventures/house-that-grows/ledger.md, on the
// branch house-that-grows-authoring), with the smallest fixture that shows each finding. Mission 12 repaired most of
// them; each test now says what an author can do, and the ledger entry it answers is named first.
class Probe {
  static start(name: string, seed = 'p') {
    return PlaySession.start(`test/fixtures/probes/${name}`, seed, NodeBundleSource.shared);
  }
  static leaves(list: Choice[], trail = ''): { label: string; command?: string }[] {
    return list.flatMap(c => c.children ? this.leaves(c.children, `${trail}${c.label} › `)
      : [{ label: trail + c.label, ...c.command ? { command: c.command } : {} }]);
  }
  static choices(s: PlaySession) {
    return this.leaves(ChoiceList.all(ChoiceList.explore(ScreenModel.build(s.campaign)))).filter(c => c.command);
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
  static measure(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.number(ModuleWriter.call(name, ...args));
  }
  static async lint(name: string) { return KyrLint.campaign(`test/fixtures/probes/${name}`, new NodeBundleSource()); }
}

describe('Authorability probes', () => {
  it('K1: an adventure declares a kind of thing of its own, with its worth and weight', async () => {
    expect((await Probe.lint('local-kind/probe.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('local-kind/probe.campaign.json');
    expect(Canon.items.dreg_ox?.value).toBe(2);
    expect([Canon.items.day_jar?.slot, Canon.items.day_jar?.grants?.skill]).toEqual(['book', 'sunlight']);
    expect(Probe.measure(s, 'mass', 'dreg_ox')).toBe(1);
    expect(ScreenModel.build(s.campaign).things.some(t => /little ox of dreg/.test(t.name))).toBe(true);
  }, 60000);

  it('K2: a condition applied for hours outside a fight takes, and wears off with the clock', async () => {
    expect((await Probe.lint('sleep-hours/probe.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('sleep-hours/probe.campaign.json', 'q');
    await Probe.act(s, '^Wait › A while');
    const body = () => s.campaign.readout.creatures.find(c => s.campaign.readout.partyIds.includes(c.id))!;
    const asleep = body().state.conditions.some(c => c.id === 'asleep');
    expect(Probe.holds(s, 'awake', 'p__member_party_1')).toBe(!asleep);
    if (!asleep) { return; }
    // Asleep, the one who plays can do nothing but lie as they are until it wears off.
    expect(Probe.choices(s).map(c => c.label)).toEqual(['Lie as you are']);
    for (let i = 0; i < 8 && !Probe.holds(s, 'awake', 'p__member_party_1'); i++) { await Probe.act(s, 'Lie as you are'); }
    expect(Probe.holds(s, 'awake', 'p__member_party_1')).toBe(true);
  }, 60000);

  it('K2: the same condition for turns lasts as many watches outside a fight', async () => {
    const s = await Probe.start('sleep-turns/probe.campaign.json', 'q');
    await Probe.act(s, '^Wait › A while');
    const body = s.campaign.readout.creatures.find(c => s.campaign.readout.partyIds.includes(c.id))!;
    const held = body.state.conditions.find(c => c.id === 'asleep');
    if (held) { expect(held.clock).toBe('world-time'); expect(held.remaining).toBeGreaterThan(0); }
  }, 60000);

  it('K4: a query asked about someone not yet known is answered for whoever satisfies it', async () => {
    const s = await Probe.start('unbound-query/probe.campaign.json');
    await Probe.act(s, '^Wait › A while');
    expect(Probe.holds(s, 'p__grew', 'p__room1')).toBe(true);
  }, 60000);

  it('K5: each room left to chance throws its own die', async () => {
    const s = await Probe.start('house/house.campaign.json');
    await Probe.act(s, 'Into the Annex');
    await Probe.act(s, 'Turn your back');
    await Probe.act(s, 'far door');
    const sizes: number[][] = [];
    for (let i = 0; i < 8; i++) {
      await Probe.act(s, '^Wait › An hour');
      sizes.push(['h__bedroom', 'h__coats_low', 'h__long_hall'].map(r => Probe.measure(s, 'h__size', r)));
    }
    expect(sizes.some(([a, b, c]) => a !== b || b !== c)).toBe(true);
  }, 60000);

  it('K5: measures are added, taken away and multiplied as the world runs, the changes in their order', async () => {
    expect((await Probe.lint('reckoning/probe.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('reckoning/probe.campaign.json'), seen: number[][] = [];
    for (let argued = true; argued;) {
      seen.push([Probe.measure(s, 'p__fare', 'party'), Probe.measure(s, 'p__owed', 'party')]);
      argued = Probe.choices(s).some(c => /Argue the fare/.test(c.label));
      if (argued) { await Probe.act(s, 'Argue the fare'); }
    }
    // fare * 2 - 1, and owed by the new fare + 1, until fare * 2 - 1 < 20 no longer holds.
    expect(seen).toEqual([[3, 0], [5, 6], [9, 16], [17, 34]]);
  }, 60000);

  it('K6: a rule can take a way out of the world, and the exit goes with it', async () => {
    const s = await Probe.start('house/house.campaign.json');
    await Probe.act(s, 'Into the Annex');
    await Probe.act(s, 'Turn your back');
    await Probe.act(s, 'far door');
    expect(Probe.choices(s).some(c => /crack in the glass/.test(c.label))).toBe(true);
    for (let i = 0; i < 24 && Probe.holds(s, 'connects', 'h__nowhere', 'h__long_hall', 'h__coats_high'); i++) {
      await Probe.act(s, '^Wait › An hour');
    }
    expect(Probe.holds(s, 'connects', 'h__nowhere', 'h__long_hall', 'h__coats_high')).toBe(false);
    expect(Probe.choices(s).some(c => /crack in the glass/.test(c.label))).toBe(false);
  }, 60000);

  it('Finding 5: a way opens only while something holds, and says how it looks shut', async () => {
    expect((await Probe.lint('moon-gate/probe.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('moon-gate/probe.campaign.json');
    const gate = (x: { command?: string }) => x.command?.startsWith('go(p__gate,') ?? false;
    expect(Probe.choices(s).some(gate)).toBe(false);
    expect(ScreenModel.build(s.campaign).observed.map(o => o.text).join(' ')).toContain('By day it is only a ring.');
    await s.perform('wait_for_dark');
    expect(Probe.choices(s).some(gate)).toBe(true);
    await s.perform(Probe.choices(s).find(gate)!.command!);
    expect(s.campaign.world.one('at', 'party')).toBe('p__garden');
    await s.perform('wait_for_light');
    expect(Probe.choices(s).some(gate)).toBe(false);
  }, 60000);

  it('K7: a kinsman who joins is still himself, and can be asked what he could be asked at home', async () => {
    const s = await Probe.start('ordinary/ordinary.campaign.json');
    expect(Probe.choices(s).some(c => /Ask Tobu about his aunt/.test(c.label))).toBe(true);
    expect(await Probe.act(s, 'Ask Tobu to join')).not.toContain('shakes on it');
    expect(Probe.holds(s, 'travelsWith', 'o__tobu', 'party')).toBe(true);
    expect(Probe.choices(s).some(c => /Ask Tobu about his aunt/.test(c.label))).toBe(true);
  }, 60000);

  it('K7: one led keeps his voice and follows through any door', async () => {
    const s = await Probe.start('company/company.campaign.json');
    // Nobody can be let go who has not come.
    expect(Probe.choices(s).some(c => /Let them make their own way/.test(c.label))).toBe(false);
    await Probe.act(s, 'Ask them to come with you');
    expect(Probe.choices(s).some(c => /Let them make their own way/.test(c.label))).toBe(true);
    await Probe.act(s, 'To the glass bedroom');
    expect(Probe.choices(s).some(c => /Ask Tobu about his aunt/.test(c.label))).toBe(true);
    await Probe.act(s, 'Close your eyes in the bedroom');
    expect(Probe.holds(s, 'at', 'c__tobu', 'c__long_hall')).toBe(true);
  }, 60000);

  it('K8: an owner asleep does not see her cup taken', async () => {
    const s = await Probe.start('owner-asleep/probe.campaign.json');
    expect(await Probe.act(s, '^Take')).not.toContain("'That is mine.'");
    expect(Probe.holds(s, 'hostile', 'p__kezu', 'party')).toBe(false);
  }, 60000);

  it('K9: a peaceable dog keeps the peace, whatever its kind would do', async () => {
    const s = await Probe.start('ordinary/ordinary.campaign.json');
    expect(await Probe.act(s, 'Into the sleeping-hall')).not.toContain('will not have you here for long');
    expect(Probe.holds(s, 'peaceable', 'o__bolt')).toBe(true);
  }, 60000);

  it('K10: a law one module declares is shared by a module written against it', async () => {
    expect((await Probe.lint('shared-law/shared.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('shared-law/shared.campaign.json');
    expect(Probe.holds(s, 'held', 'site__room1')).toBe(true);
  }, 60000);

  it('K11: selm weighs less than nothing, and the world can say so', async () => {
    const s = await Probe.start('selm/selm.campaign.json');
    expect(Probe.measure(s, 'mass', 'selm_stone')).toBe(-2);
    expect(await Probe.act(s, '^Wait › A while')).toContain('does not come down');
  }, 60000);

  it('F15: an observation near a variable is told near each entity its condition finds, wherever that is', async () => {
    expect((await Probe.lint('lamps/probe.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('lamps/probe.campaign.json');
    const glows = () => ScreenModel.build(s.campaign).observed.filter(o => o.id.startsWith('p__glow@')).map(o => o.id);
    expect(glows()).toEqual(['p__glow@p__iron_lamp']);
    expect(ScreenModel.build(s.campaign).observed.map(o => o.text).join(' ')).toContain('The iron lamp burns low and yellow');
    await Probe.act(s, 'Light every lamp');
    expect(glows()).toEqual(['p__glow@p__iron_lamp']);
    await Probe.act(s, 'byre');
    expect(glows()).toEqual(['p__glow@p__horn_lamp']);
  }, 60000);

  it('F17: someone seen only by some is not there, and cannot be spoken to, for anyone else', async () => {
    expect((await Probe.lint('grey-lady/probe.campaign.json')).filter(f => f.level === 'error')).toEqual([]);
    const s = await Probe.start('grey-lady/probe.campaign.json');
    const lady = () => ScreenModel.build(s.campaign).people.some(p => p.id === 'p__lady');
    expect(lady()).toBe(false);
    expect(Probe.choices(s).some(c => /grey lady/.test(c.label))).toBe(false);
    await Probe.act(s, 'Light the grey candle');
    expect(lady()).toBe(true);
    expect(await Probe.act(s, 'why she stays')).toContain('They took the bell');
  }, 60000);

  it('F19: a company grows weary eighteen hours after it slept, fights weary, and a night\'s sleep mends it', async () => {
    const s = await Probe.start('tired/probe.campaign.json');
    let told = '';
    for (let i = 0; i < 40 && Probe.measure(s, 'watch', 'clock') < 108; i++) {
      expect(Probe.holds(s, 'weary', 'party')).toBe(false);
      told = await Probe.act(s, '^Wait › An hour');
    }
    expect(Probe.holds(s, 'weary', 'party')).toBe(true);
    expect(told).not.toContain('weary');
    expect(ScreenModel.build(s.campaign).expedition.weary).toBe(true);
    // Whoever of the company fights now fights weary (see Battle.encounter's weary, and test/fighting-objects).
    expect(Environment.encounter(s.campaign.world, 'party', ['a', 'b']).weary).toEqual(['a', 'b']);
    await Probe.act(s, '^Make camp');
    expect(Probe.holds(s, 'weary', 'party')).toBe(false);
    // The eighteen hours run from waking, not from lying down: a long night does not leave less of the day.
    const woke = Probe.measure(s, 'watch', 'clock');
    for (let i = 0; i < 40 && Probe.measure(s, 'watch', 'clock') < woke + 102; i++) { await Probe.act(s, '^Wait › An hour'); }
    expect(Probe.holds(s, 'weary', 'party')).toBe(false);
  }, 60000);

  it('K12: an error in a declaration is said with its file, line and column', async () => {
    await expect(Probe.lint('bad-kind/probe.campaign.json')).rejects.toThrow(/site\.kyr:4:3: Kind wyrd is like nothing_at_all, which is no kind of item/);
  });
});
