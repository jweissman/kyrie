import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { ReaderOptions, type Options } from './reader-options';

// Options, from the title: the light the page is read by, the size of its letters, and whether the dice behind what
// happens are told ("Wenna makes the persuasion check (d20 16 …)") or only what came of them. Night, and the deep,
// are dark whatever light is chosen: that is the world's, not the page's.
export class OptionsPage {
  static readonly settings: { key: keyof Options; label: string; values: { id: string; label: string; note: string }[] }[] = [
    { key: 'theme', label: 'Light', values: [
      { id: 'device', label: 'As this device has it', note: 'Lamplight when the device is dark, else paper.' },
      { id: 'light', label: 'Paper', note: 'Black on white by day.' },
      { id: 'dark', label: 'Lamplight', note: 'Light on dark by day too.' }] },
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
          <p className="label">Kyr</p>
          <h1>Options</h1>
          {OptionsPage.settings.map(setting => (
            <section key={setting.key} className="option" aria-label={setting.label}>
              <p className="label">{setting.label}</p>
              <ul className="acts">{setting.values.map(v => (
                <li key={v.id}><button type="button" className="act" data-nav data-action="option" data-key={setting.key}
                  data-id={v.id} aria-pressed={options[setting.key] === v.id} onClick={OptionsPage.set.bind(null, app)}>
                  {v.label}{v.note && <span className="why">{v.note}</span>}</button></li>))}</ul>
            </section>))}
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
