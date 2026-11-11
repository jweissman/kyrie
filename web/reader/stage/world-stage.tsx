import { Glyphs } from '../creation/glyphs';
import type { Aspect } from '../../../src/presentation/glance-types';
import { Emphasis, type Tone } from '../emphasis';
import { Guidance } from '../guidance';
import type { Screen } from '../../../src/ui/screen-types';
import type { Frame } from '../../engine/protocol';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import { Canon } from '../../../src/canon/canon';
import type { ReaderApp } from '../reader-app';
import { BoardField } from '../board-field';
import { MapView } from '../map-view';
import { RouteCard } from '../route-card';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { Explorer } from './explorer';
import { SceneRail } from './scene-rail';
import { Pip } from './pip';
import { LookAbout } from './look-about';
import { MorePane } from './more-pane';
import { PlaceStage } from './place-stage';
import { SceneSurface } from './scene-surface';
import { Raised } from './raised';
import { Told } from './told';
import { WaysPane } from './ways-pane';

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
    return (
      <article className={`world-page scale-${overworld ? 'board' : 'scene'} kind-${PlaceStage.kind(screen)}`
        + `${screen.dark ? ' dark' : ''}${up ? ` raised-${up}` : ''}`
        + `${stopped ? ' interrupted' : ''}${threat ? ' threatened' : ''}`} id="page">
        <header className="world-bar"><div className="title-block"><Told.Heading frame={frame} app={app} /></div></header>
        <div className="world-body">
          <section className="surface" aria-label="Where you are">
            {overworld ? <WorldStage.Board app={app} screen={screen} chosen={focus} choose={pick} />
              : <><SceneSurface.View screen={screen} />
                {frame.leaf.glance && <WorldStage.Portraits app={app} draw={draw} />}</>}
          </section>
          <aside className="focus" aria-label={overworld ? 'On the map' : 'What you are attending to'}>
            {overworld && (app.state.walking || app.state.pending?.going) ? <WorldStage.Going app={app} />
              : overworld ? <WorldStage.Hex app={app} screen={screen} id={focus} clear={() => pick()}
              enter={() => app.outdoor(false)} />
              : <>{WorldStage.wild(screen) && <button type="button" className="option quiet back-to-map"
                data-action="back-to-map" onClick={() => app.outdoor(true)}>Back out to the map</button>}
                {/* Go, Look and Wait open here, in the scene's own panel, the painting kept (the owner, 11 November:
                    Look a conversation with the place, not a panel of its own). */}
                {frame.leaf.glance && app.state.exploring && SceneRail.on(app) ? <Explorer.View app={app} draw={draw} />
                  : frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} apart />
                  : <div className="telling"><Told.Place app={app} headed={false}
                    here={<PlaceStage.Here app={app} draw={draw} />} /></div>}</>}
          </aside>
          {!overworld && !SceneRail.on(app) && <Explorer.View app={app} draw={draw} />}
          {!overworld && frame.leaf.glance && SceneRail.on(app) && <SceneRail.View app={app} draw={draw} />}
          {(overworld || !frame.leaf.glance) && SceneRail.on(app) && <SceneRail.Books app={app} alone onMap={overworld} />}
        </div>
        {up === 'look' && <LookAbout.Sheet app={app} draw={draw} />}
        {up === 'ways' && <WaysPane.Sheet app={app} draw={draw} />}
        {up === 'more' && <MorePane.Sheet app={app} draw={draw} />}
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
          className={`${x.kind}${x.danger ? ' danger' : ''}${seen.gilded ? ' led' : ''}`
            + `${x.stake ? ' stake' : ''}${x.owed ? ' owed' : ''}${seen.tone ? ` toned tone-${seen.tone}` : ''}`}
          data-aspects={seen.aspects.join(' ') || undefined}>
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
  // As they are drawn: whoever the glance leads with first, so that they are on the picture however many are here.
  static ordered(app: ReaderApp): SceneSubject[] {
    const all = WorldStage.present(app);
    return [...all.filter(x => WorldStage.led(app, x)), ...all.filter(x => !WorldStage.led(app, x))];
  }
  // Whether what the glance leads with is about them.
  static led(app: ReaderApp, x: SceneSubject): boolean {
    const g = app.state.frame?.leaf.glance;
    return (app.menu.leads ?? g?.acts ?? []).some(a => a.subject === x.id);
  }
  // What someone here is to the company, from what the glance leads with that is about them (and something owed): the
  // aspects of those, together, never a claim that each thing to be done with them has them all. Gold only where they
  // are the aim's next step and the way is shown (see Guidance); several, a ring through their tones (the owner, 11
  // November: a person aggregates the known aspects of what can be done with them).
  // Drawn as one pip by the likeness (see Pip); a danger the company perceives in them is among them.
  static seen(app: ReaderApp, x: SceneSubject): { aspects: Aspect[]; gilded: boolean; tone?: Tone; fill?: string;
    label: string } {
    const acts = (app.state.frame?.leaf.glance?.acts ?? []).filter(a => a.subject === x.id);
    const gilded = acts.some(a => a.continues) && Guidance.shown(app);
    const all = [...acts.flatMap(a => a.aspects), ...x.owed ? ['payoff' as const] : [], ...x.danger ? ['danger' as const] : []];
    const aspects = all.filter((a, i) => all.indexOf(a) === i).sort((a, b) => Number(b === 'undertaking') - Number(a === 'undertaking'));
    const { tone } = Emphasis.of(aspects, gilded), fill = Pip.fill(aspects, gilded);
    return { aspects, gilded, ...tone ? { tone } : {}, ...fill ? { fill } : {}, label: Pip.words(aspects, gilded) };
  }
  static Portrait({ subject: x, draw, pip }: { subject: SceneSubject; draw: Draw; pip?: { fill?: string; label: string } }) {
    // One with nothing to say or do now is a likeness, not a way into a conversation with nothing in it.
    const into = x.live || x.kind === 'animal' || x.kind === 'creature' ? WorldStage.into(x) : undefined, face = x.portrait
      ? /(^|\/)(animals|monsters)\//.test(x.portrait.src)
        ? <img className="whole" src={x.portrait.src} alt="" decoding="async" />
        : <img src={x.portrait.src} alt="" decoding="async" style={{ objectPosition: `50% ${x.portrait.focus}%` }} />
      : <Glyphs.View id={Glyphs.met(x)} className="emblem" />;
    const name = Typography.curl(Words.upper(x.name));
    const body = <><span className="face" aria-hidden="true">{face}</span>
      <Pip.View fill={pip?.fill} label={pip?.label} />
      <span className="pn" title={name}>{name}</span>
      {x.state && <span className="fell">{x.state === 'dead' ? 'Dead' : 'Down'}</span>}</>;
    // The fallen are drawn fallen (the owner, 7 November: the dead had stood in their likenesses as if alive).
    const fell = x.state ? ` fallen ${x.state}` : '';
    if (!into) { return <span className={`portrait still${fell}`}>{body}</span>; }
    // An animal's own page is the page's to open (no command of the engine's), and is opened as one.
    return draw.index.has(into.id) ? <Act.View choice={into} draw={draw} quiet className={`portrait${fell}`}>{body}</Act.View>
      : <button type="button" className={`act portrait${fell}`} data-action="look-at" data-choice={into.id}
        onClick={() => draw.app.choose(into)}>{body}</button>;
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
  static begins(frame: Frame): boolean { return !frame.combat && WorldStage.wild(frame.screen); }
  static wild(screen: Screen): boolean {
    return PlaceStage.kind(screen) === 'wild' && !!screen.region?.land;
  }
  // The world map, the whole stage: a hex chosen is described beside it, chosen again set out for.
  static Board({ app, screen, chosen, choose }: { app: ReaderApp; screen: Screen; chosen?: string;
    choose: (id?: string) => void }) {
    const pick = (id: string) => {
      if (chosen === id) { const go = MapView.way(screen, id).go; if (go && !Act.asks(go)) { app.choose(go); return; } }
      choose(id);
    };
    const walking = app.state.walking, bound = BoardField.whither(screen.region!, app.state.frame?.bound?.id);
    return <div className="board-surface"><BoardField.View region={screen.region!} chosen={chosen} choose={pick}
      bound={bound} face={screen.party[0]?.face?.src} walking={walking?.way} walked={walking?.done} /></div>;
  }
  // What the map says of a hex: the one the company stands in (what it is, whether anyone is about, and entering it);
  // a town (entered from here); or anywhere else, as the map's own card says it (what is known of it, the way there).
  static Hex({ app, screen, id, clear, enter }: { app: ReaderApp; screen: Screen; id?: string; clear: () => void;
    enter: () => void }) {
    if (id) {
      const town = screen.region?.areas.find(a => a.id === id && a.kind === 'settlement');
      return town ? <WorldStage.Town app={app} screen={screen} town={town} clear={clear} />
        : <MapView.Plan app={app} screen={screen} chosen={id} clear={clear} />;
    }
    // Within a town or a site, the hex is the town's or the site's, and entered is back where the company stands.
    const within = WorldStage.wild(screen) ? undefined : screen.path.find(p => ['settlement', 'site'].includes(p.kind));
    const town = within && screen.region?.areas.find(a => a.id === within.id && a.kind === 'settlement');
    if (town) { return <WorldStage.Town app={app} screen={screen} town={town} />; }
    const g = app.state.frame!.leaf.glance, land = screen.region!.land!, name = within?.name ?? screen.place.name;
    const people = (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person').length;
    const danger = (app.menu.scene?.subjects ?? []).some(x => x.danger), unplaced = MapView.unplaced(app, screen);
    return (
      <section className="hex-card" data-id={screen.place.id} aria-live="polite">
        <p className="label">Where you are</p>
        <h2 className="to">{Typography.curl(Words.upper(name))}</h2>
        {land.here !== undefined && <p className="how">{Typography.curl(Words.upper(MapView.ground(land, land.here,
          screen.region)))}</p>}
        {g?.sight && <p className="sight">{Typography.curl(g.sight.text)}</p>}
        <WorldStage.Stopped app={app} danger={danger} />
        {unplaced && <><p className="label">Your aim</p><p className="aim-unplaced">{Typography.curl(unplaced.aim)}</p>
          <p className="how">{Typography.curl(unplaced.who)}</p></>}
        {people > 0 && <p className="about">{people === 1 ? 'Someone is here.' : 'There are people here.'}</p>}
        <button type="button" className="enter" data-action="enter-hex" onClick={enter}>Enter</button>
      </section>
    );
  }
  // Why the journey stopped here, and what going on from here risks: the way on's own marks (a band that will not let
  // the company by unanswered, nightfall), else that something here is dangerous; never a chance the game does not
  // reckon (the owner, 4 November, night: no hidden way out of what is here by the map).
  static Stopped({ app, danger }: { app: ReaderApp; danger: boolean }) {
    const frame = app.state.frame!, travel = frame.travel, bound = frame.bound;
    // The journey held, as the page has it, with what it risks; in a town, whose journeys are the map's (see
    // MenuModel.inside), as the map sets out on it.
    const on = bound && ((app.menu.destinations ?? []).find(c => c.id === `travel:${bound.id}`)
      ?? (frame.screen.region?.land ? MapView.way(frame.screen, bound.id).go : undefined));
    const risks = (on?.marks ?? []).map(m => m.said);
    return <>
      {travel && !travel.arrived && <p className="about stopped">{Typography.curl(`On the way to ${travel.to}: `
        + `${travel.stopped ?? 'the journey stops here'}.`)}</p>}
      {danger && <p className="about danger">{Typography.curl(risks.length
        ? `Something here is dangerous. Going on: ${risks.join('; ')}.` : 'Something here is dangerous.')}</p>}
      {danger && <p className="about">{WorldStage.flight()}</p>}
      {on && <p className="go"><button type="button" className="option go-on" data-action="go-on"
        onClick={() => app.choose(on)}>{`Go on to ${bound.name}`}</button></p>}
    </>;
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
  static Town({ app, screen, town, clear }: { app: ReaderApp; screen: Screen;
    town: NonNullable<Screen['region']>['areas'][number]; clear?: () => void }) {
    const { d, here, go } = MapView.way(screen, town.id), views = Scenery.views.settlement ?? [];
    const view = views.length ? views[Scenery.hash(town.id) % views.length] : undefined;
    const come = here && app.state.frame?.travel?.arrived;
    const inside = here && !app.state.frame?.travel && !!screen.elapsed;
    const where = Typography.curl(Words.upper(screen.place.name));
    return (
      <section className="enter-card" data-id={town.id} data-state={here ? come ? 'arrived' : inside ? 'inside' : 'here'
        : 'chosen'} aria-live="polite">
        {view && <div className="enter-view"><PlaceStage.Country view={view} /></div>}
        <p className="label">{come ? 'You have come to' : inside ? 'You are in' : here ? 'You are at'
          : town.visited ? 'A town you know' : 'A town'}</p>
        <h2 className="to">{Typography.curl(town.name)}</h2>
        {/* How long, when and at what cost, set out as the route card sets them (see RouteCard). */}
        {d && !here ? <dl className="rc-facts">{RouteCard.facts(screen, town.id, MapView.way(screen, town.id)).map(([k, v]) =>
          <div key={k}><dt>{k}</dt><dd>{Typography.curl(v)}</dd></div>)}</dl>
          : <p className="how">{inside ? `${where}.` : here ? 'You stand at its gate.'
            : go ? 'Across the country you can see.' : 'You know no way there yet.'}</p>}
        {here && <WorldStage.Stopped app={app} danger={(app.menu.scene?.subjects ?? []).some(x => x.danger)} />}
        {here ? <button type="button" className="enter" data-action="enter-hex" onClick={() => { app.outdoor(false); }}>
          {inside ? `Back to ${where.replace(/^The /, 'the ')}` : `Enter ${Typography.curl(town.name)}`}</button>
          : go && <button type="button" className="enter travel" data-action="travel" onClick={() => { app.choose(go); }}>
            Travel to {Typography.curl(town.name)}</button>}
        {clear && <button type="button" className="option quiet" data-action="unchoose" onClick={clear}>Back</button>}
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
