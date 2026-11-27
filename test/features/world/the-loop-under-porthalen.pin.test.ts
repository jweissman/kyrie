import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { ScreenModel } from '../../../src/ui/screen-model';
import { Situations } from '../../../src/lang/situations';
import { AsMeant } from '../../support/as-meant';
import type { CreatureStore } from '../../../src/creature-store';
import { GoldenWalk } from '../../support/golden-walk';
import { TalkWay } from '../../support/talk-way';

// The brief's reference journey (BRIEF §3.2; sprint 3), in the supported fixture: Porthalen, Iscoed's first town, and
// the dungeon under it, grown from its undertown (three ways down, by the corn-store, the churchyard and the quarry,
// to an undercroft, a sealed vault and the old workings beyond). A new life as creation begins one (the adit), then:
// establish oneself (the notice, the salter's job and his key), prepare (a torch, a ration), enter and meet danger (the
// rats under the corn-store, the old buck in their nest), withdraw and be paid, recover (a bed at the Stone Horn), see
// the town answer (the salter's prices fall to a friend), and go down again another way. Every act by the rows the
// runner offers, found by their words; at every turn, nothing refused and something to do. The descent is a ladder
// (the lead's call, OR-198): the three ways down, gone all the way, bring a careful first life to the vault's door at
// its second level; the vault's keeper is said to be grave before it is fought, and fought it is deadly; and the
// raiser's book of the dead, carried to its chair, opens a way past it for a price.
type Row = { id: string; label: string; aside?: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
const established = ['~Read the notice on the well-post', "~To Holgar's salt-house",
  '~Holgar: the rats in the corn-store', '~Buy a torch for', '~Buy one ration from Holgar',
  '~To the old corn-store', '~Light a torch', '~Down to the corn-store cellar', '~To the rat-runs', '~Attack the rats',
  'through', '~Down to the nest', '~Attack the old buck rat', 'through', '~light a candle', '~Search here',
  '~Out to the landing at Porthalen', "~To Holgar's salt-house", '~Tell Holgar the rats under the corn-store are dead',
  '~To the taproom of the Stone Horn', '~Talk to Kynes', '~Take a bed and supper', '~Out to the landing at Porthalen',
  "~To Holgar's salt-house", '~Fill a lantern', '~To the landing at Porthalen'];
// The second way down, by the churchyard, to the vault's door.
const churchyard = ['~To the churchyard', '~Set your shoulder to the stone door', '~crypt', '~ossuary',
  '~Attack the man with the black candle', 'through', '~Search here', '~Down to the charnel passage',
  '~Attack the dead in the charnel passage', 'through', '~To the undercroft', '~Rest six hours',
  '~Press the three deep-cut letters', '~sealed vault'];
// The careful way: the quarry's spiders and their mother too, the dead from below, the raiser's book taken.
const careful = ['~To the old quarry pit', '~quarry adit', '~cut gallery', '~Attack the spider',
  'through', '~To the brood-chamber', "~Attack the spiders' mother", 'through', '~Search here', '~To the cut gallery',
  '~Down to the old working face', '~undercroft', '~Rest six hours', '~To the charnel passage',
  '~Attack the dead in the charnel passage', 'through', '~ossuary', '~Attack the man with the black candle', 'through',
  '~Collect a book of the dead', '~Down to the charnel passage', '~To the undercroft', '~Rest six hours',
  '~Press the three deep-cut letters', '~sealed vault'];
// The workings' first stretch, and back up to Holgar's by the churchyard (its stone door shouldered open from below).
const workings = ['~To the adit$', '~Search here', '~crossing', '~Look closely at the humming thing', '~To the old stope',
  '~Search here', '~Collect a bronze tally-board', '~Collect a lump of star-iron'];
const homeward = ['~To the crossing', '~To the adit$', '~adit mouth', '~stair below the vault',
  '~sealed vault', '~Up to the undercroft', '~charnel', '~ossuary', '~crypt', '~Set your shoulder', '~Up to the churchyard',
  '~landing at Porthalen', "~To Holgar's salt-house"];
// The second expedition: down by the churchyard, through the vault to the shaft head and the cage. The workings' mouth
// is named by the workings once the company has been through them (as the opening's longer beats left it, OR-441).
const again = ['~To the landing at Porthalen', '~To the churchyard', '~crypt', '~ossuary', '~charnel', '~undercroft',
  '~sealed vault', '~stair below the vault', '~adit mouth|old workings under Porthalen by the way in', '~To the adit$', '~crossing', '~To the old stope',
  '~To the shaft head', '~Press the word .Coffin', '~Work the seized wheel free', '~Down to the shaft bottom'];
class Walk {
  s!: Said;
  readonly log: string[] = [];
  fights = 0;
  private constructor(readonly r: Runner, readonly session: Runner['session']) {}
  static async begun(): Promise<Walk> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const walk = new Walk(new Runner(journey.session), journey.session);
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened())) { await AsMeant.ask(walk.r, line); }
    // The workings' first level's packs of wolves (OR-1230 put them in the mine, and they go about it, and newcomers
    // come to it from beyond) and the crossing's charge and rats taken out of it: the loop is the subject, and a
    // careful first life worn by three ways down falls to them.
    for (const room of ['mouth', 'shaft_head', 'crossing', 'beyond']) { walk.clear(`region__s1_ud_adit_${room}`); }
    walk.s = walk.r.said('look');
    return walk;
  }
  // Whoever lives in a room taken out of it.
  clear(room: string): void {
    const c = this.session.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    const here = this.session.campaign.world.related('at').filter(r => r.args[1] === room
      && this.session.campaign.module.entities.some(e => e.id === r.args[0] && e.type === 'group'));
    c.commit(c.world.apply(here.map(r => ({ kind: 'retract', call: ModuleWriter.call('at', ...r.args) }))));
    // And gone for good, so that none of them comes back to the room or goes about the level.
    const members = here.flatMap(r => this.session.campaign.readout.inhabitants[r.args[0]!] ?? []);
    const store = (this.session.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(members);
    try {
      for (const k of lease.creatures) { k.state.hp = 0; }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
  }
  holds(name: string, ...args: string[]): boolean {
    return this.session.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  row(words: string): Row | undefined { return rows(this.s).find(x => new RegExp(words, 'i').test(x.label)); }
  async play(steps: string[]): Promise<void> {
    for (const step of steps) {
      // Found as the page's player finds it, a talk open (TalkWay, OR-1451).
      const way = step === 'through' ? undefined
        : await TalkWay.find(this.r, this.s, x => new RegExp(step.slice(1), 'i').test(x.label));
      if (way) { this.s = way.said; }
      const row = way?.o;
      if (step !== 'through') {
        expect([step, row?.label], JSON.stringify({ you: this.s.you, end: this.s.end, moment: this.s.moment,
          rows: rows(this.s).map(r => r.label) })).toEqual([step, expect.any(String)]);
      }
      let said = await AsMeant.ask(this.r, JSON.stringify({ act: row?.id ?? RunnerFight.through }));
      // Pressed on, the fight is handed back at each new danger (PressOn, OR-830), and pressed on again past it.
      for (let i = 0; i < 40 && step === 'through' && !('error' in said) && said.moment === 'fight'; i++) {
        said = await AsMeant.ask(this.r, JSON.stringify({ act: RunnerFight.through }));
      }
      expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
      this.s = said as Said;
      // At every turn: something to do, unless the company is dead.
      expect([step, !!this.s.end || rows(this.s).length > 0]).toEqual([step, true]);
      const screen = ScreenModel.build(this.session.campaign);
      this.log.push(`${screen.expedition.time} ${screen.place.id} ${this.s.you ?? ''} :: ${step}`);
      if (step === 'through') { this.fights++; }
    }
  }
  // What was said at the last act, and the scene as it stands.
  said(): string { return [...this.s.scene.lines, ...this.r.said('look').scene.lines].join(' ').replaceAll('’', "'"); }
  level(): number { return ScreenModel.build(this.session.campaign).party[0]!.level; }
}
describe('the reference journey under Porthalen', () => {
  it('is walked by the offered rows alone, out and back twice, and the town answers', async () => {
    const walk = await Walk.begun();
    // What the adit and Hesper's going missing are, as Situations (BRIEF §6): records of their own, the lint content.
    const records = (walk.session.campaign.module.semantic ?? []).filter(r => r.kind === 'situation').map(r => r.id);
    expect(records).toEqual(expect.arrayContaining(['situation:adit/under_the_fall', 'situation:region/s1_hesper_missing']));
    expect(Situations.lint(walk.session.campaign.module)).toEqual([]);
    // Holgar is turned to for the question the notice sent the company to ask, not his talk of the old kingdom
    // (OR-199); and so is Kynes, for the quarry, whose key opens its gate.
    await walk.play(established.slice(0, 2));
    expect(rows(walk.s).find(x => x.id === 'region__s1_merchant#talk')?.label).toMatch(/rats in the corn-store/);
    // Come into the inn hurt from the rats' nest, the company is seen to be (the town answering its state, once).
    const inn = established.indexOf('~To the taproom of the Stone Horn') + 1;
    await walk.play(established.slice(2, inn));
    expect(walk.said()).toMatch(/Bleed on my floor and I'll charge you for the sand/);
    await walk.play([...established.slice(inn), ...churchyard]);
    console.log(walk.log.join('\n'));
    // Established, prepared, the job done and paid; the bed taken; the salter a friend; the vault opened by its
    // letters.
    expect(walk.holds('region__s1_u_paid', 'region__s1_u_rats_job')).toBe(true);
    expect(walk.holds('grateful', 'region__s1_merchant', 'party')).toBe(true);
    expect(walk.holds('knows', 'party', 'region__s1_u_vault_found')).toBe(true);
    expect(walk.fights).toBe(4);
    // At the vault's door by one way only: the keeper said grave before it is fought, the stair behind it shut to one
    // it has not let by, and no rite known.
    expect(walk.row('^Attack the keeper of the vault')?.aside).toMatch(/^Could be lost/);
    expect(walk.row('stair below the vault')).toBeUndefined();
    expect(walk.row('rite of the door')).toBeUndefined();
    await walk.play(['~Up to the undercroft']);
    expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_u_undercroft');
  }, 300000);
  it('fought at the first level, the vault\'s keeper kills', async () => {
    const walk = await Walk.begun();
    await walk.play([...established, ...churchyard]);
    expect(walk.level()).toBe(1);
    await walk.play(['~Attack the keeper of the vault', 'through']);
    expect(walk.s.end).toBe(true);
  }, 300000);
  it('gone all three ways with care, grows to the second level, the dead\'s book opens the way past the keeper, and what '
    + 'is brought up out of the workings sends the company down again, another way and deeper',
    async () => {
      const walk = await Walk.begun();
      await walk.play([...established, ...careful]);
      expect(walk.level()).toBe(2);
      expect(walk.holds('knows', 'party', 'region__s1_u_keeper_rite')).toBe(true);
      const coin = walk.s.purse?.coin ?? 0;
      await walk.play(["~Lay ten coin at the keeper's feet", '~Down to the stair below the vault']);
      // Under the town, not out on a hillside (OR-205).
      expect(walk.s.scene.lines.join(' ')).not.toMatch(/hillside/);
      await walk.play(['~way in']);
      expect(walk.s.purse?.coin).toBe(coin - 10);
      expect(walk.holds('able', 'region__s1_u_keeper')).toBe(true);
      expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_ud_adit_mouth');
      // Still under the town at the workings' own mouth (OR-205's remainder: "a timbered mouth opens in the hillside").
      expect(walk.s.scene.lines.join(' ')).not.toMatch(/hillside/);
      // The vault's aim ends once the keeper lets the company by.
      expect(walk.s.aims?.some(a => a.id === 'region__s1_u_vault_sought')).toBe(false);
      // OR-1396: the chief is now warned grave alone. Bring the first ore home and pay for the help it names.
      await walk.play(workings);
      expect(walk.fights).toBe(6);
      // Out again by the churchyard, and Holgar buys the star-iron; only then does he say where the rest of it went:
      // down the shaft, to the heart of the vein, the aim the town gives the company for having been down.
      // The crypt's bats may come down as the slab is shifted, by the hour (the opening's beats, OR-441, take a few
      // minutes more than they did): fought through where they do.
      const up = homeward.indexOf('~Up to the churchyard');
      await walk.play(homeward.slice(0, up));
      if (walk.s.moment === 'fight') { await walk.play(['through']); }
      await walk.play(homeward.slice(up, up + 1));
      // The town answers what the company did (sprint 3: a settlement that responds, the world remembering): the
      // graves the man with the black candle opened are dug again and turfed.
      expect(walk.said()).toMatch(/three graves by the wall have been dug again/);
      await walk.play(homeward.slice(homeward.indexOf('~Up to the churchyard') + 1));
      expect(walk.row('where the rest of the star-iron went')).toBeUndefined();
      await walk.play(['~Sell a lump of star-iron to Holgar']);
      expect(walk.holds('knows', 'party', 'region__s1_ud_story')).toBe(false);
      await walk.play(['~where the rest of the star-iron went']);
      expect(walk.holds('knows', 'party', 'region__s1_ud_story')).toBe(true);
      expect(walk.s.aims?.some(a => a.id === 'region__s1_ud_bring')).toBe(true);
      // The star-iron sold sits on Holgar's counter while he keeps it.
      await walk.play(['~To the landing at Porthalen', "~To Holgar's salt-house"]);
      expect(walk.said()).toMatch(/lump of star-iron sits at the end of Holgar's counter/);
      // And word that the company went through the floor of the undercroft is at the inn before it is, once.
      await walk.play(['~To the landing at Porthalen', '~^Into the Stone Horn']);
      expect(walk.said()).toMatch(/They're saying you've been under the undercroft/);
      await walk.play(['~whether (he|she|they) would come along', '~Ask Carlin to join the company',
        '~Tell Kynes the spiders in the old quarry are dead', '~Take a bed and supper']);
      expect(ScreenModel.build(walk.session.campaign).party).toHaveLength(2);
      // Down again another way, by the churchyard's stone door, past the keeper sitting, and further: the casket's
      // riddle, the seized wheel freed, the cage let down to the shaft bottom, below where the first went.
      const shaft = again.indexOf('~To the shaft head');
      await walk.play([...again.slice(0, shaft), '~To a worked-out stope$', '~Attack the goblin chief', 'through',
        '~Collect a lump of star-iron', '~To the old stope', ...again.slice(shaft)]);
      expect(walk.fights).toBe(7);
      expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_ud_haulage_shaft_bottom');
      // Home from below the first level, the inn's keeper, who said nobody goes below it, hears that the company has.
      await walk.play(['~Up to the shaft head|To the shaft head']);
      for (let leg = 0; leg < 12 && walk.row('Out to the churchyard'); leg++) {
        await walk.play(['~Out to the churchyard']);
        if (walk.s.moment === 'fight') { await walk.play(['through']); }
      }
      expect(walk.session.campaign.world.one('at', 'party')).toBe('region__s1_u_yard');
      await walk.play(['~landing at Porthalen', '~^Into the Stone Horn']);
      expect(walk.said()).toMatch(/Down the cage\?.* says Kynes/);
      expect(walk.holds('onTheHouse', 'region__s1_innkeeper', 'party')).toBe(true);
      // And with the spiders gone, the Hobb boy is let out to the quarry again.
      expect(walk.session.campaign.world.one('at', 'region__s1_u_hobb')).toBe('region__s1_u_pit');
    }, 300000);
});
