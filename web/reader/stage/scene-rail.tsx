import type { ReaderApp } from '../reader-app';
import { Act, type Draw } from './act';
import { Explorer } from './explorer';
import { Glyphs } from '../creation/glyphs';
import { Wayfinder } from './wayfinder';
import { AtHand } from './at-hand';
import { Pastime } from './pastime';
import { GlanceStage } from './glance';
import { Guidance } from '../guidance';
import { Emphasis, type Tone } from '../emphasis';

// How a touch on the rail stands now (amendment 6, the owner's notes of 11 November): lit, by the tone of what it has
// that is new or the aim's; ordinary, with something in it still useful; dim, with nothing new for now (it can still
// be opened, and is lit again when the world changes); or shut, with nothing in it to do, and says why.
type Standing = { lit?: Tone } | { dim: true } | { shut: string } | Record<string, never>;

// The scene's few touches, apart from what is told and what is led with: a small rail of marks at the foot of the
// screen's right side, well inside its edges (the owner: "a tiny rail of icons at the hard bottom right", nothing of
// a web page's bar). Go, Look, Wait and Search open in the scene's own panel (see Explorer); the map and the book are
// their own. Each says in words what it is, to a pointer and to a reader of the page.
export class SceneRail {
  // Whether the scene is drawn first, the rail its touches (?scene=split keeps the bounded stage, and its rows).
  static on(app: ReaderApp): boolean { return app.props.query.get('scene') !== 'split'; }
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const search = Pastime.search(app), wait = Pastime.wait(app);
    return (
      <nav className="scene-rail" aria-label="Go, look, wait, search, the map and your book">
        <SceneRail.Mark app={app} part="go" glyph="go_on" words="Go" standing={SceneRail.go(app)} />
        <SceneRail.Mark app={app} part="look" glyph="look_about" words="Look" standing={SceneRail.look(app)} />
        {wait && <SceneRail.Mark app={app} part="wait" glyph="wait" words="Wait" standing={{}} />}
        {search && <Act.View choice={search} draw={draw} quiet className="rail-mark by-glyph">
          <Glyphs.View id="search" className="rail-glyph" label="Search" /></Act.View>}
        <span className="rail-gap" aria-hidden="true" />
        <SceneRail.Books app={app} />
      </nav>
    );
  }
  // The map and the book, where they stand on every page of the scene: in talk, and over a thing looked at, as at
  // rest (the owner, 11 November: no bar of them across the top of the page).
  // On the map, its mark is pressed, and touched goes back to where the company is (the owner, 11 November: the map
  // had its own bar of Map and Book across its top).
  static Books({ app, alone, onMap }: { app: ReaderApp; alone?: boolean; onMap?: boolean }) {
    const marks = <>
      {onMap ? <button type="button" className="rail-mark pressed" data-action="back-to-place" aria-pressed="true"
        aria-label="The map: back to where you are" title="Back to where you are" onClick={() => app.outdoor(false)}>
        <Glyphs.View id="the_map" className="rail-glyph" /></button>
        : <button type="button" className={`rail-mark${SceneRail.mapLit(app) ? ' lit tone-gold' : ''}`}
          data-action="mode" data-view="map" data-key="m" aria-label="The map" title="The map"
          onClick={() => app.show('map')}><Glyphs.View id="the_map" className="rail-glyph" /></button>}
      <button type="button" className="rail-mark" data-action="book" aria-label="Your book" title="Your book"
        onClick={() => app.show('journal')}><Glyphs.View id="the_book" className="rail-glyph" /></button>
    </>;
    return alone ? <nav className={`scene-rail${onMap ? ' on-map' : ''}`} aria-label="The map and your book">{marks}</nav>
      : marks;
  }
  static Mark({ app, part, glyph, words, standing }: { app: ReaderApp; part: 'go' | 'look' | 'wait'; glyph: string;
    words: string; standing: Standing }) {
    const shut = 'shut' in standing ? standing.shut : undefined, lit = 'lit' in standing ? standing.lit : undefined;
    const said = shut ? `${words}: ${shut}` : words;
    return <button type="button" className={`rail-mark opens-${part}${lit ? ` lit tone-${lit}` : ''}`
      + `${'dim' in standing ? ' dim' : ''}`} data-action="explore" data-part={part} aria-haspopup="dialog"
      aria-expanded={app.state.exploring === part} aria-label={said} title={said} disabled={!!shut}
      onClick={() => Explorer.open(app, app.state.exploring === part ? undefined : part)}>
      <Glyphs.View id={glyph} className="rail-glyph" /></button>;
  }
  // Go: shut with no way from here; lit for the aim's way (where the way is shown) or a way not yet taken; dim where
  // every way goes somewhere left with nothing done and nothing new since.
  static go(app: ReaderApp): Standing {
    const ways = Wayfinder.ways(app), idle = new Set(app.state.frame?.leaf.glance?.idle ?? []);
    if (!ways.length) { return { shut: 'no way on from here' }; }
    if (Wayfinder.aimed(ways) && Guidance.shown(app)) { return { lit: 'gold' }; }
    const screen = app.state.frame!.screen;
    if (ways.some(w => !w.c.disabled && Wayfinder.been(screen, w) === false)) { return { lit: Emphasis.tones.exploration }; }
    return ways.every(w => idle.has(Wayfinder.to(w))) ? { dim: true } : {};
  }
  // Look: shut with nothing at hand to do anything with; lit by what the glance leads with that is at hand (its tone);
  // dim where the place itself has nothing new (left twice, nothing done, nothing since).
  static look(app: ReaderApp): Standing {
    const hand = AtHand.of(app), glance = app.state.frame?.leaf.glance;
    if (!hand.some(h => h.choices.some(c => !c.disabled))) { return { shut: 'nothing here to look at more closely' }; }
    if (GlanceStage.serves(app, hand) && Guidance.shown(app)) { return { lit: 'gold' }; }
    const ids = new Set(hand.flatMap(h => [...h.choices.map(c => c.id), ...h.opens]));
    const led = glance?.acts.find(a => ids.has(GlanceStage.choice(app, a.choice)?.id ?? '') && a.aspects.length);
    const tone = led && Emphasis.of(led.aspects, false).tone;
    if (tone) { return { lit: tone }; }
    return glance?.idle?.includes(app.state.frame!.screen.place.id) ? { dim: true } : {};
  }
  // The map, where a journey there is the aim's next step, and the way is shown.
  static mapLit(app: ReaderApp): boolean {
    return Guidance.shown(app) && !!app.state.frame?.leaf.glance?.acts.some(a => a.continues && a.choice.startsWith('travel:')
      && !(app.state.frame?.screen.around ?? []).some(d => `travel:${d.id}` === a.choice));
  }
}
