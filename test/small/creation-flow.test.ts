import { HandbookCreationReferences } from '../../src/client/creation-references';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';
import { TerminalCreation } from '../../src/cli/terminal-creation';
import { EngineHost } from '../../web/engine/engine-host';
import type { Asking } from '../../src/cli/terminal-input';

// Making the protagonist is one flow in the engine (CreationFlow): its steps, their cards and what a choice settles,
// so that no client keeps its own script (the owner, 14 November). The page's rules as they stood: a people narrows
// its callings, a calling with ways asks for one, a way a people may not take is shut, a new calling clears its way,
// and how one presents draws a name again until one is written. A country of two reasons for coming, and names.
const names = { human: { she: ['Wenna', 'Alis'], he: ['Odo', 'Hew'], they: ['Wren'] },
  elf: { she: ['Ithil'], he: ['Lorin'], they: ['Aerin'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }, { id: 'wanderer', title: 'Wandering',
    choice: 'You come with your trade', background: 'drifter' }], names,
  party: [Creation.protagonist('human', 'flow', names)] };

describe('making the protagonist', () => {
  // The reason for having come's own trade stays where its kind is chosen at "What did you do before this?" (the
  // second blind playtest, BL-06: Gone under's card said "Once a prospector", and the character set out a collier).
  it('keeps the trade the reason for having come gave, its kind chosen again', () => {
    const lost: Setting = { ...setting, origins: [{ id: 'lost', title: 'Gone under', choice: 'Someone went under',
      background: 'prospector' }] };
    const flow = new CreationFlow(lost, Creation.catalog(), new HandbookCreationReferences());
    flow.choose('origin', 'lost');
    flow.choose('calling', 'warrior');
    const kind = Creation.catalog().backgrounds.find(b => b.id === 'prospector')!.kind;
    flow.choose('before', kind);
    expect(flow.member.backgroundId).toBe('prospector');
  });
  // A life is not shown before it is chosen (M22's reviews, OR-25/OR-50: a mage's "before" page described Brawn, the
  // starting warrior's past): a past nobody chose follows the calling; none is laid over one the reason for coming
  // gives.
  it('takes the new calling\'s own past where none was chosen, and lays none over a reason for coming\'s', () => {
    const catalog = Creation.catalog(), own = (calling: string) => catalog.callings.find(c => c.id === calling)!.trade;
    const flow = new CreationFlow(setting, catalog, new HandbookCreationReferences());
    flow.choose('origin', 'debt');
    flow.choose('calling', 'warrior');
    flow.choose('calling', 'mage');
    expect(flow.member.backgroundId).toBe(own('mage'));
    const before = flow.steps().find(s => s.id === 'before')!;
    expect(before.cards.map(c => c.id)).toContain(before.chosen ?? '');
    const wandering = new CreationFlow(setting, catalog, new HandbookCreationReferences());
    wandering.choose('origin', 'wanderer');
    wandering.choose('calling', 'warrior');
    wandering.choose('calling', 'mage');
    // The reason for coming brings its own trade (set out with it): no calling's past is laid over it.
    expect([undefined, 'drifter']).toContain(wandering.member.backgroundId);
  });
  it('is one flow: its steps, its cards, and what a choice settles', () => {
    const flow = new CreationFlow(setting, Creation.catalog(), new HandbookCreationReferences());
    const ids = () => flow.steps().map(s => s.id);
    // A perk is asked last before the name (OR-153).
    // A warrior's way is not asked, but the calling's own until chosen in play; the trade within a kind of life is
    // asked once there is one (OR-90).
    expect(ids()).toEqual(['you', 'presenting', 'sign', 'calling', 'before', 'perk', 'name']);
    flow.choose('you', 'elf');
    expect(flow.steps().find(s => s.id === 'calling')!.cards.map(c => c.id)).not.toContain('cleric');
    flow.choose('calling', 'mage');
    const schools = Creation.catalog().callings.find(c => c.id === 'mage')!.specializations.map(t => t.id);
    // A mage's school is asked (OR-90), its first until chosen.
    expect([ids().includes('specialty'), schools.includes(flow.member.traits?.[0] ?? '')]).toEqual([true, true]);
    const school = flow.member.traits![0];
    // A new calling's way is its own (the first it offers), never the last calling's.
    flow.choose('calling', 'warrior');
    const warrior = Creation.catalog().callings.find(c => c.id === 'warrior')!.specializations.map(t => t.id);
    expect([warrior.includes(flow.member.traits?.[0] ?? ''), flow.member.traits?.[0] === school]).toEqual([true, false]);
    // What you did before is asked by its kind only; the trade within it is the one that suits the calling best.
    const catalog = Creation.catalog(), before = flow.steps().find(s => s.id === 'before')!;
    expect(before.cards.every(c => catalog.kinds.some(k => k.id === c.id))).toBe(true);
    flow.choose('before', before.cards[0]!.id);
    expect(catalog.backgrounds.find(b => b.id === flow.member.backgroundId)?.kind).toBe(before.cards[0]!.id);
    flow.choose('presenting', 'he');
    expect(flow.member.name).toBe('Lorin');
    flow.choose('name', 'Tam');
    flow.choose('presenting', 'she');
    expect([flow.member.name, flow.member.pronouns, flow.member.raceId]).toEqual(['Tam', 'she', 'elf']);
  });
  it('is shown in the terminal by its cards, and what is chosen there is what the flow made', async () => {
    // Answered by what is asked: a woman, Aud; the rest as they stand. The reason for coming is not asked.
    const said: string[] = [], asked = () => said.findLast(l => l.startsWith('\n')) ?? '';
    const answer = () => /^\nHow do you present/.test(asked()) ? '1' : /^\nChoose your name/.test(asked()) ? 'Aud' : '';
    const input = { ask: async () => answer(), close: () => undefined } as Asking;
    const made = await new TerminalCreation(input, l => said.push(l)).choose(new EngineHost(() => undefined), 'flow');
    expect(said.some(l => /Why have you come/.test(l))).toBe(false);
    expect((made.setting.origins ?? []).map(o => o.id)).toContain(made.state.origin ?? '');
    expect([made.state.member.name, made.state.member.pronouns]).toEqual(['Aud', 'she']);
  }, 60000);
  // Where a life begins is the world's (the owner, 17 November: diegetic starting circumstances): where the player
  // chose what the life did before, a circumstance of that kind of life; else the country's first; a reason chosen by
  // hand (a tester's address, ?origin=) stands.
  it('begins a life in the circumstance of the past chosen, else the country\'s first', () => {
    const catalog = Creation.catalog(), kind = (id: string) => catalog.backgrounds.find(b => b.id === id)!.kind;
    const plain = new CreationFlow(setting, catalog, new HandbookCreationReferences());
    plain.choose('calling', 'mage');
    expect(plain.circumstance()).toBe('debt');
    const wandering = new CreationFlow(setting, catalog, new HandbookCreationReferences());
    wandering.choose('calling', 'warrior');
    wandering.choose('before', kind('drifter'));
    expect(wandering.circumstance()).toBe('wanderer');
    const asked = new CreationFlow(setting, catalog, new HandbookCreationReferences());
    asked.choose('origin', 'wanderer');
    expect(asked.circumstance()).toBe('wanderer');
  });
  // A life may begin for more kinds of past than its own background's (WD-11: Iscoed's three lives had been matched by
  // one kind each, so every other past fell to the first): an origin's `kinds` are read as its background's kind is.
  it('begins a life for any kind of past its origin names, beside its own background\'s', () => {
    const catalog = Creation.catalog(), kinds = [...new Set(catalog.backgrounds.map(b => b.kind))];
    const iscoed: Setting = { ...setting, title: 'Iscoed', origins: [
      { id: 'drove', title: 'Down the drove road', choice: '', background: 'herdsman', kinds: ['wild', 'roads'] },
      { id: 'pans', title: 'The salt-pans', choice: '', background: 'laborer', kinds: ['earth', 'trade'] }] };
    const begun = (kind: string) => {
      const flow = new CreationFlow(iscoed, catalog, new HandbookCreationReferences());
      flow.choose('calling', 'warrior');
      flow.choose('before', kind);
      return flow.circumstance();
    };
    expect(kinds).toEqual(expect.arrayContaining(['wild', 'roads', 'earth', 'trade', 'water']));
    expect([begun('roads'), begun('trade'), begun('earth')]).toEqual(['drove', 'pans', 'pans']);
    // A kind no life names still begins the country's first.
    expect(begun('water')).toBe('drove');
  });
});
