import { Rolls } from '../../src/rules/rolls';
import { CreationDefaults } from './creation-defaults';
import type { Catalog, Member, Setting } from './protocol';

// One card of a step: what it is, in a few words and a sentence, the group it is shown under (a trade's kind), and why
// it cannot be taken, where it cannot (a way an elf may not take).
// emblem: the id of its emblem (see Emblems), drawn as a line glyph on the page and as its character in text (Signs).
export interface CreationCard {
  id: string; name: string; line?: string; text?: string; group?: string; shut?: string; emblem?: string;
}
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
    const country = this.setting.title || 'this country';
    const open = c.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    return [
      { id: 'why', ask: `Why have you come to ${country}?`, chosen: this.origin, cards: (this.setting.origins ?? [])
        .map(o => ({ id: o.id, name: o.title, line: o.choice, emblem: o.id })) },
      { id: 'you', ask: 'Choose your ancestry', chosen: m.raceId, cards: c.ancestries.map(a => ({ id: a.id, name: a.name,
        line: a.line, text: a.text, emblem: a.id })) },
      { id: 'calling', ask: 'Choose your calling', chosen: m.classId, cards: c.callings
        .filter(x => !people || people.callings.includes(x.id)).map(x => ({ id: x.id, name: x.name, line: x.line,
          text: x.text, emblem: x.id })) },
      // The calling only: its way (a cleric's domain, a mage's school, a warrior's way) is the calling's first until
      // another is chosen later in play (the owner, 14 November: "just select the high-level profession").
      // The kind of life only: the trade within it is the one that best suits the calling, chosen later in play if at
      // all (the owner, 14 November: "just select the high-level category at first, and then later we can backfill").
      { id: 'before', ask: 'What did you do before this?', chosen: open.find(b => b.id === m.backgroundId)?.kind,
        cards: c.kinds.filter(k => open.some(b => b.kind === k.id))
          .map(k => ({ id: k.id, name: k.name, line: k.does, emblem: `life_${k.id}` })) },
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
    else if (step === 'before') { m.backgroundId = this.trade(value) ?? m.backgroundId; }
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
  // Of a kind of life, the trade that best suits the calling (by what it adds where the calling wants it), as the
  // page's trade step ranks them.
  private trade(kind: string): string | undefined {
    const c = this.catalog, wants = c.callings.find(x => x.id === this.member.classId)?.qualities ?? {};
    const of = c.backgrounds.filter(b => b.kind === kind && (!b.calling || b.calling === this.member.classId));
    // A calling's own trade of the kind first (a cleric's novice), else the best suited.
    return (of.find(b => b.calling) ?? [...of].sort((a, b) => CreationFlow.fit(b.qualities, wants)
      - CreationFlow.fit(a.qualities, wants))[0])?.id;
  }
  static fit(adds: Record<string, number>, wants: Record<string, number>): number {
    return Object.entries(wants).reduce((t, [k, w]) => t + (adds[k] ?? 0) * w, 0);
  }
  // Whether the reason for having come gives a trade of its own (one who comes over the hills brings their own).
  private given(): boolean { return !!this.setting.origins?.find(o => o.id === this.origin)?.background; }
  static readonly presenting = [['she', 'A woman'], ['he', 'A man'], ['they', 'Neither']] as const;
}
