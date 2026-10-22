import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { CompanionCard } from './companion-card';
import { Toast } from './toast';

// Forming the company: the campaign's pitch, three companions each told in a sentence (and changed in place), what
// the three cover between them, and setting out.
export class CompanyPage {
  static View({ app }: { app: ReaderApp }) {
    const s = app.state, setting = s.setting, catalog = s.catalog, preview = s.preview;
    if (!setting || !catalog) { return null; }
    return (
      <div className="opening company-page" data-mode="create">
        <main className="company-sheet">
          <header className="opening-head">
            <button type="button" className="back" onClick={app.opening.campaigns}>{setting.title}</button>
            <h1>{setting.pitch.heading}</h1>
          </header>
          <div className="prose"><p>{setting.pitch.text}</p></div>
          <section className="company" aria-label="Your company">
            <h2>Your company</h2>
            <p className="presets">Ready companies:{' '}
              {catalog.presets.map(p => (
                <button type="button" key={p.id} data-action="preset" data-id={p.id} title={p.note}
                  onClick={CompanyPage.preset.bind(null, app)}>{p.label}</button>))}
              {setting.generated && s.party.length > 1 && <button type="button" data-action="alone"
                title="Set out with only the first of them, and find companions on the way"
                onClick={app.opening.alone}>Go alone</button>}
            </p>
            <ol className="companions">
              {s.party.map((m, i) => <CompanionCard.View key={i} app={app} index={i} member={m}
                preview={preview?.members[i]} />)}
            </ol>
          </section>
          {preview && <section className="together" aria-label="Together">
            <p>Between them: {preview.covered.map(c => `${c.name.toLowerCase()} (${c.who.join(', ')})`).join(', ')}.</p>
            {preview.missing.length > 0 && <p className="lack">No one has {CompanyPage.list(preview.missing)}.</p>}
            {preview.formed.map(f => <p key={f.name} className="formed" title={f.perks.join(' ')}>
              Together they are a <b>{f.name}</b>.</p>)}
          </section>}
          <div className="set-out">
            <button type="button" className="primary" data-nav data-action="start" onClick={app.opening.begin}>
              Set out</button>
            <button type="button" data-nav data-action="campaigns" onClick={app.opening.campaigns}>
              Choose another campaign</button>
          </div>
        </main>
        <Toast.View app={app} />
      </div>
    );
  }
  static list(items: string[]): string {
    return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items.at(-1)!}`;
  }
  private static preset(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const preset = app.state.catalog?.presets.find(p => p.id === e.currentTarget.dataset.id);
    if (preset) { app.opening.preset(preset.members); }
  }
}
