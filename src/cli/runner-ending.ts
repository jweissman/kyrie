import type { PlaySession } from '../session/play-session';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { DrawnWorld } from '../client/drawn-world';
import { Obituary } from '../narrative/obituary';
import type { Offered, Said } from './runner';

// What can be done once the story has ended, as the page's last page offers it (BookStage.Ending): begin again in the
// same country from its first day, remembering who died there, where the country was drawn and someone did (the
// page's own condition). Cold play 6 (CL-53): the ending said "Begun again, the country is as it was…", the offer was
// empty, and the runner had stopped reading, so a look after it was never answered.
export class RunnerEnding {
  static readonly again: Offered = { id: 'again', label: 'Begin again in this country, from its first day',
    aspects: [], type: 'other', marks: [] };
  static offer(session: PlaySession): Said['offer'] {
    return { primary: this.can(session) ? [this.again] : [], rest: [] };
  }
  static can(session: PlaySession): boolean {
    return !!session.transcript.drawn && !!Obituary.ending(session.campaign).memorial;
  }
  // The same country drawn again for the same company, from its first day, with who died in it remembered.
  static async begin(session: PlaySession): Promise<PlaySession> {
    const t = session.transcript, memorial = Obituary.ending(session.campaign).memorial;
    return DrawnWorld.start(t.seed, { ...t.drawn!, ...memorial ? { memorial } : {} }, NodeBundleSource.shared);
  }
}
