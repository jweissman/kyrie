import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { Aims } from '../web/reader/aims';
import type { Screen } from '../src/ui/screen-types';
import { ModuleWriter } from '../src/lang/module-writer';

// Your own errand comes first among your aims, and an aim taken up is said when it is: the page's aim had wandered to
// whatever was heard of last (the lone tower, then the cisterns) while the brothers' errand was under way, and the
// errand's turn (the old writing copied) was told nowhere but the notes (play 7).
describe('your aims', () => {
  it('puts your own errand first, and says an aim when it is taken up', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'order', party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const before = PlayerView.observe(c);
    const ask = PlayerView.choices(c).find(x => /opened graves/.test(x.choice.name))!;
    const event = await s.leg(ask.choice.id);
    const feedback = ActionFeedbackView.read(c, event, before);
    expect(feedback.aims).toEqual([expect.stringMatching(/^Something is wrong at /)]);
    const leaf = Narrator.leaf(c, ScreenModel.build(c), { event, feedback, said: ask.choice.name, moved: false });
    expect(leaf.exchange?.notes).toContainEqual(expect.stringMatching(/^Aim: Something is wrong at /));
    // And where the tower is, now somewhere to set out for, is said, not left for the journeys to show (M17-42).
    expect(leaf.exchange?.notes)
      .toContainEqual(expect.stringMatching(/^Noted: [^:]+: somewhere to set out for now, /));
    expect(ScreenModel.build(c).objectives[0]).toMatch(/^The brothers want the old writing at /);
    // The same aim with its count gone up (another grave open) is not a new one (the cold evaluation).
    const held = c as unknown as { world: { apply(x: unknown[]): unknown; number(x: unknown): number };
      commit(x: unknown): void };
    const graves = ModuleWriter.call('tower__opened', 'tower__churchyard'), later = PlayerView.observe(c);
    held.commit(held.world.apply([{ kind: 'set', call: graves, value: ModuleWriter.number(held.world.number(graves) + 1) }]));
    const waited = await s.leg('wait');
    expect(PlayerView.observe(c).objectives?.map(o => o.text)).not.toEqual(later.objectives?.map(o => o.text));
    expect(ActionFeedbackView.read(c, waited, later).aims ?? []).toEqual([]);
  }, 120000);
  // The place your aim names is found by the ids of the places the engine says it is about (Undertakings.places), the
  // most particular first, never by its words against place names (the owner, 4 November: the notes had matched an
  // aim to a place by its name, and a name inside another word, or a place named in passing, could be taken).
  it('finds the place your aim is about by the engine\'s ids, not its words', () => {
    const aim = 'Bring the Wardens\' reading-glass up out of the moon pool, from the still water at the bottom.';
    const screen = { aims: [{ id: 'w', text: aim, places: ['x__still_water', 'x__lunastagn', 'x__region9'] }] } as unknown as Screen;
    const places = [{ id: 'x__riwustagn' }, { id: 'x__region9' }, { id: 'x__lunastagn' }];
    expect(Aims.named(screen, places, aim)?.id).toBe('x__lunastagn');
    expect(Aims.named(screen, places, 'The brothers want the old writing at the stream pool copied.')).toBeUndefined();
  });
});
