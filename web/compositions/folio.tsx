import type { Choice } from '../../src/ui/choice-list';
import type { Chart } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';
import { Words } from '../reader/words';
import type { Entry, Frame } from '../engine/protocol';
import { Offers, type Group, type Offer } from './offer';
import { Parts, type Kit } from './parts';
import { References } from './references';
import { Literary } from './literary';
import { Inhabited } from './inhabited';

// C. The traveller's folio. The same events kept as a journey: beside the page, the day's itinerary as it was made
// (each place come to, when, and what was learned or done there), what lies ahead as far as it is known and from
// whom, and the country or the site as a record of where you have been. The page itself leads with the ways on,
// each said as a route (where it goes, by what, how long, and whether it is somewhere been, seen, or only heard of);
// a conversation or a close look still takes the page's centre when it is the moment's.
export class Folio {
  static order(offer: Offer): Choice[] { return Offers.order('c', offer); }
  static View({ kit }: { kit: Kit }) {
    return (
      <article className="fol" data-attention={kit.offer.attention.kind}>
        <aside className="folio" aria-label="The journey so far">
          <Folio.Itinerary frame={kit.frame} />
          <Folio.Ahead frame={kit.frame} />
          {kit.frame.screen.chart && kit.frame.screen.chart.places.filter(p => !p.external).length > 1
            && kit.frame.leaf.shelter !== 'indoors' ? <Folio.Rooms chart={kit.frame.screen.chart} />
            : <section className="leaf"><h2>The country</h2><References.Land frame={kit.frame} small /></section>}
        </aside>
        <div className="page">
          <Literary.Running frame={kit.frame} />
          {kit.frame.combat ? <Inhabited.Round kit={kit} combat={kit.frame.combat} /> : <Literary.Place kit={kit} />}
          {kit.frame.combat && <Inhabited.Sides combat={kit.frame.combat} />}
          <Literary.Aside kit={kit} />
          <Parts.Notice kit={kit} />
          <nav className="choices" aria-label="What you can do">
            {Offers.waysFirst(kit.offer).map((g, i) => g.kind === 'far' || g.kind === 'near'
              ? <Folio.Routes key={`${g.kind}${i}`} kit={kit} group={g} />
              : g.kind === 'threat' ? <Inhabited.Threat key={`${g.kind}${i}`} kit={kit} group={g} />
                : <Literary.Group key={`${g.kind}${i}`} kit={kit} group={g} />)}
          </nav>
          <footer className="refs"><span>Notes <kbd>j</kbd></span><span>Pack <kbd>i</kbd></span>
            <span>Company <kbd>c</kbd></span><span>Places <kbd>m</kbd></span></footer>
        </div>
      </article>
    );
  }
  // The day as it was made: each place come to, at what time, and the things done there that mattered (words
  // asked and learned, coin spent, someone joining), newest last, with where you are now marked.
  static stops(entries: Entry[]): { at: string; place: string; did: string[] }[] {
    const stops: { at: string; place: string; did: string[] }[] = [];
    for (const e of entries) {
      const last = stops.at(-1);
      if (!last || last.place !== e.placeName) {
        stops.push({ at: e.at.replace(/^Day \d+, /, ''), place: e.placeName, did: [] });
      }
      const stop = stops.at(-1)!;
      if (e.said && !e.arrival && !/^Take (the|a|an) .* to /.test(e.said)) { stop.did.push(e.said); }
      stop.did.push(...e.notes.filter(n => /journal/.test(n)).map(n => n.replace(/^◆ In the journal: /, '◆ ')));
    }
    return stops;
  }
  static Itinerary({ frame }: { frame: Frame }) {
    const stops = Folio.stops(frame.entries), day = frame.screen.clock.split(',')[0];
    const shown = stops.slice(-7), hidden = stops.length - shown.length;
    return <section className="leaf itinerary"><h2>{day}, as you have gone</h2>
      {hidden > 0 && <p className="earlier">{hidden} earlier {hidden === 1 ? 'place' : 'places'}</p>}
      <ol>{shown.map((s, i) => <li key={`${s.at}${s.place}`} aria-current={i === shown.length - 1 ? 'location'
        : undefined}><span className="at">{s.at}</span> <span className="stop">{Typography.curl(Words.upper(s.place))}</span>
        {s.did.length > 0 && <ul>{s.did.slice(-3).map(d => <li key={d} className={d.startsWith('◆') ? 'learned-line'
          : ''}>{Typography.curl(d)}</li>)}</ul>}</li>)}</ol>
    </section>;
  }
  // What lies ahead as far as it is known: what you mean to do, and the places heard of, with who told you.
  static Ahead({ frame }: { frame: Frame }) {
    const screen = frame.screen, heard = screen.knowledge.filter(n => n.kind === 'reported');
    if (!heard.length && !screen.objectives.length) { return null; }
    return <section className="leaf ahead"><h2>Ahead, as far as you know</h2>
      {screen.objectives.map(o => <p key={o} className="aim">{Typography.curl(o)}</p>)}
      {heard.map(n => <p key={n.text}>{Typography.curl(n.text)} <span className="how">{n.how}</span></p>)}
    </section>;
  }
  // A site as a record of its rooms: where you are, where you have been, and the ways you have seen but not taken.
  static Rooms({ chart }: { chart: Chart }) {
    const places = chart.places.filter(p => !p.external), name = new Map(places.map(p => [p.id, p.name]));
    const open = chart.edges.filter(e => !e.explored && name.has(e.from) && name.has(e.to));
    return <section className="leaf rooms"><h2>{chart.level ? Words.upper(chart.level) : 'This place'}</h2>
      <p><span className="key here">Here</span> {Typography.curl(places.find(p => p.here)?.name ?? '')}</p>
      <p><span className="key been">Been</span> {places.filter(p => p.visited && !p.here).map(p => p.name).join('; ')}</p>
      {open.length > 0 && <p><span className="key seen">Seen, not taken</span> {open.map(e => Folio.way(e, places))
        .join('; ')}</p>}
    </section>;
  }
  // A way seen and not yet taken: by what, to where (unless its name says), and a danger on it as far as known.
  static way(e: Chart['edges'][number], places: Chart['places']): string {
    const far = places.find(p => p.id === e.from)?.visited ? e.to : e.from;
    const to = places.find(p => p.id === far)?.name ?? '';
    return `${e.name}${to && !e.name.includes(to) ? ` to ${to}` : ''}${e.status === 'hazard' ? ' (a danger on it)' : ''}`;
  }
  // The ways on, each as a route: where it goes, and whether it is somewhere been or not yet.
  static Routes({ kit, group: g }: { kit: Kit; group: Group }) {
    if (!g.choices.length) { return null; }
    const screen = kit.frame.screen, heard = screen.knowledge.filter(n => n.kind === 'reported').map(n => n.text);
    const been = new Set(screen.map.filter(m => m.visited).map(m => m.name));
    return <div className={`group routes ${g.kind}`}><p className="head small">{g.kind === 'far' ? 'Set out'
      : 'About the place'}</p>
    <ul>{g.choices.map(c => {
      const to = screen.exits.find(x => c.id === x.id || c.id.startsWith(`${x.id}/`));
      const where = to?.destination.name ?? '', told = heard.find(h => where && h.includes(where.replace(/^the /, '')));
      // Out across the country every way says what it leads to as far as you know it; about a place, only where
      // you have been already.
      const state = !to ? '' : been.has(where) ? 'been' : g.kind === 'near' ? '' : told ? 'heard of' : 'not yet been';
      const by = to && g.kind === 'far' ? `by ${to.way}` : '';
      return <li key={c.id} style={{ marginLeft: `${Offers.depth(kit.offer, c) * 1.2}em` }}>
        <Parts.Act kit={kit} choice={c}><Parts.Label choice={c} />
          {(by || state) && <span className="by">{by}{by && state && ' · '}{state && <span className={`state ${
            state.replace(/ /g, '-')}`}>{state}</span>}</span>}</Parts.Act></li>;
    })}</ul></div>;
  }
}
