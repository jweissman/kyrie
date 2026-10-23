import type { Frame } from '../../engine/protocol';
import type { ReaderApp } from '../reader-app';
import { Routes } from '../../../src/ui/route';
import { FictionalTime } from '../../../src/presentation/fictional-time';
import { Words } from '../words';
import { Act } from './act';
import { PlaceStage } from './place-stage';
import { TalkStage } from './talk-stage';
import { ThingStage } from './thing-stage';
import { RoadStage } from './road-stage';
import { FightStage } from './fight-stage';
import { BookStage } from './book-stage';

export type Light = 'day' | 'indoor' | 'dusk' | 'night' | 'dark';
export type Mode = 'explore' | 'talk' | 'examine' | 'road' | 'combat' | 'book' | 'fallen';

// Play, as one stage at a time, chosen by what the player is doing: standing somewhere (the place, walled, with its
// ways out through its walls), on a road (the road as a line across the country), speaking with someone (their
// painting, and the conversation), looking at one thing (the thing, and what can be done with it), fighting (the two
// sides, and what just happened between them), or reading (notes, the story, the pack, the map). Each is lit as the
// company is: paper by day, lamp-light indoors, ink at night, and dark underground, in a fight and over a mystery.
export class Stage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, menu = app.menu, mode = Stage.mode(app);
    const light = Stage.light(frame, mode);
    return (
      <div className={`stage ${mode}`} data-mode={Stage.inspected(app, mode)} data-light={light}
        aria-busy={s.pending ? true : undefined} onPointerDown={Act.down} onPointerLeave={Act.leave.bind(null, app)}>
        <div className="intentions" data-region="choices">
          {mode === 'fallen' && <BookStage.Ending app={app} />}
          {mode === 'combat' && <FightStage.View app={app} />}
          {mode === 'book' && <BookStage.View app={app} />}
          {mode === 'talk' && menu.talk && <TalkStage.View app={app} talk={menu.talk} />}
          {mode === 'examine' && menu.examined && <ThingStage.View app={app} examined={menu.examined} />}
          {mode === 'road' && <RoadStage.View app={app} route={Routes.of(frame.screen)!} />}
          {mode === 'explore' && <PlaceStage.View app={app} />}
        </div>
      </div>
    );
  }
  static mode(app: ReaderApp): Mode {
    const s = app.state, frame = s.frame!, menu = app.menu;
    if (!frame.screen.running) { return 'fallen'; }
    if (frame.combat) { return 'combat'; }
    if (s.view !== 'here') { return 'book'; }
    if (s.attention.kind === 'person' && menu.talk) { return 'talk'; }
    if (s.attention.kind === 'thing' && menu.examined) { return 'examine'; }
    return Routes.of(frame.screen) ? 'road' : 'explore';
  }
  // What automation knows the stage as: the place and the road are both exploring; a book is what it holds.
  private static inspected(app: ReaderApp, mode: Mode): string {
    if (mode === 'road') { return 'explore'; }
    if (mode === 'book') {
      return { here: 'explore', company: 'party', pack: 'pack', journal: 'journal', map: 'map', story: 'story' }[app.state.view];
    }
    return mode;
  }
  static light(frame: Frame, mode: Mode): Light {
    const screen = frame.screen, shelter = frame.leaf.shelter;
    if (['combat', 'examine', 'fallen'].includes(mode) || screen.dark || shelter === 'underground') { return 'dark'; }
    if (shelter === 'indoors') { return screen.expedition.daylight === 'night' ? 'night' : 'indoor'; }
    return screen.expedition.daylight === 'night' ? 'night' : screen.expedition.daylight === 'evening' ? 'dusk' : 'day';
  }
  // "Faennmeós · Morning · rain · 20 Leaffall"
  static when(frame: Frame): string[] {
    const s = frame.screen;
    return [frame.title, [Words.upper(FictionalTime.part(s.elapsed)), s.weather].filter(Boolean).join(' · '),
      s.date?.short ?? ''].filter(Boolean);
  }
  static Status({ frame, extra }: { frame: Frame; extra?: string }) {
    return (
      <p className="status" data-id="clock">{Stage.when(frame).map(w => <span key={w}>{w}</span>)}
        {extra && <span>{extra}</span>}</p>
    );
  }
}
