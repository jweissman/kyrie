import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { Foundings } from '../src/world/founding';
import { SettlementWriter } from '../src/world/settlement-writer';
import type { Region } from '../src/world/region-writer';

// What is said in a settlement fits it. Nothing seen in a place speaks of an inn where it has none, a green where
// its heart is a ford or a pit-head, a shop or a shrine it does not keep: the weather, its people at work, its stories.
// A line that does not fit is mended where it is written (a table, a situation), not where it is shown.
class Fit {
  static readonly checks: [keyof ReturnType<typeof SettlementWriter.rooms> | 'green', RegExp][] = [
    ['taproom', /\b(inn|taproom)\b/i], ['shop', /\bthe shop\b/i], ['shrine', /\bthe shrine\b/i],
    ['green', /\b(the|a) green\b/i]];
  static async misfits(seed: string): Promise<string[]> {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, seed, w.source), region = w.report.region as Region;
    const entities = new Map(s.campaign.module.entities.map(e => [e.id, e]));
    return region.settlements.flatMap((st, i) => {
      const has = { ...SettlementWriter.rooms(region, st), green: Foundings.of(region, i).kind === 'farm' };
      // Said in one of its own places (its heart, its rooms, its workplaces), or of one of its own people.
      const own = (o: { place: string; anchor?: string }) => entities.get(o.place)?.space?.parent === `region__${st.id}`
        || (o.anchor === 'near' && new RegExp(`^region__${st.id}_r\\d+$`).test(o.place));
      return (s.campaign.module.observations ?? []).filter(o => own(o))
        .flatMap(o => this.checks.filter(([room, re]) => !has[room] && re.test(o.text))
          .map(([room]) => `${seed} ${st.id} (${Foundings.of(region, i).kind}) has no ${room}: ${o.id}: ${o.text}`));
    });
  }
}

describe('what is said in a settlement', () => {
  it.each(['thorn', 'a1', 'b2', 'c3', 'e5', 'f6'])('fits it, in %s', async seed => {
    expect(await Fit.misfits(seed)).toEqual([]);
  }, 60000);
});
