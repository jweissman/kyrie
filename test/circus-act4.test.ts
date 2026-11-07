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
  async toSarn() {
    await this.j.play('=day 2 10:30', 'To the backyard of the circus', 'Ask Mate Crewe who sent the crate', 'Ask Mate Crewe where the Sundial lies', 'Prise up the lid of the crate', '=day 2 22:30');
    this.j.roll('pass');
    await this.j.play("To Wapshott's ground", 'To Ashby green', 'Sit down in the middle of the green and be a tree');
    this.j.roll(undefined);
    await this.j.play("To Wapshott's ground");
    await this.j.play("Show Sir Gervase the crate's paper");
    await this.j.play('Ask Sir Gervase to charter the Sundial');
    this.put('wapshott', 'tober_a');
    await this.j.play('Tell the Colonel that Sir Gervase has chartered the Sundial');
    await this.j.play('To Ashby green', "To the Sundial's deck", 'Ask Mate Crewe to cast off for Sarn on the morning ebb');
  }
  rations(n: number) {
    const w = this.j.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    w.commit(w.world.apply([{ kind: 'set', call: ModuleWriter.call('quantity', 'party', 'rations'), value: ModuleWriter.number(n) }]));
  }
  water(n: number) {
    const w = this.j.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    w.commit(w.world.apply([{ kind: 'set', call: ModuleWriter.call(c('waterCasks'), c('wapshotts')), value: ModuleWriter.number(n) }]));
  }
  async decide() {
    this.rations(14);
    await this.j.play('=+520');
    this.put('wapshott', 'landing'); this.put('party', 'landing');
    await this.j.play('Ask the Colonel what he means to take home');
  }
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

  it('is a voyage of days: the clauses read, the storm ridden, the calm, the captain\'s story, landfall', async () => {
    const a = await Act.start();
    await a.toSarn();
    expect(a.holds('voyaged', 'wapshotts') && a.holds('atSea', 'wapshotts')).toBe(true);
    a.put('fenwick', 'deck');
    await a.j.play('Ask Sir Gervase what he has signed the Colonel to');
    a.put('fenwick', 'deck');
    expect(a.holds('clausesRead', 'wapshotts')).toBe(true);
    await a.j.play('=+760');
    expect(a.holds('stormOn', 'wapshotts') || a.holds('stormDone', 'wapshotts')).toBe(true);
    await a.j.play('=+200');
    await a.j.play('Say nothing of his hands on the rail, and sing the second verse with him');
    expect(a.holds('colonelCovered', 'wapshotts')).toBe(true);
    await a.j.play('=+300');
    await a.j.play('Ask Mate Crewe about Captain Vance');
    expect(a.holds('vanceKnown', 'wapshotts')).toBe(true);
    await a.j.play('=+700');
    expect(a.holds('berthS', 'wapshotts')).toBe(true);
    await a.j.play("To the Progress's landing");
    expect(a.j.at('party')).toBe(c('landing'));
  }, 290000);

  it('has a tent, a night and a tower: the Colonel names them, and the Quinceys sweep the church', async () => {
    const a = await Act.start();
    await a.j.play('=day 2 10:30', 'To the backyard of the circus', 'Prise up the lid of the crate', '=day 2 22:30');
    expect(a.holds('hatchlingsLoose', 'wapshotts')).toBe(true);
    expect(a.holds('colonelNamed', 'wapshotts')).toBe(true);
    await a.j.play("To Wapshott's ground", 'To Ashby green', '=+60');
    expect(a.holds('loosePhase2', 'wapshotts')).toBe(true);
    a.j.roll('pass');
    await a.j.play('Go up the church tower with a sack and the Brothers Quincey');
    expect(a.holds('hatchlingsPenned', 'wapshotts')).toBe(true);
  }, 280000);

  it('sends the circus to Sarn, and the hook-claws take the young back only when the Colonel lets his named one go', async () => {
    const a = await Act.start();
    await a.toSarn();
    a.put('party', 'hold');
    await a.j.play('=+1600');
    a.put('party', 'hold');
    await a.j.play('Take the young hook-claws ashore in a sack', "To the Sundial's deck", "To the Progress's landing");
    a.put('party', 'hook_den');
    a.put('wapshott', 'hook_den');
    expect(a.j.find('Set the young hook-claws down')).toBeUndefined();
    await a.j.play('Ask the Colonel to put the Duchess down at the edge of the hollow', 'Set the young hook-claws down at the edge of the hollow and step back');
    expect(a.holds('hookTolerates', 'party')).toBe(true);
  }, 290000);

  it('has many ways past Harrow, the three-horns and the tyrant', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing");
    a.put('party', 'harrow_camp');
    a.j.roll('pass');
    await a.j.play('Cut through the net-lines and the drying-poles while the men are at their mugs');
    expect(a.holds('harrowBeaten', 'party')).toBe(true);
    a.put('party', 'plain_mid');
    await a.j.play("Cross the herd-trail at the herd's own pace, never looking at the calf");
    expect(a.j.holds('tolerates', c('three_horns'), 'party')).toBe(true);
    a.put('party', 'plain_south');
    await a.j.play('=17:30');
    await a.j.play('Settle among the sleeping plate-backs and keep your voices down');
    expect(a.j.holds('tolerates', c('tyrant'), 'party')).toBe(true);
  }, 290000);

  it('has the pipers, the herd at dawn, the Colonel\'s trumpet, the colony launched, the scuttlers\' line', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing");
    a.put('party', 'plain_south');
    await a.j.play('=04:20');
    expect(a.j.holds('knows', 'party', c('piper_known'))).toBe(true);
    a.put('party', 'lake_shore');
    await a.j.play('=05:10', '=+1');
    expect(a.holds('herdSeen', 'party')).toBe(true);
    a.j.roll('pass');
    await a.j.play('Take the Colonel by the elbow before he blows');
    expect(a.holds('colonelStopped', 'wapshotts')).toBe(true);
    a.put('party', 'ledges');
    await a.j.play('=05:30');
    expect(a.j.holds('knows', 'party', c('colony_known'))).toBe(true);
    a.put('party', 'bone_beds');
    await a.j.play('=+1');
    expect(a.j.holds('knows', 'party', c('crust_safe'))).toBe(true);
  }, 290000);

  it('has companions who ask the player questions, and side stories that lead nowhere', async () => {
    const a = await Act.start();
    await a.toSarn();
    a.set('billieAboard', 'wapshotts'); a.set('away', 'billie'); a.set('away', 'mumchance'); a.set('away', 'dab');
    a.put('fenwick', 'deck'); a.put('crewe', 'deck'); a.put('billie', 'deck'); a.put('wapshott', 'deck');
    await a.j.play('=+1100');
    expect(a.holds('calmDone', 'wapshotts')).toBe(true);
    await a.j.play('Ask Mate Crewe about Captain Vance');
    expect(a.holds('vanceKnown', 'wapshotts')).toBe(true);
    expect(a.j.holds('holding', 'party', 'preserve_key')).toBe(true);
    a.set('billieSat', 'wapshotts'); a.put('billie', 'deck'); a.put('crewe', 'deck');
    await a.j.play('Ask Billie what she makes of the cages in the hold');
    await a.j.play('Say the field is worse, because nothing in it is answerable');
    expect(a.holds('billieField', 'wapshotts')).toBe(true);
    await a.j.play('Ask Crewe what weighs on him', 'Say you cannot know, and that the clutch is alive');
    expect(a.holds('crewePardoned', 'wapshotts')).toBe(true);
    a.put('party', 'hold');
    a.j.roll('pass');
    await a.j.play('Listen in the hold among the empty cages');
    expect(a.holds('dabFound', 'wapshotts')).toBe(true);
    a.put('dab', 'hold');
    await a.j.play('Ask the boy what he is doing in the hold', 'Take him to the Colonel');
    expect(a.holds('dabColonel', 'wapshotts')).toBe(true);
    a.put('party', 'deck');
    await a.j.play('=+700', "To the Progress's landing");
    // The grave: the key finishes the epitaph.
    a.put('party', 'cage_row');
    await a.j.play('Set the Preserve\'s key in the seventh grave and read the last word');
    expect(a.j.holds('epitaphDone', 'party')).toBe(true);
    // The camp: the dead buried, the field-book to Sir Gervase.
    a.put('party', 'wreck_camp');
    await a.j.play('Bury the three dead of the Coldharbour camp', "Dr Thorne's field-book: Take");
    a.put('fenwick', 'wreck_camp');
    await a.j.play("Give Sir Gervase Dr Thorne's field-book");
    expect(a.j.holds('thorneRead', 'party')).toBe(true);
    // Harrow: his story, and his men go to the circus.
    a.j.assert('knows', 'party', c('harrow_known'));
    a.put('party', 'harrow_camp'); a.put('harrow', 'harrow_camp');
    await a.j.play('Ask Captain Harrow how he came to Sarn', 'Say they might do well in a circus, and that you can ask the Colonel');
    expect(a.holds('crewHired', 'wapshotts')).toBe(true);
    // Mumchance's slate by the herd, and Sir Gervase's scope at the quay.
    a.set('mumchanceAboard', 'wapshotts'); a.put('mumchance', 'lake_shore'); a.set('herdSeen', 'party'); a.set('trumpetDone', 'wapshotts');
    a.put('party', 'lake_shore');
    await a.j.play('=10:00');
    await a.j.play('Take the slate Mumchance holds out to you', 'Write: it makes no difference');
    expect(a.holds('mumMatters', 'wapshotts')).toBe(true);
    a.set('clausesRead', 'wapshotts'); a.put('party', 'landing'); a.put('fenwick', 'landing');
    await a.j.play('Ask Sir Gervase which kinds he will take');
    a.put('fenwick', 'landing');
    await a.j.play('Say only the small and plentiful');
    expect(a.holds('specimensSmall', 'wapshotts')).toBe(true);
    // The bottle in the wrack.
    a.put('party', 'cliff_foot');
    await a.j.play('a green glass bottle in the wrack: Take');
  }, 290000);

  it('has a night on the quay: bare it costs the bosun; the cages alone cost him; cages and fire cost blood; meat costs nothing', async () => {
    for (const how of ['bare', 'cages', 'meat'] as const) {
      const a = await Act.start();
      await a.toSarn();
      await a.j.play('=+1600', "To the Progress's landing");
      expect(a.holds('tideMarked', 'wapshotts')).toBe(true);
      a.set('trumpetDone', 'wapshotts'); a.set('colonelDragged', 'wapshotts');
      a.put('party', 'landing');
      for (let i = 0; i < 40 && !a.holds('huntOn', 'wapshotts'); i++) { await a.j.play('=+30'); a.put('party', 'landing'); }
      expect(a.holds('huntOn', 'wapshotts')).toBe(true);
      expect(a.j.at(c('night_pack'))).toBe(c('landing'));
      a.rations(6);
      a.j.roll('pass');
      if (how === 'cages') { await a.j.play("Shut as many as will fit into the Wardens' cages and drop the bar"); }
      if (how === 'meat') { await a.j.play('Throw three rations of meat into the dark and sit still'); }
      a.put('party', how === 'cages' ? 'cage_row' : 'landing');
      await a.j.play('=05:00');
      expect(a.holds('huntDone', 'wapshotts')).toBe(true);
      expect(a.holds('crewLost', 'wapshotts')).toBe(how === 'bare' || how === 'cages');
      expect(a.j.holds('dead', 'mudge')).toBe(how === 'bare' || how === 'cages');
    }
  }, 290000);

  it('has a reef that shuts on a date, a run through it, and endings that differ: home with nothing, a fiasco, the Colonel stays', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing");
    await a.decide();
    await a.j.play("To the Sundial's deck");
    a.j.roll('pass');
    await a.j.play('Take the Sundial out through the reef passage');
    expect(a.holds('reefRun', 'wapshotts') && a.holds('atSea', 'wapshotts')).toBe(true);
    a.set('colonelNamed', 'wapshotts');
    await a.j.play('=+1750', 'To Ashby green');
    expect(a.holds('backFromSarn', 'wapshotts')).toBe(true);
    // Too late for the passage: the formidable run.
    const c2 = await Act.start();
    await c2.toSarn();
    await c2.j.play('=+1600', "To the Progress's landing");
    c2.water(14); c2.rations(20);
    await c2.decide();
    c2.water(14); c2.rations(20);
    await c2.j.play('=+1000', "To the Sundial's deck");
    expect(c2.j.find('Take the Sundial out through the shut reef')).toBeDefined();
  }, 290000);

  it('plays the charter honestly: Fenwick is off the ground until the crate brings him back, with nothing set by hand', async () => {
    const a = await Act.start();
    expect(a.j.holds('offstage', c('fenwick'))).toBe(true);
    await a.j.play('=day 2 10:30');
    expect(a.holds('crateCome', 'wapshotts')).toBe(true);
    await a.j.play('=day 3 00:30');
    expect(a.j.holds('offstage', c('fenwick'))).toBe(false);
    expect(a.holds('travels', 'fenwick')).toBe(true);
  }, 200000);

  it('has a Colonel who decides: moved he stays, unmoved he takes the egg and Billie goes', async () => {
    const stay = await Act.start();
    await stay.toSarn();
    await stay.j.play('=+1600', "To the Progress's landing", '=+520');
    for (const f of ['namedLetGo', 'ruleRead', 'colonelMoved']) { stay.set(f, 'wapshotts'); }
    stay.put('wapshott', 'landing');
    await stay.j.play('Ask the Colonel if he means to come home');
    expect(stay.holds('colonelStays', 'wapshotts')).toBe(true);
    expect(stay.holds('billieResigned', 'wapshotts')).toBe(true);
    const egg = await Act.start();
    await egg.toSarn();
    await egg.j.play('=+1600', "To the Progress's landing", '=+520');
    egg.put('wapshott', 'landing'); egg.put('party', 'landing');
    egg.j.give('egg_a');
    await egg.j.play('Ask the Colonel what he means to take home');
    expect(egg.holds('takeEgg', 'wapshotts')).toBe(true);
    expect(egg.holds('billieResigned', 'wapshotts')).toBe(true);
  }, 290000);

  it('keeps the bosun aboard on the way home, and a failed reef run keeps her aground', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing");
    await a.decide();
    await a.j.play("To the Sundial's deck");
    a.j.roll('fail');
    await a.j.play('Take the Sundial out through the reef passage');
    expect(a.holds('hullHoled', 'wapshotts')).toBe(true);
    expect(a.holds('berthS', 'wapshotts')).toBe(true);
    expect(a.holds('reefRun', 'wapshotts')).toBe(false);
    a.j.roll('pass');
    await a.j.play('Take the Sundial out through the shut reef on the ebb, and pray');
    expect(a.holds('atSea', 'wapshotts')).toBe(true);
    await a.j.play('=+1750');
    await a.j.play('To Ashby green');
    expect(a.holds('backFromSarn', 'wapshotts')).toBe(true);
    expect(a.j.at(c('mudge'))).toBe(c('deck'));
  }, 290000);

  it('warns before the tyrant: it walks the plain at evening, and the ground shakes where the party stands', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing");
    a.put('party', 'plain_south');
    await a.j.play('=19:30');
    expect(a.j.at(c('tyrant'))).toBe(c('plain_mid'));
  }, 200000);

  it('plays the water honestly: from the quay, to the forest, after the runners at noon, up the hidden trail, to the spring, and fills the casks', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing", '=07:30');
    a.j.roll('pass');
    await a.j.play("To the cycad forest's edge", '=11:30', 'Follow the fern-runners when they go off together at noon');
    expect(a.j.holds('springKnown', 'party')).toBe(true);
    await a.j.play('=14:00', 'To the cycad aisle', 'To the sheltered hollow');
    expect(a.j.at('party')).toBe(c('kingsfoil_hollow'));
    await a.j.play('=+60', 'Fill the casks at the spring');
    expect(a.j.measure(c('waterCasks'), c('wapshotts'))).toBeGreaterThan(3);
  }, 290000);

  it('plays the night where the party stands: nobody moved by hand, meat thrown, the morning clean, the Colonel asked and the Sundial taken out', async () => {
    const a = await Act.start();
    await a.toSarn();
    await a.j.play('=+1600', "To the Progress's landing");
    a.set('trumpetDone', 'wapshotts');
    a.water(12);
    for (let i = 0; i < 60 && !a.holds('huntOn', 'wapshotts'); i++) { await a.j.play('=+30'); }
    expect(a.holds('huntOn', 'wapshotts')).toBe(true);
    expect(a.j.at('party')).toBe(c('landing'));
    a.rations(6);
    a.j.roll('pass');
    await a.j.play('Take the Colonel by the collar and pull him into a cage');
    await a.j.play('Throw three rations of meat into the dark and sit still');
    a.j.roll(undefined);
    await a.j.play('=05:30');
    expect(a.holds('huntClean', 'wapshotts')).toBe(true);
    await a.decide();
    await a.j.play("To the Sundial's deck");
    a.j.roll('pass');
    await a.j.play('Take the Sundial out through the reef passage');
    expect(a.holds('reefRun', 'wapshotts')).toBe(true);
  }, 290000);
});
