import type { ReaderApp } from './reader-app';
import { Toast } from './toast';

// What is said over play rather than in it: that the game can no longer be kept in this browser, the keys when they
// are asked for, and anything that went wrong. With the map open they are said over the map, which covers the rest.
export class Notices {
  private static readonly keys: [string, string][] = [['↑ ↓', 'move between choices'], ['Enter', 'do it'],
    ['1–9', 'do one at once'], ['Esc', 'put away, or go back'], ['L', 'look about: everything here'],
    ['W', 'every way from here'], ['M', 'the map'], ['J', 'your notes'],
    ['I', 'what you carry'], ['C', 'the company'], ['H', 'the story so far'],
    ['T', 'in a fight, let a companion fight on their own']];
  // On the map the keys are the map's own: from place to place on it, and a place chosen and set out for, or let go.
  private static readonly mapKeys: [string, string][] = [['Tab', 'from place to place'],
    ['Enter', 'choose it, or set out'], ['Esc', 'let go of what is chosen, or close the map'], ['M', 'close the map'],
    ['J', 'your notes'], ['I', 'what you carry'], ['C', 'the company'], ['H', 'the story so far']];
  static View({ app, map }: { app: ReaderApp; map?: boolean }) {
    return <>
      {app.state.unkept && <Notices.Unkept app={app} />}
      {app.state.help && <Notices.Help map={map} />}
      <Toast.View app={app} />
    </>;
  }
  // The game could not be kept in this browser: said plainly, with the save to take instead.
  static Unkept({ app }: { app: ReaderApp }) {
    return (
      <div className="toast unkept" role="alert" data-id="unkept">
        <p>This game can no longer be kept in this browser: its storage is full. Download a save to keep it, and open
          it again from the title page.</p>
        <button type="button" className="act" onClick={app.download}>Download a save</button>
      </div>
    );
  }
  static Help({ map }: { map?: boolean }) {
    return (
      <div className="help" role="dialog" aria-label="Keys">
        <dl>{(map ? Notices.mapKeys : Notices.keys).map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt>
          <dd>{v}</dd></div>)}</dl>
      </div>
    );
  }
}
