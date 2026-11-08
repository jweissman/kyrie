import { WorldAssembler, type WorldReport } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { Campaign } from '../campaign/campaign';
import { RegionMeetings } from '../world/region-meetings';
import { RegionTracts } from '../world/region-tracts';
import { RegionGeography } from '../world/region-geography';
import { Terrain } from '../world/land/terrain';

// Generates a region from a seed, selects and situates scenarios, and loads the result as a campaign.
// Usage: kyrie world <seed> [--json] [--terrain forest|marsh|mountain|frost]
// Its meetings are listed too, each stretch by the name the map gives it and the option of
// data/generation/wild/meetings.kyrt drawn there, so that an author who adds a meeting can find one to walk to (journey
// 5 of Mission 19, 7 November: a new meeting could be found only by wandering the map until it was met).
export class WorldTool {
  static describe(report: WorldReport): string[] {
    const r = report.region, lines = [`${r.name}: ${r.terrain}, ${r.ancestry}, faith of ${r.deity} (${r.domain})`];
    for (const s of r.settlements) { lines.push(`  ${s.id} ${s.name} (${s.size}; ${s.trade}); inn: ${s.inn}`); }
    for (const w of r.sites) { lines.push(`  ${w.id} ${w.name} (${w.kind})${report.placements.some(p => p.generated.includes(w.id)) ? ' [generated for a scenario]' : ''}`); }
    lines.push('Eligibility:');
    for (const e of report.eligibility) { lines.push(`  ${e.fits ? 'fits ' : 'no   '} ${e.scenario}${e.why ? ` (${e.why})` : ''}`); }
    lines.push('Placed:');
    for (const p of report.placements) {
      lines.push(`  ${p.instance} <- ${p.scenario}: ${Object.entries(p.bindings).map(([k, v]) => `${k}=${v}`).join(', ')}; modules ${p.modules.join(', ')}`);
      for (const [hook, carriers] of Object.entries(p.carriers)) { lines.push(`    hook ${hook}: told by ${carriers.join(', ')}`); }
    }
    lines.push('Meetings:');
    for (const m of RegionMeetings.meetings(r)) {
      lines.push(`  ${RegionTracts.id(m.cell)} ${RegionTracts.name(r, m.cell)}${WorldTool.near(r, m.cell)}: `
        + `${m.section.group} ${m.section.option}`);
    }
    return lines;
  }
  // How many stretches a meeting lies from its nearest town, as the map counts them.
  static near(r: WorldReport['region'], cell: number): string {
    const land = RegionGeography.atlas(r).land, towns = r.settlements.filter(s => s.cell !== undefined)
      .map(s => ({ name: s.name, d: Terrain.distance(land, s.cell!, cell) })).sort((a, b) => a.d - b.d);
    return towns[0] ? ` (${towns[0].d} from ${towns[0].name})` : '';
  }
  static async main(args: string[]) {
    const seed = args.find(a => !a.startsWith('--')) ?? 'kyr', terrain = args[args.indexOf('--terrain') + 1];
    const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      args.includes('--terrain') ? { region: { terrain: terrain! } } : {});
    if (args.includes('--json')) { console.log(JSON.stringify(world.report, null, 2)); return; }
    console.log(WorldTool.describe(world.report).join('\n'));
    const t = performance.now(), campaign = await Campaign.load(world.path, seed, world.source);
    console.log(`Loaded in ${Math.round(performance.now() - t)} ms: ${campaign.module.entities.length} entities, `
      + `${campaign.installations.length} modules installed.`);
  }
}
