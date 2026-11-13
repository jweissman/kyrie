// Scratch (T24-11): as provinces-prof, with the parts inside project, prepare and load timed, and the facts each
// relation holds after each install. N provinces (default 10). Run from the worktree's root.
const W = process.env.W ?? process.cwd();
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { Frontier } = await import(`${W}/src/world/frontier`);
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
const { CreatureFacts } = await import(`${W}/src/campaign/creature-facts`);
const { ModuleBundle } = await import(`${W}/src/campaign/module-bundle`);
const { ModuleInstallations } = await import(`${W}/src/campaign/module-installations`);
const { ModuleAssembly } = await import(`${W}/src/campaign/module-assembly`);
const { ModuleNamespace } = await import(`${W}/src/campaign/module-namespace`);
const { ModuleCompiler } = await import(`${W}/src/lang/module-compiler`);
const { Discovery } = await import(`${W}/src/information/discovery`);
const { RoleRequirements } = await import(`${W}/src/campaign/role-requirements`);
const { LocalKinds } = await import(`${W}/src/canon/local-catalog`);
const { World } = await import(`${W}/src/lang/world`);
const countries = (await import(`${W}/data/adventures/countries.json`)).default;
const N = Number(process.env.N ?? 10);
const t: Record<string, number> = {}, c: Record<string, number> = {};
function wrap(obj: any, name: string, label: string) {
  const f = obj[name]; if (typeof f !== 'function') { console.log(`no ${label}`); return; }
  obj[name] = function (this: unknown, ...a: unknown[]) {
    const s = performance.now(); const r = f.apply(this, a);
    const done = () => { t[label] = (t[label] ?? 0) + performance.now() - s; c[label] = (c[label] ?? 0) + 1; };
    if (r instanceof Promise) { return r.finally(done); } done(); return r;
  };
}
const CF = CreatureFacts as any;
for (const m of ['project', 'group', 'member', 'calling', 'companions', 'swaps', 'lessons', 'feats', 'schooling', 'temperament', 'scope']) wrap(CF, m, `cf.${m}`);
wrap(World.prototype, 'apply', 'world.apply'); wrap(World.prototype, 'holds', 'world.holds');
const MI = ModuleInstallations as any;
for (const m of ['prepare', 'populate', 'admit', 'joined', 'check', 'extended']) wrap(MI, m, `mi.${m}`);
wrap(RoleRequirements, 'validate', 'roles.validate'); wrap(Discovery, 'validate', 'discovery.validate');
wrap(ModuleCompiler.prototype, 'validate', 'compiler.validate');
const MB = ModuleBundle as any;
for (const m of ['load', 'own', 'merge', 'imports', 'shared', 'generated']) wrap(MB, m, `mb.${m}`);
wrap(ModuleAssembly, 'compose', 'assembly.compose'); wrap(ModuleNamespace.prototype, 'draft', 'namespace.draft');
wrap(LocalKinds, 'reclaim', 'kinds.reclaim'); wrap(LocalKinds, 'merge', 'kinds.merge');
const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
const placed = new Set(w.report.region.provinces!.map((p: { country: string }) => p.country));
const ids = (countries.countries as { id: string; province?: boolean }[]).filter(x => x.province && placed.has(x.id)).map(x => x.id);
const count = (name: string) => s.campaign.world.related(name).length;
const kinds = () => s.campaign.module.entities.filter(e => e.type === 'itemkind').length;
const cks = () => s.campaign.module.entities.filter(e => e.type === 'callingkind').length;
console.log(`start: actors ${s.campaign.actors.length} creatures ${s.campaign.creatures.snapshot.length} itemkinds ${kinds()} callingkinds ${cks()} proficient ${count('proficient')} hasCalling ${count('hasCalling')}`);
for (const id of ids.slice(0, N)) {
  for (const k of Object.keys(t)) { delete t[k]; delete c[k]; }
  GeneratedWorld.put(s, `gate_${id}`); const s0 = performance.now(); await frontier.expand(s.campaign);
  console.log(`${id.padEnd(14)} ${Math.round(performance.now() - s0)} ms creatures ${s.campaign.creatures.snapshot.length} itemkinds ${kinds()} callingkinds ${cks()} facts ${s.campaign.world.view.relations.length} proficient ${count('proficient')} hasCalling ${count('hasCalling')} hasAncestry ${count('hasAncestry')}`);
  console.log('   ' + Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v)}/${c[k]}`).join(', '));
}
