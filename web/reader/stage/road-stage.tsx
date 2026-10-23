import type { Choice } from '../../../src/ui/choice-list';
import type { Route } from '../../../src/ui/route';
import type { ExitRow } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { PlaceStage } from './place-stage';
import { Stage } from './stage';
import { Told } from './told';

// On a road. Not a room: a line across the country between two places, with the country it crosses in bands (fen,
// woods, a ford) and the tracks that leave it; what the way was like and what is by the road; and at the foot, the
// two ways on, large, with stopping between them.
export class RoadStage {
  static View({ app, route }: { app: ReaderApp; route: Route }) {
    const s = app.state, frame = s.frame!, scene = app.menu.scene!, draw = Act.draw(app);
    const ways = [...scene.near, ...scene.far], by = scene.subjects;
    return (
      <div className="road" id="page">
        <Stage.Status frame={frame} extra="On the road" />
        <h1 className="place sr" data-id="place">{Typography.curl(Words.upper(frame.screen.place.name))}</h1>
        <RoadStage.Strip route={route} draw={draw} ways={ways} />
        <div className="onroad">
          <div className="told"><Told.Place app={app} /></div>
          <aside className="by-the-road">
            {by.length > 0 && <p className="label">By the road</p>}
            {by.map(x => <div key={x.id} className="by" data-subject={x.id}>
              {x.kind === 'thing' ? <PlaceStage.Look subject={x} draw={draw} />
                : <p className="n">{Typography.curl(Words.upper(x.name))}{x.note && <small> · {Typography.curl(x.note)}</small>}</p>}
              {x.says?.[0] && <p className="d">{Typography.curl(x.says[0])}</p>}
              {x.danger && <p className="danger">{x.danger}</p>}
              {x.kind !== 'thing' && <Act.List choices={x.choices} draw={draw} className="small" />}
            </div>)}
            <PlaceStage.Foot app={app} draw={draw} />
          </aside>
        </div>
        <nav className="onward" aria-label="Ways on">
          <RoadStage.End choices={RoadStage.choices(ways, route.from)} exit={route.from} draw={draw} back />
          <RoadStage.End choices={RoadStage.choices(ways, route.to)} exit={route.to} draw={draw} />
        </nav>
      </div>
    );
  }
  static choices(ways: Choice[], e: ExitRow): Choice[] {
    return ways.filter(c => c.id === e.id || c.id.startsWith(`${e.id}/`));
  }
  static readonly covers: Record<string, string> = { ',': 'fen', '.': 'open', w: 'wood', h: 'heath', f: 'fell',
    p: 'peak', '~': 'shore', o: 'lake', r: 'ford' };
  // The road from end to end, in the country it crosses; the tracks off it above and below.
  static Strip({ route, draw, ways }: { route: Route; draw: Draw; ways: Choice[] }) {
    const bands = route.bands.filter((b, i) => i === 0 || b.label !== route.bands[i - 1]!.label || b.to - b.from > 0.05);
    return (
      <div className="strip" aria-hidden="false">
        <p className="end from">{Typography.curl(route.from.destination.name)}</p>
        <p className="end to">{Typography.curl(route.to.destination.name)}</p>
        <div className="line">
          {bands.map((b, i) => <span key={i} className={`band c-${RoadStage.covers[b.cover] ?? 'open'}`}
            style={{ left: `${b.from * 100}%`, width: `${(b.to - b.from) * 100}%` }}>
            {b.to - b.from > 0.12 && <em>{b.label}</em>}</span>)}
          <span className="you" style={{ left: '50%' }} aria-label="You are here" />
        </div>
        {route.branches.length > 0 && <ul className="branches">{route.branches.flatMap(e => RoadStage.choices(ways, e)
          .slice(0, 1).map(c => <li key={c.id}><Act.View choice={c} draw={draw} className="branch">
            ↗ {Typography.curl(e.destination.name)}{c.note && <small> · {c.note}</small>}</Act.View></li>))}</ul>}
      </div>
    );
  }
  static End({ choices, exit, draw, back }: { choices: Choice[]; exit: ExitRow; draw: Draw; back?: boolean }) {
    const [go, ...rest] = choices;
    if (!go) { return null; }
    return (
      <div className={`end-way${back ? ' back' : ''}`}>
        <small>{[exit.way, go.note].filter(Boolean).join(' · ')}</small>
        <Act.View choice={go} draw={draw} className="onward-act">
          {back ? '← ' : ''}{Typography.curl(exit.destination.name)}{back ? '' : ' →'}</Act.View>
        {rest.map(c => <Act.View key={c.id} choice={c} draw={draw} className="door-also" />)}
      </div>
    );
  }
}
