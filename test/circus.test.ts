import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import { GeneratedWorld } from './support/generated';

// Wapshott's Peregrine Circus (doc/adventures/wapshotts-circus): played by the labels a player sees over a host of
// three small towns (test/fixtures/circus), and once in a generated country, where every first country keeps it.
// The wagons come into the fair town (Ashby Lowe) at two on the first day, play three nights, strike at six on the
// fourth morning for Burl, then Cotter's Cross, and are back at Ashby on the tenth.
const host = 'test/fixtures/circus/circus.campaign.json';
const c = (id: string) => `circus__${id}`;
class Circus {
  static async start(seed = 'c1') { return new Circus(await Journey.start(host, seed)); }
  constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(c(name), ...args.map(a => a === 'party' ? 'party' : c(a))); }
  knows(fact: string) { return this.j.holds('knows', 'party', c(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(c(name), ...args.map(a => a === 'party' ? 'party' : c(a))); }
  at(who: string) { return this.j.campaign.world.one('at', c(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  labels() { return this.j.choices().map(x => x.label); }
  // Sets what is so directly, for an outcome no single journey reaches in a test's time.
  stage(...facts: [string, ...string[]][]) {
    type Staged = { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    const w = this.j.campaign as unknown as Staged;
    const id = (a: string) => a === 'party' ? 'party' : c(a);
    w.commit(w.world.apply(facts.map(([name, ...args]): Change => name === 'set'
      ? { kind: 'set', call: ModuleWriter.call(c(args[0]!), ...args.slice(1, -1).map(id)), value: ModuleWriter.number(Number(args.at(-1))) }
      : { kind: 'assert', call: ModuleWriter.call(c(name), ...args.map(id)) })));
    return this;
  }
}
const onGround = ['=day 1 14:30', '^To Wapshott'];
const toColonel = ['^To the backyard', '^To the ring of living', 'Ask the Colonel about his circus', 'Ask the Colonel what he wants'];

describe("Wapshott's Peregrine Circus", () => {
  it('lints clean over its host towns', async () => {
    const findings = await KyrLint.campaign(host, new NodeBundleSource());
    expect(findings.filter(f => f.level !== 'advice')).toEqual([]);
  }, 120000);

  it('comes into the fair town on the first afternoon, parades the green at four, and plays at seven', async () => {
    const t = await Circus.start();
    await t.play('=day 1 15:55', 'Wait › An hour', '=day 1 18:30', '^To Wapshott', 'Buy a ticket', '^To the big top', '=day 1 21:40');
    expect(t.page).toContain('Here is the parade.');
    expect(t.page).toContain('The band crashes into the Grand Entry');
    expect(t.page).toContain('the Sylph: in silver, with a white parasol');
    expect(t.measure('nights', 'wapshotts')).toBe(1);
    expect(t.measure('strongbox', 'wapshotts')).toBeGreaterThan(14);
  }, 120000);

  it('goes round its three towns, with its bills a day ahead, and is met on the road between', async () => {
    const t = await Circus.start();
    await t.play('=day 3 12:00');
    expect(t.j.holds('state', c('bill_b'), c('coming'))).toBe(true);
    expect(t.at('quirk')).toBe('host__b_green');
    await t.play('=day 4 9:00');
    expect(t.at('wapshott')).toBe('host__ab_way');
    await t.play('=day 4 15:00');
    expect(t.at('wapshott')).toBe(c('wagons_b'));
    expect(t.holds('here', 'tober_a')).toBe(false);
    await t.play('=day 7 15:00');
    expect(t.at('wapshott')).toBe(c('wagons_c'));
    await t.play('=day 10 15:00');
    expect(t.at('wapshott')).toBe(c('wagons_a'));
  }, 180000);

  it('takes a hand who signs the book along with the wagons', async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Sign Ada', 'Tell Lusk you will ride', '=day 4 9:00');
    expect(t.page).toContain('You ride out with the wagons');
    expect(t.j.campaign.world.one('at', 'party')).toBe('host__ab_way');
    await t.play('=day 4 14:30');
    expect(t.j.campaign.world.one('at', 'party')).toBe(c('tober_b'));
  }, 120000);

  it('teaches the Fall, and the Fall is a technique Mumchance will drill, and a fall saved in the ring', async () => {
    const t = await Circus.start('fall');
    await t.play(...onGround, '^To the backyard', 'Ask Mumchance where he learned', 'Ask Mumchance whether he would teach');
    for (let day = 1; day <= 4 && !t.holds('fallLearned', 'party'); day++) {
      await t.play(`?Learn the Fall`, '=+12');
      if (!t.holds('fallLearned', 'party')) { await t.play(`=day ${day + 1} 14:30`, `>${c(`yard_${'abbb'[day]}`)}`); }
    }
    expect(t.holds('fallLearned', 'party')).toBe(true);
    expect(t.j.holds('teaches', c('mumchance'), 'pratfall')).toBe(true);
    expect(t.knows('shoes_given')).toBe(true);
  }, 240000);

  it('gives a turn in the ring to whoever auditions, and the turn goes as it is played', async () => {
    const t = await Circus.start();
    await t.play(...onGround, ...toColonel.slice(0, 2), '=day 2 9:10', '>' + c('ring_a'), 'Ask the Colonel for a turn', 'Audition',
      'Ask the Colonel to let you give the spiel', 'Rehearse tonight', '=day 2 20:25');
    expect(t.page).toContain('a NEW FACE');
    await t.play('Throw away the rehearsal', '=+3');
    expect(t.measure('turns', 'party')).toBe(1);
    expect(t.page).toMatch(/spiel for the Sylph/);
  }, 180000);

});

describe("Wapshott's menagerie", () => {
  it("opens a menagerie on the Colonel's word, and its basilisk is found out and billed as what it is", async () => {
    const t = await Circus.start();
    await t.play(...onGround, ...toColonel, 'Ask the Colonel about his menagerie', 'Ask Hench whether he has a looking-glass',
      '^To the backyard', '^To Wapshott', '^To the menagerie', 'Listen at it', 'Read the dealer', 'Prise the lid');
    expect(t.knows('roderick_known')).toBe(true);
    await t.play('^To Wapshott', '^To the backyard', '^To the ring of living', 'Tell the Colonel his basilisk', 'Talk the Colonel into billing');
    expect(t.holds('basiliskHonest', 'wapshotts')).toBe(true);
    expect(t.holds('exhibit', 'roderick')).toBe(true);
  }, 120000);

  it('asks the hob of the mill, and takes him only on his own terms', async () => {
    const t = await Circus.start('hob');
    await t.play(...onGround, ...toColonel, 'Ask the Colonel about his menagerie', '=day 4 15:00', '>host__b_green', '^To the old fulling',
      'Talk to Mrs Thrussell', 'Ask Mrs Thrussell about the hob', '=day 4 18:10', '>' + c('yard_b'), 'Ask Honoria for a bowl of cream', '>' + c('mill_b'),
      '=day 4 21:30', "Set Honoria's bowl", 'Talk to Ninepence', 'Ask Ninepence what it would take', '>' + c('wagons_b'), "Put Ninepence's terms");
    expect(t.labels().some(l => l.startsWith('Persuade the Colonel that a hob who works the show unseen'))).toBe(true);
    t.stage(['colonelAgreesHob', 'wapshotts']);
    await t.play('>' + c('mill_b'), 'Tell Ninepence the Colonel accepts');
    expect(t.holds('hobJoined', 'ninepence')).toBe(true);
    await t.play('=day 5 18:00', '>' + c('tober_b'), 'Buy a ticket', '>' + c('ring_b'), '=day 5 19:50');
    expect(t.page).toMatch(/hat lifts off his head of its own accord/);
  }, 240000);

  it('finds the glimmer-fox by the frost-line after dark, and can let her be', async () => {
    const t = await Circus.start('fox');
    await t.play(...onGround, ...toColonel, 'Ask the Colonel about his menagerie', '=day 7 15:00', '>host__c_tap',
      'about lights in the water-meadows', '>' + c('meadow_c'), '=day 7 22:00');
    for (let n = 0; n < 3 && !t.holds('foxSeen', 'party'); n++) { await t.play('?Lie in the reeds'); }
    expect(t.holds('foxSeen', 'party')).toBe(true);
    expect(t.page).toContain('She is hunting moths');
    await t.play('>' + c('tober_c'), "Tell Ada what you saw");
    expect(t.holds('foxPainted', 'wapshotts')).toBe(true);
  }, 240000);

  it('brings the tortoise up from the carrier at a cabbage an hour, and Hench reads his shell', async () => {
    const t = await Circus.start();
    await t.play(...onGround, ...toColonel, 'Ask the Colonel about his menagerie', '=day 7 15:00', '>' + c('carrier_c'),
      'Buy the tortoise', '>host__c_green', 'Buy a sack of cabbages', '>' + c('carrier_c'), 'Lead the tortoise');
    expect(t.holds('exhibit', 'methuselah')).toBe(true);
    await t.play('>' + c('wagons_c'), 'Ask Hench whether he knows the crowned wheel');
    expect(t.knows('crest_known')).toBe(true);
  }, 240000);

});

describe("Wapshott's people and their troubles", () => {
  it("mends the Brothers Quincey with their father's playbill", async () => {
    const t = await Circus.start();
    await t.play(...onGround, '^To the big top', 'Ask Dunstan about the Quincey', '^To the backyard', '^To the ring of living',
      "Ask Hench about the Brothers Quincey's father", "Go through Barnaby Quincey's", '^To the backyard', '^To the big top', 'Get both Quinceys');
    expect(t.holds('feudMended', 'hal')).toBe(true);
    await t.play('=day 1 19:45');
    expect(t.page).toContain('the Quincey Turn');
  }, 180000);

  it("lets Pip go with the company on Mumchance's word, and she leaves the ring while she travels", async () => {
    const t = await Circus.start();
    t.stage(['fallLearned', 'party'], ['set', 'regard', 'pip', '2']);
    await t.play(...onGround, '^To the backyard', 'Ask Mumchance whether Pip might come', '^To the big top', 'Ask Pip Gallant to join');
    expect(t.j.holds('travelsWith', c('pip'), 'party')).toBe(true);
    await t.play('=day 1 19:30');
    expect(t.at('pip')).not.toBe(c('ring_a'));
  }, 120000);

  it("walks the Sylph of the Wire home to her mother in the third town, and she walks the wire for her", async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Ask Nance to tell your fortune', 'Ask Nance what she meant', '^To the backyard', '^To the ring of living',
      'Talk to .*(Zéphyrine|silver wrap)', '=day 7 15:00', '>' + c('tripe_lane_c'), 'Tell Mrs Pruett you know', '>' + c('wagons_c'),
      'Tell Zéphyrine that her mother', 'Walk down the tripe-lane');
    expect(t.holds('reunited', 'pruett')).toBe(true);
    await t.play('=day 7 18:00', '>' + c('ring_c'), '=day 7 21:00');
    expect(t.page).toContain('a small woman in a tripe-dresser');
  }, 240000);

});

describe("Wapshott's dangers, muddles and rivals", () => {
  it('brings the owlbear of the orchards in alive, with honey, a net, an iron-strapped cage and Billie beside you', async () => {
    const t = await Circus.start('o1');
    await t.play(...onGround, ...toColonel, 'Ask the Colonel about his menagerie', '^To the backyard', '^To Wapshott', '^To the menagerie',
      'Ask Billie what kind of beast', '^To Wapshott', 'Ask Lusk for a net', '>host__a_green', 'Buy four coin of iron straps');
    t.stage(['cageStrapped', 'wapshotts']);
    await t.play('>' + c('beasts_a'), 'Ask Billie to come', '>' + c('orchard_a'), 'Ask Goody Tarrant for a comb', '=day 1 19:05');
    expect(t.page).toContain('a round white owl');
    for (let night = 2; night <= 7 && !t.holds('exhibit', 'bramble'); night++) {
      await t.play("?Throw the honeycomb down on Lusk's net, and keep low");
      if (!t.holds('exhibit', 'bramble')) { await t.play(`=day ${night} 19:05`); }
    }
    expect(t.holds('exhibit', 'bramble')).toBe(true);
    expect(t.j.campaign.world.one('at', 'party')).toBe(c('orchard_a'));
  }, 240000);

  it('settles the muddle of the serpent: a grass snake for the Colonel, the shrine\'s old horn for Fipps', async () => {
    const t = await Circus.start();
    await t.play(...onGround, ...toColonel, 'Ask the Colonel about his menagerie', 'Ask the Colonel what he meant by A SERPENT', '^To the backyard',
      '^To Wapshott', 'Tell Fipps the Colonel', '=day 7 15:00', '>host__c_green', 'Ask Father Dunn whether', '>' + c('tober_c'),
      'Give the old serpent');
    expect(t.holds('bandWhole', 'wapshotts')).toBe(true);
    expect(t.page).toContain('The low G');
  }, 180000);

  it('is heckled at the second town by Jos Haverhill, who can be answered, and the answer is the fourth foundation', async () => {
    const t = await Circus.start();
    t.stage(['fallLearned', 'party']);
    await t.play('=day 4 16:00', '>' + c('tober_b'), 'Buy a ticket', '>' + c('ring_b'), '=day 4 19:45');
    expect(t.page).toMatch(/sat there like a ha.penny bun/);
    for (let n = 0; n < 4 && t.holds('inBout', 'jos'); n++) { await t.play('?Fall off the bench|Answer Jos'); }
    expect(t.holds('boutWon', 'party', 'jos') || t.holds('boutLost', 'party', 'jos') || !t.holds('inBout', 'jos')).toBe(true);
  }, 180000);

  it("brings Lusk's Nell to see her father's tent lit", async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Ask Lusk about his canvasmen', 'Ask Lusk how the canvas is');
    t.stage(['set', 'regard', 'lusk', '1']);
    await t.play('Ask Lusk whether he has family', '=day 4 16:00', '>' + c('aske_cottage_b'), '?Ask Mrs Aske to bring Nell');
    if (t.holds('nellAtShow', 'nell')) {
      await t.play('>' + c('tober_b'), 'Buy a ticket', '>' + c('ring_b'), '=day 4 19:30');
      expect(t.page).toContain('a very large man has taken off his cap');
    } else { expect(t.page).toContain('A circus is a thing that leaves'); }
  }, 180000);

  it('holds the Flyting at the Fair, and the man in the grey hat can be found out by his lad', async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Talk to Ada', '=day 3 12:00', '>' + c('wagons_a'), '=day 3 14:00', '>' + c('tober_a'), 'Ask Ada what the man');
    expect(t.knows('note_known')).toBe(true);
    await t.play('=day 5 7:30', '>host__b_green');
    if (t.holds('watOut', 'wat')) {
      await t.play('?Collar the lad');
      if (t.holds('watCaught', 'wat')) { await t.play('Ask Wat who'); expect(t.measure('evidence', 'party')).toBeGreaterThanOrEqual(2); }
    }
    await t.play('=day 11 11:00', '>host__a_green', '=day 11 15:05');
    expect(t.page).toContain('THE FLYTING');
    for (let n = 0; n < 4 && t.holds('inBout', 'bombazine'); n++) { await t.play('?Answer Captain Bombazine|Agree with Captain Bombazine'); }
    await t.play('=day 11 16:30');
    expect(t.holds('flytingDone', 'wapshotts')).toBe(true);
  }, 300000);

  it("serves the Colonel Sallow's note once the company knows the circus, and holds the Goose Fair at the fair town's next stand", async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Talk to Ada', '=day 3 12:00');
    expect(t.holds('noteServed', 'wapshotts')).toBe(true);
    expect(t.measure('note', 'wapshotts')).toBe(60);
    await t.play('=day 10 15:00');
    expect(t.holds('fairOn', 'wapshotts')).toBe(true);
    expect(t.measure('fairDay', 'wapshotts')).toBe(10);
  }, 180000);

  it('settles the note at the Fair by the box, by Sallow tearing it, or by a merger', async () => {
    const paid = await Circus.start();
    await paid.play(...onGround, 'Talk to Ada', '>host__a_tap', '=day 10 15:00');
    paid.stage(['set', 'fairScore', 'wapshotts', '20'], ['set', 'strongbox', 'wapshotts', '30']);
    await paid.play('=day 12 23:00');
    expect(paid.holds('contestWon', 'wapshotts')).toBe(true);
    expect(paid.holds('noteDischarged', 'wapshotts')).toBe(true);
    const torn = await Circus.start();
    await torn.play(...onGround, 'Talk to Ada', '>host__a_tap', '=day 10 15:00');
    torn.stage(['sleeExposed', 'slee'], ['set', 'strongbox', 'wapshotts', '0']);
    await torn.play('=day 12 23:00');
    expect(torn.holds('noteTorn', 'wapshotts')).toBe(true);
    const merged = await Circus.start();
    await merged.play(...onGround, 'Talk to Ada', '>host__a_tap', '=day 12 23:00');
    expect(merged.holds('merged', 'wapshotts')).toBe(true);
    await merged.play('=day 13 15:00');
    expect(merged.holds('travels', 'sallow')).toBe(true);
  }, 300000);
});

