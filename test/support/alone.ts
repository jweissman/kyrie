import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import type { CreatureGenerationContext } from '../../src/content';
import { Costs, type Tally } from '../../src/costs';

// One authored situation on its own: its module as the world installs it, on the shared rules, its imports bound to
// a host of a few lines of Kyr instead of a generated country (the owner, 14 November: a targeted scenario, using
// only its required declarations and dependencies). The situation's ids are what a generated world gives it
// (`<id>__<name>`), so a spec of its rules reads the same as one in Westernesse; what only the country can prove (that
// a placement binds it, that its word spreads along the roads) stays in the generated-world specs. `costs` is what the
// start crossed (see Costs): no country drawn, no world composed.
export class Alone {
  private constructor(readonly journey: Journey, readonly costs: Tally) {}
  static async start(o: { id: string; bundle: string; host: string; exports: string[]; imports: Record<string, string>;
    party?: CreatureGenerationContext[]; seed?: string }): Promise<Alone> {
    const mark = Costs.mark(), dir = `alone/${Bun.hash(o.host + o.bundle).toString(36)}`;
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      [`${dir}/host.kyr`]: `Module host "A host for one situation" {\n${o.host}\n}`,
      [`${dir}/module.json`]: JSON.stringify({ version: 1, source: 'host.kyr', rules: ['world'], globals: ['party'],
        exports: Object.fromEntries(['party', ...o.exports].map(e => [e, e])) }),
      [`${dir}/alone.campaign.json`]: JSON.stringify({ version: 1, name: 'One situation alone',
        modules: [{ id: 'host', bundle: 'module.json' }, { id: o.id, bundle: o.bundle,
          imports: Object.fromEntries(Object.entries({ party: 'party', ...o.imports }).map(([role, e]) => [role, `host.${e}`])) }],
        party: o.party ?? [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] }) });
    const session = await PlaySession.start(source.resolve(`${dir}/alone.campaign.json`), o.seed ?? 'alone', source);
    return new Alone(Journey.of(session, true), Costs.since(mark));
  }
}
