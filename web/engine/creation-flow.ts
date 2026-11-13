import { Rolls } from '../../src/rules/rolls';
import { CreationDefaults } from './creation-defaults';
import type { Catalog, Member, Setting } from './protocol';

// One card of a step: what it is, in a few words and a sentence, the group it is shown under (a trade's kind), and why
// it cannot be taken, where it cannot (a way an elf may not take).
export interface CreationCard { id: string; name: string; line?: string; text?: string; group?: string; shut?: string }
export type CreationStepId = 'why' | 'you' | 'calling' | 'specialty' | 'before' | 'presenting' | 'name';
// One step of making the protagonist: its question, its cards, which is chosen, and for the name the names drawn.
export interface CreationStep {
  id: CreationStepId; ask: string; cards: CreationCard[]; chosen?: string; names?: string[];
}

// Making the protagonist, one flow for every client. The engine says the steps in order, each with its question and
// its cards and which is chosen, and what choosing a card settles. A client only shows the cards and says which was
// chosen: the page as its decks, the terminal as numbered lines (the owner, 14 November: "presenting a set of cards to
// the player should be a basic engine capability… the creation script should not be defined per-client").
// The rules of a choice are the page's own as they stood: a people narrows its callings; a calling clears its way,
// spells, weapon and trade and places the rolls where it wants them; how one presents draws a name again until one is
// written (see CreationDefaults).
export class CreationFlow {
  readonly member: Member;
  origin?: string;
  private named = false;
  constructor(readonly setting: Setting, readonly catalog: Catalog, member = setting.party[0]!) {
    this.member = structuredClone(member);
  }
  steps(): CreationStep[] {
    const c = this.catalog, m = this.member, people = c.ancestries.find(a => a.id === m.raceId);
    const calling = c.callings.find(x => x.id === m.classId), country = this.setting.title || 'this country';
    const open = c.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    return [
      { id: 'why', ask: `Why have you come to ${country}?`, chosen: this.origin, cards: (this.setting.origins ?? [])
        .map(o => ({ id: o.id, name: o.title, line: o.choice })) },
      { id: 'you', ask: 'Choose your ancestry', chosen: m.raceId, cards: c.ancestries.map(a => ({ id: a.id, name: a.name,
        line: a.line, text: a.text })) },
      { id: 'calling', ask: 'Choose your calling', chosen: m.classId, cards: c.callings
        .filter(x => !people || people.callings.includes(x.id)).map(x => ({ id: x.id, name: x.name, line: x.line,
          text: x.text })) },
      ...calling?.specializations.length ? [{ id: 'specialty' as const, ask: CreationFlow.ask(calling.id),
        chosen: m.traits?.[0], cards: calling.specializations.map(t => ({ id: t.id, name: t.name,
          ...t.line ? { line: t.line } : {}, ...t.text ? { text: t.text } : {},
          ...people?.forbids.includes(t.id) ? { shut: `Not for ${CreationFlow.plural(people)}` } : {} })) }] : [],
      { id: 'before', ask: 'What did you do before this?', chosen: m.backgroundId, cards: open.map(b => ({ id: b.id,
        name: b.name, text: b.text, group: c.kinds.find(k => k.id === b.kind)?.name ?? b.kind })) },
      { id: 'presenting', ask: 'How do you present?', chosen: m.pronouns, cards: CreationFlow.presenting
        .map(([id, name]) => ({ id, name })) },
      { id: 'name', ask: 'Choose your name', chosen: m.name, cards: [],
        names: CreationDefaults.names(m, this.setting) },
    ];
  }
  // A card chosen at a step (or, at the name, the name written): what it settles, by the page's rules.
  choose(step: CreationStepId, value: string) {
    const m = this.member, was = m.classId, people = m.raceId;
    if (step === 'why') { this.origin = value; return; }
    if (step === 'name') {
      m.name = value.trim() || CreationDefaults.names(m, this.setting)[0] || m.name;
      this.named = !!value.trim();
      return;
    }
    if (step === 'specialty') { m.traits = value ? [value] : []; delete m.spells; }
    else if (step === 'before') { m.backgroundId = value; }
    else { this.change(step === 'you' ? 'raceId' : step === 'calling' ? 'classId' : 'pronouns', value); }
    CreationDefaults.settle(m, this.catalog, { trade: !this.given(), ...was ? { was } : {} });
    if (!this.named && ((step === 'you' && value !== people) || step === 'presenting')) {
      m.name = CreationDefaults.names(m, this.setting)[0] ?? m.name;
    }
  }
  private change(field: 'raceId' | 'classId' | 'pronouns', value: string) {
    const m = this.member, was = m.classId, catalog = this.catalog;
    (m as Record<string, unknown>)[field] = value;
    // A people takes only the callings open to it: one that is not takes the first that is.
    const people = catalog.ancestries.find(a => a.id === m.raceId), open = people?.callings;
    if (field === 'raceId' && open?.length && !open.includes(m.classId ?? '')) { m.classId = open[0] as Member['classId']; }
    // A way and its spells are the calling's: a new calling, or a people that may not take the way, has none.
    if (field === 'classId' || m.classId !== was || m.traits?.some(t => people?.forbids.includes(t))) {
      delete m.traits; delete m.spells;
    }
    // A calling's weapons are its own; its rolls are placed where it wants them; and a trade is a calling's own.
    if (field !== 'classId') { return; }
    delete m.weapon;
    const wants = catalog.callings.find(c => c.id === m.classId)?.qualities;
    if (m.rolled && wants) { m.rolled = Rolls.suited(m.rolled as Record<string, number>, wants); }
    const trade = catalog.backgrounds.find(b => b.id === m.backgroundId);
    if (trade?.calling && trade.calling !== m.classId) { delete m.backgroundId; }
  }
  // Whether the reason for having come gives a trade of its own (one who comes over the hills brings their own).
  private given(): boolean { return !!this.setting.origins?.find(o => o.id === this.origin)?.background; }
  static readonly presenting = [['she', 'A woman'], ['he', 'A man'], ['they', 'Neither']] as const;
  static ask(calling: string): string {
    return calling === 'cleric' ? 'Choose your domain' : calling === 'mage' ? 'Choose your school' : 'Choose your way';
  }
  static plural(people: { id: string; name: string }): string {
    const name = people.name.toLowerCase();
    return ({ elf: 'elves', dwarf: 'dwarves' } as Record<string, string>)[people.id] ?? (/folk$/.test(name) ? name
      : `${name}s`);
  }
}
