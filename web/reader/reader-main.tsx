import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ReaderApp } from './reader-app';
import { Identity } from '../../src/presentation/identity';

// Starts the page and exposes the same semantic state it draws to tests and automation.
class ReaderMain {
  static readonly app = createRef<ReaderApp>();
  static start() {
    const root = document.getElementById('mono');
    if (!root) { return; }
    // The tab's name is the game's (the build writes it into the page too), or the one the address asks for.
    const query = new URLSearchParams(location.search);
    document.title = Identity.spoken(Identity.named(query).game);
    createRoot(root).render(<ReaderApp ref={ReaderMain.app} query={query} />);
    // What automation may do besides look (scripts/journey-browser.ts): set out with a given company, do a command by
    // its id, let a fight go on, and go back from a fight that has ended.
    const app = () => ReaderMain.app.current;
    (window as unknown as { kyrieMono: unknown }).kyrieMono = { inspect: ReaderMain.inspect,
      exportTranscript: ReaderMain.transcript,
      begin: (r: Parameters<ReaderApp['opening']['setOutWith']>[0]) => app()?.opening.setOutWith(r),
      act: (command: string, said: string) => app()?.act(command, said), auto: () => app()?.auto(),
      back: () => app()?.back() };
  }
  static inspect(this: void) {
    return ReaderMain.app.current?.inspect() ?? { mode: 'title', sections: [], choices: [], trail: [], log: [],
      pending: true, error: '' };
  }
  static transcript(this: void) { return ReaderMain.app.current?.exportTranscript(); }
}
ReaderMain.start();
