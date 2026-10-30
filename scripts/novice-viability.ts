// Whether a novice can live: every calling the creation offers, at level 1, alone and with the first town's hire,
// over a sample of generated countries, against every band of the first country out of town (the first ruin's, the
// big ruin's, and the placed troubles': dens, raiders' holds, tolls and the rest): how often each band comes at the
// company with no turn to back away, and what comes of the fight standing to the end (PT-11's investigation's
// measure) and fought carefully (taking on nothing reckoned beyond it when given a turn, running when it goes badly).
// Mission 18's audit, W2 ("A lone novice who can live"): C6, PT-11, PT-23, PT-38, SLIP-07, SLIP-08, SLIP-09. The
// world, its bands and every fight are drawn from the seed, so a run is the same run again.
//   bun scripts/novice-viability.ts [--seeds 8 | --seeds s1,s2] [--prefix s] [--origin debt] [--trials 10]
//     [--callings warrior,mage] [--out doc/architecture/mission-18/novice-viability] [--rows rows.json]
//     [--title "after the repairs"]
// It writes <out>.json (the summary and the countries) and <out>.md (the tables); with --rows, every band's row.
import { writeFileSync } from 'node:fs';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import type { Campaign } from '../src/campaign/campaign';
import { Environment } from '../src/campaign/environment';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { Creature } from '../src/creature';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlaySession } from '../src/session/play-session';
import { RegionWriter } from '../src/world/region-writer';
import { WorldAssembler } from '../src/world/world-assembler';
import { NoviceCountry, type Band, type Country } from './novice-country';
import { NoviceFights, type Setup } from './novice-fights';
import { NoviceMeeting } from './novice-meeting';
import { NoviceReport, type Row, type Spec } from './novice-report';

interface Run extends Spec { out: string; rows: string }
interface Meet { country: Country; band: Band; calling: string; company: string; ids: string[] }

