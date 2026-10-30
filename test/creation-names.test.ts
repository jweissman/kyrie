/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ProtagonistNames } from '../src/world/protagonist-names';
import { Outfitters } from '../src/world/outfitters';
import { ReaderOpening } from '../web/reader/reader-opening';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import type { Member, Request, Setting } from '../web/engine/protocol';
import folk from '../data/generation/scenes/folk.json';

// The page as ReaderOpening sees it: its state, changed as setState would, and an engine that keeps what it was asked.
class Page {
  readonly asked: Request[] = [];
  readonly props = { query: new URLSearchParams() };
  readonly engine = { request: (r: Request) => { this.asked.push(r); return Promise.resolve(undefined); } };
  constructor(public state: AppState) {}
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  static opening(names: Record<string, string[]>): { page: Page; opening: ReaderOpening } {
    const origins = [{ id: 'kin', title: 'Coming home', choice: 'Home.', background: 'herdsman' },
      { id: 'wanderer', title: 'Over the hills', choice: 'Over the hills.' }];
    const setting: Setting = { title: 'Thorn', pitch: { heading: '', text: '' }, generated: true, origins, names,
      party: [Creation.protagonist('human', 'thorn', names)] };
    const page = new Page({ phase: 'campaigns', catalog: Creation.catalog(), campaign: 'world', seed: 'thorn', party: [],
      editing: -1, view: 'here', cursor: 0, open: [], member: '', attention: { kind: 'place' }, talk: [], asked: [],
      stage: '', error: '', help: false, options: {} } as unknown as AppState);
    page.engine.request = (r: Request) => {
      page.asked.push(r);
      return Promise.resolve((r.kind === 'world' ? setting : undefined) as never);
    };
    return { page, opening: new ReaderOpening(page as unknown as ReaderApp) };
  }
}
const given = folk.given as Record<string, Record<string, string[]>>;

// A protagonist is named as their people name their own, drawn for the country (OWN-16: everyone had been Wenna, of
// whatever people), none a name someone of the country already has; "Another name" goes on to the next, a new people
// draws again while the name is not one the player wrote, and Set out never sets out nameless.
describe('a protagonist\'s name', () => {
  it('is drawn from their people\'s names, none a townsperson\'s, the same for the same country', async () => {
    const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, {});
    const names = ProtagonistNames.drawn(world.report.region, 'thorn'), taken = Outfitters.everyone(world.report.region);
    expect(Object.keys(names).sort()).toEqual(['dwarf', 'elf', 'human']);
    for (const [people, list] of Object.entries(names)) {
      const own = Object.values(given[people]!).flat();
      expect(list.length).toBeGreaterThan(10);
      expect(list.filter(n => !own.includes(n) || taken.has(n))).toEqual([]);
    }
    expect(ProtagonistNames.drawn(world.report.region, 'thorn')).toEqual(names);
    expect(Creation.protagonist('elf', 'thorn', names).name).toBe(names.elf![0]!);
    expect(Creation.protagonist('gnome', 'thorn', names).name).toBe(names.human![0]!);
  }, 60000);
  it('is drawn again for a new people until the player writes one, and goes on to another when asked', async () => {
    const names = { human: ['Hild', 'Ralf', 'Maud'], elf: ['Aelar', 'Birel'], dwarf: ['Hulda', 'Baern'] };
    const { page, opening } = Page.opening(names), name = () => page.state.party[0]!.name;
    await opening.pick('world', 'thorn');
    expect(name()).toBe('Hild');
    opening.edit(0, 'raceId', 'elf');
    expect(name()).toBe('Aelar');
    opening.rename();
    expect(name()).toBe('Birel');
    opening.rename();
    expect(name()).toBe('Aelar');
    opening.edit(0, 'raceId', 'dwarf');
    expect(name()).toBe('Hulda');
    opening.edit(0, 'name', 'Odo');
    opening.edit(0, 'raceId', 'human');
    expect(name()).toBe('Odo');
    // Emptied, it is no name written: a new people's is drawn again (one letter typed had kept an elf's name on a man).
    opening.edit(0, 'name', '');
    opening.edit(0, 'raceId', 'elf');
    expect(name()).toBe('Aelar');
    opening.edit(0, 'raceId', 'human');
    expect(name()).toBe('Hild');
    // Written away to nothing, it sets out as the first of the people's names here.
    opening.edit(0, 'name', ' {"} ');
    await opening.setOut();
    const begun = page.asked.find((r): r is Extract<Request, { kind: 'begin' }> => r.kind === 'begin');
    expect(begun?.party.map(m => m.name)).toEqual(['Hild']);
  });
});

// What creation no longer asks stands in the open until changed (OWN-14): a calling's first way the people may take,
// with the spells its card shows given as chosen; and for one who brings only their trade, the calling's own.
describe('a protagonist as it stands until changed', () => {
  it('takes a way and its spells in the open, and the way the player chooses with its own spells', async () => {
    const { page, opening } = Page.opening({ human: ['Hild'], elf: ['Aelar'], dwarf: ['Hulda'] });
    const me = (): Member => page.state.party[0]!, ways = page.state.catalog!.callings;
    await opening.pick('world', 'thorn');
    expect(me().traits).toEqual(['toughness']);
    expect(me().spells).toBeUndefined();
    opening.edit(0, 'classId', 'mage');
    expect([me().traits, me().spells]).toEqual([['abjurer'], ways.find(c => c.id === 'mage')!.specializations[0]!.picks]);
    opening.edit(0, 'specialization', 'necromancer');
    const necromancer = ways.find(c => c.id === 'mage')!.specializations.find(t => t.id === 'necromancer')!;
    expect(me().spells).toEqual(necromancer.picks!);
    // An elf is no necromancer: the way goes back to the first an elf may take.
    opening.edit(0, 'raceId', 'elf');
    expect([me().classId, me().traits]).toEqual(['mage', ['abjurer']]);
  });
  it('gives one who comes over the hills the calling\'s own trade, until they choose another', async () => {
    const { page, opening } = Page.opening({ human: ['Hild'], elf: ['Aelar'], dwarf: ['Hulda'] });
    const trade = () => page.state.party[0]!.backgroundId;
    await opening.pick('world', 'thorn');
    expect(trade()).toBe('herdsman');
    opening.origin('wanderer');
    expect(trade()).toBe('soldier');
    opening.edit(0, 'classId', 'mage');
    expect(trade()).toBe('apprentice');
    opening.edit(0, 'backgroundId', 'scribe');
    opening.edit(0, 'classId', 'bard');
    expect(trade()).toBe('scribe');
    opening.origin('kin');
    expect(trade()).toBe('herdsman');
  });
});
