import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { KyrLint } from '../src/cli/kyr-lint';

// What only the engine writes is not a constant of the world. The Patient Star's "Let Saro hold on" waits on whoever
// joined as Saro (joinedAs), and lint, holding a list of the engine's writes of its own without it, said the action
// could never be taken. The probe's company of one asks Wil Hobb to join, and can then thank him.
describe('an action that waits on someone having joined', () => {
  const probe = 'test/fixtures/probes/joined/probe.campaign.json';
  it('is not called impossible by lint', async () => {
    expect((await KyrLint.campaign(probe)).filter(f => f.check === 'applicability')).toEqual([]);
  }, 60000);
  it('is offered once they have joined', async () => {
    const s = await PlaySession.start(probe, 'joined', NodeBundleSource.shared);
    const choice = (name: string) => PlayerView.choices(s.campaign).find(c => c.choice.name.startsWith(name));
    expect(choice('Thank Wil for coming')).toBeUndefined();
    await s.perform(choice('Ask Wil Hobb')!.choice.id);
    expect((await s.perform(choice('Thank Wil for coming')!.choice.id)).result).toBe('success');
  }, 60000);
});
