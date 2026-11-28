import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Tiny } from '../support/tiny';
import { Consequence, ModuleWriter } from '../../src/lang/index';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Content } from '../../src/content';
import type { DeemValue } from 'deem';
import tables from '../../data/adventures/theemptyseat/tables.json';
import templates from '../../data/adventures/theemptyseat/templates.json';

const source = readFileSync('data/adventures/theemptyseat/expedition.kyr', 'utf8');
const body = source.slice(source.indexOf('{') + 1, source.lastIndexOf('}'));
const fixture = (occupied = true, kept = true) => `
  Place city "the city" is region within imbar.
  Place ward "the ward" is settlement within city at 0, 0.
  Place doors_tower "the Tower of Doors" is building within ward.
  Place palace_kitchen "the palace kitchen" is room within ward at 0, 0 indoors.
  Place guild_hall "the safehouse hall" is room within ward at 0, 0 indoors.
  Place north_gate "the north gate" is room within ward at 0, 0 outdoors.
  Place travellers_room "the travellers' room" is room within ward at 0, 0 indoors.
  Passage kitchen_lane "the kitchen lane" is path between guild_hall and palace_kitchen.
  Company party "You" of 1 at guild_hall.
  Person guildkeeper "Hest" at guild_hall { Role "keeper". Peaceable. }
  Person queen "Nerys" at palace_kitchen { Role "queen". Peaceable. }
  Person courier "Tarian" at palace_kitchen { Role "courier". Peaceable. }
  Person scout "Cadi" at palace_kitchen { Role "scout". Peaceable. }
  Entity refugees: group "the refugee carts".
  Relation siegeSettled(group). Relation approachNamed(group).
  Initially Assert siegeSettled(party). Initially Assert approachNamed(party).
  Initially Assert at(refugees, north_gate).
  Action provisions(actor: group) "Pack the expedition's test provisions" {
    Requires able(actor). Time 0. On success { Increase quantity(actor, rations) by 2. }
  }
  Action packet(actor: group) "Open the received Mathematical packet" {
    Requires able(actor) and at(actor, guild_hall). Time 0.
    On success { Give mathematical_rubbing to actor. }
  }
  ${kept ? `Action remember(actor: group) "Remember the retained royal records" {
    Requires able(actor). Time 0. On success { Assert befell(ri_evidence_kept). }
  }` : ''}
  ${body}
  Initially Assert stationProfile(record_room, ${occupied ? 'inhabited' : 'station_empty'}).
`;
const start = (occupied = true, kept = true, mathematician = true) => Tiny.start(fixture(occupied, kept), {
  party: [{ name: 'Elen', raceId: 'human', classId: 'warrior', level: 3,
    ...mathematician ? { perk: 'mathematician' } : {} }],
  canon: ['imbar', 'inner_earth', 'ri_evidence_kept'], night: 'none',
});
const enter = async (t: Tiny, kept = true) => {
  await t.play("Pack the expedition's test provisions");
  if (kept) { await t.play('Remember the retained royal records'); }
  await t.play('Share the kettle after the first incursion', '=+3',
    'Ask Hest what Mared found', '>t__instrument_landing',
    kept ? 'Compare the retained royal survey' : 'Measure the platform to replace',
    '>t__dry_gallery', 'Test the marked platform', '>t__earth_ledge');
};
const limits = async (t: Tiny, occupied = true, proof = true) => {
  await t.play('>t__dry_gallery', proof ? 'Work out what the marked exchange proves' : "Measure the bowl's journey",
    '>t__record_room', occupied ? 'Ask the resident how many' : 'Read the unguarded station ledger');
};
const object = (v: DeemValue | undefined) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) { throw new Error('Expected generated object'); }
  return v;
};

