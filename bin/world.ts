import { WorldAssembler, type WorldReport } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Campaign } from '../src/campaign/campaign';

// Generates a region from a seed, selects and situates scenarios, and loads the result as a campaign.
// Usage: bun bin/world.ts <seed> [--json] [--terrain forest|marsh|mountain|frost]
class WorldTool {
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
    return lines;
  }
}
const args = process.argv.slice(2), seed = args.find(a => !a.startsWith('--')) ?? 'kyr';
const terrain = args[args.indexOf('--terrain') + 1];
const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, args.includes('--terrain') ? { region: { terrain: terrain! } } : {});
if (args.includes('--json')) { console.log(JSON.stringify(world.report, null, 2)); }
else {
  console.log(WorldTool.describe(world.report).join('\n'));
  const t = performance.now(), campaign = await Campaign.load(world.path, seed, world.source);
  console.log(`Loaded in ${Math.round(performance.now() - t)} ms: ${campaign.module.entities.length} entities, `
    + `${campaign.installations.length} modules installed.`);
}
