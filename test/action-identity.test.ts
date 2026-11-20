import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import type { Frame } from '../src/creation/protocol';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { Digest } from '../src/session/digest';
import type { Offer } from '../src/presentation/offer';

// One action identity across clients (the owner, 15 November: audit the projection chain; the same action identities
// and the same authoritative outcomes in the browser, the terminal and a headless run). The offer is the glance's,
// built
// once, so what the page draws and what the terminal and the runner list are the same choices by the same ids,
// commands and words; and doing one, in either, comes to the same world and the same next offer.
class Identity {
  static async pair() {
    const host = new EngineHost(() => undefined);
    const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
    const frame = await host.handle({ kind: 'begin', campaign: Creation.generated, seed: 'wren', party,
      origin: 'wanderer' }) as Frame;
    const kept = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint };
    return { host, frame, terminal: PlaySession.resume(kept.checkpoint) };
  }
  static offer(offer: Offer | undefined): string[][] {
    return [...offer?.primary ?? [], ...offer?.rest ?? []].map(o => [o.choice, o.command ?? '', o.label, o.type]);
  }
  static terminal(s: PlaySession) { return Narrator.leaf(s.campaign, ScreenModel.build(s.campaign)).glance; }
}
describe('one action identity across clients', () => {
  it('offers the same acts by the same ids, commands and words, follow among them, and does them alike', async () => {
    const { host, frame: first, terminal } = await Identity.pair();
    const page = first.leaf.glance, term = Identity.terminal(terminal);
    // The page's own rows for ways held by the host aside, the offer is the same.
    expect(Identity.offer(page?.offer)).toEqual(Identity.offer(term?.offer));
    expect(term?.acts.map(a => [a.choice, a.command, a.label, a.why])).toEqual(
      page?.acts.map(a => [a.choice, a.command, a.label, a.why]));
    const follow = term?.acts.find(a => a.choice.startsWith('follow:'));
    if (follow) {
      const done = await host.handle({ kind: 'perform', command: follow.command! }) as Frame;
      await terminal.leg(follow.command!);
      const kept = (host as unknown as { session: PlaySession }).session.campaign;
      expect(Digest.of(terminal.campaign)).toBe(Digest.of(kept));
      expect(Identity.offer(done.leaf.glance?.offer)).toEqual(Identity.offer(Identity.terminal(terminal)?.offer));
      expect(Identity.terminal(terminal)?.acts.some(a => a.choice.startsWith('follow:'))).toBe(false);
    }
  }, 300000);
});

// An action absent from the observation, or gone stale, is refused by the engine, whoever sends it (the owner, 15
// November: submitting an absent or stale action must be rejected).
describe('an absent or stale action', () => {
  it('is refused by the engine, in the page host and in the session alike', async () => {
    const { host, terminal } = await Identity.pair();
    for (const command of ['follow:no-such-aim', 'no_such_act(x)', 'go(nowhere,nowhere)']) {
      await expect(host.handle({ kind: 'perform', command })).rejects.toThrow();
      await expect(terminal.leg(command)).rejects.toThrow();
    }
    // An aim followed is not offered again; asked again it is simply followed (no change), never a new one invented.
    const aim = ScreenModel.build(terminal.campaign).aims?.[0]?.follow;
    if (aim) {
      await terminal.leg(aim);
      expect(ScreenModel.build(terminal.campaign).aims?.some(a => a.follow === aim)).toBe(false);
    }
  }, 300000);
});
