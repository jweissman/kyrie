// R2 probe: module isolation. Module names are scoped `${id}__name` (ModuleNamespace) unless the name is declared by
// the module's *rules* files, which keep their names. A manifest may name any file as a rules file
// (ModuleBundle.paths: anything not a known rule name resolves as a path). So:
//   (1) B, with its own "rules" file declaring `Relation a__secret(place)` and a Rule over it, reads and writes A's
//       private (unexported) relation.
//   (2) C's own rules redeclare a shared relation (`able`) with another arity: joined by ModuleInstallations.union,
//       which keeps the first and only notes `drifted`. Installed unchecked (as Frontier installs countries), it loads.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { ModuleInstallations } from '../../../../../src/campaign/module-installations';
import { ModuleWriter } from '../../../../../src/lang/module-writer';

const files: Record<string, string> = {
  'ns/a/site.kyr': `Module a "A" { Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
    Place nook "Nook" is room within field at 1, 0. Company party "You" of 1 at room.
    Relation secret(place). Initially Assert secret(nook). Goal false. }`,
  'ns/a/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
  'ns/b/site.kyr': `Module b "B" { Place yard "Yard" is site. Goal false. }`,
  'ns/b/evil.kyr': `Module evil "Evil rules" { Relation a__secret(place). Relation leaked(place).
    Rule wipe when a__secret(?x) { Retract a__secret(?x). Assert leaked(?x). } }`,
  'ns/b/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', 'evil.kyr'] }),
  'ns/c/site.kyr': `Module c "C" { Place yard "Yard" is site.
    Action poke(actor: group, p: place) "Poke" { Requires able(actor, p). Time 1. } Goal false. }`,
  'ns/c/redef.kyr': `Module redef "Redefining rules" { Kind group. Kind place. Kind good. Kind clock.
    Relation able(group, place). }`,
  'ns/c/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['redef.kyr'] }),
  'ns/d/site.kyr': `Module d "D" { Place yard "Yard" is site. Goal false. }`,
  'ns/d/other.kyr': `Module other "D rules" { Relation marker(). Rule wipe when true { Assert marker(). } }`,
  'ns/d/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world', 'other.kyr'] }),
  'ns/ab.campaign.json': JSON.stringify({ version: 1, name: 'ab', modules: [{ id: 'a', bundle: 'a/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
};
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const s = await PlaySession.start(overlay.resolve('ns/ab.campaign.json'), 'seed', overlay); const c = s.campaign;
const secret = () => c.world.test(ModuleWriter.call('a__secret', 'a__nook'));
console.log('A private relation names:', c.module.relations.filter(r => r.name.startsWith('a__')).map(r => r.name));
console.log('before B: a__secret(a__nook) =', secret());
try {
  await c.install({ id: 'b', bundle: overlay.resolve('ns/b/module.json') }, overlay);
  c.execute(c.offered().find(o => o.schema === 'wait')!.id);
  console.log('B installed (checked). after one watch: a__secret(a__nook) =', secret(),
    ' leaked(a__nook) =', c.world.test(ModuleWriter.call('leaked', 'a__nook')), ' rule ids:', (c.module.rules ?? []).map(r => r.id));
} catch (e) { console.log('B refused:', (e as Error).message.split('\n')[0]); }
for (const checked of [true, false]) {
  const t = (await PlaySession.start(overlay.resolve('ns/ab.campaign.json'), 'seed', overlay)).campaign;
  ModuleInstallations.drifted.clear();
  try {
    await t.install({ id: 'c', bundle: overlay.resolve('ns/c/module.json') }, overlay, checked, true);
    console.log(`C installed checked=${checked}: able signature kept =`, JSON.stringify(t.module.relations.find(r => r.name === 'able')),
      ' drifted =', JSON.stringify([...ModuleInstallations.drifted]), ' c__poke requires =', JSON.stringify(t.schemaList.find(a => a.id === 'c__poke')?.requires));
    try { t.offered(); console.log('  offered() ran:', t.offered().length, 'choices'); } catch (e) { console.log('  offered() throws:', (e as Error).message); }
  } catch (e) { console.log(`C refused checked=${checked}:`, (e as Error).message.split('\n')[0]); }
}

{ // (3) D's own rules give a Rule the id of B's (wipe): union by id keeps the first, silently.
  const t = (await PlaySession.start(overlay.resolve('ns/ab.campaign.json'), 'seed', overlay)).campaign;
  await t.install({ id: 'b', bundle: overlay.resolve('ns/b/module.json') }, overlay);
  ModuleInstallations.drifted.clear();
  try {
    await t.install({ id: 'd', bundle: overlay.resolve('ns/d/module.json') }, overlay);
    t.execute(t.offered().find(o => o.schema === 'wait')!.id);
    console.log('D installed (checked). drifted =', JSON.stringify([...ModuleInstallations.drifted]), ' marker() ever asserted =', t.world.test(ModuleWriter.call('marker')),
      ' rules named wipe:', (t.module.rules ?? []).filter(r => r.id === 'wipe').map(r => JSON.stringify(r.effects.map(e => e.call.name))));
  } catch (e) { console.log('D refused:', (e as Error).message.split('\n')[0]); }
}
