import { Fragment } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../menu-model';
import { Scenery } from '../../../src/ui/scenery';
import { Likeness } from '../../../src/paintings/likeness';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Told } from './told';

// A way out of a place, with every choice that goes by it (go; open it first; look at what is on it).
export interface Way { exit: ExitRow; choices: Choice[] }

// Standing somewhere: a spread, held to the screen. On the left page, the place as it is told: where you are, what it
// is, and what has just happened in it. On the right, what is here to attend to, each once: danger first, then the
// people, each with what they are doing as you see them, the animals and the things to look at, and whoever is with
// you; under them, the ways about the place, and folded, the roads out and the places further off. Across the foot,
// yourself, what you can do of yourself, and the books.
export class PlaceStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, scene = app.menu.scene!, draw = Act.draw(app);
    const of = (kind: SceneSubject['kind']) => scene.subjects.filter(x => x.kind === kind && !PlaceStage.danger(x));
    const people = of('person'), small = [...of('animal'), ...of('thing')], along = of('companion');
    // A chapter opened (the game begun, a country come into) is opened as a book's is: the country on the left page,
    // the telling on the right.
    const view = frame.leaf.heading && !app.state.pending ? Scenery.of(screen) : undefined;
    return (
      <article className={`spread place-spread${view ? ' opening-spread' : ''}`} id="page">
        <Stage.Running frame={frame} app={app} />
        <div className="leaves">
        {view ? <PlaceStage.Country view={view} /> : <section className="verso" aria-label="The place">
          <div className="measure"><Told.Place app={app} /></div>
        </section>}
        <section className="recto" aria-label="Here">
          <div className="measure">
            {view && <div className="told-here"><Told.Place app={app} /></div>}
            {scene.subjects.filter(PlaceStage.danger).map(c => <PlaceStage.Threat key={c.id} subject={c} draw={draw} />)}
            {people.length > 0 && <div className="cast" data-line="People here">
              <p className="label">{people.length === 1 ? 'Someone here' : 'People here'}</p>
              <ul className="plates">{people.map(s => <li key={s.id} data-subject={s.id}>
                <PlaceStage.Plate subject={s} draw={draw} /></li>)}</ul>
            </div>}
            {small.length > 0 && <div className="also-here" data-line="To look at">
              <p className="label">{of('thing').length ? of('animal').length ? 'Animals, and things to look at'
                : 'To look at' : 'Animals'}</p>
              <ul className="chips">{small.map(s => <li key={s.id} data-subject={s.id}>
                <PlaceStage.Chip subject={s} draw={draw} /></li>)}</ul>
            </div>}
            {along.length > 0 && <div className="along" data-line="With you">
              <p className="label">With you</p>
              <ul className="chips">{along.map(s => <li key={s.id} data-subject={s.id}>
                <PlaceStage.Chip subject={s} draw={draw} /></li>)}</ul>
            </div>}
            <PlaceStage.Ways screen={screen} near={scene.near} far={scene.far} draw={draw} />
            <PlaceStage.Destinations app={app} draw={draw} />
          </div>
        </section>
        </div>
        <PlaceStage.Foot app={app} draw={draw} />
      </article>
    );
  }
  // The country a chapter opens on: a painting of it, as a plate, with its credit as far as the painting says.
  static Country({ view }: { view: string }) {
    return (
      <section className="verso plate-page" aria-hidden="true">
        <figure className="scenery">
          <img src={`paintings/large/${view}.webp`} alt="" decoding="async"
            onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} />
          <figcaption>{Likeness.credits[view] ?? 'Painter unrecorded'}</figcaption>
        </figure>
      </section>
    );
  }
  // Someone here, as one choice: their likeness when one fits, their name and what they are, and what they are doing
  // as the company sees them. Choosing them turns to them; anything else that can be done with them is beneath.
  static Plate({ subject: s, draw }: { subject: SceneSubject; draw: Draw }) {
    const into = PlaceStage.into(s), rest = s.choices.filter(c => c !== into);
    const face = s.portrait && <span className="face" aria-hidden="true"><img src={s.portrait.src} alt="" decoding="async"
      loading="lazy" style={{ objectPosition: `50% ${s.portrait.focus}%` }}
      onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></span>;
    const body = <>
      {face}
      <span className="who"><span className="n">{Typography.curl(Words.upper(s.name))}</span>
        {s.note && <span className="r">{Typography.curl(s.note)}</span>}
        {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}
        {s.says?.[0] && <span className="doing">{Typography.curl(s.says.join(' '))}</span>}</span>
    </>;
    return <>
      {into ? <Act.View choice={into} draw={draw} className={`plate${face ? ' faced' : ''}`}>{body}</Act.View>
        : <span className={`plate still${face ? ' faced' : ''}`}>{body}</span>}
      {rest.length > 0 && <Act.List choices={rest} draw={draw} className="small under" />}
    </>;
  }
  // An animal, a thing to look at or someone with the company: a name to turn to, with what it is.
  static Chip({ subject: s, draw }: { subject: SceneSubject; draw: Draw }) {
    const into = PlaceStage.into(s), rest = s.choices.filter(c => c !== into);
    const name = <><span className="n">{Typography.curl(Words.upper(s.name))}</span>
      {s.note && <span className="r">{Typography.curl(s.note)}</span>}
      {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}</>;
    return <>
      {into ? <Act.View choice={into} draw={draw} className="chip">{name}{!into.id.includes('#')
        && <span className="verb">{Typography.curl(into.label.toLowerCase())}</span>}</Act.View>
        : <span className="chip still">{name}</span>}
      {rest.length > 0 && <Act.List choices={rest} draw={draw} className="small under" />}
    </>;
  }
  private static into(s: SceneSubject): Choice | undefined {
    return s.choices.find(c => /#(talk|look)$/.test(c.id)) ?? (s.choices.length === 1 ? s.choices[0] : undefined);
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
  // The ways about the place, each a choice with where it goes; the roads out, folded where there are ways about the
  // place to take first, each a route: where it goes, by what way, how long, and whether the company has been there.
  static Ways({ screen, near, far, draw }: { screen: Screen; near: Choice[]; far: Choice[]; draw: Draw }) {
    const fold = far.find(c => c.id === MenuModel.roads), roads = fold ? fold.children ?? [] : far;
    const about = PlaceStage.ways(screen, near), out = PlaceStage.ways(screen, roads);
    const across = roads.filter(c => !out.some(w => w.choices.includes(c)));
    const scope = screen.path.filter(p => p.kind === 'settlement' || p.kind === 'site').at(-1)?.name;
    const shown = !fold || draw.open.has(fold.id);
    return <>
      {about.length > 0 && <nav className="ways about" aria-label="Ways about the place">
        <p className="label">{scope ? `About ${Typography.curl(scope)}` : 'Ways'}</p>
        <ul className="paths">{about.map(w => <li key={w.exit.id} data-exit={w.exit.id}>
          <PlaceStage.Near way={w} draw={draw} twin={about.filter(o => o.exit.destination.name
            === w.exit.destination.name).length > 1} /></li>)}</ul>
      </nav>}
      {(out.length > 0 || across.length > 0) && <nav className="ways out" aria-label="Roads out">
        {fold ? <Act.View choice={fold} draw={draw} className="fold"><span className="n">Roads out</span>
          <span className="r">{roads.length}</span></Act.View> : <p className="label">Roads out</p>}
        {shown && <ul className="routes">{out.map(w => <li key={w.exit.id} data-exit={w.exit.id}><PlaceStage.Route way={w}
          draw={draw} /></li>)}
        {across.map(c => <li key={c.id}><Act.View choice={c} draw={draw} className="route" /></li>)}</ul>}
      </nav>}
    </>;
  }
  static Near({ way, draw, twin }: { way: Way; draw: Draw; twin: boolean }) {
    const [go, ...also] = way.choices, exit = way.exit;
    return <>
      <Act.View choice={go!} draw={draw} className="path">
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
  // long, and setting out on it. On the way, the journey stops for whatever wants a decision. More than a few are
  // folded under one choice.
  static Destinations({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const shown = app.menu.destinations ?? [], screen = app.state.frame!.screen;
    const fold = shown.find(c => c.id === MenuModel.going), choices = fold ? fold.children ?? [] : shown;
    if (!choices.length) { return null; }
    return (
      <nav className="ways destinations" aria-label="Set out for">
        {fold ? <Act.View choice={fold} draw={draw} className="fold"><span className="n">Set out for</span>
          <span className="r">{choices.length} places</span></Act.View> : <p className="label">Set out for</p>}
        {(!fold || draw.open.has(fold.id)) && <ul className="routes">{choices.map(c => {
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
        })}</ul>}
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
  // Across the foot: yourself, how you are and what you have, the company's light where it matters, and what you can
  // do of yourself (wait, search, rest).
  static Foot({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, screen = app.state.frame!.screen;
    return (
      <footer className="foot" data-region="party">
        <Stage.Me screen={screen} />
        <Act.List choices={scene.you} draw={draw} className="small yours" />
      </footer>
    );
  }
}
