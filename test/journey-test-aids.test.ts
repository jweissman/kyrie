import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayTool } from '../src/cli/play-tool';

// What a journey gives a test that the adventures' authors asked for: a topic named by who is asked (Fair Weather's
// friction 15, FWR-15), the page of the last steps only (Quittance's ll 11, QTC-A22), a check made to come out as the
// test needs (Quittance's friction 7, QTC-07), and a wait by the days of a module installed as the company went (the
// Grand Tour's friction 20, GTR-20).
describe('a journey, for a test', () => {
  const speakers = 'test/fixtures/probes/speakers/probe.campaign.json';
  it('takes a topic by who is asked, and keeps the page of the last steps apart', async () => {
    const j = await Journey.start(speakers, 'j', { strict: true });
    await expect(j.play('about the night of the wreck')).rejects.toThrow(/name the one meant by its heading/);
    await j.play('=+4');
    expect(j.page).toContain('The harbour bell rings once.');
    expect(await j.play('Kerensa: the night of the wreck')).toContain('I saw the lantern go out');
    expect(j.latest).toContain('I saw the lantern go out');
    expect(j.latest).not.toContain('harbour bell');
    expect(j.page).toContain('harbour bell');
  }, 60000);
  it('makes a check come out as the test asks, until the die is let fall again', async () => {
    const roll = 'test/fixtures/probes/spoken-roll/probe.campaign.json';
    for (const outcome of ['pass', 'fail'] as const) {
      const j = await Journey.start(roll, 'r');
      j.roll(outcome);
      await j.play('Talk to Will', 'Ask Will to light the hearth');
      expect(j.holds('consented', 'will')).toBe(outcome === 'pass');
      expect(j.latest).toContain(outcome === 'pass' ? 'makes the persuasion check (d20 20'
        : 'fails the persuasion check (d20 1');
      j.roll();
      expect(j.campaign.forced).toBeUndefined();
    }
    const lines: string[] = [];
    await PlayTool.main([roll, '--seed', 'r', '--roll', 'fail', 'Talk to Will', 'Ask Will to light'], l => lines.push(l));
    expect(lines.some(l => l.includes('fails the persuasion check (d20 1'))).toBe(true);
  }, 60000);
  it('waits by the days of a module installed late, counted from the first morning after', async () => {
    const files: Record<string, string> = {
      'late/a/site.kyr': `Module a "A" { Place field "Field" is wilderness. Place room "Room" is room within field
        at 0, 0. Company party "You" of 1 at room. Goal false. }`,
      'late/a/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
      'late/b/site.kyr': `Module b "B" { Place yard "Yard" is site. Relation struck().
        Rule strike when watch(clock) >= 6 { Assert struck(). } Goal false. }`,
      'late/b/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }),
      'late/a.campaign.json': JSON.stringify({ version: 1, name: 'a', modules: [{ id: 'a', bundle: 'a/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
    };
    const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
    const j = Journey.of(await PlaySession.start(overlay.resolve('late/a.campaign.json'), 'seed', overlay));
    await j.play('=+30');
    await j.campaign.install({ id: 'b', bundle: overlay.resolve('late/b/module.json') }, overlay);
    await expect(j.play('=c day 1 09:00')).rejects.toThrow(/nothing installed is called c/);
    // Installed on the first day, its day 1 is the world's second: nine that morning is its watch 6, when it strikes.
    await j.play('=b day 1 08:50');
    expect([j.watch(), j.campaign.world.test(ModuleWriter.call('b__struck'))]).toEqual([149, false]);
    await j.play('=b day 1 09:00');
    expect([j.watch(), j.campaign.world.test(ModuleWriter.call('b__struck'))]).toEqual([150, true]);
  }, 60000);
});
