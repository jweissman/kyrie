import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// Wapshott's Fourth Act (doc/adventures/anthology/the-fourth-act.md), over the host towns of test/fixtures/circus:
// the crate, the hatching, the town, the charter, the Sundial, and Sarn. The Revels are staged as done: what they
// were is Phase II's own spec.
const host = 'test/fixtures/circus/circus.campaign.json';
const c = (x: string) => `circus__${x}`;
class Act {
  constructor(readonly j: Journey) {}
  static async start(seed = 'p4') {
    const a = new Act(await Journey.start(host, seed));
    await a.j.play('=day 1 14:30', "To Wapshott's ground");
    a.set('revelsDone', 'wapshotts');
    return a;
  }
  private apply(change: Change) {
    const w = this.j.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    w.commit(w.world.apply([change]));
  }
  set(name: string, ...args: string[]) { this.apply({ kind: 'assert', call: ModuleWriter.call(c(name), ...args.map(x => x === 'party' ? x : c(x))) }); }
  unset(name: string, ...args: string[]) { this.apply({ kind: 'retract', call: ModuleWriter.call(c(name), ...args.map(x => x === 'party' ? x : c(x))) }); }
  put(who: string, place: string) { this.j.put(who === 'party' ? who : c(who), place.startsWith('host__') ? place : c(place)); }
  holds(name: string, ...args: string[]) { return this.j.holds(c(name), ...args.map(x => x === 'party' ? x : c(x))); }
  knows(f: string) { return this.j.holds('knows', 'party', c(f)); }
  fenwick() { this.set('fenwickCome', 'fenwick'); this.unset('offstage', 'fenwick'); this.set('travels', 'fenwick'); this.put('fenwick', 'tober_a'); }
}

describe("Wapshott's, Act IV: the crate", () => {
  it('comes after the Revels, opens on a clutch of eggs, and hatches loose in the town if nobody warms it', async () => {
    const a = await Act.start();
    expect(a.holds('crateCome', 'wapshotts')).toBe(false);
    await a.j.play('=day 2 10:30', 'To the backyard of the circus', 'Ask Mate Crewe who sent the crate',
      'Ask Mate Crewe where the Sundial lies', 'Prise up the lid of the crate');
    expect(a.holds('crateCome', 'wapshotts')).toBe(true);
    expect(a.knows('crate_known') && a.knows('ship_known') && a.knows('eggs_known')).toBe(true);
    await a.j.play('=day 2 22:30');
    expect(a.holds('hatchlingsLoose', 'wapshotts')).toBe(true);
    await a.j.play("To Wapshott's ground", 'To Ashby green');
    a.j.roll('pass');
    await a.j.play('Sit down in the middle of the green and be a tree');
    expect(a.holds('hatchlingsPenned', 'wapshotts')).toBe(true);
    expect(a.holds('hatchlingsLoose', 'wapshotts')).toBe(false);
  }, 280000);

  it('hatches penned if Billie makes a nest, and nothing is loose', async () => {
    const a = await Act.start();
    await a.j.play('=day 2 10:30', 'To the backyard of the circus', 'Prise up the lid of the crate');
    a.set('eggsKept', 'wapshotts');
    await a.j.play('=day 2 22:30');
    expect(a.holds('hatchlingsPenned', 'wapshotts')).toBe(true);
    expect(a.holds('hatchlingsLoose', 'wapshotts')).toBe(false);
  }, 280000);

  it('sends the circus to Sarn on Sir Gervase\'s charter, and the island answers what is done on it', async () => {
    const a = await Act.start();
    await a.j.play('=day 2 10:30', 'To the backyard of the circus', 'Ask Mate Crewe who sent the crate',
      'Ask Mate Crewe where the Sundial lies', 'Prise up the lid of the crate', '=day 2 22:30');
    a.j.roll('pass');
    await a.j.play("To Wapshott's ground", 'To Ashby green', 'Sit down in the middle of the green and be a tree');
    a.j.roll(undefined);
    a.fenwick();
    await a.j.play("To Wapshott's ground");
    a.put('fenwick', 'tober_a');
    await a.j.play("Show Sir Gervase the crate's paper");
    a.put('fenwick', 'tober_a');
    await a.j.play('Ask Sir Gervase to charter the Sundial');
    expect(a.holds('voyageReady', 'wapshotts')).toBe(true);
    a.put('wapshott', 'tober_a');
    await a.j.play('Tell the Colonel that Sir Gervase has chartered the Sundial');
    expect(a.holds('wapshottAboard', 'wapshotts')).toBe(true);
    await a.j.play('To Ashby green', "To the Progress's landing");
    expect(a.j.at('party')).toBe(c('landing'));
    expect(a.holds('voyaged', 'wapshotts')).toBe(true);
    expect(a.j.holds('following', c('wapshott'), 'party')).toBe(true);
    // The hook-claws take the penned young back and let the company be.
    a.put('party', 'hook_den');
    await a.j.play('Set the young hook-claws down at the edge of the hollow and step back');
    expect(a.holds('hookTolerates', 'party')).toBe(true);
    // The herd at dawn, and the Colonel's trumpet.
    a.put('party', 'lake_shore');
    await a.j.play('=05:10', '=+1');
    expect(a.holds('herdSeen', 'party')).toBe(true);
    expect(a.holds('trumpetPending', 'wapshotts')).toBe(true);
    a.j.roll('pass');
    await a.j.play('Take the Colonel by the elbow before he blows');
    expect(a.holds('colonelStopped', 'wapshotts')).toBe(true);
    a.set('journalRead', 'wapshotts');
    a.j.assert('knows', 'party', c('journal_read'));
    a.put('party', 'landing');
    await a.j.play('Tell the Colonel what the Warden\'s journal says of the Great Beast', 'Ask the Colonel what he will do about the Leg in the shrine');
    expect(a.holds('legPromised', 'wapshotts')).toBe(true);
    // The egg: taken, and put back.
    a.put('party', 'egg_beds');
    await a.j.play('=day 4 09:00');
    // What is taken home is the Colonel's, and the Rule holds him to it.
    a.set('ruleRead', 'wapshotts');
    a.put('party', 'landing');
    await a.j.play('Hold the Colonel to the Rule: nothing is to be taken that cannot be fed');
    expect(a.holds('takeLeave', 'wapshotts')).toBe(true);
    // Home, and it is kept across a save.
    await a.j.play('To Ashby green');
    expect(a.holds('backFromSarn', 'wapshotts')).toBe(true);
    const again = PlaySession.resume(JSON.parse(JSON.stringify(a.j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds(c('takeLeave'), c('wapshotts'))).toBe(true);
  }, 290000);
});
