import { Rolls } from '../../src/rules/rolls';
import { CreationDefaults } from './creation-defaults';
import type { Catalog, Member, Setting } from './protocol';

// One card of a step: what it is, in a few words and a sentence, the group it is shown under (a trade's kind), and why
// it cannot be taken, where it cannot (a way an elf may not take).
// emblem: the id of its emblem (see Emblems), drawn as a line glyph on the page and as its character in text (Signs).
export interface CreationCard {
  id: string; name: string; line?: string; text?: string; group?: string; shut?: string; emblem?: string;
}
export type CreationStepId = 'why' | 'you' | 'sign' | 'calling' | 'specialty' | 'before' | 'presenting' | 'name';
// What may be chosen besides a step's card, behind Details (the page's own rules once: workflow-parity's first rows):
// a trade by name within the kind of life; the weapon in hand; two qualities' rolls changed over ("a:b"); the rolls
// thrown again; and the first spells known ("a,b,c").
// A name taken from the table of names (drawn) is borne but still the table's: a new people or way of presenting draws
// again over it, as over a name never written.
export type CreationChoice = CreationStepId | 'trade' | 'weapon' | 'place' | 'reroll' | 'spells' | 'drawn';
// One step of making the protagonist: its question, its cards, which is chosen, and for the name the names drawn.
// cards: every card, the four the step leads with first (the owner, 14 November: four promoted on every surface, the
// rest reachable); a client shows the first four and offers the rest, numbered as they stand.
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
  // The sign the life was first drawn under: the signs turn from it, and never from the one chosen since.
  private readonly drawnSign?: string;
  constructor(readonly setting: Setting, readonly catalog: Catalog, member = setting.party[0]!) {
    this.member = structuredClone(member);
    // Born under a sign until another is chosen: one of the sky's, drawn by the country and the name.
    const signs = catalog.signs, drawn = [...`${setting.title}${member.name ?? ''}`].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    if (signs.length && !this.member.sign) { this.member.sign = signs[drawn % signs.length]!.id; }
    this.drawnSign = this.member.sign;
  }
  steps(): CreationStep[] { return this.unranked().map(step => ({ ...step, cards: this.ranked(step) })); }
  // A step's cards in the order it leads with them, where it has more than four: of peoples, those of this country
  // (its names are theirs); of kinds of life, those best suited to the calling (as a trade of the kind is chosen);
  // and the rest as the catalog gives them. Never by what is chosen: a card chosen had leapt to the front, and the
  // deck reshuffled under the player's hand at every press (the owner, 14 November).
  private ranked(step: CreationStep): CreationCard[] {
    // Four or fewer are all shown, in their own order (she, he, neither).
    if (step.cards.length <= 4) { return step.cards; }
    return step.cards.map((card, i) => ({ card, i, score: this.score(step, card) }))
      .sort((x, y) => y.score - x.score || x.i - y.i).map(x => x.card);
  }
  private score(step: CreationStep, card: CreationCard): number {
    const c = this.catalog, wants = c.callings.find(x => x.id === this.member.classId)?.qualities ?? {};
    const suits = step.id === 'before' ? Math.max(0, ...c.backgrounds.filter(b => b.kind === card.id)
      .map(b => CreationFlow.fit(b.qualities, wants))) : 0;
    const here = step.id === 'you' && Object.hasOwn(this.setting.names ?? {}, card.id);
    // Of signs, those of the months following the one the life was drawn under, as the sky turns.
    const ids = step.cards.map(x => x.id), from = ids.indexOf(this.drawnSign ?? '');
    const turning = step.id === 'sign' && from >= 0 ? ids.length - ((ids.indexOf(card.id) - from + ids.length) % ids.length) : 0;
    return (here ? 1e6 : 0) + suits + turning;
  }
  private unranked(): CreationStep[] {
    const c = this.catalog, m = this.member, people = c.ancestries.find(a => a.id === m.raceId);
    const country = this.setting.title || 'this country';
    const open = c.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    return [
      { id: 'why', ask: `Why have you come to ${country}?`, chosen: this.origin, cards: (this.setting.origins ?? [])
        .map(o => ({ id: o.id, name: o.title, line: o.choice, emblem: o.id })) },
      { id: 'you', ask: 'Choose your ancestry', chosen: m.raceId, cards: c.ancestries.map(a => ({ id: a.id, name: a.name,
        line: a.line, text: a.text, emblem: a.id })) },
      // The sky they were born under (data/imbar/sky.json): a sign of Imbar's own months, which the world can read in
      // them. A page may draw it as a sky; the terminal names it. The owner, 14 November: the observatory (TO-04).
      { id: 'sign', ask: 'Under which stars were you born?', chosen: m.sign, cards: c.signs.map(x => ({ id: x.id,
        name: x.name, line: `${x.month}: ${x.line}`, emblem: x.id })) },
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
  choose(step: CreationChoice, value: string) {
    const m = this.member, was = m.classId, people = m.raceId;
    if (step === 'why') { this.origin = value; return; }
    if (step === 'weapon') { m.weapon = value; return; }
    if (step === 'drawn') { m.name = value; this.named = false; return; }
    if (step === 'spells') { m.spells = value.split(',').filter(Boolean); return; }
    if (step === 'place') { this.place(value); return; }
    if (step === 'reroll') { this.reroll(); return; }
    if (step === 'trade') { if (value) { m.backgroundId = value; } else { delete m.backgroundId; } return; }
    if (step === 'name') {
      m.name = value.trim() || CreationDefaults.names(m, this.setting)[0] || m.name;
      this.named = !!value.trim();
      return;
    }
    if (step === 'sign') { m.sign = value; return; }
    if (step === 'specialty') { m.traits = value ? [value] : []; delete m.spells; }
    else if (step === 'before') { m.backgroundId = this.trade(value) ?? m.backgroundId; }
    else { this.change(step === 'you' ? 'raceId' : step === 'calling' ? 'classId' : 'pronouns', value); }
    CreationDefaults.settle(m, this.catalog, { trade: !this.given(), ...was ? { was } : {} });
    if (!this.named && ((step === 'you' && value !== people) || step === 'presenting')) {
      m.name = CreationDefaults.names(m, this.setting)[0] ?? m.name;
    }
  }
  // Two qualities' rolls changed over, as the player places them ("strength:wisdom").
  private place(pair: string) {
    const rolled = this.member.rolled as Record<string, number> | undefined, [a, b] = pair.split(':');
    if (!rolled || !a || !b || rolled[a] === undefined || rolled[b] === undefined) { return; }
    [rolled[a], rolled[b]] = [rolled[b]!, rolled[a]!];
  }
  // Six new rolls of three dice, one on each quality where it falls, then placed where the calling wants them.
  private reroll() {
    const m = this.member;
    if (!m.rolled) { return; }
    const die = new Uint8Array(18);
    crypto.getRandomValues(die);
    m.rolled = Object.fromEntries(Object.keys(m.rolled).map((q, i) => [q,
      [0, 1, 2].reduce((sum, k) => sum + 1 + die[i * 3 + k]! % 6, 0)]));
    const wants = this.catalog.callings.find(c => c.id === m.classId)?.qualities;
    if (wants) { m.rolled = Rolls.suited(m.rolled as Record<string, number>, wants); }
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
