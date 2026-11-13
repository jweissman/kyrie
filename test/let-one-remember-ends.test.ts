import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';

// Let One Remember, second pass (doc/history/activation/corpus/second-pass.md): the endings, and the
// opposition that
// acts. Played by the labels a player sees. The Act V endings are played from the Act V fixture (its first step, "Begin
// Act V", is that fixture's: the company is placed on the ledge by the fixture and carries the needle and the
// stone); the
// Mountain Goes Up is played from the campaign's own start.
class T {
  static start(campaign = 'data/campaigns/let-one-remember.campaign.json') {
    return PlaySession.start(campaign, 'corrow', NodeBundleSource.shared);
  }
  static async act5() {
    const s = await this.start('test/fixtures/corrow/act5/act5.campaign.json');
    await this.play(s, ['Begin Act V']);
    return s;
  }
  static play(s: PlaySession, steps: string[]): Promise<string> { return Journey.of(s).play(...steps); }
  static is(s: PlaySession, relation: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(`corrow__${relation}`, ...args.map(a => a === 'party' ? a : `corrow__${a}`)));
  }
  static hightown(s: PlaySession, measure: string) {
    return s.campaign.world.number(ModuleWriter.call(`corrow__${measure}`, 'corrow__hightown'));
  }
}

const toTail = ['^(Down |Up )?To the street of chimneys', '^(Down |Up )?To the Hawse', '^(Down |Up )?To the north edge', '^(Down |Up )?To the gate of the Askew',
  '^(Down |Up )?To the farm below', '^(Down |Up )?To the furrow$', '^(Down |Up )?To the tail'];
const tailToEsk = ['^(Down |Up )?To the horn', '^(Down |Up )?To the horseshoe|^To the wagon', '^Into the Hartmark|^To the Hartmark'];
const toWenna = ['^Take$', '^Take$', '^Take$', '^Through to the far side|^To the far side', '^(Down |Up )?To the burnt road', '^(Down |Up )?To the Nail', '^(Down |Up )?To where the road stops'];

describe('Let One Remember: the endings', () => {
  it('takes the Hartmark\'s silver and asks the runners to work through the winter: the Mountain Goes Up, and the book closes', async () => {
    const s = await T.start();
    await T.play(s, [...toTail, ...tailToEsk, 'Talk to Esk', 'Take Esk of Harrow.s silver', 'Take your leave']);
    expect(T.is(s, 'hastening', 'esk')).toBe(true);
    const said = await T.play(s, ['~3400']);
    expect(T.hightown(s, 'tailLinks')).toBeLessThan(143);
    expect(T.is(s, 'lost', 'hightown')).toBe(true);
    expect(said).toContain('Hightown went up in the night with nine hundred people on it');
    expect(s.campaign.world.test(ModuleWriter.call('reached', 'corrow__e_lost'))).toBe(true);
  }, 600000);

  it('stops Ruth and lets the Hartmark be: Esk hires hands of his own, ten days on, and the tail is cut anyway', async () => {
    // The Registry's number, bought with coal at Wendmouth and read at the Fourth Gate; then Ruth is told; Esk is not.
    const toWendmouth = ['^(Down |Up )?To the foot of the Scarp', '^(Down |Up )?To Wendhead bridge', '^(Down |Up )?To the valley road below', '^(Down |Up )?To the well square'];
    const s = await T.start();
    await T.play(s, [...toWendmouth, '^(Down |Up )?To the quay', '^Into the Ninepan', 'Talk to Clemence', 'Buy.*coal', 'Take your leave',
      '^Out', '^(Down |Up )?To the well square', '^(Down |Up )?To the valley road', '^(Down |Up )?To Wendhead bridge', '^(Down |Up )?To the foot', '^(Down |Up )?To the eighth', '^(Down |Up )?To the street',
      '^(Down |Up )?To the Hawse', '^(Down |Up )?To the rim', '^(Down |Up )?To the Fourth Gate', 'Talk to the Assessor', 'how many links', 'Give.*coal', 'say the reckoning again', 'Take your leave',
      '^(Down |Up )?To the rim', '^(Down |Up )?To the Hawse', '^(Down |Up )?To the north edge', '^(Down |Up )?To the gate of the Askew', '^(Down |Up )?To the farm below',
      '^(Down |Up )?To the furrow$', '^(Down |Up )?To the tail', 'Talk to Ruth', 'Tell Ruth', 'Take your leave']);
    expect(T.is(s, 'filing', 'ruth')).toBe(false);
    expect(T.is(s, 'hartmarkFiling', 'esk')).toBe(false);
    const before = T.hightown(s, 'tailLinks');
    const said = await T.play(s, ['=+500']);
    expect(T.is(s, 'hartmarkFiling', 'esk')).toBe(true);
    expect(said).toContain('hired at Harrow for the winter');
    // The cut still falls, and Esk, told, would have stopped it.
    await T.play(s, ['=+1700']);
    expect(T.hightown(s, 'tailLinks')).toBeLessThan(before);
  }, 900000);

  it('does nothing at all: the gales drive Hightown to the Socket, the Grounders tell all, and it falls on the shore (not an ending: the chain goes on)', async () => {
    const s = await T.start();
    const said = await T.play(s, ['~4040']);
    expect(said).toContain('three hundred people look down at the lake');
    expect(T.is(s, 'fellOnShore', 'hightown')).toBe(true);
    expect(T.is(s, 'lost', 'hightown')).toBe(false);
    expect(s.campaign.world.test(ModuleWriter.call('reached', 'corrow__e_lost'))).toBe(false);
  }, 300000);

  it('takes the charge as one with the stone: The Mountain Home, and Hightown sits on the Socket\'s shore', async () => {
    const s = await T.act5();
    await T.play(s, toWenna.slice(0, 6));
    await T.play(s, [toWenna[6]!, 'Talk to the old woman', 'who she is', 'Put Wenna.s lens', 'why she came this way', 'Take your leave']);
    const said = await T.play(s, ['Take the charge from Wenna']);
    expect(T.is(s, 'mountainHome', 'beyond')).toBe(true);
    expect(said).toContain('ferry runs from the foot of its terraces');
    expect(s.campaign.world.test(ModuleWriter.call('reached', 'corrow__e_home'))).toBe(true);
  }, 300000);

  it('gives the Hush to the thing that follows: The Heart Goes Home', async () => {
    const s = await T.act5();
    const said = await T.play(s, [...toWenna, 'Take the Hush from Wenna']);
    expect(said).toContain('eight stars that do not move together');
    expect(s.campaign.world.test(ModuleWriter.call('reached', 'corrow__e_given'))).toBe(true);
  }, 300000);

  it('lets the road go out of every mind, the Strays unnamed: The Hush Undone', async () => {
    const s = await T.act5();
    const said = await T.play(s, [...toWenna, 'Let the road go out of the last of you']);
    expect(said).toContain('no one was ready');
    expect(s.campaign.world.test(ModuleWriter.call('reached', 'corrow__e_none'))).toBe(true);
  }, 300000);

  it('goes on with Wenna: Elsewhere, Together', async () => {
    const s = await T.act5();
    await T.play(s, toWenna);
    await T.play(s, ['Talk to the old woman', 'who she is', 'Put Wenna.s lens']);
    const said = await T.play(s, ['Go on with Wenna']);
    expect(said).toContain('the grave-callers read your names on their rounds');
    expect(s.campaign.world.test(ModuleWriter.call('reached', 'corrow__e_followed'))).toBe(true);
  }, 300000);
});
