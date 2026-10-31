import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang/module-writer';
import { FictionalTime } from '../src/campaign/fictional-time';
import { Hours } from '../web/reader/hours';
import { MapCard } from './support/map-card';
import { Countries } from '../src/world/countries';
import { MapPlay } from './support/map-play';

// The ways to other countries, set out for from the map (the navigation review: every march-stone and the way into the
// Strewnfield was offered only as "Go across country", which went to the hex beside it, or from the road into the first
// town nowhere at all, so the country beyond was never drawn). Each is set out for by the road, and come to.
describe('setting out from the map', () => {
  it('goes by the road to each march-stone, named for the country beyond, and draws that country there', async () => {
    const j = await MapPlay.start('kite', 'wanderer'), screen = j.screen(), land = screen.region!.land!;
    const stones = land.marks.filter(m => /__(edge_[a-z]+|gate_\w+)$/.test(m.id));
    // The four march-stones, and the way into each of the country's provinces (Gate B: every adventure in it).
    expect(stones.length).toBe(4 + Countries.provinces.length);
    for (const m of stones) {
      const card = MapCard.of(screen, m.id);
      expect([m.id, card.command, card.legs > 0]).toEqual([m.id, `travel:${m.id}`, true]);
    }
    expect(stones.filter(m => /__edge_/.test(m.id)).every(m => m.name.startsWith('the march-stone of '))).toBe(true);
    const east = stones.find(m => m.id === 'region__edge_east')!, done = await MapPlay.go(j, east.id);
    expect([done.arrived, MapPlay.at(j)]).toEqual([true, east.id]);
    expect(j.campaign.installed).toContain('x1y0');
    const faenn = j.campaign.module.entities.find(e => e.id === 'x1y0__region')!.name;
    expect(east.name).toBe(`the march-stone of ${faenn}`);
    // Its ways say where they go: over the march to the stone named for the country it comes from, and the country
    // about (not "To among …").
    const ways = j.choices().map(c => c.label), home = j.campaign.module.entities.find(e => e.id === 'region__region')!;
    expect(ways).toContain(`To the march-stone of ${home.name}`);
    expect(ways.filter(l => /^To (among|by|under|over) /.test(l))).toEqual([]);
  }, 240000);
  it('goes across the country from the road into the first town, and never into the sea', async () => {
    const j = await MapPlay.start('kite', 'wanderer'), screen = j.screen(), land = screen.region!.land!;
    const water = land.known.find(c => ['~', 'o'].includes(land.cover[c]!));
    const wet = MapCard.of(screen, `hex:${water}`);
    expect([wet.command, wet.text.includes('There is no going there on foot.')]).toEqual([undefined, true]);
    const dry = land.known.find(c => !['~', 'o'].includes(land.cover[c]!) && c !== land.here)!;
    const card = MapCard.of(screen, `hex:${dry}`);
    expect(card.command).toBe(`travel:${land.tracts}${dry}`);
    const done = await MapPlay.go(j, `${land.tracts}${dry}`);
    expect(done.legs.length).toBeGreaterThan(0);
    expect(done.stopped ?? '').not.toMatch(/^You know no way/);
  }, 240000);
  // With wayfinding the company knows every road and path of the country, and thirty places on the map: each is set
  // out for itself, by the ways it knows, from inside a shop too (the map went to the hex the place stands on, and
  // stopped beside it, or walked through it into the field beyond).
  it('goes to a place known by wayfinding itself, and across country from inside a shop', async () => {
    const j = await MapPlay.start('kite', 'debt'), screen = j.screen(), land = screen.region!.land!;
    expect(screen.place.id).toBe('region__s1_shop');
    // The fellside the lone tower stands on: from the shop, "You know no way on to the fellside north-west of …".
    const across = MapPlay.fork(j, 'kite', 'debt'), hex = land.marks.find(m => m.id === 'region__w9')!.cell;
    expect(MapCard.of(screen, `hex:${hex}`).command).toBe(`travel:${land.tracts}${hex}`);
    expect((await MapPlay.reach(across, `${land.tracts}${hex}`)).arrived).toBe(true);
    for (const m of land.marks.filter(x => ['landmark', 'site'].includes(x.kind)).slice(0, 3)) {
      const card = MapCard.of(screen, m.id), f = MapPlay.fork(j, 'kite', 'debt');
      expect(card.command).toBe(`travel:${m.id}`);
      const done = await MapPlay.reach(f, m.id);
      expect([m.id, done.arrived, MapPlay.at(f)]).toEqual([m.id, true, m.id]);
    }
  }, 300000);
});

// A province is drawn where it is on its country's land: its towns at its way in, where the company is while it is
// in it (Cobble Ring and Lowmere had been drawn by their own grid, in the north-west corner of the country).
describe('a province on the map', () => {
  it('draws the Strewnfield\'s towns at its way in, and the company there while it is inside', async () => {
    const j = await MapPlay.start('kite', 'wanderer');
    const gate = j.screen().region!.land!.marks.find(m => m.id === 'region__gate_strewnfield')!.cell;
    expect((await MapPlay.reach(j, 'region__gate_strewnfield')).arrived).toBe(true);
    expect((await MapPlay.reach(j, 'pstrewnfield__lowmere')).arrived).toBe(true);
    const region = j.screen().region!, W = region.land!.width;
    const towns = region.areas.filter(a => a.id.startsWith('pstrewnfield__') && a.kind === 'settlement');
    expect(towns.map(a => a.id).sort()).toEqual(['pstrewnfield__lowmere', 'pstrewnfield__ring']);
    expect(towns.map(a => a.y * W + a.x)).toEqual([gate, gate]);
    expect(region.land!.here).toBe(gate);
    // From inside it, the country about is set out over from the map: a hex beside its way in is come to.
    const land = region.land!, near = [gate - 1, gate + 1, gate - W, gate + W]
      .find(c => land.known.includes(c) && !['~', 'o'].includes(land.cover[c]!))!;
    expect(await MapPlay.press(j, `hex:${near}`)).toEqual({ to: `region__t${near}`, arrived: true });
  }, 300000);
});

// A journey stops for the night when the world's night falls (nine, as the page's own clock has it), not an hour
// before it (a journey had stopped "Night has come on" at eight, the page still saying evening).
describe('a journey at nightfall', () => {
  it('goes on through the evening and stops when the world is dark', async () => {
    const j = await MapPlay.start('kite', 'wanderer'), c = j.campaign;
    await j.step('^To the ');
    await j.step('=19:00');
    const far = j.screen().roads!.at(-1)!;
    let done = await MapPlay.go(j, far.id);
    for (let k = 0; k < 4 && done.stopped !== 'Night has come on' && !done.arrived && done.legs.length; k++) {
      done = await MapPlay.go(j, far.id);
    }
    expect(done.stopped).toBe('Night has come on');
    expect([c.world.test(ModuleWriter.call('dark')), FictionalTime.dark(c.readout.elapsed)]).toEqual([true, true]);
    // An hour's journey set out on at seven ends before dark.
    expect(Hours.dark((19 - 8) * 6, 60)).toBe('');
  }, 300000);
});
