// Probe: are process-global caches keyed by item-kind id (Items.consumables, CreatureFacts.uses) leaking one campaign's
// local kind into another campaign that declares the same id differently (which LocalKinds explicitly allows)?
// Usage: bun det-kind-cache.ts alone|after
import { PlaySession } from '../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../src/presentation/player-view';

const files: Record<string, string> = {};
for (const [dir, like] of [['a', 'wine'], ['b', 'elixir_of_strength']] as const) {
  files[`det/${dir}/site.kyr`] = `Module det${dir} "Det ${dir}" { Place field "Field" is wilderness.
    Place room "Room" is room within field at 0, 0. Company party "You" of 1 at room.
    Kind tonic "a tonic" like ${like}. Item flask "a flask of tonic" is tonic at room. }`;
  files[`det/${dir}/module.json`] = JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
    exports: { party: 'party' } });
  files[`det/${dir}.campaign.json`] = JSON.stringify({ version: 1, name: dir, modules: [{ id: 'p', bundle: `${dir}/module.json` }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
}
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
async function play(dir: string) {
  const s = await PlaySession.start(overlay.resolve(`det/${dir}.campaign.json`), 'seed', overlay);
  const take = PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith('take_item'))!.choice.id;
  await s.perform(take);
  const uses = PlayerView.choices(s.campaign).map(c => c.choice.id).filter(id => id.startsWith('use_item'));
  let effect = '';
  if (uses[0]) { const e = await s.perform(uses[0]); effect = JSON.stringify(e.combat.map(x => [x.type, (x as {detail?: string}).detail, (x as {ability?: string}).ability, (x as {amount?: number}).amount])); }
  const conds = s.campaign.readout.creatures.filter(c => s.campaign.readout.partyIds.includes(c.id)).map(c => c.state.conditions.map(x => x.id));
  return { dir, uses, effect, conds, canonicalLength: s.canonical().length };
}
const mode = process.argv[2] ?? 'alone';
if (mode === 'after') { console.log('A first:', JSON.stringify(await play('a'))); }
if (mode === 'reverse') { console.log('B first:', JSON.stringify(await play('b'))); console.log('A:', JSON.stringify(await play('a'))); process.exit(0); }
if (mode === 'a') { console.log('A:', JSON.stringify(await play('a'))); process.exit(0); }
console.log('B:', JSON.stringify(await play('b')));
