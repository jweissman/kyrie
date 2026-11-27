import { Foreground } from '../../../src/presentation/foreground';
import { AimSaid } from '../../../src/presentation/aim-said';
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import type { Glance, Lens, LensAct, Promoted } from '../../../src/presentation/glance-types';
import type { Choice } from '../../../src/ui/choice-list';
import type { SceneSubject } from '../../../src/ui/scene';
import type { ReaderApp } from '../reader-app';
import { Attending } from '../../../src/ui/attention';
import { Doable, type Row } from '../../../src/presentation/doable';
import { Typography } from '../../../src/presentation/typography';
import { MenuModel } from '../../../src/frame/menu-model';
import { Aims } from '../aims';
import { Words } from '../../../src/presentation/words';
import { Emphasis } from '../../../src/presentation/emphasis';
import { Pip } from './pip';
import { Guidance } from '../guidance';
import { LensFocused } from './lens-focused';
import { LensRows } from './lens-rows';
import { Act, type Draw } from './act';
import { Journey } from './journey';
import { Moments } from './moments';
import { PlaceStage } from './place-stage';
import { Told } from './told';
import { NextPull } from './next-pull';
import { SceneSurface } from './scene-surface';
import { SceneModel } from '../../../src/ui/scene';
import { Pastime } from './pastime';
import { Wayfinder } from './wayfinder';
import { Scrolled } from './scrolled';
import { Attention } from './attention';
import { ChoiceRow, type RowParts } from './choice-row';
import { Fold } from '../../../src/presentation/fold';
import { CompassStage } from './compass-stage';
import { Look } from '../look';
import { Signs } from '../../../src/presentation/signs';
import { PageFrame } from '../page-frame';
import { PlaceQuestion } from '../../../src/frame/place-question';

