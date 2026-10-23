import type { ReaderApp } from './reader-app';
import { Stage } from './stage/stage';
import { Toast } from './toast';

// Play: the stage for what the company is doing (see Stage), the keys when asked for, and anything that went wrong.
export class PlayPage {
  static View({ app }: { app: ReaderApp }) {
    return <>
      <Stage.View app={app} />
      {app.state.help && <PlayPage.Help />}
      <Toast.View app={app} />
    </>;
  }
  static Help() {
    const keys: [string, string][] = [['↑ ↓', 'move between choices'], ['Enter', 'do it'], ['1–9', 'do one at once'],
      ['Esc', 'put away, or go back'], ['M', 'the map'], ['J', 'your notes'], ['I', 'what you carry'],
      ['C', 'the company'], ['H', 'the story so far'], ['T', 'in a fight, let a companion fight on their own']];
    return (
      <div className="help" role="dialog" aria-label="Keys">
        <dl>{keys.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}</dl>
      </div>
    );
  }
}
