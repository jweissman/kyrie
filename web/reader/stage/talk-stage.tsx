import { useLayoutEffect, useRef } from 'react';
import type { Talk } from '../../../src/ui/attention';
import type { Choice } from '../../../src/ui/choice-list';
import type { Counter } from '../../../src/ui/trade-model';
import type { ReaderApp } from '../reader-app';
import type { TalkLine } from '../conversation';
import { Typography } from '../../../src/presentation/typography';
import { Words } from '../words';
import { Act, type Draw } from './act';
import { Stage } from './stage';

// Speaking with someone. Their painting, large, with their name on it; beside it the conversation: what they were
// doing when you came over, what they said to you and you to them, in order, and what you came to know; then what
// you might say next, numbered, and taking your leave. Nothing else on the stage: the place is where you left it.
export class TalkStage {
  static View({ app, talk }: { app: ReaderApp; talk: Talk }) {
    const s = app.state, frame = s.frame!, who = talk.subject, draw = Act.draw(app);
    const [name, ...role] = [Words.short(who.name), who.note].filter(Boolean) as string[];
    return (
      <div className="talk" id="page">
        <TalkStage.Sitter app={app} name={name!} role={role.join(' · ')} />
        <div className="dialogue">
          <Stage.Status frame={frame} extra={frame.screen.place.name} />
          <TalkStage.Lines lines={s.talk} pending={s.pending?.said} />
          <TalkStage.Counter counter={frame.screen.trade.find(c => c.id === who.id)} coin={frame.screen.purse.coin} />
          <ol className="replies" aria-label={`What you might say to ${name}`}>
            {talk.replies.map(c => <TalkStage.Reply key={c.id} choice={c} draw={draw} asked={s.asked.includes(c.id)} />)}
            <li className="leave"><Act.View choice={talk.leave} draw={draw}>
              <i>{(draw.index.get(talk.leave.id) ?? 0) + 1}</i>{talk.leave.label}</Act.View></li>
          </ol>
          <Act.Sheets app={app} />
        </div>
        <button type="button" className="close" data-action="back" aria-label="Take your leave" onClick={app.back}>×</button>
      </div>
    );
  }
  // The painting: someone who could be them, as large as the page allows, cropped to the face, with who painted it
  // as far as the painting itself says. Without one, their initial, large.
  static Sitter({ app, name, role }: { app: ReaderApp; name: string; role: string }) {
    const portrait = app.menu.talk!.subject.portrait;
    return (
      <div className={`sitter${portrait ? '' : ' unpainted'}`}>
        {portrait ? <img src={portrait.large} alt="" decoding="async" style={{ objectPosition: `50% ${portrait.focus}%` }} />
          : <span className="initial" aria-hidden="true">{name.charAt(0)}</span>}
        {portrait && <p className="credit">{portrait.credit ?? 'Painter unrecorded'}</p>}
        <div className="cap"><h1 className="n">{Typography.curl(name)}</h1>{role && <p className="r">{Typography.curl(role)}</p>}</div>
      </div>
    );
  }
  // What has passed between you, newest last and kept in view.
  static Lines({ lines, pending }: { lines: TalkLine[]; pending?: string }) {
    const end = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [lines.length, pending]);
    return (
      <div className="lines" aria-live="polite">
        {lines.map((l, i) => l.kind === 'learned'
          ? <p key={i} className="line learned"><b>You know now</b>{l.text}</p>
          : <p key={i} className={`line ${l.kind}`}>{Typography.curl(l.text)}</p>)}
        {pending && <p className="line you waiting">{Typography.curl(Words.lastSaid(pending))}</p>}
        <div ref={end} />
      </div>
    );
  }
  // One thing to say, with its number; what it opens (what to buy, what to ask about) beneath it.
  // What someone who trades has on their side of the counter, whether or not you can afford it: each thing, its price
  // and how many are left, what is beyond your purse quieter; and what they will buy, and for how much.
  static Counter({ counter, coin }: { counter?: Counter; coin: number }) {
    if (!counter) { return null; }
    return (
      <div className="counter" aria-label="For sale">
        {counter.sells.length > 0 && <ul>{counter.sells.map(g => <li key={g.name} className={g.price > coin ? 'dear' : undefined}>
          {g.name}<small> · {g.price} coin{g.stock > 0 ? ` · ${g.stock} left` : ' · none left'}</small></li>)}</ul>}
        {counter.buys.length > 0 && <p className="buys">Buys {counter.buys.slice(0, 4).map(b => `${b.name.toLowerCase()} (${b.price})`)
          .join(', ')}{counter.buys.length > 4 ? ', and more' : ''}.</p>}
      </div>
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
