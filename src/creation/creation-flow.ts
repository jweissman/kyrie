import { Rolls } from '../rules/rolls';
import { CreationDefaults } from './creation-defaults';
import { BackgroundCatalog } from '../rules/background-catalog';
import { CreationRules } from './creation-rules';
import { Words } from '../presentation/words';
import type { Catalog, Member, Setting } from './protocol';
import { CreationPerks } from './creation-perks';
import { CreationSpells, type SpellStepId } from './creation-spells';
import { CreationEntries } from './creation-entries';

// One card of a step: what it is, in a few words and a sentence, the group it is shown under (a trade's kind), and why
// it cannot be taken, where it cannot (a way an elf may not take).
// emblem: the id of its emblem (see Emblems), drawn as a line glyph on the page and as its character in text (Signs).
// aside: the few words a page sets beside its name (a sign's month, a way of presenting's words); say: the sentence it
// is considered by, where that is not its line (a people's first sentence).
// entry: what the reference says of it (the handbook's own entry: its facts and rules), for a client to set beside the
// choice as it is considered (the owner, 17 November: "hovering over Elf shows the details for elves"; PA-05).
export interface CreationCard {
  id: string; name: string; line?: string; text?: string; group?: string; shut?: string; emblem?: string;
  aside?: string; say?: string; entry?: CreationEntry;
}
// play: what it is in play, in a line (a people's qualities as a stat line, a calling's hit die and armour: see
// CreationEntries), set under its name.
// groups: things listed under the entry, a heading over each, each by its emblem, its name and a line (the spells a
// school sets out knowing, at will and at first level); after: a line under them (those known now, cast later).
export interface CreationEntry {
  facts: [string, string][]; rules: string[]; play?: string;
  groups?: { heading: string; rows: { id: string; name: string; line: string; emblem?: string }[] }[]; after?: string;
}
// How a step is best drawn, a hint every client may take or leave (the owner, 17 November: the engine says the
// question, its options and how they may be shown; no client keeps a page of its own per step): as cards (a people,
// a calling), as rows, as one dense list (the names of a people, creation's one exception to four in view), or as
// rows over the sky they are signs of (the observatory).
export type CreationPresent = 'cards' | 'rows' | 'list' | 'sky';
export type CreationStepId = 'you' | 'sign' | 'calling' | 'specialty' | 'before' | 'trade' | 'perk'
  | 'presenting' | 'name' | SpellStepId;
// What may be chosen besides a step's card, behind Details (the page's own rules once: workflow-parity's first rows):
// a trade by name within the kind of life; the weapon in hand; two qualities' rolls changed over ("a:b"); the rolls
// thrown again; and the first spells known ("a,b,c").
// A name taken from the table of names (drawn) is borne but still the table's: a new people or way of presenting draws
// again over it, as over a name never written.
// back and onward move between the steps (the flow keeps where it stands); roll deals another hand of a step's options
// (the names of a people). origin is where the life begins, named outside the making (a tester's ?origin=): no step
// asks it (OB-16).
export type CreationChoice = CreationStepId | 'trade' | 'weapon' | 'place' | 'reroll' | 'spells' | 'drawn' | 'back'
  | 'onward' | 'roll' | 'origin';
