#!/usr/bin/env bun
// The Bound Howe's week, played by the page's own labels (the record is
// doc/history/activation/transcripts/bound-howe-race.txt).
//   bun scripts/play-howe-week.ts walk [seed]    a lone level-one warrior from the starting town: the cart on the first
//                                                green on day 2, the hiring-man's answer, the map to the ridge, the
//                                                lookout, the camp
//   bun scripts/play-howe-week.ts nobody [seed]  nobody comes (kahitude: the first green is the landing): days 2,
//                                                5, 8, 12, then the town below the ridge at night
//   bun scripts/play-howe-week.ts ally [seed]    four of level four, set down at the second company's camp on its day,
//                                                sell it the roll of kings and tell it the king's flute, and read the
//                                                week that follows
// Only `ally` sets the company down (Placed.at) to skip the walk, as the specs do; `walk` and `nobody` take every step
// by a label or the map's own card, and the waits are the page's own Wait choices run to a day and hour
// ("=day 2 09:00").
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Placed } from '../test/support/placed';
import { MapPlay } from '../test/support/map-play';
import { WorldAssembler } from '../src/world/world-assembler';
import { ModuleWriter } from '../src/lang/module-writer';

class HoweWeek {
  constructor(private readonly j: Journey, private readonly bind: Record<string, string>) {}

  static R(id: string) { return `howe__${id}`; }
  static told(text: string, n = 700) { return text.replace(/\s+/g, ' ').slice(0, n); }

  num(measure: string, who: string) {
    return this.j.campaign.world.number(ModuleWriter.call(HoweWeek.R(measure), HoweWeek.R(who)));
  }
  async step(label: string, n = 700) {
    try { console.log(`[${label}] ${HoweWeek.told(await this.j.play(label), n)}`); }
    catch (e) { console.log(`[${label}] !! ${(e as Error).message.slice(0, 200)}`); }
  }
  // A place's page is long; the head says where it is and the tail is what the week has put there.
  page(note: string, n = 900) {
    const sc = this.j.screen(), all = HoweWeek.told(sc.prose.join(' '), 20000);
    console.log(`-- ${note}: [${sc.place.name}] ${all.length > n + 200 ? `${all.slice(0, 200)} ... ${all.slice(-n)}` : all}`);
  }
  facts(note: string) {
    const R = HoweWeek.R, j = this.j;
    const face = ['sound', 'thin', 'shored', 'broken', 'buried'].find(v => Placed.holds(j, 'state', R('face_wall'), R(v)));
    const seal = ['set', 'rolled', 'forced'].find(v => Placed.holds(j, 'state', R('seal'), R(v)));
    console.log(`-- ${note}: face=${face} rival_step=${this.num('rival_step', 'rcaptain')} seal=${seal}`
      + ` host_stirs=${Placed.holds(j, R('host_stirs'))} raid=${Placed.holds(j, R('raid_done'))}`
      + ` abroad=${Placed.holds(j, R('host_abroad'))} levy_at=${j.campaign.world.one('at', R('levy_men'))}`
      + ` torc_at=${j.campaign.world.one('at', R('king_torc_item'))}`);
  }

  async walk() {
    const R = HoweWeek.R, j = this.j;
    await this.step('To the landing at Thornhaven');
    await this.step('=day 1 20:00');
    console.log(`-- day 1, the ridge is not told of: ${Placed.holds(j, 'knows', 'party', R('ridge_told'))}`);
    await this.step('=day 2 09:00');
    console.log(`-- day 2, told of by the cart and its notice: ${Placed.holds(j, 'knows', 'party', R('ridge_told'))};`
      + ` the hirer is at ${j.campaign.world.one('at', R('hirer'))}`);
    console.log(`-- offered: ${j.choices().map(c => c.full).filter(c => /hiring|where the work|Sign on/i.test(c)).join(' | ')}`);
    await this.step('Ask .+ where the work is', 1500);
    console.log(`[the map: set out for the ridge] ${JSON.stringify(await MapPlay.press(j, `region__${this.bind.howe}`))}`);
    await this.step('Into the salvagers.? lookout');
    await this.step('To the heather rise');
    await this.step('To the camp in the lee', 1500);
    const asks = j.choices().map(c => c.full).filter(c => /Ask|Pay|Buy ›/.test(c)).join(' | ');
    console.log(`-- offered at the camp: ${asks.slice(0, 900)}`);
  }

  async nobody() {
    const j = this.j;
    await this.step('To the landing at Thornhaven', 300);
    for (const d of [2, 5, 8, 12]) {
      await this.step(`=day ${d} 09:00`, 100);
      this.facts(`day ${d}`);
      this.page(`the first town's green on day ${d}`, 1100);
    }
    // On the evening of day 12 the company goes to the town below the ridge by the map, and waits there for the dark.
    const there = await MapPlay.press(j, `region__${this.bind.town}_green`);
    console.log(`[the map: to the town below the ridge] ${JSON.stringify(there)}`);
    await this.step('Wait › Until dark', 100);
    this.page('the town below the ridge, at night, after day 12', 1700);
  }

  async ally() {
    const R = HoweWeek.R, j = this.j, green = `region__${this.bind.town}_green`;
    const first = this.num('rivalDay', 'crew');
    Placed.at(j, green);
    await this.step(`=day ${first} 10:00`, 100);
    Placed.at(j, R('rival_camp'));
    Placed.knows(j, R('king_named'));
    Placed.knows(j, R('stave_known'));
    this.page('the second company\'s camp', 1400);
    await this.step('Ask .+ what the Lantern Company is doing on the ridge', 2600);
    await this.step('Sell .+ the roll of kings', 2600);
    const kin = ['low', 'mid', 'high'].find(f => Placed.holds(j, R('kinflute'), R(`flute_${f}`)))!;
    await this.step(`Tell .+ the king's flute is the ${kin === 'mid' ? 'middle' : kin} one`, 2600);
    Placed.at(j, green);
    for (const d of [first + 1, first + 2, first + 3, first + 4, first + 5, first + 7]) {
      await this.step(`=day ${d} 20:00`, 60);
      this.facts(`day ${d}`);
    }
  }

  static async main(args: string[]) {
    const [mode = 'walk', seed = 'kahitude'] = args;
    const placed = (await WorldAssembler.assemble(seed, NodeBundleSource.shared, {})).report.placements
      .find(x => x.scenario === 'bound-howe')!.bindings as Record<string, string>;
    const lone = [{ name: 'Aud', raceId: 'human', classId: 'warrior', level: 1 }];
    const four = ['warrior', 'cleric', 'thief', 'mage']
      .map((classId, i) => ({ name: `Mira${i}`, raceId: 'human', classId, level: 4 }));
    const drawn = mode === 'ally' ? { party: four } : { origin: 'debt', party: lone };
    const week = new HoweWeek(Journey.of(await DrawnWorld.start(seed, drawn, NodeBundleSource.shared)), placed);
    console.log(`# ${mode} (${seed}): howe ${placed.howe}, near town ${placed.town}, first town ${placed.first};`
      + ` breachDay ${week.num('breachDay', 'crew')}, rivalDay ${week.num('rivalDay', 'crew')}`);
    if (mode === 'walk') { await week.walk(); } else if (mode === 'nobody') { await week.nobody(); } else { await week.ally(); }
    return 0;
  }
}
if (import.meta.main) { process.exitCode = await HoweWeek.main(process.argv.slice(2)); }
