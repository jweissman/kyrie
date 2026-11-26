import type { ReaderApp } from './reader-app';
import { ReaderOptions, type Options } from './reader-options';
import { TitlePage } from './title-page';
import { Identity } from '../../src/presentation/identity';
import { ChoiceRow } from './stage/choice-row';
import { PageFrame } from './page-frame';
import { Build } from './build';
import type { Paused } from '../../src/creation/first-choice';
import { OpeningPages, type PageRow } from '../../src/creation/opening-pages';
import { Surfaces } from '../../src/presentation/surfaces';

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
// Return to title, where the game stays kept and Continue takes it up. All of them the engine's (OpeningPages.options).
// A page of the backstage (OR-1073): the frame lays it on the folio as the engine's theme hint says, the Book's own
// parchment on the dark table, the game's name a quiet line on the table over it; the encyclopedia is its row (the
// title's until OR-1072), and the build it is said in its colophon (the title's corner until then).
export class OptionsPage {
  // Options is the engine's page (OpeningPages.options, OR-382): its rows in their groups, the ways from a game paused
  // after them; the page draws them and keeps nothing of its own but the hidden field a save file is read through.
  static View({ app }: { app: ReaderApp }) {
    const options = app.state.options, named = Identity.named(app.props.query);
    const frame = app.state.frame, read = !!frame && Surfaces.has(frame.screen, 'the_encyclopedia');
    const page = OpeningPages.options(options, !!frame, read), groups = [...new Set(page.rows.flatMap(r => r.group ?? []))];
    const ways = page.rows.filter(r => !r.group);
    return <PageFrame.View kind="options" className="opening options-page" attrs={{ 'data-mode': 'options' }}
      {...page.hints.theme ? { theme: page.hints.theme } : {}}
      header={<p className="label folio-head">{Identity.spoken(named.game)}</p>}
      narrative={<h1>{page.ask}</h1>}
      menu={<>
        {groups.map(group => <section key={group} className="option-set" aria-label={group}>
          <ul className="rows">{page.rows.filter(r => r.group === group).map(row => <li key={row.id}>
            {OptionsPage.row(app, row)}</li>)}</ul>
        </section>)}
        <input type="file" id="load" accept="application/json" hidden onChange={TitlePage.load.bind(null, app)} />
        <ul className="rows back">{ways.map(row => <li key={row.id}>{OptionsPage.row(app, row)}</li>)}</ul>
        <p className="colophon">{`${Identity.spoken(named.game)}, from ${Identity.spoken(named.studio)}`}
          <span className="build" data-id="build">{` · build ${Build.commit}`}</span></p>
      </>} />;
  }
  // A row as the engine gives it: a setting's (option:<key>:<value>, what it is now beside it), the save file's, the
  // encyclopedia's, which opens apart (a link, said so to a reader), or a way back.
  private static row(app: ReaderApp, row: PageRow) {
    const set = row.setting;
    if (row.href) {
      return <ChoiceRow.Link data={{ action: row.id }} href={row.href} label={<span aria-hidden="true">{row.label}</span>}
        plain="knowing" own={{ target: '_blank', rel: 'noopener', 'data-nav': true, ...row.said ? { 'aria-label': row.said } : {} }} />;
    }
    const go = set ? OptionsPage.set.bind(null, app, row) : row.id === 'load-file' ? OptionsPage.open
      : row.id === 'back' && !app.state.frame ? OptionsPage.back.bind(null, app)
        : OptionsPage.paused.bind(null, app, row.id as Paused);
    return <ChoiceRow.Button data={{ action: set ? 'option' : row.id, ...set ? { key: set.key, id: set.value } : {} }}
      label={row.label} plain="neutral" {...row.glyph ? { glyph: row.glyph } : {}} {...row.aside ? { aside: row.aside } : {}}
      own={{ 'data-nav': true, ...row.said ? { 'aria-label': row.said } : {} }} onClick={go} />;
  }
  private static set(app: ReaderApp, row: PageRow) {
    const options = OpeningPages.set(app.state.options, row) as Options | undefined;
    if (!options) { return; }
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
