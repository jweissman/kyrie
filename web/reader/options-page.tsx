import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { ReaderOptions, type Options } from './reader-options';
import { TitlePage } from './title-page';
import { Identity } from '../../src/presentation/identity';
import { ChoiceRow } from './stage/choice-row';

// Options, from the title: the size of the page's letters, whether the dice behind what happens are told ("Wenna
// makes the persuasion check (d20 16 …)") or only what came of them, and a game saved elsewhere opened from its file;
// at its foot, whose game it is. Drawn as the title is, in its dark, and every choice on it the one row every menu has
// (ChoiceRow), the one chosen marked in the entry's gold as creation marks it (the owner, 18 November, OR-81: "a
// complete mess", in the boxed diamond buttons of an older page; test/small/no-old-button forbids them).
export class OptionsPage {
  static readonly settings: { key: keyof Options; label: string; values: { id: string; label: string; note: string }[] }[] = [
    { key: 'size', label: 'Letters', values: [
      { id: 'smaller', label: 'Smaller', note: '' }, { id: 'usual', label: 'Usual', note: '' },
      { id: 'larger', label: 'Larger', note: '' }] },
    { key: 'rolls', label: 'Dice', values: [
      { id: 'shown', label: 'Told', note: 'What was rolled, and against what' },
      { id: 'hidden', label: 'Not told', note: 'Only what came of it' }] }];
  static View({ app }: { app: ReaderApp }) {
    const options = app.state.options, named = Identity.named(app.props.query);
    return (
      <div className="opening options-page" data-mode="options">
        <main>
          <p className="label">{Identity.spoken(named.game)}</p>
          <h1>Options</h1>
          {OptionsPage.settings.map(setting => (
            <section key={setting.key} className="option-set" aria-label={setting.label}>
              <p className="label">{setting.label}</p>
              <ul className="rows">{setting.values.map(v => {
                const chosen = options[setting.key] === v.id;
                return <li key={v.id}><ChoiceRow.Button data={{ action: 'option', key: setting.key, id: v.id }}
                  label={v.label} aside={v.note || undefined} plain={chosen ? 'chosen' : 'neutral'}
                  own={{ 'data-nav': true, 'aria-pressed': chosen }} onClick={OptionsPage.set.bind(null, app)} /></li>;
              })}</ul>
            </section>))}
          <section className="option-set" aria-label="A saved game">
            <p className="label">A saved game</p>
            <ul className="rows"><li><ChoiceRow.Button data={{ action: 'load-file' }} label="Open a save file"
              aside="Downloaded from this browser or another" plain="neutral" own={{ 'data-nav': true }}
              onClick={OptionsPage.open} /></li></ul>
            <input type="file" id="load" accept="application/json" hidden onChange={TitlePage.load.bind(null, app)} />
          </section>
          <section className="option-set" aria-label="For authors">
            <p className="label">For authors</p>
            <ul className="rows"><li><ChoiceRow.Link data={{ action: 'handbooks' }} href="handbook/index.html"
              label="The Kyr handbooks" aside="Every definition the game plays from" plain="neutral"
              own={{ 'data-nav': true }} /></li></ul>
          </section>
          <ul className="rows back"><li><ChoiceRow.Button data={{ action: 'back' }} label="Back" plain="neutral"
            own={{ 'data-nav': true }} onClick={OptionsPage.back.bind(null, app)} /></li></ul>
          <p className="colophon">{Identity.spoken(named.game)}, from {Identity.spoken(named.studio)}</p>
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
  // The file is chosen through the page's own hidden field, as a label had opened it.
  private static open() { document.getElementById('load')?.click(); }
  private static back(app: ReaderApp) { app.setState({ phase: 'title' }); }
}
