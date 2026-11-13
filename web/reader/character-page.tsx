import type { SkillRow } from '../../src/presentation/character-sheet';
import { useState } from 'react';
import type { MemberRow, Screen } from '../../src/ui/screen-types';
import { Glyphs } from './creation/glyphs';
import type { Choice } from '../../src/ui/choice-list';
import type { CharacterSheet, DevelopmentOption } from '../../src/presentation/character-sheet';
import type { ReaderApp } from './reader-app';
import { Typography } from '../../src/presentation/typography';
import { Counted } from '../../src/presentation/counted';
import { Act, type Draw } from './stage/act';
import { Told } from './stage/told';
import { Words } from './words';
import { CreationRules } from './creation-rules';

// The character: who they are, how they stand, what they can do and what they could become. Everything on it is
// worked out by the rules the game plays by (see CharacterSheets), so what it says is what a fight or a check will
// read. A level's development, when there is one to spend, comes first: each way of spending it with what it would
// change, chosen here. With more than one in the company, each is a page of their own. A portrait of someone of their
// calling and people stands small beside their name, as on their card in a fight, where one fits.
export class CharacterPage {
  // What is done from the sheet, told on it when done: by the act's name, which the page had read off its words
  // ("Have …", "Raise …", "Take up …": AR-05).
  static readonly grows: ReadonlySet<string> = new Set(['raise_quality', 'learn_skill', 'learn_spell', 'take_feat',
    'prepare_spell', 'field_spell']);
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
        <header className={`head-of${m.portrait ? ' faced' : m.face ? ' faced pc' : ''}`}>
          {m.portrait ? <img className="sat" src={m.portrait.src} alt="" decoding="async"
            style={{ objectPosition: `50% ${m.portrait.focus}%` }} />
            : m.face && <img className="sat" src={m.face.medium} alt="" decoding="async" />}
          <h2 className="who">{Typography.curl(m.name)}</h2>
          <p className="line-of">{m.emblems?.map(id => <Glyphs.View key={id} id={id} className="emblem" />)}
            {Words.upper(Words.article(m.line))}, level {m.level}{m.background
            ? `, once ${Words.article(m.background.toLowerCase())}` : ''}</p>
          <CharacterPage.Gauges member={m} />
          {m.sheet?.specialty && <CharacterPage.Specialty who={m.name} specialty={m.sheet.specialty} />}
          <CharacterPage.Standing member={m} />
        </header>
        {exchange?.act && CharacterPage.grows.has(exchange.act) && <Told.Happened exchange={exchange} />}
        {/* A character sheet, compact and in one view (the owner, 5 November): the qualities across the top under who
            and how they are; then how they fight and save, what they can do and know, what they carry and how they
            grow, side by side; a development to spend before them all. */}
        <CharacterPage.Qualities member={m} />
        <CharacterPage.Development member={m} draw={draw} choices={sections.find(s => s.id === 'development')?.choices ?? []} />
        <div className="sheet-grid">
          <CharacterPage.Fighting member={m} />
          <CharacterPage.Can member={m} swaps={sections.find(s => s.id === 'prepare')?.choices ?? []} draw={draw} />
          <div className="kit"><CharacterPage.Carries member={m} screen={screen} />
            {acts.length > 0 && <section><h3>What can be done</h3><Act.List choices={acts} draw={draw} className="column" />
            </section>}</div>
        </div>
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
  // of death and the afterlife. Aldith's first prayers are of death."
  static Specialty({ who, specialty: s }: { who: string; specialty: NonNullable<CharacterSheet['specialty']> }) {
    return <p className="specialty"><b>{s.name}.</b> {Typography.curl(`${s.about} ${who}'s first ${s.prayers
      ? 'prayers' : 'spells'} are of ${s.of}.`)}</p>;
  }
  // A level's development: what it is, and each way of spending it with what it would change. Without one, how far
  // the next level is and what it will bring.
  static Development({ member: m, draw, choices }: { member: MemberRow; draw: Draw; choices: Choice[] }) {
    const d = m.development;
    // How far the next level is, where the measure above does not say it (ready for a level, at the highest).
    if (!d) {
      const brings = /, which brings (.+)$/.exec(m.progress ?? '')?.[1];
      if (m.progress && / of [\d,]+ experience/.test(m.progress)) {
        return brings ? <p className="progress">{Typography.curl(`Level ${m.level + 1} brings ${brings}.`)}</p> : null;
      }
      return m.progress ? <p className="progress">{Typography.curl(m.progress)}.</p> : null;
    }
    const chosen = (o: DevelopmentOption) => choices.find(c => c.command === o.command);
    const skills = d.options.filter(o => o.kind === 'skill'), qualities = d.options.filter(o => o.kind === 'quality');
    return (
      <section className="development" aria-label="Development">
        <h3>{d.left === 1 ? 'A development to spend' : `${d.left} developments to spend`}</h3>
        <p className="how">Taken at once, and for good.</p>
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
          : <span className="take still">{o.name}{o.why && <span className="why"> · {Typography.curl(o.why)}</span>}</span>}
        {o.kind === 'quality' && <span className="from-to">{o.text}</span>}
        {o.kind === 'skill' && o.text && <p className="what">{Typography.curl(o.text)}</p>}
        <ul className="changes">{o.changes.map(c => <li key={c}>{Typography.curl(c)}</li>)}
          {(o.opens ?? []).map(w => <li key={w} className="opens">Opens {Typography.curl(w)}</li>)}</ul>
      </li>
    );
  }
  // How much harm they can still take, and how far they are from the next level, as two measures.
  static Gauges({ member: m }: { member: MemberRow }) {
    const needed = /(\d[\d,]*) of (\d[\d,]*) experience/.exec(m.progress ?? '');
    const [got, of] = needed ? [Number(needed[1]!.replace(/,/g, '')), Number(needed[2]!.replace(/,/g, ''))] : [m.experience, 0];
    return (
      <div className="gauges">
        <p className="gauge"><span className="label">Hit points</span><b>{m.hp}</b><span className="of"> of {m.maxHp}</span>
          <span className="bar" aria-hidden="true"><i className={m.hp < m.maxHp ? 'hurt' : undefined}
            style={{ width: `${m.maxHp ? (m.hp / m.maxHp) * 100 : 0}%` }} /></span></p>
        {m.maxMana > 0 && <p className="gauge"><span className="label">Mana</span><b>{m.mana}</b>
          <span className="of"> of {m.maxMana}</span><span className="bar" aria-hidden="true"><i className="mana"
            style={{ width: `${(m.mana / m.maxMana) * 100}%` }} /></span></p>}
        {of > 0 && <p className="gauge"><span className="label">To level {m.level + 1}</span><b>{got}</b>
          <span className="of"> of {of}</span><span className="bar" aria-hidden="true"><i className="experience"
            style={{ width: `${Math.min(100, (got / of) * 100)}%` }} /></span></p>}
      </div>
    );
  }
  // How they are now: hurt or whole, what holds them, what helps them.
  static Standing({ member: m }: { member: MemberRow }) {
    if (!m.conditions.length && !(m.boons ?? []).length && !m.fallen) { return null; }
    return (
      <p className="standing"><span className={m.hp < m.maxHp ? 'hurt' : undefined}>{Words.upper(Words.hurt(m.hp, m.maxHp))}</span>
        {` · ${m.hp} of ${m.maxHp} hit points`}
        {m.conditions.length > 0 && <span className="hurt"> · {m.conditions.join(', ')}</span>}
        {(m.boons ?? []).length > 0 && <span> · {m.boons!.join(', ')}</span>}
        {m.fallen && <span className="hurt"> · {Typography.curl(m.fallen)}</span>}</p>
    );
  }
  // The six qualities in a row, each its score and what it adds, its rules under the pointer.
  static Qualities({ member: m }: { member: MemberRow }) {
    const sheet = m.sheet;
    if (!sheet) { return null; }
    return <ul className="stat-row" aria-label="Qualities">{sheet.qualities.map(q => <li key={q.id}
      title={Typography.curl(CreationRules.quality(q.id, q.score, undefined, false).join(' '))}>
      <span className="q">{q.name.slice(0, 3)}</span><b className="score">{q.score}</b>
      <span className="mod">{CharacterPage.signed(Math.floor((q.score - 10) / 2))}</span></li>)}</ul>;
  }
  // How they fight and how they save, as the rules will read them.
  static Fighting({ member: m }: { member: MemberRow }) {
    const sheet = m.sheet;
    if (!sheet) { return <section className="fighting" />; }
    const saves = sheet.saves.map(b => {
      const m2 = /^Against (.+) \((\w+)\)$/.exec(b.label), against = m2?.[1] ?? b.label, quality = m2?.[2] ?? '';
      return { quality, against: against!.replace(/ and /, ', '), value: b.value };
    });
    return <section className="fighting"><h3>Fighting</h3>
      <dl className="rows">{sheet.fighting.filter(b => b.label !== 'Hit points').map(b => <div key={b.label}>
        <dt>{b.label}</dt><dd>{Typography.curl(b.value)}</dd></div>)}</dl>
      <h3>Saves</h3>
      <dl className="rows saves">{saves.map(x => <div key={x.quality || x.against}>
        <dt>{x.quality || Words.upper(x.against)}</dt><dd><b>{x.value}</b>
          {x.quality && <small>{Typography.curl(x.against)}</small>}</dd></div>)}</dl>
    </section>;
  }
  // What they can do and know: techniques and spells as names, one read at a time beneath them; what is prepared
  // today; skills in a line, each with what it adds.
  static Can({ member: m, swaps, draw }: { member: MemberRow; swaps: Choice[]; draw: Draw }) {
    const [read, setRead] = useState<string>(), sheet = m.sheet, shown = m.abilities.find(a => a.id === read);
    return <section className="can"><h3>Can do</h3>
      <ul className="chips">{m.abilities.map(a => <li key={a.id}><button type="button" aria-pressed={a.id === read}
        onClick={() => setRead(a.id === read ? undefined : a.id)}>{a.name}
        {a.price && <small>{a.price}{CharacterPage.yet(m, a.price)}</small>}</button></li>)}</ul>
      {shown && <p className="read"><b>{shown.name}.</b> {Typography.curl(shown.text)}</p>}
      <CharacterPage.Prepared member={m} swaps={swaps} draw={draw} />
      {sheet && <CharacterPage.Skills heading="Knows" skills={sheet.skills.filter(k => !k.means)} />}
      {sheet && <CharacterPage.Skills heading="Holds" skills={sheet.skills.filter(k => k.means)} />}
    </section>;
  }
  // What they know (a craft learned) and, apart, what they hold (a means: a light, an oath they have been given).
  static Skills({ heading, skills }: { heading: string; skills: SkillRow[] }) {
    if (!skills.length) { return null; }
    return <><h3>{heading}</h3><p className="skill-line">{skills.map((k, i) =>
      <span key={k.id} title={Typography.curl(`${k.from}. ${k.text}`)}>{i > 0 && ' · '}{k.name}
        {k.check !== undefined && <small> {CharacterPage.signed(k.check)}</small>}</span>)}</p></>;
  }
  // What they carry: what is in hand and worn first, then the rest, the same things together.
  static Carries({ member: m, screen }: { member: MemberRow; screen: Screen }) {
    const gear = CharacterPage.counted(screen.items.filter(i => i.owner === m.id));
    const used = gear.filter(g => g.item.equipped), rest = gear.filter(g => !g.item.equipped);
    const named = (xs: typeof gear) => xs.map(({ item: i, count }) =>
      Words.upper(count > 1 ? Words.many(count, Words.bare(i.name)) : Words.bare(i.name))).join(' · ');
    return <section className="carries"><h3>Carries</h3>
      {used.length > 0 && <p className="in-hand">{named(used)}</p>}
      {rest.length > 0 ? <p className="gear-line">{named(rest)}</p> : !used.length && <p className="none">Nothing.</p>}
    </section>;
  }
  // The spells prepared today, each with what could be prepared in its place (an hour's study or prayer), chosen
  // there: on the place's page it had been a fold three deep, "Prepare spells › In place of Bless (first-level slot) ›
  // Dark Bolt" (play 9: M17-25).
  static Prepared({ member: m, swaps, draw }: { member: MemberRow; swaps: Choice[]; draw: Draw }) {
    if (!(m.spells ?? []).length) { return null; }
    const offered = new Set<Choice>();
    return <section className="prepared"><h3>Prepared today</h3><ul>{m.spells!.map((x, i) => {
      const swap = swaps.find(c => c.label.startsWith(`In place of ${x.name} (`) && !offered.has(c));
      if (swap) { offered.add(swap); }
      return <li key={`${x.name}${i}`}><b>{x.name}</b><span className="from">{` level ${x.level}${x.ready ? '' : ', spent'}`}</span>
        {(swap?.children ?? []).length > 0 && <div className="instead"><span className="label">Or prepare instead</span>
          <Act.List choices={swap!.children!} draw={draw} className="small swaps" /></div>}</li>;
    })}</ul></section>;
  }
  static signed(n: number): string { return n >= 0 ? `+${n}` : `−${-n}`; }
  // What is carried, the same things together (three torches, not a torch three times), what is in use apart.
  static counted<T extends { name: string; equipped?: boolean }>(items: T[]): { item: T; count: number }[] {
    return Counted.together(items);
  }
}
