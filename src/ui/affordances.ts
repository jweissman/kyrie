import type { Mark, Why } from '../presentation/glance-types';
import { Attending } from './attention';
import type { Choice } from './choice-list';
import { AimRoute } from '../presentation/aim-route';
import { Leaves } from './leaves';
import type { Candidate, Kind } from './promotion';
import { Marks } from './marks';
import { ChoicePrice } from './choice-price';
import { SceneModel, type Scene, type SceneSubject } from './scene';
import type { ExitRow, Screen } from './screen-types';

// What the glance reads the page's choices with, besides the screen: each command's action as the rules declare it
// (its kind, what it is done to, whether it is written to be asked of someone), what the company's aims name, the way
// it came, the signs and the life it has just seen, what it has done here and whom it has spoken with, and its needs.
// All of it from what the company has perceived and the module declares, never from a choice's words.
export interface Reading {
  // The words of the aim followed (whether one is); the choices whose doing changes what it waits on, or leads to
  // where what it waits on is (see Glance.advances, AimLeads).
  // And for each act, the other ways of one choice with it (see Alternatives).
  aim?: string; advances?: Set<string>; coin?: boolean; alternatives?: Map<string, string[]>;
  // Whether what it waits on is known to lie within the site here (see AimLeads.within): only then is a way further in
  // the aim's.
  within?: boolean;
  // The places that hold what the aim followed names (its town, its site): a journey there goes toward it.
  holding?: Set<string>;
  schema: Map<string, string>; args: Map<string, string[]>; speakers: Set<string>;
  // What each choice's success changes the standing of: the entities its effects name (the rite of rest, the raiser).
  touches?: Map<string, Set<string>>;
  // What the module's author wrote to be done with something here (Change follow "Follow the ruts"): its own act.
  authored: Set<string>;
  // The ids the aim shown names (its people, places and things, and the places of a site it names), those the other
  // aims held name, and the ways from here that lead toward a place they name (by exit id, and for which).
  named: Set<string>; held: Set<string>; toward: Map<string, 'toward' | 'held'>;
  // In a site: the ways further into it not yet taken, by exit id; "~" before one back from a dead end toward the rest
  // of it (see Glance.inward). on: where every way about the place goes somewhere been, the row that leads on to the
  // unseen, by its choice (an exit's id, or a walk's travel:), with the words of where it leads on to (see LeadsOn).
  inward: Set<string>; back?: string; here: string; on?: Map<string, string>;
  // A sign perceived here and not seen before, by whom or what it is of ('' for the place's own).
  signs: Map<string, string>;
  // The marvels in view its author declares (`Marvel.`: marvel(thing)), by id (Knowing.marvels).
  marvels?: ReadonlySet<string>;
  life?: string; pointed: Set<string>; done: Set<string>; talked: Set<string>;
  // Whom the company has met, or has by name (see Acquainted): anyone else is led as talking to them (Doable.called).
  known?: Set<string>;
  // Whom the last act, done where the company stands, spoke to (see TalkingWith).
  talking?: string;
  // Who could join the company (see Companions); the places one way off where the company perceives someone who might
  // (see Perception).
  // sensed: each way along which someone who might join is perceived, with the words its row says of them.
  companions?: Set<string>; sensed?: Map<string, string>;
  // Someone who would go along, and where, while the aim followed's fight is beyond the company alone (Outmatched).
  help?: { who: string; at: string };
  // The topics whose answer has the one asked willing to come along (Assert willing(them, …)), by choice id.
  willing?: Set<string>;
  // What the company's last act opened, by command (see ActionFeedback.opened): led first, as what came of it.
  opened?: Set<string>;
  // The choices that teach what an aim held and not followed waits on, or where it lies (see Undertakings.serving).
  serves?: Set<string>;
  // Places about the company it left having done nothing there, with nothing done since: no aim leads back to them.
  idle?: Set<string>;
  // Where someone or something the aim names stands, still able (see Glance.occupied).
  occupied?: Set<string>;
  needs: { hungry: boolean; rations: number; hurt: Set<string>; night: boolean; weary: boolean; settled: boolean;
    open: boolean;
    // Where in the settlement a bed is to be had, a step from here, when there is none here.
    bed?: string;
    // When the company carries nothing to make light by: the kinds of thing that light, any of them worth buying.
    unlit?: Set<string>;
    // With nothing to see by, the ways from here into somewhere unlit, and who sells a light (see CompanyLight).
    dark?: Set<string>; sellers?: Set<string>; shops?: Set<string>;
    // In the dark with nothing to see by, the next place on the known way toward the nearest light (see CompanyLight).
    lit?: string;
    // Whether the company is one alone, for whom someone who would join is help.
    alone?: boolean };
}
// Every top-level choice of the place (as the page draws it: Attending.place over the scene), and the walks about the
// town, as candidates to be led with, each with every reason it might be (see Promotion). Pure.
export class Affordances {
  static of(scene: Scene, screen: Screen, r: Reading): Candidate[] {
    const threat = scene.subjects.some(s => SceneModel.threat(s));
    // The way back is led only from a fight the company could lose, or a warning, or the dark: from every fight it had
    // been the second thing led with, and a player following the page went out of each site at its first foe (the
    // owner, 4 November: "it always guides you back out").
    // A hard fight is one the company would likely win, so it is not one it could lose: grave and deadly are, and so
    // is one that could fell the one who plays (Marks.asks; OR-412).
    const losing = scene.subjects.some(s => SceneModel.threat(s) && this.asked(s, screen));
    // The way back is led from danger only: from the dark it had led straight back into the ossuary the company had
    // just left its raiser in, and the follower went to and fro between them a hundred and fifty times. In the dark,
    // light is led with (see Promotion's dark); with nothing to light, the way up or out, toward the light.
    const back = losing || !!screen.warned;
    // In the dark, nothing gives light when no one can light one (see ChoiceList.lighting).
    const lightless = !!screen.dark && !scene.you.some(c => this.kind(c, r) === 'light');
    const threats = new Set(scene.subjects.filter(s => SceneModel.threat(s)).map(s => s.id));
    return [...scene.subjects.flatMap(s => this.warning(this.subject(s, screen, r), s, screen)),
      ...scene.subjects.flatMap(s => this.ending(s, r, threats)),
      ...[...scene.near, ...scene.far].flatMap(c => this.way(c, screen, { r, back, lightless })),
      ...this.around(screen, r), ...this.journeys(screen, r),
      ...scene.you.flatMap(c => this.yours(c, screen, { r, threat, lightless, threats }))]
      .map((c, order, all) => ({ ...this.unled(c, all), order }));
  }
  // Where the aim's fight would end the one who goes alone and someone to take along is led from here (Outmatched's
  // help), the ways toward the fight lead no more, and stay plain rows (OR-412).
  private static unled(c: Candidate, all: Candidate[]): Candidate {
    return !['way', 'travel', 'step'].includes(c.kind) || c.whys.includes('help') || !all.some(x => x.whys.includes('help'))
      ? c : { ...c, whys: c.whys.filter(w => !['named', 'toward', 'held', 'advance'].includes(w)) };
  }
  // Whoever warns the company off: what is done toward them comes first, before the way back. And what the company
  // is engaged in (a riddle put, a hand of cards) is answered first, as a question just put is (OR-177: stopped for the
  // old woman's riddle, the drove aim's way had led the page's menu above her answers).
  private static warning(cands: Candidate[], s: SceneSubject, screen: Screen): Candidate[] {
    const why = screen.warned?.id === s.id ? 'warned' as const
      : screen.engaged?.id === s.id ? 'answer' as const : undefined;
    // Never onto a fight not led with (OR-412): one that could end the one who plays answers no warning.
    return why ? cands.map((c, i) => i || (c.kind === 'attack' && !c.whys.length) ? c : { ...c, whys: [why, ...c.whys] })
      : cands;
  }
  // Any of the place's own ways of ending a danger here, wherever it hangs (a cleric's rite of rest over the bone-heaps
  // hangs on the black candle; a scholar's reading of the ring on the raiser): its success changes the danger's
  // standing, and it is led beside talking them round and the fight, not left behind them (a calling's own way had been
  // offered and never led).
  private static ending(s: SceneSubject, r: Reading, threats: Set<string>): Candidate[] {
    if (!threats.size) { return []; }
    return Attending.all(s.choices).filter(c => c.command && !c.disabled && (c.own || r.authored.has(c.command))
      && this.kind(c, r) !== 'attack' && [...r.touches?.get(c.command) ?? []].some(t => threats.has(t)))
      .map(c => this.candidate(c, { kind: 'act', r, whys: ['danger'] }));
  }
  private static subject(s: SceneSubject, screen: Screen, r: Reading): Candidate[] {
    if (s.kind === 'companion') { return []; }
    if (s.state) { return this.remains(s, r); }
    if (SceneModel.threat(s)) { return this.threat(s, r, this.asked(s, screen)); }
    // Talking to them, or looking at it, is one choice; what is done about them stands beside it (see Attending).
    const opener = s.choices.find(c => [`${s.id}#talk`, `${s.id}#look`].includes(c.id));
    if (opener) { return [...this.choice(s, opener, screen, r), ...this.deeds(s, opener, r)]; }
    // An animal, or a creature of no danger: its first gentle act, for what is new about it.
    const gentle = this.gentle(s.choices, r);
    if (!gentle) { return []; }
    const whys: Why[] = [...r.signs.has(s.id) ? ['sign' as const] : [], ...r.life === s.id ? ['life' as const] : [],
      ...this.about([gentle], r) ? ['about' as const] : [], ...this.ownWhy([gentle], r)];
    return [this.candidate(gentle, { subject: s.id, kind: 'act', whys, r })];
  }
  // An opener, or the ways of a choice within it led in its place (see Alternatives).
  private static choice(s: SceneSubject, opener: Choice, screen: Screen, r: Reading): Candidate[] {
    return Leaves.choice(this.opened(s, opener, screen, r), { s, opener, r }, (c, at) => this.candidate(c, at));
  }
  // What is done about them beside the talk (letting Ifan's boat through the sea-gate, as he asks): each one of the
  // place's own acts, led with as such, never only under `all` (ST-03: their talk's replies had been read alone, and a
  // deed beside it had no candidate). Spoken by them, it is not a topic (see ChoiceGrouping.owned). One for each person
  // still (see Promotion.room): their talk, or the deed.
  private static deeds(s: SceneSubject, opener: Choice, r: Reading): Candidate[] {
    // Not one the aim waits on: the talk is led for it already, by its own words (Holgar's charcoal given had been led
    // twice in the four, the talk for it and the deed: cold play 7, T25).
    return s.choices.filter(c => c !== opener && c.deed && c.command && !c.disabled && !r.advances?.has(c.command))
      .map(c => this.candidate(c, { subject: s.id, kind: 'act', r,
        whys: [...!r.done.has(c.command!) ? ['own' as const] : [], ...this.about([c], r) ? ['about' as const] : []] }));
  }
  // Who lies dead or down: only what the aim followed waits on done about them (Marsh Howe's den cleared, the search
  // among the zombies' bones for the coin they dragged in, had been only under `all`: PL-25).
  private static remains(s: SceneSubject, r: Reading): Candidate[] {
    const step = Attending.all(s.choices).find(c => c.command && !c.disabled && r.advances?.has(c.command)
      && !r.done.has(c.command));
    return step ? [this.candidate(step, { subject: s.id, kind: 'act', whys: ['advance'], r })] : [];
  }
  // A danger: its gentlest act (one of its own first, then any that is neither a risk nor a blow), and the attack.
  // A fight the page asks of (grave, deadly, or one that could fell the one who plays) is never led with: the lead
  // goes to the way back, someone to take along, or rest, and the attack stays a plain row, asked (OR-412: thorn's
  // gold-follower had been led into the vault's keeper and died at its first blow, the ask pressed through).
  private static asked(s: SceneSubject, screen: Screen): boolean {
    return Marks.asks(screen.people.find(p => p.id === s.id)?.reckoning ?? { danger: 'grave' });
  }
  private static threat(s: SceneSubject, r: Reading, asked: boolean): Candidate[] {
    const gentle = this.gentle(s.choices, r), attack = s.choices.find(c => this.kind(c, r) === 'attack');
    // At the place the aim followed is about, the gentle way past what holds it (a parley with the hobs at the gate
    // of the old place the debt is to be paid from) is the aim's next step: the gold had gone, and a company led only
    // by it went off and was led back, again and again (the gold walk, 11 November).
    return [...gentle ? [this.candidate(gentle, { subject: s.id, kind: 'act', r,
      whys: ['danger', ...this.about([gentle], r) || r.named.has(r.here) ? ['about' as const] : []] })] : [],

    // A danger the aim followed is about (the old buck rat its nest is kept by) is gone at for the aim, red and gold:
    // the page had led past it, to the drain beyond, as "toward your aim" (round 7, both players).
    ...attack ? [this.candidate(attack, { subject: s.id, kind: 'attack', r,
      whys: asked ? [] : ['danger', ...r.named.has(s.id) ? ['named' as const] : [],
        ...r.advances?.has(this.command(attack) ?? '') ? ['advance' as const] : []], notes: { danger: s.danger ?? '' } })]
      : []];
  }
  private static gentle(choices: Choice[], r: Reading): Choice | undefined {
    // Never leaving a talk: led with, a danger talked to had been "Take your leave" and then talked to again, round and
    // round (the owner, 9 November). Nor the same question asked again, which changes nothing (OR-416: the man with the
    // black candle asked who he is six times running).
    const open = choices.filter(c => this.command(c) && !c.disabled && !this.risky(c) && this.kind(c, r) !== 'attack'
      && !Attending.leaving(c) && r.schema.get(this.command(c) ?? '') !== 'take_leave' && !/_again$/.test(this.command(c)!));
    return open.find(c => c.own) ?? open[0];
  }
  // Someone is led for the question a lead sent the company to ask them (the notice's job: Holgar had been led for the
  // old kingdom, OR-199): a question put to someone, so only ever among a person's (TalkWeight.sought). Not while the
  // company follows an aim of its own: the gold walker on the Hall's errand, turned to Kynes, had been given the
  // quarry's spiders job by her talk, and went in and out of the adit thirty times (press-key).
  private static sent(f: Choice[], s: Screen, r: Reading): Choice | undefined {
    return s.aims?.some(a => a.followed) ? undefined
      : f.find(c => s.sought?.includes(c.command!) && !r.done.has(c.command!));
  }
  // Someone to talk to, or something to look at: one choice that opens what can be done; it is led with for anything
  // nested in it, said beside it (an answer owed, the aim, a bed for the night).
  private static opened(s: SceneSubject, opener: Choice, screen: Screen, r: Reading): Candidate[] {
    const leaves = Attending.all(opener.children ?? []).filter(c => c.command && !c.disabled);
    // What is new to be said to them: not a question asked once more (its action the first's, "_again"), nor what
    // they sell; the page had led with "Talk to Adrik — your aim" for as long as he had an answer to repeat.
    // Nor a ware: a talk led for the debt had been led for a ten-foot pole, and one who followed the page bought the
    // shop out a pole at a time (the gold walker, amendment 6). A sale the aim waits on is serving's (see advances).
    const fresh = leaves.filter(c => r.speakers.has(c.command!) && !/_again(\(|$)/.test(c.command!)
      && !/^(buy|sell)_/.test(r.schema.get(c.command!) ?? ''));
    const talked = r.talked.has(s.id), person = s.kind === 'person', sent = this.sent(fresh, screen, r);
    // Someone the aim followed names leads, and family while the company's own errand is followed; someone another aim
    // names, or family while a job is, after it (the owner, 4 November: a sister marked first while the rats job was).
    const errand = !screen.aims || !!screen.aims.find(a => a.followed)?.own;
    const word = s.note?.split(' · ')[0], ours = r.named.has(s.id) || (!!word?.startsWith('your ') && errand);
    // Whom the aim followed names is led for what the aim asks of them, until it is asked (the question its words put,
    // or one about what it names), and for a first word: never for every question they could be asked (the owner, 9
    // November: the innkeeper led fifteen times over, each time for another of the lands beyond). Family on the
    // company's own errand as kin, while there is anything new to say to them.
    // Among everything done about them, not only what is said (sitting up with the child stands beside the talk).
    const moving = Attending.all(s.choices).filter(c => c.command && !c.disabled && r.advances?.has(c.command)
      && !r.done.has(c.command));
    // What brings it about, by what it does (AimAdvances, AimLeads), not a question whose words echo the aim's: every
    // question in the creditor's shop binds the shop (M21's PL-15).
    const serving = moving;
    // Whoever has what the aim followed waits on is owed it, stake or none: the fever's mother, the cup to be kept by
    // the child's bed, had dropped from the page once asked how the child was (the owner, 12 November).
    const owed = (moving.length > 0 && r.named.has(s.id)) || (s.stake && (r.named.has(s.id)
      ? !talked || serving.length > 0 : !talked || fresh.some(c => !r.done.has(c.command!))));
    // Led for that aim, gilded as the aim's (the merchant the rats job sends the company to had been led as kin, and
    // not drawn in the aim's gold: the owner, 8 November).
    const named = owed && r.named.has(s.id), answer = leaves.find(x => x.answer), kin = owed && ours && !named;
    // Led for another aim only where saying something to them would teach the company something not yet asked: the
    // man with the black candle, talked to for it, had given nothing but his acquaintance (PF-03's laboratory walk).
    // Or for the question a lead sent them to ask (see sent).
    const fresh_ = (owed && !ours ? this.newest(leaves, r) : undefined) ?? (named ? undefined : sent);
    const held = !!fresh_, feature = screen.things.find(t => t.id === s.id)?.kind === 'feature';
    const looked = leaves.find(c => r.schema.get(c.command!) === 'look_closely' && !r.done.has(c.command!));
    // A treasure lying here is what the delve was for: taken up, led with (the vault's rings and moonstone had been
    // under Look about once its keeper fell: OWN-57's play).
    const spoils = screen.things.find(t => t.id === s.id)?.valuable
      && leaves.some(c => /^(take_item|take_out)\(/.test(c.command!));
    // What there is to learn of someone with something to ask, and the asking that would have them come along: a
    // likeness is drawn blue, or rose, only for something within it that is (the owner, 12 November: blue pips with no
    // blue question, a rose pip and the recruiting unmarked).
    // Blue is for a question whose answer teaches the company something, not for any word to be had of them (the
    // wagoner's "Offer him a hand" had drawn him blue).
    const learned = (person ? fresh : leaves).find(c => c.teaches && !r.done.has(c.command!));
    const next = this.next(s, r, learned, fresh), joining = leaves.find(c => r.schema.get(c.command!) === 'recruit')
      ?? leaves.find(c => r.willing?.has(c.command!) && !r.done.has(c.command!));
    const whys: Why[] = [...answer ? ['answer' as const] : [], ...named ? ['named' as const] : [], ...kin ? ['kin' as const] : [],
      ...held ? ['held' as const] : [],
      // What the aim followed waits on, done here (the dead man's box, found, taken up): the aim's own next step,
      // before what else it is (the box had been led as spoils, and the gold gone on into the cave: the owner, 12
      // November).
      // So with spoils, for an aim short of coin (the keep's steel coin at its gate), never what is someone's (the
      // hobs' bell and rings in their cache, which taken had the company caught leaving).
      // So with someone the aim does not name (Harbek, who knows where willow grows, PL-13), unless one it names is
      // here: the fevered child's mother is gone to before her daughter, who could keep the cups for her.
      ...(moving.length && (!person || (!named && !screen.people.some(p => p.id !== s.id && r.named.has(p.id)))))
        || (!person && spoils && r.coin) ? ['advance' as const] : [],
      ...spoils ? ['spoils' as const] : [], ...person && this.owes(s, leaves, screen) ? ['owed' as const] : [],
      ...this.about(fresh, r) ? ['about' as const] : [],
      ...person && r.life === s.id && !talked ? ['life' as const] : [],
      ...this.ownWhy(leaves, r), ...r.signs.has(s.id) ? ['sign' as const] : [],
      // So with a thing to read that would tell the company something (the eel-wife's notice on Tessary's Landgate
      // board, the adventure's hook, had been only under `all`: M21's playability list, PL-16).
      ...this.spokenWhys({ learned, next, unmet: person ? !!s.asked && !talked : true }),
      ...feature && looked ? ['unlooked' as const] : [], ...this.wonder(s.id, { person: !!person, leaves, r }),
      ...person && joining ? this.joins(s.id, r) : []];
    const needs = this.served(leaves, r);
    const asked = named ? serving[0] ?? (talked ? undefined : fresh.find(c => !r.done.has(c.command!)))
      : this.unasked(fresh, r, fresh_);
    // The act within that each reason is for, so that the page finds it again inside (see Promotion.inside).
    const kept = (kin || named || held) && (asked?.command ?? fresh_?.command), take = spoils
      ? leaves.find(c => /^(take_item|take_out)\(/.test(c.command!))?.command : undefined;
    const within: Partial<Record<Why, string>> = { ...answer?.command ? { answer: answer.command } : {},
      ...this.kept(kept, asked), ...moving[0] ? { advance: moving[0].command! } : {},
      ...take ? { spoils: take, ...!moving[0] ? { advance: take } : {} } : {},
      ...this.spoken({ learned, next }), ...joining ? { companion: joining.command! } : {},
      ...looked ? { unlooked: looked.command! } : {}, ...person ? this.owedFor(s, leaves, screen) : {},
      ...Leaves.sign(s, { opener: this.command(opener), looked, leaves, r }),
      // The place's own act within (AT-07: the cart in the ditch lit worth a look, and nothing inside it).
      ...Leaves.own(leaves, r),
      ...Object.fromEntries(needs.flatMap(n => n.choice?.command ? [[n.why, n.choice.command]] : [])) };
    const base = { subject: s.id, kind: person ? 'talk' as const : 'act' as const, r };
    return [this.candidate(opener, { ...base, whys: [...whys, ...needs.map(n => n.why)], leaves: within, notes: {
      ...answer ? { answer: answer.label } : {}, ...kin || named ? { kin: word?.startsWith('your ') ? word : 'your aim' } : {},
      ...held ? { held: word?.startsWith('your ') ? word : this.held(r) } : {}, companion: 'might come along',
      ...Object.fromEntries(needs.map(n => [n.why, n.note])) }, ...answer?.command ? { command: answer.command } : {},
    // Led for an aim that names them, what it is led for is the first new thing to ask them, not their first reply
    // (the priest led for his job had stood for his care of the wounded, the innkeeper for a bed); else what the
    // company needs of them.
    ...!answer && (kin || named || held) && asked ? { for: asked.command! }
      : !answer && moving[0] ? { for: moving[0].command! }
        : !answer && needs[0]?.choice?.command ? { for: needs[0].choice.command } : {} })];
  }
  // What pays the company, said to someone with something for it now (see Owed): the act inside their talk's payoff.
  private static owes(s: SceneSubject, leaves: Choice[], screen: Screen): Choice | undefined {
    return s.owed ? leaves.find(c => !!screen.paying?.includes(c.command!.replace(/\(.*$/, ''))) : undefined;
  }
  private static owedFor(s: SceneSubject, leaves: Choice[], screen: Screen): { owed?: string } {
    const owes = this.owes(s, leaves, screen);
    return owes ? { owed: owes.command! } : {};
  }
  // What someone here offers that the company needs now: a bed at night in a settlement, healing for one hurt; and
  // what it has won, put to use: a treasure it carries bought, a lesson or a spell it can pay for (a company back in
  // town was shown nothing to do with what it had won: the owner, 31 October).
  // The first thing not yet asked; for an aim held (newest), what serves it, else that act, never merely the first
  // question unasked, which promised exploration and brought none (a1's Eogan).
  private static unasked(fresh: Choice[], r: Reading, held?: Choice): Choice | undefined {
    const open = fresh.filter(c => !r.done.has(c.command!));
    return held ? open.find(c => r.serves?.has(c.command!)) ?? held : open[0];
  }
  // Something not yet done there for an aim held: a question that teaches what it waits on, or an act on them that is
  // not talk nor trade (the hobs' stolen bell, rung); never merely talking or trading with them, nor a question that
  // teaches it nothing (Taklinn, whom the spiders job names, had been led nineteen turns running for rumours).
  // Talk, trade and services: what is done with someone, never an act on them that is new (see newest).
  private static readonly talkish = new RegExp(['talk_to', 'take_leave', 'look_closely', 'ask', 'buy_', 'sell_', 'take_lodging',
    'take_healing', 'make_offering', 'learn_', 'train_', 'sing_', 'work_', 'pay_', 'haggle'].map(k => `^${k}`).join('|'));
  private static newest(leaves: Choice[], r: Reading): Choice | undefined {
    return leaves.find(c => !r.done.has(c.command!) && (r.serves?.has(c.command!) || (!r.speakers.has(c.command!)
      && !this.talkish.test(r.schema.get(c.command!) ?? ''))));
  }
  private static served(leaves: Choice[], r: Reading): { why: Why; note: string; choice?: Choice }[] {
    const bed = r.needs.night && r.needs.settled && this.offered(leaves, r, ['take_lodging', 'take_lodging_guest']);
    const cure = r.needs.hurt.size > 0 && this.offered(leaves, r, ['take_healing']);
    // Something to make light by, from one who sells it, for a company that has none (a cleric whose job lay under
    // the ground had walked from the quarry to the chandler's and back without ever being told a torch was a coin).
    const light = r.needs.unlit && leaves.find(c => r.schema.get(c.command!) === 'buy_item'
      && r.needs.unlit!.has(r.args.get(c.command!)?.[1] ?? ''));
    // Someone who would join a company of one (a cleric alone had turned back from every fight of the first town's
    // jobs, and never been told the traveller at the inn would come for a few coin).
    const hand = r.needs.alone && this.offered(leaves, r, ['recruit']);
    const sale = this.offered(leaves, r, ['sell_valuable']), lesson = this.offered(leaves, r, ['train_member', 'learn_spell']);
    return [...bed ? [{ why: 'night' as const, note: `for the night: ${ChoicePrice.priced(bed)}`, choice: bed }] : [],
      // Before the aim: going on with nothing to see by is going on into the dark.
      ...light ? [{ why: 'dark' as const, note: `a light: ${ChoicePrice.priced(light)}`, choice: light }] : [],
      ...hand ? [{ why: 'companion' as const, note: `would join you${ChoicePrice.fee(hand)}`, choice: hand }] : [],
      ...cure ? [{ why: 'hurt' as const, note: ChoicePrice.priced(cure), choice: cure }] : [],
      ...sale ? [{ why: 'spoils' as const, note: ChoicePrice.priced(sale), choice: sale }] : [],
      ...lesson ? [{ why: 'means' as const, choice: lesson, note: `a lesson in ${ChoicePrice.lesson(lesson)}` }] : []];
  }
  // Whether a place is, or holds, something the aim names, by the world's nesting (never by its id's spelling: the road
  // between Fearnmaere and Brockminster, region__s2_s5_way, had been "in" Fearnmaere, region__s2).
  private static within(id: string, named: Set<string>, r?: Reading): boolean {
    return named.has(id) || !!r?.holding?.has(id);
  }
  // An aim held and not followed: "another aim" beside one followed, else only an aim (with nothing followed yet, the
  // priest the brothers' letter is for had been "another aim": round 11, T).
  private static held(r: Reading): string { return r.aim ? 'another aim' : 'an aim'; }
  private static offered(leaves: Choice[], r: Reading, schemas: string[]): Choice | undefined {
    return leaves.find(c => schemas.includes(r.schema.get(c.command!) ?? ''));
  }
  // A way: the one the aim names, one toward it, the way back when there is something to get away from, a way about
  // the place not yet taken, the first thing to try on a way barred.
  private static way(c: Choice, screen: Screen, at: { r: Reading; back: boolean; lightless?: boolean }): Candidate[] {
    const exit = screen.exits.find(e => c.id === e.id || c.id.startsWith(`${e.id}/`)), r = at.r;
    if (!exit) { return []; }
    const dest = exit.destination.id, tried = c.id !== exit.id && !!exit.blocked;
    // Back the way it came, in the dark with a light to hand and a way on not yet taken (thorn's adit: OR-326).
    const first = tried && this.firstTry(c, exit), turned = dest === r.back && exit.visited && !!screen.dark
      && !at.lightless && screen.exits.some(e => !e.visited && !e.blocked);
    // A way not yet taken from a place an aim names is the way on into what it is about (out of doors at the front of a
    // hold; the gnawed hole down from the corn-store cellar), but in a town not a door into the next house: at
    // Gothgiba's bailey, where the fevered child is, the gold had gone through every door on the green in turn, the
    // general store, the chandlery and back, and none sold herbs (M21's playability list, PL-12).
    // Not while what it is about is here to be dealt with (the rats' run, not the old drain past it).
    const present = [...screen.things, ...screen.people].some(t => r.named.has(t.id));
    // So with a way further into a site the aim names, from anywhere in it: in the barrow's mouth, the old writing the
    // brothers want further in, nothing had been gold (the owner, 12 November). Never every lane of a town it names.
    const inSite = screen.path.some(p => p.kind === 'site' && r.named.has(p.id)) && r.inward.has(exit.id) && !!r.within;
    const on = exit.local && !exit.visited && !exit.blocked && dest !== r.back && !present
      && (inSite || (r.named.has(r.here) && (AimRoute.town(screen) ? AimRoute.down(exit) : !!r.within)) ? 'toward' as const
        : r.held.has(r.here) ? 'held' as const : undefined);
    const toward = r.needs.dark?.has(dest) ? undefined : r.toward.get(exit.id) ?? (on || undefined);
    // A way about the place not yet taken is worth taking by day; at night, the way to a bed.
    // In the dark with nothing to light, the way toward the nearest light, else up or out (OR-590).
    const up = at.lightless && (r.needs.lit ? dest === r.needs.lit : ['ascend', 'leave'].includes(exit.transition ?? ''));
    const whys: Why[] = [...(at.back && dest === r.back || up) && !c.disabled ? ['retreat' as const] : [],
      // Not back to a place the aim names that the company has been, from another it names: down in the cellar under
      // the corn-store the rats are in, the stair up had led as "your aim".
      // Nor to one it left having done nothing there, with nothing done since (see CompanyRecall.idle).
      // Unless whoever the aim is about still stands there: fled back up from the rats' run, the way down to them is
      // still the aim's (the laboratory's lost turns).
      // Never into the dark with nothing to see by: what the aim asks there cannot be done (see CompanyLight).
      // Nor back the way it came where the light is next (turned).
      ...this.shop(r, dest) ? ['named' as const] : [],
      ...(r.named.has(dest) || r.occupied?.has(dest)) && !r.needs.dark?.has(dest) && !turned
        && !(r.named.has(r.here) && exit.visited && !r.occupied?.has(dest)) && !r.idle?.has(dest) ? ['named' as const] : [],
      ...toward ? [toward] : [], ...r.held.has(dest) && !r.idle?.has(dest) ? ['held' as const] : [],
      ...r.on?.has(exit.id) && c.id === exit.id ? ['leads' as const] : [], ...this.inward(c, exit.id, r), ...r.needs.night && dest === r.needs.bed ? ['night' as const] : [],
      ...exit.local && !exit.visited && !r.needs.night ? ['unvisited' as const] : [], ...first ? ['unlooked' as const] : [],
      // An author's own way through what bars it, open to this company (a thief's pick of the corn-store padlock had
      // been only under Every way: Mission 19).
      // After the place's own acts (the notice before a padlock), unless an aim is about what lies behind it.
      // Into a site the aim names, through what bars the way further in, it is the aim's way on (the portcullis at the
      // gate of the keep the debt is to be paid from: the owner, 12 November).
      ...tried && !c.disabled && c.command && r.authored.has(c.command) && !r.done.has(c.command)
        ? [r.named.has(dest) || inSite ? 'toward' as const : r.held.has(dest) ? 'own' as const : 'unlooked' as const] : []];
    // A try on a way barred (look at the portcullis) is something done there, not a way. Slipping past who keeps it is
    // that danger's own gentle way, led with it: a thief had found it only under Look… (Mission 20, round 2, B 88).
    // Another aim heard of marks no way back: not the retreat, nor a way to somewhere been (out of the undertown to
    // the landing, back out of a manor to its forecourt), which are said as what they are (PF-03). Nor is the way back
    // from a danger a way on to the unseen: it is drawn plain (test/small/frontier).
    if (exit.visited || whys.includes('retreat')) { whys.splice(0, whys.length, ...whys.filter(w => w !== 'held' && !(w === 'leads' && whys.includes('retreat')))); }
    const kind = tried ? 'act' as const : exit.bearing ? 'step' as const : 'way' as const;
    if (!tried && r.opened?.has(this.command(c) ?? '')) { whys.unshift('opened'); }
    // Into a town from its own country: said as entering it, never what the company has not perceived of it (who is
    // within, what they would ask).
    const town = !tried && !exit.crosses ? this.entered(screen, dest) : undefined;
    if (town) { whys.push('entry', ...this.fresh(exit, whys)); }
    // Any way along which the company perceives someone who might join (see Perception), however far off: the way is
    // that, as the Go mark says it is (the owner, 17 November: a companion on the mark and on none of its rows).
    if (!tried && r.sensed?.has(dest)) { whys.push('companion'); }
    // The way to whoever would go along, where the aim's fight is beyond the company alone (OR-64).
    if (!tried && r.help && (r.help.at === dest || screen.region?.within[r.help.at] === dest)) { whys.push('help'); }
    const slip = tried && !c.disabled && r.schema.get(c.command ?? '') === 'slip_past' ? r.args.get(c.command!)?.[3] : undefined;
    if (slip) { whys.unshift('danger'); }
    // A way into the next hex is set out on from the map, as a journey there (see HexBoundary): led with, it is that
    // journey, never the way's own command, which the campaign refuses (the travel-contract review, 9 November).
    return [this.candidate(town ? { ...c, label: `Enter ${town}` } : c, { exit: exit.id, kind, whys, r, ...slip ? { subject: slip } : {}, ...exit.crosses && !tried ? { command: `travel:${dest}` } : {},
      ...tried ? Leaves.tries(c, whys, r) : {},
      notes: { retreat: dest === r.back ? 'the way you came' : 'up, toward the light', named: 'your aim', toward: 'toward your aim', held: this.held(r),
        help: 'someone who would go with you', ...r.sensed?.has(dest) ? { companion: r.sensed.get(dest)! } : {},
        deeper: 'further in', onward: 'toward the rest of it', out: 'back out', leads: r.on?.get(exit.id) ?? '',
        night: 'a bed for the night', unlooked: exit.blocked ?? '' }, visited: exit.visited,
      pointed: r.pointed.has(dest) })];
  }
  // Someone who could join: a companion, and the help the aim's fight wants (see Outmatched).
  private static joins(id: string, r: Reading): Why[] {
    return [...r.companions?.has(id) ? ['companion' as const] : [], ...r.help?.who === id ? ['help' as const] : []];
  }
  // A marvel of the place that can be met: the uncanny, whatever else it is. As its author declares it (`Marvel.`),
  // never by its id's spelling: the one producer had been `wonder_…`, which only the generators write, and no authored
  // marvel could be violet (the atlas study: AT-01).
  private static wonder(id: string, at: { person: boolean; leaves: Choice[]; r: Reading }): Why[] {
    const meets = at.leaves.some(c => c.command && !c.disabled && !/^look_closely/.test(c.command));
    return !at.person && meets && !!at.r.marvels?.has(id) ? ['wonder'] : [];
  }
  // The town a way goes into, by name, where the company is not in it already; new, until it has been.
  private static entered(screen: Screen, dest: string): string | undefined {
    const region = screen.region, area = region?.areas.find(a => a.id === (region.within[dest] ?? dest));
    return area?.kind === 'settlement' && !screen.path.some(p => p.id === area.id) ? area.name : undefined;
  }
  private static fresh(exit: ExitRow, whys: Why[]): Why[] { return exit.visited || whys.includes('unvisited') ? [] : ['unvisited']; }
  // Into a site, or further in: the way itself, never a risk taken to get through (a trap's switch); back from a dead
  // end toward the rest of it, after what the room has to do (see Glance.inward).
  private static inward(c: Choice, exit: string, r: Reading): Why[] {
    if (c.id !== exit || c.risk) { return []; }
    return r.inward.has(exit) ? ['deeper'] : r.inward.has(`~${exit}`) ? ['onward'] : r.inward.has(`^${exit}`) ? ['out'] : [];
  }
  // Where a light is to be had, with an aim followed, the dark ahead and nothing to see by (see CompanyLight).
  private static shop(r: Reading, place: string): boolean { return !!r.aim && !!r.needs.shops?.has(place); }
  // The first try on a way barred: its first act, or, where that act's tries are laid out as rows of their own (PB-29),
  // the first of them (the barrow's seal-stone, pushed and pulled, had been led as no try at all).
  private static firstTry(c: Choice, exit: ExitRow): boolean {
    const [first] = exit.acts, id = `${exit.id}/${first?.key ?? ''}`;
    return c.id === id || (!!first?.children?.length && c.id === `${id}/${first.children[0]!.key}`);
  }
  // The other places of the town, walked to directly.
  private static around(screen: Screen, r: Reading): Candidate[] {
    const visited = new Set(screen.map.filter(p => p.visited).map(p => p.id));
    return (screen.around ?? []).map(d => ({ choice: `travel:${d.id}`, command: `travel:${d.id}`,
      label: `${d.descent ? 'Down to' : 'To'} ${d.name}`,
      kind: 'travel' as const, order: 0, marks: d.minutes > 10 && Marks.journey(screen.elapsed, d.minutes) ? [Marks.dusk] : [],
      minutes: d.minutes, visited: visited.has(d.id),
      pointed: r.pointed.has(d.id), whys: [...(r.named.has(d.id) && !r.idle?.has(d.id)) || this.shop(r, d.id)
        ? ['named' as const] : [], ...r.toward.has(`travel:${d.id}`) ? [r.toward.get(`travel:${d.id}`)!] : [],
        ...r.held.has(d.id) && !r.idle?.has(d.id) ? ['held' as const] : [], ...visited.has(d.id) ? [] : ['unvisited' as const],
        // And to whoever would go along, across the town (OR-417); or on to the unseen (OR-1502: see LeadsOn).
        ...r.help?.at === d.id ? ['help' as const] : [], ...r.on?.has(`travel:${d.id}`) ? ['leads' as const] : []], notes: { named: 'your aim', held: this.held(r), toward: 'toward your aim', help: 'someone who would go with you', leads: r.on?.get(`travel:${d.id}`) ?? '' } }));
  }
  // A journey to where the aim shown is, further than the ways from here, by the way the company knows (as far as it
  // is known), unless it goes only as far as here: a far aim had been set out for from the map alone (the owner, 31
  // October). Not another aim held: two such, each shown where it names the place, sent a company back and forth
  // between the edges of two wild countries (REV-08).
  private static journeys(screen: Screen, r: Reading): Candidate[] {
    // Not while a site the company is at has ways in not yet taken: it is gone into before it is left (the owner, 4
    // November: deep in a barrow the page had led with setting out for town).
    // Only from within a site: from a town, a barrow a step off the green is no reason not to set out where the aim is
    // (the owner, 9 November: a letter for Elmham, and the page had led into the barrow by the green).
    // But only a site the aim names: done with it, the find taken up and the aim now the creditor's, the company had
    // been held in the keep's gate by its ways not yet taken, and nothing led home (the owner, 12 November).
    // Or one with an open way further in not yet taken (the hold's cache, the bell still to ring): at the keep's gate
    // the way in is barred, and the company with the coin may go.
    if (r.inward.size && screen.path.some(p => p.kind === 'site')
      && (screen.path.some(p => p.kind === 'site' && this.within(p.id, r.named, r))
        || screen.exits.some(e => r.inward.has(e.id) && !e.blocked))) { return []; }
    const near = new Set((screen.around ?? []).map(d => d.id)), here = screen.place.name.toLowerCase();
    // Named by the aim is named in anything in it: an aim names a work's rooms and its site, never the place it is
    // set out for by (Lunalac's reading-glass named every room of it, and nothing led toward it: OWN-56).
    // The towns the country's roads go to are set out for as any other (a letter for Elmham, by the ford road).
    const journeys = [...screen.destinations ?? [], ...(screen.roads ?? [])
      .filter(d => !(screen.destinations ?? []).some(x => x.id === d.id))];
    // Nor set out for where a way from here goes straight to the place the aim names: on the road between Porthalen
    // and Reedbridge, "To the landing at Porthalen" and "Set out for Porthalen" had both been gold (GR-01: one gold).
    // Or into the town it names (the reeve at Porthalen, never seen: OR-881).
    if (screen.exits.some(e => !e.blocked && (r.named.has(e.destination.id)
      || r.named.has(screen.region?.within[e.destination.id] ?? '')) && !r.idle?.has(e.destination.id))) {
      return [];
    }
    return journeys.filter(d => !near.has(d.id) && this.within(d.id, r.named, r) && !r.idle?.has(d.id)
      && d.toward?.toLowerCase() !== here).map(d => ({ choice: `travel:${d.id}`, command: `travel:${d.id}`,
      kind: 'travel' as const, order: 0, label: `Set out ${d.toward ? 'toward' : 'for'} ${d.name}`, minutes: d.minutes,
      marks: Marks.journey(screen.elapsed, d.minutes) ? [Marks.dusk] : [], whys: ['named' as const],
      notes: { named: 'your aim' } }));
  }
  // What the company does by itself: light a light in the dark, tend whoever is hurt, eat when hungry, camp at night
  // in the open or weary, rest when hurt, search for a sign or where the aim is, and the place's own acts.
  private static yours(c: Choice, screen: Screen,
    at: { r: Reading; threat: boolean; lightless: boolean; threats?: Set<string> }): Candidate[] {
    const r = at.r, n = r.needs, kind = this.kind(c, r);
    const lit = at.lightless && kind === 'wait'
      ? (c.children ?? []).find(k => r.schema.get(k.command ?? '') === 'wait_for_light') : undefined;
    const mended = kind === 'tend' && [...n.hurt].some(id => c.id === `mend:${id}`);
    const whys: Why[] = [...kind === 'light' ? ['dark' as const] : [], ...lit ? ['dark' as const] : [],
      ...mended ? ['hurt' as const] : [], ...kind === 'eat' && n.hungry && n.rations > 0 ? ['hungry' as const] : [],
      ...kind === 'camp' && ((n.night && !n.settled) || n.weary) ? ['exposed' as const] : [],
      // Not a rest with nothing to eat, which mends nothing ("you would get up no better"): a hungry company had been
      // led to lie down and get up again, over and over (the laboratory's lost turns).
      ...kind === 'rest' && n.hurt.size > 0 && !at.threat && r.schema.get(c.command ?? '') !== 'rest_unfed'
        ? ['hurt' as const] : [], ...kind === 'search' && r.signs.has('') ? ['sign' as const] : [],
      // What the aim waits on, done by the company here (sitting up with the fevered child, a search where what it
      // waits on is hidden): its next step. A search is not the aim's for being made where the aim is: at Seolforfyrd
      // the debt's gold went to "Search", and "nothing is hidden here" (M21's playability list, PL-08).
      ...c.command && r.advances?.has(c.command) && !r.done.has(c.command) ? ['advance' as const] : [],
      ...this.ownWhy([c], r), ...this.answers(c, at) ? ['danger' as const] : [],
      ...r.schema.get(c.command ?? '') === 'lie_still' ? ['helpless' as const] : []];
    // A light lit in the dark says nothing more: the page says there is no light above it (M19-57).
    return [this.candidate(c, { kind, whys, r, notes: { ...lit ? { dark: 'until first light' } : {},
      helpless: 'you cannot move', hungry: 'you are hungry', exposed: n.weary ? 'you are weary' : 'night in the open', named: 'where your aim is',
      hurt: kind === 'tend' ? c.note ?? '' : 'you are hurt' }, ...lit?.command ? { command: lit.command } : {} })];
  }
  // Whether something the company can do of itself answers a danger here: its success changes a threat's standing
  // (a cleric's rite of rest puts out the raiser's candle and sends him off), as talking them round or fighting them
  // does; it is led with beside those (it had been offered and never led, so a calling's own way went unseen).
  private static answers(c: Choice, at: { r: Reading; threats?: Set<string> }): boolean {
    const touched = c.command ? at.r.touches?.get(c.command) : undefined;
    return !!touched && [...at.threats ?? []].some(t => touched.has(t));
  }
  // One of the place's own acts not done here (not a topic: what is asked of someone is theirs).
  private static ownWhy(choices: Choice[], r: Reading): Why[] { return Leaves.owned(choices, r) ? ['own'] : []; }
  // A thing at a place the aim names is not the aim's for being there: what its act brings about must be what the aim
  // waits on (see AimAdvances), as the ruts the father's cart went off by are. A town's own trouble at the old place a
  // debt is to be paid from (the cairn of offerings at Seolforfyrd, and at Tenebraetumulo for the oxen) had taken the
  // gold for standing there (M21's playability list, PL-05).
  // Whether what it does is done to something the aim names (not the company, nor the place it is done at).
  private static about(choices: Choice[], r: Reading): boolean {
    return choices.some(c => (r.args.get(this.command(c) ?? '') ?? []).some(a => r.named.has(a)));
  }
  // What a choice is, by the kind of action its command is, or by the company's own choices' kinds.
  static kind(c: Choice, r: Reading): Kind {
    if (c.id.startsWith('light:')) { return 'light'; }
    if (c.id.startsWith('mend:')) { return 'tend'; }
    if (/^(prepare|advance):/.test(c.id)) { return 'study'; }
    const kinds = (c.command ? [c] : Attending.all(c.children ?? []).filter(k => k.command))
      .map(k => r.schema.get(k.command!) ?? '');
    if (kinds.length && kinds.every(k => k.startsWith('wait'))) { return 'wait'; }
    const kind = kinds[0] ?? '';
    return ({ attack: 'attack', search: 'search', camp: 'camp', rest: 'rest', rest_unfed: 'rest', eat: 'eat',
      talk_to: 'talk' } as Record<string, Kind>)[kind] ?? (c.own ? 'act' : 'other');
  }
  // A way's acts gone by in turn, never one that is grave or a risk: the speaking door's first word had been pressed
  // at random, as the way's next act (the owner, 12 November).
  // Spoken to just now, what is next to ask them: what would teach, else anything not yet said to them.
  private static next(s: SceneSubject, r: Reading, learned: Choice | undefined, fresh: Choice[]): Choice | undefined {
    return s.kind === 'person' && r.talking === s.id ? learned ?? fresh.find(c => !r.done.has(c.command!)) : undefined;
  }
  // What an aim that names them, their kin or another held is led for within them; and where the opening's charge
  // names them and nothing else leads with them (Charge.acts: the reason the company came, Nest at the sea-gate), the
  // first thing not yet asked: the gold on their likeness had opened a drawer with nothing in it gold (OR-201).
  private static kept(kept: string | false | undefined, asked: Choice | undefined): Partial<Record<Why, string>> {
    return kept ? { named: kept, kin: kept, held: kept } : asked?.command ? { named: asked.command } : {};
  }
  // Something to learn of them is asked for: by greeting someone not yet met, by asking whoever is spoken to.
  private static spokenWhys(at: { learned?: Choice; next?: Choice; unmet: boolean }): Why[] {
    return [...(at.unmet || at.next) && at.learned ? ['asked' as const] : [], ...at.next ? ['talking' as const] : []];
  }
  private static spoken(at: { learned?: Choice; next?: Choice }): Partial<Record<Why, string>> {
    return { ...at.learned ? { asked: at.learned.command! } : {}, ...at.next ? { talking: at.next.command! } : {} };
  }
  // An opener's own command is its talk where it has one, and never a trade: done by a headless player, "Talk to
  // Mik", once he had been spoken to, had bought a coil of rope, a torch, rashers of bacon, ten times over (the
  // runner's blind walk, 15 November: TB-04).
  // One with a focus (a riddle to read) is none of its tries: it is opened, and read (CL-34).
  private static command(c: Choice): string | undefined {
    if (c.command) { return c.command; }
    if (c.focus) { return undefined; }
    const open = Attending.all(c.children ?? []).filter(k => k.command && !k.disabled && !k.grave && !k.risk);
    return (open.find(k => k.does === 'talk_to') ?? open.find(k => !/^(buy|sell)_/.test(k.does ?? '')))?.command;
  }
  private static risky(c: Choice): boolean {
    return !!c.risk || (!!c.children?.length && c.children.every(k => this.risky(k)));
  }
  // An opener's marks and those of the act inside it that it does: a thing's row that takes it carries what taking
  // it risks (cold play 3, CL-12: the vault's moonstone, led as "a cord of old rings" by its look, unwarned).
  private static marksOf(c: Choice, command?: string): Mark[] {
    const done = command && c.command !== command ? this.inside(c.children ?? [], command) : undefined;
    return [...c.marks ?? [], ...(done?.marks ?? []).filter(m => !c.marks?.some(x => x.kind === m.kind))];
  }
  private static inside(k: Choice[], command: string): Choice | undefined {
    return k.find(x => x.command === command) ?? k.map(x => this.inside(x.children ?? [], command)).find(Boolean);
  }
  private static candidate(c: Choice, at: { kind: Kind; whys: Why[]; r: Reading; subject?: string; exit?: string;
    notes?: Candidate['notes']; leaves?: Candidate['leaves']; command?: string; for?: string; visited?: boolean;
    pointed?: boolean }): Candidate {
    const command = at.command ?? this.command(c);
    // Done here already, and going nowhere, it is not the way toward the aim: the speaking door listened at, and
    // listened at again, had kept the gold (the owner, 12 November: never round a loop that advances nothing).
    // Nor a grave act, which the gold would have the company guess at (see command).
    const again = !!command && at.r.done.has(command) && at.r.schema.get(command) !== 'go' && !command.startsWith('travel:');
    // An opener with a focus is the step itself, done by opening it: the riddle read, its answers its rows (CL-34).
    const whys = again || this.risky(c) || (!command && !c.focus) ? at.whys.filter(w => w !== 'toward') : at.whys;
    // Called as it is standing alone, out of whoever's pane it belongs to: three animals' "Make much of" in one offer
    // had been three rows of the same words (FM-07; Act.alone, as Promotion's other rows are called).
    return { choice: c.id, label: c.alone || c.label, ...command ? { command } : {}, ...at.for ? { for: at.for } : {},
      ...at.subject ? { subject: at.subject } : {},
      ...at.kind === 'talk' && at.subject && at.r.known && !at.r.known.has(at.subject) ? { unmet: true as const } : {},
      ...at.leaves && Object.keys(at.leaves).length ? { leaves: at.leaves } : {},
      ...at.exit ? { exit: at.exit } : {}, kind: at.kind, whys, ...at.notes ? { notes: at.notes } : {},
      order: 0, marks: this.marksOf(c, command), ...c.minutes ? { minutes: c.minutes } : {},
      ...this.risky(c) ? { risk: true } : {}, ...c.own ? { own: true } : {}, ...c.teaches ? { teaches: true } : {},
      ...command && at.r.done.has(command) ? { known: true } : {},
      ...at.visited !== undefined ? { visited: at.visited } : {}, ...at.pointed ? { pointed: true } : {},
      ...c.disabled ? { barred: true } : {},
      ...c.focus ? { holds: Attending.all(c.children ?? []).flatMap(k => k.command ?? []) } : {} };
  }
}
