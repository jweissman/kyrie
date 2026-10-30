import type { Catalog, CompanyView, Frame, Member, Request, Setting } from '../engine/protocol';
import type { ReaderApp } from './reader-app';
import { Rolls } from '../../src/rules/rolls';
import { CreationRules } from './creation-rules';
import { CreationDefaults } from './creation-defaults';

// Before play: the title, the choice of campaign, forming the company, and setting out (or carrying on).
export class ReaderOpening {
  constructor(private readonly app: ReaderApp) {}
  async boot() {
    const app = this.app, query = app.props.query;
    try {
      const catalog = await app.engine.request<Catalog>({ kind: 'catalog' });
      app.setState({ catalog });
      // A campaign named in the address is where a new company would begin, unless a game is already under way.
      if (app.state.saved) { return; }
      if (query.get('world')) { await this.pick('world', query.get('world')!); }
      else if (query.get('campaign')) { await this.pick(this.campaign(query.get('campaign')!, catalog)); }
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
      app.setState({ phase: 'company', campaign, seed: seed ?? choice?.seed ?? 'kyr', setting, party,
        editing: -1, origin: first?.id, named: false });
      this.readySoon();
      await this.preview(party);
    } catch (error) { this.fail(error, 'campaigns'); }
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
  // A change to one companion. Changing calling or specialization discards choices that no longer fit; in a drawn
  // country, what is discarded is taken again as it stands until changed (see CreationDefaults), and a name the
  // player has not written or chosen is drawn again for a new people, or a new way of presenting.
  edit(index: number, field: string, value: string) {
    const party = structuredClone(this.app.state.party), member = party[index], was = member?.classId;
    if (!member) { return; }
    const people = member.raceId;
    if (field === 'specialization') { member.traits = value ? [value] : []; delete member.spells; }
    else if (field === 'backgroundId' && !value) { delete member.backgroundId; }
    else { this.change(member, field, value); }
    const s = this.app.state, drawn = index === 0 && s.setting?.generated && s.catalog;
    if (drawn) { CreationDefaults.settle(member, s.catalog!, { trade: !this.given(), was }); }
    if (drawn && !s.named && ((field === 'raceId' && value !== people) || field === 'pronouns')) {
      member.name = CreationDefaults.names(member, s.setting)[0] ?? member.name;
    }
    // A name emptied is no name written: the next people's is drawn again, and the drawn one is set out with.
    this.app.setState({ party, ...field === 'name' ? { named: !!value.trim() } : {} });
    if (field !== 'name') { void this.preview(party); }
    this.readySoon();
  }
  private change(member: Member, field: string, value: string) {
    const catalog = this.app.state.catalog, was = member.classId;
    (member as unknown as Record<string, string>)[field] = value;
    // A people takes only the callings open to it: one that is not takes the first that is.
    const people = catalog?.ancestries.find(a => a.id === member.raceId), open = people?.callings;
    if (field === 'raceId' && open?.length && !open.includes(member.classId ?? '')) { member.classId = open[0]!; }
    // A way and its spells are the calling's: a new calling, or a people that may not take the way, has none.
    if (field === 'classId' || member.classId !== was || member.traits?.some(t => people?.forbids.includes(t))) {
      delete member.traits; delete member.spells;
    }
    // A calling's weapons are its own: a new calling's is the one its bearer strikes best with until chosen; and its
    // rolls are placed where it wants them.
    if (field === 'classId') { delete member.weapon; this.suit(member); }
    // A trade is a calling's own: a new calling has none until one is chosen.
    const trade = catalog?.backgrounds.find(b => b.id === member.backgroundId);
    if (field === 'classId' && trade?.calling && trade.calling !== member.classId) { delete member.backgroundId; }
  }
  // Whether the reason for having come gives a trade of its own (one who comes over the hills brings their own).
  private given(): boolean {
    const s = this.app.state;
    return !!s.setting?.origins?.find(o => o.id === s.origin)?.background;
  }
  // A reason for having come, and what it makes you: its own background, or, for one who brings their own trade,
  // none until it is chosen, or in a drawn country the calling's own until then (the engine gives the origin's too:
  // Origins.member).
  origin(id: string) {
    const party = structuredClone(this.app.state.party), member = party[0], s = this.app.state;
    const given = s.setting?.origins?.find(o => o.id === id)?.background;
    if (member) { if (given) { member.backgroundId = given; } else { delete member.backgroundId; } }
    if (member && s.setting?.generated && s.catalog) { CreationDefaults.settle(member, s.catalog, { trade: !given }); }
    this.app.setState({ origin: id, party });
    this.readySoon();
  }
  // Two qualities' rolls changed over, as the player places them.
  place(a: string, b: string) {
    const party = structuredClone(this.app.state.party);
    const rolled = party[0]?.rolled as Record<string, number> | undefined;
    if (!rolled || rolled[a] === undefined || rolled[b] === undefined) { return; }
    [rolled[a], rolled[b]] = [rolled[b]!, rolled[a]!];
    this.app.setState({ party });
    this.readySoon();
  }
  // Six new rolls of three dice, one on each quality where it falls.
  reroll() {
    const party = structuredClone(this.app.state.party), member = party[0];
    if (!member?.rolled) { return; }
    const die = new Uint8Array(18);
    crypto.getRandomValues(die);
    member.rolled = Object.fromEntries(Object.keys(member.rolled).map((q, i) => [q,
      [0, 1, 2].reduce((sum, k) => sum + 1 + die[i * 3 + k]! % 6, 0)]));
    this.suit(member);
    this.app.setState({ party });
    this.readySoon();
  }
  // The rolls placed where the member's calling wants them (see Rolls).
  private suit(member: Member) {
    const wants = this.app.state.catalog?.callings.find(c => c.id === member.classId)?.qualities;
    if (member.rolled && wants) { member.rolled = Rolls.suited(member.rolled as Record<string, number>, wants); }
  }
  // While the player reads the page, the start is made ready for the choices as they stand, a moment after the last
  // change (see EngineHost.prepare): Begin asking the same takes it up at once.
  private readyTimer?: ReturnType<typeof setTimeout>;
  readySoon() {
    clearTimeout(this.readyTimer);
    this.readyTimer = setTimeout(this.makeReady, 1200);
  }
  private readonly makeReady = () => {
    if (this.app.state.phase !== 'company' || !this.app.state.setting?.generated) { return; }
    void this.app.engine.request({ kind: 'ready', ...this.starting() }).catch(() => undefined);
  };
  private starting() {
    const s = this.app.state, terrain = this.app.props.query.get('terrain');
    // One who comes alone sets out with the weapon the page shows them with: theirs, or the one they strike best with.
    const one = s.setting?.generated && s.party.length === 1 && s.catalog && s.party[0]!;
    const calling = one ? s.catalog!.callings.find(c => c.id === one.classId) : undefined;
    const weapon = one && !one.weapon && calling ? CreationRules.best(calling.weapons, one, s.catalog!)?.id : undefined;
    // And with a name, whatever is left in the field.
    const armed = one ? [{ ...one, name: CreationDefaults.named(one, s.setting), ...weapon ? { weapon } : {} }]
      : s.party;
    return { campaign: s.campaign, seed: s.seed, party: armed, ...terrain ? { terrain } : {},
      ...s.setting?.generated && s.origin ? { origin: s.origin } : {}, ...s.memorial ? { memorial: s.memorial } : {} };
  }
  // In a generated region a company may set out as one, and find the rest on the road.
  readonly alone = () => { this.preset(this.app.state.party.slice(0, 1)); };
  readonly begin = () => { void this.setOut(); };
  async setOut() {
    const starting = this.starting();
    this.app.setState({ phase: 'loading', stage: 'Setting out', error: '', leaving: true });
    clearTimeout(this.readyTimer);
    await this.enter(this.app.engine.request<Frame>({ kind: 'begin', ...starting, apart: this.apart() }), 'company');
  }
  // Whether the page tells a new game's opening apart, before the first place (see PrologueStage). The engine says
  // whether there is one (an origin's first moment; an authored campaign has none, and opens on its first place).
  // Automation goes straight to the place unless the address asks (?opening), as it is spared the studio's mark.
  private apart(): boolean {
    return !navigator.webdriver || this.app.props.query.has('opening');
  }
  // Automation (kyrieMono.begin): set out with exactly this company, as Begin would, so a kept journey can be played
  // again in the browser in the world it was recorded in.
  async setOutWith(starting: Omit<Extract<Request, { kind: 'begin' }>, 'kind'>) {
    this.app.setState({ phase: 'loading', stage: 'Setting out', error: '', leaving: true });
    await this.enter(this.app.engine.request<Frame>({ kind: 'begin', ...starting }), 'company');
  }
  // A game kept before anything was done in it opens on its opening again, where the page tells it apart.
  async resume(text: string, world?: string) {
    this.app.setState({ phase: 'loading', stage: 'Finding where you left off', error: '', leaving: false });
    await this.enter(this.app.engine.request<Frame>({ kind: 'resume', saved: text, ...world ? { world } : {},
      apart: this.apart() }), 'title');
  }
  private async enter(request: Promise<Frame>, otherwise: 'company' | 'title') {
    try {
      const frame = await request;
      // A game begun opens on its opening, where the engine told one apart; one taken up again, on where it was.
      this.app.setState({ phase: 'play', frame, view: 'here', cursor: 0, open: [], member: '', leaving: false,
        prologue: frame.leaf.prologue ? 0 : undefined, beat: performance.now() });
    } catch (error) { this.fail(error, otherwise); }
  }
  private fail(error: unknown, phase?: 'title' | 'campaigns' | 'company') {
    const message = error instanceof Error ? error.message : String(error);
    this.app.setState({ error: message, phase: phase ?? this.app.state.phase, leaving: false });
  }
  readonly title = () => {
    this.app.setState({ phase: 'title', frame: undefined, view: 'here', pending: undefined, error: '' });
  };
  readonly campaigns = () => { this.app.setState({ phase: 'campaigns', error: '' }); };
  // A country no one has seen: drawn from a seed of its own, which the save keeps.
  readonly anew = () => { this.app.setState({ memorial: undefined }); void this.pick('world', ReaderOpening.seed()); };
  // The same country again, as someone else, after a death in it: it remembers who died, and where.
  readonly again = () => {
    const frame = this.app.state.frame, memorial = frame?.ending?.memorial;
    this.app.setState({ ...memorial ? { memorial } : {} });
    void this.pick('world', frame?.transcript.seed ?? ReaderOpening.seed());
  };
  static seed(): string {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    return [...bytes].map(b => 'bcdfghjklmnprstvwz'[b % 18]! + 'aeiou'[(b >> 5) % 5]!).join('');
  }
  readonly carryOn = () => {
    const saved = this.app.state.saved;
    if (saved) { void this.resume(saved.text, saved.world); }
  };
}
