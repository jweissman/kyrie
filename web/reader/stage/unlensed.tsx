import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Surfaces } from '../../../src/presentation/surfaces';
import { Act, type Draw } from './act';
import { Wayfinder } from './wayfinder';
import { Pastime } from './pastime';
import { PlaceMark } from './place-mark';

// The resting scene before its lenses are earned (compactification, OR-1241: "I'm not even sure we should show the
// diamond/lenses at all until act II"): nothing the lenses would have opened is out of reach, so the ways on from here
// and the time's few acts (a while, a sleep where one can be had) stand among the scene's quiet touches, the engine's
// own rows (the places lens's ways, the scene's waits), each by its words; the lens earned, they go back into it. A
// way the four lead with already is not drawn twice, and nothing here is a control of the page's own.
export class Unlensed {
  static View({ app, draw, drawn }: { app: ReaderApp; draw: Draw; drawn: (string | undefined)[] }) {
    const rail = app.state.frame?.leaf.glance?.rail;
    const ways = Surfaces.lens(rail, 'go') ? [] : Wayfinder.ways(app)
      .filter(w => !w.c.disabled && !!w.c.command && !drawn.includes(w.c.id));
    const time = Surfaces.lens(rail, 'wait') ? [] : [Pastime.wait(app), ...Pastime.sleeps(app)]
      .filter(c => !!c && !drawn.includes(c.id));
    return <>
      {ways.map(w => <Act.View key={w.c.id} choice={w.c} draw={draw} quiet
        className={`opener opens-go${w.aim === 'followed' ? ' led' : ''}`}>
        <PlaceMark.Dash app={app} to={Wayfinder.to(w)} />{Typography.curl(`To ${w.name}…`)}</Act.View>)}
      {time.map(c => c && <Act.View key={c.id} choice={c} draw={draw} quiet className="opener opens-wait">
        {Typography.curl(c.label)}</Act.View>)}
    </>;
  }
}
