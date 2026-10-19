import { mkdir } from 'node:fs/promises';
import { PlaySession, type Transcript, type SessionCheckpoint } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { FictionalTime } from '../src/presentation/fictional-time';

export class SerewaterRecord {
  static readonly out = 'doc/playtests/serewater';
  static async dossier(manifest: string, seed: string, name: string) {
    const s = await PlaySession.start(manifest, seed, NodeBundleSource.shared);
    await Bun.write(`${this.out}/${name}.dossier.json`, JSON.stringify({
      manifest, seed, provenance: { module: 'data/serewater/module.json', source: 'data/serewater/serewater.kyr',
        construction: 'data/serewater/templates.json', tables: 'data/serewater/tables.json',
        creatureConstructor: 'data/default/templates/deem.templates.json', itemCatalog: 'data/canon/items.json' },
      provenanceScope: 'Package source index and frozen resulting references, not a complete per-expression trace',
      creatures: s.campaign.state.creatures, actors: s.campaign.actors, entities: s.campaign.module.entities,
      facts: s.campaign.world.snapshot, outcomes: s.campaign.state.outcomes,
    }, null, 2));
    await Bun.write(`${this.out}/${name}.lowered.kyr`,
      ModuleWriter.write({ ...s.campaign.module, actions: s.campaign.schemas }));
  }
  static money(s: PlaySession): number {
    const stocks = new Set(s.campaign.module.entities.filter(e => e.type === 'stock').map(e => e.id));
    return s.campaign.state.creatures.reduce((sum, c) => sum + c.state.gold, 0)
      + s.campaign.world.snapshot.measures.filter(m => m.call.name === 'quantity'
        && m.call.args[1] === 'gold' && stocks.has(m.call.args[0]!)).reduce((sum, m) => sum + m.value, 0);
  }
  static async history(kind: string) {
    const transcript = await Bun.file(`${this.out}/${kind}.browser.replay.json`).json() as Transcript;
    const checkpoint = await Bun.file(`${this.out}/${kind}.browser.save.json`).json() as SessionCheckpoint;
    const s = await PlaySession.start(transcript.scenario, transcript.seed, NodeBundleSource.shared, transcript.party);
    const money = this.money(s);
    let text = `# ${kind}: actual browser history\n\nSeed ${transcript.seed}. ${FictionalTime.at(0)}.\n\n`;
    for (const step of transcript.steps) {
      const before = PlayerView.observe(s.campaign);
      await s.replay([step]);
      const event = s.campaign.events.at(-1)!;
      const result = ActionFeedbackView.read(s.campaign, event, before);
      text += `> ${result.attempt} — ${result.time}\n\n${result.result}\n\n`;
      for (const line of [...result.resources, ...result.discoveries, ...result.immediate, ...result.observations]) {
        text += `${line}\n\n`;
      }
    }
    if (s.canonical() !== PlaySession.resume(checkpoint).canonical()) { throw new Error(`${kind} checkpoint mismatch`); }
    if (money !== this.money(s)) { throw new Error(`${kind} currency was not conserved`); }
    await Bun.write(`${this.out}/${kind}.md`, text);
    const child = Bun.spawn(['bun', 'bin/kyrie.ts', 'replay', `${this.out}/${kind}.browser.replay.json`],
      { stdout: 'pipe', stderr: 'pipe' });
    const [actual, error, code] = await Promise.all([new Response(child.stdout).text(),
      new Response(child.stderr).text(), child.exited]);
    if (code || actual.trim() !== s.canonical()) { throw new Error(`${kind} CLI mismatch: ${error}`); }
    return { kind, seed: transcript.seed, commands: transcript.steps.length,
      time: FictionalTime.at(s.campaign.state.elapsed),
      money, conserved: true, cliBrowserMatch: true, outcomes: s.campaign.state.outcomes,
      party: s.campaign.state.creatures.filter(c => s.campaign.state.partyIds.includes(c.id)),
      sourceDecisions: s.campaign.events.flatMap(e => e.npc) };
  }
  static async run() {
    await mkdir(this.out, { recursive: true });
    for (const [manifest, seed, name] of [
      ['data/serewater/campaign.json', 'serewater', 'autumn'],
      ['data/serewater/campaign.json', 'drizzle', 'drizzle'],
      ['data/serewater/rain.campaign.json', 'downpour', 'late-autumn'],
    ]) { await this.dossier(manifest!, seed!, name!); }
    const evidence = [];
    for (const kind of ['fellowship', 'hired']) { evidence.push(await this.history(kind)); }
    await Bun.write(`${this.out}/comparison.json`, JSON.stringify(evidence, null, 2));
    console.log('Recorded three frozen dossiers and two browser/CLI-verified histories; currency conserved.');
  }
}
if (import.meta.main) { await SerewaterRecord.run(); }
