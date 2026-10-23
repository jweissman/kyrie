import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Foundings } from '../src/world/founding';
import { SettlementWriter } from '../src/world/settlement-writer';
import { Communities } from '../src/world/community/community';
import { PlaySession } from '../src/session/play-session';
import { ScreenModel } from '../src/ui/screen-model';
import type { Region } from '../src/world/region-writer';

// A settlement is what made it. Thorn's country (Faennmeós, a fen) has a harbour town, a village built round the
// makers' well, a village at a ford, a reed-yard and a house of brothers; b2's (Karkatzeh, mountains) a fort holding
// the pass, a crossing, a monastery and a camp of newcomers. Not every place has an inn, a shrine or a shop; each has
// someone who keeps travellers, someone who keeps the god, and someone who sells, wherever they stand.
class Founded {
  static async region(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return { w, region: w.report.region as Region };
  }
}

describe('a settlement is what made it', () => {
  it('is founded for a reason the land gives, and has only what that brings', async () => {
    const { region } = await Founded.region('thorn');
    const kinds = Foundings.all(region).map(f => f.kind);
    expect(new Set(kinds).size).toBeGreaterThanOrEqual(4);
    // A town has all three, always.
    expect(SettlementWriter.rooms(region, region.settlements[0]!)).toEqual({ taproom: true, shrine: true, shop: true });
    // Somewhere has no inn, and somewhere keeps its god by the track.
    expect(region.settlements.some(s => !SettlementWriter.rooms(region, s).taproom)).toBe(true);
    expect(Foundings.all(region).some(f => f.holy === 'wayside')).toBe(true);
    // A crossing is named for it, and its ferry-keeper works at the crossing stones.
    const ford = region.settlements.findIndex((s, i) => Foundings.of(region, i).kind === 'crossing');
    const crossing = Foundings.of(region, ford);
    expect(crossing.heart).toMatch(/^the (ford|bridge-foot) at /);
    expect(crossing.why).toContain(crossing.words.river!);
    const keeper = Communities.plan(region, region.settlements[ford]!).residents.find(r => r.occupation === 'ferryman');
    if (keeper) { expect(keeper.workplace).toBe(`${region.settlements[ford]!.id}_crossing`); }
  }, 60000);
  it('holds a pass with a fort, and keeps travellers in a canteen, a guest-hall or a hayloft where there is no inn', async () => {
    const { region } = await Founded.region('b2');
    const all = Foundings.all(region);
    expect(all.some(f => f.kind === 'fortress' && /^the bailey of /.test(f.heart))).toBe(true);
    expect(all.filter(f => f.keeping !== 'inn').map(f => f.keeping).length).toBeGreaterThan(0);
    // Whoever keeps travellers stands somewhere real, and offers somewhere to sleep.
    for (const s of region.settlements) {
      expect(SettlementWriter.standing(region, s, 'innkeeper')).toMatch(new RegExp(`^${s.id}_(taproom|green)$`));
    }
  }, 60000);
  it('is entered at its heart, which is called what it is', async () => {
    const { w } = await Founded.region('thorn');
    const s = await PlaySession.start(w.path, 'thorn', w.source);
    const into = ScreenModel.build(s.campaign).exits.find(e => e.destination.id.endsWith('_green'))!;
    await s.perform(into.acts[0]!.command!);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.place.id).toMatch(/_green$/);
    expect(screen.place.name).not.toMatch(/ green$/);
    expect(screen.observed.some(o => o.id.endsWith('_why'))).toBe(true);
  }, 60000);
});
