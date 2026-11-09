import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change, Entity } from '../src/lang/module';
import { ScreenModel } from '../src/ui/screen-model';
import { Spatial } from '../src/spatial';
import { AuthoredLand } from '../src/world/authored-land';
import { MenuModel } from '../web/reader/menu-model';
import { Glanced } from './support/glanced';

// The owner, 9 November: "the world map handles travel between hexes; local navigation handles movement among places
// and structures within the current hex. Enforce this as a structural invariant." In generated countries, from every
// place out of doors (the open country, a road, a town's green and lanes, a site's mouth), nothing the page offers
// (its choices, its ways a step off, Go…'s walks) goes to a place on another cell of the land, read from the land
// itself; such a way is offered as going out to the map, and the map can take it. Authored lands with hexes (the
// circus's Sarn) are held to it too.
describe('a way to another hex is the map’s alone', () => {
  for (const seed of ['kahitude', 'kite']) {
    it(`in ${seed}`, async () => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'kin',
        party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const s = await PlaySession.start(w.path, seed, w.source), g = Glanced.of(s), c = s.campaign;
      const held = c as unknown as { world: { apply(c: Change[]): unknown; one(r: string, a: string): string };
        commit(x: unknown): void };
      const byId = new Map(c.module.entities.map(e => [e.id, e] as [string, Entity]));
      const cell = (id: string) => {
        const line = Spatial.ancestry(byId, id), region = line.findLast(e => e.space?.kind === 'region');
        const land = region && AuthoredLand.of(c.module, region.id);
        if (!land) { return undefined; }
        const at = line.map(e => land.places[e.id]).find(x => x !== undefined);
        return at !== undefined ? `${region.id}:${at}` : line.find(e => land.roads?.[e.id]) ? `road:${id}` : undefined;
      };
      const outdoors = c.module.entities.filter(e => e.type === 'place' && e.space?.shelter !== 'underground'
        && e.space?.kind !== 'room' && cell(e.id) !== undefined).map(e => e.id);
      const crossed: string[] = [], lost: string[] = [];
      for (const p of outdoors) {
        held.commit(held.world.apply([
          { kind: 'retract', call: ModuleWriter.call('at', 'party', held.world.one('at', 'party')) },
          { kind: 'assert', call: ModuleWriter.call('at', 'party', p) }]));
        g.screen = ScreenModel.build(c);
        const m = MenuModel.build(g.frame(), 'here', []), here = cell(p);
        const offered = [...m.choices, ...m.scene?.near ?? [], ...m.scene?.far ?? [], ...m.around ?? []]
          .filter(ch => !m.overland?.has(ch.id));
        for (const ch of offered) {
          const e = g.screen.exits.find(x => x.id === ch.id || ch.id.startsWith(`${x.id}/`));
          const to = e?.destination.id ?? (ch.id.startsWith('travel:') ? ch.id.slice(7) : undefined);
          const there = to && cell(to);
          if (there && there !== here) { crossed.push(`${p} → ${to}: ${ch.label}`); }
        }
        // And each way the page leaves to the map, the map can take: a journey planned there, or its cell to choose.
        const plans = new Set([...g.screen.destinations ?? [], ...g.screen.roads ?? [], ...g.screen.mapped ?? []]
          .map(d => d.id));
        for (const e of g.screen.exits.filter(x => x.crosses && !x.blocked)) {
          if (e.cell === undefined && !plans.has(e.destination.id)) { lost.push(`${p} → ${e.destination.id}`); }
        }
      }
      expect(outdoors.length).toBeGreaterThan(15);
      expect(crossed).toEqual([]);
      expect(lost).toEqual([]);
    }, 300000);
  }
});
