import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { LocalObservations } from '../src/campaign/local-observations';

// Text anchored to a place the condition finds (Wapshott's Circus friction 2: written `near` a place, it was accepted
// and never shown, a place standing nowhere): `Observe o at ?g when pitched(?g) "…"`, told where the circus is pitched.
describe('an observation at a place its condition finds', () => {
  it('is told there and nowhere else', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'oa/site.kyr': `Module oa "At" { Place field "Field" is wilderness. Relation pitched(place).
        Place yard "the yard" is room within field at 0, 0. Place lane "the lane" is room within field at 1, 0.
        Passage gap "a gap" between yard and lane. Company party "You" of 1 at yard.
        Initially Assert pitched(lane).
        Observe tents at ?g when pitched(?g) "Striped tents stand in {?g}.". }`,
      'oa/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'oa.campaign.json': JSON.stringify({ version: 1, name: 'oa', modules: [{ id: 'p', bundle: 'oa/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('oa.campaign.json'), 'oa', source);
    const told = () => LocalObservations.read(s.campaign.world, s.campaign.playerActor!).map(o => o.text).join(' ');
    expect(told()).not.toContain('Striped tents');
    await s.perform(`go(p__gap,p__lane)`);
    expect(told()).toContain('Striped tents stand in the lane.');
  }, 60000);
  // A rule heard only near whoever its condition finds (the circus's friction 3: `near ?v` failed to load).
  it('lets a rule be heard near whoever its condition finds', async () => {
    const start = async (where: string) => {
      const source = new OverlayBundleSource(NodeBundleSource.shared, {
        'oh/site.kyr': `Module oh "Near" { Place field "Field" is wilderness. Relation juggler(group). Relation rung(place).
          Place yard "the yard" is room within field at 0, 0. Place lane "the lane" is room within field at 1, 0.
          Passage gap "a gap" between yard and lane. Company party "You" of 1 at yard.
          Person nan "Nan" at ${where} { Peaceable. } Initially Assert juggler(nan).
          Action ring(actor: group, site: place) "Ring the bell" { Requires at(actor, site) and not rung(field).
            On success { Assert rung(field). } }
          Rule juggles near ?j when juggler(?j) and rung(field) says "{?j} juggles three apples." { Retract juggler(?j). } }`,
        'oh/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
          exports: { party: 'party' } }),
        'oh.campaign.json': JSON.stringify({ version: 1, name: 'oh', modules: [{ id: 'p', bundle: 'oh/module.json' }],
          party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
      const s = await PlaySession.start(source.resolve('oh.campaign.json'), 'oh', source);
      const e = await s.perform('p__ring(party,p__yard)');
      return (e.perceptions ?? []).map(p => p.text).join(' ');
    };
    expect(await start('yard')).toContain('Nan juggles three apples.');
    expect(await start('lane')).not.toContain('juggles');
  }, 60000);
});