describe('the unspent door', () => {
  it('demonstrates an actual exchange into Earth without revealing unseen occupancy or promising a safe third socket', async () => {
    const t = await start();
    expect(t.journey.holds('knows', 'party', 'station_limits')).toBe(false);
    await enter(t);
    expect(t.where()).toBe('t__earth_ledge');
    expect(t.where('test_bowl')).toBe('t__earth_ledge');
    expect(t.journey.holds('knows', 'party', 'test_return')).toBe(true);
    expect(t.journey.holds('knows', 'party', 'station_limits')).toBe(false);
    await limits(t);
    expect(t.journey.holds('knows', 'party', 'station_limits')).toBe(true);
    await t.play('Ask what the station resident needs', '>t__lost_alcove', '^Take$', '>t__record_room',
      'Return the household ledger');
    expect(t.journey.holds('carries', 'resident', 'lost_account')).toBe(true);
    expect(t.journey.holds('carries', 'party', 'lost_account')).toBe(false);
    const hp = t.campaign.readout.creatures.find(c => c.id === 't__party_1')!.state.hp;
    await t.play('>t__dry_gallery', 'Force the unproved third socket');
    expect(t.campaign.readout.creatures.find(c => c.id === 't__party_1')!.state.hp).toBeLessThan(hp);
    expect(t.journey.find('Force the unproved third socket')).toBeUndefined();
    expect(t.journey.holds('engineCommitted', 'party')).toBe(false);
    expect(Consequence.census(t.campaign.module).filter(x => x.id.startsWith('t__')
      && !x.id.startsWith('t__home'))).toEqual([]);
  });
  it('lets an ordinary explorer replace burned records, measure the result and withdraw from an empty station', async () => {
    const t = await start(false, false, false);
    await enter(t, false);
    await limits(t, false, false);
    expect(t.where('resident')).toBe('t__station_offstage');
    await t.play('>t__dry_gallery', 'Disconnect the freight feed without');
    const j = Journey.of(PlaySession.resume(t.session.checkpoint()), true);
    await j.play('>t__earth_ledge', '>t__dry_gallery');
    expect(j.holds('engineCommitted', 'party')).toBe(true);
    expect(j.holds('state', 'siege_causeway', 'supported')).toBe(true);
  });
  it('makes a one-use strategic strike move the real support without erasing the earlier incursion', async () => {
    const t = await start();
    await enter(t);
    await limits(t);
    await t.play('>t__instrument_landing', 'Ask Mared for one demonstrated use', '>t__dry_gallery');
    await t.play("Exchange the siege causeway's counterweight");
    expect(t.where('siege_weight')).toBe('t__earth_ledge');
    expect(t.journey.holds('state', 'siege_causeway', 'broken')).toBe(true);
    expect(t.journey.holds('siegeSettled', 'party')).toBe(true);
    expect(t.journey.find("Exchange the siege causeway's counterweight")).toBeUndefined();
    expect(t.journey.find('Use the one loaded exchange')).toBeUndefined();
  });
  it('lets the deadline retire only the strike, leaving a prepared civilian crossing and an exit', async () => {
    const t = await start();
    await enter(t);
    await limits(t);
    await t.play('>t__palace_kitchen', 'Ask Nerys to accept a measured refuge', '>t__instrument_landing',
      'Ask Mared for one demonstrated use', '>t__dry_gallery', '=+48');
    expect(t.journey.find("Exchange the siege causeway's counterweight")).toBeUndefined();
    await t.play('Carry the prepared civilian carts');
    expect(t.where('refugees')).toBe('t__earth_ledge');
    expect(t.journey.holds('state', 'siege_causeway', 'supported')).toBe(true);
    await t.play('>t__earth_ledge', '>t__dry_gallery');
  });
  it('repays an optional courier detour without committing the engine or consuming the war outcome', async () => {
    const t = await start();
    await enter(t);
    await t.play('Trade one meal', 'Ask why the stone-courier', '>t__record_room',
      "Resolve the reserve case's balanced hand", '^Take .*pocket clock', '>t__earth_ledge', 'Return the stopped pocket clock');
    expect(t.journey.holds('carries', 'party', 'carrier_salt')).toBe(true);
    expect(t.journey.holds('carries', 'salt_carrier', 'carrier_clock')).toBe(true);
    expect(t.journey.holds('engineCommitted', 'party')).toBe(false);
    expect(t.journey.holds('knows', 'party', 'station_limits')).toBe(false);
  });
  it('spends one real ration rather than two when an earlier rubbing supplies the calibration', async () => {
    const t = await start();
    await t.play('Open the received Mathematical packet');
    await enter(t);
    await limits(t);
    await t.play('>t__instrument_landing', 'Show Mared a Mathematical rubbing',
      'Ask Mared for one demonstrated use', '>t__dry_gallery');
    const stock = ModuleWriter.call('quantity', 'party', 'rations');
    const before = t.world.number(stock);
    await t.play('Use the compared proof to exchange');
    expect(t.world.number(stock)).toBe(before - 1);
    expect(t.where('siege_weight')).toBe('t__earth_ledge');
  });
  it('selects coherent station profiles, varies narrative and exceeds the explicit procedural delivery-slot floor', () => {
    const setting = Content.settingWith(tables, templates);
    const draws = Array.from({ length: 16 }, (_, n) => new Content(`station-${n}`, setting).generate('seatDrama'));
    const modes = draws.map(v => {
      if (!Array.isArray(v.facts)) { throw new Error('Expected generated facts'); }
      const fact = v.facts.map(object).find(f => f.name === 'stationProfile')!;
      if (!Array.isArray(fact.args)) { throw new Error('Expected profile arguments'); }
      const labels = object(v.labels), casting = object(object(v.casting).resident);
      expect(casting.name).toBe(labels.resident);
      expect(typeof labels.iv_limits).toBe('string');
      return fact.args[1];
    });
    expect(new Set(modes)).toEqual(new Set(['inhabited', 'station_empty']));
    expect(new Content('replay', setting).generate('seatDrama'))
      .toEqual(new Content('replay', setting).generate('seatDrama'));
    const slots = [...source.matchAll(/^\s*(?:Observe\b[^"]*|(?:Says|Result|Otherwise)\s*)"([^"\n]+)"/gm)]
      .map(m => m[1]!);
    const generated = slots.filter(s => /^\{iv_\w+\}$/.test(s));
    expect(slots.length).toBeGreaterThanOrEqual(24);
    expect(generated.length / slots.length).toBeGreaterThanOrEqual(0.4);
    for (const v of draws) {
      const labels = object(v.labels);
      expect(generated.every(s => typeof labels[s.slice(1, -1)] === 'string')).toBe(true);
    }
  });
});
