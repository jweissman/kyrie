import type { PlaySession } from '../session/play-session';
import { Obituary } from '../narrative/obituary';
import { RunnerEnding } from './runner-ending';
import { TerminalColour } from './terminal-colour';
import type { Asking } from './terminal-input';

// How the story ended, as the page's last page tells it (AB-04), and what can be done then: begin again in the same
// country from its first day, as the page and the runner offer it (RunnerEnding). After a death the terminal had
// printed the ending, "Begun again, the country is as it was…", and left (cold play 6, CL-53).
export class TerminalEnding {
  // The ending told; the session begun again where it is chosen, else nothing (the player leaves).
  static async told(session: PlaySession, input: Asking): Promise<PlaySession | undefined> {
    const ending = Obituary.ending(session.campaign);
    console.log(['', TerminalColour.bold(ending.title, TerminalColour.depth()), ...ending.lines, '', 'The story has ended.']
      .join('\n'));
    if (!RunnerEnding.can(session)) { return undefined; }
    const label = RunnerEnding.again.label;
    console.log(['', `1. ${label}`, '(q to leave)'].join('\n'));
    for (;;) {
      const answer = (await input.ask('> '))?.trim().toLowerCase();
      if (answer === undefined || answer === 'q' || answer === 'quit') { return undefined; }
      if (['1', RunnerEnding.again.id, label.toLowerCase()].includes(answer)) { return RunnerEnding.begin(session); }
      if (answer) { console.log(`Choose 1 to ${label.charAt(0).toLowerCase()}${label.slice(1)}, or q to leave.`); }
    }
  }
}
