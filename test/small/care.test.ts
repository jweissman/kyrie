import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlaySession } from '../../src/session/play-session';

// Whoever needs care is hurt, or under something that does them harm; a torch's light is no wound. Lighting a torch in
// the corn-store cellar, Odo had "bound the hurt fast and badly" of a company at full strength (round 12, A, T40; M21's
// playability list, PL-09): needsCare had held of any condition at all, and "Torchlit" is one.
const cellar = `
  Place cellar "a cellar" is room at 0, 0 indoors.
  Company party "You" of 1 at cellar.
  Event binds near party when memberOf(?m, party) and needsCare(?m) "Someone binds the hurt, fast and badly.".
  Goal false.`;
type Checkpoint = ReturnType<PlaySession['checkpoint']>;
class Kept {
  // The save, its world's facts edited as an earlier build (or a forger) might have left them.
  static forged(kept: Checkpoint, edit: (relations: Checkpoint['save']['state']['world']['relations']) => void) {
    const copy = structuredClone(kept);
    edit(copy.save.state.world.relations);
    return copy;
  }
}
describe('who needs care', () => {
  it('is not whoever has lit a torch', async () => {
    const t = await Tiny.start(cellar);
    await t.perform('light_item(t__party_1__torch)');
    expect(t.screen.party[0]!.boons?.some(b => /Torchlit/.test(b))).toBe(true);
    expect(t.world.related('needsCare')).toEqual([]);
    expect(t.leaf.changed.join(' ') + (t.leaf.exchange?.lines.map(l => l.text).join(' ') ?? '')).not.toMatch(/binds the hurt/);
  });
  // A game kept by an earlier build, which held that the torch-bearer needed care, resumes and is brought up to date;
  // any other difference between its facts and its creatures is still refused.
  it('brings up to date a save that held a lit torch as needing care, and refuses any other difference', async () => {
    const t = await Tiny.start(cellar);
    await t.perform('light_item(t__party_1__torch)');
    const kept = t.session.checkpoint(), member = t.world.related('memberOf')[0]!.args[0]!;
    const resumed = PlaySession.resume(Kept.forged(kept, r => r.push({ kind: 'call', name: 'needsCare', args: [member] })));
    expect(resumed.campaign.world.related('needsCare')).toEqual([]);
    const asleep = Kept.forged(kept, r => r.splice(r.findIndex(x => x.name === 'awake' && x.args[0] === member), 1));
    expect(() => PlaySession.resume(asleep)).toThrow(/Inconsistent/);
  });
});