// One step of making the protagonist: its question, its cards, which is chosen, and for the name the names drawn.
// cards: every card, the four the step leads with first (the owner, 14 November: four promoted on every surface, the
// rest reachable); a client shows the first four and offers the rest, numbered as they stand, unless all (every card
// at once: they are few, or a list). write: a field to write one's own in, by its placeholder; roll: the act that
// deals another hand of the cards, by its aside; again: that act's words, as it truly does it (OR-1274): "Roll again"
// where the hand is drawn (the names), "More…" where it is the next of a list in its order (the trades, best suited
// first), never a draw promised that is not made.
// leads: what the next step asks hangs on the card chosen here (the calling's art, the kind's trades, the names for
// how one presents), so a client waits for the engine's answer before going on, never showing the next step as it
// stood before.
// emblems: each card's emblem is drawn beside its name, whatever the step is drawn as (a school's, a spell's school).
// many: how many are taken at the step (a caster's first spells), each card a press that takes it or lets it go
// (picked: those taken), and the last card the one that goes on with them.
export interface CreationStep {
  id: CreationStepId; ask: string; cards: CreationCard[]; chosen?: string; names?: string[]; present: CreationPresent;
  all?: boolean; write?: string; roll?: string; again?: string; leads?: boolean; emblems?: boolean; many?: number;
  picked?: string[];
  // How a choice is made, said once, at the first step: what comes to a row reads it, and a press chooses it (OR-255).
  how?: string;
  // Where the step stands in the making, and how many steps there are with setting out the last (OR-1136, the third
  // review: the steps had looked alike, and nothing said how far through the player was): a hint every client draws
  // quietly (the page over its question, the terminal on the line before it).
  place?: { at: number; of: number };
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
  // Whether the reason for having come was named (a tester's address or a spec: no step asks it); else the world
  // gives it at setting out, as the life's circumstance (see circumstance).
  private asked = false;
  // Whether the player chose what the life did before (its kind of life), which the circumstance follows.
  private past = false;
  // Whether the trade within it was chosen too (the life then says it: "Once a sailor").
  private traded = false;
  // The sign the life was first drawn under: the signs turn from it, and never from the one chosen since.
  private readonly drawnSign?: string;
  // The step the making stands at ('go': setting out), and the hands of names dealt since the people or the way of
  // presenting last changed.
  private at?: CreationStepId | 'go';
  private rolls = 0;
  // Who one is, chosen by the player (the owner's playtest, 26 November, OR-1272: ancestry and presentation had shown
  // as chosen before they were): until a step of these is chosen, none of its cards is marked chosen.
  private readonly owned = new Set<CreationChoice>();
  // The hands of trades dealt since the kind of life last changed (see trades).
  private dealt = 0;
  constructor(readonly setting: Setting, readonly catalog: Catalog, member = setting.party[0]!) {
    this.member = structuredClone(member);
    // Born under a sign until another is chosen: one of the sky's, drawn by the country and the name.
    const signs = catalog.signs, drawn = [...`${setting.title}${member.name ?? ''}`].reduce((n, ch) => n + ch.charCodeAt(0), 0);
    if (signs.length && !this.member.sign) { this.member.sign = signs[drawn % signs.length]!.id; }
    if (catalog.perks?.length && !this.member.perk) { this.member.perk = CreationPerks.drawn(`${setting.title}${member.name ?? ''}`); }
    this.drawnSign = this.member.sign;
  }
  // The reason for having come is not asked: the world gives it, as where the life begins (the owner, 17 November:
  // "remove the abstract origin-quest selection in favor of diegetic starting circumstances"; see circumstance).
  steps(): CreationStep[] {
    const all = this.unranked();
    return all.map((step, i) => ({ ...step, cards: this.ranked(step), place: { at: i + 1, of: all.length + 1 },
      ...CreationFlow.leading.includes(step.id) ? { leads: true } : {} }));
  }
  // How one presents leads too: the names asked next are drawn for it, and the page going on before the engine's answer
  // had shown the hand drawn before (a woman's names) and then swapped in the new (OR-119: the names page flickering).
  static readonly leading: CreationStepId[] = ['calling', 'specialty', 'before', 'presenting'];
  // Where the making stands: the step asked now (the first until another), or setting out.
  current(): CreationStepId | 'go' {
    const ids = this.steps().map(x => x.id);
    return this.at === 'go' || (this.at && ids.includes(this.at)) ? this.at : ids[0] ?? 'go';
  }
  // The step a step on, or back (from setting out, the last step); back from the first, none.
  beside(by: 1 | -1): CreationStepId | 'go' | undefined {
    const ids: (CreationStepId | 'go')[] = [...this.steps().map(x => x.id), 'go'], i = ids.indexOf(this.current());
    return ids[Math.min(ids.length - 1, i + by)];
  }
  private move(by: 1 | -1) { this.at = this.beside(by) ?? this.at; }
  // Where the life begins: the reason chosen by hand where one was; else, where the player chose what the life did
  // before, a circumstance of that kind of life (one who came over the hills with their trade), drawn among them by
  // the country and the life so that lives made differently begin differently; else the country's first.
  circumstance(): string | undefined {
    const origins = this.setting.origins ?? [];
    if (this.asked || !origins.length) { return this.origin; }
    const kind = this.past ? this.kindOf(this.member.backgroundId) : undefined;
    // A life begins so for its own background's kind of past, and for any its manifest names (`kinds`).
    const own = kind ? origins.filter(o => o.kinds?.includes(kind)
      || (o.background && this.kindOf(o.background) === kind)) : [];
    if (!own.length) { return origins[0]!.id; }
    const m = this.member, key = `${this.setting.title}|${m.raceId}|${m.classId}|${m.backgroundId ?? ''}|${m.pronouns ?? ''}`;
    const n = [...key].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
    return own[n % own.length]!.id;
  }
  // A step's cards in the order it leads with them, where it has more than four: of peoples, those of this country
  // (its names are theirs); of kinds of life, those best suited to the calling (as a trade of the kind is chosen);
  // and the rest as the catalog gives them. Never by what is chosen: a card chosen had leapt to the front, and the
  // deck reshuffled under the player's hand at every press (the owner, 14 November).
  private ranked(step: CreationStep): CreationCard[] {
    // Four or fewer are all shown, in their own order (she, he, neither); so is a set shown whole (the twelve signs in
    // the months' order, as the zodiac beside them stands: FM-02).
    if (step.cards.length <= 4 || step.id === 'sign' || step.id === 'name' || step.id === 'trade') { return step.cards; }
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
  // Coming to a row (the pointer over it, the arrow keys on it, a finger going down) tells of it beside the question;
  // pressing it chooses it and goes on. Said nowhere, the first cold play's reader pressed Catfolk to read of it, and
  // it was chosen (OR-255, P2, P4).
  static readonly how = 'Come to one to read of it. A press chooses it; Back undoes the choice.';
  private unranked(): CreationStep[] {
    const c = this.catalog, m = this.member, people = c.ancestries.find(a => a.id === m.raceId);
    const open = c.backgrounds.filter(b => !b.calling || b.calling === m.classId);
    return [
      { id: 'you', ask: 'Choose your ancestry', how: CreationFlow.how, present: 'cards',
        ...this.owned.has('you') ? { chosen: m.raceId } : {},
        cards: c.ancestries.map(a => ({ id: a.id,
        name: a.name, line: a.line, text: a.text, emblem: a.id, ...CreationFlow.said(a),
        ...CreationFlow.has(CreationEntries.people(a)) })) },
      // How one presents, second, before anything named for who one is (the owner, 19 November: "you can be a male
      // abbess"): a trade's word, an abbot or an abbess, is said for the one choosing it.
      { id: 'presenting', ask: 'How do you present?', present: 'rows', all: true,
        ...this.owned.has('presenting') ? { chosen: m.pronouns } : {},
        cards: CreationFlow.presenting.map(([id, name, aside]) => ({ id, name, aside,
          say: 'The words the world will speak of you in.' })) },
      // The sky they were born under (data/imbar/sky.json): a sign of Imbar's own months, which the world can read in
      // them. A page may draw it as a sky; the terminal names it. The owner, 14 November: the observatory (TO-04).
      // All twelve at once, the whole zodiac beside them (FM-02: a fixed set's instrument, the four's exception).
      { id: 'sign', ask: 'Under which stars were you born?', present: 'sky', all: true, chosen: m.sign, cards: c.signs.map(x => ({
        id: x.id, name: x.name.replace(/^the /, 'The '), line: `${x.month}: ${x.line}`, emblem: x.id, aside: x.month,
        say: x.line, ...CreationFlow.has(x.entry) })) },
      { id: 'calling', ask: 'Choose your calling', present: 'cards', chosen: m.classId, cards: c.callings
        .filter(x => !people || people.callings.includes(x.id)).map(x => ({ id: x.id, name: x.name, line: x.line,
          text: x.text, emblem: x.id, ...CreationFlow.said(x), ...CreationFlow.has(CreationEntries.calling(x)) })) },
      ...this.specialty(), ...this.spells(),
      // Every kind of life at once, each said by what it is and beside it the reference's entry (the owner, 18
      // November, OR-88: "it's reasonable to show all of them rather than force multiple pages… some indication from
      // the encyclopedia of what the choice means"); then the trade within it, asked in its own words (OR-90).
      { id: 'before', ask: 'What did you do before this?', present: 'list', all: true,
        chosen: open.find(b => b.id === m.backgroundId)?.kind,
        cards: c.kinds.filter(k => open.some(b => b.kind === k.id))
          .map(k => ({ id: k.id, name: k.name, line: k.does, emblem: `life_${k.id}`, ...k.life ? { say: k.life } : {},
            entry: k.entry })) },
      ...this.trades(),
      // A perk, the last thing chosen of who one is (OR-153): one of each of the Atlas's five families (CreationPerks).
      ...c.perks?.length ? [{ id: 'perk' as const, ask: 'What sets you apart?', present: 'rows' as const, all: true as const,
        chosen: m.perk, cards: c.perks.map(x => ({ id: x.id, name: x.name, line: x.line, say: x.line,
          emblem: CreationPerks.emblems[x.id] ?? x.id })) }] : [],
      // The names of your people as one list, a hand of them at a time (creation's one dense menu: the owner, 17
      // November), another hand dealt on asking, and a field to write your own in.
      { id: 'name', ask: 'Choose your name', present: 'list', all: true, chosen: m.name, write: 'Or write your own',
        roll: 'other names of your people', again: 'Roll again', cards: CreationDefaults.table(m, this.setting, this.rolls)
          .map(name => ({ id: name, name, say: '' })), names: CreationDefaults.names(m, this.setting) },
    ];
  }
  // A caster's school or god's domain, asked as the life knows it (the owner, 18 November, OR-90: "I do feel like
  // we've lost something not putting casters through school/domain selection"): a mage's art, a cleric's god's keeping;
  // a warrior's or a monk's way stays the calling's first until chosen in play. A way the people may not take is shown
  // shut.
  private specialty(): CreationStep[] {
    const c = this.catalog, m = this.member, calling = c.callings.find(x => x.id === m.classId);
    const ask = CreationFlow.asks[m.classId ?? ''], forbids = c.ancestries.find(a => a.id === m.raceId)?.forbids ?? [];
    if (!calling || !ask || !calling.specializations.some(t => t.of)) { return []; }
    return [{ id: 'specialty', ask, present: 'list', all: true, emblems: true, chosen: m.traits?.[0], cards: calling.specializations
      .map(t => ({ id: t.id, name: t.name, emblem: t.id, ...t.line ? { line: t.line } : {},
        ...t.text ? { say: t.text } : {}, ...forbids.includes(t.id) ? { shut: 'Not for your people' } : {},
        entry: { ...CreationFlow.way(t), ...CreationSpells.shown(t, calling.name.toLowerCase(), m) } })) }];
  }
  // The first spells, chosen, where the art is asked (see CreationSpells).
  private spells(): CreationStep[] {
    const m = this.member;
    return this.specialty().length ? CreationSpells.steps(m, this.catalog.callings.find(x => x.id === m.classId)) : [];
  }
  static readonly asks: Record<string, string> = { mage: 'Which art did you learn?', cleric: 'What does your god keep?' };
  // A way as the reference has it (the spells one who takes it sets out knowing listed under it: CreationSpells.shown).
  private static way(t: Catalog['callings'][number]['specializations'][number]): CreationEntry {
    return { facts: t.entry?.facts ?? [], rules: t.rules?.length ? t.rules : t.entry?.rules ?? [] };
  }
  // The trade within the kind of life chosen (once it is chosen), asked in the kind's own words ("What did you do on
  // the water?"), a hand of them at a time, the one best suited to the calling first (the calling's own, where it has
  // one of the kind).
  private trades(): CreationStep[] {
    const c = this.catalog, m = this.member, was = c.backgrounds.find(b => b.id === m.backgroundId);
    const kind = c.kinds.find(k => k.id === was?.kind);
    const wants = c.callings.find(x => x.id === m.classId)?.qualities ?? {};
    const of = c.backgrounds.filter(b => b.kind === kind?.id && (!b.calling || b.calling === m.classId))
      .sort((a, b) => Number(!!b.calling) - Number(!!a.calling) || CreationFlow.fit(b.qualities, wants)
        - CreationFlow.fit(a.qualities, wants) || a.name.localeCompare(b.name));
    if (!this.past || !kind || of.length < 2) { return []; }
    const hand = CreationDefaults.hand(of, this.dealt, CreationFlow.trades);
    return [{ id: 'trade', ask: kind.asks ?? 'What did you do before this?', present: 'list', all: true, chosen: was!.id,
      ...hand.length < of.length ? { roll: 'other trades', again: 'More…' } : {}, cards: hand.map(b => ({ id: b.id, emblem: `life_${kind.id}`,
        name: BackgroundCatalog.called(b, m.pronouns), say: b.text && `${Words.upper(b.text)}.`,
        entry: CreationEntries.trade(b) })) }];
  }
  static readonly trades = 8;
  // The life chosen, in a few sentences, its way in its noun, as setting out tells it: "An elf abjurer. Before this,
  // scholarship. A battleaxe in hand." In the words creation showed (M22's review: "abjurer" and "artificer", which no
  // page had said): the calling as chosen, unless a specialty was chosen too; the kind of life before, as the step
  // named it, not the trade filled in for it. Why the life came is the world's to give at setting out, not told here.
  life(): string[] {
    const catalog = this.catalog, m = this.member, people = catalog.ancestries.find(a => a.id === m.raceId);
    const calling = catalog.callings.find(c => c.id === m.classId);
    const special = calling?.specializations.find(t => t.id === m.traits?.[0]);
    const held = m.weapon ?? (calling && CreationRules.best(calling.weapons, m, catalog)?.id);
    const weapon = calling?.weapons.find(w => w.id === held);
    const origin = this.asked ? this.setting.origins?.find(o => o.id === this.origin) : undefined;
    const was = catalog.backgrounds.find(b => b.id === m.backgroundId);
    const life = was && catalog.kinds.find(k => k.id === was.kind);
    const chosen = !!m.traits?.[0] && this.steps().some(x => x.id === 'specialty');
    const who = [people?.name.toLowerCase(), (chosen && special?.who) || calling?.name.toLowerCase()].filter(Boolean)
      .join(' ');
    return [`${Words.upper(who ? Words.article(who) : 'someone')}.`,
      ...origin ? [`${Words.upper(origin.title.replace(/\.$/, ''))}.`] : [],
      ...life && !this.traded ? [`Before this, ${life.name.toLowerCase()}.`] : was
        ? [`Once ${Words.article(BackgroundCatalog.called(was, m.pronouns).toLowerCase())}.`] : [],
      weapon ? `${Words.upper(Words.article(weapon.name.toLowerCase()))} in hand.` : 'Bare hands.'];
  }
  private kindOf(background?: string): string | undefined {
    return this.catalog.backgrounds.find(b => b.id === background)?.kind;
  }
  // A card chosen at a step (or, at the name, the name written): what it settles, by the page's rules.
  choose(step: CreationChoice, value: string) {
    const here = this.current();
    if (step === 'back' || step === 'onward') { this.move(step === 'back' ? -1 : 1); return; }
    if (step === 'roll') { if (here === 'trade') { this.dealt++; } else { this.rolls++; } return; }
    // A card shut is not taken (a way the people may not take, a spell that would leave none of the art).
    if (step === here && this.steps().find(x => x.id === here)?.cards.find(c => c.id === value)?.shut) { return; }
    // At a step of many, a card is taken or let go and the flow stays; its last card goes on (see CreationSpells).
    if (step === here && CreationSpells.is(step)) {
      if (value === CreationSpells.done) { this.move(1); return; }
      CreationSpells.settle(this.member, this.catalog, value);
      return;
    }
    // A card chosen at the step asked goes on to the next; a name being written, or a choice behind Details, does not.
    if ((step === here && step !== 'name') || (step === 'drawn' && here === 'name')) { this.settled(step, value); this.move(1); return; }
    this.settled(step, value);
  }
  private settled(step: CreationChoice, value: string) {
    const m = this.member, was = m.classId, people = m.raceId;
    if (step === 'you' || step === 'presenting') { this.owned.add(step); }
    if (step === 'origin') { this.origin = value; this.asked = true; return; }
    if (step === 'weapon') { m.weapon = value; return; }
    if (step === 'drawn') { m.name = value; this.named = false; return; }
    if (step === 'spells') { m.spells = value.split(',').filter(Boolean); return; }
    if (step === 'place') { this.place(value); return; }
    if (step === 'reroll') { this.reroll(); return; }
    if (step === 'trade') {
      if (value) { m.backgroundId = value; this.past = this.traded = true; } else { delete m.backgroundId; }
      return;
    }
    if (step === 'name') {
      m.name = value.trim() || CreationDefaults.names(m, this.setting)[0] || m.name;
      this.named = !!value.trim();
      return;
    }
    if (step === 'sign') { m.sign = value; return; }
    if (step === 'perk') { m.perk = value; return; }
    if (step === 'specialty') { m.traits = value ? [value] : []; delete m.spells; }
    else if (step === 'before') { m.backgroundId = this.trade(value) ?? m.backgroundId; this.past = true; this.dealt = 0; }
    else { this.change(step === 'you' ? 'raceId' : step === 'calling' ? 'classId' : 'pronouns', value); }
    CreationDefaults.settle(m, this.catalog, { trade: !this.given(), ...was ? { was } : {} });
    if ((step === 'you' && value !== people) || step === 'presenting') { this.rolls = 0; }
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
    CreationFlow.changed(this.member, this.catalog, field, value);
  }
  // One field of a member changed, and what follows from it by creation's rules: for the protagonist here, and for an
  // authored campaign's companions on its company page (the reader keeps no rules of its own: PA-04).
  static changed(m: Member, catalog: Catalog, field: string, value: string) {
    const was = m.classId;
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
    // The reason for having come's own trade where it is of the kind chosen: "Once a prospector" on Gone under's card
    // had become a collier at the trades' page, the prospector's own kind chosen (the second blind playtest, BL-06).
    const given = this.setting.origins?.find(o => o.id === this.origin)?.background;
    if (given && of.some(b => b.id === given)) { return given; }
    // A calling's own trade of the kind first (a cleric's novice), else the best suited.
    return (of.find(b => b.calling) ?? [...of].sort((a, b) => CreationFlow.fit(b.qualities, wants)
      - CreationFlow.fit(a.qualities, wants))[0])?.id;
  }
  static fit(adds: Record<string, number>, wants: Record<string, number>): number {
    return Object.entries(wants).reduce((t, [k, w]) => t + (adds[k] ?? 0) * w, 0);
  }
  // Whether the reason for having come gives a trade of its own (one who comes over the hills brings their own).
  private given(): boolean { return !!this.setting.origins?.find(o => o.id === this.origin)?.background; }
  // A life drawn whole, as the flow would draw it were nothing chosen (Set out now, OR-120): the country's people, how
  // they present and their name as drawn for it, the calling's first way and its spells, and the calling's own trade
  // unless the reason for coming gives one (see CreationDefaults).
  rolled() { CreationDefaults.settle(this.member, this.catalog, { trade: !this.given() }); }
  static readonly presenting = [['she', 'A woman', 'she, her'], ['he', 'A man', 'he, him'],
    ['they', 'Neither', 'they, them']] as const;
  private static has(entry?: CreationEntry): Pick<CreationCard, 'entry'> { return entry ? { entry } : {}; }
  // A people's or a calling's aside and sentence: its line beside it, and the first sentence of its words.
  private static said(x: { line?: string; text?: string }): Pick<CreationCard, 'aside' | 'say'> {
    const first = x.text && (/^.+?[.!?](?=\s|$)/.exec(x.text)?.[0] ?? x.text);
    return { ...x.line ? { aside: x.line } : {}, ...first ? { say: first } : {} };
  }
}
