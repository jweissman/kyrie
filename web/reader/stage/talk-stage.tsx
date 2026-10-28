import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Talk } from '../../../src/ui/attention';
import type { Choice } from '../../../src/ui/choice-list';
import type { Counter } from '../../../src/ui/trade-model';
import type { ReaderApp } from '../reader-app';
import type { TalkLine } from '../conversation';
import { Typography } from '../../../src/presentation/typography';
import { Scenery } from '../../../src/ui/scenery';
import { Likeness } from '../../../src/paintings/likeness';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';
import { Moments } from './moments';
import { Wares, type Ware } from '../wares';

// Speaking with someone. Their painting, large, with their name on it; beside it the conversation: what they were
// doing when you came over, what they said to you and you to them, in order, and what you came to know, which scrolls
// when it is long; and held under it, what you might say next, numbered, and taking your leave, never scrolled away
// (an instrumented session spent four of its ten scrolls reaching "Take your leave": the play-structure
// investigation's PT-42). Nothing else on the stage: the place is where you left it.
export class TalkStage {
  static View({ app, talk }: { app: ReaderApp; talk: Talk }) {
    const s = app.state, frame = s.frame!, who = talk.subject, draw = Act.draw(app);
    const [name, ...role] = [Words.short(who.name), who.note].filter(Boolean) as string[];
    const counter = frame.screen.trade.find(c => c.id === who.id), { wares, rest } = Wares.of(counter, talk.replies);
    return (
      <div className="talk" id="page">
        <TalkStage.Sitter app={app} name={name!} role={role.join(' · ')}>
          <Stage.When frame={frame} extra={frame.screen.place.name} /></TalkStage.Sitter>
        <div className="dialogue">
          <TalkStage.Lines lines={s.talk} pending={s.pending?.said} ready={Moments.ready(frame.screen)} />
          <div className="answer">
            <div className="choosing">
              <TalkStage.Counter wares={wares} buys={counter?.buys ?? []} coin={frame.screen.purse.coin} draw={draw} />
              {who.recruit && <TalkStage.Recruit recruit={who.recruit} coin={frame.screen.purse.coin} />}
              <ol className="replies" aria-label={`What you might say to ${name}`}>
                {rest.map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw} asked={s.asked.includes(c.id)} />)}
              </ol>
            </div>
            <p className="leave"><Act.View choice={talk.leave} draw={draw}>
              <i>{(draw.index.get(talk.leave.id) ?? 0) + 1}</i>{talk.leave.label}</Act.View></p>
          </div>
        </div>
        <button type="button" className="close" data-action="back" aria-label="Take your leave" onClick={app.back}>×</button>
      </div>
    );
  }
  // The painting: someone who could be them, as large as the page allows, cropped to the face, with who painted it
  // as far as the painting itself says. Where no painting fits them, the country they are met in is behind their
  // name, rather than a picture of someone they are not (in type alone, on a tablet held upright, a drover's page was
  // two thirds blank paper above her name: play 8).
  // A painting that cannot be had (images refused, or the page offline) leaves the page in type, as one that does not
  // fit: the Bushweald play without images found a black slab, a broken picture and its painter's credit.
  static Sitter({ app, name, role, children }: { app: ReaderApp; name: string; role: string; children?: ReactNode }) {
    const given = app.menu.talk!.subject.portrait, [failed, fail] = useState<string[]>([]);
    const portrait = given && !failed.includes(given.large) ? given : undefined;
    const view = portrait ? undefined : Scenery.of(app.state.frame!.screen), wide = view && `paintings/large/${view}.webp`;
    const scene = wide && !failed.includes(wide) ? wide : undefined;
    return (
      <div className={`sitter${portrait ? '' : scene ? ' scenic' : ' unpainted'}`}>
        {portrait && <img src={portrait.large} alt="" decoding="async" onError={() => fail([...failed, portrait.large])}
          style={{ objectPosition: `50% ${portrait.focus}%` }} />}
        {scene && <img src={scene} alt="" decoding="async" onError={() => fail([...failed, scene])} />}
        {portrait && <p className="credit">{portrait.credit ?? 'Painter unrecorded'}</p>}
        {scene && <p className="credit">{Likeness.credits[view!] ?? 'Painter unrecorded'}</p>}
        <div className="cap"><h1 className="n">{Typography.curl(name)}</h1>{role && <p className="r">{Typography.curl(role)}</p>}
          {children}</div>
      </div>
    );
  }
  // What has passed between you, newest last and kept in view; when the newest is longer than there is room for, from
  // its beginning (what you said), not its end.
  static Lines({ lines, pending, ready }: { lines: TalkLine[]; pending?: string; ready?: string }) {
    const end = useRef<HTMLDivElement>(null), newest = useRef<HTMLParagraphElement>(null);
    const from = Math.max(0, lines.map(l => l.kind).lastIndexOf('you'));
    useLayoutEffect(() => {
      end.current?.scrollIntoView({ block: 'nearest' });
      const box = end.current?.parentElement, first = newest.current;
      if (box && first && first.getBoundingClientRect().top < box.getBoundingClientRect().top) {
        box.scrollTop -= box.getBoundingClientRect().top - first.getBoundingClientRect().top;
      }
    }, [lines.length, pending]);
    return (
      <div className="lines" aria-live="polite">
        {lines.map((l, i) => {
          // Something seen through, or a level gained, is set apart here as on the place's page.
          const ended = Moments.ending.exec(l.text), levelled = Moments.levelled.exec(l.text);
          return ended ? <Moments.SeenThrough key={i} ended={ended} ready={ready} />
            : levelled ? <Moments.Levelled key={i} levels={[levelled]} />
            : l.kind === 'learned' || l.kind === 'aim'
              ? <p key={i} ref={i === from ? newest : undefined} className={`line learned ${l.kind}`}>
                <b>{l.kind === 'aim' ? 'A new aim' : 'You know now'}</b>{Typography.curl(l.text)}</p>
              : <p key={i} ref={i === from ? newest : undefined} className={`line ${l.kind}`}>{Typography.curl(l.text)}</p>;
        })}
        {pending && <p className="line you waiting">{Typography.curl(Words.lastSaid(pending))}</p>}
        <div ref={end} />
      </div>
    );
  }
  // What someone who trades has on their side of the counter, whether or not you can afford it: each thing a control
  // that buys it, with its price and how many are left (what is beyond your purse quieter, and says why); and what they
  // will buy, and for how much. The wares had been a run-on line above the replies, and buying a list opened inside
  // them (the owner's interim report; play 7).
  static Counter({ wares, buys, coin, draw }: { wares: Ware[]; buys: Counter['buys']; coin: number; draw: Draw }) {
    if (!wares.length && !buys.length) { return null; }
    return (
      <section className="counter" aria-label="For sale">
        {wares.length > 0 && <><p className="label">For sale</p><ul className="wares">{wares.map(w => <li key={w.name}>
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
      return <Act.View choice={w.buy} draw={draw} className="ware"><span className="n"><i>{(draw.index.get(w.buy.id) ?? 0) + 1}</i>
        {Typography.curl(Words.upper(w.name))}</span>{price}</Act.View>;
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
          r.sheet.skills.length ? `Knows ${r.sheet.skills.map(s => s.name.toLowerCase()).join(', ')}.` : '',
          r.techniques.length ? `Can ${r.techniques.map(x => x.name.toLowerCase()).join(', ')}.` : ''].filter(Boolean).join(' '))}</p>}
      </section>
    );
  }
  // A question already put stays to be put again, quieter, and says so.
  static Reply({ choice: c, draw, asked }: { choice: Choice; draw: Draw; asked?: boolean }) {
    return (
      <li className={asked ? 'asked' : undefined}>
        <Act.View choice={c} draw={draw}><i>{(draw.index.get(c.id) ?? 0) + 1}</i>{Typography.curl(c.label)}
          {c.note && <small> · {c.note}</small>}{asked && <small> · asked</small>}</Act.View>
        {c.children && draw.open.has(c.id) && <ol className="opened-list">{c.children.map(k => <TalkStage.Reply key={k.id}
          choice={k} draw={draw} />)}</ol>}
      </li>
    );
  }
}