describe("Wapshott's in a generated country", () => {
  it('goes round three of the first country\'s towns, from its largest, alongside whatever else is going on there', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared);
    const placed = w.report.placements.find(p => p.scenario === 'circus')!;
    expect(placed).toBeDefined();
    const { a, b, cc } = { a: placed.bindings.a!, b: placed.bindings.b!, cc: placed.bindings.c! };
    expect(new Set([a, b, cc]).size).toBe(3);
    expect(w.report.region.settlements.find(s => s.id === a)!.size).toBe('town');
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    GeneratedWorld.put(s, `${a}_green`);
    while (s.campaign.state.elapsed < 40) { await s.perform('wait'); }
    await GeneratedWorld.travel(s, c('tober_a'));
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('The big top stands in the middle of the field');
    while (s.campaign.state.elapsed < 480) { await s.perform('wait_hour'); }
    expect([c('wagons_b'), c('ring_b'), `region__${b}_green`]).toContain(s.campaign.world.one('at', c('wapshott'))!);
    expect(s.campaign.world.test(ModuleWriter.call(c('here'), c('tober_a')))).toBe(false);
  }, 120000);
});

describe("Wapshott's second pass: chapters, the worst hour, and what changes", () => {
  it('opens its chapters on what is seen: the wagons, the note, the Fair', async () => {
    const t = await Circus.start();
    await t.play(...onGround);
    expect(t.page).toContain('You have walked into a circus.');
    await t.play('Talk to Ada', '=day 3 14:00', '>' + c('tober_a'), 'Ask Ada what the man');
    expect(t.page).toContain('Behind every circus there is a second circus');
  }, 120000);

  it('tells an act in full the first night and briefly after, and every night has its own incident', async () => {
    const t = await Circus.start();
    await t.play('=day 1 18:30', '^To Wapshott', 'Sign Ada', '^To the big top', '=day 1 21:10', '=day 2 18:50', '=day 2 21:10');
    expect(t.page).toContain('The band crashes into the Grand Entry');
    expect(t.page).toContain('They always do; you find you have roared too.');
  }, 180000);

  it('meets the men from Dunmere at midnight on the Fair\'s first night, and a hand can raise the cry', async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Sign Ada', 'Talk to Ada', '>host__a_tap', '=day 10 22:30', '>' + c('tober_a'), '=day 10 23:05');
    expect(t.page).toContain('We\u2019re paid by the rope');
    await t.play('Raise the old cry');
    expect(t.holds('raidStopped', 'wapshotts')).toBe(true);
    expect(t.page).toContain('Honoria Bulstrode in a flowered nightgown with a frying-pan');
    await t.play('>host__a_tap', '=day 11 9:00');
    expect(t.holds('canvasCut', 'wapshotts')).toBe(false);
  }, 240000);

  it('lets the ropes be cut if nobody is on the ground, and the contest is played in a patched tent', async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Talk to Ada', '>host__a_tap', '=day 11 9:00');
    expect(t.holds('canvasCut', 'wapshotts')).toBe(true);
    expect(t.measure('canvas', 'wapshotts')).toBe(0);
  }, 180000);

  it('hears Mumchance say one word at the Flyting, if the company has the Answer and wins it', async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Talk to Ada', '>host__a_tap', '=day 11 11:00', '>host__a_green');
    t.stage(['answerLearned', 'party'], ['fallLearned', 'party'], ['lookLearned', 'party']);
    await t.play('=day 11 15:05');
    t.stage(['set', 'composure', 'bombazine', '1']);
    for (let n = 0; n < 4 && t.holds('inBout', 'bombazine'); n++) { await t.play('?Say nothing, and give|Answer Captain Bombazine'); }
    if (t.holds('boutWon', 'party', 'bombazine')) {
      expect(t.holds('mumSpoke', 'mumchance')).toBe(true);
      expect(t.page).toContain('HE SPOKE! NINE YEARS!');
    }
  }, 240000);

  it('gives Ada her quarter-share and the Colonel\'s pen, if he knew of Sallow\'s offer and the note is paid', async () => {
    const t = await Circus.start();
    await t.play(...onGround, 'Talk to Ada', '>host__a_tap', '=day 11 10:00', '>' + c('tober_a'), 'Ask Ada what Madame Sallow wanted', 'Tell Ada that Wapshott',
      '>' + c('ring_a'), 'Tell the Colonel that Madame Sallow has offered', '>host__a_tap');
    t.stage(['set', 'fairScore', 'wapshotts', '20'], ['set', 'strongbox', 'wapshotts', '40']);
    await t.play('=day 12 21:40', '>' + c('wagons_a'), '=day 12 22:30');
    expect(t.holds('noteDischarged', 'wapshotts')).toBe(true);
    expect(t.holds('adaShared', 'ada')).toBe(true);
  }, 300000);
});

