import type { ChangeEvent, MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Words } from './words';

// Before a country: who you are, and why you have come. Your name, your people and your calling are yours to change;
// the reasons to have come are the ones this country holds (a father who did not come home, a debt, an errand).
export class ProtagonistPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, setting = s.setting, catalog = s.catalog, member = s.party[0];
    if (!setting || !catalog || !member) { return null; }
    const calling = catalog.callings.find(c => c.id === member.classId);
    const people = catalog.ancestries.find(a => a.id === member.raceId);
    return (
      <div className="opening who-you-are" data-mode="create">
        <main>
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
          </section>
          <p className="what">{[people?.text, calling?.text].filter(Boolean).join(' ')}</p>
          <p className="label">Why you have come</p>
          <ol className="origins">{(setting.origins ?? []).map(o => (
            <li key={o.id}><button type="button" className="act" data-nav data-action="origin" data-id={o.id}
              aria-pressed={s.origin === o.id} onClick={ProtagonistPage.pick.bind(null, app)}>
              {o.title}<span className="why">{Words.upper(o.choice)}</span>
            </button></li>))}</ol>
          <ProtagonistPage.Trade app={app} />
          <p className="set-out">
            <button type="button" className="act go" data-nav data-action="start" onClick={app.opening.begin}>Go</button>
            <button type="button" className="act" data-nav data-action="another" onClick={app.opening.anew}>Another country</button>
          </p>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  // What the reason for coming makes you (the brothers' errand, a scribe of the order); or, for one who comes with
  // their trade and not much else, the trade, from those of their calling (Orsino's backgrounds for it).
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
