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
      <div className="field" id="page">
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
  static DoorView({ door, at, draw, twin }: { door: Door; at: string; draw: Draw; twin: boolean }) {
    const [first, ...rest] = door.choices, exit = door.exit;
    const note = [door.far || twin ? exit.way : '', first!.note].filter(Boolean).join(' · ');
    return (
      <div className={`door side-${door.side}${door.far ? ' far' : ''}`} style={{ ['--at' as string]: at }}
        data-exit={exit.id}>
        <Act.View choice={first!} draw={draw} className="door-act">
          <span className="arrow" aria-hidden="true">{PlaceStage.arrows[door.side][door.far ? 1 : 0]}</span>
          <span className="to">{Typography.curl(Words.upper(PlaceStage.name(first!, exit)))}</span>
          {note && <small>{Typography.curl(note)}</small>}
        </Act.View>
        {rest.map(c => <Act.View key={c.id} choice={c} draw={draw} className="door-also">
          {Typography.curl(PlaceStage.also(c.label))}</Act.View>)}
      </div>
    );
  }
  // A door is named for where it goes; one of several tries at it, for the try ("pick the lock").
  private static name(c: Choice, exit: ExitRow): string {
    const tried = / — (.+)$/.exec(c.label);
    return tried ? `${exit.destination.name}: ${tried[1]}` : exit.destination.name;
  }
  private static also(label: string): string { return / — (.+)$/.exec(label)?.[1] ?? label; }
  // Someone here: their painting, their name and what they are, and what they are doing; the whole of it is the way
  // to speak with them.
  static Figure({ subject: p, draw }: { subject: SceneSubject; draw: Draw }) {
    const talk = p.choices.find(c => c.id.endsWith('#talk'));
    const face = <>
      {p.portrait ? <img src={p.portrait.src} alt="" loading="lazy" decoding="async"
        style={{ objectPosition: `50% ${p.portrait.focus}%` }} /> : <span className="blank" aria-hidden="true">
        {p.name.charAt(0)}</span>}
      <span className="n">{Typography.curl(p.name)}</span>
      {p.note && <span className="r">{Typography.curl(p.note)}</span>}
    </>;
    return (
      <figure className={`fig${p.state ? ` ${p.state}` : ''}`} data-subject={p.id}>
        {talk ? <Act.View choice={talk} draw={draw} className="fig-act">{face}</Act.View> : <div className="fig-act">{face}</div>}
        {p.says?.[0] && <figcaption>{Typography.curl(p.says[0])}</figcaption>}
        {p.state && <figcaption className="state">{p.state === 'dead' ? 'Dead.' : 'Down.'}</figcaption>}
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
  // Along the foot: the animals and whoever is with you, each with what can be done with them; then yourself.
  static Foot({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, screen = app.state.frame!.screen, me = screen.party[0];
    const by = scene.subjects.filter(x => ['animal', 'companion'].includes(x.kind));
    return (
      <footer className="foot">
        {by.length > 0 && <ul className="by">{by.map(x => <li key={x.id} data-subject={x.id}>
          <span><b>{Typography.curl(Words.short(x.name))}</b>{x.note && `, ${Typography.curl(x.note)}`}</span>
          <Act.List choices={x.choices} draw={draw} className="small" />
        </li>)}</ul>}
        <div className="self" data-region="party">
          {me && <p className="me"><b>{me.name}</b> · <span className={me.hp < me.maxHp ? 'hurt' : undefined}>
            {Words.hurt(me.hp, me.maxHp)}</span>{me.conditions.length > 0 && ` · ${[...new Set(me.conditions)].join(', ').toLowerCase()}`}
            {' · '}<span data-id="purse">{screen.purse.coin} coin</span></p>}
          <Act.List choices={scene.you} draw={draw} className="small" />
          <Act.Sheets app={app} />
        </div>
      </footer>
    );
  }
}
