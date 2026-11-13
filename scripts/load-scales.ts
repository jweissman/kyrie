import { readdirSync, readFileSync } from 'node:fs';

// The scales the game can be run at, smallest first, for scripts/load-costs.ts. Each imports what it needs when it is
// asked for (the import is measured), and is then run (the run is measured). The ones that start a session build
// what a client is handed too: the screen, and what is told and led with.
interface Started { campaign: unknown }
const tiny = 'Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.';
const roads = `Module roads "Roads" {
  Kind group. Kind place. Relation at(group, place) exclusive. Relation route(place, place).
  Entity a: group "A". Entity x: place "X". Entity y: place "Y".
  Initially Assert route(x, y). Initially Assert at(a, x).
  Action travel(actor: group, origin: place, destination: place) "Travel to {destination}" {
    Requires at(actor, origin) and route(origin, destination). On success { Assert at(actor, destination). }
  }
  Goal at(a, y).
}`;
export class LoadScales {
  static readonly names = ['kernel', 'rules', 'tiny', 'scenario', 'region', 'full'] as const;
  // What each scale imports, for its import to be measured apart from its run.
  static readonly modules: Record<string, string[]> = {
    kernel: ['../src/lang/module-parser', '../src/lang/module-compiler', '../src/campaign/action-schemas',
      '../src/lang/world'],
    rules: ['../src/lang/module-parser'], region: ['../src/world/world-assembler'],
    tiny: ['../src/campaign/single-module', '../src/session/play-session', '../src/ui/screen-model',
      '../src/presentation/narrator'],
    scenario: ['../src/campaign/node-bundle-source', '../src/session/play-session', '../src/ui/screen-model',
      '../src/presentation/narrator'],
    full: ['../src/world/drawn-world', '../src/campaign/node-bundle-source', '../src/ui/screen-model',
      '../src/presentation/narrator'],
  };
  static async load(name: string): Promise<void> {
    if (!this.modules[name]) { throw new Error(`No scale ${name}: ${this.names.join(', ')}`); }
    for (const m of this.modules[name]) { await import(m); }
  }
  static async run(name: string): Promise<void> {
    if (name === 'kernel') { return this.kernel(); }
    if (name === 'rules') { return this.rules(); }
    if (name === 'region') { return this.region(); }
    return this.session(name);
  }
  // A rule on facts alone: one module parsed and compiled, its actions grounded and tested. No campaign.
  private static async kernel(): Promise<void> {
    const { ModuleParser } = await import('../src/lang/module-parser');
    const { ModuleCompiler } = await import('../src/lang/module-compiler');
    const { ActionSchemas } = await import('../src/campaign/action-schemas');
    const { World } = await import('../src/lang/world');
    const m = new ModuleCompiler().instantiate(ModuleParser.parse(roads), 'roads').module;
    const world = new World(m).apply(m.initial);
    if (!ActionSchemas.ground(m).some(a => world.test(a.requires))) { throw new Error('nothing to do'); }
  }
  // The rules every world loads (data/rules), parsed.
  private static async rules(): Promise<void> {
    const { ModuleParser } = await import('../src/lang/module-parser');
    for (const f of readdirSync('data/rules').filter(x => x.endsWith('.kyr'))) {
      ModuleParser.parse(readFileSync(`data/rules/${f}`, 'utf8'));
    }
  }
  // Deem drawing one country, and nothing written or run.
  private static async region(): Promise<void> {
    const { WorldAssembler } = await import('../src/world/world-assembler');
    WorldAssembler.region('a1', [0, 0]);
  }
  // A tiny Kyr world on the shared rules; one authored adventure alone (Low Water); the whole of Westernesse (a1).
  private static async session(name: string): Promise<void> {
    const { ScreenModel } = await import('../src/ui/screen-model');
    const { Narrator } = await import('../src/presentation/narrator');
    const campaign = (await this.start(name)).campaign as Parameters<typeof ScreenModel.build>[0];
    Narrator.leaf(campaign, ScreenModel.build(campaign));
  }
  private static async start(name: string): Promise<Started> {
    const { PlaySession } = await import('../src/session/play-session');
    const { NodeBundleSource } = await import('../src/campaign/node-bundle-source');
    if (name === 'tiny') {
      const { SingleModule } = await import('../src/campaign/single-module');
      const { source, campaign } = SingleModule.source(tiny);
      return PlaySession.start(campaign, 'tiny', source);
    }
    if (name === 'scenario') { return PlaySession.start('data/campaigns/low-water.campaign.json', 'lw', NodeBundleSource.shared); }
    const { DrawnWorld } = await import('../src/world/drawn-world');
    return DrawnWorld.start('a1', { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
  }
}
