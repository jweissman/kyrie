import { useState } from 'react';
import type { Screen } from '../../../src/ui/screen-types';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import type { ReaderApp } from '../reader-app';
import { BoardField } from '../board-field';
import { MapView } from '../map-view';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { GlanceStage } from './glance';
import { Explorer } from './explorer';
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
    // What is chosen on the map, and whether the company has gone into the hex it stands in: both belong to this place.
    const [chosen, choose] = useState<{ at: string; id?: string }>({ at: here });
    const pick = (id?: string) => choose({ at: here, id });
    // Whether the map is up is the app's (see ReaderApp.outdoors): play begins on it, open country raises it, entering
    // or doing anything where the company is puts it away.
    const overworld = !!app.state.outdoors && !!screen.region?.land, focus = chosen.at === here ? chosen.id : undefined;
    const view = screen.dark ? undefined : Scenery.of(screen) ?? Scenery.inside(screen);
    return (
      <article className={`world-page scale-${overworld ? 'board' : 'scene'} kind-${PlaceStage.kind(screen)}`
        + `${view ? '' : ' unpainted'}${screen.dark ? ' dark' : ''}${up ? ` raised-${up}` : ''}`} id="page">
        <header className="world-bar"><div className="title-block"><Told.Heading frame={frame} /></div></header>
        <div className="world-body">
          <section className="surface" aria-label="Where you are">
            {overworld ? <WorldStage.Board app={app} screen={screen} chosen={focus} choose={pick} />
              : <><SceneSurface.View screen={screen} />
                {frame.leaf.glance && <WorldStage.Portraits app={app} draw={draw} />}</>}
          </section>
          <aside className="focus" aria-label={overworld ? 'On the map' : 'What you are attending to'}>
            {overworld ? <WorldStage.Hex app={app} screen={screen} id={focus} clear={() => pick()}
              enter={() => app.outdoor(false)} />
              : <>{WorldStage.wild(screen) && <button type="button" className="option quiet back-to-map"
                data-action="back-to-map" onClick={() => app.outdoor(true)}>Back out to the map</button>}
                {frame.leaf.glance ? <GlanceStage.View app={app} draw={draw} apart />
                  : <div className="telling"><Told.Place app={app} headed={false}
                    here={<PlaceStage.Here app={app} draw={draw} />} /></div>}</>}
          </aside>
          {!overworld && <Explorer.View app={app} draw={draw} />}
        </div>
        {up === 'look' && <LookAbout.Sheet app={app} draw={draw} />}
        {up === 'ways' && <WaysPane.Sheet app={app} draw={draw} />}
        {up === 'more' && <MorePane.Sheet app={app} draw={draw} />}
      </article>
    );
  }
  // Who is here, as small likenesses over the foot of the picture (the owner, 4 November, late: not where they stand
  // in it, but restrained, and each the way to them): touched, the person is talked to, the animal turned to. Those
  // dangerous are ringed; more than seven, and the rest are in the explorer.
  static Portraits({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const here = (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person' || x.kind === 'animal');
    if (!here.length) { return null; }
    const shown = here.slice(0, 7), more = here.length - shown.length;
    return (
      <ul className="portraits" aria-label="Who is here">
        {shown.map(x => {
          const into = PlaceStage.into(x), face = x.portrait
            ? <img src={x.portrait.src} alt="" decoding="async" style={{ objectPosition: `50% ${x.portrait.focus}%` }} />
            : <span className="initial">{Words.upper(x.name).replace(/^The /, '').charAt(0)}</span>;
          const body = <><span className="face" aria-hidden="true">{face}</span>
            <span className="pn">{Typography.curl(Words.upper(x.name))}</span></>;
          return <li key={x.id} data-subject={x.id} className={`${x.kind}${x.danger ? ' danger' : ''}`}>
            {into ? <Act.View choice={into} draw={draw} quiet className="portrait">{body}</Act.View>
              : <span className="portrait still">{body}</span>}</li>;
        })}
        {more > 0 && <li><button type="button" className="portrait more" data-action="explore"
          onClick={() => app.explore('here')}>{`+${more}`}</button></li>}
      </ul>
    );
  }
  // Whether the company stands in the open country, where the world map is the surface.
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
    return <div className="board-surface"><BoardField.View region={screen.region!} chosen={chosen} choose={pick}
      face={screen.party[0]?.face?.src} /></div>;
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
    const danger = (app.menu.scene?.subjects ?? []).some(x => x.danger);
    return (
      <section className="hex-card" data-id={screen.place.id} aria-live="polite">
        <p className="label">Where you are</p>
        <h2 className="to">{Typography.curl(Words.upper(name))}</h2>
        {land.here !== undefined && <p className="how">{Typography.curl(Words.upper(MapView.ground(land, land.here,
          screen.region)))}</p>}
        {g?.sight && <p className="sight">{Typography.curl(g.sight.text)}</p>}
        {danger && <p className="about danger">Something here is dangerous.</p>}
        {people > 0 && <p className="about">{people === 1 ? 'Someone is here.' : 'There are people here.'}</p>}
        <button type="button" className="enter" data-action="enter-hex" onClick={enter}>
          Enter {Typography.curl(name.replace(/^the /, ''))}</button>
        <p className="how">Choose a hex on the map to see what is known of it, and the way there.</p>
      </section>
    );
  }
  // A town chosen on the map: seen whole, how far and by what way, and entered by one large button (the owner,
  // 4 November evening: from the world map a town is entered, from a card over it).
  static Town({ app, screen, town, clear }: { app: ReaderApp; screen: Screen;
    town: NonNullable<Screen['region']>['areas'][number]; clear?: () => void }) {
    const { d, here, go } = MapView.way(screen, town.id), views = Scenery.views.settlement ?? [];
    const view = views.length ? views[Scenery.hash(town.id) % views.length] : undefined;
    return (
      <section className="enter-card" data-id={town.id} aria-live="polite">
        {view && <div className="enter-view"><PlaceStage.Country view={view} /></div>}
        <p className="label">{town.visited ? 'A town you know' : 'A town'}</p>
        <h2 className="to">{Typography.curl(town.name)}</h2>
        <p className="how">{here ? 'You are here.' : d ? `${Words.upper(Words.span(d.minutes))} by the ways you know. `
          + MapView.arrival(screen, d.minutes) : go ? 'Across the country you can see.' : 'You know no way there yet.'}</p>
        {(here || go) && <button type="button" className="enter" data-action={here ? 'enter-hex' : 'enter'}
          onClick={() => { if (here) { app.outdoor(false); } else { app.choose(go!); } }}>
          Enter {Typography.curl(town.name)}</button>}
        {clear ? <button type="button" className="option quiet" data-action="unchoose" onClick={clear}>Back</button>
          : <p className="how">Choose a hex on the map to see what is known of it, and the way there.</p>}
      </section>
    );
  }
}
