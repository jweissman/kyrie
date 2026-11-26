import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';

// Campaign isolation is an architectural invariant (the architectural review of 20 November, Finding A and Stage 0;
// MT-29, AR-02; the owner: the two-campaign boundary test is the isolation invariant's proof), held at the engine's
// public lifecycle, the owner's chosen boundary: install a campaign, create or resume a session, obtain the player's
// frame, submit an action, commit, inspect and persist. Two campaigns with different rules (the one's world, the
// other's world and elements) and different catalogs (one local kind, the same id, two meanings) are played
// interleaved in one process, each step of one between the steps of the other, and each sees only its own: the coin's
// name and worth as its own module declares them, its own rules' acts, and a save that resumes as itself.
const source = NodeBundleSource.shared;
function world(dir: string, name: string, worth: number, rules: string[]): Record<string, string> {
  return {
    [`boundary/${dir}/site.kyr`]: `Module ${dir} "${dir}" { Place field "Field" is wilderness.
      Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.
      Kind boundary_coin "${name}" is treasure worth ${worth}. Item coin "a coin" is boundary_coin at room. }`,
    [`boundary/${dir}/module.json`]: JSON.stringify({ version: 1, source: 'site.kyr', rules, globals: ['party'],
      exports: { party: 'party' } }),
    [`boundary/${dir}.campaign.json`]: JSON.stringify({ version: 1, name: dir, modules: [
      { id: dir, bundle: `${dir}/module.json` }], party: [{ name: 'A', raceId: 'human', classId: 'warrior' }] }),
  };
}
const overlay = new OverlayBundleSource(source, { ...world('gilt', 'a gilt coin', 7, ['world']),
  ...world('lead', 'a lead coin', 1, ['world', 'elements']) });
async function begin(dir: string): Promise<PlaySession> {
  return PlaySession.start(overlay.resolve(`boundary/${dir}.campaign.json`), dir, overlay);
}
// What a session's player is told of the coin it carries: its kind, as the frame describes it from the catalog (both
// coins are "a coin"; only the kind, the same local id in both, says which campaign's meaning was read).
function coin(s: PlaySession): string[] {
  return ScreenModel.build(s.campaign).items.filter(i => i.kind === 'boundary_coin').map(i => i.description);
}
function take(s: PlaySession): string {
  return PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('take_item('))!.choice.id;
}
describe('two campaigns in one process', () => {
  it('each sees only its own catalog and rules, played interleaved, saved and resumed', async () => {
    const gilt = await begin('gilt'), lead = await begin('lead');
    // Submitting an action in each, interleaved, and obtaining each one's frame after the other's.
    const [a, b] = [take(gilt), take(lead)];
    expect((await gilt.perform(a)).result).toBe('success');
    expect((await lead.perform(b)).result).toBe('success');
    expect(coin(gilt)).toEqual(['a gilt coin']);
    expect(coin(lead)).toEqual(['a lead coin']);
    // Both commands under way at once, each awaited boundary of one the other's chance to run.
    const wait = (s: PlaySession) => PlayerView.choices(s.campaign)
      .find(c => /^wait|^rest/.test(c.choice.id))?.choice.id;
    const [w1, w2] = [wait(gilt), wait(lead)];
    expect([w1, w2].every(Boolean)).toBe(true);
    await Promise.all([gilt.perform(w1!), lead.perform(w2!)]);
    expect([coin(gilt), coin(lead)]).toEqual([['a gilt coin'], ['a lead coin']]);
    // Persisting one, resuming it after the other has acted, and inspecting it: still itself.
    const kept = gilt.checkpoint();
    await lead.perform(w2!);
    const again = PlaySession.resume(kept);
    expect(coin(again)).toEqual(['a gilt coin']);
    expect(again.canonical()).toBe(gilt.canonical());
  }, 120000);
  // The feared case (Finding A; MT-24, command atomicity across two coordinators): one command yields mid-command,
  // after the campaign has carried it out and before the session has finished it (what came of it drawn: the
  // Expander, the country beyond; then what is told, the aims after it, its step), while the other campaign acts.
  // Neither a save of it nor its session's checkpoint may hold half a command: the world changed, the step not kept.
  it('keeps no half of a command that yields while the other acts', async () => {
    const gilt = await begin('gilt'), lead = await begin('lead');
    let open!: () => void;
    const gate = new Promise<void>(resolve => { open = resolve; });
    gilt.extend({ expand: () => gate });
    const taking = take(gilt), steps = gilt.transcript.steps.length, pending = gilt.perform(taking);
    await Promise.resolve();
    // The other acts, and is itself, while the first waits.
    expect((await lead.perform(take(lead))).result).toBe('success');
    expect(coin(lead)).toEqual(['a lead coin']);
    // Persisted mid-command: refused, by the session and by its campaign alike.
    expect(() => gilt.checkpoint()).toThrow('Save only between campaign commands');
    expect(() => gilt.campaign.save()).toThrow('Save only between campaign commands');
    // And no frame is made of it (MT-24's first step: a frame built at the expander's await had shown half a command).
    expect(() => ScreenModel.build(gilt.campaign)).toThrow('Frame only between commands');
    open();
    await pending;
    expect([gilt.transcript.steps.length - steps, coin(gilt)]).toEqual([1, ['a gilt coin']]);
    // One receipt, at the revision its step moved the game to.
    expect(gilt.receipts.at(-1)).toEqual({ id: taking, revision: steps + 1, outcome: 'success' });
    const again = PlaySession.resume(gilt.checkpoint());
    expect([again.canonical() === gilt.canonical(), coin(again)]).toEqual([true, ['a gilt coin']]);
  }, 120000);
});
