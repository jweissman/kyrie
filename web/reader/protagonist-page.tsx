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
              {catalog.callings.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          </section>
          <p className="what">{[people?.text, calling?.text].filter(Boolean).join(' ')}</p>
          <p className="label">Why you have come</p>
          <ol className="origins">{(setting.origins ?? []).map(o => (
            <li key={o.id}><button type="button" className="act" data-nav data-action="origin" data-id={o.id}
              aria-pressed={s.origin === o.id} onClick={ProtagonistPage.pick.bind(null, app)}>
              {o.title}<span className="why">{Words.upper(o.choice)}</span>
            </button></li>))}</ol>
          <p className="set-out">
            <button type="button" className="act go" data-nav data-action="start" onClick={app.opening.begin}>Go</button>
            <button type="button" className="act" data-nav data-action="another" onClick={app.opening.anew}>Another country</button>
          </p>
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
