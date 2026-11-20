import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { ReaderOptions, type Options } from './reader-options';
import { TitlePage } from './title-page';
import { Identity } from '../../src/presentation/identity';
import { ChoiceRow } from './stage/choice-row';

// Options, from the title: the size of the page's letters, whether the dice behind what happens are told ("Wenna
// makes the persuasion check (d20 16 …)") or only what came of them, and a game saved elsewhere opened from its file;
// at its foot, whose game it is. Drawn as the title is, in its dark, and every choice on it the one row every menu has
// (ChoiceRow; the owner, 18 November, OR-81: "a complete mess", in the boxed diamond buttons of an older page;
// test/small/no-old-button forbids them).
// Each setting one row, its emblem before it and what it is now beside it, taken to go on to the next (OR-143, the
// owner's playtest of 20 November: "Too many similar items; no icons on grouping… Why is the handbook here at all?
// It seems chaotic"): seven rows of three kinds had been five alike, a save file and the handbooks, which are an
// author's and not the game's (at handbook/index.html, as they were).
export class OptionsPage {
  static readonly settings: { key: keyof Options; label: string; glyph: string;
    values: { id: string; label: string; note: string }[] }[] = [
    { key: 'size', label: 'Letters', glyph: 'look_about', values: [
      { id: 'smaller', label: 'Smaller', note: '' }, { id: 'usual', label: 'Usual', note: '' },
      { id: 'larger', label: 'Larger', note: '' }] },
    { key: 'rolls', label: 'Dice', glyph: 'sight', values: [
      { id: 'shown', label: 'Told', note: 'what was rolled, and against what' },
      { id: 'hidden', label: 'Not told', note: 'only what came of it' }] }];
  static View({ app }: { app: ReaderApp }) {
    const options = app.state.options, named = Identity.named(app.props.query);
    return (
      <div className="opening options-page" data-mode="options">
        <main>
          <p className="label">{Identity.spoken(named.game)}</p>
          <h1>Options</h1>
          <section className="option-set" aria-label="Reading">
            <p className="label">Reading</p>
            <ul className="rows">{OptionsPage.settings.map(setting => {
              const now = OptionsPage.now(setting, options), next = OptionsPage.next(setting, now.id);
              return <li key={setting.key}><ChoiceRow.Button data={{ action: 'option', key: setting.key, id: next }}
                label={setting.label} glyph={setting.glyph} plain="neutral"
                aside={[now.label, now.note].filter(Boolean).join(': ')}
                own={{ 'data-nav': true, 'aria-label': `${setting.label}: ${now.label}` }}
                onClick={OptionsPage.set.bind(null, app)} /></li>;
            })}</ul>
          </section>
          <section className="option-set" aria-label="A saved game">
            <p className="label">A saved game</p>
            <ul className="rows"><li><ChoiceRow.Button data={{ action: 'load-file' }} label="Open a save file"
              glyph="the_book" aside="Downloaded from this browser or another" plain="neutral"
              own={{ 'data-nav': true }} onClick={OptionsPage.open} /></li></ul>
            <input type="file" id="load" accept="application/json" hidden onChange={TitlePage.load.bind(null, app)} />
          </section>
          <ul className="rows back"><li><ChoiceRow.Button data={{ action: 'back' }} label="Back" glyph="back"
            plain="neutral" own={{ 'data-nav': true }} onClick={OptionsPage.back.bind(null, app)} /></li></ul>
          <p className="colophon">{Identity.spoken(named.game)}, from {Identity.spoken(named.studio)}</p>
        </main>
      </div>
    );
  }
  // What a setting is now, and what taking its row makes it: the next of its values, round again after the last.
  static now(setting: (typeof OptionsPage.settings)[number], options: Options) {
    return setting.values.find(v => v.id === options[setting.key]) ?? setting.values[0]!;
  }
  static next(setting: (typeof OptionsPage.settings)[number], id: string): string {
    const at = setting.values.findIndex(v => v.id === id);
    return setting.values[(at + 1) % setting.values.length]!.id;
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
