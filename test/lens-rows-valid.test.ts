import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Attending } from '../src/ui/attention';
import { SceneModel } from '../src/ui/scene';
import type { Lens } from '../src/presentation/glance-types';
import { MenuModel } from '../src/frame/menu-model';
import { Act } from '../web/reader/stage/act';
import { GlanceStage } from '../web/reader/stage/glance';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';
import { PlaceStage } from '../web/reader/stage/place-stage';
import { MapMenu } from '../web/reader/map-menu';
import { TalkStage } from '../web/reader/stage/talk-stage';
import { Typography } from '../src/presentation/typography';

// A lens's rows can be chosen for what they say (the owner's playtest, 19 November, AT-04: an Explore menu of ten
// pages, its first row blank, which took the company back to the landing). Every row drawn, in every lens and among
// the four, along the drove road after every act: words, and either an act whose target is a choice of the scene's
// (data-act, data-choice) or one of the menu's own turns of attention (focus, a page, out of a focus); and the places
// lens at Porthalen's landing gathered by the town's quarters (AT-04's stopgap: ten pages, every way one row). And
// a row's words name what it does (the sprint audit, 19 November: some target was not enough, the complaint being a
// row that went to the landing without saying so): one that moves the company names where to, one that talks names
// whom, by the engine's own ids (exit:, travel:, go(); #talk, talk_to()), along the weir road too.
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  setState(patch: Partial<AppState>) { this.state = { ...this.state, ...patch }; }
  choose() { /* nothing is done from here */ }
  static of(j: Journey): Page {
    return new Page({ frame: Glanced.of(j.session).frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as
      AppState);
  }
  // Every container a walk draws (AT-04, AT-07 I3): the resting four and each opener among them opened in place;
  // each lens, and each row of it that gathers acts by focus, focused; the map's menu; a talk, where one is open.
  drawn(): Record<string, string> {
    const out: Record<string, string> = { here: this.html(GlanceStage.View, {}) };
    for (const c of this.menu.choices.filter(x => x.children?.length)) {
      this.setState({ open: [c.id] });
      out[`opened ${c.id}`] = this.html(PlaceStage.Opened, { choice: c });
    }
    this.setState({ open: [] });
    for (const [lens, part] of [['places', 'go'], ['things', 'look'], ['people', undefined], ['time', 'wait']] as const) {
      this.setState({ exploring: part, talking: part ? undefined : true, focused: [] });
      out[lens] = this.html(GlanceStage.Lens, { lens: lens as Lens });
      for (const key of [...out[lens].matchAll(/data-action="focus"[^>]*data-choice="([^"]+)"/g)].map(m => m[1]!)) {
        this.setState({ focused: [unescape(key)] });
        out[`${lens} focused ${key}`] = this.html(GlanceStage.Lens, { lens: lens as Lens });
      }
    }
    this.setState({ exploring: undefined, talking: undefined, focused: [] });
    out.map = this.html(MapMenu.View, { screen: this.state.frame!.screen, put: () => undefined });
    const talk = this.menu.talk;
    if (talk) { out.talk = this.html(TalkStage.View, { talk }); }
    return out;
  }
  private html(view: (p: never) => unknown, props: object): string {
    return renderToStaticMarkup(createElement(view as never, { app: this.app, draw: Act.draw(this.app), ...props }));
  }
  // The ids a row may name as its target: every choice of the scene, the lenses' acts and their commands.
  targets(): Set<string> {
    const g = this.state.frame!.leaf.glance!, screen = this.state.frame!.screen;
    const scene = Attending.place(SceneModel.build(screen));
    const lensed = Object.values(g.lenses).flatMap(l => [...l.promoted, ...l.rest,
      ...Object.values(l.leaves ?? {}).flat()]);
    return new Set([...Attending.all([...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far,
      ...scene.you, ...this.menu.choices]).flatMap(c => [c.id, c.command ?? '']), ...lensed.flatMap(a => [a.choice,
      a.command ?? '']), ...g.acts.flatMap(a => [a.choice, a.command ?? '']),
      // The journeys the engine knows from here, which the map's menu sets out on.
      ...[...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? []].map(d => `travel:${d.id}`)]
      .filter(Boolean));
  }
  // The names a row may call where it moves the company (the place, or the building a door enters: "Into the
  // brothers' house at Gatesend" for its guest-hall) or whom it talks with, as the screen has them; [] where the
  // screen has none; undefined where the row does neither.
  meant(act: string): string[] | undefined {
    const screen = this.state.frame!.screen;
    const place = /^(?:exit|travel):([^/]+)$/.exec(act)?.[1] ?? /^go\([^,]+,([^)]+)\)$/.exec(act)?.[1];
    const person = /^([^/#]+)#talk$/.exec(act)?.[1] ?? /^talk_to\(([^)]+)\)$/.exec(act)?.[1];
    if (place) {
      const exit = screen.exits.find(e => e.id === `exit:${place}` || e.destination.id === place);
      const known = [...screen.destinations ?? [], ...screen.around ?? [], ...screen.roads ?? [],
        ...screen.mapped ?? []].find(p => p.id === place);
      return [exit?.destination.name, exit?.scope, known?.name].filter((x): x is string => !!x);
    }
    return person === undefined ? undefined : screen.people.filter(p => p.id === person).map(p => p.name);
  }
  // The words common to three or more of the places the screen offers (the town's own name, "Gatesend"), which name
  // none of them in particular: a way to the landing called "Waterside at Porthalen" does not name the landing.
  common(): Set<string> {
    const screen = this.state.frame!.screen, n = new Map<string, number>();
    const names = new Set([...screen.exits.map(e => e.destination), ...screen.destinations ?? [],
      ...screen.around ?? [], ...screen.roads ?? []].map(p => p.name));
    for (const w of [...names].flatMap(x => [...new Set(sig(x))])) { n.set(w, (n.get(w) ?? 0) + 1); }
    return new Set([...n].filter(([, k]) => k >= 3).map(([w]) => w));
  }
}
// The words that name: "Taproom of the Stone Horn" is named by "Into the Stone Horn by the door", never by "To the
// customs-house"; a word of the name's own, not an article, a preposition or the like, and of the name itself, not
// of what is said of them after it ("Bran ap Ifor", not "…, held behind the customs-house grille"). One's own family
// may be named by what they are to you ("Talk to your cousin" for "Owain, your cousin": Attending.called, M17-93).
const slight = new Set(['the', 'and', 'for', 'into', 'out', 'from', 'with', 'your', 'about', 'behind', 'down']);
const sig = (s: string) => Typography.plain(s).toLowerCase().replace(/[’‘]/g, "'").split(/[^a-z\u00c0-\u024f'-]+/)
  .map(w => w.replace(/^'+|'+$/g, '')).filter(w => w.length > 2 && !slight.has(w));
function says(words: string, names: string[], common = new Set<string>()): boolean {
  const heard = new Set(sig(words));
  const of = (c: string) => sig(c).filter(w => !common.has(w)).length ? sig(c).filter(w => !common.has(w)) : sig(c);
  return names.some(name => {
    const [own, ...after] = name.split(', ');
    return [own!, ...after.filter(c => c.startsWith('your '))].some(c => !of(c).length || of(c).some(w => heard.has(w)));
  });
}
// The menu's own turns of attention: rows, no act (see test/small/page-controls).
// The map's own (putting it away, viewing a place on it, turning its page: OR-152) and the talk's (turning its page,
// trade, back from it).
const turns = new Set(['focus', 'defocus', 'lens-page', 'put-away-map', 'map-view', 'more-places', 'more-talk', 'trade',
  'trade-back']);
const unescape = (s: string) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
// A drawn container's rows: their words (and spaced, where a row's parts run together), the act or the menu's turn.
const rows = (html: string) => html.split('<button').slice(1).map(x => x.split('</button>')[0]!).map(b => ({
  words: b.replace(/^[^>]*>/, '').replace(/<[^>]+>/g, '').trim(),
  spaced: unescape(b.replace(/^[^>]*>/, '').replace(/<[^>]+>/g, ' ')),
  act: /data-act="([^"]*)"/.exec(b)?.[1], action: /data-action="([^"]*)"/.exec(b)?.[1],
  choice: /data-choice="([^"]*)"/.exec(b)?.[1] }));
function invalid(page: Page, at: string): string[] {
  const targets = page.targets(), out: string[] = [], common = page.common();
  for (const [lens, html] of Object.entries(page.drawn())) {
    for (const { words, spaced, act, action, choice } of rows(html)) {
      const named = !!act && (targets.has(unescape(act)) || targets.has(unescape(choice ?? '')));
      if (!words) { out.push(`${at} ${lens}: a row with no words (${act ?? action})`); }
      // Words that are an act, not a note: "By the door" had stood as a row's whole title (the owner, 19 November).
      if (/^(by|at|in|on|near|beside|under|with|from)\b/i.test(words)) {
        out.push(`${at} ${lens}: ${words} is no act`);
      }
      if (!named && !(action && turns.has(action))) { out.push(`${at} ${lens}: ${words} names no target (${act ?? action})`); }
      const meant = act ? page.meant(unescape(act)) : undefined;
      if (meant && !meant.length) { out.push(`${at} ${lens}: ${words} goes to or talks with one unnamed (${act})`); }
      if (meant?.length && !says(spaced, meant, common)) {
        out.push(`${at} ${lens}: ${words} does not name ${meant.join(' or ')} (${act})`);
      }
    }
  }
  return out;
}
// Each act done in turn by the engine's own id (a command) or its row's words, every container drawn after each.
async function walked(j: Journey, acts: string[]): Promise<string[]> {
  const bad = invalid(Page.of(j), 'the start');
  for (const act of acts) {
    await (/[:(]/.test(act) ? j.perform(act) : j.play(act));
    bad.push(...invalid(Page.of(j), act));
  }
  return bad;
}

describe('every row a lens draws has words and a target', () => {
  it('along the drove road, after every act, and the landing\'s ways gathered by quarter', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    const landing = Page.of(j);
    landing.setState({ exploring: 'go' });
    const places = renderToStaticMarkup(createElement(GlanceStage.Lens, { app: landing.app, draw: Act.draw(landing.app),
      lens: 'places' }));
    expect(Number(/data-pages="(\d+)"/.exec(places)?.[1] ?? 1)).toBeLessThanOrEqual(3);
    // The paged lens's first row, the cursor on it, where AT-04's was blank: words, a way, and its place named. Its own
    // first, after what the scene led with that it keeps above it (Lensed.kept: Bran's tally-stick, the aim's step).
    const own = places.slice(places.indexOf('lens-rest'));
    const first = rows(own)[0]!, meant = landing.meant(unescape(first.act ?? ''));
    expect(first.words).not.toBe('');
    expect(meant?.length).toBeGreaterThan(0);
    expect(says(first.spaced, meant!, landing.common())).toBe(true);
    expect(await walked(j, ['Read the notice on the well-post', 'Ask Owain how many head came down',
      'To the drove pens', 'To the Black Rhyne', 'Search', 'travel:drove__customs',
      'Tell Mardle where the four bullocks are'])).toEqual([]);
  }, 180000);
  // The weir life (cold play 5's elf mage, the alternate character): Gatesend, the lease, the gate and its well, and
  // back to the green to the people there, by cold play 5's own first acts.
  it('along the weir road, after every act', async () => {
    const j = Journey.of(await DrawnWorld.start('iscoed', { origin: 'weir',
      party: [{ name: 'Ilse', raceId: 'elf', classId: 'mage' }] }, NodeBundleSource.shared));
    expect(await walked(j, ['region__s4_u_notice_read(party,region__s4_green)', 'read_item(origin__lease_scroll)',
      'go(gate__bank_path,gate__bank)', 'go(gate__gate_door,gate__gatehouse)', 'search(gate__gatehouse)',
      'travel:region__s4_green', 'talk_to(region__s4_r4)'])).toEqual([]);
  }, 180000);
});
