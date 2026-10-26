import type { Choice } from '../../../src/ui/choice-list';
import type { Route } from '../../../src/ui/route';
import type { ExitRow } from '../../../src/ui/screen-types';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { PlaceStage } from './place-stage';
import { Stage } from './stage';
import { Told } from './told';

// On a road. Not a room: a line across the country between two places, with the country it crosses in bands (fen,
// woods, a ford) and the tracks that leave it; what the way was like and what is by the road; and the two ways on,
// back and forward, with stopping between them.
export class RoadStage {
  static View({ app, route }: { app: ReaderApp; route: Route }) {
    const frame = app.state.frame!, scene = app.menu.scene!, draw = Act.draw(app);
    const ways = [...scene.near, ...scene.far];
    const of = (kind: SceneSubject['kind']) => scene.subjects.filter(x => x.kind === kind && !PlaceStage.danger(x));
    return (
      <article className="page road-page" id="page">
        <Stage.Running frame={frame} extra="On the road" />
        <RoadStage.Strip route={route} draw={draw} ways={ways} />
        <Told.Place app={app} />
        {scene.subjects.filter(PlaceStage.danger).map(c => <PlaceStage.Threat key={c.id} subject={c} draw={draw} />)}
        <section className="here" aria-label="By the road">
          <PlaceStage.Line label="By the road" subjects={of('person')} draw={draw} />
          <PlaceStage.Line label="Animals" subjects={of('animal')} draw={draw} />
          <PlaceStage.Line label="To look at" subjects={of('thing')} draw={draw} />
          <PlaceStage.Line label="With you" subjects={of('companion')} draw={draw} />
        </section>
        <nav className="onward" aria-label="Ways on">
          <RoadStage.End choices={RoadStage.choices(ways, route.from)} exit={route.from} draw={draw} back />
          <RoadStage.End choices={RoadStage.choices(ways, route.to)} exit={route.to} draw={draw} />
        </nav>
        <PlaceStage.Foot app={app} draw={draw} />
      </article>
    );
  }
  static choices(ways: Choice[], e: ExitRow): Choice[] {
    return ways.filter(c => c.id === e.id || c.id.startsWith(`${e.id}/`));
  }
  static readonly covers: Record<string, string> = { ',': 'fen', '.': 'open', w: 'wood', h: 'heath', f: 'fell',
    p: 'peak', '~': 'shore', o: 'lake', r: 'ford' };
  // The road from end to end, in the country it crosses; the tracks off it beneath.
  static Strip({ route, draw, ways }: { route: Route; draw: Draw; ways: Choice[] }) {
    const bands = route.bands.filter((b, i) => i === 0 || b.label !== route.bands[i - 1]!.label || b.to - b.from > 0.05);
    return (
      <figure className="strip" aria-label={`The road from ${route.from.destination.name} to ${route.to.destination.name}`}>
        <div className="ends"><span>{Typography.curl(Words.upper(route.from.destination.name))}</span>
          <span>{Typography.curl(Words.upper(route.to.destination.name))}</span></div>
        <div className="line">
          {bands.map((b, i) => <span key={i} className={`band c-${RoadStage.covers[b.cover] ?? 'open'}`}
            style={{ left: `${b.from * 100}%`, width: `${(b.to - b.from) * 100}%` }}>
            {b.to - b.from > 0.12 && <em>{b.label}</em>}</span>)}
          <span className="you" style={{ left: '50%' }} aria-label="You are here" />
        </div>
        {route.branches.length > 0 && <ul className="branches">{route.branches.flatMap(e => RoadStage.choices(ways, e)
          .slice(0, 1).map(c => <li key={c.id}><Act.View choice={c} draw={draw} className="branch">
            ↗ {Typography.curl(e.destination.name)}{c.note && <span className="note">{c.note}</span>}</Act.View></li>))}</ul>}
      </figure>
    );
  }
  static End({ choices, exit, draw, back }: { choices: Choice[]; exit: ExitRow; draw: Draw; back?: boolean }) {
    const [go, ...rest] = choices;
    if (!go) { return null; }
    return (
      <div className={`end-way${back ? ' back' : ''}`}>
        <Act.View choice={go} draw={draw} className="route onward-act">
          <span className="n">{back ? '‹ ' : ''}{Typography.curl(Words.upper(exit.destination.name))}{back ? '' : ' ›'}</span>
          <span className="r">{Typography.curl([exit.way, go.note].filter(Boolean).join(' · '))}</span></Act.View>
        {rest.map(c => <Act.View key={c.id} choice={c} draw={draw} className="small also" />)}
      </div>
    );
  }
}
