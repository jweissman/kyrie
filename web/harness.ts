import { PlaySession, type Transcript } from '../src/session/play-session';
import { Scenarios } from './scenarios';

// Replays a transcript with the browser-bundled engine and assets. Used by the parity tests, both when
// this bundle is executed by Bun and when parity.html is opened in a real browser.
export class Harness {
  static async replay(transcript: Transcript): Promise<string> {
    const session = await PlaySession.start(transcript.scenario, transcript.seed, Scenarios.source(), transcript.party);
    await session.replay(transcript.steps);
    return session.canonical();
  }
  static async page(output: HTMLElement) {
    try {
      const transcript = JSON.parse(decodeURIComponent(location.hash.slice(1))) as Transcript;
      output.textContent = await Harness.replay(transcript);
    } catch (error) { output.textContent = `ERROR ${String(error)}`; }
    output.dataset.done = 'true';
  }
}
Object.assign(globalThis, { KyrieHarness: Harness });
const output = typeof document === 'undefined' ? null : document.getElementById('parity');
if (output) { void Harness.page(output); }
