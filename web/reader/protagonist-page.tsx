import { useState, type ChangeEvent, type MouseEvent } from 'react';
import { Arms } from './arms';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Words } from './words';
import { CharacterPage } from './character-page';
import { Likeness } from '../../src/paintings/likeness';
import { Scenery } from '../../src/ui/scenery';
import { Typography } from '../../src/presentation/typography';
import type { Member } from '../engine/protocol';

// Before a country: who you are, and why you have come, as a spread: on the left your likeness (or the country, till
// you choose one), on the right your name, your people and your calling, your qualities, and the reasons to have come
// that this country holds (a father who did not come home, a debt, an errand), and setting out.
export class ProtagonistPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, setting = s.setting, catalog = s.catalog, member = s.party[0];
    if (!setting || !catalog || !member) { return null; }
    const calling = catalog.callings.find(c => c.id === member.classId);
    const people = catalog.ancestries.find(a => a.id === member.raceId);
    return (
      <div className="opening who-you-are" data-mode="create">
        <ProtagonistPage.Likeness app={app} />
        <main className="about-you">
          <p className="label">{setting.title}</p>
          <h1>{setting.pitch.heading}</h1>
          <p className="pitch">{setting.pitch.text}</p>
          <section className="fields" aria-label="Who you are">
            <label>Name<input value={member.name ?? ''} data-field="name" onChange={ProtagonistPage.change.bind(null, app)} /></label>
            <label>People<select value={member.raceId} data-field="raceId" onChange={ProtagonistPage.change.bind(null, app)}>
              {catalog.ancestries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            <label>Calling<select value={member.classId} data-field="classId" onChange={ProtagonistPage.change.bind(null, app)}>
              {catalog.callings.map(c => <option key={c.id} value={c.id}
                disabled={!ProtagonistPage.open(people, c.id)}>{ProtagonistPage.calling(c.name, people, c.id)}</option>)}
            </select></label>
            {calling?.specializations.length ? <label>{calling.id === 'cleric' ? 'Sworn to' : 'Specialty'}
              <select value={member.traits?.[0] ?? ''} data-field="specialization"
                onChange={ProtagonistPage.change.bind(null, app)}>
                <option value="">As it falls</option>
                {calling.specializations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label> : null}
          </section>
          <p className="what">{[people?.text, calling?.text, ProtagonistPage.special(member.name ?? 'you',
            calling?.specializations.find(t => t.id === member.traits?.[0]), calling?.id)].filter(Boolean).join(' ')}</p>
          <ProtagonistPage.Qualities app={app} />
          <ProtagonistPage.Weapon app={app} />
          <p className="label">Why you have come</p>
          <ol className="origins">{(setting.origins ?? []).map(o => (
            <li key={o.id}><button type="button" className="act" data-nav data-action="origin" data-id={o.id}
              aria-pressed={s.origin === o.id} onClick={ProtagonistPage.pick.bind(null, app)}>
              {o.title}<span className="why">{Words.upper(o.choice)}</span>
            </button></li>))}</ol>
          <ProtagonistPage.Trade app={app} />
          <p className="set-out">
            <button type="button" className="act go" data-nav data-action="start" onClick={app.opening.begin}>Set out</button>
            <button type="button" className="act" data-nav data-action="another" onClick={app.opening.anew}>Another country</button>
          </p>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  // The left page: the likeness you have chosen to be you, large, with your name on it; until you choose one, the
  // country you are coming into. Beneath, six likenesses to choose among (or none), three of each sex, of the station
  // your calling is painted in: nothing about you is assumed from your name.
  static Likeness({ app }: { app: ReaderApp }) {
    const s = app.state, member = s.party[0]!, chosen = member.likeness, faces = ProtagonistPage.faces(member);
    const country = Scenery.country(s.setting?.terrain, s.setting?.title ?? '');
    const shown = chosen ? Likeness.large(chosen) : country && `paintings/large/${country}.webp`;
    return (
      <aside className={`likeness${chosen ? ' chosen' : ''}`} aria-label="Your likeness">
        {shown && <figure className="sitting"><img src={shown} alt="" decoding="async"
          style={chosen ? { objectPosition: `50% ${Likeness.focus(chosen)}%` } : undefined}
          onError={e => { e.currentTarget.parentElement?.classList.add('gone'); }} />
          {chosen && <figcaption className="cap"><span className="n">{Typography.curl(member.name ?? '')}</span>
            <span className="credit">{Likeness.credits[chosen] ?? 'Painter unrecorded'}</span></figcaption>}</figure>}
        <div className="choose">
          <p className="label">{chosen ? 'Your likeness' : 'Choose a likeness, if you like'}</p>
          <ul className="faces">{faces.map(id => <li key={id}><button type="button" className="face"
            data-action="likeness" data-id={id} aria-pressed={chosen === id} aria-label={`Likeness ${id}`}
            onClick={() => app.opening.edit(0, 'likeness', chosen === id ? '' : id)}>
            <img src={Likeness.src(id)} alt="" style={{ objectPosition: `50% ${Likeness.focus(id)}%` }} /></button></li>)}
          </ul>
        </div>
      </aside>
    );
  }
  // The stations each calling is painted in, likeliest first.
  static readonly stations: Record<string, string[]> = { warrior: ['martial', 'labouring'], mage: ['learned', 'middling'],
    thief: ['labouring', 'middling'], cleric: ['religious', 'learned'], bard: ['player', 'artist'],
    ranger: ['labouring', 'martial'], monk: ['religious'], commoner: ['labouring', 'middling'] };
  // Three of each sex for the calling, young or grown, never one the game will not cast (see Likeness.choose).
  static faces(member: Member): string[] {
    const taken = new Set<string>(), stations = ProtagonistPage.stations[member.classId ?? ''] ?? ['middling'];
    const key = `${member.classId}:${member.raceId}:${member.backgroundId ?? ''}`;
    for (const sex of ['woman', 'man', 'woman', 'man', 'woman', 'man'] as const) {
      const id = Likeness.choose({ sex, stations, age: 'young' }, key, taken);
      if (id) { taken.add(id); }
    }
    return [...taken];
  }
  // Your qualities: six rolls of three dice, each placed on a quality, with what your people and calling add to it,
  // what it comes to in a fight, and what it is for. Choose one roll and then another to change them over; or roll
  // again (the cold playtest saw its rolled qualities, and could not place them).
  static Qualities({ app }: { app: ReaderApp }) {
    const [held, hold] = useState<string>();
    const s = app.state, member = s.party[0], catalog = s.catalog, rolled = member?.rolled as Record<string, number>;
    if (!rolled || !catalog) { return null; }
    const people = catalog.ancestries.find(a => a.id === member!.raceId);
    const calling = catalog.callings.find(c => c.id === member!.classId);
    // Changed over (or the one chosen chosen again), nothing is held: the page asks for no further quality.
    const choose = (q: string) => { if (held && held !== q) { app.opening.place(held, q); } hold(held ? undefined : q); };
    const what = held && catalog.qualities.find(q => q.id === held);
    return (
      <section className="placing" aria-label="Your qualities">
        <p className="label">Your qualities</p>
        <p className="how">{held ? `Now the quality to give ${rolled[held]} to.` : 'Six rolls of three dice. Choose one, then '
          + 'another, to change them over.'}</p>
        <ul className="rolls">{catalog.qualities.map(q => {
          const adds = (people?.qualities[q.id] ?? 0) + (calling?.qualities[q.id] ?? 0);
          const score = Math.max(1, rolled[q.id]! + adds);
          return <li key={q.id} className={held === q.id ? 'held' : undefined}><span className="q">{q.name}</span>
            <button type="button" className="act roll" data-quality={q.id} aria-pressed={held === q.id}
              onClick={choose.bind(null, q.id)}>{rolled[q.id]}</button>
            <span className="mods">{adds ? `${CharacterPage.signed(adds)} ${ProtagonistPage.from(people, calling, q.id)}` : ' '}</span>
            <span className="score"><b>{score}</b>{` · ${CharacterPage.signed(catalog.worth[score] ?? 0)} in a fight`}</span>
          </li>;
        })}</ul>
        <p className="rests">{what ? <><b>{what.name}:</b> {what.rests}</> : ' '}</p>
        <p><button type="button" className="act" data-action="reroll" onClick={app.opening.reroll.bind(app.opening)}>
          Roll again</button></p>
      </section>
    );
  }
  // Whose the change to a quality is: the people's, the calling's, or both.
  private static from(people: { name: string; qualities: Record<string, number> } | undefined,
    calling: { name: string; qualities: Record<string, number> } | undefined, q: string): string {
    return [people?.qualities[q] ? people.name.toLowerCase() : '', calling?.qualities[q] ? calling.name.toLowerCase() : '']
      .filter(Boolean).join(' and ');
  }
  // What the reason for coming makes you (the brothers' errand, a scribe of the order); or, for one who comes with
  // their trade and not much else, the trade, from those of their calling (Orsino's backgrounds for it).
  // The weapon set out with, of the calling's own: the one struck best with until another is chosen, and what it is
  // struck with and what that is worth (see Arms).
  static Weapon({ app }: { app: ReaderApp }) {
    const s = app.state, member = s.party[0], catalog = s.catalog;
    if (!member || !catalog) { return null; }
    const weapons = Arms.of(member, catalog), chosen = member.weapon ?? Arms.suited(member, catalog);
    const w = weapons.find(x => x.id === chosen);
    if (weapons.length < 2 || !w) { return null; }
    const by = w.missile ? 'dexterity' : 'strength', worth = Arms.worth(member, catalog, by);
    return (
      <section className="fields arms" aria-label="Your weapon">
        <label>Your weapon<select value={w.id} data-field="weapon" onChange={ProtagonistPage.change.bind(null, app)}>
          {weapons.map(x => <option key={x.id} value={x.id}>{Words.upper(x.name)}</option>)}</select></label>
        <p className="what">{`${w.missile ? 'Shot' : 'Wielded'}, and struck with by ${w.missile ? 'quickness' : 'strength'}: `
          + `${CharacterPage.signed(worth)} in a fight.`}</p>
      </section>
    );
  }
  static Trade({ app }: { app: ReaderApp }) {
    const s = app.state, member = s.party[0], catalog = s.catalog;
    const origin = s.setting?.origins?.find(o => o.id === s.origin);
    if (!member || !catalog || !origin) { return null; }
    const given = catalog.backgrounds.find(b => b.id === origin.background);
    if (given) {
      return <p className="what trade">{`${Words.upper(origin.title)} makes you ${Words.article(given.name.toLowerCase())}`
        + `${given.text ? `, who ${given.text.replace('; ', ' and ')}` : ''}.`}</p>;
    }
    const trades = catalog.backgrounds.filter(b => b.calling === member.classId);
    if (!trades.length) { return null; }
    const chosen = trades.find(t => t.id === member.backgroundId);
    return (
      <section className="fields trade" aria-label="Your trade">
        <label>Your trade<select value={chosen?.id ?? ''} data-field="backgroundId"
          onChange={ProtagonistPage.change.bind(null, app)}>
          <option value="">Nothing in particular</option>
          {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        {chosen?.text && <p className="what">{Words.upper(chosen.text.replace('; ', ' and '))}.</p>}
      </section>
    );
  }
  // What a specialty is, and so what the protagonist's first spells or prayers are of ("Deathspeaker: a herald of death
  // and the afterlife; Wenna's first prayers are of death"): M16's cleric of death was told only that clerics heal.
  private static special(who: string, t: { name: string; text?: string; of?: string } | undefined,
    calling?: string): string {
    if (!t) { return ''; }
    const first = t.of ? ` ${Words.upper(who)}'s first ${calling === 'cleric' ? 'prayers' : 'spells'} are of ${t.of}.` : '';
    return `${t.name}: ${(t.text ?? '').replace(/^You are /, '').replace(/\.$/, '')}.${first}`;
  }
  // A calling as offered: "Cleric (not for an elf)", when it is not open to the people chosen.
  private static calling(name: string, people: { name: string; callings: string[] } | undefined, id: string): string {
    if (this.open(people, id)) { return name; }
    const who = people!.name.toLowerCase();
    return `${name} (not for ${/^[aeiou]/.test(who) ? 'an' : 'a'} ${who})`;
  }
  // Whether a people may follow a calling.
  private static open(people: { callings: string[] } | undefined, calling: string): boolean {
    return !people || people.callings.includes(calling);
  }
  private static change(app: ReaderApp, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    app.opening.edit(0, e.currentTarget.dataset.field!, e.currentTarget.value);
  }
  private static pick(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    app.setState({ origin: e.currentTarget.dataset.id! });
    app.opening.readySoon();
  }
}
