import type { Screen } from '../../src/ui/screen-types';
import { Typography } from '../../src/presentation/typography';
import { Atlas } from '../reader/atlas';
import type { Frame } from '../engine/protocol';
import { Words } from '../reader/words';

// What can be looked up rather than done, the same for every composition, which decides where and when it shows:
// what the company knows and how, who is in it and how they are, what they carry, and the country as far as known.
export class References {
  static readonly kinds: Record<Screen['knowledge'][number]['kind'], string> = {
    seen: 'Seen for yourself', confirmed: 'Heard, and since borne out', reported: 'Only heard', known: 'Known' };
  static Notes({ screen }: { screen: Screen }) {
    const by = Object.keys(References.kinds).map(k => [k, screen.knowledge.filter(n => n.kind === k)] as const)
      .filter(([, list]) => list.length);
    return <div className="notes">
      {screen.objectives.length > 0 && <section><h3>What you mean to do</h3>
        {screen.objectives.map(o => <p key={o}>{Typography.curl(o)}</p>)}</section>}
      {by.map(([k, list]) => <section key={k}><h3>{References.kinds[k as keyof typeof References.kinds]}</h3>
        {list.map(n => <p key={n.text}>{Typography.curl(n.text)} <span className="how">{n.how}</span></p>)}</section>)}
      {!by.length && !screen.objectives.length && <p className="none">Nothing yet.</p>}
    </div>;
  }
  static Company({ screen }: { screen: Screen }) {
    return <div className="company">{screen.party.map(m => <section key={m.id}>
      <h3>{m.name} <span className="line-of">{m.line}, level {m.level}</span></h3>
      <p><span className={m.hp <= m.maxHp / 3 ? 'hurt' : ''}>{Words.hurt(m.hp, m.maxHp)}</span> · {m.hp} of {m.maxHp}
        {m.conditions.length > 0 && <span className="hurt"> · {m.conditions.join(', ')}</span>}
        {(m.boons ?? []).length > 0 && <span> · {m.boons!.join(', ')}</span>}</p>
      <p className="abilities">{m.abilities.map(a => <span key={a.id}><b>{a.name}.</b> {a.text} </span>)}</p>
    </section>)}</div>;
  }
  static Pack({ screen }: { screen: Screen }) {
    const owners = [...new Set(screen.items.map(i => i.ownerName))];
    return <div className="pack">
      <p>{screen.purse.coin} coin · {screen.purse.rations} {screen.purse.rations === 1 ? 'ration' : 'rations'}</p>
      {owners.map(o => <section key={o}><h3>{o} carries</h3>
        <p>{screen.items.filter(i => i.ownerName === o).map(i => `${i.name}${i.equipped ? ' (in hand)' : ''}`)
          .join(', ')}</p></section>)}
    </div>;
  }
  // The places as words: where you are, where you have been, what you can see the way to, and what you know only by
  // name. This is the map of the literary page, and the key to the drawn one.
  static Places({ screen }: { screen: Screen }) {
    const been = screen.map.filter(p => p.visited && !p.here), here = screen.map.find(p => p.here);
    const areas = screen.region?.areas ?? [], seen = areas.filter(a => !a.visited);
    const heard = screen.knowledge.filter(n => n.kind === 'reported').map(n => n.text);
    return <div className="places">
      <p><span className="key here">Here</span> {Typography.curl(here?.name ?? screen.place.name)}
        {here?.zone ? `, in ${here.zone}` : ''}</p>
      {been.length > 0 && <p><span className="key been">Been</span> {been.map(p => p.name).join('; ')}</p>}
      {seen.length > 0 && <p><span className="key seen">Can see the way to</span> {seen.map(a => a.name).join('; ')}</p>}
      {heard.length > 0 && <p><span className="key heard">Heard of</span> {heard.map(Typography.curl).join(' ')}</p>}
    </div>;
  }
  // The country drawn: the reader's own atlas, in this page's colours, with the place you are at in blue.
  static Land({ frame, small }: { frame: Frame; small?: boolean }) {
    const region = frame.screen.region;
    if (!region) { return null; }
    const came = [...frame.entries].reverse().find(e => e.place && e.place !== frame.screen.place.id)?.place;
    const d = region.land ? Atlas.draw(region, came) : Atlas.schematic(region, came);
    return <figure className={`land${small ? ' small' : ''}`}>
      <svg viewBox={d.box.join(' ')} role="img" aria-label="The country as far as you know it">
        {d.cells.map(c => <polygon key={c.i} className={`cell ${c.cover}`} points={c.points} />)}
        {d.rivers.map((r, i) => <path key={`r${i}`} className="river" d={r} />)}
        {d.roads.map((r, i) => <path key={`d${i}`} className={`road${r.came ? ' came' : ''}`} d={r.d} />)}
        {d.paths.map((p, i) => <path key={`p${i}`} className={`path${p.came ? ' came' : ''}`} d={p.d} />)}
        {d.places.map(p => p.kind === 'settlement'
          ? <rect key={p.id} className={`town${p.visited ? '' : ' unvisited'}`} x={p.x - 5} y={p.y - 5} width={10} height={10} />
          : <circle key={p.id} className={`mark${p.visited ? ' visited' : ''}`} cx={p.x} cy={p.y} r={4} />)}
        {d.here && <circle className="here" cx={d.here.x} cy={d.here.y} r={7} />}
        {d.labels.map(l => <text key={l.id} className={`${l.kind === 'settlement' ? 'town-name' : 'mark-name'}${l.known
          ? '' : ' unknown'}`} x={l.x} y={l.y} textAnchor={l.anchor}>{l.text}</text>)}
      </svg>
    </figure>;
  }
}
