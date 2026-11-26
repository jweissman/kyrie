import { WorldVault } from './world-vault';
import type { Catalog, CompanyView, Frame, Member, Request, Setting } from '../../src/creation/protocol';
import type { ReaderApp } from './reader-app';
import { CreationRules } from '../../src/creation/creation-rules';
import { CreationDefaults } from '../../src/creation/creation-defaults';
import { CreationFlow, type CreationChoice, type CreationStep, type CreationStepId } from '../../src/creation/creation-flow';
import type { CreationState } from '../engine/engine-creation';
import { FirstChoice, type Beginning, type Way, type Where } from '../../src/creation/first-choice';
import { ReaderStore, type SavedGame } from './reader-store';
import { WorldStage } from './stage/world-stage';
import { Scenery } from '../../src/ui/scenery';
import { Shell } from './shell';

// Where a resume that fails goes: back to a phase, or on to what the caller does (Play: a new game, see played).
type Otherwise = 'company' | 'title' | ((error: unknown) => void);
// Before play: the title, the choice of campaign, forming the company, and setting out (or carrying on).
export class ReaderOpening {
  constructor(private readonly app: ReaderApp) {}
  async boot() {
    const app = this.app, query = app.props.query;
    try {
      const catalog = await app.engine.request<Catalog>({ kind: 'catalog' });
      app.setState({ catalog });
      // A campaign named in the address is where a new company would begin, unless a game is already under way (one
      // ended is not: Play begins anew over it, so its country is drawn ahead as for none).
      if (FirstChoice.continues(this.kept())) { return; }
      if (query.get('world')) { await this.pick('world', query.get('world')!); }
      else if (query.get('campaign')) { await this.pick(this.campaign(query.get('campaign')!, catalog)); }
      else { this.foresee(); }
    } catch (error) { this.fail(error); }
  }
  // ?campaign= names a campaign by its manifest path or by its id ("serewater-march").
  private campaign(asked: string, catalog: Catalog): string {
    const path = `data/campaigns/${asked.replace(/\.campaign\.json$/, '')}.campaign.json`;
    return catalog.campaigns.find(c => c.id === asked || c.id === path)?.id ?? asked;
  }
  async pick(campaign: string, seed?: string) {
    const app = this.app, choice = app.state.catalog?.campaigns.find(c => c.id === campaign);
    app.setState({ phase: 'loading', stage: campaign === 'world' ? 'Drawing a region' : 'Opening the campaign',
      error: '' });
    try {
      const setting = campaign === 'world'
        ? await app.engine.request<Setting>({ kind: 'world', seed: seed ?? choice?.seed ?? 'thorn',
          ...app.props.query.get('terrain') ? { terrain: app.props.query.get('terrain')! } : {} })
        : await app.engine.request<Setting>({ kind: 'setting', campaign });
      // The first reason for having come is chosen to begin with, and what it makes you with it; and in a drawn
      // country, the rest of a protagonist as it stands until changed (see CreationDefaults).
      const first = setting.origins?.[0], party = structuredClone(setting.party), catalog = app.state.catalog;
      if (first?.background && party[0]) { party[0].backgroundId = first.background; }
      if (setting.generated && party[0] && catalog) {
        CreationDefaults.settle(party[0], catalog, { trade: !first?.background });
      }
      // A drawn country's life is the engine's to hold (EngineCreation): where it stands, asked once it is drawn.
      const creation = setting.generated && campaign === 'world'
        ? await app.engine.request<CreationState>({ kind: 'creation' }) : undefined;
      app.setState({ phase: 'company', campaign, seed: seed ?? choice?.seed ?? 'kyr', setting,
        party: creation ? [creation.member, ...party.slice(1)] : party, editing: -1,
        origin: creation ? creation.origin : first?.id, named: false, creation });
      // Where the life begins is the world's (CreationFlow.circumstance); an address may name one (?origin=kin), for a
      // tester or a spec that must begin in a known circumstance.
      const named = app.props.query.get('origin');
      if (creation && named && setting.origins?.some(o => o.id === named)) { await this.chosen('origin', named); }
      this.readySoon();
      await this.preview(party);
    // A pick that fails goes back where it came from: the title, or for development (?dev) the list of campaigns (a
    // player never sees a campaign with a party ready made: the owner, 6 November).
    } catch (error) { this.fail(error, this.app.props.query.has('dev') ? 'campaigns' : 'title'); }
  }
  async preview(party: Member[]) {
    const generated = !!this.app.state.setting?.generated;
    const preview = await this.app.engine.request<CompanyView>({ kind: 'preview', party, generated });
    if (this.app.state.party === party) { this.app.setState({ preview }); }
  }
  preset(members: Member[]) {
    const party = structuredClone(members);
    this.app.setState({ party, editing: -1 });
    void this.preview(party);
  }
  // Making the protagonist as the engine's one flow says it (CreationFlow, held by the engine for a drawn country):
  // its steps, their questions and cards, and which is chosen; the page shows them and says which was chosen.
  steps(): CreationStep[] { return this.app.state.creation?.steps ?? []; }
  // A card chosen at a step of the flow: the choice goes to the engine, and what it settles comes back.
  choose(step: CreationStepId, id: string) { if (this.app.state.creation) { void this.chosen(step, id); } }
  // How many choices have gone to the engine's making: a reply to one older than the last sent is dropped (see chosen).
  private sent = 0;
  private async chosen(step: CreationChoice, value: string) {
    const app = this.app;
    // A press while a step that leads is answered goes nowhere: it had landed on the step after, as it stood before.
    if (app.state.waiting && step !== 'back') { return; }
    this.pressed(step, value);
    const mine = ++this.sent;
    try {
      const creation = await app.engine.request<CreationState>({ kind: 'creation', step, value });
      // Answered after a later choice was sent, the reply is dropped: that one's answer carries this one's too (the
      // engine takes them in order), and this one's step would set the page back where it was (a name written and
      // Enter pressed: the page went on, then the name's late answer set it back on "Choose your name" while the
      // answer to going on was still being made; the browser's naming spec on a loaded runner, 19 and 20 November).
      if (mine !== this.sent) { return; }
      // A name being written stays as the hand has it (a reply to an earlier letter must not undo a later one).
      const member = step === 'name' || step === 'drawn'
        ? { ...creation.member, name: app.state.party[0]?.name ?? creation.member.name } : creation.member;
      const party = [member, ...app.state.party.slice(1)];
      app.setState({ creation, party, origin: creation.origin, waiting: undefined, ...step === 'name' ? { named: !!value.trim() } : {},
        ...step === 'drawn' ? { named: false } : {} });
      if (!ReaderOpening.unmade.includes(step)) { void this.preview(party); }
      this.readySoon();
    } catch (error) { if (mine === this.sent) { app.setState({ waiting: undefined }); this.fail(error, 'company'); } }
  }
  // A change to one companion: the protagonist of a drawn country by the engine's making (which draws a name again
  // for a new people or way of presenting, and takes again as it stands what a change discards: CreationFlow); an
  // authored company's companion by the same rules, here.
  edit(index: number, field: string, value: string) {
    // The engine's making, where it holds it: each change goes to it as the choice it is (see CreationChoice).
    const engine = ReaderOpening.choices[field];
    if (this.app.state.creation && index === 0 && engine) {
      void this.chosen(engine, value);
      return;
    }
    // An authored campaign's companion, changed on its company page by creation's own rules (CreationFlow.changed).
    const party = structuredClone(this.app.state.party), member = party[index], catalog = this.app.state.catalog;
    if (!member || !catalog) { return; }
    if (field === 'specialization') { member.traits = value ? [value] : []; delete member.spells; }
    else if (field === 'backgroundId' && !value) { delete member.backgroundId; }
    else { CreationFlow.changed(member, catalog, field, value); }
    this.app.setState({ party });
    if (field !== 'name') { void this.preview(party); }
    this.readySoon();
  }
  // The press shown at once, never waiting on the engine (the grammar: focus and choosing answer in the same frame):
  // the card chosen, the field it names set, two rolls changed over; what the choice settles besides comes back with
  // the engine's state and replaces this.
  private static toggled(step: { picked?: string[]; many?: number }, value: string): string[] {
    const picked = step.picked ?? [];
    return picked.includes(value) ? picked.filter(id => id !== value)
      : picked.length < (step.many ?? 0) ? [...picked, value] : picked;
  }
  private pressed(step: CreationChoice, value: string) {
    const s = this.app.state, creation = s.creation, member = s.party[0];
    if (!creation || !member) { return; }
    const field = ({ you: 'raceId', calling: 'classId', presenting: 'pronouns', weapon: 'weapon', sign: 'sign',
      trade: 'backgroundId' } as Partial<Record<CreationChoice, keyof Member>>)[step];
    const named = step === 'name' || step === 'drawn';
    const now = { ...member, ...field ? { [field]: value } : {}, ...named ? { name: value } : {} } as Member;
    const [a, b] = step === 'place' ? value.split(':') : [], rolled = now.rolled as Record<string, number> | undefined;
    if (a && b && rolled?.[a] !== undefined && rolled[b] !== undefined) {
      now.rolled = { ...rolled, [a]: rolled[b]!, [b]: rolled[a]! };
    }
    // At a step of many a card is taken or let go at once, and the page stays; its last card goes on.
    const here = creation.steps.find(x => x.id === step), toggle = !!here?.many && value !== here.cards.at(-1)?.id;
    const steps = creation.steps.map(x => x.id !== step ? x : toggle ? { ...x, picked: ReaderOpening.toggled(x, value) }
      : { ...x, chosen: value }), why = step === 'origin' ? { origin: value } : {};
    // Where the making goes, as the engine said it would: a card chosen at the step asked (or a name drawn at the name)
    // goes on, back goes back; the engine's answer then stands in its place.
    // A step whose next hangs on the choice (CreationStep.leads) waits for the engine to say where it goes.
    // A step whose next hangs on the choice stays, its row taken and held there, committed, until the engine says what
    // comes next (CreationStep.leads): the press is answered at once, and nothing else is taken meanwhile (the owner,
    // 18 November: "a 'locked/committed' state of the menu item that says the final value has been accepted").
    const leads = step === creation.at && !!creation.steps.find(x => x.id === step)?.leads;
    const on = (step === creation.at && step !== 'name' && !leads && !toggle) || (step === 'drawn' && creation.at === 'name')
      || step === 'onward';
    const at = step === 'back' ? creation.back ?? creation.at : on ? creation.on : creation.at;
    // Gone on, the way back is to the step it came from, at once: Escape pressed before the engine's answer had come
    // went to the title, the step back not yet known (a press, not a hold, leaves no time for the answer: OR-169).
    const back = on && at !== creation.at ? { back: creation.at } : {};
    this.app.setState({ creation: { ...creation, steps, at, ...back, ...why }, party: [now, ...s.party.slice(1)],
      ...why,
      ...leads ? { waiting: value } : {} });
  }
  // A name taken from the table, borne as the table's (see CreationChoice).
  drawn(name: string) { void this.chosen('drawn', name); }
  // A step back or on, and another hand of a step's options, as the engine keeps them.
  move(by: 'back' | 'onward') { void this.chosen(by, ''); }
  roll() { void this.chosen('roll', ''); }
  // Each field the page changes, as the engine's making names the choice.
  // What leaves the life as it was made: a name (shown as written), and moving about the steps.
  static readonly unmade: CreationChoice[] = ['name', 'drawn', 'back', 'onward', 'roll'];
  static readonly choices: Record<string, CreationChoice> = { raceId: 'you', classId: 'calling', pronouns: 'presenting',
    name: 'name', specialization: 'specialty', backgroundId: 'trade', weapon: 'weapon' };
  // While the player reads the page, the start is made ready for the choices as they stand, a moment after the last
  // change (see EngineHost.prepare): Begin asking the same takes it up at once.
  private readyTimer?: ReturnType<typeof setTimeout>;
  readySoon() {
    clearTimeout(this.readyTimer);
    this.readyTimer = setTimeout(this.makeReady, 1200);
  }
  // A life the engine holds is made ready by the engine itself, at each choice, for the start its set-out asks
  // (EngineStarts.readying): the page's own, for other choices, would only give that one up (OR-08).
  private readonly makeReady = () => {
    const s = this.app.state;
    if (s.phase !== 'company' || !s.setting?.generated || s.creation) { return; }
    void this.app.engine.request({ kind: 'ready', ...this.starting() }).catch(() => undefined);
  };
  private starting() {
    const s = this.app.state, terrain = this.app.props.query.get('terrain');
    // The one made sets out with the weapon the page shows them with: theirs, or the one they strike best with, whoever
    // comes with them (the second blind playtest: creation said "A battleaxe in hand" of a dwarf who set out beside a
    // bard of her origin's with the calling's longsword, the default kept only for one who came alone).
    const one = s.setting?.generated && s.catalog && s.party[0];
    const calling = one ? s.catalog!.callings.find(c => c.id === one.classId) : undefined;
    const weapon = one && !one.weapon && calling ? CreationRules.best(calling.weapons, one, s.catalog!)?.id : undefined;
    // And with a name, whatever is left in the field.
    const armed = one ? [{ ...one, name: CreationDefaults.named(one, s.setting), ...weapon ? { weapon } : {} },
      ...s.party.slice(1)] : s.party;
    return { campaign: s.campaign, seed: s.seed, party: armed, ...terrain ? { terrain } : {},
      ...s.setting?.generated && s.origin ? { origin: s.origin } : {}, ...s.memorial ? { memorial: s.memorial } : {} };
  }
  // In a generated region a company may set out as one, and find the rest on the road.
  readonly alone = () => { this.preset(this.app.state.party.slice(0, 1)); };
  readonly begin = () => { void this.setOut(); };
  async setOut() {
    const starting = this.starting();
    this.app.setState({ phase: 'loading', stage: 'Setting out', error: '', leaving: true, approach: undefined });
    clearTimeout(this.readyTimer);
    await this.rising();
    // The life the engine holds, set out with as it stands (EngineCreation); else the page's own company.
    await this.enter(this.app.state.creation
      ? this.app.engine.request<Frame>({ kind: 'set-out', apart: this.apart() })
      : this.app.engine.request<Frame>({ kind: 'begin', ...starting, apart: this.apart() }), 'company');
  }
  // Whether the page tells a new game's opening apart, before the first place (see PrologueStage). The engine says
  // whether there is one (an origin's first moment; an authored campaign has none, and opens on its first place).
  // Automation goes straight to the place unless the address asks (?opening), as it is spared the studio's mark.
  apart(): boolean {
    return !navigator.webdriver || this.app.props.query.has('opening');
  }
  // Automation (kyrieMono.begin): set out with exactly this company, as Begin would, so a kept journey can be played
  // again in the browser in the world it was recorded in.
  async setOutWith(starting: Omit<Extract<Request, { kind: 'begin' }>, 'kind'>) {
    this.app.setState({ phase: 'loading', stage: 'Setting out', error: '', leaving: true, approach: undefined });
    await this.enter(this.app.engine.request<Frame>({ kind: 'begin', ...starting }), 'company');
  }
  // A game kept before anything was done in it opens on its opening again, where the page tells it apart. One that
  // cannot be opened goes back to the title, or where Play took it up, on to a new game (see played).
  async resume(text: string, world?: string, otherwise: Otherwise = 'title') {
    // The engine lets go of a country drawn ahead as a kept game is opened (EngineForesight.drop): the page forgets it
    // too, so that a new game begun after it is rolled afresh, never asked of a country no longer drawn (AX-04).
    this.foreseen = undefined;
    this.app.setState({ phase: 'loading', stage: 'Finding where you left off', error: '', leaving: false });
    await this.enter(this.app.engine.request<Frame>({ kind: 'resume', saved: text, ...world ? { world } : {},
      apart: this.apart() }), otherwise);
  }
  private async enter(request: Promise<Frame>, otherwise: Otherwise, quick = false) {
    try {
      const frame = await request;
      await this.approach(frame, quick);
      // A game begun opens on its opening, where the engine told one apart; one taken up again, on where it was.
      // Play begins where the company is (see WorldStage.begins).
      // The loading page's last words are its own: left in the state, they were told again under the first act taken
      // ("Telling where you are.": M22's review, OR-24).
      // The painting risen behind setting out is kept for the opening told over it (OR-1123: put away here, the opening
      // had worked out a way in of its own and dissolved to it); a game with no opening lets it go.
      this.app.setState({ phase: 'play', frame, view: 'here', cursor: 0, open: [], member: '', leaving: false, stage: '',
        approach: frame.leaf.prologue ? this.app.state.approach : undefined,
        outdoors: WorldStage.begins(frame),
        prologue: frame.leaf.prologue ? 0 : undefined, told: frame.leaf.prologue, beat: performance.now() });
      // A spec's earned stage (?earned, OR-1245): every surface earned as play begins.
      if (this.app.props.query.has('earned')) { await this.app.earn(); }
    } catch (error) { if (typeof otherwise === 'function') { otherwise(error); } else { this.fail(error, otherwise); } }
  }
  // A new game's opening is told over the way in: set out from the choice of a life, that painting comes up out of the
  // dark behind the setting out's last words, and the opening begins over it once it is most of the way up, so that
  // it is seen once, rising, and never shown and put up again (the owner, 18 November, OR-77). One who asks for less
  // motion is not kept waiting on it, nor one who set out now (quick: in the world in under a second, OR-120).
  // Setting out on a life whose origin tells its opening, the painting comes up at once, behind that opening's first
  // page (see LoadingPage.opening), and stays: the first scene is then drawn on it, not cut to (OR-23).
  // What it rises for is passed by the caller where it has just been set: the page's state is not yet what was set
  // (React takes a setState up later), and read from it, Set out now's rise had found no origin and no country, so
  // that the opening's words stood on the dark and its painting came up under them afterwards (OR-1123).
  private async rising(now: { setting?: Setting; origin?: string; seed: string } = this.app.state) {
    const told = now.setting?.origins?.find(o => o.id === now.origin)?.opening;
    if (!told || !this.apart()) { return; }
    const plate = Scenery.country(now.setting?.terrain, now.seed);
    if (!plate) { return; }
    await Shell.had(plate);
    this.app.setState({ approach: plate });
  }
  private async approach(frame: Frame, quick: boolean) {
    // Up already behind the opening's first page while the world was made: kept as it is.
    if (this.app.state.approach) { return; }
    const plate = frame.leaf.prologue && this.app.state.leaving
      ? Shell.way(frame, this.app.state.setting?.terrain, this.app.state.seed) : undefined;
    if (!plate) { return; }
    await Shell.had(plate);
    this.app.setState({ approach: plate });
    if (!quick && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise(done => setTimeout(done, Shell.waited));
    }
  }
  private fail(error: unknown, phase?: 'title' | 'campaigns' | 'company') {
    const message = error instanceof Error ? error.message : String(error);
    this.app.setState({ error: message, phase: phase ?? this.app.state.phase, leaving: false, approach: undefined });
  }
  readonly title = () => {
    this.app.setState({ phase: 'title', frame: undefined, view: 'here', pending: undefined, error: '' });
  };
  readonly campaigns = () => { this.app.setState({ phase: 'campaigns', error: '' }); };
  // A new game: first, how it begins (FirstChoice, the engine's question: build a character, or set out now), asked at
  // once, the country it will begin in drawn meanwhile if it is not drawn already (see foresee).
  // seed: the country it begins in, where the title names one (New character in the world kept here).
  // fresh: a new world asked for (New world), never the one already drawn ahead.
  readonly anew = (seed?: string, fresh = false) => {
    this.app.setState({ phase: 'begin', memorial: undefined, error: '', fresh });
    if (fresh || !this.foreseen || (seed && seed !== this.foreseen.seed)) { this.foresee(seed); }
  };
  // Where New Game's new life begins (FirstChoice.step): in the country kept here unless a new one is asked for.
  where(): Where {
    const kept = this.kept()?.seed;
    return kept ? { kept, ...this.app.state.fresh ? { fresh: true } : {} } : {};
  }
  // New Game's World turned over (OR-1072): the kept country, or a new one drawn for it at once. The kept world is let
  // go only when the new life sets out in another (beginAs), never by turning the row.
  readonly turnWorld = () => {
    const where = this.where();
    if (!where.kept) { return; }
    this.anew(where.fresh ? where.kept : undefined, !where.fresh);
  };
  // The seed a new game will use, named as the title shows, and its country drawn for it in the engine while the
  // title is up, with the start Set out now asks made ready behind it (OR-121, EngineForesight): never where a game is
  // kept, whose Continue must not wait on it, until New game is pressed.
  // The seed is kept as it is asked of the engine (ready), so that a choice made before it has come takes the same
  // seed, and the country drawn ahead for it, never a second roll (OR-770).
  private foreseen?: { seed?: string; ready: Promise<string> };
  private foresee(asked?: string) {
    if (asked) { this.foreseen = { seed: asked, ready: Promise.resolve(asked) }; void this.ahead(asked); return; }
    const foreseen: NonNullable<ReaderOpening['foreseen']> = { ready: this.fresh() };
    this.foreseen = foreseen;
    void foreseen.ready.then(seed => { foreseen.seed = seed; return this.ahead(seed); }).catch(() => undefined);
  }
  private ahead(seed: string) { return this.app.engine.request({ kind: 'ahead', seed }).catch(() => undefined); }
  // A new life's seed, the engine's (FreshSeeds): a world whose first town is the reference game's.
  private fresh(): Promise<string> { return this.app.engine.request<string>({ kind: 'seed' }); }
  // How the new game begins, as chosen (see FirstChoice): a life built step by step in the country drawn for it, or
  // set out at once.
  beginAs(how: Beginning) {
    const foreseen = this.foreseen, where = this.where();
    this.foreseen = undefined;
    if (where.fresh && where.kept) { ReaderStore.forget(where.kept); }
    void (async () => {
      const seed = await foreseen?.ready.catch(() => undefined) ?? await this.fresh();
      await (how === 'set-out-now' ? this.now(seed) : this.pick('world', seed));
    })();
  }
  // Set out now (OR-120): the country the title drew, and a life drawn whole from creation's own defaults, set out with
  // at once; the way in is not waited on, the opening coming up with its painting.
  private async now(seed: string) {
    const app = this.app;
    app.setState({ phase: 'loading', stage: 'Setting out', error: '', leaving: true, approach: undefined });
    try {
      const setting = await app.engine.request<Setting>({ kind: 'world', seed });
      const creation = await app.engine.request<CreationState>({ kind: 'creation' });
      app.setState({ campaign: 'world', seed, setting, party: [creation.member], editing: -1, origin: creation.origin,
        named: false, creation });
      await this.rising({ setting, origin: creation.origin, seed });
    } catch (error) { this.fail(error, 'title'); return; }
    await this.enter(app.engine.request<Frame>({ kind: 'set-out', rolled: true, apart: this.apart() }), 'title', true);
  }
  // Another country, from creation: drawn from a seed of its own, which the save keeps.
  readonly another = () => {
    this.app.setState({ memorial: undefined });
    void this.fresh().then(seed => this.pick('world', seed));
  };
  // The same country again, as someone else, after a death in it: it remembers who died, and where.
  readonly again = () => {
    const frame = this.app.state.frame, memorial = frame?.ending?.memorial;
    this.app.setState({ ...memorial ? { memorial } : {} });
    void (async () => this.pick('world', frame?.transcript.seed ?? await this.fresh()))();
  };
  // The game kept here, as the title offers it: refused once it has failed to open in this page or was remembered so
  // (see played), and then said so on the title, never continued.
  kept(): SavedGame | undefined {
    const saved = this.app.savedGame;
    return saved && saved.text === this.unopened?.text ? { ...saved, refused: this.unopened.reason } : saved;
  }
  private unopened?: { text: string; reason: string };
  // A way in from the title, by its id (FirstChoice.title, OR-1072): the game kept here taken up; or New Game, which
  // asks how a new life begins, in the world kept here unless a new one is asked for there (turnWorld). The page draws
  // the engine's rows and binds each to this, nothing else.
  readonly way = (way: Way) => {
    const kept = this.kept();
    if (way === 'continue') { if (FirstChoice.continues(kept)) { this.carryOn(); } return; }
    this.anew(FirstChoice.seedFor({ ...kept?.seed ? { kept: kept.seed } : {} }));
  };
  // Quit (OR-1072): a page may not close the tab a player opened, so the game is put away, honestly: the tab closed
  // where the browser allows it (one opened by a script), else the quiet closing page, which says the game is kept
  // and the page may be closed. Nothing is lost: a game is kept as each act is done, and none is in play here.
  readonly quit = () => {
    this.app.setState({ phase: 'closed', error: '' });
    try { window.close(); } catch { /* not this page's to close */ }
  };
  readonly carryOn = () => {
    const saved = this.kept();
    if (!saved) { return; }
    // A world kept in the vault is fetched as the game is taken up (see WorldVault).
    void (async () => {
      const world = ReaderStore.worldOf(saved) ?? (saved.vaulted ? await WorldVault.get(saved.vaulted) : undefined);
      await this.resume(saved.text, world,
        this.played.bind(this, saved));
    })();
  };
  // The kept game Continue took up could not be opened (another edition kept it, or its world is gone): the title
  // again, Continue gone from it and why said plainly; remembered beside the game, so a reload says it too. It is never
  // migrated (beta: no save-compatibility promise), and a new character or a new world is the player's to choose.
  private played(saved: SavedGame, error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    this.unopened = { text: saved.text, reason };
    ReaderStore.refuse(reason);
    this.app.setState({ phase: 'title', leaving: false, approach: undefined, error: '' });
  }
}
