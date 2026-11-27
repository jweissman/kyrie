import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Earned, ModuleWriter, type Surface } from '../../src/lang/index';
import { TerminalMenus } from '../../src/cli/terminal-menus';
import { EngineHost } from '../../web/engine/engine-host';
import { Act } from '../../web/reader/stage/act';
import { ReaderApp } from '../../web/reader/reader-app';
import { Oracle, type OracleReport } from '../../src/presentation/oracle';
import type { Frame } from '../../src/creation/protocol';
import type { PlaySession } from '../../src/session/play-session';
import { CreatureFacts } from '../../src/campaign/creature-facts';
import { CreatureStore } from '../../src/creature-store';
import type { CampaignActor } from '../../src/campaign/definition';

// Surfaces are earned (compactification, the owner, 26 November; OR-1240), and by a find, never a level (the owner's
// playtest of 27 November, OR-1491): the engine writes earned(company, surface) for the player's company, and only
// asserts it. The map once one of the company carries a map of the land; the encyclopedia once it has stood in a
// library; the journal once one of it has done the work of learning (a scribe); no lens, which no find grants yet.
// The screen says what is earned (Screen.surfaces), and a save from before earning was said is brought up to date,
// not refused.
const rooms = 'Place yard "the yard" is room at 0, 0 outdoors. Place books "the reading room" is room at 1, 0. '
  + 'Passage door "the door" is door between yard and books. Initially Assert library(books). '
  + 'Company party "You" of 1 at yard.';
const earned = (t: Tiny) => t.world.related('earned', 'party').map(r => r.args[1]).sort();
describe('surfaces earned', () => {
  it('holds back every surface from a first-level company of no learning', async () => {
    const t = await Tiny.start(rooms, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 1,
      backgroundId: 'soldier' }] });
    expect(earned(t)).toEqual([]);
    expect(t.screen.surfaces).toEqual([]);
  });
  it('earns nothing by a level: no lens and no map at the fourth', async () => {
    const t = await Tiny.start(rooms, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 4,
      backgroundId: 'soldier' }] });
    expect(t.screen.surfaces).toEqual([]);
  });
  it('earns the map once a map of the land is carried, and keeps it', async () => {
    const t = await Tiny.start(`${rooms} Item atlas "a map of the district" is map at yard.`, { party: [{ name: 'Wenna',
      raceId: 'human', classId: 'warrior', level: 1, backgroundId: 'soldier' }] });
    expect(t.screen.surfaces).toEqual([]);
    const take = t.campaign.offered().find(o => /atlas/.test(o.id) && /take|pick/i.test(o.schema ?? o.id))!;
    await t.perform(take.id);
    expect(t.screen.surfaces).toEqual(['the_map']);
  });
  it('earns the journal with a scribe among the company', async () => {
    const t = await Tiny.start(rooms, { party: [{ name: 'Odo', raceId: 'human', classId: 'mage', level: 1,
      backgroundId: 'scribe' }] });
    expect(t.screen.surfaces).toEqual(['the_journal']);
  });
  it('earns the encyclopedia in a library, and keeps it on leaving', async () => {
    const t = await Tiny.start(rooms, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 1,
      backgroundId: 'soldier' }] });
    await t.perform(t.screen.exits.find(e => e.destination.id === 't__books')!.acts[0]!.command!);
    expect(t.where()).toBe('t__books');
    expect(t.screen.surfaces).toEqual(['the_encyclopedia']);
    await t.perform(t.screen.exits.find(e => e.destination.id === 't__yard')!.acts[0]!.command!);
    expect(t.screen.surfaces).toEqual(['the_encyclopedia']);
  });
  it('reads a save that never said what was earned as stale, and refuses nothing', async () => {
    const t = await Tiny.start(rooms, { party: [{ name: 'Odo', raceId: 'human', classId: 'mage', level: 1,
      backgroundId: 'scribe' }] });
    const save = t.campaign.save(), before = t.world.apply(t.world.related('earned')
      .map(call => ({ kind: 'retract' as const, call: ModuleWriter.call(call.name, ...call.args) })));
    const actors = save.definition!.actors as CampaignActor[];
    const store = new CreatureStore(t.campaign.catalog, save.creatures);
    expect(CreatureFacts.saved(before, actors, store)).toBe('stale');
    expect(CreatureFacts.saved(t.world, actors, store)).toBe('same');
  });
  it('shows every surface in a world that keeps no earning', () => {
    expect(Earned.has(undefined, 'the_map')).toBe(true);
    expect(Earned.has([], 'lens_look')).toBe(false);
  });
});
// Every client alike: the terminal's keys for a lens and the map only once each is earned.
describe('the terminal\'s keys, by what is earned', () => {
  it('offers no lens and no map before they are earned, and the lenses once they are', () => {
    const keys = (surfaces?: Surface[]) => Object.keys(TerminalMenus.scene({ first: [], all: [],
      ...surfaces ? { surfaces } : {} }).keys ?? {}).sort().join('');
    expect(keys([])).toBe('acos');
    expect(keys([...Earned.lenses])).toBe('acglostw');
    expect(keys()).toBe('acglmostw');
  });
});
// The oracle's reach (OR-1245: "or accessible through oracle"): the report says what is earned and how to earn the
// rest; the engine's earn earns every surface at once, the stage a spec of an earned surface plays on.
describe('every surface, earned at once', () => {
  it('is the oracle\'s, by the engine\'s earn', async () => {
    const t = await Tiny.start(rooms, { party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', level: 1,
      backgroundId: 'soldier' }] });
    const host = new EngineHost(() => undefined);
    (host as unknown as { session: PlaySession }).session = t.session;
    const frame = await host.handle({ kind: 'earn' }) as Frame;
    expect(frame.screen.surfaces).toEqual([...Earned.surfaces]);
    expect(frame.leaf.glance?.rail?.lenses).toEqual(['talk', 'go', 'look', 'wait', 'search']);
    expect(Oracle.text(await host.handle({ kind: 'about' }) as OracleReport))
      .toContain(`earned ${Earned.surfaces.join(', ')} · ?earned earns every one`);
    expect(Oracle.text({ build: { commit: 'c', stamp: 's' }, save: { checkpoint: 1, kept: 2 }, surfaces: [] }))
      .toContain('earned (nothing yet)');
  });
});
// One backstage page (OR-1244): the Book's pages are the company's and its pack's until the journal is earned; the
// notes and the story so far with it; and the map no view at all before it is earned (OR-1242).
describe('the Book, by what is earned', () => {
  const app = (surfaces?: Surface[]) => ({ state: { frame: { screen: surfaces ? { surfaces } : {} } } }) as never;
  it('is your character alone until the journal, and its notes and story with it', () => {
    expect(Act.pages(app([]))).toEqual(['company']);
    expect(Act.pages(app(['the_journal']))).toEqual(['company', 'journal', 'story']);
    expect(ReaderApp.earned('journal', { surfaces: [] } as never)).toBe('company');
    expect(ReaderApp.earned('map', { surfaces: [] } as never)).toBeUndefined();
    expect(ReaderApp.earned('map', { surfaces: ['the_map'] } as never)).toBe('map');
  });
});
