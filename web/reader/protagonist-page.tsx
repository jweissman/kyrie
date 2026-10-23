import type { ChangeEvent, MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { Toast } from './toast';
import { Words } from './words';

// Before a generated country: one person, and why they have come. Their name, their people and their calling are
// theirs to change; the reasons to have come are the ones this country holds (a father who did not come home, a
// debt, an errand), each said as it would begin.
export class ProtagonistPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, setting = s.setting, catalog = s.catalog, member = s.party[0];
    if (!setting || !catalog || !member) { return null; }
    const calling = catalog.callings.find(c => c.id === member.classId);
    const people = catalog.ancestries.find(a => a.id === member.raceId);
    return (
      <div className="opening protagonist-page" data-mode="create">
        <main className="protagonist-sheet">
          <header className="opening-head">
            <button type="button" className="back" onClick={app.opening.campaigns}>{setting.title}</button>
            <h1>{setting.pitch.heading}</h1>
          </header>
          <p className="pitch">{setting.pitch.text}</p>
          <section className="who" aria-label="Who you are">
            <label className="name"><span>Name</span>
              <input value={member.name ?? ''} data-field="name" onChange={ProtagonistPage.change.bind(null, app)} /></label>
            <label><span>People</span>
              <select value={member.raceId} data-field="raceId" onChange={ProtagonistPage.change.bind(null, app)}>
                {catalog.ancestries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            <label><span>Calling</span>
              <select value={member.classId} data-field="classId" onChange={ProtagonistPage.change.bind(null, app)}>
                {catalog.callings.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <p className="what">{[people?.text, calling?.text].filter(Boolean).join(' ')}</p>
          </section>
          <section className="why" aria-label="Why you have come">
            <h2>Why have you come?</h2>
            <ol className="origins">{(setting.origins ?? []).map(o => (
              <li key={o.id}><button type="button" data-nav data-action="origin" data-id={o.id}
                aria-pressed={s.origin === o.id} className={s.origin === o.id ? 'chosen' : ''}
                onClick={ProtagonistPage.pick.bind(null, app)}>
                <span className="l">{o.title}</span><span className="blurb">{Words.upper(o.choice)}</span>
              </button></li>))}</ol>
          </section>
          <div className="set-out">
            <button type="button" className="primary" data-nav data-action="start" onClick={app.opening.begin}>Begin</button>
            <button type="button" data-nav data-action="campaigns" onClick={app.opening.campaigns}>Another country</button>
          </div>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  private static change(app: ReaderApp, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    app.opening.edit(0, e.currentTarget.dataset.field!, e.currentTarget.value);
  }
  private static pick(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    app.setState({ origin: e.currentTarget.dataset.id! });
  }
}
