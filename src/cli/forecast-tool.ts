// `kyrie forecast`: how each band a campaign can set against the company would go for novices of each calling at
// level one, as many as the campaign's company, as the page reckons a fight before it is joined (DangerSense). An
// author cannot judge a hostile's weight from its catalog name: two owlbears of level 2 killed a level-one company
// (HTH-18), and a cat's paw meant as play (2d6) killed a six-hit-point protagonist (Behind the Wainscot's F9, BTW-09).
// A lint that weighed each foe against the campaign's own company was tried and dropped: forty-five foes were called
// beyond it, footpads a warrior beats among them, since the campaign's company is not the player's. Novices of each
// calling are what a player may bring (SYS-05). It is a forecast, not a finding: a proud band named deadly to fight
// may be meant to be paid.
//   bin/kyrie forecast <campaign.json> [--seed s] [--callings warrior,mage]
import { Canon } from '../canon/canon';
import { Content } from '../content';
import type { Campaign } from '../campaign/campaign';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { ModuleWriter } from '../lang/module-writer';
import { DangerSense, type Danger } from '../presentation/danger-sense';
import { PlaySession } from '../session/play-session';

// One band and what the fight with it would likely be for a company of novices of each calling.
export interface Forecast { band: string; name: string; temperament?: string; by: Record<string, Danger> }
export class ForecastTool {
  static readonly usage = 'usage: kyrie forecast <campaign.json> [--seed s] [--callings warrior,mage]';
  // What a novice cannot take on and live, often: said of a band with a mark.
  static readonly beyond: ReadonlySet<Danger> = new Set<Danger>(['grave', 'deadly']);
  static async main(args: string[]): Promise<number> {
    const path = args.find(a => !a.startsWith('--') && !this.valued(args, a));
    if (!path) { console.error(this.usage); return 1; }
    const callings = (this.flag(args, 'callings') ?? Content.playableClasses.join(',')).split(',').filter(Boolean);
    const forecasts = await this.forecast(path, this.flag(args, 'seed') ?? 'forecast', callings);
    for (const f of forecasts) {
      const marked = Object.values(f.by).some(d => this.beyond.has(d)) ? '!' : ' ';
      const by = callings.map(c => `${c} ${f.by[c] ?? '-'}`).join(' · ');
      console.log(`${marked} ${f.name} (${f.band}${f.temperament ? `, ${f.temperament}` : ''}): ${by}`);
    }
    console.log(`${forecasts.length} bands; ! marks one novices of some calling could well not survive.`);
    return 0;
  }
  // Each band reckoned against novices of each calling, the campaign begun afresh for each.
  // A company of more than one (Thrume's three) is three novices of the calling, as a player's own would be.
  static async forecast(path: string, seed: string, callings: string[]): Promise<Forecast[]> {
    const out = new Map<string, Forecast>(), source = NodeBundleSource.shared;
    const size = (await PlaySession.start(path, seed, source)).campaign.readout.partyIds.length;
    for (const classId of callings) {
      const raceId = Content.playableRaces.find(r => Canon.ancestries[r]?.classes.includes(classId)) ?? 'human';
      const party = Array.from({ length: size }, (_, i) => ({ name: `Wenna${i ? ` ${i + 1}` : ''}`, raceId, classId }));
      const campaign = (await PlaySession.start(path, seed, source, party)).campaign;
      for (const band of this.bands(campaign)) {
        const danger = DangerSense.reckon(campaign, band)?.danger;
        if (!danger) { continue; }
        const f = out.get(band) ?? this.named(campaign, band);
        f.by[classId] = danger;
        out.set(band, f);
      }
    }
    return [...out.values()];
  }
  // The bands that could be fought: not the company's own, nor the peaceable, nor those who take whoever stays
  // without a fight (seizing), nor those that let the company be from the first.
  static bands(campaign: Campaign): string[] {
    const company = campaign.playerActor ?? 'party', holds = this.holds.bind(this, campaign);
    return Object.keys(campaign.readout.inhabitants).filter(g => g !== company
      && !campaign.actors.some(a => a.player && a.id === g) && !holds('peaceable', g)
      && !holds('temperament', g, 'temper_seizing') && !holds('tolerates', g, company)
      && !holds('travelsWith', g, company));
  }
  private static holds(campaign: Campaign, name: string, ...args: string[]): boolean {
    return campaign.world.relates(name) && campaign.world.test(ModuleWriter.call(name, ...args));
  }
  private static named(campaign: Campaign, band: string): Forecast {
    const name = campaign.module.entities.find(e => e.id === band)?.name ?? band;
    const temper = campaign.world.relates('temperament') ? campaign.world.one('temperament', band) : undefined;
    return { band, name, ...temper ? { temperament: temper.replace(/^temper_/, '') } : {}, by: {} };
  }
  private static flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(`--${name}`);
    return i < 0 ? undefined : args[i + 1];
  }
  private static valued(args: string[], a: string): boolean {
    const i = args.indexOf(a);
    return i > 0 && args[i - 1]!.startsWith('--');
  }
}
