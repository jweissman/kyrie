import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
import { AimNear } from '../aim-near';
import { Emphasis } from '../emphasis';
import { Guidance } from '../guidance';
import { Pip } from './pip';
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
      aims: (frame.screen.aims ?? []).map(a => a.text), paying: frame.screen.paying ?? [] });
    // What the aim followed asks of them is drawn in its gold, as their likeness is (the owner, 8 November: the
    // merchant the rats job sent the company to, and the question to ask her, had been drawn like any other).
    const followed = (frame.screen.aims ?? []).filter(a => a.followed).map(a => a.text);
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
      ...TalkFocus.aimed(c, followed) ? ['undertaking' as const] : [],
      ...TalkFocus.pays(c, frame.screen.paying) ? ['payoff' as const] : []]);

    return (
      <div className="talk" id="page">
        <TalkStage.Sitter app={app} name={name!} role={role.join(' · ')}>
          <Stage.When frame={frame} extra={frame.screen.place.name} /></TalkStage.Sitter>
        <div className="dialogue">
          <TalkStage.Lines lines={s.talk} pending={s.pending?.said} ready={Moments.ready(frame.screen)} app={app} />
          <div className="answer">
            <div className="choosing">
              {s.trading ? <TalkStage.Trading app={app} wares={wares} services={focus.services} buys={counter?.buys ?? []}
                short={counter?.short ?? []} who={counter?.name ?? ''}
                draw={draw} /> : <>
                {who.recruit && <TalkStage.Recruit recruit={who.recruit} coin={frame.screen.purse.coin} />}
                {/* A question put to the company is answered first, by its answers (Low Water's 5, the Liberty of the
                    Ice's 10: three answers to Callow's question had stood among the rest, as topics). */}
                {focus.answers.length > 0 && <><p className="answering">Your answer</p>
                  <ol className="replies answers" aria-label="Your answer">{focus.answers
                    .map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw} aspects={drawn(c)} gilded={gilded} />)}</ol></>}
                <ol className="replies" aria-label={`What you might say to ${name}`}>
                  {focus.salient.map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw}
                    fresh={focus.opened.has(c.id)} aspects={drawn(c)} gilded={gilded}
                    pays={TalkFocus.pays(c, frame.screen.paying)} />)}
                </ol>
                {focus.more.length > 0 && <details className="more-talk">
                  {/* Only what was asked before is not "something else" (round 6, the register's FH-16). */}
                  <summary>{focus.more.every(spent) ? 'Ask again…' : 'Something else…'}</summary>
                  <ol className="replies">{focus.more.map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw}
                    asked={spent(c)} aspects={drawn(c)} gilded={gilded} />)}</ol>
                </details>}
                {/* In the aim's gold where what the aim asks of them is had in trade (a sale, to the debtor home with
                    what would fetch coin: Mission 20). */}
                {(wares.length > 0 || focus.services.length > 0 || (counter?.buys.length ?? 0) > 0)
                  && <TalkStage.ToTrade app={app} aspects={[...new Set(focus.services.flatMap(drawn))]} gilded={gilded} />}
              </>}
            </div>
            {/* Back from trading stands by the leave, always in view: at the foot of a long counter it had been
                under the fade, half there (round 5). */}
            <p className="leave">{s.trading && <button type="button" className="option quiet" data-action="trade-back"
              onClick={() => app.trade(false)}>Back</button>}<Act.View choice={talk.leave} draw={draw}>
              <i>{(draw.index.get(talk.leave.id) ?? 0) + 1}</i>{talk.leave.label}</Act.View></p>
          </div>
        </div>
        <button type="button" className="close" data-action="back" aria-label="Take your leave" onClick={app.back}>×</button>
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
    const bar = Emphasis.bar(aspects, gilded);
    return <p className="to-trade"><button type="button" className={`option${gilded && aspects.includes('undertaking')
      ? ' aimed' : ''}`} data-action="trade" data-aspects={aspects.join(' ') || undefined} onClick={() => app.trade(true)}>
      {bar && <span className="prism-bar" role="img" aria-label={Pip.words(aspects, gilded)}
        style={{ '--prism': bar } as CSSProperties} />}Trade</button></p>;
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
    const from = Math.max(0, lines.map(l => l.kind).lastIndexOf('you')), last = lines.map(l => l.kind).lastIndexOf('aim');
    useLayoutEffect(() => {
      end.current?.scrollIntoView({ block: 'nearest' });
      const box = end.current?.parentElement, first = newest.current;
      if (box && first && first.getBoundingClientRect().top < box.getBoundingClientRect().top) {
        box.scrollTop -= box.getBoundingClientRect().top - first.getBoundingClientRect().top;
      }
      const below = box && aim.current ? aim.current.getBoundingClientRect().bottom - box.getBoundingClientRect().bottom : 0;
      if (box && below > 0) { box.scrollTop += below; }
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
      return ended ? <Moments.SeenThrough key={i} ended={ended} ready={ready} />
        : levelled ? <Moments.Levelled key={i} levels={[levelled]} />
        : l.kind === 'learned' || l.kind === 'aim'
          ? <p key={i} ref={i === from ? newest : i === last && last > from ? aim : undefined}
            className={`line learned ${l.kind}${more ? ' more' : ''}`}>
            {!more && <b>{l.label ?? (l.kind === 'aim' ? TalkStage.aimed(app, l) : 'You know now')}</b>}
            {Typography.curl(l.text)}
            {app && l.aim && <Told.Follow app={app} id={l.aim} />}</p>
          : <p key={i} ref={i === from ? newest : undefined} className={`line ${l.kind}`}>{Typography.curl(l.text)}</p>;
    };
    return (
      <div className="lines" aria-live="polite">
        {cut > 0 && <details className="said-before"><summary>Said before…</summary>
          {lines.slice(0, cut).map((l, i) => line(l, i))}</details>}
        {lines.slice(cut).map((l, k) => line(l, cut + k))}
        {pending && <p className="line you waiting">{Typography.curl(Words.lastSaid(pending))}</p>}
        <div ref={end} />
      </div>
    );
  }
  // What someone who trades has on their side of the counter, whether or not you can afford it: each thing a control
  // that buys it, with its price and how many are left (what is beyond your purse quieter, the purse said once by the
  // label: the owner, 5 November, "It costs 10 coin, and you have 8" had stood under each); and what they
  // will buy, and for how much. The wares had been a run-on line above the replies, and buying a list opened inside
  // them (the owner's interim report; play 7).
  static Counter({ wares, buys, coin, draw }: { wares: Ware[]; buys: Counter['buys']; coin: number; draw: Draw }) {
    if (!wares.length && !buys.length) { return null; }
    return (
      <section className="counter" aria-label="For sale">
        {wares.length > 0 && <><p className="label">For sale<span className="purse">{`you have ${coin} coin`}</span></p>
          <ul className="wares">{wares.map(w => <li key={w.name}>
          <TalkStage.Ware ware={w} coin={coin} draw={draw} /></li>)}</ul></>}
        {buys.length > 0 && <p className="buys">Buys {buys.slice(0, 4).map(b => `${b.name.toLowerCase()} (${b.price})`)
          .join(', ')}{buys.length > 4 ? ', and more' : ''}.</p>}
      </section>
    );
  }
  // One thing for sale: bought at a touch, or, in a company, bought for one of it.
  static Ware({ ware: w, coin, draw }: { ware: Ware; coin: number; draw: Draw }) {
    const price = <span className="r">{`${w.price} coin · ${w.stock > 0 ? `${w.stock} left` : 'none left'}`}</span>;
    const name = <span className="n">{Typography.curl(Words.upper(w.name))}</span>;
    if (!w.buy) { return <span className={`ware none${w.price > coin ? ' dear' : ''}`}>{name}{price}</span>; }
    // Numbered, as what can be said is: the replies' numbers follow on from the wares'.
    if (!w.buy.children?.length) {
      // Beside what the buyer has on in its place: "worse than your longsword" (see PurchaseCompare).
      const versus = / · ((?:better|worse|as good) (?:than|as) your .+)$/.exec(w.buy.label)?.[1];
      // Beyond the purse, it is quieter and says nothing more: what the company has is said once, by the label.
      const dear = /^It costs \d+ coin, and you have \d+\.$/.test(w.buy.disabled ?? '');
      return <Act.View choice={w.buy} draw={draw} className="ware" quiet={dear}><span className="n"><i>{(draw.index.get(w.buy.id) ?? 0) + 1}</i>
        {Typography.curl(Words.upper(w.name))}</span>{price}{versus && <span className="t">{versus}</span>}</Act.View>;
    }
    return <div className="ware several">{name}{price}{w.buy.children.map(k => <Act.View key={k.id} choice={k} draw={draw}
      className="for">{Typography.curl(k.label)}</Act.View>)}</div>;
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
  // What is had of someone for coin or work, apart from what is said: their wares, what they will buy, and their
  // services (a bed, care, a lesson), with the company's purse once; Back, by the leave, returns to the conversation
  // (the owner, 5 November: goods had stood among the topics as if they were something to discuss).
  static Trading({ app, wares, services, buys, short, who, draw }: { app: ReaderApp; wares: Ware[]; services: Choice[];
    buys: Counter['buys']; short: NonNullable<Counter['short']>; who: string; draw: Draw }) {
    const coin = app.state.frame!.screen.purse.coin;
    // What the company carries that they would buy, first (see TalkFocus.parted).
    const { sales, rest } = TalkFocus.parted(services);
    return <section className="trading" aria-label="Trade">
      {(sales.length > 0 || short.length > 0) && <><p className="label">Yours to sell{wares.length ? ''
        : <span className="purse">{`you have ${coin} coin`}</span>}</p>
        <ol className="replies">{sales.map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw} />)}
          {/* What they would buy and cannot pay for now: shut, and why (see TradeModel.short). */}
          {short.map(x => <li key={x.name}><button type="button" className="act" disabled>
            {Typography.curl(`Sell ${x.name.charAt(0).toLowerCase()}${x.name.slice(1)}`)}<span className="note">
              {Typography.curl(` · ${Words.short(who)} has not the coin for it today (${x.pays})`)}</span></button></li>)}</ol></>}
      <TalkStage.Counter wares={wares} buys={buys} coin={coin} draw={draw} />
      {rest.length > 0 && <><p className="label">Services{wares.length || sales.length ? '' : <span className="purse">{`you have ${coin} coin`}</span>}</p>
        <ol className="replies">{rest.map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw} />)}</ol></>}
      {!wares.length && !services.length && <p className="label">You have {coin} coin</p>}
    </section>;
  }
  // A question already put stays to be put again, quieter, and says so; one the last answer opened is marked new.
  // What pays the company is marked green, as the likeness that has something for it is (see Owed).
  // What it is to the company is the one indicator at its left, as a led act's is (see Emphasis.bar).
  static Reply({ choice: c, draw, asked, fresh, aspects, gilded = true, pays }: { choice: Choice; draw: Draw;
    asked?: boolean; fresh?: boolean; aspects?: Aspect[]; gilded?: boolean; pays?: boolean }) {
    const bar = Emphasis.bar(aspects, gilded), aimed = gilded && !!aspects?.includes('undertaking');
    return (
      <li className={[asked ? 'asked' : fresh ? 'fresh' : '', aimed ? 'aimed' : '', pays ? 'pays' : '',
        bar ? 'marked' : ''].filter(Boolean).join(' ') || undefined} data-aspects={aspects?.join(' ') || undefined}>
        {/* What is said beside its number, wrapping beside it: on a phone a long one had gone under its number. */}
        <Act.View choice={c} draw={draw}>{bar && <span className="prism-bar" role="img" aria-label={Pip.words(aspects!, gilded)}
          style={{ '--prism': bar } as CSSProperties} />}<i>{(draw.index.get(c.id) ?? 0) + 1}</i><span className="said">
          {Typography.curl(c.label)}{c.note && <small> · {c.note}</small>}{asked && <small> · asked</small>}
          {pays && <small className="for-you"> · for you</small>}</span></Act.View>
        {c.children && draw.open.has(c.id) && <ol className="opened-list">{c.children.map(k => <TalkStage.Reply key={k.id}
          choice={k} draw={draw} />)}</ol>}
      </li>
    );
  }
}
