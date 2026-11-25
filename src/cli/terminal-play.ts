import { EngineHost } from '../../web/engine/engine-host';
import { CheckpointStore } from '../session/checkpoint-store';
import { PlaySession, type SessionCheckpoint } from '../session/play-session';
import type { CampaignSave } from '../campaign/campaign';
import { Frontier } from '../world/frontier';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { FirstChoice, type Kept } from '../creation/first-choice';
import { OpeningPages, type EnginePage } from '../creation/opening-pages';
import { TerminalCreation } from './terminal-creation';
import { TerminalMode } from './terminal-mode';
import { TerminalSlots } from './terminal-slots';
import { Terminal } from './terminal';
import { FreshSeeds } from '../world/fresh-seeds';

// The terminal's title (bin/kyrie adventure with no world named): the engine's title page (OpeningPages.title,
// OR-382), its rows asked as numbered lines where there is more than one way in. Continue takes up the game kept in the
// terminal's slot while it is going; New character begins a new life in its country (by its seed), New world in a
// country drawn from a fresh seed; with nothing kept, a new life begins at once. A kept game that cannot be opened is
// said plainly, and not offered.
export class TerminalPlay {
  static async main(all: string[], say: (line: string) => void = console.log): Promise<number> {
    const { input, ...played } = TerminalMode.play(all), { session, kept } = TerminalPlay.kept();
    const page = OpeningPages.title(kept), creation = new TerminalCreation(input, say);
    if (page.told) { say(page.told); }
    const way = await TerminalPlay.way(page, creation, say);
    if (way === 'continue' && session) {
      await Terminal.play(session, { input, ...played });
      return 0;
    }
    const host = new EngineHost(() => undefined);
    let rolled = false;
    try {
      ({ rolled } = await creation.begin(host, FirstChoice.seedFor(way === 'world' ? 'world' : 'begin', kept) ?? FreshSeeds.seed(FirstChoice.seed)));
    } catch (error) {
      if (error instanceof Error && error.message === TerminalCreation.left) { input.close(); return 0; }
      throw error;
    }
    await host.handle({ kind: 'set-out', ...rolled ? { rolled } : {} });
    await Terminal.play(host.played!, { input, ...played });
    return 0;
  }
  // A way in, asked of the title's rows as the page draws them (OpeningPages.title, OR-382). Options and the
  // encyclopedia are the page's to open (its letters, its dice, a book in a browser): taken here, where they are, said,
  // and the title asked again. A title of one way in (nothing kept) is that way, as the page's first row is.
  static async way(page: EnginePage, creation: TerminalCreation, say: (line: string) => void): Promise<string> {
    const ways = page.rows.filter(r => !TerminalPlay.apart[r.id]);
    if (ways.length < 2) { return page.chosen; }
    for (;;) {
      const id = await creation.row(page), apart = TerminalPlay.apart[id];
      if (!apart) { return id; }
      say(apart);
    }
  }
  static readonly apart: Record<string, string> = {
    options: 'Options (the letters\' size, whether the dice are told) are the page\'s, set in a browser.',
    encyclopedia: 'The encyclopedia is a book read in a browser, beside the game (encyclopedia/index.html).' };
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
