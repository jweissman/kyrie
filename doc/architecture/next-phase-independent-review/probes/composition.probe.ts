// Hostile composition probe (review artifact; not a spec). Run: bun doc/architecture/next-phase-independent-review/probes/composition.probe.ts
// Two independently written modules, "bells" and "chimes", use the same local names (a relation `rung`, an action
// `ring` with the same wording, a rule id) and optionally the same local kind id or the same canonical-type entity id.
// They are installed in both orders. Prints what each order produces.
import { PlaySession } from '../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../src/campaign/overlay-bundle-source';
import { PlayerView } from '../../../../src/presentation/player-view';
import { LocalKinds } from '../../../../src/canon/local-catalog';

const base = NodeBundleSource.shared;
type Variant = { kind?: [number, number]; good?: [string, string] };
function bundle(id: 'bells' | 'chimes', first: boolean, v: Variant, i: number): Record<string, string> {
  const other = id === 'bells' ? 'chimes' : 'bells';
  const kind = v.kind ? `Kind brass_bell "a brass bell" is treasure worth ${v.kind[i]}. Item bell_item "a brass bell" is brass_bell at yard.` : '';
  const good = v.good ? `Entity salt: good "${v.good[i]}".` : '';
  const site = `Module ${id} "The ${id}" {
    Place town "${id} town" is settlement.
    Place yard "the ${id} yard" is room within town at 0, 0.
    ${first ? 'Company party "You" of 1 at yard.' : ''}
    Place gate "the ${id} gate" is room within town at 1, 0.
    Passage lane "the ${id} lane" is road between yard and gate taking 5 minutes.
    Relation rung(place).
    ${kind} ${good}
    Action ring(actor: group, site: place) "Ring the bell" {
      Requires company(actor) and at(actor, site) and not rung(site).
      Time 1.
      On success { Assert rung(site). }
      Result "You ring the ${id} bell.".
    }
    Rule answered when rung(yard) says "Across the ${id} yard, something answers the ${id} bell." { Assert rung(gate). }
    Observe yard_scene at yard when not rung(yard) "The ${id} yard is quiet.".
    Observe yard_rung at yard when rung(yard) "The ${id} bell is still humming.".
    Goal false.
  }`;
  return { [`hostile/${id}/site.kyr`]: site,
    [`hostile/${id}/module.json`]: JSON.stringify({ version: 1, source: 'site.kyr', rules: 'world',
      ...first ? { globals: ['party'], exports: { party: 'party', yard: 'yard' } } : { imports: [], exports: { yard: 'yard' } } }) };
}
function campaign(order: ('bells' | 'chimes')[], v: Variant) {
  const files: Record<string, string> = {};
  order.forEach((id, n) => Object.assign(files, bundle(id, n === 0, v, id === 'bells' ? 0 : 1)));
  files['hostile/c.campaign.json'] = JSON.stringify({ version: 1, name: 'Hostile', modules: order.map(id =>
    ({ id, bundle: `${id}/module.json` })), party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] });
  const overlay = new OverlayBundleSource(base, files);
  return { overlay, path: overlay.resolve('hostile/c.campaign.json') };
}
async function run(label: string, order: ('bells' | 'chimes')[], v: Variant) {
  LocalKinds.reset();
  const { overlay, path } = campaign(order, v);
  try {
    const s = await PlaySession.start(path, 'hostile', overlay);
    const choices = PlayerView.choices(s.campaign).map(c => `${c.choice.name}  [${c.choice.id}]`);
    const rings = PlayerView.choices(s.campaign).filter(c => /ring/i.test(c.choice.id));
    let after: string[] = [];
    if (rings[0]) {
      await s.perform(rings[0].choice.id);
      after = s.campaign.world.describe().filter(f => /rung/.test(f));
    }
    const shown = PlayerView.observe(s.campaign).observations.map(o => o.text);
    console.log(JSON.stringify({ label, order, ok: true, choices, performed: rings[0]?.choice.id, rungFacts: after, shown,
      shadows: s.campaign.module.relations.filter(r => /rung/.test(r.name)).map(r => r.name) }, null, 1));
  } catch (e) {
    console.log(JSON.stringify({ label, order, ok: false, error: (e as Error).message.split('\n')[0] }));
  }
}
await run('same local names, bells first', ['bells', 'chimes'], {});
await run('same local names, chimes first', ['chimes', 'bells'], {});
await run('same local kind id, same meaning', ['bells', 'chimes'], { kind: [5, 5] });
await run('same local kind id, different worth', ['bells', 'chimes'], { kind: [5, 7] });
await run('same canonical Good id, different names', ['bells', 'chimes'], { good: ['salt', 'rock salt'] });
