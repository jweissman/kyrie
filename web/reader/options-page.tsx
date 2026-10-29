import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { ReaderOptions, type Options } from './reader-options';
import { TitlePage } from './title-page';

// Options, from the title: the size of the page's letters, whether the dice behind what happens are told ("Wenna
// makes the persuasion check (d20 16 …)") or only what came of them, and a game saved elsewhere opened from its file.
export class OptionsPage {
  static readonly settings: { key: keyof Options; label: string; values: { id: string; label: string; note: string }[] }[] = [
    { key: 'size', label: 'Letters', values: [
      { id: 'smaller', label: 'Smaller', note: '' }, { id: 'usual', label: 'Usual', note: '' },
      { id: 'larger', label: 'Larger', note: '' }] },
    { key: 'rolls', label: 'Dice', values: [
      { id: 'shown', label: 'Told', note: 'What was rolled, and against what, under what came of it.' },
      { id: 'hidden', label: 'Not told', note: 'Only what came of it.' }] }];
  static View({ app }: { app: ReaderApp }) {
    const options = app.state.options;
    return (
      <div className="opening options-page" data-mode="options">
        <main>
          <p className="label">Kyrie</p>
          <h1>Options</h1>
          {OptionsPage.settings.map(setting => (
            <section key={setting.key} className="setting" aria-label={setting.label}>
              <p className="label">{setting.label}</p>
              <ul className="acts">{setting.values.map(v => (
                <li key={v.id}><button type="button" className="act" data-nav data-action="option" data-key={setting.key}
                  data-id={v.id} aria-pressed={options[setting.key] === v.id} onClick={OptionsPage.set.bind(null, app)}>
                  {v.label}{v.note && <span className="why">{v.note}</span>}</button></li>))}</ul>
            </section>))}
          <section className="setting" aria-label="A saved game">
            <p className="label">A saved game</p>
            <ul className="acts"><li><label className="act" data-nav tabIndex={0} data-action="load-file">Open a save file
              <span className="why">A game downloaded from this browser or another.</span>
              <input type="file" id="load" accept="application/json" hidden
                onChange={TitlePage.load.bind(null, app)} /></label></li></ul>
          </section>
          <p className="set-out"><button type="button" className="act go" data-nav data-action="back"
            onClick={OptionsPage.back.bind(null, app)}>Back</button></p>
        </main>
      </div>
    );
  }
  private static set(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const { key, id } = e.currentTarget.dataset as { key: keyof Options; id: string };
    const options = { ...app.state.options, [key]: id } as Options;
    ReaderOptions.write(options);
    app.setState({ options });
  }
  private static back(app: ReaderApp) { app.setState({ phase: 'title' }); }
}
