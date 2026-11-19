import { News } from '../news';
import type { ReaderApp } from '../reader-app';
import type { Draw } from './act';
import { CompassStage } from './compass-stage';
import { Explorer } from './explorer';
import { Glyphs } from '../creation/glyphs';
import { Wayfinder } from './wayfinder';
import { AtHand } from './at-hand';
import { Pastime } from './pastime';
import { GlanceStage } from './glance';
import { Guidance } from '../guidance';
import { Signs } from '../../../src/presentation/signs';
import { Pip } from './pip';
import { Attest, type Attested, type Witness } from '../../../src/presentation/attest';
import { LensRows } from './lens-rows';
import { Look } from '../look';
import { WorldStage } from './world-stage';
import { PageFrame } from '../page-frame';

// How a touch on the rail stands now (amendment 6, the owner's notes of 11 November): lit, by the tone of what it has
// that is new or the aim's; ordinary, with something in it still useful; dim, with nothing new for now (it can still
// be opened, and is lit again when the world changes); or shut, with nothing in it to do, and says why.
// lit: an indicator, made only of the witnesses of the rows the control opens (Attest), never a colour of its own.
type Standing = { lit?: Attested } | { dim: true } | { shut: string } | Record<string, never>;

// The scene's few touches, apart from what is told and what is led with: a small rail of marks at the foot of the
// screen's right side, well inside its edges (the owner: "a tiny rail of icons at the hard bottom right", nothing of
// a web page's bar). Go, Look, Wait and Search open in the scene's own panel (see Explorer); the map and the book are
// their own. Each says in words what it is, to a pointer and to a reader of the page.
export class SceneRail {
  // Whether the scene is drawn first, the rail its touches (?scene=split keeps the bounded stage, and its rows).
  static on(app: ReaderApp): boolean { return app.props?.query?.get('scene') !== 'split'; }
  static View({ app }: { app: ReaderApp; draw?: Draw }) {
    const search = Pastime.search(app), wait = Pastime.wait(app);
    return (
      <nav {...PageFrame.slot('rail')} className="scene-rail" aria-label="Go, look, wait, search, the map and your book">
        <SceneRail.Talk app={app} />
        <SceneRail.Mark app={app} part="go" glyph="go_on" words="Go" standing={SceneRail.go(app)} />
        <SceneRail.Mark app={app} part="look" glyph="look_about" words="Look" standing={SceneRail.look(app)} />
        {/* Each in its own place whether it can be done or not, shut and saying why when not: the rail's marks had moved
            under the finger as the Search came and went, and a touch for the Eye opened Go (round 7, both players). */}
        <SceneRail.Mark app={app} part="wait" glyph="wait" words="Wait"
          standing={wait ? {} : { shut: 'nothing to wait for here' }} />
        {/* An attention, never a second place to commit: the glass turns the scene to what can be searched and looked at (the
            Look lens, where the search leads); "Search here" is done by the one foreground, never from the rail (the
            owner, 15 November: every act through one of the four). */}
        <button type="button" className="rail-mark by-glyph" {...search ? { 'data-action': 'explore' } : {}}
          disabled={!search} aria-label={search ? 'Search: look closely' : 'Search: nothing here to search'}
          onClick={() => app.explore('look')}><Glyphs.View id="search" className="rail-glyph" /></button>
        <span className="rail-gap" aria-hidden="true" />
        <SceneRail.Books app={app} />
      </nav>
    );
  }
  // Whether who is here is shown: the talk lens on, or someone here who means the company harm (a foe is never put
  // away), and neither Go nor Look open over it.
  static talking(app: ReaderApp): boolean {
    return (!!app.state.talking || WorldStage.present(app).some(x => x.danger && !x.state)) && !app.state.exploring;
  }
  // The talk lens: who is here, the company with them, their likenesses shown or put away; its pip, the tone of the
  // first of those not of the company the place has something with (see WorldStage.seen).
  static Talk({ app }: { app: ReaderApp }) {
    const on = SceneRail.talking(app), people = WorldStage.present(app);
    if (!people.length) { return null; }
    const said = on ? 'Talk: put away who is here' : 'Talk: who is here';
    // No pip on the People mark (CN-07, the owner, 14 November: "Simply having a person nearby need not receive a
    // semantic opportunity color"): what someone here is to the company is the one pip by their own likeness, from
    // the glance's aspects; the mark that shows them is a neutral icon.
    return <button type="button" className={`rail-mark opens-talk${on ? ' pressed' : ''}`}
      data-action="lens" data-part="talk" aria-pressed={on} aria-label={said}
      onClick={() => app.setState({ talking: !on, exploring: undefined })}>
      {/* Anyone here, a hooded head: not the companion's icon, which promises someone who would join (the owner,
          17 November, FM-05: a companion's icon on the mark whose lens then showed no one who would). */}
      <Glyphs.View id="someone" className="rail-glyph" />
    </button>;
  }
  // Inside an enclosed place the map gives way to the compass (CN-02, CN-03): its mark turns the places lens on, the
  // way out and the way on at its foot (see CompassStage), and nothing across the country is offered from in here.
  // The map and the book, where they stand on every page of the scene: in talk, and over a thing looked at, as at
  // rest (the owner, 11 November: no bar of them across the top of the page).
  // On the map, its mark is pressed, and touched goes back to where the company is (the owner, 11 November: the map
  // had its own bar of Map and Book across its top).
  static Books({ app, alone, onMap }: { app: ReaderApp; alone?: boolean; onMap?: boolean }) {
    const marks = <>
      <SceneRail.MapMark app={app} onMap={onMap} />
      <button type="button" className="rail-mark" data-action="book" aria-label="Your book"
        onClick={() => app.show('journal')}><Glyphs.View id="the_book" className="rail-glyph" /><News.Pip app={app} />
      </button>
    </>;
    return alone ? <nav {...PageFrame.slot('rail')} className={`scene-rail${onMap ? ' on-map' : ''}`} aria-label="The map and your book">{marks}</nav>
      : marks;
  }
  // The map's one mark, as it stands: on the map, pressed, back to where the company is; inside an enclosed place, the
  // compass (the places lens, the way out at its foot); else the map, lit where a journey is the aim's next step.
  static MapMark({ app, onMap }: { app: ReaderApp; onMap?: boolean }) {
    const local = onMap ? SceneRail.local(app) : undefined, lit = onMap ? undefined : SceneRail.map(app);
    const compass = !onMap && !!CompassStage.of(app), going = app.state.exploring === 'go';
    const mark = onMap ? { className: 'rail-mark pressed', 'data-action': 'back-to-place', 'aria-pressed': true,
      'aria-label': 'The map: back to where you are', 'data-tone': local?.tone, glyph: 'the_map',
      go: () => app.outdoor(false) }
      : compass ? { className: `rail-mark opens-compass${lit ? ' lit' : ''}`, 'data-action': 'compass', 'data-key': 'm',
        'aria-label': 'The compass: the way out, and the ways in here', 'aria-pressed': going, glyph: 'the_compass',
        go: () => Explorer.open(app, going ? undefined : 'go') }
      : { className: `rail-mark${lit ? ' lit' : ''}`, 'data-action': 'mode', 'data-view': 'map', 'data-key': 'm',
        'aria-label': 'The map', glyph: 'the_map', go: () => app.show('map') };
    const { glyph, go, ...attrs } = mark;
    return <button type="button" {...attrs} onClick={go}><Glyphs.View id={glyph} className="rail-glyph" />
      {onMap ? <Pip.View mark={local} label={`Where you are: ${local?.words ?? ''}`} /> : <Pip.View mark={lit} />}</button>;
  }
  // Its pip (see Pip): lit, of the tone of what the rows it opens bear (see SceneRail.go), and a companion's icon
  // where one of them is someone who might join; none with nothing; and the whole mark lowered (dim) with nothing new.
  // Never what its rows are not (the owner, 17 November: a companion on Go… and on none of the rows under it).
  static Mark({ app, part, glyph, words, standing }: { app: ReaderApp; part: 'go' | 'look' | 'wait';
    glyph: string; words: string; standing: Standing }) {
    const shut = 'shut' in standing ? standing.shut : undefined, lit = 'lit' in standing ? standing.lit : undefined;
    const companion = !!lit?.companion;
    const said = shut ? `${words}: ${shut}` : 'dim' in standing ? `${words}: ${Signs.idle} for now`
      : companion ? `${words}: ${Signs.sensed('companionship')}` : words;
    return <button type="button" className={`rail-mark opens-${part}${lit ? ' lit' : ''}`
      + `${'dim' in standing ? ' dim' : ''}`} data-action="explore" data-part={part} aria-haspopup="dialog"
        data-condition={Pip.condition({ idle: 'dim' in standing })} data-tone={lit?.tone} data-companion={companion || undefined}
      aria-expanded={app.state.exploring === part} aria-label={said} disabled={!!shut}
      onClick={() => Explorer.open(app, app.state.exploring === part ? undefined : part)}>
      <Glyphs.View id={glyph} className="rail-glyph" />
      {!shut && <Pip.View mark={lit} />}
    </button>;
  }
  // Go: shut with no way from here; lit for the aim's way (where the way is shown) or a way the place leads with; dim where
  // every way goes somewhere left with nothing done and nothing new since.
  static go(app: ReaderApp): Standing {
    const ways = Wayfinder.ways(app), idle = new Set(app.state.frame?.leaf.glance?.idle ?? []);
    if (!ways.length) { return { shut: 'no way on from here' }; }
    // Lit by what the rows it opens bear, as the places lens draws them (LensRows), the first of them by the one
    // precedence: never by a way the lens does not draw (the owner, 18 November: Go… gold, and neither of its two
    // rows, "to the fellside" and "Open the world map", gold; it had been lit from the page's own list of ways).
    const lit = Attest.of(SceneRail.opened(app, 'places', Wayfinder.ways(app).flatMap(w => Wayfinder.bears(app, w)
      .witnesses)), Guidance.shown(app));
    if (lit) { return { lit }; }
    return ways.every(w => idle.has(Wayfinder.to(w))) ? { dim: true } : {};
  }
  // Whether the aim's way is among them: the aim's next step, where it is known and is a way; where none is known, a
  // way the aim followed goes by. Never Go… in gold while the next step is here (round 10: Go… gold into the keep
  // while the search at its door was the step).
  static goes(app: ReaderApp, ways: ReturnType<typeof Wayfinder.ways>): boolean {
    const next = GlanceStage.next(app);
    return next ? ways.some(w => w.c.id === next || w.way.id === next) : !!Wayfinder.aimed(ways);
  }
  // Look: shut with nothing at hand to do anything with; lit by what the glance leads with that is at hand (its tone);
  // dim where the place itself has nothing new (left twice, nothing done, nothing since).
  static look(app: ReaderApp): Standing {
    const hand = AtHand.of(app), glance = app.state.frame?.leaf.glance;
    if (!hand.some(h => h.choices.some(c => !c.disabled))) { return { shut: 'nothing here to look at more closely' }; }
    const lit = Attest.of(SceneRail.opened(app, 'things', hand.flatMap(h => AtHand.bears(app, h))), Guidance.shown(app));
    if (lit) { return { lit }; }
    return glance?.idle?.includes(app.state.frame!.screen.place.id) ? { dim: true } : {};
  }
  // The witnesses of the rows a touch opens: the lens's, where the scene draws it as the engine's lens (LensRows);
  // else the panel's own (without, where Go… opens the Wayfinder's list).
  private static opened(app: ReaderApp, lens: 'places' | 'things', without: Witness[]): Witness[] {
    return SceneRail.lensed(app, lens) ? LensRows.marks(app, lens, GlanceStage.choice) : without;
  }
  // Whether a touch opens the engine's lens (else the panel's own list): the strip's tiles over it are marked from it.
  static lensed(app: ReaderApp, lens: 'places' | 'things'): boolean {
    return !!app.state.frame?.leaf.glance?.lenses?.[lens] && SceneRail.on(app) && !Look.is('attend');
  }
  // Whether one of the ways Go… opens bears someone who might join (see Wayfinder.bears).
  static joins(app: ReaderApp): boolean {
    const go = SceneRail.go(app);
    return 'lit' in go && !!go.lit?.companion;
  }
  // The map, where a journey there is the aim's next step, and the way is shown.
  // Back from the map, the scene it returns to: its pip the tone of what that scene leads with here (its four, less
  // the journeys the map itself is for), never inferred apart from it (the owner's trust contracts, 18 November, C:
  // "Put away the map" had been blank beside a place with something to do).
  static local(app: ReaderApp): Attested | undefined { return Attest.local(app.state.frame?.leaf?.glance, Guidance.shown(app)); }
  // The map's mark: the aim's gold where a journey across the country is its next step (that act its witness).
  static map(app: ReaderApp): Attested | undefined {
    const g = app.state.frame?.leaf.glance, around = app.state.frame?.screen.around ?? [];
    const next = g?.acts.find(a => a.continues && a.choice.startsWith('travel:') && !around.some(d => `travel:${d.id}` === a.choice));
    const mark = Attest.of([Attest.witness(g, next?.choice)], Guidance.shown(app));
    return mark?.tone === 'gold' ? mark : undefined;
  }
  static mapLit(app: ReaderApp): boolean { return !!SceneRail.map(app); }
}