// A place at a glance (OWN-18, OWN-19), as the engine decides it (see Glance), under the place's head: what is told in
// one column, and what can be done held in view beside it (under it on a screen held upright), never a scroll away.
// What was just done, when it was done here; how the company came, in a line; the place's own line; a sign of life now (a
// danger, as what it is and how a fight would go); on a return, what has changed; the aim, when it wants saying; the
// few things worth doing now, each with why and what it risks, the first edged in gold (the keys' 1, 2 and 3); a quiet
// row of the nearest ways; how the company is, only when something is wrong; and Every way, Look about and More, each
// a sheet over the page. Everything else is one deliberate touch away, and nothing is guessed here.
export class GlanceStage {
  // apart: the ways are drawn by the stage, in a bar of their own across it (see WorldStage), not in this column.
  static View({ app, draw, apart }: { app: ReaderApp; draw: Draw; apart?: boolean }) {
    const s = app.state, frame = s.frame!, leaf = frame.leaf, g = leaf.glance!, screen = frame.screen;
    const exchange = leaf.exchange, told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    // Hurt on the way in (a trap's blade: Exchange.struck), what happened comes before the place (see Told.Place).
    const stayed = !leaf.moved && !!told, struck = !stayed && !!told?.struck;
    const ready = Moments.ready(screen);
    // Someone here with something for the company is led with as well as by their likeness (the owner, 12 November,
    // superseding 4 November's "talked to by their own plate"), and the lead says what it is for.
    // Opening the map is the rail's MAP, not a lead beside what is here (the owner, 4 November evening).
    // Opening the map is the rail's MAP, and going by a way is the ways' below: the leads are what else is worth doing
    // (the owner, 4 November evening: the ways had been said twice).
    const going = new Set(SceneSurface.open(screen, SceneSurface.choices(app), []).map(x => x.c.id));
    const acts = (app.menu.leads ?? g.acts).filter(a => {
      const c = GlanceStage.choice(app, a.choice);
      return c?.id !== MenuModel.country.id && !going.has(c?.id ?? '');
    });
    const leading = new Set<string | undefined>(app.menu.leading ?? []);
    // What the glance ranks first is marked first, a lead or someone's plate (the owner, 4 November: lead 1 had been
    // marked though talking to Theren, on her plate, was what the aim followed asked).
    const top = GlanceStage.first(app);
    return (
      <div className={`glance arrival-${g.arrival}${GlanceStage.sparse(app, acts, g) ? ' sparse' : ''}`} data-region="glance"
        data-arrival={g.arrival}>
        {apart ? <GlanceStage.Rest app={app} glance={g} /> : <div className="told-col" data-region="told" {...PageFrame.slot('narrative')}>
          {s.pending ? <Told.Working pending={{ ...s.pending, stage: s.stage }} />
            : (stayed || struck) && <Told.Happened exchange={told!} said={stayed} ready={ready} app={app} />}
          {g.came && <GlanceStage.Came app={app} came={g.came} {...g.legs ? { legs: g.legs } : {}} />}
          {screen.dark && !g.sight && <p className="dark-note">{Told.dark(screen)}</p>}
          {g.sight && <p className="sight" data-id={g.sight.id}><Told.Said text={g.sight.text} /></p>}
          <GlanceStage.Life app={app} glance={g} />
          {g.changed.length > 0 && <div className="changed">
            <p className="label">Since you were last here</p>
            {g.changed.map((l, i) => <p key={i}>{Typography.curl(l)}</p>)}
          </div>}
          {/* What came of coming here (the grey dog comes over to push her nose into your hand). */}
          {!s.pending && told && !stayed && !struck && <Told.Happened exchange={told} ready={ready} app={app} />}
          {/* What the act opened that the glance does not lead with (asking Alfric along, once he has said he will
              go), said in a line under what came of it: the button stays where it is drawn (REV-05). */}
          {/* Not on a place at rest, which names no act (the owner, 5 November): what it opened is in the explorer. */}
          {!apart && !s.pending && told && g.after?.next && !g.after.next.choice && <p className="opened-now" data-id="next">
            <span className="label">Now open</span>{` ${Typography.curl(g.after.next.label)}`}</p>}
        </div>}
        {/* What can be done here, held in view beside what is told (the owner, 4 November: never a scroll away). */}
        <div className="do-col" data-region="do">
          <div className="do-list">
            {!apart && <GlanceStage.Aim app={app} said={g.aim} />}
            {g.need && <p className="need" data-id="need">{g.need.map(n => <span key={n}>{Typography.curl(n)}</span>)}</p>}
            {/* Mission 21's attention composition: the lens chosen on the rail (its icons, never words: the owner, 13
                November) promotes its kind of act into the one menu, in place of the place's own few (see Attention). */}
            {apart && Look.is('attend') && Attention.lens(app) !== 'here' ? <Attention.Menu app={app} draw={draw} />
              : apart ? <GlanceStage.Resting app={app} draw={draw} top={top} lens={GlanceStage.lens(app)}
              acts={(app.menu.leads ?? g.acts).filter(a => GlanceStage.choice(app, a.choice)?.id !== MenuModel.country.id)} />
              : <><GlanceStage.Acts app={app} draw={draw} acts={acts} top={top} />
                <GlanceStage.People app={app} draw={draw} led={new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id))}
                  leading={leading} top={top} why={g.acts[0]?.note} />
                <GlanceStage.Around app={app} draw={draw} led={new Set(acts.map(a => GlanceStage.choice(app, a.choice)?.id))} />
              </>}
          </div>
          {/* The ways from here at the foot, always in view: where the company can go, and how to leave. */}
          {!apart && <GlanceStage.Row app={app} draw={draw} glance={g} />}
        </div>
      </div>
    );
  }
  // Who is here, in sight without Look about (the owner, 3 November: whoever keeps a shop, and the people of a place,
  // had been a deliberate look away): those the company has a stake in, then whoever sells, then whoever has something
  // to be asked, the rest after; a few at most, the others under Look about, which is for a crowd.
  // A choice the glance leads with already (Talk to Falkor) is not drawn again on their plate: one choice is one
  // button on the page, and the keys and a browser's driver find it once.
  static People({ app, draw, led, leading, top, why }: { app: ReaderApp; draw: Draw; led: Set<string | undefined>;
    leading: Set<string | undefined>; top?: string; why?: string }) {
    const all = GlanceStage.people(app);
    if (!all.length) { return null; }
    const shown = GlanceStage.cast(app).map(x => ({ ...x, choices: x.choices.filter(c => !led.has(c.id)) }));
    const more = all.length - shown.length;
    return (
      <div className="cast glance-cast" data-line="People here">
        <p className="label">{all.length === 1 ? 'Someone here' : 'People here'}</p>
        <ul className="plates">{shown.map(x => <li key={x.id} data-subject={x.id} className="brief">
          <PlaceStage.Plate subject={x} draw={draw} brief led={x.choices.some(c => leading.has(c.id))}
            first={x.choices.some(c => c.id === top) ? why ?? '' : undefined} /></li>)}</ul>
        {more > 0 && <p className="more-here">{`And ${more} more about the place.`}</p>}
      </div>
    );
  }
  // At rest in a place (the owner, 4 November, late, and 5 November: a settled contract), what is told: the place
  // whole, always (5 November, late: never folded away), how the company came, and what came of what was last done
  // here, under it; a danger in its own block. On the game's first page, the first goal the company's own errand
  // gives it, said once in so many words (the owner's play of 7 November: the opening told the story of the father's
  // cart, and nothing said that it was something to do).
  // The column says when more of it lies below (see Scrolled), and what was just done here is brought into view in it
  // (see Told.Happened).
  // While an act is under way the telling keeps the height it had, its echo pushing the words down inside it, so
  // nothing under it moves (M22's third review: the menu had jumped about 32 px as an act was taken, the row sliding
  // from under the finger).
  static useHeld(col: RefObject<HTMLDivElement | null>, pending: boolean) {
    const was = useRef(0);
    useLayoutEffect(() => {
      const el = col.current;
      if (!el) { return; }
      if (!pending) { el.style.height = ''; el.style.overflow = ''; was.current = el.offsetHeight; return; }
      if (was.current) { el.style.height = `${was.current}px`; el.style.overflow = 'hidden'; }
    });
  }
  static Rest({ app, glance: g }: { app: ReaderApp; glance: Glance }) {
    const s = app.state, leaf = s.frame!.leaf, exchange = leaf.exchange, screen = s.frame!.screen;
    // What came of what was just done is told here, a lens on or not: it had been the explorer's pane's to tell (kept),
    // and with the lenses in the scene it was told nowhere (the grave spec's statue broken, and nothing said).
    const told = exchange && (exchange.lines.length || exchange.notes.length) ? exchange : undefined;
    const struck = !!leaf.moved && !!told?.struck;
    const col = useRef<HTMLDivElement>(null);
    Scrolled.useCue(col, s.frame);
    Scrolled.useEnd(col, s.frame);
    GlanceStage.useHeld(col, !!s.pending);
    return <div className="told-col" data-region="told" ref={col} {...PageFrame.slot('narrative')}>
      {s.pending && !s.exploring && <Told.Working pending={{ ...s.pending, stage: s.stage }} />}
      {struck && told && <Told.Happened exchange={told} ready={Moments.ready(screen)} app={app} />}
      {g.came && <GlanceStage.Came app={app} came={g.came} {...g.legs ? { legs: g.legs } : {}} />}
      {screen.dark && <p className="dark-note">{Told.dark(screen)}</p>}
      {/* A danger before the place's telling: under it, its words had been below the fold (round 4, E 61). */}
      {g.life?.danger && <GlanceStage.Life app={app} glance={g} />}
      {/* A lens on (Go, Look, Wait) has the room: the place by its first paragraph, nothing more of it until the lens
          is put away (Mission 21's scenes: the time lens had sat under five paragraphs at an iPad's height). */}
      {/* After something done here, the place is held below what came of it, not above (OR-69). */}
      {(!leaf.glanced?.stayed || s.exploring === 'look') && <Told.Setting app={app} brief={!!s.exploring} />}
      {!g.life?.danger && !s.exploring && !leaf.glanced?.stayed && <GlanceStage.Life app={app} glance={g} />}
      {/* Said here unless the opening said it: an opening with no aim of its own on its last page (a1's) had left the
          first goal on no screen at all, only in the book (the second blind playtest, BL-04). */}
      {g.goal && (!s.opened || !s.goalSaid) && !s.exploring && !leaf.glanced?.stayed && <p className="first-goal" data-id="goal">
        <span className="label">Your first goal</span>
        {Typography.curl(Words.upper(g.goal))}</p>}
      {g.changed.length > 0 && <div className="changed">
        <p className="label">Since you were last here</p>
        {g.changed.map((l, i) => <p key={i}><Told.Said text={l} /></p>)}
      </div>}
      {!s.pending && told && !struck && <Told.Happened exchange={told} said={!leaf.moved} ready={Moments.ready(screen)}
        app={app} {...leaf.moved && leaf.glanced ? { unsaid: leaf.glanced.unsaid ?? [] } : {}} />}
      {!s.pending && g.next && <NextPull.View app={app} next={g.next} />}
    </div>;
  }
  // And what can be done from it: one menu, from one source (the owner's playtest of 27 November, OR-1490: "one page,
  // one menu, strict four"; several menus and a block of ways set apart had looked unintegrated). The place's question
  // (PlaceQuestion): on its first page the engine's four (TB-02), drawn whole, the places among them, and Something
  // else… under them in the same list; on each page after it, the next four of the scene's rows (each way, each thing
  // by its look, each person by a talk, each wait, the company's own page first), as plain rows. The page draws
  // nothing beside it: no way back, notice, one way on or block of ways, looks and waits of its own (they are rows of
  // the question's pages).
  // lens: the lens turned on (see GlanceStage.Lens), once lenses are earned, whose acts stand in place of the menu.
  static Resting({ app, draw, acts, top, lens }: { app: ReaderApp; draw: Draw; acts: Promoted[]; top?: string;
    lens?: Lens }) {
    if (lens) { return <GlanceStage.Lens app={app} draw={draw} lens={lens} />; }
    const asked = app.state.frame?.question?.place;
    // The engine's four where it offers them, drawn whole; else the glance's own foreground.
    const four = Foreground.fit(GlanceStage.offered(app) ?? GlanceStage.foreground(app, acts), 0);
    if (asked && asked.page.at > 0) { return <GlanceStage.Paged app={app} draw={draw} rows={asked.rows} />; }
    const after = asked?.rows.slice(asked.promoted) ?? [];
    return four.length + after.length > 0
      ? <GlanceStage.Acts app={app} draw={draw} acts={four} top={top} after={after} /> : null;
  }
  // A row of the place's question that is not one of the four (a page's rows, Something else…): plain, its mark the
  // fold of its leaves as the question holds them, numbered by its place on the page.
  static Asked({ app, draw, row, n }: { app: ReaderApp; draw: Draw; row: Choice; n: number }) {
    const leaves = app.state.frame?.question?.place?.marks[row.id] ?? [];
    return <li data-question={row.id === PlaceQuestion.more ? 'more' : 'row'}>
      <ChoiceRow.Act choice={row} draw={draw} {...row.id === PlaceQuestion.more ? {} : { shown: n }} className="led-act asked"
        {...ChoiceRow.mark(Fold.mark(leaves, Guidance.shown(app)))}
        label={Typography.curl(row.label)} {...row.note ? { aside: Typography.curl(row.note) } : {}} /></li>;
  }
  // A page of the place's question past its four: its rows, and Something else….
  static Paged({ app, draw, rows }: { app: ReaderApp; draw: Draw; rows: Choice[] }) {
    return <ol {...PageFrame.slot('menu')} className="led asked-page" aria-label="What you could do now">
      {rows.map((r, i) => <GlanceStage.Asked key={r.id} app={app} draw={draw} row={r} n={i + 1} />)}</ol>;
  }
  // The lens turned on at the rail (CN-01, CN-05; the owner, 14 November: "A lens is a change of attention, not a game
  // action or a new location"): Go the places, Look the things, Wait the time, Talk the people. Turning one on is the
  // page's own: no command, no time.
  static lens(app: ReaderApp): Lens | undefined {
    const part = app.state.exploring;
    return part === 'go' ? 'places' : part === 'look' ? 'things' : part === 'wait' ? 'time' : app.state.talking ? 'people'
      : undefined;
  }
  // A lens in the scene: the telling stays; the four are the lens's own (Glance.lenses, from the same acts the
  // resting scene's four come from, ranked alike), and the rest of its acts unfold beneath them, in place, at a touch.
  static readonly per = 4;
  static Lens({ app, draw, lens }: { app: ReaderApp; draw: Draw; lens: Lens }) {
    const lensed = app.state.frame?.leaf.glance?.lenses?.[lens];
    if (!lensed) { return null; }
    // Its rows, as the rail's mark that opens it reads them (LensRows: the mark made of nothing it does not draw).
    // Never more than four (the owner, 16 November, in every context, lenses too): where its acts do not fit, the lens
    // is drawn by focus, a thing one row and its alike acts one row (the owner, 17 November: see LensFocused).
    const drawn = LensRows.of(app, lens, lensed, GlanceStage.choice), { promoted, opened, flat, inside, kept } = drawn;
    // What the scene led with that will not wait, or carries the aim on, and the lens draws nowhere: kept above it, in
    // its places of the four (Lensed.kept, OR-240: the badger's Attack had gone with Look, the windlass's try with Talk).
    if (LensRows.focused(app, drawn)) {
      return <LensFocused.View app={app} draw={draw} lens={lens} lensed={lensed} acts={drawn.all} kept={kept} />;
    }
    // What is seen of a thing the four are done to that the scene draws no one for (the riddle cut across the speaking
    // door: Lensed.subjects), said once above them, under its name.
    // Said once, no heading over it (a heading is a category marker in the list: the owner, 15 November), and not
    // where a row of the four says it already (the corn-store padlock's words had stood above and under the row).
    const said = new Set(promoted.flatMap(p => {
      const c = GlanceStage.choice(app, p.choice);
      return c ? [GlanceStage.note(p, c, GlanceStage.label(app, p, c)) ?? ''] : [];
    }));
    const seen = [...new Set(promoted.flatMap(p => p.subject && lensed.subjects?.[p.subject]?.seen ? [p.subject] : []))]
      .map(id => ({ id, lines: lensed.subjects![id]!.seen!.filter(l => !said.has(l)) })).filter(x => x.lines.length);
    return <div {...PageFrame.slot('menu')} className={`lens lens-${lens}`} data-lens={lens}>
      {seen.map(x => <div key={x.id} className="lens-seen" data-subject={x.id}>
        {x.lines.map((p, i) => <p key={i} className="seen">{Typography.curl(p)}</p>)}</div>)}
      <GlanceStage.Acts app={app} draw={draw} acts={[...kept, ...promoted]} />
      {/* Only the acts, each in words that stand alone: no heading among them (the owner, 15 November: text between
          the acts, a category marker, should never be in the list; "Talk to Wellby" under WELLBY). */}
      {opened.map(o => <ul key={o.choice} className="acts lens-opened" data-subject={o.subject ?? o.choice}>
        {inside(o).map(l => <li key={l.choice}><GlanceStage.LensRow app={app} draw={draw} act={l} lens={lens} /></li>)}</ul>)}
      {flat.length > 0 && <ul className="acts lens-rest">{flat.map(a =>
        <li key={a.choice} data-subject={a.subject}><GlanceStage.LensRow app={app} draw={draw} act={a} lens={lens} /></li>)}</ul>}
    </div>;
  }
  // A lens's rest by what it is done to (see LensRows.grouped).
  static grouped(rest: LensAct[]): { subject?: string; acts: LensAct[] }[] { return LensRows.grouped(rest); }
  // A lens group's name: someone or something here; the company itself (the time lens's own acts); or what the
  // engine names where the scene draws no one for it (a thing on a way, the way: Lensed.subjects).
  static named(app: ReaderApp, subject: string): string {
    if (subject === 'yourself') { return 'Yourself'; }
    const scene = app.menu.scene, lens = GlanceStage.lens(app);
    return [...scene?.subjects ?? [], ...scene?.still ?? []].find(x => x.id === subject)?.name
      ?? (lens && app.state.frame?.leaf.glance?.lenses?.[lens]?.subjects?.[subject]?.name) ?? '';
  }
  // Every act a lens gives, by its choice: its four, its rest and what is within its openers.
  static lensed(app: ReaderApp, lens: Lens): Set<string> {
    const l = app.state.frame?.leaf.glance?.lenses?.[lens];
    return new Set([...l?.promoted ?? [], ...l?.rest ?? [], ...Object.values(l?.leaves ?? {}).flat()].map(a => a.choice));
  }
  // The openers on the ways off this place that hold what a lens gives (a door's words under "Speak to the door"), to
  // be opened with it so that the menu has each of them to be done by (see Explorer.open).
  static holders(app: ReaderApp, lens: Lens): string[] {
    const ids = GlanceStage.lensed(app, lens), scene = app.menu.scene, out: string[] = [];
    const holds = (c: Choice): boolean => {
      const inner = (c.children ?? []).map(holds).some(Boolean) || (c.children ?? []).some(k => ids.has(k.id));
      if (inner) { out.push(c.id); }
      return inner;
    };
    [...scene?.near ?? [], ...scene?.far ?? []].forEach(holds);
    return out;
  }
  // One of a lens's rest: the menu's own choice where it is one (its keys, its mark); else the act as the lens names it.
  // aspects: what it is, where the lens promoted it (its mark, as the four's are).
  // Its mark, the lens's one witness for the row (LensRows.borne), as the rail's mark reads it.
  static LensRow({ app, draw, act: a, lens }: { app: ReaderApp; draw: Draw; act: LensAct; lens: Lens }) {
    const c = GlanceStage.choice(app, a.choice);
    const mark = ChoiceRow.mark(Fold.mark(LensRows.leaves(app, lens, a.choice), Guidance.shown(app)));
    // What it risks said on it, as the four say theirs (a way with no coming back); and in the time lens what it spends,
    // the engine's note (a camp "until morning", a rest until the hour it ends), said before it is chosen, at one press
    // (OR-185: nothing held; the hold had been the only sign of its cost).
    const [going, how] = Words.going(a.label);
    const spends = lens === 'time' && c?.note && !going.toLowerCase().includes(c.note.toLowerCase()) ? c.note : '';
    const risks = [how ?? '', spends, ...(c?.marks ?? []).map(m => Words.upper(m.said))].filter(Boolean).join(' · ');
    if (c && draw.index.has(c.id)) {
      // What it opens (the words that can be said at a door) opened beneath it, as under the four.
      return <><ChoiceRow.Act choice={c} draw={draw} label={Typography.curl(going)} {...mark}
        {...risks ? { aside: Typography.curl(risks) } : {}} />
        <PlaceStage.Opened choice={c} draw={draw} /></>;
    }
    // Else the engine's one row for it (Doable), never a choice of the page's own; none where it is refused.
    const own = c ?? GlanceStage.made(app, a.choice, { label: a.label, command: a.command, shut: a.disabled });
    if (!own) { return null; }
    return <ChoiceRow.Button className={a.disabled ? 'shut' : ''} data={{ choice: a.choice }} act={a.choice} {...mark}
      onClick={() => { if (!a.disabled && !own.disabled) { app.choose(own); } }} label={Typography.curl(a.label)}
      {...a.disabled ? { aside: Typography.curl(a.disabled) } : {}} />;
  }
  // A notice put up here and not yet read, met on the scene itself (M19-86: the notice that sets a town's jobs had been
  // under Look…, one thing among others): the place's own offer to read it. Read, it is at hand like the rest.
  static posted(app: ReaderApp): Choice | undefined {
    return (app.menu.scene?.you ?? []).find(c => SceneModel.own(c) && /^Read /.test(c.label) && !c.disabled);
  }
  // What the company itself can do that the place leads with first (ring the bell it carries, among the hobs), as a
  // touch of its own, as an unread notice is: led with and drawn nowhere but Look…, the reference tour had stopped at
  // it (Mission 20).
  // A row's mark: the indicator of the glance's witness for the choice it is (Attest), else the neutral line.
  // An opener among them by the fold of its rows (Fold), never its own reasons.
  static marked(app: ReaderApp, choice: string, gilded: boolean): Pick<RowParts, 'indicator' | 'plain'> {
    return ChoiceRow.mark(Fold.mark(app.state.frame?.menu.marks.led[choice] ?? [], gilded && Guidance.shown(app)));
  }
  static yours(app: ReaderApp, acts: Promoted[], drawn: (Choice | undefined)[]): Choice | undefined {
    const lead = acts.find(a => a.tier > 0 && !a.exit && !a.choice.startsWith('travel:') && !a.subject);
    const c = lead && (app.menu.scene?.you ?? []).find(x => x.id === lead.choice);
    return c && !c.disabled && !drawn.some(d => d?.id === c.id) ? c : undefined;
  }
  // The way back from a site or from under the ground, where it is not drawn already (see CompanyRecall.back).
  static back(app: ReaderApp, drawn: (Choice | undefined)[]): Choice | undefined {
    const id = app.state.frame?.leaf.glance?.back, c = id ? GlanceStage.choice(app, id) : undefined;
    return c && !c.disabled && !drawn.some(d => d?.id === c.id) ? c : undefined;
  }
  // The choice that is the followed aim's one next step (Promoted.continues), as the page draws it.
  static next(app: ReaderApp): string | undefined {
    const a = app.state.frame?.leaf.glance?.acts.find(x => x.continues);
    return a && GlanceStage.choice(app, a.choice)?.id;
  }
  // The one way on, where there is only one and it can be taken: offered as itself, not behind Go… (the owner, 6
  // November: two clicks for no choice).
  static only(app: ReaderApp): ReturnType<typeof Wayfinder.ways>[number] | undefined {
    const ways = Wayfinder.ways(app);
    return ways.length === 1 && !ways[0]!.c.disabled && ways[0]!.c.command ? ways[0] : undefined;
  }
  // What will not wait (a danger, an answer owed, a warning, the dark), as a situation, never a way: a place at rest
  // shows its name, its picture, a few words of it, who is here and Explore…, and nothing of where to go or what is
  // ranked next (the owner, 5 November: a settled contract; the ways, the aim's next step and the rest are in the
  // explorer).
  // In the dark, a light the company can light comes first and is never one too many: two dangers had left it off the
  // page under "No light", and a player with a candle in the pack met the bats blind (round 5).
  static pressing(acts: Promoted[]): Promoted[] {
    const urgent = acts.filter(a => a.tier === 0 && !a.exit && !a.choice.startsWith('travel:'));
    const light = urgent.find(a => a.why === 'dark');
    return [...light ? [light] : [], ...urgent.filter(a => a !== light).slice(0, 2)];
  }
  // What a place offers, at rest: what will not wait, then the few other things the glance finds worth doing here,
  // four at most (amendment 6, B: two to four genuinely different opportunities, never filler). Whoever is here is on
  // the picture, a journey on the map, and what the place's own touches open (a notice, a find) is drawn by them.
  // The scene's four, as the engine offers them (Glance.offer, TB-02: the same four in the page and the terminal, each
  // a different kind of act where it can be): as the glance led with each where it did (its reason, its subject, what
  // it is for), else as offered, to make four.
  // Each said in the engine's words (Doable: what a talk led for a question is called, "Talk to Kynes — ask what the
  // waterfront is saying"), not the glance's own label for it (MT-18: one wording, the parity measure's page words).
  static offered(app: ReaderApp): Promoted[] | undefined {
    const g = app.state.frame?.leaf.glance, screen = app.state.frame?.screen;
    const four = GlanceStage.engine(g);
    return four && g && screen
      ? four.map(a => ({ ...a, label: GlanceStage.called(Doable.one(g, screen, a.choice, a.command), a) })) : undefined;
  }
  // A look that holds one act is that act, in its words, not the thing's name (MT-18: "a wax tablet in a wooden case"
  // for "Read the strokes on the wax tablet"); a talk led for a question is what Doable calls it.
  private static called(row: Row, a: Promoted): string { return row.called ?? (row.only ? row.label : a.label); }
  private static engine(g: Glance | undefined): Promoted[] | undefined {
    return g?.offer?.primary.map(o => g.acts.find(a => a.choice === o.choice) ?? { choice: o.choice,
      ...o.command ? { command: o.command } : {}, label: o.label, aspects: o.aspects, marks: o.marks,
      ...o.continues ? { continues: true as const } : {}, why: 'present', facets: ['here'], tier: 4 });
  }
  static foreground(app: ReaderApp, acts: Promoted[]): Promoted[] {
    // Whoever there is to talk to for something stands among them as well as on the picture (the owner, 12 November:
    // a taproom had led with two things, and the several there with something for the company were only likenesses).
    const pressing = GlanceStage.pressing(acts);
    // Whoever is the aim's next step stands among them too, not only on the picture: the prior to be asked about the
    // churchyard had been only a likeness in the corner, and the foreground empty (the owner, 11 November).
    // A walk about the town is a way like any other here; a journey out over the country is the map's, unless it is
    // the aim's next step (the chapel had led to the churchyard by a walk, and the foreground had been empty).
    const walks = new Set((app.state.frame?.screen.around ?? []).map(d => `travel:${d.id}`));
    const rest = acts.filter(a => !pressing.includes(a) && (!a.choice.startsWith('travel:') || walks.has(a.choice)
      || a.continues));
    return [...pressing, ...rest].flatMap(a => GlanceStage.flat(app, a)).slice(0, 4);
  }
  // A choice that only gathers a few things to do, all of them to hand and each able to stand alone, is those things
  // ("Look at the corn-store padlock" had opened onto "Push and pull at it" and "Listen at it": the owner, 11 November).
  // Nothing is shown that is not offered already: only what the group holds, open now, is drawn out of it.
  // A thing led by its name alone ("the tower of the shrine") is so too: what is done with it, said in its own words.
  // Someone talked to is not: a conversation is theirs, and its questions speak of them ("Ask about his work").
  static flat(app: ReaderApp, a: Promoted): Promoted[] {
    const kids = a.choice.endsWith('#talk') ? [] : GlanceStage.choice(app, a.choice)?.children ?? [];
    const alone = (k: Choice) => k.alone || (/\b(it|its|him|his|her|them|their)\b/i.test(k.label) ? undefined : k.label);
    if (!kids.length || kids.length > 3 || !kids.every(k => k.command && !k.disabled && !k.children && alone(k))) { return [a]; }
    return kids.map(k => {
      const kid: Promoted = { ...a, choice: k.id, label: alone(k)!, command: k.command! };
      delete kid.note;
      return kid;
    });
  }
  // Whom a choice is done with, where its own words do not name them: their name as the company knows it.
  static whom(app: ReaderApp, a: Promoted, label: string): string | undefined {
    const x = a.subject && app.menu.scene?.subjects.find(s => s.id === a.subject);
    if (!x || !['person', 'animal', 'creature', 'companion'].includes(x.kind)) { return undefined; }
    const name = Words.short(x.name);
    return label.toLowerCase().includes(Words.bare(name).toLowerCase()) ? undefined : Words.upper(name);
  }
  // What a place at rest draws that can be chosen: whoever is here, on the picture, and what is pressing.
  static atRest(app: ReaderApp): Set<string> {
    const g = app.state.frame?.leaf.glance, subjects = app.menu.scene?.subjects ?? [];
    const pressing = g ? GlanceStage.foreground(app, app.menu.leads ?? g.acts)
      .flatMap(a => GlanceStage.choice(app, a.choice)?.id ?? []) : [];
    return new Set([...pressing, ...Pastime.search(app)?.id ?? [], ...GlanceStage.only(app)?.c.id ?? [], ...GlanceStage.posted(app)?.id ?? [], ...subjects.filter(x => ['companion', 'person'].includes(x.kind))
      .flatMap(x => PlaceStage.into(x)?.id ?? [])]);
  }
  // Four: two rows of the rail, so that the ways under them are in view too.
  static readonly most = 10;
  static people(app: ReaderApp): SceneSubject[] {
    return (app.menu.scene?.subjects ?? []).filter(x => x.kind === 'person' && !x.danger);
  }
  // Those shown by their plates: whom the company has a stake in, then whoever sells, then whoever has something to be
  // asked, the rest after, a few at most.
  static cast(app: ReaderApp): SceneSubject[] {
    const rank = (x: SceneSubject) => (x.stake ? 0 : GlanceStage.sells(x.choices) ? 1 : x.asked ? 2 : 3);
    return [...GlanceStage.people(app)].sort((a, b) => rank(a) - rank(b)).slice(0, GlanceStage.most);
  }
  private static sells(choices: Choice[]): boolean {
    // By what is done (buy_item, buy_goods), not by the words (the headless investigation: meaning from typed data).
    return choices.some(c => !!c.does?.startsWith('buy_') || GlanceStage.sells(c.children ?? []));
  }
  // The aim followed, on every page, with the way to it where the way is known (the owner, 3 November: a clearer
  // quest followed); with none followed, the aim this place is about, when it wants saying.
  static Aim({ app, said }: { app: ReaderApp; said?: string }) {
    // Not on the first page, before anything is done: the opening has just told it.
    // Which aim, and how, by the rule the terminal says it by too (AimSaid).
    const screen = app.state.frame!.screen, chosen = AimSaid.of(screen, said);
    const followed = chosen?.followed ? chosen.text : undefined;
    const offered = chosen?.offered ? screen.aims?.find(a => a.id === chosen.offered) : undefined;
    const aim = followed ?? offered?.text ?? said, recap = app.state.frame!.leaf.recap?.aim;
    // Nor again under "Where you left off", which has just said it.
    if (aim && recap === aim && !offered) { return null; }
    // Followed, it opens the map on itself (see MapView.aim).
    if (!aim) { return null; }
    const place = followed && Aims.named(screen, screen.destinations ?? [], followed);
    return (
      <p className={`aim${followed ? ' followed' : ''}`} data-id="aim"><span className="label">
        {followed ? 'Following' : 'An aim'}</span>{Typography.curl(Words.upper(offered ? Told.title(aim) : aim))}
        {/* Not from inside an enclosed place: the compass is the way out there (CN-02). */}
        {place && !CompassStage.of(app) && <ChoiceRow.Button className="set-out" data={{ action: 'aim-map', id: place.id }}
          label={`${place.name}, on the map`} plain="neutral" onClick={() => app.choose(MenuModel.country)} />}</p>
    );
  }
  // How the company came, in a line; a journey's legs, each as it went, opened from it (they are under Look about too).
  // The journey's line is told, as the place's lines are; its legs open from a quiet word under it, in the engine's
  // words (Glance.legs), never from the line itself (OR-246: "By the sea-bank … : Day 1, 11:48 a.m." had been the
  // disclosure, and read as a line of the log).
  static Came({ app, came, legs }: { app: ReaderApp; came: string; legs?: string }) {
    const travel = app.state.frame?.travel, stopped = travel && !travel.arrived ? ' stopped' : '';
    const line = <p className={`came${stopped}`}>{Typography.curl(came)}</p>;
    if (!travel || !legs) { return line; }
    return <>{line}
      <details className="came-legs" data-region="journey">
        <summary data-action="journey">{Typography.curl(legs)}</summary>
        <Journey.View travel={travel} />
      </details></>;
  }
  // A sign of life now: a danger, as what it is, what it is doing and how a fight would go (what can be done about it
  // is what the glance leads with, and every way of meeting it is under Look about); or someone's words or doings; or
  // the place's passing life. In words alone: whoever it is about is on the picture by their likeness, and no
  // likeness stands in the telling (the owner's own play, 7 November: a brother's portrait had been set into the
  // market-place's prose).
  static Life({ app, glance: g }: { app: ReaderApp; glance: Glance }) {
    const life = g.life, subject = life?.subject ? app.menu.scene?.subjects.find(x => x.id === life.subject) : undefined;
    if (!life) { return null; }
    // Not a line the place has told already (the Stormy Horn's hiring line, told with the place and again here).
    const told = (app.state.frame?.leaf.situation ?? []).map(t => Typography.curl(t));
    if (!life.danger && told.includes(Typography.curl(life.text))) { return null; }
    // How a fight would go is said once, on the attack led with when it is (see Marks), and here when it is not.
    const reckoned = g.acts.some(a => a.marks.some(m => m.kind === 'fight'));
    if (life.danger && subject) { return <GlanceStage.Danger subject={subject} text={life.text} reckoned={reckoned} />; }
    return (
      <p className="life" data-subject={life.subject} data-id={life.id}>
        {/* Its first sentence, the one the scene's budget counts (SceneBudget: three in all; the owner, 17 November:
            an arrival had told eight and scrolled); the rest is the place's, for a deliberate look. */}
        <span className="said"><Told.Said text={Told.first(life.text)} /></span>
      </p>
    );
  }
  static Danger({ subject: c, text, reckoned }: { subject: SceneSubject; text: string; reckoned: boolean }) {
    return (
      <section className="threat" data-subject={c.id} aria-label={`Danger: ${c.name}`}>
        <p className="label">Danger</p>
        <p className="n">{Typography.curl(Words.upper(c.name))}{c.note && <span className="r"> · {Typography.curl(c.note)}</span>}</p>
        <p className="d"><Told.Said text={text} /></p>
        {c.danger && !reckoned && <p className="reckoning">{Typography.curl(GlanceStage.fight(c.danger))}</p>}
      </section>
    );
  }
  // What a row of the four does, as the engine's one row for it says (Doable, TB-12; AT-07 step 4): its command, or
  // the one act under an opener that holds only that (the well's look, drawing a bucket); else it opens, in place,
  // the act it is led for first. The page had guessed again here: a commandless opener done by its first row under the
  // opener's words ("Push and pull" at the speaking door, CL-34), a look by its first act where it led none.
  // One led with across the country opens the map at where it goes, as the engine's row does (Row.chart), where the
  // page had opened the map on the aim, or on nothing (the lead's ruling, 20 November: the parity measure's pressed),
  // and in the engine's words, never the world map's own row's (the owner's playtest, 20 November, P0: three of it).
  static acted(app: ReaderApp, a: Promoted, c: Choice): Choice {
    const g = app.state.frame?.leaf.glance, screen = app.state.frame?.screen;
    const journey = /^travel:/.test(a.command ?? a.choice);
    const charted = g && screen && journey ? Doable.one(g, screen, a.choice, a.command) : undefined;
    if (charted?.chart) { return { ...c, id: a.choice, label: charted.label, command: charted.does! }; }
    // A look's acts are the thing's own page's (OR-1295: the frame's rows carry none), read from the scene.
    const kids = c.children ?? Attending.all(app.menu.scene?.subjects.flatMap(s => s.choices) ?? [])
      .find(k => k.id === c.id)?.children;
    if (c.focus || !kids?.length || !g || !screen) { return c; }
    const does = Doable.one(g, screen, c.id, a.command).does;
    if (!does || c.command === does) { return c; }
    return Attending.all(kids).find(k => k.command === does && !k.children?.length) ?? c;
  }
  // The choice one of the four is drawn as and done by (what the parity measure reads as the page's: MT-18).
  static taken(app: ReaderApp, a: Promoted): Choice | undefined {
    const c = GlanceStage.choice(app, a.choice) ?? app.menu.choices.find(m => !!a.command && m.command === a.command)
      ?? GlanceStage.made(app, a.choice, a);
    return c && GlanceStage.acted(app, a, c);
  }
  // A row the menu holds no choice for, as the engine's one row makes it (Doable.choice), or none where it refuses it.
  static made(app: ReaderApp, id: string, at: { label: string; command?: string; shut?: string }): Choice | undefined {
    const g = app.state.frame?.leaf.glance, screen = app.state.frame?.screen;
    return g && screen ? Doable.choice(g, screen, id, at) : undefined;
  }
  // How a fight would go, said as a line of its own: "beyond you", alone in the danger box, had read as a stray
  // fragment (round 9, Q 69).
  static fight(chance: string): string { return `A fight: ${chance}.`; }
  // What the glance leads with, best first: each as the player would say it, why beside it (your brother, your aim,
  // the way you came), and under it what it risks, in words; whatever it opens, open under it.
  // after: the rows of the place's question drawn under the four in the same list (Something else…).
  static Acts({ app, draw, acts, top, after = [] }: { app: ReaderApp; draw: Draw; acts: Promoted[]; top?: string;
    after?: Choice[] }) {
    // An act offered with no choice of the menu's own (talking to someone here, which the page otherwise draws by their
    // likeness) is drawn as its own row and done by its command, so that the four are the engine's four.
    const shown = acts.flatMap(a => {
      const c = GlanceStage.taken(app, a);
      return c ? [{ a, c }] : [];
    }).filter((x, i, all) => all.findIndex(y => y.c.id === x.c.id) === i);
    if (!shown.length && !after.length) { return null; }
    return (
      <ol {...PageFrame.slot('menu')} className="led" aria-label="What you could do now">{shown.map(({ a, c }, i) => {
        // What it is to the company, drawn by the page's one table of tones (see Emphasis), and said in words; the aim's
        // gold and words only on the one choice that carries it on, where the page shows the way (see Guidance).
        const gilded = !!a.continues && Guidance.shown(app), label = GlanceStage.label(app, a, c);
        const said = GlanceStage.note(a, c, label), aimed = !!said && GlanceStage.aimWords.test(said);
        // Beneath it only what it adds: never what kind of thing it is (its indicator says that), but whom it is done
        // with where its words do not say (the owner, 11 November: "Offer the heel of a loaf": to whom?).
        const note = (aimed && !gilded ? undefined : said) ?? GlanceStage.whom(app, a, label);
        // One indicator at the left carries what it is: one colour, by the precedence every client reads (see Pip);
        // the rest of it stays neutral (the owner, 11 November: colour concentrated, sparing, consistent).
        const parts = GlanceStage.marked(app, a.choice, gilded), tone = parts.indicator?.tone;
        return <li key={a.choice} data-promoted={i + 1} data-why={a.why} data-aspects={a.aspects?.join(' ') || undefined}
          data-continues={a.continues || undefined} data-condition={Pip.condition({ afar: !!a.afar })}
          data-next={app.state.frame?.leaf.glance?.after?.next?.choice === a.choice || undefined}>
          {/* One row, as every choice is (see ChoiceRow): its one indicator, neutral where it is nothing in
              particular. */}
          {/* A thing's look among the four opens what can be done with it in place, under it, as the things lens does:
              chosen, it had turned the page to the thing, and done there the thing's page had stayed with only Back
              on it (Low Water's channel head, What Tessary Owes's notice). */}
          {(c.focus || (/#look$/.test(c.id) && !c.command)) && c.children?.length ? <ChoiceRow.Button className={`led-act${tone ? ` tone-${tone}` : ''}`}
            data={{ action: 'choice', choice: c.id }} act={c.id} expanded={draw.open.has(c.id)} number={i + 1}
            onClick={() => app.setState({ open: draw.open.has(c.id) ? app.state.open.filter(o => o !== c.id)
              : [...app.state.open, c.id] })}
            {...parts}
            label={Typography.curl(label)} {...note ? { aside: GlanceStage.aside(note) } : {}} />
          : !draw.index.has(c.id) ? <ChoiceRow.Button className={`led-act${tone ? ` tone-${tone}` : ''}`}
            data={{ action: 'choice', choice: c.id }} act={c.id} onClick={() => app.choose(c)} number={i + 1}
            {...parts}
            label={Typography.curl(label)} {...note ? { aside: GlanceStage.aside(note) } : {}}
            extra={a.marks.map(m => <span key={m.kind} className={`led-mark mark-${m.kind}`}>{Typography.curl(Words.upper(m.said))}</span>)} />
          : <ChoiceRow.Act choice={c} draw={draw} shown={i + 1}
            className={`led-act${c.id === top ? ' first' : ''}${tone ? ` tone-${tone}` : ''}`
              + `${a.afar ? ' afar' : ''}`}
            {...parts}
            label={Typography.curl(label)}
            aside={note && GlanceStage.aside(note)}
            extra={a.marks.map(m => <span key={m.kind} className={`led-mark mark-${m.kind}${m.danger ? ` danger-${m.danger}` : ''}`}>{Typography.curl(Words.upper(m.said))}</span>)} />}
          <PlaceStage.Opened choice={c} draw={draw} />
        </li>;
      })}{after.map((r, i) => <GlanceStage.Asked key={r.id} app={app} draw={draw} row={r} n={shown.length + i + 1} />)}</ol>
    );
  }
  // What a row says under its words: what it adds (whom it is done with, what it opens); but what kind of thing it is
  // ("an aim", "to learn", "worth a look", "for you") is its mark's to say, and said only to a reader of the page (the
  // blind playtest of 13 November, BP-08: the indicator and the composition carry it; the words had made the scene a
  // form's labels).
  static readonly kinds = new Set(['an aim', 'another aim', 'your aim', 'for you', ...Object.values(Emphasis.words)]);
  static aside(note: string): ReactNode {
    return GlanceStage.kinds.has(note.toLowerCase()) ? <span className="sr-only">{note}</span> : Typography.curl(note);
  }
  // The words that say a choice is the aim's: said only of the one that carries it on, where the way is shown.
  static readonly aimWords = /^(your aim|toward your aim|where your aim is)$/;
  // As the player would say it: "Make much of the grey dog", "Look at the fresh ruts".
  static label(app: ReaderApp, a: Promoted, c: Choice): string {
    // Someone not yet met, led for a question: talking to them, the question after it (see Doable.called, CL-45), in
    // the engine's title for it where it has one (QuestionTitle: "Carlin: whether she would come along", OR-802; the
    // page had drawn its own long words for it, the parity measure's "page words", OR-960).
    const asked = a.unmet ? GlanceStage.within(a, c) : undefined;
    const g = app.state.frame?.leaf.glance, screen = app.state.frame?.screen;
    if (asked) {
      return (g && screen && Doable.one(g, screen, a.choice, a.command).called) || Doable.called(c.alone || c.label, asked);
    }
    // Someone met, led for a question or an act within their talk: the engine's words for it ("Ask Owain how many head
    // came down", "Pole Ianto's fuel boat …"), not "Talk to your cousin" with the question as an aside (MT-18: the
    // parity measure, made to read what the four draw, found the page's own words here, 20 November).
    const led = a.for ?? a.inside?.[0]?.command;
    if (g && screen && led && led !== c.command && /#talk$/.test(c.id)) {
      const row = Doable.one(g, screen, a.choice, a.command);
      return row.called ?? row.label;
    }
    if (c.alone) { return c.alone; }
    const subject = a.subject && app.menu.scene?.subjects.find(x => x.id === a.subject);
    if (subject && /#look$/.test(c.id)) { return `Look at ${subject.name.replace(/^(The|A|An|Some) /, m => m.toLowerCase())}`; }
    // Something done to what bars a way, as the act ("Pick the corn-store padlock"), not the way it is on.
    const tried = /^exit:[^/]+\/\d+:/.test(c.id) ? / — (.+)$/.exec(c.label)?.[1] : undefined;
    return tried ? Words.upper(tried) : MenuModel.said(app.menu, c);
  }
  // Why, unless it is said already ("Talk to your brother" is not "your brother" again, nor a fight's reckoning that its
  // mark says whole); for what is found by turning to someone or something, what it is (the ruts, to follow).
  static note(a: Promoted, c: Choice, label: string): string | undefined {
    // Within a talk, what it is led for first (the question that teaches, the asking to come along: Promoted.inside).
    const inside = a.unmet ? undefined : GlanceStage.within(a, c);
    // Its first letter lowered as an aside's is, never the names in it ("ask brother anselm": M22's review).
    const lowered = inside && `${inside.charAt(0).toLowerCase()}${inside.slice(1)}`;
    const note = a.note ?? lowered, said = [label, ...a.marks.map(m => m.said)].join(' ').toLowerCase();
    return note && !said.includes(note.toLowerCase()) ? note : undefined;
  }
  // The words of what a talk is led for within it (the question that teaches, the asking to come along).
  static within(a: Promoted, c: Choice): string | undefined {
    const within = a.for ?? a.inside?.[0]?.command ?? a.command;
    return within && within !== c.command
      ? Attending.all(c.children ?? []).find(k => k.command === within)?.label : undefined;
  }
  // The quiet row: the nearest ways the glance rows (across the open country, the compass).
  static Row({ app, draw, glance: g }: { app: ReaderApp; draw: Draw; glance: Glance }) {
    // Every way from here, once, in the panel beside the picture, never over it (the owner, 4 November evening): which
    // way it goes, where, how long; the aim's marked. Ranked as the glance ranks them.
    // Each a short label, its kind by its mark (into, out, up, down); what more there is to say of one (how long, what
    // it risks, why it is shut) in one line under them, for the way under the finger or the keys, or the aim's (the
    // owner, 4 November, late: a way's reasons had swollen its button to half the panel). Those within the town and
    // those out of it apart, so how to leave is plain.
    const screen = app.state.frame!.screen, aimed = PlaceStage.aimed(app);
    const open = SceneSurface.open(screen, SceneSurface.choices(app), [...g.acts.map(a => a.choice), ...g.ways]);
    if (!open.length) { return null; }
    const ways = open.map(({ c, exit }) => ({ c, exit, whither: SceneSurface.whither(exit),
      name: exit?.destination.name ?? c.label.replace(/^To /, ''),
      aim: aimed.some(id => id === c.id || id.startsWith(`${exit?.id}/`)) }));
    const leaving = (w: (typeof ways)[number]) => ['Out', 'Away'].includes(w.whither);
    const shown = ways.find(w => w.c.id === app.state.hovered) ?? ways.find(w => w.aim);
    const town = screen.path.find(p => ['settlement', 'site'].includes(p.kind))?.name;
    const group = (list: typeof ways, label: string) => list.length > 0 && <div className="way-group">
      <p className="label">{label}</p>
      <ul>{list.map(w => <li key={w.c.id} onMouseEnter={() => app.hover(w.c.id)} onFocus={() => app.hover(w.c.id)}
        onClickCapture={() => { if (w.c.disabled) { app.hover(w.c.id); } }}>
        <Act.View choice={w.c} draw={draw} quiet variant="glyph" className={`way-tile${w.aim ? ' aimed' : ''}`}>
          <span className={`glyph whither-${w.whither.toLowerCase()}`} aria-hidden="true">
            {Signs.way(w.whither, !!w.c.disabled)}</span>
          <span className="n">{GlanceStage.short(w.exit?.destination.name ?? w.c.label.replace(/^To /, ''))}</span>
        </Act.View></li>)}</ul></div>;
    return (
      <nav className="ways-here" aria-label="The ways from here">
        {group(ways.filter(w => !leaving(w)), town ? `In ${Typography.curl(town.replace(/^the /i, 'the '))}` : 'Ways')}
        {group(ways.filter(leaving), town ? `Out of ${Typography.curl(town)}` : 'Out')}
        <p className="way-detail" aria-live="polite">{shown ? GlanceStage.detail(shown) : ''}</p>
      </nav>
    );
  }
  // A way's label: its place's name without the article it is said with ("The byre" is Byre), the whole name in the
  // way's detail line.
  static short(name: string): string { return Typography.curl(Words.upper(name.replace(/^(the|a|an) /i, ''))); }
  // What more there is to say of a way than its name: which way it goes and how long, the aim's, what it risks, and
  // why it is shut if it is.
  static detail(w: { c: Choice; whither: string; aim: boolean; name: string }): string {
    const c = w.c, time = (c.minutes ?? 0) > 5 ? Words.span(c.minutes!) : '';
    return Typography.curl([w.name, c.disabled ? `shut: ${c.disabled}` : '', w.aim ? 'your aim' : '',
      w.whither !== 'To' ? w.whither.toLowerCase() : '', time, ...(c.marks ?? []).map(m => m.said)]
      .filter(Boolean).map((x, i) => i ? x : Words.upper(x)).join(' · '));
  }
  // What else is here and what the company can do of itself, at once, not a sheet away (the owner, 4 November
  // evening: Every way, Look about and More had been crutches): the animals and things here, each with what can be
  // done with it; what the place offers to do; and the company's own acts (wait, search, rest, light).
  static Around({ app, draw, led, apart }: { app: ReaderApp; draw: Draw; led: Set<string | undefined>; apart?: boolean }) {
    const scene = app.menu.scene;
    if (!scene) { return null; }
    const doing = scene.you.filter(c => SceneModel.own(c) && !led.has(c.id));
    // Not again what a lead above is about (the charcoal stack, led with and a chip both).
    const small = scene.subjects.filter(x => (x.kind === 'animal' || x.kind === 'thing') && !x.danger
      && !x.choices.some(c => led.has(c.id) || (c.children ?? []).some(k => led.has(k.id))));
    const yours = scene.you.filter(c => !SceneModel.own(c));
    return <>
      {small.length > 0 && <div className="also-here" data-line="To look at">
        <p className="label">{small.some(x => x.kind === 'thing') ? 'Here too' : 'Animals'}</p>
        <ul className="chips">{small.map(x => <li key={x.id} data-subject={x.id}>
          <PlaceStage.Chip subject={x} draw={draw} /></li>)}</ul></div>}
      {doing.length > 0 && <div className="doing" data-line="To do here"><p className="label">To do here</p>
        <Act.List choices={doing} draw={draw} className="small" marked /></div>}
      {yours.length > 0 && !apart && <GlanceStage.Yours app={app} draw={draw} />}
    </>;
  }
  // What the company can do of itself wherever it is (wait, search, rest, light a candle).
  static Yours({ app, draw }: { app: ReaderApp; draw: Draw }) {
    const yours = (app.menu.scene?.you ?? []).filter(c => !SceneModel.own(c));
    return yours.length > 0 && <div className="yours-here" data-line="Yourself">
      <p className="label">Yourself</p>
      <Act.List choices={yours} draw={draw} className="small" marked /></div>;
  }
  // A place with no one in it and little to do (a cellar, a stair) is drawn as one column, what to do under what is
  // told, not two panes half empty (the product-design review's PD-06).
  static sparse(app: ReaderApp, acts: Promoted[], g: Glance): boolean {
    return !GlanceStage.people(app).length && acts.length + g.ways.length <= 3;
  }
  // What the glance ranks first, as the page draws it; and where it is among the page's choices (-1, none).
  static first(app: ReaderApp): string | undefined {
    const first = app.state.frame?.leaf.glance?.acts[0];
    return first && GlanceStage.choice(app, first.choice)?.id;
  }
  static top(app: ReaderApp): number {
    const id = GlanceStage.first(app);
    return id ? app.menu.choices.findIndex(c => c.id === id) : -1;
  }
  // A way out into the country, in a town or a site, is drawn as going out to it (see MenuModel.place).
  static choice(app: ReaderApp, id: string): Choice | undefined {
    return MenuModel.lead(app.menu, id);
  }
}
