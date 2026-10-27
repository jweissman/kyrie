import type { Frame } from '../../engine/protocol';
import type { Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Routes } from '../../../src/ui/route';
import { FictionalTime } from '../../../src/campaign/fictional-time';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { PlaceStage } from './place-stage';
import { TalkStage } from './talk-stage';
import { ThingStage } from './thing-stage';
import { RoadStage } from './road-stage';
import { FightStage } from './fight-stage';
import { BookStage } from './book-stage';
import { Act } from './act';

export type Mode = 'explore' | 'talk' | 'examine' | 'road' | 'combat' | 'book' | 'fallen';

// Play, one composition at a time, chosen by what the player is attending to: a place (the page of it, with who and
// what is there and the ways out), a road (the line across the country), someone spoken with (their painting when
// one fits, and the conversation), one thing looked at (the thing set large), a fight (the two sides and what just
// passed between them), or a book (the character, notes, the pack, the map, the story). Every one is on the same
// white page; the dark, the night and the deep are told, not painted over it.
export class Stage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, menu = app.menu, mode = Stage.mode(app), frame = s.frame!;
    return (
      <div className={`stage mode-${mode}`} data-mode={Stage.inspected(app, mode)} aria-busy={s.pending ? true : undefined}>
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
  // "Hillfells · Gothgiba" and "Morning · snowy · 4 Wolfmoon": where, and when.
  static where(frame: Frame): string[] {
    const named = frame.screen.path.filter(p => ['settlement', 'site', 'wilderness'].includes(p.kind)).map(p => p.name);
    return [frame.title, ...named.filter(n => n !== frame.title)].slice(0, 3);
  }
  static when(frame: Frame): string[] {
    const s = frame.screen;
    return [Words.upper(FictionalTime.part(s.elapsed)), s.weather ?? '', s.date?.short ?? ''].filter(Boolean);
  }
  // The running head: the country and what part of it, and the time, in the margin's small capitals; with the game
  // to hand, the books (yourself, the notes, the pack, the map, the story so far). Its top edge is the light of the
  // hour: the morning's, the afternoon's, the evening's, or none at night.
  static Running({ frame, extra, app }: { frame: Frame; extra?: string; app?: ReaderApp }) {
    return (
      <header className={`running light-${FictionalTime.part(frame.screen.elapsed)}`} data-id="clock">
        <span className="at">{Stage.where(frame).map(w => <span key={w}>{Typography.curl(w)}</span>)}
          {extra && <span>{Typography.curl(extra)}</span>}</span>
        <span className="when">{Stage.when(frame).map(w => <span key={w}>{w}</span>)}</span>
        {app && <Act.Sheets app={app} />}
      </header>
    );
  }
  // Yourself, at a glance: how you are, what ails you, what you have to spend and to eat, and your light if it matters.
  static Me({ screen }: { screen: Screen }) {
    const me = screen.party[0];
    if (!me) { return null; }
    return (
      <p className="me"><b>{me.name}</b>
        <span className={me.hp < me.maxHp ? 'hurt' : undefined}>{Words.hurt(me.hp, me.maxHp)}</span>
        {[...new Set(me.conditions)].map(c => <span key={c} className="hurt">{c.toLowerCase()}</span>)}
        {screen.expedition.hungry && <span className="hurt">hungry</span>}
        {screen.expedition.weary && <span className="hurt">weary</span>}
        <span data-id="purse">{screen.purse.coin} coin</span>
        <span>{screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}</span>
        {screen.expedition.light && <span className="light" data-id="light">{Typography.curl(screen.expedition.light)}</span>}
      </p>
    );
  }
}
