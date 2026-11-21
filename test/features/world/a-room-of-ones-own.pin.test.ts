import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { RunnerFind } from '../../support/runner-find';
import { PlaySession } from '../../../src/session/play-session';

// A room of one's own in the first town (the first-hour beat sheet's checkpoint 7, a home; data/generation/town/
// room.kyrt): rented of the keeper by the week for four coin, a thing left in its chest, two days out of the town,
// and back: the thing is where it was left, the keeper and the room say so, and the night is the room's own, the
// company weary six hours later than after a common bed.
const curl = (t: string) => t.replace(/[‘’]/g, "'");
describe('a room of one\'s own at the inn', () => {
  it('is rented, keeps what is left in its chest two days, greets the company back, and gives the room\'s night', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const n = (name: string, ...args: string[]) => c.world.number(ModuleWriter.call(name, ...args));
    await journey.play('>s1_taproom');
    const coin = n('quantity', 'party', 'gold');
    await RunnerFind.act(r, r.said(), /^Talk to Kynes$/);
    expect(curl((await RunnerFind.act(r, r.said(), /for a room of your own, by the week/)).scene.lines.join(' ')))
      .toContain("'Four coin the week, bed and board,'");
    expect(n('quantity', 'party', 'gold')).toBe(coin - 4);
    await journey.play('>s1_room');
    const put = [...r.said().offer.primary, ...r.said().offer.rest].flatMap(o => [o, ...o.opens ?? []])
      .find(o => /^Put .* in the chest at the foot of your bed/.test(o.label))!;
    const cargo = /put_in\(([^,]+),/.exec(put.does ?? put.id)?.[1] ?? '';
    await r.ask(JSON.stringify({ act: put.id }));
    const kept = () => c.world.test(ModuleWriter.call('inside', cargo, 'region__s1_room_chest'));
    expect([cargo.length > 0, kept()]).toEqual([true, true]);
    // Two days out of Porthalen, and back.
    await journey.play('>s2_green', '==day 3 16:00');
    const back = curl(await journey.play('>s1_taproom'));
    expect(back).toContain("'Back, then,' says Kynes. 'I kept your room.");
    const room = curl(await journey.play('>s1_room'));
    expect(room).toContain('Your room is as you left it, the chest where it stood.');
    expect(kept()).toBe(true);
    expect(curl(r.said('look').scene.lines.join(' '))).toContain('The bed has been made while you were out');
    // The room's night: rested longer than a common bed's.
    expect(curl(await journey.play('Sleep in your own room'))).toContain('rested as you have not been since the road');
    expect(n('lastSlept', 'party') - n('watch', 'clock')).toBe(36);
  }, 300000);
  // A letter home written once the room is had is sent up to its pillow, not left under the scrivener's stone.
  it('has the answer to a letter home sent up to the room\'s pillow', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), look = () => curl(r.said('look').scene.lines.join(' '));
    await journey.play('>s1_taproom');
    await RunnerFind.act(r, r.said(), /^Talk to Kynes$/);
    await RunnerFind.act(r, r.said(), /for a room of your own, by the week/);
    await journey.play('>s1_scriv');
    await RunnerFind.act(r, r.said(), /^Have the scrivener write a letter home/);
    await journey.play('==+150', '>s1_scriv');
    expect(look()).toContain('There is no letter for you under the stone: the scrivener has sent it up to your room');
    expect(look()).not.toContain('You know the hand');
    await journey.play('>s1_room');
    expect(look()).toContain('On the pillow lies a letter sent up from the scrivener\'s');
    const read = curl((await RunnerFind.act(r, r.said(), /^Read the letter from home left on your pillow/)).scene.lines.join(' '));
    expect(read).toContain('The letter is from your mother, up in the fells above Brynach. You read it by the window.');
    expect(look()).not.toContain('On the pillow lies a letter');
  }, 300000);
  // What is in the chest is kept through a save and its resumption, and is to be had out of it again.
  it('keeps what is in the chest through a save and resume', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    await journey.play('>s1_taproom');
    await RunnerFind.act(r, r.said(), /^Talk to Kynes$/);
    await RunnerFind.act(r, r.said(), /for a room of your own, by the week/);
    await journey.play('>s1_room');
    const put = [...r.said().offer.primary, ...r.said().offer.rest].flatMap(o => [o, ...o.opens ?? []])
      .find(o => /^Put .* in the chest at the foot of your bed/.test(o.label))!;
    const cargo = /put_in\(([^,]+),/.exec(put.does ?? put.id)?.[1] ?? '';
    await r.ask(JSON.stringify({ act: put.id }));
    const kept = JSON.parse(JSON.stringify(journey.session.checkpoint()));
    const again = PlaySession.resume(kept), c = again.campaign;
    expect(c.world.test(ModuleWriter.call('inside', cargo, 'region__s1_room_chest'))).toBe(true);
    const rows = (() => { const s = new Runner(again).said(); return [...s.offer.primary, ...s.offer.rest]; })()
      .flatMap(o => [o, ...o.opens ?? []]).map(o => o.label);
    expect(rows.some(l => /^Take .* out of the chest at the foot of your bed/.test(l))).toBe(true);
  }, 300000);
});
