import { EngineHost } from '../../web/engine/engine-host';
import { CheckpointStore } from '../session/checkpoint-store';
import { PlaySession, type SessionCheckpoint } from '../session/play-session';
import type { CampaignSave } from '../campaign/campaign';
import { Frontier } from '../world/frontier';
import { DrawnWorld } from '../client/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import type { Kept } from '../creation/first-choice';
import { OpeningPages, type EnginePage } from '../creation/opening-pages';
import { TerminalCreation } from './terminal-creation';
import { TerminalMode } from './terminal-mode';
import { TerminalSlots } from './terminal-slots';
import { Terminal } from './terminal';

// The terminal's title (bin/kyrie adventure with no world named): the engine's title page (OpeningPages.title,
// OR-382), its rows asked as numbered lines where there is more than one way in. Continue takes up the game kept in the
// terminal's slot while it is going; New Game asks how a new life begins and, where a country is kept, in which world
// (its own, by its seed, or one drawn from a fresh seed), Back there coming to the title again; Quit ends the game
// here, kept as it is. With nothing kept, a new life begins at once. A kept game that cannot be opened is said plainly,
// and not offered.
export class TerminalPlay {
  static async main(all: string[], say: (line: string) => void = console.log): Promise<number> {
    const { input, ...played } = TerminalMode.play(all), { session, kept } = TerminalPlay.kept();
    const page = OpeningPages.title(kept), creation = new TerminalCreation(input, say);
    if (page.told) { say(page.told); }
    const host = new EngineHost(() => undefined);
    let begun: { rolled: boolean } | undefined;
    while (!begun) {
      const way = await TerminalPlay.way(page, creation, say);
      if (way === 'quit') { input.close(); return 0; }
      if (way === 'continue' && session) {
        await Terminal.play(session, { input, ...played });
        return 0;
      }
      try {
        begun = await creation.begin(host, undefined, kept?.seed);
      } catch (error) {
        if (error instanceof Error && error.message === TerminalCreation.left) { input.close(); return 0; }
        throw error;
      }
      // Back, where the title was never asked (one way in): leaving, as Quit there would be.
      if (!begun && !TerminalPlay.asks(page)) { input.close(); return 0; }
    }
    await host.handle({ kind: 'set-out', ...begun.rolled ? { rolled: true } : {} });
    await Terminal.play(host.played!, { input, ...played });
    return 0;
  }
  // A way in, asked of the title's rows as the page draws them (OpeningPages.title, OR-382). Options are the page's
  // (its letters, its dice, the encyclopedia, a book in a browser): taken here, where they are said, and the title
  // asked again. A title of one way in (nothing kept: New Game, beside Quit) is that way, as the page's first row is.
  static async way(page: EnginePage, creation: TerminalCreation, say: (line: string) => void): Promise<string> {
    if (!TerminalPlay.asks(page)) { return page.chosen; }
    for (;;) {
      const id = await creation.row(page), apart = TerminalPlay.apart[id];
      if (!apart) { return id; }
      say(apart);
    }
  }
  static asks(page: EnginePage): boolean {
    return page.rows.filter(r => !TerminalPlay.apart[r.id] && r.id !== 'quit').length > 1;
  }
  static readonly apart: Record<string, string> = {
    options: 'Options (the letters\' size, whether the dice are told, the encyclopedia) are the page\'s, in a browser '
      + '(the encyclopedia at encyclopedia/index.html).' };
  // The game in the terminal's one slot, opened, and as the title knows it; none where there is none; where it cannot
  // be opened, refused, and why said on the title.
  static kept(store = TerminalSlots.store()): { session?: PlaySession; kept?: Kept } {
    if (!store.list().some(slot => slot.name === CheckpointStore.autosave)) { return {}; }
    try {
      const session = TerminalPlay.opened(store.read(CheckpointStore.autosave)), drawn = session.transcript.drawn;
      return { session, kept: { ended: !session.campaign.running, ...drawn ? { seed: session.seed } : {} } };
    } catch (error) {
      return { kept: { refused: error instanceof Error ? error.message : String(error) } };
    }
  }
  // A kept game or a save file taken up as the terminal plays it: a drawn country's frontier widening as it went.
  static opened(parsed: SessionCheckpoint | CampaignSave, path?: string): PlaySession {
    const session = 'transcript' in parsed ? PlaySession.resume(parsed) : PlaySession.fromSave(parsed, path);
    const drawn = session.transcript.drawn;
    if (drawn && Frontier.generated(session.scenario)) {
      session.extend(new Frontier(session.seed, NodeBundleSource.shared, DrawnWorld.options(drawn)));
    }
    return session;
  }
}
