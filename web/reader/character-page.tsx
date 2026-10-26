import type { MemberRow, Screen } from '../../src/ui/screen-types';
import type { Choice } from '../../src/ui/choice-list';
import type { CharacterSheet, DevelopmentOption } from '../../src/presentation/character-sheet';
import type { ReaderApp } from './reader-app';
import { Typography } from '../../src/presentation/typography';
import { Act, type Draw } from './stage/act';
import { Told } from './stage/told';
import { Words } from './words';

// The character: who they are, how they stand, what they can do and what they could become. Everything on it is
// worked out by the rules the game plays by (see CharacterSheets), so what it says is what a fight or a check will
// read. A level's development, when there is one to spend, comes first: each way of spending it with what it would
// change, chosen here. With more than one in the company, each is a page of their own.
export class CharacterPage {
  static View({ app }: { app: ReaderApp }) {
    const frame = app.state.frame!, screen = frame.screen, draw = Act.draw(app);
    const m = screen.party.find(x => x.id === app.state.member) ?? screen.party[0]!;
    const sections = app.menu.sections, exchange = frame.leaf.exchange;
    const members = sections.find(s => s.id === 'members')?.choices ?? [];
    const acts = sections.find(s => s.id === 'acts')?.choices ?? [];
    return (
      <article className="character" data-region="party" aria-label={`${m.name}: character`}>
        {members.length > 0 && <nav className="members" aria-label="The company">
          {members.map(c => <Act.View key={c.id} choice={c} draw={draw} className={`member${c.id === m.id ? ' here' : ''}`}>
            <span className="n">{c.label}</span><span className="r">{c.note}</span></Act.View>)}</nav>}
        <h2 className="who">{Typography.curl(m.name)}</h2>
        <p className="line-of">{Words.upper(Words.article(m.line))}, level {m.level}{m.background
          ? `, once ${Words.article(m.background.toLowerCase())}` : ''}</p>
        {m.sheet?.specialty && <CharacterPage.Specialty specialty={m.sheet.specialty} />}
        {exchange?.said && /^(Have|Raise|Take up)/.test(exchange.said) && <Told.Happened exchange={exchange} />}
        <CharacterPage.Development member={m} draw={draw} choices={sections.find(s => s.id === 'development')?.choices ?? []} />
        <CharacterPage.Standing member={m} />
        <CharacterPage.Sheet member={m} screen={screen} />
        {acts.length > 0 && <section><h3>What can be done</h3><Act.List choices={acts} draw={draw} className="column" /></section>}
      </article>
    );
  }
  // A spell of a level the member has no slot for is still to come, and says so (the cold playtest read second- and
  // third-level spells beside a first-level mage's, and could not tell which could be cast).
  static yet(m: MemberRow, price: string): string {
    const level = Number(/^(\d)(?:st|nd|rd|th)-level slot$/.exec(price)?.[1] ?? 0);
    return level > (m.maxSlots ?? []).length ? ' · not yet' : '';
  }
  // What the member is sworn or schooled to, and so what their first spells are of: "Deathspeaker. You are a herald
  // of death and the afterlife. Their first prayers are of death."
  static Specialty({ specialty: s }: { specialty: NonNullable<CharacterSheet['specialty']> }) {
    return <p className="specialty"><b>{s.name}.</b> {Typography.curl(s.about)} Their first {s.prayers ? 'prayers'
      : 'spells'} are of {s.of}.</p>;
  }
  // A level's development: what it is, and each way of spending it with what it would change. Without one, how far
  // the next level is and what it will bring.
  static Development({ member: m, draw, choices }: { member: MemberRow; draw: Draw; choices: Choice[] }) {
    const d = m.development;
    if (!d) { return m.progress ? <p className="progress">{Typography.curl(m.progress)}.</p> : null; }
    const chosen = (o: DevelopmentOption) => choices.find(c => c.command === o.command);
    const skills = d.options.filter(o => o.kind === 'skill'), qualities = d.options.filter(o => o.kind === 'quality');
    return (
      <section className="development" aria-label="Development">
        <h3>{d.left === 1 ? 'A development to spend' : `${d.left} developments to spend`}</h3>
        <p className="how">Each level gained gives one: a skill the calling teaches, or a point of a quality. It is
          taken at once, and for good.</p>
        {skills.length > 0 && <><p className="label">A skill</p><ul className="options">{skills.map(o =>
          <CharacterPage.Option key={o.id} option={o} choice={chosen(o)} draw={draw} />)}</ul></>}
        <p className="label">A point of a quality</p>
        <ul className="options">{qualities.map(o => <CharacterPage.Option key={o.id} option={o} choice={chosen(o)}
          draw={draw} />)}</ul>
      </section>
    );
  }
  static Option({ option: o, choice, draw }: { option: DevelopmentOption; choice?: Choice; draw: Draw }) {
    return (
      <li className={`option ${o.kind}`}>
        {choice ? <Act.View choice={choice} draw={draw} className="take">{choice.label}</Act.View>
          : <span className="take still">{o.name}</span>}
        {o.kind === 'quality' && <span className="from-to">{o.text}</span>}
        {o.kind === 'skill' && o.text && <p className="what">{Typography.curl(o.text)}</p>}
        <ul className="changes">{o.changes.map(c => <li key={c}>{Typography.curl(c)}</li>)}
          {(o.opens ?? []).map(w => <li key={w} className="opens">Opens {Typography.curl(w)}</li>)}</ul>
      </li>
    );
  }
  // How they are now: hurt or whole, what holds them, what helps them.
  static Standing({ member: m }: { member: MemberRow }) {
    return (
      <p className="standing"><span className={m.hp < m.maxHp ? 'hurt' : undefined}>{Words.upper(Words.hurt(m.hp, m.maxHp))}</span>
        {` · ${m.hp} of ${m.maxHp} hit points`}
        {m.conditions.length > 0 && <span className="hurt"> · {m.conditions.join(', ')}</span>}
        {(m.boons ?? []).length > 0 && <span> · {m.boons!.join(', ')}</span>}</p>
    );
  }
  static Sheet({ member: m, screen }: { member: MemberRow; screen: Screen }) {
    const sheet = m.sheet, gear = CharacterPage.counted(screen.items.filter(i => i.owner === m.id));
    return <>
      {sheet && <section><h3>Qualities</h3><table className="qualities"><tbody>{sheet.qualities.map(q => <tr key={q.id}>
        <th scope="row">{q.name}</th>
        <td className="score">{q.score}{q.score !== q.base && <span className="base"> (of {q.base})</span>}</td>
        <td className="mods"><span title="in a fight">{CharacterPage.signed(q.fight)}</span>
          {q.check !== q.fight && <span className="check"> · {CharacterPage.signed(q.check)} in a check</span>}</td>
        <td className="rests">{Typography.curl(q.rests)}</td></tr>)}</tbody></table></section>}
      {sheet && <section><h3>In a fight</h3><dl className="bearings">{sheet.fighting.map(b => <div key={b.label}>
        <dt>{b.label}</dt><dd>{Typography.curl(b.value)}</dd></div>)}</dl></section>}
      {sheet && <section><h3>Saves</h3><dl className="bearings">{sheet.saves.map(b => <div key={b.label}>
        <dt>{Typography.curl(b.label)}</dt><dd>{b.value} and the die</dd></div>)}</dl></section>}
      {sheet && sheet.skills.length > 0 && <section><h3>Skills</h3><dl className="skills">{sheet.skills.map(s =>
        <div key={s.id}><dt>{s.name} <span className="from">{s.from}{s.check !== undefined
          && ` · ${CharacterPage.signed(s.check)} in a check`}</span></dt>
          <dd>{Typography.curl(s.text)}</dd></div>)}</dl></section>}
      {(m.spells ?? []).length > 0 && <section><h3>Prepared today</h3><ul>
        {[...new Set(m.spells!.map(x => x.level))].map(l => <li key={l}><b>Level {l}</b>{' · '}
          {m.spells!.filter(x => x.level === l).map(x => x.ready ? x.name : `${x.name} (spent)`).join(', ')}</li>)}
      </ul></section>}
      <section><h3>Techniques</h3><dl className="abilities">{m.abilities.map(a => <div key={a.id}>
        <dt>{a.name}{a.price && <span className="from"> {a.price}{CharacterPage.yet(m, a.price)}</span>}</dt>
        <dd>{Typography.curl(a.text)}</dd></div>)}</dl></section>
      <section><h3>Carries</h3><ul className="gear">{gear.map(({ item: i, count }) => <li key={i.id}>
        <b>{Words.upper(count > 1 ? Words.many(count, Words.bare(i.name)) : Words.bare(i.name))}</b>
        {i.equipped && <span className="from"> in use</span>}{i.description && <span> · {Typography.curl(i.description)}</span>}
      </li>)}</ul>{!gear.length && <p className="none">Nothing.</p>}</section>
    </>;
  }
  static signed(n: number): string { return n >= 0 ? `+${n}` : `−${-n}`; }
  // What is carried, the same things together (three torches, not a torch three times), what is in use apart.
  static counted<T extends { name: string; equipped?: boolean }>(items: T[]): { item: T; count: number }[] {
    const out: { item: T; count: number }[] = [];
    for (const item of items) {
      const same = out.find(o => o.item.name === item.name && !!o.item.equipped === !!item.equipped);
      if (same) { same.count++; } else { out.push({ item, count: 1 }); }
    }
    return out;
  }
}