export class NoviceViability {
  static option(args: string[], name: string, fallback: string): string {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] ?? fallback : fallback;
  }
  static run(args: string[]): Run {
    const seeds = this.option(args, 'seeds', '8'), prefix = this.option(args, 'prefix', 's');
    const callings = this.option(args, 'callings', Content.playableClasses.join(',')).split(',').filter(Boolean);
    return { seeds: /^\d+$/.test(seeds) ? Array.from({ length: Number(seeds) }, (_, i) => `${prefix}${i + 1}`)
      : seeds.split(',').filter(Boolean), origin: this.option(args, 'origin', 'debt'), callings,
    trials: Number(this.option(args, 'trials', '10')), maxTurns: NoviceFights.maxTurns,
    out: this.option(args, 'out', 'doc/architecture/mission-18/novice-viability'), rows: this.option(args, 'rows', ''),
    title: this.option(args, 'title', 'the baseline') };
  }
  static async main(args: string[]): Promise<number> {
    const run = this.run(args), worlds: Country[] = [], rows: Row[] = [], began = performance.now();
    for (const seed of run.seeds) {
      for (const calling of run.callings) {
        const t = performance.now(), campaign = await this.start(seed, calling, run.origin);
        const country = NoviceCountry.read(campaign, seed);
        if (calling === run.callings[0]) { worlds.push(country); }
        const measured = this.measure(campaign, country, calling, run);
        rows.push(...measured);
        console.log(`${seed} ${calling}: ${country.bands.length} bands, ${measured.length} rows`
          + ` in ${Math.round(performance.now() - t)} ms`);
      }
    }
    const spec: Spec = { seeds: run.seeds, origin: run.origin, callings: run.callings, trials: run.trials,
      maxTurns: run.maxTurns, title: run.title };
    const lines = NoviceReport.summary(rows, spec);
    writeFileSync(`${run.out}.json`, `${JSON.stringify({ spec, summary: lines,
      countries: worlds.map(w => this.kept(w)) }, null, 1)}\n`);
    if (run.rows) { writeFileSync(run.rows, `${JSON.stringify(rows)}\n`); }
    writeFileSync(`${run.out}.md`, NoviceReport.page(spec, worlds, rows, lines));
    const seconds = Math.round((performance.now() - began) / 1000);
    console.log(`${rows.length} rows in ${seconds} s: ${run.out}.json, ${run.out}.md`);
    return 0;
  }
  // A protagonist of the first people the creation lets take the calling, set out from the origin, as the page sets
  // one out (the creation's own defaults for the rest).
  static async start(seed: string, classId: string, origin: string): Promise<Campaign> {
    const raceId = Content.playableRaces.find(r => Canon.ancestries[r]?.classes.includes(classId)) ?? 'human';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin, party: [{ name: 'Wenna', raceId, classId }] });
    return (await PlaySession.start(w.path, seed, w.source)).campaign;
  }
  private static measure(campaign: Campaign, country: Country, calling: string, run: Run): Row[] {
    const lead = campaign.readout.partyIds[0]!;
    const companies: [string, string[]][] = [['alone', [lead]],
      ...country.hire ? [['hired', [lead, ...country.hire.members]] as [string, string[]]] : []];
    return companies.flatMap(([company, ids]) => country.bands.flatMap(band =>
      this.row(campaign, { country, band, calling, company, ids }, run)));
  }
  // A band the company is let be by as it arrives (a tame goat on the road) is no danger, and not counted.
  private static row(campaign: Campaign, at: Meet, run: Run): Row[] {
    const { country, band } = at, creatures = campaign.readout.creatures;
    const company = at.ids.map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c);
    const foes = band.members.map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c);
    const reading = NoviceMeeting.read(campaign, band, company), world = reading.world, party = campaign.playerActor!;
    if (reading.tolerated) { return []; }
    const setup: Setup = { seed: `${country.seed}:${at.calling}:${at.company}:${band.id}`, company, foes,
      lead: at.ids[0]!, prisoners: world.relates('takesPrisoners')
        && world.test(ModuleWriter.call('takesPrisoners', band.id)),
      place: Environment.encounter(world, party, at.ids, band.id),
      ...reading.moment ? { moment: reading.moment } : {} };
    const stand = NoviceFights.trials(setup, 'stand', run.trials), danger = NoviceFights.odds(stand);
    const said = reading.meeting === 'at once' ? NoviceFights.said(setup) : undefined;
    // Given a turn (a warning, or a sign on the way in), a careful company does not take on what it reckons beyond it.
    const turn = reading.meeting !== 'at once' || reading.signed;
    const careful = turn && NoviceFights.beyond.has(danger) ? NoviceFights.declined(run.trials)
      : NoviceFights.trials(setup, 'careful', run.trials);
    const scopes = ['country', ...band.site && band.site === country.firstRuin ? ['first'] : [],
      ...country.wayIn.includes(band.id) ? ['near'] : [],
      ...band.site && band.site === country.bigRuin ? ['big'] : [],
      ...band.installation !== RegionWriter.id ? ['placed'] : []];
    return [{ seed: country.seed, calling: at.calling, company: at.company, band: band.id, trouble: band.trouble,
      scopes,
      meeting: reading.meeting, ...reading.moment ? { moment: reading.moment } : {},
      ...reading.signed ? { signed: true } : {}, danger, ...said ? { said } : {},
      stand, careful }];
  }
  // A country as the summary keeps it: where the company begins, its first and big ruins, its hire, its bands.
  private static kept(w: Country) {
    return { seed: w.seed, start: w.start, town: w.town, firstRuin: w.sites.find(s => s.id === w.firstRuin),
      bigRuin: w.sites.find(s => s.id === w.bigRuin), hire: w.hire,
      bands: w.bands.map(b => ({ id: b.id, name: b.name, where: b.where, trouble: b.trouble,
        members: b.members.length, minutes: b.minutes })) };
  }
}
if (import.meta.main) { process.exitCode = await NoviceViability.main(process.argv.slice(2)); }
