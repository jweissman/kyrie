import { Fragment } from 'react';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ExitRow, Screen } from '../../../src/ui/screen-types';
import type { ReaderApp } from '../reader-app';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import { MenuModel } from '../menu-model';
import { Likeness } from '../../../src/paintings/likeness';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Told } from './told';
import { WaysPane } from './ways-pane';

// A way out of a place, with every choice that goes by it (go; open it first; look at what is on it).
export interface Way { exit: ExitRow; choices: Choice[] }

// Standing somewhere: the scene, and what can be done from it. The scene is one leaf: the place's name, what has just
// happened, the place's first paragraph, then who and what is here (whoever the company has a stake in first, and
// large; in a busy place the rest each a line), then the rest of the telling. Beside it on a desktop or a tablet held
// sideways, or at the foot of the screen held upright, the ways on and yourself (see WaysPane). A place had been two
// leaves scrolling one over the other on a tablet, a town square's eleven people and fifteen ways in rows alike (the
// owner's interim report: "sprawling link lists"; the aesthetic doctrine: "a dozen competing portrait tiles and
// thirteen exits presented as equivalent objects").
export class PlaceStage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, draw = Act.draw(app);
    // A chapter opened (the game begun, a country come into) opens on a painting of the country, as a band.
    const view = frame.leaf.heading && !app.state.pending ? Scenery.of(screen) : undefined;
    const raised = app.state.open.includes(WaysPane.sheet);
    return (
      <article className={`scene-page${view ? ' opens' : ''}${raised ? ' raised' : ''}`} id="page">
        <section className="scene" aria-label="The place">
          {view && <PlaceStage.Country view={view} />}
          <div className="measure"><div className="telling">
            <Told.Place app={app} here={<PlaceStage.Here app={app} draw={draw} />} />
          </div></div>
        </section>
        <section className="on-pane" aria-label="The ways on"><div className="measure">
          <WaysPane.View app={app} draw={draw} />
        </div></section>
      </article>
    );
  }
  // Who and what is here: danger first, then whoever the company has a stake in, large; the rest of the people as
  // plates, or in a busy place each a line (what they are doing is told when they are turned to); the animals and
  // things; whoever is with you.
  static Here({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!;
    const of = (kind: SceneSubject['kind']) => scene.subjects.filter(x => x.kind === kind && !PlaceStage.danger(x));
    const people = of('person'), small = [...of('animal'), ...of('thing')], along = of('companion');
    const busy = people.filter(s => !s.stake).length > 3;
    return (
      <div className="here">
        {scene.subjects.filter(PlaceStage.danger).map(c => <PlaceStage.Threat key={c.id} subject={c} draw={draw} />)}
        {people.length > 0 && <div className={`cast${busy ? ' busy' : ''}`} data-line="People here">
          <p className="label">{people.length === 1 ? 'Someone here' : 'People here'}</p>
          <ul className="plates">{people.map(s => <li key={s.id} data-subject={s.id}
            className={s.stake ? 'lead' : busy ? 'brief' : undefined}>
            <PlaceStage.Plate subject={s} draw={draw} brief={busy && !s.stake} /></li>)}</ul>
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
      </div>
    );
  }
  // The country a chapter opens on: a painting of it, as a band across the head of the scene, credited where the
  // painting says who painted it.
  static Country({ view }: { view: string }) {
    const credit = Likeness.credits[view];
    return (
      <figure className="scenery band" aria-hidden="true">
        <img src={`paintings/large/${view}.webp`} alt="" decoding="async"
          onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} />
        {credit && <figcaption>{credit}</figcaption>}
      </figure>
    );
  }
  // Someone here, as one choice: their likeness when one fits, their name and what they are, and what they are doing
  // as the company sees them (in brief, only their name and what they are). Choosing them turns to them; anything
  // else that can be done with them is beneath.
  static Plate({ subject: s, draw, brief }: { subject: SceneSubject; draw: Draw; brief?: boolean }) {
    const into = PlaceStage.into(s), rest = s.choices.filter(c => c !== into);
    const face = s.portrait && <span className="face" aria-hidden="true"><img src={s.portrait.src} alt="" decoding="async"
      loading="lazy" style={{ objectPosition: `50% ${s.portrait.focus}%` }}
      onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} /></span>;
    const body = <>
      {face}
      <span className="who"><span className="n">{Typography.curl(Words.upper(s.name))}</span>
        {s.note && <span className="r">{Typography.curl(s.note)}</span>}
        {s.state && <span className="r hurt">{s.state === 'dead' ? 'dead' : 'down'}</span>}
        {s.says?.[0] && !brief && <span className="doing">{Typography.curl(s.says.join(' '))}</span>}</span>
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
  // talked to), but never someone travelling with it, nor what lies dead (the spiders a fight had killed were still
  // under "Danger": play 9; the telling says they lie dead).
  static danger(this: void, s: SceneSubject): boolean {
    return s.kind !== 'companion' && s.state !== 'dead' && (s.kind === 'creature' || !!s.danger);
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
  // The ways on, each a choice that says where it goes: about the place first, then the roads out of it, each with
  // its way and how long, and whether the company has been there (only a road already travelled says so).
  static Ways({ screen, near, far, draw, around = [] }: { screen: Screen; near: Choice[]; far: Choice[]; draw: Draw;
    around?: Choice[] }) {
    const about = PlaceStage.ways(screen, near), out = PlaceStage.ways(screen, far);
    const across = far.filter(c => !out.some(w => w.choices.includes(c)));
    const scope = screen.path.filter(p => p.kind === 'settlement' || p.kind === 'site').at(-1)?.name;
    // The town's other places all by the same way are said to go by it once, not seven times (play 9).
    const by = around.length > 1 && around.every(c => c.note && c.note === around[0]!.note) ? around[0]!.note : undefined;
    return <>
      {(about.length > 0 || around.length > 0) && <nav className="ways about" aria-label="Ways about the place">
        <p className="label">{scope ? `About ${Typography.curl(scope)}` : 'Ways on'}</p>
        <ul className="options">{about.map(w => <li key={w.exit.id} data-exit={w.exit.id}
          className={[PlaceStage.wide(w.exit.destination.name) ? 'wide' : '', w.choices[0]!.disabled ? 'barred' : '',
            PlaceStage.aims(screen, w.choices[0]!)
            ? 'aimed' : ''].filter(Boolean).join(' ') || undefined}>
          <PlaceStage.Way way={w} draw={draw} twin={about.filter(o => o.exit.destination.name
            === w.exit.destination.name).length > 1} /></li>)}
        {by && <li className="way-by">{Typography.curl(Words.upper(by))}</li>}
        {around.map(c => <li key={c.id} className={PlaceStage.wide(c.label) ? 'wide' : undefined}>
          <Act.View choice={c} draw={draw} className="way by">
          <span className="n">{Typography.curl(Words.upper(c.label))}</span>
          {c.note && !by && <span className="r">{Typography.curl(c.note)}</span>}</Act.View></li>)}</ul>
      </nav>}
      {(out.length > 0 || across.length > 0) && <nav className="ways out" aria-label="Roads out">
        <p className="label">{about.length ? 'Roads out' : 'Ways on'}</p>
        <ul className="options">{out.map(w => <li key={w.exit.id} data-exit={w.exit.id}
          className={PlaceStage.aims(screen, w.choices[0]!) ? 'aimed' : undefined}>
          <PlaceStage.Way way={w} draw={draw} road /></li>)}
        {across.map(c => <li key={c.id}><Act.View choice={c} draw={draw} className="way" /></li>)}</ul>
      </nav>}
    </>;
  }
  // A way, as one choice: where it goes, and beside it by what way, how long and whether you have been; what else can
  // be done at it (open it first, look at what is on it) beneath.
  static Way({ way, draw, twin, road }: { way: Way; draw: Draw; twin?: boolean; road?: boolean }) {
    const [go, ...also] = way.choices, exit = way.exit;
    // By what way, unless the way is where it goes ("To the bridge over the Reodex, by the bridge over the Reodex"),
    // and without the place it reaches when that is named already ("by the path", not "by the path into Holenforwest").
    const to = PlaceStage.to(go!, exit), named = exit.way && to.toLowerCase().includes(exit.way.toLowerCase());
    const by = [(road || twin) && exit.way && !named ? `by ${PlaceStage.route(exit.way, to)}` : '',
      road && exit.visited ? 'been' : ''].filter(Boolean).join(' · ');
    return <>
      <Act.View choice={go!} draw={draw} className="way">
        <span className="n">{Typography.curl(Words.upper(to))}</span>
        {go!.note && <><span className="lead" aria-hidden="true" /><span className="t">{Typography.curl(go!.note)}</span></>}
        {by && <span className="r">{Typography.curl(by)}</span>}
      </Act.View>
      <PlaceStage.Opened choice={go!} draw={draw} />
      {also.map(c => c.children?.length ? <PlaceStage.Hazard key={c.id} choice={c} draw={draw} />
        : <Act.View key={c.id} choice={c} draw={draw} className="way also">
          {Typography.curl(Words.upper(PlaceStage.also(c.label)))}</Act.View>)}
    </>;
  }
  // Something in the way and what can be done about it, each its own row under the thing's name: it had opened as a
  // fold under the way, "…" and then underlined words (play 7, the enchanted object on the long stair).
  static Hazard({ choice: c, draw }: { choice: Choice; draw: Draw }) {
    return <>
      <p className="way-thing">{Typography.curl(Words.upper(PlaceStage.also(c.label).replace(/^(Look at|Examine) /i, '')))}</p>
      {c.children!.map(k => <Fragment key={k.id}><Act.View choice={k} draw={draw} className="way also">
        {Typography.curl(Words.upper(k.label))}</Act.View><PlaceStage.Opened choice={k} draw={draw} /></Fragment>)}
    </>;
  }
  // Your aim, said quietly at the head of the ways on: the first the notes hold, your own errand before what the
  // country holds (the owner's interim report: little to say where anything worth doing was, without the notes). It
  // is said as written: "You mean to / the brothers want …" was no sentence (play 7).
  static Aim({ screen, bound }: { screen: Screen; bound: boolean }) {
    const aim = screen.objectives[0];
    if (!aim || bound) { return null; }
    return <p className="aim" data-id="aim"><span className="label">Your aim</span>{Typography.curl(Words.upper(aim))}</p>;
  }
  // Where you are going, while you are: where to, the next way and how long it is, how long in all; going on (by the
  // way known from here, a way at a time, stopping only for what wants you) and giving it up. On every page you
  // explore from until you come there (the owner's interim report).
  // A name too long for half a phone's width takes the whole row there ("To the market-place of Karashilgab" had
  // wrapped over three lines beside another: play 11), and so does a way barred, with why (a boar across the low path
  // had been told in a column a third of the page wide).
  static wide(name: string): boolean { return name.length > 22; }
  static Bound({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const bound = app.state.frame!.bound, going = app.menu.destinations ?? [];
    const on = bound && going.find(c => c.id === `travel:${bound.id}`), off = going.find(c => c.id === MenuModel.unbind);
    if (!bound || !on) { return null; }
    const next = bound.legs[0];
    return (
      <section className="bound" aria-label={`Bound for ${bound.name}`} data-id="bound">
        <p className="label">Bound for</p>
        <p className="whither">{Typography.curl(Words.upper(bound.name))}</p>
        <p className="next">{Typography.curl([next ? `Next, by ${next.way} to ${next.to}: ${Words.span(next.minutes)}.` : '',
          bound.toward ? `As far as ${bound.toward} by the ways you know.` : '',
          bound.legs.length > 1 ? `${Words.upper(Words.span(bound.minutes))} in all.` : ''].filter(Boolean).join(' '))}</p>
        <p className="go"><Act.View choice={on} draw={draw} className="option go-on">{`Go on to ${bound.name}`}</Act.View>
          {off && <Act.View choice={off} draw={draw} className="option give-up">Give it up</Act.View>}</p>
      </section>
    );
  }
  // The nearest places you know the way to, further than a step, each a journey to set out on at once; the rest are
  // on the map. On the way, the journey stops for whatever wants a decision.
  static Further({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const bound = app.state.frame!.bound;
    const going = (app.menu.destinations ?? []).filter(c => c.id !== MenuModel.unbind && c.id !== `travel:${bound?.id}`);
    if (!going.length) { return null; }
    return (
      <nav className="ways further" aria-label="Set out for">
        <p className="label">Set out for</p>
        <ul className="options">{going.map(c => <li key={c.id}><Act.View choice={c} draw={draw} className="way journey">
          <span className="n">{Typography.curl(c.label.replace(/^Set out (for|toward) /, ''))}</span>
          {c.note && <span className="r">{Typography.curl(c.note)}</span>}</Act.View></li>)}</ul>
      </nav>
    );
  }
  // Whether the company's aim, or its family, names where a way goes (or the way itself, or a place to set out for).
  static aims(screen: Screen, c: Choice): boolean {
    const aimed = new Set(screen.aimed ?? []), exit = screen.exits.find(e => e.id === c.id);
    return exit ? aimed.has(exit.id) || aimed.has(exit.destination.id) : aimed.has(c.id.replace(/^travel:/, ''));
  }
  // Where a way goes, as the choice says it ("Into the Wooden Wolf"), or the place it leads to.
  private static to(c: Choice, exit: ExitRow): string {
    const said = c.label.replace(/ — .*$/, '');
    return /^(To|Into|Out|Up|Down|Back|Across|Over|Through|Along) /.test(said) ? said : exit.destination.name;
  }
  private static also(label: string): string { return / — (.+)$/.exec(label)?.[1] ?? label; }
  static route(way: string, to: string): string {
    const m = /^(.+?)\s+(?:out into|out onto|up onto|into|onto|to|across|over|through)\s+(.+)$/.exec(way);
    const place = m?.[2]!.replace(/^(the|a|an) /i, '');
    return m && place && (to.includes(place) || place.split(' ').some(w => /^\p{Lu}/u.test(w) && to.includes(w)))
      ? m[1]! : way;
  }
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
  // Yourself, at the end of what is here: how you are and what you have, and what you can do of yourself (wait,
  // search, rest). It had stood across the foot of the screen, under everything, with the ways (the owner's report).
  static You({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const scene = app.menu.scene!, screen = app.state.frame!.screen;
    return (
      <section className="you" data-region="party" aria-label="Yourself">
        <Stage.Me screen={screen} />
        <Act.List choices={scene.you} draw={draw} className="small yours" />
      </section>
    );
  }
}
