import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Glyphs } from '../creation/glyphs';
import { DigitSettle } from '../digit-settle';
import type { Talk } from '../../../src/ui/attention';
import type { Choice } from '../../../src/ui/choice-list';
import type { ReaderApp } from '../reader-app';
import type { TalkLine } from '../../../src/frame/talk-lines';
import { Typography } from '../../../src/presentation/typography';
import { RecruitSaid } from '../../../src/presentation/recruit-said';
import { Words } from '../../../src/presentation/words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Moments } from './moments';
import { Told } from './told';
import type { Ware } from '../../../src/frame/wares';
import { TalkFocus } from '../../../src/ui/talk-focus';
import { MenuTree } from '../../../src/frame/menu-tree';
import { TalkQuestion, type TalkAsked } from '../../../src/frame/talk-question';
import { AimNear } from '../aim-near';
import { Guidance } from '../guidance';
import { Pip } from './pip';
import { Fold, type Leaf } from '../../../src/presentation/fold';
import { ChoiceRow } from './choice-row';
import { PageFrame } from '../page-frame';
import type { Promoted } from '../../../src/presentation/glance-types';

// Speaking with someone. Their painting, large, with their name on it; beside it the conversation: what they were
// doing when you came over, what they said to you and you to them, in order, and what you came to know, which scrolls
// when it is long; and held under it, what you might say next, numbered, and taking your leave, never scrolled away
// (an instrumented session spent four of its ten scrolls reaching "Take your leave": the play-structure
// investigation's PT-42). Nothing else on the stage: the place is where you left it.
export class TalkStage {
  // A new aim as said in talk: taken up where it is to hand, noted where it is further off (see AimNear).
  static aimed(app: ReaderApp | undefined, line: { text: string; aim?: string }): string {
    const screen = app?.state.frame?.screen;
    // A place's own aim folded into an aim held for it is what is known of that place, not an aim of its own.
    if (line.aim ? screen && !screen.aims?.some(a => a.id === line.aim)
      : screen?.aims?.some(a => a.about?.includes(line.text))) { return 'Of your aim'; }
    return !screen || AimNear.near(screen, line.aim ? { id: line.aim } : line.text) ? 'A new aim' : 'Noted, further off';
  }
  // at: the page of its topics to draw where it is not the one the engine's question is on (a census reads each page
  // as the page draws it): the question asked again at that page.
  // Everything drawn is the engine's question (OR-1451: MenuTree.question, the frame's): what has passed, what has
  // been asked, the page of what can be said, the wares open; the page keeps none of it, and turning the page, Trade
  // and Back are its rows, done as any act is (focus:…).
  static View({ app, talk, at }: { app: ReaderApp; talk: Talk; at?: number }) {
    // The numbered replies seen as they are drawn, so that a digit pressed as they change is refused (DigitSettle).
    useLayoutEffect(() => { DigitSettle.seen(DigitSettle.drawn()); });
    const s = app.state, frame = s.frame!, who = talk.subject, draw = Act.draw(app), q = TalkStage.question(app, talk, at);
    // A name begins with a capital where it heads the page ("The wagoner", not "the wagoner": the owner, 7 November).
    const [name, ...role] = [Words.upper(Words.short(who.name)), who.note && Words.described(who.note)]
      .filter(Boolean) as string[];
    // What the aim followed asks of them is drawn in its gold, as their likeness is (the owner, 8 November): the
    // glance's own next step (Emphasis.within), never a reply whose words echo the aim's (M21's PL-15); each reply as
    // what the glance found in it, and only that (the question's marks: Attest.reply), as it stands now.
    const gilded = Guidance.shown(app);
    const spent = (c: Choice) => q.asked.includes(c.id) || /_again(\(|$)/.test(c.command ?? '');
    const drawn = (c: Choice) => q.marks[c.id] ?? [], row = (id: string) => q.rows.find(r => r.id === id);
    const opened = new Set(q.opened), a = q.answers.length, trade = row(TalkQuestion.trade), more = row(TalkQuestion.more);
    const back = row(TalkQuestion.back);
    // Four acts in view (the owner's ruling 2): taking your leave always, and in the three rows before it any answer
    // owed, then what can be said and Trade, a page at a time; each row's key is its place, 1 to 4.
    // No × beside the menu: taking your leave is its last row, and Escape (the owner, 16 November night: every
    // control of a page in its one menu or its rail).
    return (
      <PageFrame.View kind="talk" className="talk" body="dialogue"
        background={<TalkStage.Sitter app={app} />}
        header={<TalkStage.Speaker app={app} name={name!} role={role.join(' · ')}>
          <Stage.When frame={frame} extra={frame.screen.place.name} /></TalkStage.Speaker>}
        narrative={<TalkStage.Lines lines={q.lines} pending={s.pending?.said} ready={Moments.ready(frame.screen)} app={app} />}
        menu={<div className="answer">
            <div className="choosing">
              {q.trading ? <TalkStage.Trading app={app} q={q} draw={draw} /> : <>
                {who.recruit && <TalkStage.Recruit recruit={who.recruit} coin={frame.screen.purse.coin} />}
                {/* A question put to the company is answered first, by its answers (Low Water's 5, the Liberty of the
                    Ice's 10: three answers to Callow's question had stood among the rest, as topics). */}
                {q.answers.length > 0 && <><p className="answering">Your answer</p>
                  <ol className="replies answers" aria-label="Your answer">{q.answers.map((c, i) => <TalkStage.Reply
                    key={c.id} choice={c} draw={draw} number={i + 1} leaves={drawn(c)} gilded={gilded} />)}</ol></>}
                {/* Trade in the aim's gold where what the aim asks of them is had in trade (a sale, to the debtor home
                    with what would fetch coin: Mission 20). */}
                <TalkStage.Topics draw={draw} name={name!} shown={q.shown} first={a + 1} spent={spent} opened={opened}
                  gilded={gilded} drawn={drawn} paying={frame.screen.paying} trade={trade && <TalkStage.ToTrade app={app}
                    row={trade} leaves={drawn(trade)} gilded={gilded} />} />
              </>}
            </div>
            {/* The way out, always in view at the foot (round 5: under the fade at a long counter, half there): Back
                from trading, which is the way out while trading; else taking your leave, the last of the four. */}
            <ol className="leave replies">
              {q.trading && back ? <li><ChoiceRow.Button data={{ action: 'trade-back' }} onClick={() => app.choose(back)}
                plain="neutral" label="Back" /></li>
                : <li><ChoiceRow.Act choice={talk.leave} draw={draw} number={a + q.shown.length + 1}
                  plain="neutral" label={talk.leave.label} /></li>}
              {/* The page turned last, below the acts, which run 1 to 4 without a gap (M22's review: 1, 2, 3, the
                  pager, 4). */}
              {/* Marked by the fold of what it turns to (AT-07 §5 step 3): Trade's services, and the topics not in view. */}
              {!q.trading && more && <li className="more-talk"><ChoiceRow.Button data={{ action: 'more-talk' }}
                onClick={() => app.choose(more)} {...ChoiceRow.mark(Fold.mark(drawn(more), gilded))}
                label={more.label} aside={more.note} /></li>}
            </ol>
          </div>} />
    );
  }
  // The engine's question of the talk drawn (the frame's), or asked again at another page of it for a census.
  static question(app: ReaderApp, talk: Talk, at?: number): TalkAsked {
    const frame = app.state.frame!, asked = frame.question?.talk;
    if (asked && asked.talk.subject.id === talk.subject.id && at === undefined) { return asked; }
    const focus = { kind: 'talk' as const, with: talk.subject.id, page: at ?? 0, trading: false };
    return MenuTree.question(frame, focus).talk!;
  }
  // An act as it was led with, but for the aim's gold, which is the aim's next step as it is now.
  static ungilded(a: Promoted): Promoted {
    const rest = Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'continues')) as Promoted;
    return { ...rest, ...a.inside
      ? { inside: a.inside.map(x => ({ ...x, aspects: x.aspects.filter(y => y !== 'undertaking') })) } : {} };
  }
  // Trade, drawn as what the glance found among what is had of them for coin (a bed for the night, what the aim waits
  // on to be sold: Mission 20).
  static ToTrade({ app, row, leaves, gilded }: { app: ReaderApp; row: Choice; leaves: Leaf[]; gilded: boolean }) {
    const indicator = Fold.mark(leaves, gilded);
    // A row like the questions, the width of them all (the owner, 16 November: an action is a full-width row), among them.
    return <ChoiceRow.Button className={indicator?.tone === 'gold' ? 'aimed' : ''}
      data={{ action: 'trade', aspects: TalkStage.aspects(leaves) || undefined }} onClick={() => app.choose(row)} label={row.label}
      {...indicator?.tone ? { indicator } : {}} />;
  }
  static aspects(leaves: readonly Leaf[] | undefined): string {
    return [...new Set((leaves ?? []).flatMap(l => l.witnesses.flatMap(w => w.aspects)))].join(' ');
  }
  // The painting: someone who could be them, as large as the page allows, cropped to the face, with who painted it
  // as far as the painting itself says. Where no painting fits them, the page is theirs in type: their name, large,
  // and what they are, rather than a picture of someone they are not (the country's own painting behind the name of
  // a minstrel read as "a different landscape each time instead of a face": the cold evaluation).
  // A painting that cannot be had (images refused, or the page offline) leaves the page in type, as one that does not
  // fit: the Bushweald play without images found a black slab, a broken picture and its painter's credit.
  // Nothing is set over the painting (OR-1088, OR-1092, the owner, 26 November: the page had borrowed its composition
  // from the portraits, its name set large over them, and broke without one, and over a light-ground portrait): the
  // painting has its column to itself, its edges darkened into the room, and the painter's credit at its darkened
  // foot. Unpainted, the column holds a plate, as a book's are (the people's emblem, or anyone's, inked in a ruled
  // frame of a portrait's proportion), so that the page composes the same with or without a likeness: never a hole,
  // never a name alone (the owner, 5 and 7 November).
  static Sitter({ app }: { app: ReaderApp }) {
    const given = app.menu.talk!.subject.portrait, [failed, fail] = useState<string>();
    const portrait = given && given.large !== failed ? given : undefined;
    return (
      <div className={`sitter${portrait ? '' : ' unpainted'}`}>
        {portrait && <img src={portrait.large} alt="" decoding="async" onError={() => fail(portrait.large)}
          style={{ objectPosition: `50% ${portrait.focus}%` }} />}
        {/* Credited where the painter is known; nothing said where not ("Painter unrecorded" read as a defect). */}
        {portrait?.credit && <p className="credit">{portrait.credit}</p>}
        {!portrait && <figure className="plate" aria-hidden="true">
          <Glyphs.View id={Glyphs.met(app.menu.talk!.subject)} className="sitter-emblem" /></figure>}
      </div>
    );
  }
  // Who is spoken with, heading the exchange in its own column at the frame's one heading scale (OR-1088: a large,
  // faint name in a void above had been cut off from what was said): their name, what they are, and where and when; on
  // a narrow screen with no painting, their emblem small beside the name, the plate's.
  static Speaker({ app, name, role, children }: { app: ReaderApp; name: string; role: string; children?: ReactNode }) {
    return (
      <header className="speaker">
        {!app.menu.talk!.subject.portrait && <Glyphs.View id={Glyphs.met(app.menu.talk!.subject)} className="seal" />}
        <div className="said-of">
          {role && <p className="r">{Typography.curl(role)}</p>}
          <h1 className="n">{Typography.curl(name)}</h1>
          {children}
        </div>
      </header>
    );
  }
  // What has passed between you, newest last and kept in view; when the newest is longer than there is room for, from
  // its beginning (what you said), not its end; but a new aim it brings is kept in view whole, before its beginning
  // (round 5: "A new aim" fell below the room for talk, and was seen only in the notes).
  // How deep the fade over what was said before is (talk.css .lines[data-above]).
  static readonly fade = 48;
  static Lines({ lines, pending, ready, app }: { lines: TalkLine[]; pending?: string; ready?: string; app?: ReaderApp }) {
    const end = useRef<HTMLDivElement>(null), newest = useRef<HTMLParagraphElement>(null);
    const aim = useRef<HTMLParagraphElement>(null), answer = useRef<HTMLParagraphElement>(null);
    // What is kept in view whole when it comes: a new aim, or something seen through (the moment had been cut through);
    // but never by scrolling the answer's first words out of view (M22's second review, OR-40: Fox's reply to the
    // letter had been pushed off the top, "You know now" and "A new aim" whole beneath it).
    const from = Math.max(0, lines.map(l => l.kind).lastIndexOf('you'));
    const replied = lines.findIndex((l, i) => i > from && ['speech', 'telling', 'event'].includes(l.kind)), last = lines.map((l, i) => l.kind === 'aim'
      || l.ended ? i : -1).reduce((a, b) => Math.max(a, b), -1);
    useLayoutEffect(() => {
      // One page (OR-149): what you said last brought to the head of the view, the answer under it; the page
      // scrolls, not a box of its own.
      (newest.current ?? end.current)?.scrollIntoView({ block: newest.current ? 'start' : 'nearest' });
      const box = end.current?.parentElement, first = newest.current;
      if (box && first && first.getBoundingClientRect().top < box.getBoundingClientRect().top) {
        box.scrollTop -= box.getBoundingClientRect().top - first.getBoundingClientRect().top;
      }
      const below = box && aim.current ? aim.current.getBoundingClientRect().bottom - box.getBoundingClientRect().bottom : 0;
      const room = box && answer.current ? answer.current.getBoundingClientRect().top - box.getBoundingClientRect().top
        : Infinity;
      if (box && below > 0) { box.scrollTop += Math.min(below, Math.max(0, room)); }
      // The answer's first words below the fade over what was said before (M22's third review: each reply's first line
      // had been faded as if it had scrolled away).
      const under = box && answer.current ? TalkStage.fade - (answer.current.getBoundingClientRect().top
        - box.getBoundingClientRect().top) : 0;
      if (box && under > 0 && box.scrollTop > 4) { box.scrollTop -= Math.min(box.scrollTop, under); }
      // Where what was said begins above what is in view (an aim kept whole under it), the box says so at its head.
      box?.toggleAttribute('data-above', box.scrollTop > 4);
    }, [lines.length, pending]);
    // What was said before the last three things said is folded away: a conversation had scrolled into an
    // ever-growing log (round 7, L).
    // The whole of it, one page (OR-149): nothing folded away above.
    const cut = 0;
    const line = (l: TalkLine, i: number) => {
      // Something seen through, or a level gained, is set apart here as on the place's page; a check's dice, said as
      // what decided it ("Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13)."), is a disclosure,
      // never a line of what was said (the owner's ruling 1): each as the engine says the line is (AR-05).
      const { ended, levelled } = l;
      // Things learned together are one "You know now", a line each: four of them, each under its own label, had
      // filled the room for talk, and only the first label was in view (Mission 20's fourth round, E 34).
      // By what the label says, given or not: notes from the engine carry "You know now" as theirs (round 5's three).
      const prior = lines[i - 1], said = (x: TalkLine) => x.label ?? 'You know now';
      const more = l.kind === 'learned' && prior?.kind === 'learned' && said(l) === said(prior);
      return ended ? <div key={i} ref={i === last && last > from ? aim : undefined}><Moments.SeenThrough ended={ended} ready={ready} /></div>
        : l.roll ? <details key={i} className="how"><summary>How it fell</summary>
          <p>{Typography.curl(l.text)}</p></details>
        : levelled ? <Moments.Levelled key={i} levels={[levelled]} />
        : l.kind === 'learned' || l.kind === 'aim'
          ? <p key={i} ref={i === from ? newest : i === last && last > from ? aim : undefined}
            className={`line learned ${l.kind}${more ? ' more' : ''}`}>
            {!more && <b>{l.label ?? (l.kind === 'aim' ? TalkStage.aimed(app, l) : 'You know now')}</b>}
            <Told.Said text={l.text} /></p>
          : <p key={i} ref={i === from ? newest : i === replied ? answer : undefined} className={`line ${l.kind}`}>
            <Told.Said text={l.text} /></p>;
    };
    return (
      <div className="lines" aria-live="polite"
        onScroll={e => e.currentTarget.toggleAttribute('data-above', e.currentTarget.scrollTop > 4)}>
        {cut > 0 && <details className="said-before"><summary>Said before…</summary>
          {lines.slice(0, cut).map((l, i) => line(l, i))}</details>}
        {lines.slice(cut).map((l, k) => line(l, cut + k))}
        {pending && <p className="line you waiting">{Typography.curl(Words.echo(Words.lastSaid(pending)))}</p>}
        <div ref={end} />
      </div>
    );
  }
  // Someone who would join you, as they would come: what they are and ask, how they fight, their qualities, skills
  // and what they can do (the cold playtest could not see what a recruit could do until they had joined), as a card
  // of a few lines: in full it had filled the middle of the conversation (the play-structure investigation's PT-12),
  // and folded it was a web page's disclosure (the owner's interim report).
  static Recruit({ recruit: r, coin }: { recruit: NonNullable<Talk['subject']['recruit']>; coin: number }) {
    return (
      <section className="recruit" aria-label="What they would bring">
        <p className="summary">{Typography.curl(Words.upper(RecruitSaid.summary(r, coin)))}</p>
        <p className="bearing">{Typography.curl(r.sheet.fighting.map(b => `${b.label}: ${b.value}`).join(' · '))}</p>
        <p className="qualities-line">{r.sheet.qualities.map(q => `${q.name} ${q.score}`).join(' · ')}</p>
        {(r.sheet.skills.length > 0 || r.techniques.length > 0) && <p className="skills-line">{Typography.curl([
          r.sheet.skills.some(s => !s.means)
            ? `Knows ${r.sheet.skills.filter(s => !s.means).map(s => s.name.toLowerCase()).join(', ')}.` : '',
          r.techniques.length ? `Can ${r.techniques.map(x => x.name.toLowerCase()).join(', ')}.` : ''].filter(Boolean).join(' '))}</p>}
      </section>
    );
  }
  // What is had of someone for coin or work, apart from what is said (the owner, 16 November: the trade page in the menu's
  // own rows, never a table, a list that unfolds or an act that is two; 17 November: a long counter is the one narrow
  // exception to the four, a list that scrolls in the menu's place, not pages): what they will buy of what the company
  // carries, what is on their counter (a thing for each of the company that could take it is a row for each), their
  // services; the purse said once above, and what they buy in a line; Back, by the leave, returns to the conversation.
  static Trading({ app, q, draw }: { app: ReaderApp; q: TalkAsked; draw: Draw }) {
    const coin = app.state.frame!.screen.purse.coin, { sales, services: rest, wares, buys, short } = q;
    const who = app.state.frame!.screen.trade.find(c => c.id === q.talk.subject.id)?.name ?? '';
    // Each row drawn with its key, its place on the page (1 to 4).
    const rows: ((n: number) => ReactNode)[] = [
      ...sales.map(c => (n: number) => <TalkStage.Reply key={c.id} choice={c} draw={draw} number={n} />),
      // What they would buy and cannot pay for now: shut, and why (see TradeModel.short).
      ...short.map(x => () => <li key={`short:${x.name}`}><ChoiceRow.Button shut data={{ action: 'unbought' }} onClick={TalkStage.nothing}
        label={Typography.curl(`Sell ${x.name.charAt(0).toLowerCase()}${x.name.slice(1)}`)}
        aside={Typography.curl(`${Words.short(who)} has not the coin for it today (${x.pays})`)} /></li>),
      ...wares.flatMap(w => TalkStage.wareRows(w, coin, draw)),
      ...rest.map(c => (n: number) => <TalkStage.Reply key={c.id} choice={c} draw={draw} number={n} />)];
    return <section className="trading" aria-label="Trade">
      <p className="label">{`You have ${coin} ${app.state.frame!.screen.purse.currency ?? 'coin'}`}</p>
      {buys.length > 0 && <p className="buys">Buys {buys.slice(0, 4).map(b => `${b.name.toLowerCase()} (${b.price})`)
        .join(', ')}{buys.length > 4 ? ', and more' : ''}.</p>}
      <ol className={`replies trade-list${rows.length > 4 ? ' scrolls' : ''}`} data-list>
        {rows.map((row, i) => row(i + 1))}</ol>
    </section>;
  }
  private static nothing(): void { /* a shut row does nothing */ }
  // One thing for sale, as rows: a row where it can be bought, one for each of the company that could take it where it is
  // bought for one of them, a shut one where it cannot be (and why).
  private static wareRows(w: Ware, coin: number, draw: Draw): ((n: number) => ReactNode)[] {
    const name = Typography.curl(Words.upper(w.name));
    const price = `${w.price} coin · ${w.stock > 0 ? `${w.stock} left` : 'none left'}`;
    if (!w.buy) {
      return [() => <li key={w.name}><ChoiceRow.Button shut data={{ action: 'unbought' }} onClick={TalkStage.nothing} label={name}
        aside={price} /></li>];
    }
    const bought = w.buy.children?.length ? w.buy.children : [w.buy];
    return bought.map(k => (n: number) => {
      const versus = / · ((?:better|worse|as good) (?:than|as) your .+)$/.exec(k.label)?.[1];
      // Beyond the purse, it is quieter and says nothing more: what the company has is said once, above.
      const dear = /^It costs \d+ coin, and you have \d+\.$/.test(k.disabled ?? '');
      const who = w.buy!.children?.length ? ` ${Typography.curl(k.label)}` : '';
      return <li key={k.id}><ChoiceRow.Act choice={k} draw={draw} quiet={dear} number={n}
        label={<>{name}{who}</>} aside={versus ? `${price} · ${versus}` : price} /></li>;
    });
  }
  // A question already put stays to be put again, quieter, and says so; one the last answer opened is marked new.
  // What pays the company is marked green, as the likeness that has something for it is (see Owed), and said so to a
  // reader of the page alone (BP-08: its mark carries it).
  // What it is to the company is the one indicator at its left, as a led act's is (see Pip).
  // What can be said, and Trade among it, a page at a time in the rows the leave and any answer leave (see View); the
  // row that turns the page (no act) is under the leave.
  static Topics({ draw, name, shown, first, spent, opened, gilded, drawn, paying, trade }: { draw: Draw;
    name: string; shown: (Choice | 'trade')[]; first: number;
    spent: (c: Choice) => boolean; opened: Set<string>; gilded: boolean; drawn: (c: Choice) => Leaf[];
    paying?: string[]; trade: ReactNode }) {
    return <>
      <ol className="replies" aria-label={`What you might say to ${name}`}>
        {shown.map((c, i) => c === 'trade' ? <li key="trade" className="to-trade">{trade}</li>
          : <TalkStage.Reply key={c.id} choice={c} draw={draw} number={first + i} asked={spent(c)} fresh={opened.has(c.id)}
            leaves={drawn(c)} gilded={gilded} pays={TalkFocus.pays(c, paying)} />)}</ol>
    </>;
  }
  static Reply({ choice: c, draw, number, asked, fresh, leaves, gilded = true, pays }: { choice: Choice; draw: Draw;
    number?: number; asked?: boolean; fresh?: boolean; leaves?: Leaf[]; gilded?: boolean; pays?: boolean }) {
    const indicator = Fold.mark(leaves ?? [], gilded), bar = indicator?.tone, aimed = bar === 'gold';
    return (
      <li className={[asked ? 'asked' : fresh ? 'fresh' : '', aimed ? 'aimed' : '', pays ? 'pays' : '',
        bar ? 'marked' : ''].filter(Boolean).join(' ') || undefined} data-aspects={TalkStage.aspects(leaves) || undefined}
        data-condition={Pip.condition({ spent: asked, fresh })}>
        {/* What is said beside its number, wrapping beside it: on a phone a long one had gone under its number. */}
        <ChoiceRow.Act choice={c} draw={draw} number={number}
          {...bar ? { indicator } : {}}
          label={<span className="said">{Typography.curl(c.label)}{c.note && <small> · {Typography.curl(c.note)}</small>}
            {asked && <small> · asked</small>}{pays && <span className="for-you sr-only">, for you</span>}</span>} />
        {c.children && draw.open.has(c.id) && <ol className="opened-list">{c.children.map(k => <TalkStage.Reply key={k.id}
          choice={k} draw={draw} />)}</ol>}
      </li>
    );
  }
}
