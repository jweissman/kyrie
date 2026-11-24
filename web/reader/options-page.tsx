import type { MouseEvent } from 'react';
import type { ReaderApp } from './reader-app';
import { ReaderOptions, type Options } from './reader-options';
import { TitlePage } from './title-page';
import { Identity } from '../../src/presentation/identity';
import { ChoiceRow } from './stage/choice-row';
import { PageFrame } from './page-frame';
import { FirstChoice, type Paused } from '../../src/creation/first-choice';

// Options, from the title: the size of the page's letters, whether the dice behind what happens are told ("Wenna
// makes the persuasion check (d20 16 …)") or only what came of them, and a game saved elsewhere opened from its file;
// at its foot, whose game it is. Drawn as the title is, in its dark, and every choice on it the one row every menu has
// (ChoiceRow; the owner, 18 November, OR-81: "a complete mess", in the boxed diamond buttons of an older page;
// test/small/no-old-button forbids them).
// Each setting one row, its emblem before it and what it is now beside it, taken to go on to the next (OR-143, the
// owner's playtest of 20 November: "Too many similar items; no icons on grouping… Why is the handbook here at all?
// It seems chaotic"): seven rows of three kinds had been five alike, a save file and the handbooks, which are an
// author's and not the game's (at handbook/index.html, as they were).
// Opened from a game (the Book's Options, OR-300: "a pause menu that says options and then back to title screen"), the
// same settings, and at its foot the engine's ways from a paused game (FirstChoice.paused): back to the game, or
// Return to title, where the game stays kept and Continue takes it up.
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
    // On the one page's frame (OR-380): its name its header, its rows its menu, in the frame's menu column.
    return <PageFrame.View kind="options" className="opening options-page" attrs={{ 'data-mode': 'options' }}
      body="options-main"
      header={<><p className="label">{Identity.spoken(named.game)}</p><h1>Options</h1></>}
      menu={<>
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
        {app.state.frame ? <ul className="rows back">{FirstChoice.paused().cards.map(card => <li key={card.id}>
          <ChoiceRow.Button data={{ action: card.id }} label={card.name} glyph={card.id === 'back' ? 'back' : undefined}
            plain="neutral" own={{ 'data-nav': true }} onClick={OptionsPage.paused.bind(null, app, card.id)} /></li>)}</ul>
          : <ul className="rows back"><li><ChoiceRow.Button data={{ action: 'back' }} label="Back" glyph="back"
            plain="neutral" own={{ 'data-nav': true }} onClick={OptionsPage.back.bind(null, app)} /></li></ul>}
        <p className="colophon">{Identity.spoken(named.game)}, from {Identity.spoken(named.studio)}</p>
      </>} />;
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
  // From a game paused: back into it as it stood, or to the title (the game kept, and Continue there).
  static paused(app: ReaderApp, way: Paused) {
    if (way === 'title') { app.opening.title(); } else { app.setState({ phase: 'play' }); }
  }
}
