import { Fragment } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Told } from './told';

// A way out of a place, with every choice that goes by it (go; open it first; look at what is on it).
export interface Way { exit: ExitRow; choices: Choice[] }

// Standing somewhere. The place is a page to read: where you are, what it is, what has just happened in it, and who
// is about, each named in the telling where they are doing what they do. Under the telling, what is here to attend
// to, a line each and never a wall of tiles: danger first, then the people, the animals, the things to look at, and
// whoever is with you. Then the ways about the place, in a line, and the roads out of it, each said as a route. At
// the foot, yourself.
export class PlaceStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, scene = app.menu.scene!, draw = Act.draw(app);
    const of = (kind: SceneSubject['kind']) => scene.subjects.filter(x => x.kind === kind && !PlaceStage.danger(x));
    return (
      <article className="page place-page" id="page">
        <Stage.Running frame={frame} />
        <Told.Place app={app} />
        {scene.subjects.filter(PlaceStage.danger).map(c => <PlaceStage.Threat key={c.id} subject={c} draw={draw} />)}
        <section className="here" aria-label="Here">
          <PlaceStage.Line label="People here" subjects={of('person')} draw={draw} />
          <PlaceStage.Line label="Animals" subjects={of('animal')} draw={draw} />
          <PlaceStage.Line label="To look at" subjects={of('thing')} draw={draw} />
          <PlaceStage.Line label="With you" subjects={of('companion')} draw={draw} />
        </section>
        <PlaceStage.Ways screen={screen} near={scene.near} far={scene.far} draw={draw} />
        <PlaceStage.Destinations app={app} draw={draw} />
        <PlaceStage.Foot app={app} draw={draw} />
      </article>
    );
  }
  // One kind of thing here, in a line: each by name with what it is, and the way into it (speaking with them,
  // looking at it); one with nothing to be said to it shows what can be done with it instead.
  static Line({ label, subjects, draw }: { label: string; subjects: SceneSubject[]; draw: Draw }) {
    if (!subjects.length) { return null; }
    return (
      <div className="line-of" data-line={label}>
        <p className="label">{label}</p>
        <ul className="names">{subjects.map(s => <li key={s.id} data-subject={s.id}><PlaceStage.Name subject={s}
          draw={draw} /></li>)}</ul>
      </div>
    );
  }
  static Name({ subject: s, draw }: { subject: SceneSubject; draw: Draw }) {
    const into = s.choices.find(c => /#(talk|look)$/.test(c.id)) ?? (s.choices.length === 1 ? s.choices[0] : undefined);
    const name = <><span className="n">{Typography.curl(Words.upper(s.name))}</span>
      {s.note && <span className="r">{Typography.curl(s.note)}</span>}
      {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}</>;
    const rest = s.choices.filter(c => c !== into);
    return <>
      {into ? <Act.View choice={into} draw={draw} className="name">{name}{!into.id.includes('#')
        && <span className="r">{Typography.curl(into.label)}</span>}</Act.View> : <span className="name still">{name}</span>}
      {rest.length > 0 && <Act.List choices={rest} draw={draw} className="small" />}
    </>;
  }
  // What could be fought: a creature, or anyone the company reckons a fight with (a band of goblins who can also be
  // talked to), but never someone travelling with it.
  static danger(this: void, s: SceneSubject): boolean {
    return s.kind !== 'companion' && (s.kind === 'creature' || !!s.danger);
  }
  // Something that could be fought: what it is, how a fight would go as the company reckons it, and every way of
  // meeting it, at once and before anything is done.
  static Threat({ subject: c, draw }: { subject: SceneSubject; draw: Draw }) {
    return (
      <section className="threat" data-subject={c.id} aria-label={`Danger: ${c.name}`}>
        <p className="label">Danger</p>
        <p className="n">{Typography.curl(Words.upper(c.name))}{c.note && <span className="r"> · {Typography.curl(c.note)}</span>}</p>
        {c.says?.[0] && <p className="d">{Typography.curl(c.says[0])}</p>}
        {c.danger && <p className="reckoning">{Typography.curl(c.danger)}</p>}
        <Act.List choices={c.choices} draw={draw} />
      </section>
    );
  }
  // Each way's choices, in the order the place lists its ways: the way itself, then whatever can be done at it.
  static ways(screen: Screen, choices: Choice[]): Way[] {
    return screen.exits.map(exit => ({ exit, choices: choices.filter(c => c.id === exit.id || c.id.startsWith(`${exit.id}/`)) }))
      .filter(w => w.choices.length);
  }
  // The ways about the place, in a line; the roads out, each a route: where it goes, by what way, how long, and
  // whether the company has been there.
  static Ways({ screen, near, far, draw }: { screen: Screen; near: Choice[]; far: Choice[]; draw: Draw }) {
    const about = PlaceStage.ways(screen, near), out = PlaceStage.ways(screen, far);
    const across = far.filter(c => !out.some(w => w.choices.includes(c)));
    const scope = screen.path.filter(p => p.kind === 'settlement' || p.kind === 'site').at(-1)?.name;
    return <>
      {about.length > 0 && <nav className="ways about" aria-label="Ways about the place">
        <p className="label">{scope ? `About ${Typography.curl(scope)}` : 'Ways'}</p>
        <ul className="names">{about.map(w => <li key={w.exit.id} data-exit={w.exit.id}>
          <PlaceStage.Near way={w} draw={draw} twin={about.filter(o => o.exit.destination.name
            === w.exit.destination.name).length > 1} /></li>)}</ul>
      </nav>}
      {(out.length > 0 || across.length > 0) && <nav className="ways out" aria-label="Roads out">
        <p className="label">Roads out</p>
        <ul className="routes">{out.map(w => <li key={w.exit.id} data-exit={w.exit.id}><PlaceStage.Route way={w}
          draw={draw} /></li>)}
        {across.map(c => <li key={c.id}><Act.View choice={c} draw={draw} className="route" /></li>)}</ul>
      </nav>}
    </>;
  }
  static Near({ way, draw, twin }: { way: Way; draw: Draw; twin: boolean }) {
    const [go, ...also] = way.choices, exit = way.exit;
    return <>
      <Act.View choice={go!} draw={draw} className="name way">
        <span className="n">{Typography.curl(Words.upper(PlaceStage.to(go!, exit)))}</span>
        {(twin || go!.note) && <span className="r">{Typography.curl([twin ? exit.way : '', go!.note].filter(Boolean).join(' · '))}</span>}
      </Act.View>
      <PlaceStage.Opened choice={go!} draw={draw} />
      {also.map(c => <Fragment key={c.id}><Act.View choice={c} draw={draw} className="small also">
        {Typography.curl(PlaceStage.also(c.label))}</Act.View><PlaceStage.Opened choice={c} draw={draw} /></Fragment>)}
    </>;
  }
  // A road out as a route: "The foot of Wulfecg — by the track up onto Wulfecg · 40m · been". Only a road already
  // travelled says so: at first every road is new, and saying so of each says nothing.
  static Route({ way, draw }: { way: Way; draw: Draw }) {
    const [go, ...also] = way.choices, exit = way.exit;
    const been = exit.visited ? 'been' : '';
    return <>
      <Act.View choice={go!} draw={draw} className="route">
        <span className="n">{Typography.curl(Words.upper(PlaceStage.to(go!, exit)))}</span>
        <span className="r">{Typography.curl([exit.way ? `by ${exit.way}` : '', go!.note, been].filter(Boolean).join(' · '))}</span>
      </Act.View>
      <PlaceStage.Opened choice={go!} draw={draw} />
      {also.map(c => <Fragment key={c.id}><Act.View choice={c} draw={draw} className="small also">
        {Typography.curl(PlaceStage.also(c.label))}</Act.View><PlaceStage.Opened choice={c} draw={draw} /></Fragment>)}
    </>;
  }
  // The places the company knows the way to, further than a step: each opens to the way it goes, leg by leg and how
  // long, and setting out on it. On the way, the journey stops for whatever wants a decision.
  static Destinations({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const choices = app.menu.destinations ?? [], screen = app.state.frame!.screen;
    if (!choices.length) { return null; }
    return (
      <nav className="ways destinations" aria-label="Set out for">
        <p className="label">Set out for</p>
        <ul className="routes">{choices.map(c => {
          const d = screen.destinations!.find(x => `dest:${x.id}` === c.id)!, open = draw.open.has(c.id);
          return <li key={c.id}>
            <Act.View choice={c} draw={draw} className="route">
              <span className="n">{Typography.curl(Words.upper(d.name))}</span>
              <span className="r">{d.legs.length} legs · {Words.span(d.minutes)}</span></Act.View>
            {open && <div className="itinerary">
              <ol>{d.legs.map((l, i) => <li key={i}>{Typography.curl(`By ${l.way} to ${l.to}`)}
                <span className="note">{Words.span(l.minutes)}</span></li>)}</ol>
              <p className="how">Each leg is walked as it comes; the journey stops for anything that wants you.</p>
              <Act.List choices={c.children ?? []} draw={draw} />
            </div>}
          </li>;
        })}</ul>
      </nav>
    );
  }
  // Where a way goes, as the choice says it ("Into the Wooden Wolf"), or the place it leads to.
  private static to(c: Choice, exit: ExitRow): string {
    const said = c.label.replace(/ — .*$/, '');
    return /^(To|Into|Out|Up|Down|Back|Across|Over|Through|Along) /.test(said) ? said : exit.destination.name;
  }
  private static also(label: string): string { return / — (.+)$/.exec(label)?.[1] ?? label; }
  // What a way or a thing opens, once opened, under it.
  static Opened({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    return c.children && draw.open.has(c.id) ? <Act.List choices={c.children} draw={draw} className="column unfolded" />
      : null;
  }
  // How someone with the company is, if they are hurt; nothing if they are not.
  static hurt(screen: Screen, name: string): string | undefined {
    const m = screen.party.slice(1).find(p => p.name === Words.short(name));
    return m && m.hp < m.maxHp ? Words.hurt(m.hp, m.maxHp) : undefined;
  }
  // At the foot: yourself, how you are and what you have, the company's light where it matters, what you can do of
  // yourself, and the books (yourself, your notes, the pack, the map, the story so far).
  static Foot({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, screen = app.state.frame!.screen, me = screen.party[0];
    return (
      <footer className="foot" data-region="party">
        {me && <p className="me"><b>{me.name}</b>{' · '}<span className={me.hp < me.maxHp ? 'hurt' : undefined}>
          {Words.hurt(me.hp, me.maxHp)}</span>
          {me.conditions.length > 0 && <span className="hurt"> · {[...new Set(me.conditions)].join(', ').toLowerCase()}</span>}
          {screen.expedition.hungry && <span className="hurt"> · hungry</span>}
          {screen.expedition.weary && <span className="hurt"> · weary</span>}
          {' · '}<span data-id="purse">{screen.purse.coin} coin</span>
          {' · '}{screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}</p>}
        {screen.expedition.light && <p className="light" data-id="light">{Typography.curl(screen.expedition.light)}</p>}
        <Act.List choices={scene.you} draw={draw} className="small" />
        <Act.Sheets app={app} />
      </footer>
    );
  }
}
