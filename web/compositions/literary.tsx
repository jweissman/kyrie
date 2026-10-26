import type { Choice } from '../../src/ui/choice-list';
import type { CombatScreen } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';
import { Words } from '../reader/words';
import { Stage } from '../reader/stage/stage';
import type { Frame } from '../engine/protocol';
import { Offers, type Group, type Offer } from './offer';
import { Parts, type Kit } from './parts';
import { References } from './references';

// A. The literary page. One column of reading, typography alone: the place's name and its telling at the centre,
// what just happened kept beneath it in the words it happened in, whom or what you are attending to set as a passage
// of its own within the place, and what can be done after the telling it answers, as short lines grouped by whom
// they concern. No portrait, no map, no image: a map is the places in words, summoned with the notes and the pack.
export class Literary {
  static order(offer: Offer): Choice[] { return Offers.order('a', offer); }
  static View({ kit }: { kit: Kit }) {
    const { frame } = kit;
    return (
      <article className="lit" data-attention={kit.offer.attention.kind}>
        <Literary.Running frame={frame} />
        {frame.combat ? <Literary.Fight kit={kit} combat={frame.combat} /> : <Literary.Place kit={kit} />}
        <Literary.Aside kit={kit} />
        <Parts.Notice kit={kit} />
        <Literary.Choices kit={kit} />
        <footer className="refs" aria-label="To look up"><span>Notes <kbd>j</kbd></span><span>Pack <kbd>i</kbd></span>
          <span>Company <kbd>c</kbd></span><span>Places <kbd>m</kbd></span></footer>
      </article>
    );
  }
  // The running head: the country and the place's larger setting, and the time, in the margin's small capitals.
  static Running({ frame }: { frame: Frame }) {
    const where = frame.screen.path.filter(p => ['region', 'settlement', 'wilderness', 'site'].includes(p.kind))
      .map(p => p.name);
    return <header className="run"><span>{where.join(' · ')}</span><span>{Stage.when(frame).slice(1).join(' · ')}
      {' · '}{frame.screen.clock.replace(/^Day \d+, /, '')}</span></header>;
  }
  static Place({ kit }: { kit: Kit }) {
    const { frame, offer } = kit, place = Parts.place(frame), x = frame.leaf.exchange, subject = offer.subject;
    const lines = Parts.unsaid(kit, x?.lines ?? []);
    const result = x && lines.length > 0 && <section className="result" aria-label="What just happened">
      {x.said && !place.arrived && <p className="said">{Typography.curl(x.said)}</p>}
      <Parts.Lines lines={lines} />
      <Parts.Learned notes={x.notes} />
    </section>;
    return <>
      {frame.leaf.heading && <p className="chapter">{frame.leaf.heading.title}</p>}
      <h1 className="place">{Typography.curl(Words.upper(place.name))}</h1>
      {place.arrived && (frame.leaf.journey ?? []).length > 0 && <p className="journey">
        {frame.leaf.journey!.map(Typography.curl).join(' ')}</p>}
      {place.arrived ? place.prose.map(p => <p key={p} className="prose">{Typography.curl(p)}</p>)
        : <p className="recall">{Typography.curl(Literary.first(place.prose))}</p>}
      {frame.leaf.changed.length > 0 && <p className="changed">{frame.leaf.changed.map(Typography.curl).join(' ')}</p>}
      {!subject && result}
      {!subject && place.presence.length > 0 && <p className="presence">
        {place.presence.map(Typography.curl).join(' ')}</p>}
      {subject && <section className={`attending ${offer.attention.kind}`} aria-label={subject.name}>
        <h2>{Typography.curl(Words.upper(subject.name))}{subject.note && <span className="role">, {subject.note}</span>}</h2>
        {Parts.says(kit).map(t => <p key={t} className={offer.attention.kind === 'thing' ? 'inscription' : 'doing'}>
          {Typography.curl(t)}</p>)}
        {offer.attention.kind === 'person' ? <Parts.Dialogue lines={Parts.conversation(frame, subject)} /> : result}
        {offer.attention.kind === 'person' && x && <Parts.Learned notes={x.notes.filter(n => !/^Noted: /.test(n))} />}
      </section>}
    </>;
  }
  static first(prose: string[]): string {
    const text = prose[0] ?? '';
    return text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
  }
  static Choices({ kit }: { kit: Kit }) {
    return <nav className="choices" aria-label="What you can do">
      {kit.offer.groups.map((g, i) => <Literary.Group key={`${g.kind}${i}`} kit={kit} group={g} />)}
    </nav>;
  }
  static readonly heads: Partial<Record<Group['kind'], string>> = { near: 'Go', far: 'Set out', you: 'Yourself',
    threat: 'Danger' };
  // Someone or something here, as one line: who or what they are, and the way into speaking with them or looking.
  static Subject({ kit, group: g }: { kit: Kit; group: Group }) {
    const c = g.choices[0]!, verb = c.id.endsWith('#talk') ? 'speak with' : c.id.endsWith('#look') ? 'look at' : '';
    return <div className={`group ${g.kind} one`}><Parts.Act kit={kit} choice={c} className="subject">
      <span className="what"><span className="name">{Typography.curl(Words.upper(g.title))}</span>
        {g.subject?.note && <span className="role">, {g.subject.note}</span>}</span>
      {verb && <span className="verb">{verb}</span>}
    </Parts.Act></div>;
  }
  static Group({ kit, group: g }: { kit: Kit; group: Group }) {
    const one = ['person', 'companion', 'thing'].includes(g.kind) && g.choices.length === 1
      && /#(talk|look)$/.test(g.choices[0]!.id);
    if (one) { return <Literary.Subject kit={kit} group={g} />; }
    const shared = g.kind === 'work' ? Parts.shared(g.choices) : undefined;
    if (shared) { return <div className="group work row"><p className="head">{g.title}</p>
      <p className="lead">{Typography.curl(`${shared.lead} … ${shared.tail}`)}</p>
      <ul>{g.choices.map((c, i) => <li key={c.id}><Parts.Act kit={kit} choice={c}>
        <span className="what">{Typography.curl(shared.parts[i]!)}</span></Parts.Act></li>)}</ul></div>; }
    if (!g.choices.length) { return <p className="by">{Typography.curl(Words.upper(g.title))}
      {g.subject?.note && <span className="role">, {g.subject.note}</span>}, here.</p>; }
    const head = g.kind === 'threat' ? Literary.Threat({ kit, group: g })
      : ['person', 'companion', 'thing', 'animal', 'reply', 'work'].includes(g.kind) && g.title
        ? <p className="head">{g.kind === 'reply' || g.kind === 'work' ? g.title : Typography.curl(Words.upper(g.title))}
          {g.subject?.note && g.kind !== 'reply' && g.kind !== 'work' && <span className="role">, {g.subject.note}</span>}</p>
        : Literary.heads[g.kind] ?? (g.kind === 'fight' && g.title)
          ? <p className="head small">{Literary.heads[g.kind] ?? g.title}</p> : null;
    return <div className={`group ${g.kind}`}>
      {head}
      <ul>{g.choices.map(c => <li key={c.id} style={{ marginLeft: `${Offers.depth(kit.offer, c) * 1.2}em` }}>
        <Parts.Act kit={kit} choice={c} /></li>)}</ul>
    </div>;
  }
  // A danger is said in words before anything is done about it: what it is, and how the company reckons a fight.
  static Threat({ kit, group: g }: { kit: Kit; group: Group }) {
    const row = kit.frame.screen.people.find(p => p.id === g.subject?.id);
    return <div className="threat-head">
      <p className="head">{Typography.curl(Words.upper(g.title))}</p>
      {row?.look && <p className="look">{row.look}</p>}
      {row?.reckoning && <p className="reckoning"><span className="tag">Danger</span> {row.reckoning.text}</p>}
    </div>;
  }
  // A fight, in words: the two sides as they stand, what this round has been, and what the one acting might do.
  static Fight({ kit, combat: c }: { kit: Kit; combat: CombatScreen }) {
    const round = c.exchanges.filter(e => e.round === c.round);
    return <>
      <h1 className="place">{Typography.curl(Words.upper(kit.frame.screen.place.name))}</h1>
      <p className="fight-state">{c.outcome ? 'The fight is over.'
        : `Round ${c.round}. ${c.ours ? `${c.actorName} to act.` : 'They act.'}`}</p>
      <div className="sides">
        <Literary.Side title="Your company" rows={c.allies} />
        <Literary.Side title="Against you" rows={c.foes} />
      </div>
      {(c.outcome ? c.log.slice(-6) : round.map(e => e.text)).length > 0 && <section className="result" aria-label="This round">
        <Parts.Lines lines={(c.outcome ? [...kit.frame.leaf.exchange?.lines ?? []].map(l => l.text)
          .concat(c.after ?? []) : round.map(e => e.text)).map(text => ({ text, kind: 'telling' }))} />
      </section>}
    </>;
  }
  static Side({ title, rows }: { title: string; rows: CombatScreen['allies'] }) {
    return <section className="side"><h3>{title}</h3>{rows.map(r => <p key={r.id} className={r.down ? 'down' : ''}>
      <span className="who">{Typography.curl(Words.upper(r.name))}</span> <span className="line-of">{r.line}</span>
      <span className={`hp${r.down || r.hp <= r.maxHp / 3 ? ' hurt' : ''}`}>{r.down ? 'down'
        : `${r.hp} of ${r.maxHp}`}{r.statuses.length > 0 && `, ${r.statuses.join(', ').toLowerCase()}`}</span></p>)}
    </section>;
  }
  // What is looked up opens in the column, above what can be done, and closes back into it.
  static Aside({ kit }: { kit: Kit }) {
    const screen = kit.frame.screen, ref = kit.s.reference;
    return ref ? <aside className="ref" aria-label={ref}>
      <h2>{{ notes: 'Notes', company: 'The company', pack: 'What you carry', map: 'Places' }[ref]}</h2>
      {ref === 'notes' && <References.Notes screen={screen} />}
      {ref === 'company' && <References.Company screen={screen} />}
      {ref === 'pack' && <References.Pack screen={screen} />}
      {ref === 'map' && <References.Places screen={screen} />}
      <p className="close">Escape to close</p>
    </aside> : null;
  }
}
