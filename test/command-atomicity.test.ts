import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import type { Campaign } from '../src/campaign/campaign';

// A command is one with what comes of it after it (the country beyond drawn and installed) and its step in the
// transcript: if what comes after fails, nothing of the command is kept, and doing it again is as if the failure had
// never been. Found by Mission 15's independent audit (F3): a command that failed so had advanced time, kept its
// event and changed the game, without its step in the transcript, so that a replay told another game.
const source = NodeBundleSource.shared, ordinary = 'test/fixtures/probes/ordinary/ordinary.campaign.json';
// A module of its own to install as if it were the country beyond: a nook, and nothing else.
const nook = new OverlayBundleSource(source, {
  'atomic/nook/module.json': JSON.stringify({ version: 1, source: 'nook.kyr', rules: ['world'] }),
  'atomic/nook/nook.kyr': 'Module nook "A nook" {\n  Place nook "a nook" is room.\n  Goal false.\n}',
});
class Failing {
  // An expansion that installs the nook first, if asked, and then fails.
  static after(installs: boolean) {
    return { async expand(campaign: Campaign) {
      if (installs) { await campaign.install({ id: 'nook', bundle: nook.resolve('atomic/nook/module.json') }, nook); }
      throw new Error('the country beyond could not be read');
    } };
  }
}
describe('a command and what comes of it', () => {
  for (const installs of [false, true]) {
    it(`are undone together when what comes after fails${installs ? ', after installing' : ''}`, async () => {
      const s = await PlaySession.start(ordinary, 'atomic', source), before = s.canonical();
      s.extend(Failing.after(installs));
      await expect(s.perform('wait')).rejects.toThrow(/could not be read/);
      expect(s.canonical()).toBe(before);
      expect(s.transcript.steps).toEqual([]);
      expect(s.campaign.history.length).toBe(0);
      expect(s.campaign.installed).not.toContain('nook');
      // Done again with what comes after it as it should be, it is the game the failure never happened in.
      s.extend({ expand: () => Promise.resolve(undefined) });
      await s.perform('wait');
      const plain = await PlaySession.start(ordinary, 'atomic', source);
      await plain.perform('wait');
      expect(s.canonical()).toBe(plain.canonical());
    }, 60000);
  }
});
