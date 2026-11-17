import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Glyphs } from '../creation/glyphs';
import type { Talk } from '../../../src/ui/attention';
import type { Choice } from '../../../src/ui/choice-list';
import type { Counter } from '../../../src/ui/trade-model';
import type { ReaderApp } from '../reader-app';
import type { TalkLine } from '../conversation';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Moments } from './moments';
import { Told } from './told';
import { Wares, type Ware } from '../wares';
import { TalkFocus } from '../talk-focus';
import { Paging } from '../paging';
import { AimNear } from '../aim-near';
import { Emphasis } from '../../../src/presentation/emphasis';
import { Guidance } from '../guidance';
import { Pip } from './pip';
import { ChoiceRow } from './choice-row';
import { Check } from './check';
import type { Aspect, Promoted } from '../../../src/presentation/glance-types';

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
  static View({ app, talk }: { app: ReaderApp; talk: Talk }) {
    const s = app.state, frame = s.frame!, who = talk.subject, draw = Act.draw(app);
    // A name begins with a capital where it heads the page ("The wagoner", not "the wagoner": the owner, 7 November).
    const [name, ...role] = [Words.upper(Words.short(who.name)), who.note && Words.described(who.note)]
      .filter(Boolean) as string[];
    const counter = frame.screen.trade.find(c => c.id === who.id), { wares, rest } = Wares.of(counter, talk.replies);
    const led = frame.leaf.glance?.acts.find(a => a.subject === who.id)?.for;
    const inside = (s.turned ?? frame.leaf.glance?.acts ?? []).filter(a => a.subject === who.id)
      .flatMap(a => (a.inside ?? []).map(x => x.command));
    const focus = TalkFocus.of(rest, { ...led ? { led } : {}, marked: inside, ...s.heard ? { heard: s.heard } : {}, asked: s.asked,
      weighty: frame.screen.weighty ?? [], paying: frame.screen.paying ?? [] });
    // What the aim followed asks of them is drawn in its gold, as their likeness is (the owner, 8 November: the
    // merchant the rats job sent the company to, and the question to ask her, had been drawn like any other): the
    // glance's own next step (Emphasis.within), never a reply whose words echo the aim's (M21's PL-15).
    // Gold only on what carries the aim on, not whatever the page leads with for them: "Ask Jassin to join the
    // company", led as a recruit, had been drawn in the aim's gold (round 9, Q 54b).
    // And each reply is drawn as what the glance found in it, and only that, so that a likeness drawn blue, or rose,
    // has its blue question, or its asking to come along, drawn so here, and one drawn plain has nothing drawn (see
    // Emphasis.within): a salter with no mark had had every question blue, for each told something.
    // What pays the company is drawn green, as their likeness is (see SceneSubject.owed).
    // As their likeness was drawn when they were turned to (see ReaderState.turned); the aim's next step as it is now.
    const now = frame.leaf.glance?.acts ?? [], acts = s.turned ? [...s.turned.map(TalkStage.ungilded),
      ...now.filter(a => a.continues)] : now;
    const gilded = Guidance.shown(app);
    const spent = (c: Choice) => s.asked.includes(c.id) || /_again(\(|$)/.test(c.command ?? '');
    const drawn = (c: Choice): Aspect[] => spent(c) ? [] : Emphasis.within(acts, c, [
      ...TalkFocus.pays(c, frame.screen.paying) ? ['payoff' as const] : []]);

    // Four acts in view (the owner's ruling 2): taking your leave always, and in the three rows before it any answer
    // owed, then what can be said and Trade, a page at a time; each row's key is its place, 1 to 4.
    const trades = wares.length > 0 || focus.services.length > 0 || (counter?.buys.length ?? 0) > 0;
    const [page, turn] = useState(0), room = 3 - focus.answers.length, a = focus.answers.length;
    const paged = Paging.of([...focus.salient, ...trades ? ['trade' as const] : [], ...focus.more], room, page);
    return (
      <div className="talk" id="page">
        <TalkStage.Sitter app={app} name={name!} role={role.join(' · ')}>
          <Stage.When frame={frame} extra={frame.screen.place.name} /></TalkStage.Sitter>
        <div className="dialogue">
          <TalkStage.Lines lines={s.talk} pending={s.pending?.said} ready={Moments.ready(frame.screen)} app={app} />
          <div data-menu className="answer">
            <div className="choosing">
              {s.trading ? <TalkStage.Trading app={app} wares={wares} services={focus.services} buys={counter?.buys ?? []}
                short={counter?.short ?? []} who={counter?.name ?? ''}
                draw={draw} /> : <>
                {who.recruit && <TalkStage.Recruit recruit={who.recruit} coin={frame.screen.purse.coin} />}
                {/* A question put to the company is answered first, by its answers (Low Water's 5, the Liberty of the
                    Ice's 10: three answers to Callow's question had stood among the rest, as topics). */}
                {focus.answers.length > 0 && <><p className="answering">Your answer</p>
                  <ol className="replies answers" aria-label="Your answer">{focus.answers.map((c, i) => <TalkStage.Reply
                    key={c.id} choice={c} draw={draw} number={i + 1} aspects={drawn(c)} gilded={gilded} />)}</ol></>}
                {/* Trade in the aim's gold where what the aim asks of them is had in trade (a sale, to the debtor home
                    with what would fetch coin: Mission 20). */}
                <TalkStage.Topics draw={draw} name={name!} paged={paged} first={a + 1} spent={spent} opened={focus.opened}
                  gilded={gilded} drawn={drawn} paying={frame.screen.paying} trade={<TalkStage.ToTrade app={app}
                    aspects={[...new Set(focus.services.flatMap(drawn))]} gilded={gilded} />} />
              </>}
            </div>
            {/* The way out, always in view at the foot (round 5: under the fade at a long counter, half there): Back
                from trading, which is the way out while trading; else taking your leave, the last of the four. */}
            <ol className="leave replies">
              {s.trading ? <li><ChoiceRow.Button data={{ action: 'trade-back' }} onClick={() => app.trade(false)}
                mark={ChoiceRow.neutral} markClass="neutral" label="Back" /></li>
                : <li><ChoiceRow.Act choice={talk.leave} draw={draw} number={a + paged.shown.length + 1}
                  label={talk.leave.label} /></li>}
              {/* The page turned last, below the acts, which run 1 to 4 without a gap (M22's review: 1, 2, 3, the
                  pager, 4). */}
              {!s.trading && paged.pages > 1 && <li className="more-talk"><ChoiceRow.Button data={{ action: 'more-talk' }}
                onClick={() => turn(paged.at + 1)} mark={ChoiceRow.neutral} markClass="neutral"
                label={[...focus.salient, ...focus.more].every(spent) ? 'Ask again…' : 'Something else…'}
                aside={`${paged.at + 1} of ${paged.pages}`} /></li>}
            </ol>
          </div>
        </div>
        {/* No × beside the menu: taking your leave is its last row, and Escape (the owner, 16 November night: every
            control of a page in its one menu or its rail). */}
      </div>
    );
  }
  // An act as it was led with, but for the aim's gold, which is the aim's next step as it is now.
  static ungilded(a: Promoted): Promoted {
    const rest = Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'continues')) as Promoted;
    return { ...rest, ...a.inside
      ? { inside: a.inside.map(x => ({ ...x, aspects: x.aspects.filter(y => y !== 'undertaking') })) } : {} };
  }
  // Trade, drawn as what the glance found among what is had of them for coin (a bed for the night, what the aim waits
  // on to be sold: Mission 20).
  static ToTrade({ app, aspects, gilded }: { app: ReaderApp; aspects: Aspect[]; gilded: boolean }) {
    const bar = Pip.fill(aspects, gilded);
    // A row like the questions, the width of them all (the owner, 16 November: an action is a full-width row), among them.
    return <ChoiceRow.Button className={gilded && aspects.includes('undertaking') ? 'aimed' : ''}
      data={{ action: 'trade', aspects: aspects.join(' ') || undefined }} onClick={() => app.trade(true)} label="Trade"
      {...bar ? { mark: bar, markLabel: Pip.words(aspects, gilded) } : {}} />;
  }
  // The painting: someone who could be them, as large as the page allows, cropped to the face, with who painted it
  // as far as the painting itself says. Where no painting fits them, the page is theirs in type: their name, large,
  // and what they are, rather than a picture of someone they are not (the country's own painting behind the name of
  // a minstrel read as "a different landscape each time instead of a face": the cold evaluation).
  // A painting that cannot be had (images refused, or the page offline) leaves the page in type, as one that does not
  // fit: the Bushweald play without images found a black slab, a broken picture and its painter's credit.
  static Sitter({ app, name, role, children }: { app: ReaderApp; name: string; role: string; children?: ReactNode }) {
    const given = app.menu.talk!.subject.portrait, [failed, fail] = useState<string>();
    const portrait = given && given.large !== failed ? given : undefined;
    return (
      <div className={`sitter${portrait ? '' : ' unpainted'}`}>
        {portrait && <img src={portrait.large} alt="" decoding="async" onError={() => fail(portrait.large)}
          style={{ objectPosition: `50% ${portrait.focus}%` }} />}
        {/* Credited where the painter is known; nothing said where not ("Painter unrecorded" read as a defect). */}
        {portrait?.credit && <p className="credit">{portrait.credit}</p>}
        {/* Unpainted, their people's emblem stands large and faint behind their name (the owner, 5 November), or
            anyone's where their people have none drawn: never a name alone (7 November). */}
        {!portrait && <Glyphs.View id={Glyphs.met(app.menu.talk!.subject)} className="sitter-emblem" />}
        <div className="cap"><h1 className="n">{Typography.curl(name)}</h1>{role && <p className="r">{Typography.curl(role)}</p>}
          {children}</div>
      </div>
    );
  }
  // What has passed between you, newest last and kept in view; when the newest is longer than there is room for, from
  // its beginning (what you said), not its end; but a new aim it brings is kept in view whole, before its beginning
  // (round 5: "A new aim" fell below the room for talk, and was seen only in the notes).
  static Lines({ lines, pending, ready, app }: { lines: TalkLine[]; pending?: string; ready?: string; app?: ReaderApp }) {
    const end = useRef<HTMLDivElement>(null), newest = useRef<HTMLParagraphElement>(null);
    const aim = useRef<HTMLParagraphElement>(null);
    // What is kept in view whole when it comes: a new aim, or something seen through (the moment had been cut through).
    const from = Math.max(0, lines.map(l => l.kind).lastIndexOf('you')), last = lines.map((l, i) => l.kind === 'aim'
      || Moments.ending.test(l.text) ? i : -1).reduce((a, b) => Math.max(a, b), -1);
    useLayoutEffect(() => {
      end.current?.scrollIntoView({ block: 'nearest' });
      const box = end.current?.parentElement, first = newest.current;
      if (box && first && first.getBoundingClientRect().top < box.getBoundingClientRect().top) {
        box.scrollTop -= box.getBoundingClientRect().top - first.getBoundingClientRect().top;
      }
      const below = box && aim.current ? aim.current.getBoundingClientRect().bottom - box.getBoundingClientRect().bottom : 0;
      if (box && below > 0) { box.scrollTop += below; }
      // Where what was said begins above what is in view (an aim kept whole under it), the box says so at its head.
      box?.toggleAttribute('data-above', box.scrollTop > 4);
    }, [lines.length, pending]);
    // What was said before the last three things said is folded away: a conversation had scrolled into an
    // ever-growing log (round 7, L).
    const yours = lines.flatMap((l, i) => l.kind === 'you' ? [i] : []), cut = yours.length > 3 ? yours.at(-3)! : 0;
    const line = (l: TalkLine, i: number) => {
      // Something seen through, or a level gained, is set apart here as on the place's page.
      const ended = Moments.ending.exec(l.text), levelled = Moments.levelled.exec(l.text);
      // Things learned together are one "You know now", a line each: four of them, each under its own label, had
      // filled the room for talk, and only the first label was in view (Mission 20's fourth round, E 34).
      // By what the label says, given or not: notes from the engine carry "You know now" as theirs (round 5's three).
      const prior = lines[i - 1], said = (x: TalkLine) => x.label ?? 'You know now';
      const more = l.kind === 'learned' && prior?.kind === 'learned' && said(l) === said(prior);
      return ended ? <div key={i} ref={i === last && last > from ? aim : undefined}><Moments.SeenThrough ended={ended} ready={ready} /></div>
        : TalkStage.check.test(l.text) ? <details key={i} className="how"><summary>How it fell</summary>
          <p>{Typography.curl(l.text)}</p></details>
        : levelled ? <Moments.Levelled key={i} levels={[levelled]} />
        : l.kind === 'learned' || l.kind === 'aim'
          ? <p key={i} ref={i === from ? newest : i === last && last > from ? aim : undefined}
            className={`line learned ${l.kind}${more ? ' more' : ''}`}>
            {!more && <b>{l.label ?? (l.kind === 'aim' ? TalkStage.aimed(app, l) : 'You know now')}</b>}
            <Told.Said text={l.text} /></p>
          : <p key={i} ref={i === from ? newest : undefined} className={`line ${l.kind}`}><Told.Said text={l.text} /></p>;
    };
    return (
      <div className="lines" aria-live="polite"
        onScroll={e => e.currentTarget.toggleAttribute('data-above', e.currentTarget.scrollTop > 4)}>
        {cut > 0 && <details className="said-before"><summary>Said before…</summary>
          {lines.slice(0, cut).map((l, i) => line(l, i))}</details>}
        {lines.slice(cut).map((l, k) => line(l, cut + k))}
        {pending && <p className="line you waiting">{Typography.curl(Words.lastSaid(pending))}</p>}
        <div ref={end} />
      </div>
    );
  }
  // Someone who would join you, as they would come: what they are and ask, how they fight, their qualities, skills
  // and what they can do (the cold playtest could not see what a recruit could do until they had joined), as a card
  // of a few lines: in full it had filled the middle of the conversation (the play-structure investigation's PT-12),
  // and folded it was a web page's disclosure (the owner's interim report).
  static Recruit({ recruit: r, coin }: { recruit: NonNullable<Talk['subject']['recruit']>; coin: number }) {
    const ask = r.hire ? `${r.hire} coin${r.hire > coin ? `, more than you have` : ''}` : 'nothing';
    return (
      <section className="recruit" aria-label="What they would bring">
        <p className="summary">{Typography.curl(`${Words.upper(Words.article(r.line))} of level ${r.level}, asking ${ask}`)}</p>
        <p className="bearing">{Typography.curl(r.sheet.fighting.map(b => `${b.label}: ${b.value}`).join(' · '))}</p>
        <p className="qualities-line">{r.sheet.qualities.map(q => `${q.name} ${q.score}`).join(' · ')}</p>
        {(r.sheet.skills.length > 0 || r.techniques.length > 0) && <p className="skills-line">{Typography.curl([
          r.sheet.skills.some(s => !s.means)
            ? `Knows ${r.sheet.skills.filter(s => !s.means).map(s => s.name.toLowerCase()).join(', ')}.` : '',
          r.techniques.length ? `Can ${r.techniques.map(x => x.name.toLowerCase()).join(', ')}.` : ''].filter(Boolean).join(' '))}</p>}
      </section>
    );
  }
  // A check's dice, said as what decided it ("Nest makes the persuasion check (d20 17 + charisma 0 = 17 against 13)."),
  // read as the place's page reads a roll (Check): a disclosure, never a line of what was said (the owner's ruling 1).
  static readonly check = { test: (text: string): boolean => !!Check.read(text) };
  // What is had of someone for coin or work, apart from what is said (the owner, 17 November: the trade page in the menu's own
  // rows, four at a time, never a table, a list that unfolds or an act that is two): what they will buy of what the company
  // carries, what is on their counter (a thing for each of the company that could take it is a row for each), their
  // services; the purse said once above, and what they buy in a line; Back, by the leave, returns to the conversation.
  static Trading({ app, wares, services, buys, short, who, draw }: { app: ReaderApp; wares: Ware[]; services: Choice[];
    buys: Counter['buys']; short: NonNullable<Counter['short']>; who: string; draw: Draw }) {
    const coin = app.state.frame!.screen.purse.coin, [page, turn] = useState(0), { sales, rest } = TalkFocus.parted(services);
    // Each row drawn with its key, its place on the page (1 to 4).
    const rows: ((n: number) => ReactNode)[] = [
      ...sales.map(c => (n: number) => <TalkStage.Reply key={c.id} choice={c} draw={draw} number={n} />),
      // What they would buy and cannot pay for now: shut, and why (see TradeModel.short).
      ...short.map(x => () => <li key={`short:${x.name}`}><ChoiceRow.Button shut data={{ action: 'unbought' }} onClick={TalkStage.nothing}
        label={Typography.curl(`Sell ${x.name.charAt(0).toLowerCase()}${x.name.slice(1)}`)}
        aside={Typography.curl(`${Words.short(who)} has not the coin for it today (${x.pays})`)} /></li>),
      ...wares.flatMap(w => TalkStage.wareRows(w, coin, draw)),
      ...rest.map(c => (n: number) => <TalkStage.Reply key={c.id} choice={c} draw={draw} number={n} />)];
    const per = 4, pages = Math.max(1, Math.ceil(rows.length / per)), at = page % pages;
    return <section className="trading" aria-label="Trade">
      <p className="label">{`You have ${coin} coin`}</p>
      {buys.length > 0 && <p className="buys">Buys {buys.slice(0, 4).map(b => `${b.name.toLowerCase()} (${b.price})`)
        .join(', ')}{buys.length > 4 ? ', and more' : ''}.</p>}
      <ol className="replies">{rows.slice(at * per, at * per + per).map((row, i) => row(i + 1))}</ol>
      {pages > 1 && <ol className="replies more-talk"><li><ChoiceRow.Button data={{ action: 'more-trade' }}
        onClick={() => turn(at + 1)} mark={ChoiceRow.neutral} markClass="neutral"
        label="More to trade…" aside={`${at + 1} of ${pages}`} /></li></ol>}
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
  static Topics({ draw, name, paged, first, spent, opened, gilded, drawn, paying, trade }: { draw: Draw;
    name: string; paged: ReturnType<typeof Paging.of<Choice | 'trade'>>; first: number;
    spent: (c: Choice) => boolean; opened: Set<string>; gilded: boolean; drawn: (c: Choice) => Aspect[];
    paying?: string[]; trade: ReactNode }) {
    return <>
      <ol className="replies" aria-label={`What you might say to ${name}`}>
        {paged.shown.map((c, i) => c === 'trade' ? <li key="trade" className="to-trade">{trade}</li>
          : <TalkStage.Reply key={c.id} choice={c} draw={draw} number={first + i} asked={spent(c)} fresh={opened.has(c.id)}
            aspects={drawn(c)} gilded={gilded} pays={TalkFocus.pays(c, paying)} />)}</ol>
    </>;
  }
  static Reply({ choice: c, draw, number, asked, fresh, aspects, gilded = true, pays }: { choice: Choice; draw: Draw;
    number?: number; asked?: boolean; fresh?: boolean; aspects?: Aspect[]; gilded?: boolean; pays?: boolean }) {
    const bar = Pip.fill(aspects, gilded), aimed = gilded && !!aspects?.includes('undertaking');
    return (
      <li className={[asked ? 'asked' : fresh ? 'fresh' : '', aimed ? 'aimed' : '', pays ? 'pays' : '',
        bar ? 'marked' : ''].filter(Boolean).join(' ') || undefined} data-aspects={aspects?.join(' ') || undefined}
        data-condition={Pip.condition({ spent: asked, fresh })}>
        {/* What is said beside its number, wrapping beside it: on a phone a long one had gone under its number. */}
        <ChoiceRow.Act choice={c} draw={draw} number={number}
          {...bar ? { mark: bar, markLabel: Pip.words(aspects!, gilded) } : {}}
          label={<span className="said">{Typography.curl(c.label)}{c.note && <small> · {c.note}</small>}
            {asked && <small> · asked</small>}{pays && <span className="for-you sr-only">, for you</span>}</span>} />
        {c.children && draw.open.has(c.id) && <ol className="opened-list">{c.children.map(k => <TalkStage.Reply key={k.id}
          choice={k} draw={draw} />)}</ol>}
      </li>
    );
  }
}
