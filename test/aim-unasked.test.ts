import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { AimWords } from '../src/presentation/aim-words';

// An aim is taken up by the player's choice, or is the company's own errand (OR-248, the first blind cold play's P102:
// asking Gek what the old workings are worth gave two aims unasked, "A new aim" each). An answer that makes aims hold
// offers them, as aims to take up, and takes none; and the words of the way down under a town are a sentence that does
// not say a place is under itself ("The way down to the old workings under Gatesend is under Gatesend: …").
const start = async (seed: string) => Journey.of(await DrawnWorld.start(seed, { origin: 'weir',
  party: [{ name: 'Wren', raceId: 'human', classId: 'bard' }] }, NodeBundleSource.shared));
describe('an aim given unasked', () => {
  it('is offered by an answer, to take up, and not taken', async () => {
    const j = await start('iscoed');
    await j.play('Ask Gek what the matter is');
    const c = j.find('Ask Gek what the old workings are worth')!;
    const before = PlayerView.observe(j.campaign), event = await j.session.leg(c.command);
    const feedback = ActionFeedbackView.read(j.campaign, event, before);
    expect([feedback.aims, feedback.taken]).toEqual([undefined, undefined]);
    expect(feedback.offered?.length).toBe(2);
    const leaf = Narrator.leaf(j.campaign, j.screen(), { event, feedback, said: c.label, moved: false });
    const notes = (leaf.exchange?.noted ?? []).filter(n => n.kind === 'aim' || n.kind === 'offered').map(n => n.kind);
    expect(notes).toEqual(['offered', 'offered']);
    expect(j.screen().aims?.some(a => a.followed)).toBe(false);
  }, 120000);
  it('says no place is under itself, nor names a town twice in one aim', async () => {
    for (const seed of ['iscoed', 'kahitude']) {
      const j = await start(seed), w = j.campaign.world;
      for (const o of j.campaign.module.objectives ?? []) {
        const text = AimWords.render(w, o), towns = [...text.matchAll(/under ([A-Z][\w']+)/g)].map(m => m[1]);
        expect([o.id, towns.length]).toEqual([o.id, new Set(towns).size]);
      }
    }
  }, 120000);
});
