import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';
import { EngineHost } from '../web/engine/engine-host';
import { KeptGame } from '../web/engine/kept-game';
import { PlayerFrame } from '../src/presentation/player-frame';
import type { Message } from '../src/creation/protocol';
import type { PlaySession } from '../src/session/play-session';

// The world a game is played in is kept once, and again only when it changes (KeptGame; OR-1150): a save hands its
// module over as a copy without its semantic records, made afresh each time, and read by that copy's identity every
// world was packed and posted to the page again after every act, a megabyte and a half each time in a drawn country.
class Kept {
  // With one Promise, so that its module keeps a semantic record and every save hands over a fresh copy of it (the
  // page's path as a world of the corpus takes it: without the record the copy is the module itself).
  static readonly kyr = `
      Place lane "the lane" is room at 0, 0 outdoors.
      Place hall "the hall" is room at 1, 0.
      Passage door "the door" is door between lane and hall taking 2 minutes.
      Company party "You" of 1 at lane.
      Person pip "Pip" at lane { Peaceable. }
      Promise show_pip "to show Pip the hall" to pip
        kept when at(party, hall) and at(pip, hall) "Pip looks about the hall." { }
        broken when at(pip, hall) and at(party, lane) "Pip went without you." { }.`;
  static async host() {
    const t = await Tiny.start(Kept.kyr, { horizon: [] }), posted: Extract<Message, { kind: 'saved' }>[] = [];
    const host = new EngineHost(m => { if (m.kind === 'saved') { posted.push(m); } });
    (host as unknown as { session: PlaySession }).session = t.session;
    return { t, host, posted };
  }
  // An act, and the game kept after it (EngineHost.saving: once its frame has gone).
  static async act(host: EngineHost, t: Awaited<ReturnType<typeof Tiny.start>>, name: RegExp) {
    const row = PlayerFrame.of(t.campaign).rows.find(r => name.test(r.choice.name))!;
    await host.handle({ kind: 'perform', command: row.choice.id });
    for (let i = 0; i < 20; i++) { await new Promise(r => setTimeout(r, 0)); }
  }
}
describe('the world a game is played in', () => {
  it('is the same world across a save\'s fresh copy of its module, and another once a part of it is', async () => {
    const t = await Tiny.start(Kept.kyr, { horizon: [] });
    const checkpoint = t.session.checkpoint(true), world = KeptGame.keyed(checkpoint);
    const copy = (module: typeof checkpoint.save.module) => ({ ...checkpoint, save: { ...checkpoint.save, module } });
    expect(KeptGame.still(world, copy({ ...checkpoint.save.module }))).toBe(true);
    expect(KeptGame.still(world, copy({ ...checkpoint.save.module, semantic: [] }))).toBe(true);
    expect(KeptGame.still(world, copy({ ...checkpoint.save.module, entities: [...checkpoint.save.module.entities] })))
      .toBe(false);
  });
  it('is posted to the page once across acts that do not change it, and again after one that does', async () => {
    const { t, host, posted } = await Kept.host();
    expect(t.campaign.module.semantic?.length).toBeGreaterThan(0);
    await Kept.act(host, t, /hall/);
    await Kept.act(host, t, /lane/);
    expect(posted.length).toBe(2);
    expect(posted.filter(m => m.world).length).toBe(1);
    // The module grown (as a thing given in play is made one of its entities): the world is kept again, so that no
    // save is kept beside a world it no longer matches.
    const module = t.campaign.module;
    module.entities = [...module.entities, { ...module.entities[0]!, id: 't__given' }];
    await Kept.act(host, t, /hall/);
    expect(posted.length).toBe(3);
    expect(posted.at(-1)!.world).toBeDefined();
    expect(new Set(posted.map(m => m.key)).size).toBe(2);
  });
});
