import { EngineHost } from '../../web/engine/engine-host';
import { CheckpointStore } from '../session/checkpoint-store';
import { PlaySession, type SessionCheckpoint } from '../session/play-session';
import type { CampaignSave } from '../campaign/campaign';
import { Frontier } from '../world/frontier';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { FirstChoice } from '../creation/first-choice';
import { TerminalCreation } from './terminal-creation';
import { TerminalMode } from './terminal-mode';
import { TerminalSlots } from './terminal-slots';
import { Terminal } from './terminal';

// The terminal's title (bin/kyrie adventure with no world named, OR-160): Play, as the page's (FirstChoice.title). The
// game kept in the terminal's slot is taken up while it is still going; else, where it ended or cannot be opened (said
// in a line), a new game begins in a country drawn from a fresh seed, asked first how it begins as the page asks it.
export class TerminalPlay {
  static async main(all: string[], say: (line: string) => void = console.log): Promise<number> {
    const { input, ...played } = TerminalMode.play(all), kept = TerminalPlay.kept(say);
    if (FirstChoice.title(kept && { ended: !kept.campaign.running }).chosen === 'continue') {
      await Terminal.play(kept!, { input, ...played });
      return 0;
    }
    const host = new EngineHost(() => undefined);
    let rolled = false;
    try { ({ rolled } = await new TerminalCreation(input, say).begin(host, FirstChoice.seed())); } catch (error) {
      if (error instanceof Error && error.message === TerminalCreation.left) { input.close(); return 0; }
      throw error;
    }
    await host.handle({ kind: 'set-out', ...rolled ? { rolled } : {} });
    await Terminal.play(host.played!, { input, ...played });
    return 0;
  }
  // The game in the terminal's one slot, opened; none where there is none, and where it cannot be opened, why said.
  static kept(say: (line: string) => void, store = TerminalSlots.store()): PlaySession | undefined {
    if (!store.list().some(slot => slot.name === CheckpointStore.autosave)) { return undefined; }
    try { return TerminalPlay.opened(store.read(CheckpointStore.autosave)); } catch (error) {
      say(FirstChoice.played(error instanceof Error ? error.message : String(error)).said);
      return undefined;
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
