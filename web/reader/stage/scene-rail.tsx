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
import { Pip } from './pip';
import { WorldStage } from './world-stage';

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
  static on(app: ReaderApp): boolean { return app.props?.query?.get('scene') !== 'split'; }
  static View({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const search = Pastime.search(app), wait = Pastime.wait(app);
    return (
      <nav className="scene-rail" aria-label="Go, look, wait, search, the map and your book">
        <SceneRail.Talk app={app} />
        <SceneRail.Mark app={app} part="go" glyph="go_on" words="Go" standing={SceneRail.go(app)}
          faint={SceneRail.sensed(app)} />
        <SceneRail.Mark app={app} part="look" glyph="look_about" words="Look" standing={SceneRail.look(app)} />
        {/* Each in its own place whether it can be done or not, shut and saying why when not: the rail's marks had moved
            under the finger as the Search came and went, and a touch for the Eye opened Go (round 7, both players). */}
        <SceneRail.Mark app={app} part="wait" glyph="wait" words="Wait"
          standing={wait ? {} : { shut: 'nothing to wait for here' }} />
        {search ? <Act.View choice={search} draw={draw} quiet variant="glyph" className="rail-mark by-glyph">
          <Glyphs.View id="search" className="rail-glyph" label="Search" /></Act.View>
          : <button type="button" className="rail-mark by-glyph" disabled aria-label="Search: nothing here to search"
            title="Search: nothing here to search"><Glyphs.View id="search" className="rail-glyph" /></button>}
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
      data-action="lens" data-part="talk" aria-pressed={on} aria-label={said} title={said}
      onClick={() => app.setState({ talking: !on, exploring: undefined })}>
      <Glyphs.View id="companion" className="rail-glyph" />
    </button>;
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
        : <button type="button" className={`rail-mark${SceneRail.mapLit(app) ? ' lit' : ''}`}
          data-action="mode" data-view="map" data-key="m" aria-label="The map" title="The map"
          onClick={() => app.show('map')}><Glyphs.View id="the_map" className="rail-glyph" />
          {SceneRail.mapLit(app) && <Pip.View fill="var(--tone-gold)" />}</button>}
      <button type="button" className="rail-mark" data-action="book" aria-label="Your book" title="Your book"
        onClick={() => app.show('journal')}><Glyphs.View id="the_book" className="rail-glyph" /></button>
    </>;
    return alone ? <nav className={`scene-rail${onMap ? ' on-map' : ''}`} aria-label="The map and your book">{marks}</nav>
      : marks;
  }
  // Its pip (see Pip): lit, of the tone of something here; soft, of the tone of something perceived off along a way
  // from here (see Perception); none with nothing; and the whole mark lowered (dim) with nothing new.
  static Mark({ app, part, glyph, words, standing, faint }: { app: ReaderApp; part: 'go' | 'look' | 'wait';
    glyph: string; words: string; standing: Standing; faint?: Tone }) {
    const shut = 'shut' in standing ? standing.shut : undefined, lit = 'lit' in standing ? standing.lit : undefined;
    const said = shut ? `${words}: ${shut}` : 'dim' in standing ? `${words}: nothing new for now`
      : faint ? `${words}: someone who might join you, that way` : words;
    return <button type="button" className={`rail-mark opens-${part}${lit ? ' lit' : ''}`
      + `${'dim' in standing ? ' dim' : ''}${faint && !shut && !lit ? ' faint' : ''}`} data-action="explore" data-part={part} aria-haspopup="dialog"
      aria-expanded={app.state.exploring === part} aria-label={said} title={said} disabled={!!shut}
      onClick={() => Explorer.open(app, app.state.exploring === part ? undefined : part)}>
      <Glyphs.View id={glyph} className="rail-glyph" />
      {!shut && <Pip.View fill={lit ? `var(--tone-${lit})` : faint ? `var(--tone-${faint})` : undefined} faint={!lit} />}
    </button>;
  }
  // Go: shut with no way from here; lit for the aim's way (where the way is shown) or a way the place leads with; dim where
  // every way goes somewhere left with nothing done and nothing new since.
  static go(app: ReaderApp): Standing {
    const ways = Wayfinder.ways(app), idle = new Set(app.state.frame?.leaf.glance?.idle ?? []);
    if (!ways.length) { return { shut: 'no way on from here' }; }
    if (SceneRail.goes(app, ways) && Guidance.shown(app)) { return { lit: 'gold' }; }
    // Lit by what the place leads with that goes by one of them, in its tone, and that way marked so inside: not by
    // there being somewhere not yet been, which early on is everywhere, and named no way in the list.
    const tone = ways.map(w => Wayfinder.tone(app, w)).find(Boolean);
    if (tone) { return { lit: tone }; }
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
    if (GlanceStage.serves(app, hand) && Guidance.shown(app)) { return { lit: 'gold' }; }
    const ids = new Set(hand.flatMap(h => [...h.choices.map(c => c.id), ...h.opens]));
    const led = glance?.acts.find(a => ids.has(GlanceStage.choice(app, a.choice)?.id ?? '') && a.aspects.length);
    const tone = led && Emphasis.of(led.aspects, false).tone;
    if (tone) { return { lit: tone }; }
    return glance?.idle?.includes(app.state.frame!.screen.place.id) ? { dim: true } : {};
  }
  // What is perceived off along the ways from here, by the tone of its kind.
  static sensed(app: ReaderApp): Tone | undefined {
    const first = app.state.frame?.leaf.glance?.sensed?.[0];
    return first && Emphasis.tones[first.aspect];
  }
  // The map, where a journey there is the aim's next step, and the way is shown.
  static mapLit(app: ReaderApp): boolean {
    return Guidance.shown(app) && !!app.state.frame?.leaf.glance?.acts.some(a => a.continues && a.choice.startsWith('travel:')
      && !(app.state.frame?.screen.around ?? []).some(d => `travel:${d.id}` === a.choice));
  }
}
