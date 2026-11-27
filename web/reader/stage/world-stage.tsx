import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Scrolled } from './scrolled';
import { Glyphs } from '../creation/glyphs';
import type { Promoted } from '../../../src/presentation/glance-types';
import { Guidance } from '../guidance';
import type { Screen } from '../../../src/ui/screen-types';
import type { Frame } from '../../../src/creation/protocol';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import { Canon } from '../../../src/canon/canon';
import type { ReaderApp } from '../reader-app';
import { BoardField } from '../board-field';
import { MapView } from '../map-view';
import { MapMenu } from '../map-menu';
import { RouteCard } from '../route-card';
import { Words } from '../../../src/presentation/words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { PageFrame } from '../page-frame';
import { SceneRail } from './scene-rail';
import { Surfaces } from '../../../src/presentation/surfaces';
import { Pip } from './pip';
import type { Attested } from '../../../src/presentation/attest';
import { Fold } from '../../../src/presentation/fold';
import { Standing } from '../../../src/ui/standing';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';
import { Raised } from './raised';
import { Told } from './told';
import { Look } from '../look';
import { Folded } from './folded-rail';
import { SkySense } from './sky-sense';

// Where the company is, as a world it moves through (the owner, 4 November, evening; spatial-play.md). Across the
// stage the place bar (where, how deep, the hour); under it the surface and, beside it, the focus.
// Out in the wild the surface is the world map, the whole stage, for exploring and finding: a hex chosen is described
// (what it is, what is known of it, the way there) and set out for, a town entered; the hex the company stands in is
// described too, and entered by its own button. Nothing is done in a hex from the map (the owner: "the world map is for
// exploration and discovery, not conversation and interaction").
// Entered, and in a town, a building, a site or under the ground, the surface is the place as it is seen (its
// painting, never anything over it) and the focus beside it all that can be done there: what just happened, the few
// things worth doing, who and what is here, the ways from here, and what the company can do of itself.
export class WorldStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, draw = Act.draw(app), up = Raised.up(app);
    const here = screen.place.id;
    // What is chosen on the map belongs to this place (see ReaderApp.charted).
    const charted = app.state.charted, pick = (id?: string) => { app.setState({ charted: { at: here, id } }); };
    // Whether the map is up is the app's (see ReaderApp.outdoors): play begins on it, open country raises it, entering
    // or doing anything where the company is puts it away.
    const overworld = !!app.state.outdoors && !!screen.region?.land, focus = charted?.at === here ? charted.id : undefined;
    // A journey stopped here (a toll, a band on the road, a cart gone off it), and whether what stopped it means harm:
    // the map marks where, and says so (the owner, 4 November, night).
    const stopped = frame.travel && !frame.travel.arrived, threat = (app.menu.scene?.subjects ?? []).some(x => x.danger);
    // Mission 21's compositions (see Look): one panel holding the place's name, its telling, its menu and its tools
    // (veil, plate); lenses that never open a page (attend).
    const resting = !overworld && !!frame.leaf.glance, panel = resting && Look.is('veil', 'plate');
    const bar = useRef<HTMLElement>(null);
    Scrolled.useTall(bar, '--bar-h');
    return (
      <article className={`world-page scale-${overworld ? 'board' : 'scene'} kind-${PlaceStage.kind(screen)}`
        + `${screen.dark ? ' dark' : ''}${up ? ` raised-${up}` : ''}`
        + `${stopped ? ' interrupted' : ''}${threat ? ' threatened' : ''}${!overworld && SceneRail.talking(app) ? ' talking' : ''}`
        + `${resting && Folded.open(app) ? ' lenses-up' : ''}`}
        id="page">
        {!panel && <header ref={bar} className="world-bar" {...PageFrame.slot('header')}><div className="title-block"><Told.Heading frame={frame} app={app} /></div></header>}
        <div className="world-body">
          <section className="surface" aria-label="Where you are" {...PageFrame.slot('background')}>
            {overworld ? <WorldStage.Board app={app} screen={screen} chosen={focus} choose={pick} />
              : <><SceneSurface.View screen={screen} />
                {resting && <SkySense.View instruments={frame.leaf.instruments} />}
                {frame.leaf.glance && SceneRail.talking(app) && <WorldStage.Portraits app={app} draw={draw} />}
                </>}
          </section>
          <aside className={`focus${panel ? ' scene-panel' : ''}`} aria-label={overworld ? 'On the map' : 'What you are attending to'}>
            {panel && <header className="panel-head" {...PageFrame.slot('header')}><Told.Heading frame={frame} app={app} /></header>}
            {overworld && (app.state.walking || app.state.pending?.going) ? <WorldStage.Going app={app} />
              : overworld ? <WorldStage.Hex app={app} screen={screen} id={focus} clear={() => pick()} see={pick}
              enter={() => app.outdoor(false)} />
              : <>{/* No "Back out to the map" of the page's own: the engine offers the world map as a row (the
                    owner, 18 November: the page invents no flows or buttons).
                    */}
                {/* Go, Look and Wait are lenses of the scene's own (GlanceStage.Lens: CN-01), the painting kept: no
                    page of Go, Look or Wait over it (the owner, 11 November: Look a conversation with the place). */}
                {frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} apart />
                  : <div className="telling"><Told.Place app={app} headed={false}
                    here={<PlaceStage.Here app={app} draw={draw} />} /></div>}</>}
            {panel && <SceneRail.View app={app} draw={draw} />}
          </aside>
          {resting && !panel && <SceneRail.View app={app} draw={draw} />}
          {(overworld || !frame.leaf.glance) && <SceneRail.Books app={app} alone onMap={overworld} />}
        </div>
      </article>
    );
  }
  // Who is here, as small likenesses over the foot of the picture (the owner, 4 November, late: not where they stand
  // in it, but restrained, and each the way to them): touched, a person is talked to, an animal looked at in its own
  // page (5 November, late: a creature-focused interaction, not its one act done at a touch). The company first and
  // apart, at the left, wherever it is and however many are here; those dangerous ringed, at the right; one with
  // something owed the company (thanks, a payment, an answer to what it did) badged (see SceneSubject.owed).
  // Everyone is on the picture, the faces smaller the more there are (the owner's own play, 7 November: "+3" had
  // folded people into a second screen, the wagoner who owed two coin among them).
  static Portraits({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const { company, shown } = WorldStage.placed(app), many = company.length + shown.length;
    if (!many) { return null; }
    return (
      <ul className={`portraits${many > WorldStage.crowd ? ' crowd' : ''}`} aria-label="Who is here">
        {[...company, ...shown].map(x => { const seen = WorldStage.seen(app, x); return <li key={x.id} data-subject={x.id}
          className={`${x.kind}${x.danger ? ' danger' : ''}${seen?.tone === 'gold' ? ' led' : ''}`
            + `${x.stake ? ' stake' : ''}${x.owed ? ' owed' : ''}${seen?.tone ? ` toned tone-${seen.tone}` : ''}`}
          data-aspects={[...new Set(seen?.witnesses.flatMap(w => w.aspects))].join(' ') || undefined}>
          <WorldStage.Portrait subject={x} draw={draw} pip={seen} /></li>; })}
      </ul>
    );
  }
  // More than the picture's foot holds in one row however small the faces: a second row above the first.
  static readonly crowd = 12;
  // Who is drawn where: the company, and everyone else here.
  static placed(app: ReaderApp): { company: SceneSubject[]; shown: SceneSubject[] } {
    const all = WorldStage.ordered(app);
    return { company: all.filter(x => x.kind === 'companion'), shown: all.filter(x => x.kind !== 'companion') };
  }
  // Those who mean harm last, so that they stand apart at the right of the picture.
  static present(app: ReaderApp): SceneSubject[] {
    return (app.menu.scene?.subjects ?? []).filter(x => ['companion', 'person', 'animal', 'creature'].includes(x.kind))
      .sort((a, b) => Number(!!a.danger) - Number(!!b.danger));
  }
  // As they are drawn: in the place's own order, the same from one look to the next, whoever is led with (everyone is on
  // the picture however many are here). Put first when led, the likenesses had moved after each conversation, and a
  // touch where someone had been opened someone else (round 10, R 61, 134; round 11, U 97, 148).
  static ordered(app: ReaderApp): SceneSubject[] {
    return WorldStage.present(app);
  }
  // Whether what the glance leads with is about them.
  static led(app: ReaderApp, x: SceneSubject): boolean {
    const g = app.state.frame?.leaf.glance;
    return (app.menu.leads ?? g?.acts ?? []).some(a => a.subject === x.id);
  }
  // What someone here is to the company: the engine's one value for their likeness (Glance.likenesses, PL-32), the
  // aspects of what can be done with them together, or the undertaking alone where they are the followed aim's next
  // step; and of the scene's own, only something owed them and a danger seen in them. Gold only where the way is shown
  // (see Guidance). Drawn as one pip by the likeness (see Pip), never composed again here from the glance's acts.
  static seen(app: ReaderApp, x: SceneSubject): Attested | undefined {
    const g = app.state.frame?.leaf.glance, likeness = g?.likenesses?.[x.id];
    return Fold.mark(Fold.subject(g, x.id), !!likeness?.continues && Guidance.shown(app));
  }
  // A likeness with nothing to open, touched, says why beneath it for a moment, rather than nothing (round 6: three taps
  // on the factor's hands, and on an enemy, did nothing, and nothing said why).
  static Still({ subject: x, fell, children }: { subject: SceneSubject; fell: string; children: ReactNode }) {
    const [told, tell] = useState(false), why = WorldStage.why(x);
    useEffect(() => { if (!told) { return; } const t = setTimeout(() => tell(false), 3200); return () => clearTimeout(t); }, [told]);
    return <button type="button" data-action="likeness-still" className={`portrait still${fell}${told ? ' told' : ''}`} aria-disabled="true"
      aria-label={`${x.name}: ${why}`} onClick={() => tell(true)}>{children}
      {told && <span className="still-why" role="status">{why}</span>}</button>;
  }
  // One of the company down is said as the Company page says it (round 8, N: "down", and nothing said what it meant);
  // someone never spoken to has nothing to say, not "nothing more" (round 8, M). One at their own business is seen at
  // it, as the place tells it (round 10, S: the poacher's boy stood at the causeway with "nothing to say to you now").
  static why(x: SceneSubject): string {
    if (x.state) {
      return x.state === 'dead' ? 'Dead.' : x.kind === 'companion' ? Standing.senseless : 'Down, and not getting up yet.';
    }
    return x.danger ? 'Means you harm: what can be done is in the scene.' : x.says?.[0] ?? 'Nothing to say to you now.';
  }
  private static readonly fetching = new Set<string>();
  static fetched(src: string) {
    if (WorldStage.fetching.has(src)) { return; }
    WorldStage.fetching.add(src);
    const img = new Image(); img.decoding = 'async'; img.src = src;
  }
  static Portrait({ subject: x, draw, pip }: { subject: SceneSubject; draw: Draw; pip?: Attested }) {
    // One with nothing to say or do now is a likeness, not a way into a conversation with nothing in it.
    const into = x.live || x.kind === 'animal' || x.kind === 'creature' ? WorldStage.into(x) : undefined;
    // Whoever can be turned to has their large likeness fetched while the scene shows them, so a conversation opens
    // with them in it (M22's second review, OR-43: the sitter had come a second after the page).
    useEffect(() => { if (into && x.portrait?.large) { WorldStage.fetched(x.portrait.large); } }, [into, x.portrait?.large]);
    const face = x.portrait
      ? /(^|\/)(animals|monsters)\//.test(x.portrait.src)
        ? <img className="whole" src={x.portrait.src} alt="" decoding="async" />
        : <img src={x.portrait.src} alt="" decoding="async" style={{ objectPosition: `50% ${x.portrait.focus}%` }} />
      : <Glyphs.View id={Glyphs.met(x)} className="emblem" />;
    const name = Typography.curl(Words.upper(x.name));
    const body = <><span className="face" aria-hidden="true">{face}</span>
      <Pip.View mark={pip} />
      <span className="pn">{name}</span>
      {x.state && <span className="fell">{x.state === 'dead' ? 'Dead' : 'Down'}</span>}</>;
    // The fallen are drawn fallen (the owner, 7 November: the dead had stood in their likenesses as if alive).
    const fell = x.state ? ` fallen ${x.state}` : '';
    if (!into) { return <WorldStage.Still subject={x} fell={fell}>{body}</WorldStage.Still>; }
    // An animal's own page is the page's to open (no command of the engine's), and is opened as one.
    return <Act.View choice={into} draw={draw} quiet variant="glyph" className={`portrait${fell}`}>{body}</Act.View>;
  }
  // What touching a likeness opens: talking to a person; an animal's or a creature's own page, with what can be done
  // with it (meeting a danger, fighting it, among it).
  static into(x: SceneSubject): Choice | undefined {
    if (['animal', 'creature'].includes(x.kind) && x.choices.length && !x.choices.some(c => /#(look|talk)$/.test(c.id))) {
      return { id: `${x.id}#look`, label: `Look at ${x.name}`, tone: 'thing' };
    }
    return PlaceStage.into(x);
  }
  // Whether the company stands in the open country, where the world map is the surface.
  // Whether play begins on the map: only where the company begins out in the wild country. Begun in a town or under a
  // roof, it begins on the place itself: the opening had sent the debtor "straight to Tuck's door", and the first page
  // was the whole world map saying "You stand at its gate" under the heading "Tuck's wood-yard" (both cold players of
  // Mission 20's first round; the owner's amendment 1 of 10 November, superseding "play begins on the map" there).
  static begins(frame: Frame): boolean {
    return !frame.combat && WorldStage.wild(frame.screen) && Surfaces.has(frame.screen, 'the_map');
  }
  static wild(screen: Screen): boolean {
    return PlaceStage.kind(screen) === 'wild' && !!screen.region?.land;
  }
  // The world map, the whole stage: a hex chosen is described beside it, chosen again set out for. The way there laid
  // as the journey would go it, as the map's dialog lays it (MapView.courses, asking the engine where the screen has no
  // plan): this map had been given none, and laid its own shortest way over the land known, or nothing where any of it
  // lay under the mist; Mistshaw, two and a half hours by the road, had no way drawn before setting out (OPR-03).
  static Board({ app, screen, chosen, choose }: { app: ReaderApp; screen: Screen; chosen?: string;
    choose: (id?: string) => void }) {
    const pick = (id: string) => {
      const g = app.state.frame?.leaf?.glance;
      if (chosen && MapView.shown(screen.region!, chosen) === id) {
        const go = MapView.way(screen, chosen, g).go;
        if (go && !Act.asks(go)) { app.choose(go); return; }
      }
      choose(id);
    };
    const [planned, plan] = useState<Record<string, string[] | null>>({});
    useEffect(() => { MapView.ask(app, screen, { chosen, planned, plan }); }, [app, screen, chosen, planned]);
    const walking = app.state.walking, bound = BoardField.whither(screen.region!, app.state.frame?.bound?.id);
    return <div className="board-surface"><BoardField.View region={screen.region!}
      chosen={MapView.shown(screen.region!, chosen)} choose={pick}
      bound={bound} face={screen.party[0]?.face?.medium} walking={walking?.way} walked={walking?.done}
      // What the journey came to know, lit as the mark passes it (OR-112, OR-162): the map in the scene had been given
      // none, and the country came all at once when the walk was done.
      learned={walking?.known}
      courses={MapView.courses(app, screen, { chosen, bound, planned })} dress={MapView.dress(app, screen)} /></div>;
  }
  // What the map says of a hex: the one the company stands in (what it is, whether anyone is about, and entering it);
  // a town (entered from here); or anywhere else, as the map's own card says it (what is known of it, the way there).
  // see: another place chosen on the map from its menu (View …: see MapMenu).
  static Hex({ app, screen, id, clear, enter, see }: { app: ReaderApp; screen: Screen; id?: string; clear: () => void;
    enter: () => void; see?: (id: string) => void }) {
    // Taller than the room above the dock (a phone's), the card says it goes on (data-more: book.css).
    const card = useRef<HTMLElement>(null);
    Scrolled.useCue(card, `${id ?? ''}${app.state.frame?.screen.place.id}`);
    if (id) {
      const town = screen.region?.areas.find(a => a.id === id && a.kind === 'settlement');
      return town ? <WorldStage.Town app={app} screen={screen} town={town} see={see} />
        : <MapView.Plan app={app} screen={screen} chosen={id} clear={clear} {...see ? { view: see } : {}} />;
    }
    // Within a town or a site, the hex is the town's or the site's, and entered is back where the company stands.
    const within = WorldStage.wild(screen) ? undefined : screen.path.find(p => ['settlement', 'site'].includes(p.kind));
    const town = within && screen.region?.areas.find(a => a.id === within.id && a.kind === 'settlement');
    if (town) { return <WorldStage.Town app={app} screen={screen} town={town} see={see} />; }
    const g = app.state.frame!.leaf.glance, land = screen.region!.land!, name = within?.name ?? screen.place.name;
    const people = (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person').length;
    const danger = (app.menu.scene?.subjects ?? []).some(x => x.danger), unplaced = MapView.unplaced(app, screen);
    return (
      <section className="hex-card" data-id={screen.place.id} aria-live="polite" ref={card}>
        <p className="label">Where you are</p>
        <h2 className="to">{Typography.curl(Words.upper(name))}</h2>
        {land.here !== undefined && <p className="how">{Typography.curl(Words.upper(MapView.ground(land, land.here,
          screen.region)))}</p>}
        {g?.sight && <p className="sight">{Typography.curl(g.sight.text)}</p>}
        <WorldStage.Stopped app={app} danger={danger} />
        {unplaced && <><p className="label">Your aim</p><p className="aim-unplaced">{Typography.curl(unplaced.aim)}</p>
          <p className="how">{Typography.curl(unplaced.who)}</p></>}
        {people > 0 && <p className="about">{people === 1 ? 'Someone is here.' : 'There are people here.'}</p>}
        <WorldStage.Entrance app={app} />
        <MapMenu.View app={app} screen={screen} put={enter} {...WorldStage.onward(app) ?? {}} {...see ? { view: see } : {}} />
      </section>
    );
  }
  // In a town's own country, the way into the town, as the scene leads with it: named, and with the one pip of what
  // the company perceives of it (the owner, 11 November late: in the hex of a town the card had said only "Enter", the
  // map's gold led to a far town, and the town at hand was found only under Go…).
  static entry(app: ReaderApp): { a: Promoted; c: Choice } | undefined {
    const a = app.state.frame?.leaf.glance?.acts.find(x => x.enters), c = a && GlanceStage.choice(app, a.choice);
    return a && c && !c.disabled ? { a, c } : undefined;
  }
  static Entrance({ app }: { app: ReaderApp }) {
    const entry = WorldStage.entry(app);
    if (!entry) { return null; }
    const { a, c } = entry, gilded = !!a.continues && Guidance.shown(app);
    return <Act.View choice={c} draw={Act.draw(app)} quiet variant="glyph" className="enter entrance">
      <Pip.View mark={Fold.mark(app.state.frame?.menu.marks.led[a.choice] ?? [], gilded)} />
      {Typography.curl(a.label)}</Act.View>;
  }
  // Why the journey stopped here, and what going on from here risks: the way on's own marks (a band that will not let
  // the company by unanswered, nightfall), else that something here is dangerous; never a chance the game does not
  // reckon (the owner, 4 November, night: no hidden way out of what is here by the map).
  static Stopped({ app, danger }: { app: ReaderApp; danger: boolean }) {
    const travel = app.state.frame!.travel, risks = (WorldStage.onward(app)?.onward.c.marks ?? []).map(m => m.said);
    return <>
      {travel && !travel.arrived && <p className="about stopped">{Typography.curl(`On the way to ${travel.to}: `
        + `${travel.stopped ?? 'the journey stops here'}.`)}</p>}
      {danger && <p className="about danger">{Typography.curl(risks.length
        ? `Something here is dangerous. Going on: ${risks.join('; ')}.` : 'Something here is dangerous.')}</p>}
      {danger && <p className="about">{WorldStage.flight()}</p>}
    </>;
  }
  // The journey held, as the page has it, with what it risks, its way on the map's menu's first row; in a town, whose
  // journeys are the map's (see MenuModel.inside), as the map sets out on it.
  static onward(app: ReaderApp): { onward: { c: Choice; name: string } } | undefined {
    const frame = app.state.frame!, bound = frame.bound;
    const c = bound && ((app.menu.destinations ?? []).find(x => x.id === `travel:${bound.id}`)
      ?? (frame.screen.region?.land ? MapView.way(frame.screen, bound.id, frame.leaf.glance).go : undefined));
    return bound && c ? { onward: { c, name: bound.name } } : undefined;
  }
  // The odds of getting away from a fight, as the engine rolls them (vocabulary.json's combat.flee): each try's, and
  // sure after the last (Effects.apply's flee).
  static flight(): string {
    const said = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
    const tries = Canon.rules.combat.flee.map(t => {
      const sides = Number(t.die.replace(/^1d/, ''));
      return t.atMost * 2 === sides ? 'an even chance' : `${said[t.atMost] ?? t.atMost} in ${said[sides] ?? sides}`;
    });
    return `Should it come to a fight, getting away is ${[...tries, 'sure'].join(', then ')}.`;
  }
  // A town chosen on the map: seen whole, how far and by what way, and travelled to; entered only once the company
  // has come to it (the owner, 5 November: seeing a town is not being there). Chosen, set out for, come to, entered:
  // each its own state, the journey between walked on the map (see ReaderApp.walk). A journey stopped at a town on the
  // way says why, and goes on from there, as one stopped anywhere else does: stopped at Ramrehes on the way to a lone
  // tower, the card had said only "You stand at its gate" (the fresh playtest of 7 November).
  // Already within it, the company is where it stands in it, and goes back there from the card: the map opened from
  // Uarin's forge in Greycastle had said "You stand at its gate" and "Enter Greycastle" (the evidence sessions of 7
  // November). At its gate is the game's first page, or a town just come to across the map.
  static Town({ app, screen, town, see }: { app: ReaderApp; screen: Screen;
    town: NonNullable<Screen['region']>['areas'][number]; see?: (id: string) => void }) {
    const card = useRef<HTMLElement>(null);
    Scrolled.useCue(card, town.id);
    const way = MapView.way(screen, town.id, app.state.frame?.leaf?.glance), { d, here, go } = way, views = Scenery.views.settlement ?? [];
    const view = views.length ? views[Scenery.hash(town.id) % views.length] : undefined;
    const come = here && app.state.frame?.travel?.arrived;
    const inside = here && !app.state.frame?.travel && !!screen.elapsed;
    const where = Typography.curl(Words.upper(screen.place.name));
    // At its gate, Enter is the way in, as the scene leads with it: it had shut the map on the road outside, where the
    // company already stood (the blind playtest, 13 November: "Enter Shaynof" returned to the road; BP-05).
    const entry = here && !inside ? WorldStage.entry(app) : undefined;
    return (
      <section className="enter-card" ref={card} data-id={town.id} data-state={here ? come ? 'arrived' : inside ? 'inside' : 'here'
        : 'chosen'} aria-live="polite">
        {view && <div className="enter-view"><PlaceStage.Country view={view} /></div>}
        <p className="label">{come ? 'You have come to' : inside ? 'You are in' : here ? 'You are at'
          : town.visited ? 'A town you know' : 'A town'}</p>
        <h2 className="to">{Typography.curl(town.name)}</h2>
        {/* How long, when and at what cost, set out as the route card sets them (see RouteCard). */}
        {d && !here ? <dl className="rc-facts">{RouteCard.facts(screen, town.id, way).map(([k, v]) =>
          <div key={k}><dt>{k}</dt><dd>{Typography.curl(v)}</dd></div>)}</dl>
          : <p className="how">{inside ? `${where}.` : here ? 'You stand at its gate.'
            : go ? 'Across the country you can see.' : 'You know no way there yet.'}</p>}
        {here && <WorldStage.Stopped app={app} danger={(app.menu.scene?.subjects ?? []).some(x => x.danger)} />}
        <MapMenu.View app={app} screen={screen} {...here ? {} : { chosen: town.id }} put={() => app.outdoor(false)}
          {...entry ? { enter: { c: entry.c, name: Typography.curl(town.name) } } : {}}
          {...here ? WorldStage.onward(app) ?? {} : {}} {...see ? { view: see } : {}} />
      </section>
    );
  }
  // On the way: where to and by what way, while your mark walks it; nothing to choose until the company is there.
  static Going({ app }: { app: ReaderApp }) {
    const s = app.state, travel = s.pending?.travel;
    return (
      <section className="hex-card going" data-state="travelling" aria-live="polite">
        <p className="label">On the way</p>
        <h2 className="to">{Typography.curl(Words.upper(s.pending?.said ?? 'Travelling'))}</h2>
        {travel && <p className="how">{Typography.curl(`${Words.upper(travel.way)}: ${Words.span(travel.minutes)}.`)}</p>}
      </section>
    );
  }
}
