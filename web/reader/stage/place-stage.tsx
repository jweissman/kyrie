import { Fragment } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Bearings, type Side } from '../../../src/ui/bearings';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Told } from './told';

// A door: the way out of a place on one side of it, with what can be done at it (go; open it first; pick its lock).
export interface Door { exit: ExitRow; side: Side; choices: Choice[]; far: boolean }

// Standing somewhere. The place is a walled field, and its ways out go through its walls on the side they lie: the
// shrine to the east, the road north. In it, its name, what it is, what just happened, and who is here, each as a
// painting with what they are doing; the things that might be looked at; and along its foot the animals, whoever is
// with you, yourself, and what you might look at rather than do. On a phone the walls fall away and the ways are a
// list, by the side they leave from.
export class PlaceStage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, frame = s.frame!, screen = frame.screen, scene = app.menu.scene!, draw = Act.draw(app);
    const doors = PlaceStage.doors(screen, [...scene.near, ...scene.far]);
    const people = scene.subjects.filter(x => x.kind === 'person'), creatures = scene.subjects.filter(x => x.kind === 'creature');
    const things = scene.subjects.filter(x => x.kind === 'thing');
    return (
      <div className={`field${PlaceStage.tall(doors) ? ' n-tall' : ''}`} id="page">
        <Stage.Status frame={frame} />
        <h1 className="place" data-id="place">{Typography.curl(Words.upper(screen.place.name))}</h1>
        <Told.Place app={app} />
        {creatures.length > 0 && <section className="threats" aria-label="Danger">
          {creatures.map(c => <PlaceStage.Threat key={c.id} subject={c} draw={draw} />)}</section>}
        {people.length > 0 && <section className={`cast${people.length <= 2 ? ' few' : ''}`} aria-label="Here">
          {people.map(p => <PlaceStage.Figure key={p.id} subject={p} draw={draw} />)}</section>}
        {things.length > 0 && <section className="things" aria-label="To look at">
          <p className="label">To look at</p>
          <ul>{things.map(t => <li key={t.id}><PlaceStage.Look subject={t} draw={draw} /></li>)}</ul>
        </section>}
        <PlaceStage.Doors doors={doors} draw={draw} />
        <PlaceStage.Foot app={app} draw={draw} />
      </div>
    );
  }
  // A door in the north wall that says more than where it goes (by what way, how long; a trap to look at first)
  // stands taller above the field than the field's margin allows, and the field makes room.
  static tall(doors: Door[]): boolean {
    return doors.some(d => d.side === 'n' && (d.choices.length > 1 || d.far));
  }
  // Each way's choices with the way they go through and the side it leaves by; a side's doors in the order they lie.
  static doors(screen: Screen, ways: Choice[]): Door[] {
    const sides = Bearings.of(screen), order: Side[] = ['n', 'w', 'e', 's'];
    return screen.exits.map(exit => ({ exit, side: sides.get(exit.id) ?? 's',
      choices: ways.filter(c => c.id === exit.id || c.id.startsWith(`${exit.id}/`)),
      far: ways.some(c => (c.id === exit.id || c.id.startsWith(`${exit.id}/`)) && ((c.minutes ?? 0) > 10)) }))
      .filter(d => d.choices.length).sort((a, b) => order.indexOf(a.side) - order.indexOf(b.side));
  }
  static Doors({ doors, draw }: { doors: Door[]; draw: Draw }) {
    const nth = new Map<Side, number>(), count = new Map<Side, number>(), named = new Map<string, number>();
    for (const d of doors) {
      count.set(d.side, (count.get(d.side) ?? 0) + 1);
      named.set(d.exit.destination.name, (named.get(d.exit.destination.name) ?? 0) + 1);
    }
    return (
      <nav className="doors" aria-label="Ways out">
        {doors.map(d => {
          const i = nth.get(d.side) ?? 0;
          nth.set(d.side, i + 1);
          const at = `${Math.round(((i + 1) / (count.get(d.side)! + 1)) * 100)}%`;
          return <PlaceStage.DoorView key={d.exit.id} door={d} at={at} draw={draw}
            twin={named.get(d.exit.destination.name)! > 1} />;
        })}
      </nav>
    );
  }
  static readonly arrows: Record<Side, [string, string]> = { n: ['↑', '↑'], s: ['↓', '↓'], w: ['←', '⟵'], e: ['→', '⟶'] };
  // A way across the country says by what way and how long; a way about the place says nothing but where, unless
  // two go to the same place.
  // A door that cannot simply be gone through (a trap on the way, a lock) is named for where it goes, and under that,
  // each thing that might be tried at it.
  static DoorView({ door, at, draw, twin }: { door: Door; at: string; draw: Draw; twin: boolean }) {
    const [first, ...rest] = door.choices, exit = door.exit, tried = / — /.test(first!.label);
    // Where something is in the way, the door's name does the first thing to try at it, and says so.
    const note = [door.far || twin ? exit.way : '', tried ? PlaceStage.also(first!.label) : first!.note]
      .filter(Boolean).join(' · ');
    const head = <>
      <span className="arrow" aria-hidden="true">{PlaceStage.arrows[door.side][door.far ? 1 : 0]}</span>
      <span className="to">{Typography.curl(Words.upper(exit.destination.name))}</span>
      {note && <small>{Typography.curl(note)}</small>}
    </>;
    return (
      <div className={`door side-${door.side}${door.far ? ' far' : ''}`} style={{ ['--at' as string]: at }}
        data-exit={exit.id}>
        <Act.View choice={first!} draw={draw} className="door-act">{head}</Act.View>
        <PlaceStage.Opened choice={first!} draw={draw} />
        {rest.map(c => <Fragment key={c.id}><Act.View choice={c} draw={draw} className="door-also">
          {Typography.curl(PlaceStage.also(c.label))}{c.disabled && <small className="why"> · {c.disabled}</small>}
        </Act.View><PlaceStage.Opened choice={c} draw={draw} /></Fragment>)}
      </div>
    );
  }
  private static also(label: string): string { return / — (.+)$/.exec(label)?.[1] ?? label; }
  // How someone with the company is, if they are hurt ("badly hurt"); nothing if they are not.
  private static hurt(screen: Screen, name: string): string | undefined {
    const m = screen.party.slice(1).find(p => p.name === Words.short(name));
    return m && m.hp < m.maxHp ? Words.hurt(m.hp, m.maxHp) : undefined;
  }
  // What a thing on the way opens to, once opened (looking at the switch: looking closer, prodding it), under it.
  static Opened({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    return c.children && draw.open.has(c.id) ? <Act.List choices={c.children} draw={draw} className="column door-opened" />
      : null;
  }
  // Someone here: their painting, their name and what they are, and what they are doing; the whole of it is the way
  // to speak with them. Someone who will not speak (angry, asleep) shows what can still be done with them. One with no
  // likeness that fits (a band of goblins) is a card with their name, not an empty frame.
  static Figure({ subject: p, draw }: { subject: SceneSubject; draw: Draw }) {
    const talk = p.choices.find(c => c.id.endsWith('#talk'));
    const face = <>
      {p.portrait && <img src={p.portrait.src} alt="" loading="lazy" decoding="async"
        style={{ objectPosition: `50% ${p.portrait.focus}%` }} />}
      <span className="n">{Typography.curl(Words.upper(p.name))}</span>
      {p.note && <span className="r">{Typography.curl(p.note)}</span>}
    </>;
    return (
      <figure className={`fig${p.portrait ? '' : ' unpainted'}${p.state ? ` ${p.state}` : ''}`} data-subject={p.id}>
        {talk ? <Act.View choice={talk} draw={draw} className="fig-act">{face}</Act.View> : <div className="fig-act">{face}</div>}
        {p.says?.[0] && <figcaption>{Typography.curl(p.says[0])}</figcaption>}
        {p.state && <figcaption className="state">{p.state === 'dead' ? 'Dead.' : 'Down.'}</figcaption>}
        {!talk && p.choices.length > 0 && <Act.List choices={p.choices} draw={draw} className="small" />}
      </figure>
    );
  }
  // Something that could be fought: what it is, how a fight would go, and what can be done about it, all at once.
  static Threat({ subject: c, draw }: { subject: SceneSubject; draw: Draw }) {
    return (
      <div className="threat" data-subject={c.id}>
        <p className="n">{Typography.curl(Words.upper(c.name))}{c.note && <span className="r"> · {Typography.curl(c.note)}</span>}</p>
        {c.says?.[0] && <p className="d">{Typography.curl(c.says[0])}</p>}
        {c.danger && <p className="danger">{c.danger}</p>}
        <Act.List choices={c.choices} draw={draw} />
      </div>
    );
  }
  static Look({ subject: t, draw }: { subject: SceneSubject; draw: Draw }) {
    const look = t.choices[0]!;
    return (
      <Act.View choice={look} draw={draw} className="look">
        <span className="n">{Typography.curl(Words.upper(t.name))}</span>
        {t.note && <small>{Typography.curl(t.note)}</small>}
      </Act.View>
    );
  }
  // Along the foot: the animals and whoever is with you, each with what can be done with them and how they are if
  // hurt; then yourself, and the company's light where it matters (somewhere unlit, or while something burns).
  static Foot({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, screen = app.state.frame!.screen, me = screen.party[0];
    const by = scene.subjects.filter(x => ['animal', 'companion'].includes(x.kind));
    return (
      <footer className="foot">
        {by.length > 0 && <ul className="by">{by.map(x => <li key={x.id} data-subject={x.id}>
          <span><b>{Typography.curl(Words.short(x.name))}</b>{x.note && `, ${Typography.curl(x.note)}`}
            {PlaceStage.hurt(screen, x.name) && <span className="hurt"> · {PlaceStage.hurt(screen, x.name)}</span>}</span>
          <Act.List choices={x.choices} draw={draw} className="small" />
        </li>)}</ul>}
        <div className="self" data-region="party">
          {me && <p className="me"><b>{me.name}</b> · <span className={me.hp < me.maxHp ? 'hurt' : undefined}>
            {Words.hurt(me.hp, me.maxHp)}</span>{me.conditions.length > 0 && ` · ${[...new Set(me.conditions)].join(', ').toLowerCase()}`}
            {screen.expedition.hungry && <span className="hurt"> · hungry</span>}
            {screen.expedition.weary && <span className="hurt"> · weary</span>}
            {' · '}<span data-id="purse">{screen.purse.coin} coin</span></p>}
          {screen.expedition.light && <p className="light" data-id="light">{screen.expedition.light}</p>}
          <Act.List choices={scene.you} draw={draw} className="small" />
          <Act.Sheets app={app} />
        </div>
      </footer>
    );
  }
}
