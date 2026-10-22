import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ReaderApp } from './reader-app';

// Starts the page and exposes the same semantic state it draws to tests and automation.
class ReaderMain {
  static readonly app = createRef<ReaderApp>();
  static start() {
    const root = document.getElementById('mono');
    if (!root) { return; }
    createRoot(root).render(<ReaderApp ref={ReaderMain.app} query={new URLSearchParams(location.search)} />);
    (window as unknown as { kyrieMono: unknown }).kyrieMono = { inspect: ReaderMain.inspect,
      exportTranscript: ReaderMain.transcript };
  }
  static inspect(this: void) {
    return ReaderMain.app.current?.inspect() ?? { mode: 'title', sections: [], choices: [], trail: [], log: [],
      pending: true, error: '' };
  }
  static transcript(this: void) { return ReaderMain.app.current?.exportTranscript(); }
}
ReaderMain.start();
