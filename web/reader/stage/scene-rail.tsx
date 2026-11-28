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
import type { Attested } from '../../../src/presentation/attest';
import { Fold, type Leaf } from '../../../src/presentation/fold';
import { LensRows } from './lens-rows';
import { Look } from '../look';
import { WorldStage } from './world-stage';
import { PageFrame } from '../page-frame';
import { Folded } from './folded-rail';
import { Surfaces } from '../../../src/presentation/surfaces';

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
  static View({ app }: { app: ReaderApp; draw?: Draw }) {
    const search = Pastime.search(app), wait = Pastime.wait(app);
    // At rest the lenses fold into one emblem where the engine says so (Glance.rail, OR-1084): taken up, they stand
    // beside it; the map and the book beside it either way. Folded, the strip cannot be pressed: the diamond alone is.
    // Only the lenses earned stand in it (Surfaces, OR-1241): with none, neither they nor their diamond.
    const rail = app.state.frame?.leaf.glance?.rail, any = !rail || rail.lenses.length > 0;
    // No rail until something on it is earned by a find (the owner's playtest of 27 November, OR-1491): a map, the
    // journal, a lens. But the company's own page is kept within reach, tucked at the rail's place (the engine's
    // Rail.keep, OR-1685), as well as a row of the place's one menu (PlaceQuestion.yourself).
    if (!any && !SceneRail.earned(app)) {
      return rail?.keep ? <nav {...PageFrame.slot('rail')} className="scene-rail kept" aria-label={rail.keep.label}>
        <SceneRail.Keep app={app} /></nav> : null;
    }
    const folded = !!rail && any, open = folded && Folded.open(app);
    const lenses = <>
        {Surfaces.lens(rail, 'talk') && <SceneRail.Talk app={app} />}
        {Surfaces.lens(rail, 'go') && <SceneRail.Mark app={app} part="go" glyph="go_on" words="Go"
          standing={SceneRail.go(app)} />}
        {Surfaces.lens(rail, 'look') && <SceneRail.Mark app={app} part="look" glyph="look_about" words="Look"
          standing={SceneRail.look(app)} />}
        {/* Each in its own place whether it can be done or not, shut and saying why when not: the rail's marks had moved
            under the finger as the Search came and went, and a touch for the Eye opened Go (round 7, both players). */}
        {Surfaces.lens(rail, 'wait') && <SceneRail.Mark app={app} part="wait" glyph="wait" words="Wait"
          standing={wait ? {} : { shut: 'nothing to wait for here' }} />}
        {/* An attention, never a second place to commit: the glass turns the scene to what can be searched and looked at (the
            Look lens, where the search leads); "Search here" is done by the one foreground, never from the rail (the
            owner, 15 November: every act through one of the four). */}
        {Surfaces.lens(rail, 'search') && <button type="button" className="rail-mark by-glyph"
          {...search ? { 'data-action': 'explore' } : {}}
          disabled={!search} aria-label={search ? 'Search: look closely' : 'Search: nothing here to search'}
          onClick={() => app.explore('look')}><Glyphs.View id="search" className="rail-glyph" /></button>}
    </>;
    return (
      <nav {...PageFrame.slot('rail')} className={`scene-rail${open ? ' unfolded' : ''}`}
        {...folded ? { 'data-fold': 'folded' } : {}} aria-label="Go, look, wait, search, the map and your book">
        {folded ? <><div className="lenses-fold" id="lenses-fold" role="group" aria-label="The lenses">{lenses}</div>
          <Folded.Mark app={app} open={open} /></> : any && lenses}
        {any && SceneRail.earned(app) && <span className="rail-gap" aria-hidden="true" />}
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
  // Each only once earned (OR-1491): the map by a map of the land carried, the book by the journal (its notes); with
  // neither, no rail (the company's page is the menu's row, and its key).
  static Books({ app, alone, onMap }: { app: ReaderApp; alone?: boolean; onMap?: boolean }) {
    if (!onMap && !SceneRail.earned(app)) { return null; }
    const marks = <>
      <SceneRail.MapMark app={app} onMap={onMap} />
      {Surfaces.has(app.state.frame?.screen, 'the_journal') ? <button type="button" className="rail-mark"
        data-action="book" aria-label="Your book" onClick={() => app.show(SceneRail.book(app))}>
        <Glyphs.View id="the_book" className="rail-glyph" /><News.Pip app={app} /></button> : <SceneRail.Keep app={app} />}
    </>;
    return alone ? <nav {...PageFrame.slot('rail')} className={`scene-rail${onMap ? ' on-map' : ''}`} aria-label="The map and your book">{marks}</nav>
      : marks;
  }
  // The company's own page, kept within reach whatever is earned (Rail.keep, OR-1685: "minimally we may always want
  // the book available, even if tucked away"): a quiet mark, faint until the hand or the keys come to it, which opens
  // the page the engine names, in its words. Where the journal is earned the book's own mark stands in its place.
  static Keep({ app }: { app: ReaderApp }) {
    const keep = app.state.frame?.leaf.glance?.rail?.keep;
    return keep ? <button type="button" className="rail-mark keep-mark" data-action="keep" data-view={keep.view}
      aria-label={keep.label} onClick={() => app.show(keep.view)}>
      <Glyphs.View id="the_book" className="rail-glyph" /></button> : null;
  }
  // The map's one mark, as it stands: on the map, pressed, back to where the company is; inside an enclosed place, the
  // compass (the places lens, the way out at its foot); else the map, lit where a journey is the aim's next step.
  static MapMark({ app, onMap }: { app: ReaderApp; onMap?: boolean }) {
    // Neither the map nor the compass before it is earned (Surfaces, OR-1242): the compass is the places lens.
    const screen = app.state.frame?.screen;
    if (!onMap && !(CompassStage.of(app) ? Surfaces.has(screen, 'lens_go') : Surfaces.has(screen, 'the_map'))) {
      return null;
    }
    const local = onMap ? SceneRail.local(app) : undefined, lit = onMap ? undefined : SceneRail.map(app);
    const compass = !onMap && !!CompassStage.of(app), going = app.state.exploring === 'go';
    // Shut as Go… is where no way on from here is open (in the dark of the adit's fall, OR-211: the places lens had come
    // up with nothing in it to press).
    const shut = compass && SceneRail.noWayOn(app);
    const mark = onMap ? { className: 'rail-mark pressed', 'data-action': 'back-to-place', 'aria-pressed': true,
      'aria-label': 'The map: back to where you are', 'data-tone': local?.tone, glyph: 'the_map',
      go: () => app.outdoor(false) }
      : compass ? { className: `rail-mark opens-compass${lit ? ' lit' : ''}`, 'data-action': 'compass', 'data-key': 'm',
        'aria-label': shut ? 'The compass: no way on from here' : 'The compass: the way out, and the ways in here',
        'aria-pressed': going, glyph: 'the_compass', disabled: shut,
        go: () => { if (!shut) { Explorer.open(app, going ? undefined : 'go'); } } }
      : { className: `rail-mark${lit ? ' lit' : ''}`, 'data-action': 'mode', 'data-view': 'map', 'data-key': 'm',
        'aria-label': 'The map', glyph: 'the_map', go: () => app.show('map') };
    const { glyph, go, ...attrs } = mark;
    return <button type="button" data-control="map-mark" {...attrs} onClick={go}><Glyphs.View id={glyph} className="rail-glyph" />
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
  // Whether anything of the map's or the book's is earned: the map (or, inside, the compass, which is the places
  // lens), or the journal.
  static earned(app: ReaderApp): boolean {
    const screen = app.state.frame?.screen;
    return Surfaces.has(screen, 'the_journal')
      || (CompassStage.of(app) ? Surfaces.has(screen, 'lens_go') : Surfaces.has(screen, 'the_map'));
  }
  // The book's page it opens at: the notes where the journal is earned, else the company, its one page (OR-1244).
  static book(app: ReaderApp): 'journal' | 'company' {
    return Surfaces.has(app.state.frame?.screen, 'the_journal') ? 'journal' : 'company';
  }
  // No way on from here that can be taken: none, or every one refused (the gallery from the adit's fall, unlit).
  static noWayOn(app: ReaderApp): boolean { return Wayfinder.ways(app).every(w => w.c.disabled); }
  // Go: shut with no way from here; lit for the aim's way (where the way is shown) or a way the place leads with; dim where
  // every way goes somewhere left with nothing done and nothing new since.
  static go(app: ReaderApp): Standing {
    const ways = Wayfinder.ways(app), idle = new Set(app.state.frame?.leaf.glance?.idle ?? []);
    if (!ways.length) { return { shut: 'no way on from here' }; }
    // Lit by what the rows it opens bear, as the places lens draws them (LensRows), the first of them by the one
    // precedence: never by a way the lens does not draw (the owner, 18 November: Go… gold, and neither of its two
    // rows, "to the fellside" and "Open the world map", gold; it had been lit from the page's own list of ways).
    const lit = Fold.mark(SceneRail.opened(app, 'places', ways.flatMap(w => Wayfinder.bears(app, w).leaves)),
      Guidance.shown(app));
    if (lit) { return { lit }; }
    return ways.every(w => idle.has(Wayfinder.to(w))) ? { dim: true } : {};
  }
  // Look: shut with nothing at hand to do anything with; lit by what the glance leads with that is at hand (its tone);
  // dim where the place itself has nothing new (left twice, nothing done, nothing since).
  static look(app: ReaderApp): Standing {
    const hand = AtHand.of(app), glance = app.state.frame?.leaf.glance;
    if (!hand.some(h => h.choices.some(c => !c.disabled))) { return { shut: 'nothing here to look at more closely' }; }
    const lit = Fold.mark(SceneRail.opened(app, 'things', hand.flatMap(h => AtHand.leaves(app, h))), Guidance.shown(app));
    if (lit) { return { lit }; }
    return glance?.idle?.includes(app.state.frame!.screen.place.id) ? { dim: true } : {};
  }
  // The leaves of the rows a touch opens, which its mark is the fold of (Fold): the lens's, where the scene draws it as
  // the engine's lens (LensRows); else, in the attend look, each way's or thing's row (without).
  private static opened(app: ReaderApp, lens: 'places' | 'things', without: Leaf[]): Leaf[] {
    return SceneRail.lensed(app, lens) ? LensRows.marks(app, lens, GlanceStage.choice) : without;
  }
  // Whether a touch opens the engine's lens (else the panel's own list): the strip's tiles over it are marked from it.
  static lensed(app: ReaderApp, lens: 'places' | 'things'): boolean {
    return !!app.state.frame?.leaf.glance?.lenses?.[lens] && !Look.is('attend');
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
  static local(app: ReaderApp): Attested | undefined {
    return Fold.mark(app.state.frame?.menu.marks.local ?? [], Guidance.shown(app));
  }
  // The map's mark: the aim's gold where a journey across the country is its next step (that journey its one leaf).
  static map(app: ReaderApp): Attested | undefined {
    const mark = Fold.mark(app.state.frame?.menu.marks.map ?? [], Guidance.shown(app));
    return mark?.tone === 'gold' ? mark : undefined;
  }
  static mapLit(app: ReaderApp): boolean { return !!SceneRail.map(app); }
}
