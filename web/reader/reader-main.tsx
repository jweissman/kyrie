// The setting gives the page its parts (the sky's signs on the character sheet: SettingPort, MT-16 S6).
import '../../src/canon/setting-install';
import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ReaderApp } from './reader-app';
import { Identity } from '../../src/presentation/identity';
import { Look } from './look';
import { BoardField } from './board-field';
import { Tone } from './instrument/tone';

// Starts the page and exposes the same semantic state it draws to tests and automation.
class ReaderMain {
  static readonly app = createRef<ReaderApp>();
  static readonly faces = ['jost', 'lato', 'play'];
  static start() {
    const root = document.getElementById('mono');
    if (!root) { return; }
    // The tab's name is the game's (the build writes it into the page too), or the one the address asks for.
    const query = new URLSearchParams(location.search);
    document.title = Identity.spoken(Identity.named(query).game);
    // A design experiment, by the address: another face for the controls.
    const face = query.get('face');
    if (face && ReaderMain.faces.includes(face)) { document.documentElement.classList.add(`face-${face}`); }
    // Mission 21's compositions (see Look), never the default.
    Look.set(query.get('look'));
    // The commitment's sound, an address away while M22 tries it (?sound=1; see Tone).
    Tone.set(query);
    createRoot(root).render(<ReaderApp ref={ReaderMain.app} query={query} />);
    // What automation may do besides look (scripts/journey-browser.ts): set out with a given company, open a save,
    // do a command by its id, let a fight go on, and go back from a fight that has ended.
    const app = () => ReaderMain.app.current;
    (window as unknown as { kyrieMono: unknown }).kyrieMono = { inspect: ReaderMain.inspect,
      exportTranscript: ReaderMain.transcript,
      // Every surface earned (the lenses, the map, the encyclopedia, the journal): a spec's earned stage (OR-1245).
      earn: () => app()?.earn(),
      begin: (r: Parameters<ReaderApp['opening']['setOutWith']>[0]) => app()?.opening.setOutWith(r),
      act: (command: string, said: string) => app()?.act(command, said), auto: () => app()?.auto(),
      back: () => app()?.back(),
      // A save file opened as the title page opens one (the journey reader's scene view: scripts/journey-scene.ts).
      resume: (text: string) => app()?.opening.resume(text),
      // Once the engine has nothing under way: the country drawn behind the title, and its start made ready (OR-121).
      idle: async () => { await app()?.booted; return app()?.engine.request({ kind: 'idle' }); },
      // One receipt for each command done (MT-24): what a gesture did, counted (test/input-answered-browser).
      receipts: () => app()?.engine.request({ kind: 'receipts' }),
      // What the map's board draws, read back from it, beside what it is wanted to draw of the land it is given
      // (OR-91's rest: an update draws what a board made again would).
      board: () => BoardField.readback(),
      // Where your mark is on the board now, and the hexes it shows known (a walk followed hex by hex: OR-162).
      boardNow: () => BoardField.now(),
      // A composition drawn over the same state, for captures (see Look).
      relook: (name: string) => { Look.set(name); app()?.forceUpdate(); } };
  }
  static inspect(this: void) {
    return ReaderMain.app.current?.inspect() ?? { mode: 'title', sections: [], choices: [], trail: [], log: [],
      pending: true, error: '' };
  }
  static transcript(this: void) { return ReaderMain.app.current?.exportTranscript(); }
}
ReaderMain.start();
