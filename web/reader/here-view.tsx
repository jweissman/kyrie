import type { MouseEvent, PointerEvent } from 'react';
import type { Choice, Section } from '../../src/ui/choice-list';
import type { SceneSubject } from '../../src/ui/scene';
import type { Screen } from '../../src/ui/screen-types';
import type { ReaderApp } from './reader-app';
import type { View } from './menu-model';
import { Typography } from '../../src/presentation/typography';
import { Words } from './words';

// Who and what is here, each with what can be done with it beside it; the ways about the place, and out across the
// country; and you. What a choice opens (what to say to someone, what to buy) opens beneath it, and the rest stays
// where it was. What the choice under the hand or the keys means is said at the foot, in one place.
export class HereView {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, menu = app.menu, scene = menu.scene, frame = s.frame!;
    const index = new Map(menu.choices.map((c, i) => [c.id, i]));
    const shown = menu.choices.find(c => c.id === s.hovered) ?? menu.choices[s.cursor];
    const gloss = shown ? shown.disabled ?? shown.about ?? '' : '';
    const draw = { app, index, open: new Set(s.open) };
    return (
      <div className={s.pending ? 'busy' : undefined} onPointerLeave={HereView.leave.bind(null, app)}
        onPointerDown={HereView.down}>
        {frame.combat ? <HereView.Sections sections={menu.sections} draw={draw}
          title={frame.combat.outcome ? 'The fight is over' : `${frame.combat.actorName}’s turn`} />
          : scene && <>
            {scene.subjects.length > 0 && <section aria-label="Here">
              <p className="label">Here</p>
              {scene.subjects.filter(x => x.kind !== 'companion').map(x => <HereView.Subject key={x.id} subject={x} draw={draw} />)}
            </section>}
            {scene.subjects.some(x => x.kind === 'companion') && <section aria-label="With you">
              <p className="label">With you</p>
              {scene.subjects.filter(x => x.kind === 'companion').map(x => <HereView.Subject key={x.id} subject={x} draw={draw} />)}
            </section>}
            <HereView.Ways title="Go" choices={scene.near} draw={draw} />
            <HereView.Ways title={scene.near.length ? 'Further' : 'Go'} choices={scene.far} draw={draw} far />
            <HereView.You screen={frame.screen} choices={scene.you} draw={draw} />
          </>}
        <p className="gloss" data-id="detail" aria-live="polite">{Typography.curl(gloss)}</p>
      </div>
    );
  }
  static Subject({ subject, draw }: { subject: SceneSubject; draw: Draw }) {
    return (
      <div className={`subject ${subject.kind}${subject.portrait ? ' portrayed' : ''}`} data-subject={subject.id}>
        {subject.portrait && <img className="portrait" src={subject.portrait.src} alt="" loading="lazy" decoding="async"
          title={subject.portrait.credit ? `A painting for what they do: ${subject.portrait.credit}` : 'A painting for what they do'} />}
        <div className="who">
          <p className="name">{Typography.curl(Words.upper(subject.name))}
            {subject.note && <span className="note"> · {Typography.curl(subject.note)}</span>}</p>
          {subject.danger && <p className="danger">{subject.danger}</p>}
          <HereView.Acts choices={subject.choices} draw={draw} />
        </div>
      </div>
    );
  }
  // Choices in a row; what is open, in a column beneath them.
  static Acts({ choices, draw, column }: { choices: Choice[]; draw: Draw; column?: boolean }) {
    const opened = choices.find(c => c.children && draw.open.has(c.id));
    return <>
      <ul className={`acts${column ? ' column' : ''}`}>{choices.map(c => <li key={c.id}><HereView.Act choice={c} draw={draw} /></li>)}</ul>
      {opened && <ul className="opened-list" aria-label={opened.label}>{opened.children!.map(c => <li key={c.id}>
        <HereView.Act choice={c} draw={draw} />
        {c.children && draw.open.has(c.id) && <HereView.Acts choices={c.children} draw={draw} column />}
      </li>)}</ul>}
    </>;
  }
  static Act({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    const i = draw.index.get(c.id) ?? -1, s = draw.app.state, selected = !!s.keyed && i === s.cursor;
    const classes = ['act', selected ? 'sel' : '', c.risk ? 'risk' : '', c.children ? draw.open.has(c.id) ? 'opened' : 'opens' : '']
      .filter(Boolean).join(' ');
    return (
      <button type="button" className={classes} data-action="choice" data-choice={c.id} data-index={i}
        aria-current={selected} aria-disabled={c.disabled ? true : undefined} aria-expanded={c.children ? draw.open.has(c.id) : undefined}
        onClick={HereView.click.bind(null, draw.app)} onPointerEnter={HereView.enter.bind(null, draw.app)}>
        {Typography.curl(c.label)}{c.note && !c.minutes && <span className="note"> · {c.note}</span>}
      </button>
    );
  }
  // The ways: where each goes, and how long it takes when that is more than a few steps.
  static Ways({ title, choices, draw, far }: { title: string; choices: Choice[]; draw: Draw; far?: boolean }) {
    if (!choices.length) { return null; }
    return (
      <section aria-label={title}>
        <p className="label">{title}</p>
        <ul className={`ways${far ? ' far' : ''}`}>{choices.map(c => <li key={c.id}>
          <HereView.Act choice={{ ...c, note: '' }} draw={draw} />
          {(c.note || c.disabled) && <span className="time">{c.disabled ? 'shut' : c.note}</span>}
        </li>)}</ul>
        {choices.filter(c => c.children && draw.open.has(c.id)).map(c => <HereView.Acts key={c.id}
          choices={c.children!} draw={draw} column />)}
      </section>
    );
  }
  // You: how you are, what you have, what you can do by yourself, and what you can look at (the map, your notes).
  static You({ screen, choices, draw }: { screen: Screen; choices: Choice[]; draw: Draw }) {
    const me = screen.party[0];
    const others = screen.party.slice(1).map(m => `${m.name} ${Words.hurt(m.hp, m.maxHp)}`);
    return (
      <section className="you" aria-label="You" data-region="party">
        <p className="label">You</p>
        {me && <p className="who">{me.name}</p>}
        {me && <p className="state"><span className={me.hp < me.maxHp ? 'hurt' : undefined}>{Words.hurt(me.hp, me.maxHp)}</span>
          {me.conditions.length > 0 && `, ${[...new Set(me.conditions)].join(', ').toLowerCase()}`}
          {' · '}<span data-id="purse">{screen.purse.coin} coin · {screen.purse.rations} {screen.purse.rations === 1
            ? 'ration' : 'rations'}</span>{others.length > 0 && ` · ${others.join(', ')}`}</p>}
        <HereView.Acts choices={choices} draw={draw} />
        <HereView.Sheets app={draw.app} screen={screen} />
      </section>
    );
  }
  // What can be looked at rather than done: the map, your notes, what you carry, the company, the story so far.
  static Sheets({ app, screen }: { app: ReaderApp; screen: Screen }) {
    const sheets: [View, string, string][] = [['map', 'Map', 'm'], ['journal', 'Notes', 'j'], ['pack', 'What you carry', 'i'],
      ...screen.party.length > 1 ? [['company', 'The company', 'c'] as [View, string, string]] : [],
      ['story', 'The story so far', 'h']];
    return (
      <ul className="acts sheets">{sheets.map(([view, label, key]) => <li key={view}><button type="button" className="act"
        data-action="mode" data-view={view} data-key={key} aria-pressed={app.state.view === view}
        onClick={HereView.open.bind(null, app)}>{label}</button></li>)}</ul>
    );
  }
  // In a fight, or in the pack: the lists, each under its heading.
  static Sections({ sections, draw, title }: { sections: Section[]; draw: Draw; title: string }) {
    return <>
      <p className="label">{title}</p>
      {sections.filter(sec => sec.choices.length).map(sec => <section key={sec.id} data-section={sec.id}>
        <p className="label">{Words.short(sec.title)}</p>
        <HereView.Acts choices={sec.choices} draw={draw} column />
      </section>)}
    </>;
  }
  private static click(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const i = Number(e.currentTarget.dataset.index), choice = app.menu.choices[i];
    if (choice) { app.setState({ cursor: i, keyed: false }); app.choose(choice); }
  }
  private static open(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) { app.show(e.currentTarget.dataset.view as View); }
  // A finger is not a pointer that hovers: the mouse events a browser makes up after a touch light nothing.
  private static touched = -Infinity;
  private static down(e: PointerEvent<HTMLElement>) { if (e.pointerType !== 'mouse') { HereView.touched = e.timeStamp; } }
  private static enter(app: ReaderApp, e: PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === 'mouse' && e.timeStamp - HereView.touched > 1500) { app.hover(e.currentTarget.dataset.choice); }
  }
  private static leave(app: ReaderApp, e: PointerEvent<HTMLElement>) { if (e.pointerType === 'mouse') { app.hover(undefined); } }
}
interface Draw { app: ReaderApp; index: Map<string, number>; open: Set<string> }
