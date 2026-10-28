import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { Aims } from '../web/reader/aims';

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
    const event = await s.perform(ask.choice.id);
    const feedback = ActionFeedbackView.read(c, event, before);
    expect(feedback.aims).toEqual([expect.stringMatching(/^Something is wrong at /)]);
    const leaf = Narrator.leaf(c, ScreenModel.build(c), { event, feedback, said: ask.choice.name, moved: false });
    expect(leaf.exchange?.notes).toContainEqual(expect.stringMatching(/^Aim: Something is wrong at /));
    expect(ScreenModel.build(c).objectives[0]).toMatch(/^The brothers want the old writing at /);
  }, 120000);
  // The place your aim names is offered to set out for, however far: the cisterns of Lunastagn, the aim, were only "on
  // the map", while three nearer places stood under Set out for (play 7).
  it('offers the place your aim names to set out for, beside the nearest', () => {
    const places = ['Riwustagn', 'Argentumfons', 'a lone tower', 'Lunastagn', 'Murkheald', 'Glōmburg'].map(name => ({ name }));
    const aim = 'Bring the Wardens\' reading-glass up out of Lunastagn, from the still water at the bottom.';
    expect(Aims.named(places, aim, 3)?.name).toBe('Lunastagn');
    // One of the nearest is offered already; a name inside another word is not a name.
    expect(Aims.named(places, 'The brothers want the old writing at Riwustagn copied.', 3)).toBeUndefined();
    expect(Aims.named([...places, { name: 'Glōm' }], 'The road to Glōmburg', 6)).toBeUndefined();
  });
});
