import type { Catalog, CompanyView, Frame, Member, Setting } from '../engine/protocol';
import type { ReaderApp } from './reader-app';

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
      app.setState({ phase: 'company', campaign, seed: seed ?? choice?.seed ?? 'kyr', setting, party: setting.party,
        editing: -1, origin: setting.origins?.[0]?.id });
      await this.preview(setting.party);
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
  // A change to one companion. Changing calling or specialization discards choices that no longer fit.
  edit(index: number, field: string, value: string) {
    const party = structuredClone(this.app.state.party), member = party[index];
    if (!member) { return; }
    if (field === 'specialization') { member.traits = value ? [value] : []; delete member.spells; }
    else if (field === 'backgroundId' && !value) { delete member.backgroundId; }
    else {
      (member as unknown as Record<string, string>)[field] = value;
      if (field === 'classId') { delete member.traits; delete member.spells; }
    }
    this.app.setState({ party });
    if (field !== 'name') { void this.preview(party); }
  }
  // In a generated region a company may set out as one, and find the rest on the road.
  readonly alone = () => { this.preset(this.app.state.party.slice(0, 1)); };
  readonly begin = () => { void this.setOut(); };
  async setOut() {
    const s = this.app.state;
    this.app.setState({ phase: 'loading', stage: 'Setting out', error: '' });
    await this.enter(this.app.engine.request<Frame>({ kind: 'begin', campaign: s.campaign, seed: s.seed,
      party: s.party, ...this.app.props.query.get('terrain') ? { terrain: this.app.props.query.get('terrain')! } : {},
      ...s.setting?.generated && s.origin ? { origin: s.origin } : {} }), 'company');
  }
  async resume(text: string) {
    this.app.setState({ phase: 'loading', stage: 'Finding where you left off', error: '' });
    await this.enter(this.app.engine.request<Frame>({ kind: 'resume', saved: text }), 'title');
  }
  private async enter(request: Promise<Frame>, otherwise: 'company' | 'title') {
    try {
      const frame = await request;
      this.app.setState({ phase: 'play', frame, view: 'here', cursor: 0, trail: [], member: '' });
    } catch (error) { this.fail(error, otherwise); }
  }
  private fail(error: unknown, phase?: 'title' | 'campaigns' | 'company') {
    const message = error instanceof Error ? error.message : String(error);
    this.app.setState({ error: message, phase: phase ?? this.app.state.phase });
  }
  readonly title = () => {
    this.app.setState({ phase: 'title', frame: undefined, view: 'here', pending: undefined, error: '' });
  };
  readonly campaigns = () => { this.app.setState({ phase: 'campaigns', error: '' }); };
  readonly carryOn = () => { if (this.app.state.saved) { void this.resume(this.app.state.saved.text); } };
}
