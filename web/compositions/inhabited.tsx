import type { Choice } from '../../src/ui/choice-list';
import type { CombatScreen, TargetRow } from '../../src/ui/screen-types';
import type { SceneSubject } from '../../src/ui/scene';
import { Typography } from '../../src/presentation/typography';
import { Words } from '../reader/words';
import { Stage } from '../reader/stage/stage';
import { MapView } from '../reader/map-view';
import { Offers, type Group, type Offer } from './offer';
import { Parts, type Kit } from './parts';
import { References } from './references';
import { Literary } from './literary';

// B. The inhabited scene. The same telling, beside a plate that holds the subject of attention: the painting of
// whoever is spoken with, the object looked at set large as the page's subject, the two sides of a fight, or, where
// the question is where things are (out on the fells, in a mine), the map. The place recedes to a band when someone
// or something is attended to, and comes back whole on leaving them. An image is shown only where one is earned;
// without one, the plate is the subject in type, or the map.
export class Inhabited {
  static order(offer: Offer): Choice[] { return Offers.order('b', offer); }
  static View({ kit }: { kit: Kit }) {
    const plate = Inhabited.plate(kit);
    return (
      <article className={`inh${plate ? '' : ' bare'}`} data-attention={kit.offer.attention.kind}>
        {plate && <div className="plate" data-plate={plate}><Inhabited.Plate kit={kit} kind={plate} /></div>}
        <div className="text">
          <Literary.Running frame={kit.frame} />
          {kit.frame.combat ? <Inhabited.Round kit={kit} combat={kit.frame.combat} /> : <Inhabited.Scene kit={kit} />}
          <Literary.Aside kit={kit} />
          <Parts.Notice kit={kit} />
          <nav className="choices" aria-label="What you can do">
            {kit.offer.groups.map((g, i) => <Inhabited.Group key={`${g.kind}${i}`} kit={kit} group={g} />)}
          </nav>
          <footer className="refs"><span>Notes <kbd>j</kbd></span><span>Pack <kbd>i</kbd></span>
            <span>Company <kbd>c</kbd></span><span>Places <kbd>m</kbd></span></footer>
        </div>
      </article>
    );
  }
  // What the plate holds now: the fight, the person spoken with (when there is a painting of them), the thing looked
  // at, or, standing somewhere, the plan of the place (its rooms, a town's streets) or the country. Nobody's painting
  // stands for a place: whom the plate would show there is a guess the page has no grounds for.
  static plate(kit: Kit): 'fight' | 'person' | 'thing' | 'site' | 'land' | undefined {
    const { frame, offer } = kit, screen = frame.screen;
    if (frame.combat) { return 'fight'; }
    if (offer.subject && offer.attention.kind === 'person') { return offer.subject.portrait ? 'person' : undefined; }
    if (offer.subject) { return 'thing'; }
    if (screen.chart && screen.chart.places.filter(p => !p.external).length > 1) { return 'site'; }
    return screen.region ? 'land' : undefined;
  }
  static Plate({ kit, kind }: { kit: Kit; kind: NonNullable<ReturnType<typeof Inhabited.plate>> }) {
    const s = kit.offer.subject;
    if (kind === 'fight') { return <Inhabited.Sides combat={kit.frame.combat!} />; }
    if (kind === 'person') { return <Inhabited.Sitter subject={s!} />; }
    if (kind === 'thing') {
      return <div className="object"><p className="kind">Looking at</p>
        <h2>{Typography.curl(Words.upper(s!.name))}</h2>{s!.note && <p className="state">{s!.note}</p>}
        {Parts.says(kit).map(t => <p key={t} className="inscription">{Typography.curl(t)}</p>)}</div>;
    }
    if (kind === 'site') { return <Inhabited.Site kit={kit} />; }
    return <div className="map-plate"><p className="kind">The country, as far as you know it</p>
      <References.Land frame={kit.frame} /></div>;
  }
  // The reader's own conversation (the one page the owner and the cold playtest both called right), kept: the
  // painting as large as the page allows, cropped to the face, the name set on it, who painted it in its corner.
  static Sitter({ subject: s }: { subject: SceneSubject }) {
    const p = s.portrait!;
    return <div className="sitter"><img src={p.large} alt="" style={{ objectPosition: `50% ${p.focus}%` }} />
      <p className="credit">{p.credit ?? 'Painter unrecorded'}</p>
      <div className="cap"><h2>{Typography.curl(Words.short(s.name))}</h2>{s.note && <p>{s.note}</p>}</div></div>;
  }
  static Portrait({ subject: s, large }: { subject: SceneSubject; large?: boolean }) {
    const p = s.portrait!;
    return <figure className={`portrait${large ? ' large' : ''}`}>
      <img src={large ? p.large : p.src} alt={`A painting of someone who could be ${s.name}`}
        style={{ objectPosition: `50% ${p.focus}%` }} />
      <figcaption><span className="name">{Typography.curl(Words.upper(s.name))}</span>
        {s.note && <span className="role">{s.note}</span>}
        {large && p.credit && <span className="credit">{p.credit}</span>}</figcaption>
    </figure>;
  }
  // A site's rooms as far as the company has found them: each a square, joined by its ways; here in blue.
  static Site({ kit }: { kit: Kit }) {
    const chart = kit.frame.screen.chart!, places = chart.places.filter(p => !p.external);
    const xs = places.map(p => p.x), ys = places.map(p => p.y), x0 = Math.min(...xs), y0 = Math.min(...ys);
    const at = new Map(places.map(p => [p.id, { x: (p.x - x0) * 170 + 90, y: (p.y - y0) * 110 + 30 }]));
    const w = (Math.max(...xs) - x0) * 170 + 180, h = (Math.max(...ys) - y0) * 110 + 90;
    return <div className="map-plate"><p className="kind">{chart.level ? Words.upper(chart.level) : 'This place'},
      as far as you have found it</p>
    <svg className="site" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="The rooms you know of here">
      {chart.edges.map(e => { const a = at.get(e.from), b = at.get(e.to); return a && b ? <line key={e.id + e.from}
        className={`${e.explored ? 'way' : 'way unexplored'}${e.status === 'hazard' ? ' hazard' : ''}`} x1={a.x} y1={a.y}
        x2={b.x} y2={b.y} /> : null; })}
      {places.map(p => { const c = at.get(p.id)!; return <g key={p.id}>
        <rect className={`room${p.here ? ' here' : ''}${p.visited ? ' visited' : ''}`} x={c.x - 7} y={c.y - 7}
          width={14} height={14} />
        <text x={c.x} y={c.y + 24} textAnchor="middle">{MapView.wrap(Typography.curl(Words.upper(p.name)), 20)
          .map((line, i) => <tspan key={i} x={c.x} dy={i ? 14 : 0}>{line}</tspan>)}</text></g>; })}
    </svg>
    <p className="key"><span className="visited">■ been</span> <span>□ not yet</span>
      <span className="hazard">— a danger on the way, as you know it</span></p></div>;
  }
  static Sides({ combat: c }: { combat: CombatScreen }) {
    return <div className="sides">{[['Against you', c.foes], ['Your company', c.allies]].map(([title, rows]) =>
      <section key={title as string} className="side"><p className="kind">{title as string}</p>
        {(rows as CombatScreen['foes']).map(r => <div key={r.id} className={`fighter${r.down ? ' down' : ''}${r.acting
          ? ' acting' : ''}`}>
          <p className="who">{Typography.curl(Words.upper(r.name))} <span className="line-of">{r.line}</span></p>
          <div className="bar" aria-hidden="true"><span style={{ width: `${Math.round(100 * r.hp / r.maxHp)}%` }}
            className={r.hp <= r.maxHp / 3 ? 'low' : ''} /></div>
          <p className={`hp${r.down || r.hp <= r.maxHp / 3 ? ' hurt' : ''}`}>{r.down ? 'Down' : `${r.hp} of ${r.maxHp}`}
            {r.statuses.length > 0 && ` · ${r.statuses.join(', ').toLowerCase()}`}{r.acting && ' · to act'}</p>
        </div>)}</section>)}</div>;
  }
  static Scene({ kit }: { kit: Kit }) {
    const { frame, offer } = kit, place = Parts.place(frame), x = frame.leaf.exchange, subject = offer.subject;
    const lines = Parts.unsaid(kit, x?.lines ?? []);
    const result = x && lines.length > 0 && <section className="result">
      {x.said && !place.arrived && <p className="said">{Typography.curl(x.said)}</p>}
      <Parts.Lines lines={lines} /><Parts.Learned notes={x.notes} /></section>;
    if (subject && offer.attention.kind === 'person') { return <Inhabited.Talk kit={kit} />; }
    // A thing looked at is named on the plate; here, only where it is, and what came of the last thing done to it.
    if (subject) {
      return <><p className="band">{Typography.curl(Words.upper(place.name))} · looking at {subject.name}</p>{result}</>;
    }
    return <>
      {frame.leaf.heading && <p className="chapter">{frame.leaf.heading.title}</p>}
      <h1 className="place">{Typography.curl(Words.upper(place.name))}</h1>
      {place.arrived && (frame.leaf.journey ?? []).length > 0 && <p className="journey">
        {frame.leaf.journey!.map(Typography.curl).join(' ')}</p>}
      {place.arrived ? place.prose.map(p => <p key={p} className="prose">{Typography.curl(p)}</p>)
        : <p className="recall">{Typography.curl(Literary.first(place.prose))}</p>}
      {result}
      {place.presence.length > 0 && <p className="presence">{place.presence.map(Typography.curl).join(' ')}</p>}
    </>;
  }
  static Talk({ kit }: { kit: Kit }) {
    const { frame, offer } = kit, subject = offer.subject!, x = frame.leaf.exchange;
    const counter = frame.screen.trade.find(t => t.id === subject.id), coin = frame.screen.purse.coin;
    return <>
      <p className="band">{Typography.curl(Words.upper(frame.screen.place.name))}</p>
      {!subject.portrait && <h1 className="subject">{Typography.curl(Words.short(subject.name))}
        {subject.note && <span className="role"> {subject.note}</span>}</h1>}
      {Parts.says(kit).map(t => <p key={t} className="doing">{Typography.curl(t)}</p>)}
      <Parts.Dialogue lines={Parts.conversation(frame, subject)} />
      {x && <Parts.Learned notes={x.notes.filter(n => !/^Noted: /.test(n))} />}
      {counter && counter.sells.length > 0 && <ul className="counter" aria-label="For sale">{counter.sells.map(g =>
        <li key={g.name} className={g.price > coin ? 'dear' : undefined}>{g.name}<small> · {g.price} coin
          {g.stock > 0 ? ` · ${g.stock} left` : ' · none left'}</small></li>)}</ul>}
    </>;
  }
  static Round({ kit, combat: c }: { kit: Kit; combat: CombatScreen }) {
    const lines = c.outcome ? [...(kit.frame.leaf.exchange?.lines ?? []).map(l => l.text), ...c.after ?? []]
      : c.exchanges.filter(e => e.round === c.round).map(e => e.text);
    return <>
      <p className="band">{Typography.curl(Words.upper(kit.frame.screen.place.name))} · {Stage.when(kit.frame)[1]}</p>
      <h1 className="subject">{c.outcome ? 'The fight is over' : `Round ${c.round}`}
        {!c.outcome && c.ours && <span className="role"> {c.actorName} to act</span>}</h1>
      <Parts.Lines lines={lines.map(text => ({ text, kind: 'telling' }))} className="round" />
    </>;
  }
  static Group({ kit, group: g }: { kit: Kit; group: Group }) {
    if (g.kind === 'threat') { return <Inhabited.Threat kit={kit} group={g} />; }
    if (g.kind === 'reply' || (g.kind === 'leave' && kit.offer.attention.kind === 'person')) {
      return <ol className={`replies ${g.kind}`} aria-label={g.title || 'Leave'}>{g.choices.map(c => <li key={c.id}>
        <Parts.Act kit={kit} choice={c}><i>{kit.order.indexOf(c) + 1}</i><Parts.Label choice={c} /></Parts.Act></li>)}</ol>;
    }
    const c = g.choices[0];
    if (g.subject?.portrait && c?.id.endsWith('#talk') && g.choices.length === 1) {
      return <div className={`group ${g.kind} one`}><Parts.Act kit={kit} choice={c} className="subject">
        <img className="face" src={g.subject.portrait.src} alt="" style={{ objectPosition: `50% ${g.subject.portrait.focus}%` }} />
        <span className="what"><span className="name">{Typography.curl(Words.upper(g.title))}</span>
          {g.subject.note && <span className="role">, {g.subject.note}</span>}</span>
        <span className="verb">speak with</span></Parts.Act></div>;
    }
    return <Literary.Group kit={kit} group={g} />;
  }
  static Threat({ kit, group: g }: { kit: Kit; group: Group }) {
    const row: TargetRow | undefined = kit.frame.screen.people.find(p => p.id === g.subject?.id);
    return <div className="group threat">
      <p className="head">{Typography.curl(Words.upper(g.title))}{row?.look && <span className="look"> {row.look}</span>}</p>
      {row?.reckoning && <p className="reckoning"><span className="tag">Danger</span> {row.reckoning.text}</p>}
      <ul className="row">{g.choices.map(c => <li key={c.id}><Parts.Act kit={kit} choice={c} /></li>)}</ul>
    </div>;
  }
}
