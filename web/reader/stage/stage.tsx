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
import { Held } from './held';

export type Mode = 'explore' | 'talk' | 'examine' | 'road' | 'combat' | 'book' | 'fallen';

// Play, one composition at a time, chosen by what the player is attending to: a place (the page of it, with who and
// what is there and the ways out), a road (the line across the country), someone spoken with (their painting when
// one fits, and the conversation), one thing looked at (the thing set large), a fight (the two sides and what just
// passed between them), or a book (the character, notes, the pack, the map, the story). Every one is on the same
// white page; the dark, the night and the deep are told, not painted over it. Nothing stands across any of them but
// the book in the corner, which opens the books (the owner's interim report: a bar of utilities across every page,
// a conversation's too, had made play a web application).
export class Stage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, menu = app.menu, mode = Stage.mode(app), frame = s.frame!;
    return (
      <div className={`stage mode-${mode}`} data-mode={Stage.inspected(app, mode)} aria-busy={s.pending ? true : undefined}>
        {['explore', 'road', 'talk', 'examine'].includes(mode) && <Stage.Corner app={app} />}
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
    const s = app.state, frame = s.frame!, menu = app.menu, held = Held.page(frame);
    if (held) { return held; }
    if (s.view !== 'here') { return 'book'; }
    if (s.attention.kind === 'person' && menu.talk) { return 'talk'; }
    if (s.attention.kind === 'thing' && menu.examined) { return 'examine'; }
    return Routes.of(frame.screen) ? 'road' : 'explore';
  }
  // Whether the map is open over everything (not a fight, or the end, come over it): then the keys are the map's, and
  // what would be said over the page is said over the map.
  static mapped(app: ReaderApp): boolean {
    return app.state.view === 'map' && !!app.state.frame && Stage.mode(app) === 'book';
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
    const s = frame.screen, part = FictionalTime.part(s.elapsed);
    return [Words.upper(part), Words.sky(part, s.weather), s.date?.short ?? ''].filter(Boolean);
  }
  // Where and when, said once and quietly under the heading of what is before you: "Bretheltaure, Galadhtaure ·
  // Morning, fair, 24 Wolfmoon". Its mark is the light of the hour: the morning's, the afternoon's, the evening's, or
  // none at night.
  static When({ frame, extra }: { frame: Frame; extra?: string }) {
    // From the nearest to the widest, none said twice (the market-place of a town says the town).
    const [country, ...within] = Stage.where(frame), all = [...extra ? [extra] : [], ...within.toReversed(), country!];
    const where = all.filter((w, i) => w && !all.slice(0, i).some(o => o.toLowerCase().includes(w.toLowerCase())));
    return (
      <p className={`when light-${FictionalTime.part(frame.screen.elapsed)}`} data-id="clock">
        <span className="at">{Typography.curl(where.join(', '))}</span>
        <span className="hour">{Stage.when(frame).join(', ')}</span>
      </p>
    );
  }
  // The book in the corner: yourself, the notes, the pack, the map and the story, opened from one control that stands
  // quiet in the corner of every page until it is wanted (and by their keys: C, J, I, M, H).
  static Corner({ app }: { app: ReaderApp }) {
    return (
      <button type="button" className="corner" data-action="book" onClick={() => app.show('journal')}
        aria-label="Your book: yourself, your notes, your pack, the map and the story so far">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3.5 5.2C5.9 4.2 8.6 4.3 11 5.6v13.6
          c-2.4-1.2-5.1-1.3-7.5-.3V5.2zm17 0v13.7c-2.4-1-5.1-.9-7.5.3V5.6c2.4-1.3 5.1-1.4 7.5-.4z" /></svg>
        <span className="corner-label">Book</span>
      </button>
    );
  }
  // Yourself, at a glance: how you are, what ails you, what you have to spend and to eat, and your light if it matters.
  // How you are and what you have, and under it what being down means for whoever is: it had been only in the Book,
  // while the page offered to strip the one lying senseless of their bow and their mail (the cold evaluation).
  static Me({ screen }: { screen: Screen }) {
    const me = screen.party[0];
    if (!me) { return null; }
    return <>
      <p className="me">{me.portrait && <img className="face" src={me.portrait.src} alt="" decoding="async"
        style={{ objectPosition: `50% ${me.portrait.focus}%` }} />}<b>{me.name}</b>
        <span className={me.hp < me.maxHp ? 'hurt' : undefined}>{Words.hurt(me.hp, me.maxHp)}</span>
        {[...new Set(me.conditions)].map(c => <span key={c} className="hurt">{c.toLowerCase()}</span>)}
        {screen.expedition.hungry && <span className="hurt">hungry</span>}
        {screen.expedition.weary && <span className="hurt">weary</span>}
        <span data-id="purse">{screen.purse.coin} coin</span>
        <span>{screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}</span>
        {screen.expedition.light && <span className="light" data-id="light">{Typography.curl(screen.expedition.light)}</span>}
      </p>
      {screen.party.filter(m => m.fallen).map(m => <p key={m.id} className="fallen" data-id="fallen">
        <b>{Typography.curl(m.name)}</b> {Typography.curl(m.fallen!.replace(/^(\w+): /, (_, how: string) => `is ${how.toLowerCase()}: `))}</p>)}
    </>;
  }
}
