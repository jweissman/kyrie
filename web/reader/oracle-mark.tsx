import { useState } from 'react';
import type { ReaderApp } from './reader-app';
import { Build } from './build';
import { Timings } from './timings';
import { Oracle, type OraclePage, type OracleReport } from '../../src/presentation/oracle';

// Where the page is: the host it is served from, whether it is a dev build, and whether automation drives it.
interface Where { host: string; dev: boolean; automated: boolean }

// The oracle (OR-1151, the owner, 26 November): a small, quiet mark in the corner the frame leaves, in a dev build or
// with ?oracle in the address, never in a player's ordinary game. Pressed, it opens what a developer needs to reproduce
// what is seen, as the engine says it ({ kind: 'about' }: the build, the world, the life, where and when, the last act
// and its timings), with the page's own facts after (its size, its browser, how long it drew the last act), and one
// Copy, which takes the whole of it as plain text. It is the developer's, not the game's: no row of the engine's, and
// nothing of it is pressed in play.
export class OracleMark {
  // A dev build (the reader built unminified: an author's preview) or a page served from this machine, never under
  // automation unless asked; or ?oracle anywhere.
  static shown(query: URLSearchParams, at: Where = OracleMark.here()): boolean {
    if (query.has('oracle')) { return true; }
    return !at.automated && (at.dev || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(at.host));
  }
  private static here(): Where {
    return { host: typeof location === 'undefined' ? '' : location.hostname, dev: Build.dev,
      automated: typeof navigator !== 'undefined' && !!navigator.webdriver };
  }
  static page(): OraclePage {
    const last = Timings.list.at(-1);
    return { viewport: `${innerWidth}×${innerHeight} @${devicePixelRatio}x`, agent: navigator.userAgent,
      ...last ? { draw: last.render, total: last.total } : {} };
  }
  static View({ app }: { app: ReaderApp }) {
    const [text, setText] = useState<string>(), [copied, setCopied] = useState(false);
    if (!OracleMark.shown(app.props.query)) { return null; }
    const toggle = () => {
      if (text !== undefined) { setText(undefined); return; }
      setCopied(false);
      void app.engine.request<OracleReport>({ kind: 'about' })
        .then(report => setText(Oracle.text(report, OracleMark.page())))
        .catch((e: unknown) => setText(`The engine did not answer: ${e instanceof Error ? e.message : String(e)}`));
    };
    const copy = () => { if (text) { void OracleMark.copy(text).then(setCopied); } };
    return <aside className="oracle" data-region="oracle">
      <button type="button" className="oracle-mark" data-control="oracle" aria-expanded={text !== undefined}
        aria-label="The oracle: what is seen, for a developer" onClick={toggle} />
      {text !== undefined && <div className="oracle-panel" role="dialog" aria-label="The oracle">
        <pre data-id="oracle-report">{text}</pre>
        <button type="button" className="oracle-copy" data-control="oracle-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}</button>
      </div>}
    </aside>;
  }
  // Onto the clipboard; where the browser has none to give (file://, an older one), by a selected field copied.
  static async copy(text: string): Promise<boolean> {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* the field below */ }
    const field = document.createElement('textarea');
    field.value = text; document.body.append(field); field.select();
    const done = document.execCommand('copy');
    field.remove();
    return done;
  }
}
