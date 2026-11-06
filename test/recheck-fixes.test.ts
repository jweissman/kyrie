import { describe, expect, it } from 'bun:test';
import folk from '../data/generation/scenes/folk.json';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';

// Rows inherited from Mission 18 that the recheck of 6 November found still open, each by the mechanism it named.
class Probe {
  static async module(name: string, text: string) {
    const src = new OverlayBundleSource(NodeBundleSource.shared, {
      [`${name}/site.kyr`]: text,
      [`${name}/module.json`]: JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      [`${name}.campaign.json`]: JSON.stringify({ version: 1, name, modules: [{ id: 'p', bundle: `${name}/module.json` }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    return PlaySession.start(src.resolve(`${name}.campaign.json`), name, src);
  }
}

describe('rows the recheck found still open', () => {
  // OWN-51: the drover's wife had been Tobias and the fever's mother Brottor; the people of a story are named as their
  // own lines say they are, she or he, among their people's given names.
  it('names the people of a story by the pronoun their lines give them', async () => {
    const given = (folk as unknown as { given: Record<string, Record<string, string[]>> }).given;
    const named: [string, string, string][] = [];
    for (const seed of ['d4', 'g7', 'a1', 'kite']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
        party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const s = await PlaySession.start(w.path, seed, w.source), m = s.campaign.module;
      const people = m.entities.filter(x => /(drover__wife|drover__son|fever\d*__mother|fever\d*__sister)$/.test(x.id));
      for (const e of people) {
        const pronoun = /son$/.test(e.id) ? 'he' : 'she';
        const first = e.name.split(/[ ,]/)[0]!;
        named.push([e.id, first, Object.values(given).some(g => g[pronoun]!.includes(first)) ? pronoun : '?']);
      }
    }
    expect(named.length).toBeGreaterThan(1);
    expect(named.filter(([, , said]) => said === '?')).toEqual([]);
  }, 240000);
  // WPC-X05: a rule placing a town's folk had walked a hired recruit out of the company; whoever travels with it goes
  // where it goes, as whoever follows it does.
  it('keeps a recruit with the company when a rule would place them elsewhere', async () => {
    const s = await Probe.module('recruit', `Module recruit "A recruit" {
  Place hall "the hall" is room. Place yard "the yard" is room. Company party "You" of 1 at hall.
  Person bob "Bob" at hall { Role "a carter". Peaceable. Pronouns he. }
  Initially Assert travelsWith(bob, party).
  Rule bob_to_yard when at(party, hall) { Assert at(bob, yard). }
  Goal false.
}`);
    await s.perform('wait');
    expect(s.campaign.world.one('at', 'p__bob')).toBe('p__hall');
  }, 60000);
  // LOR-16: a level declared outdoors (a ship's upper deck) lent its rooms no shelter to the rules, which called them
  // indoors while the page called them outdoors.
  it('takes a room\'s shelter from the nearest place above it that declares one', async () => {
    const s = await Probe.module('deck', `Module deck "A deck" {
  Place sea "the sea" is region. Place ship "the ship" is site within sea.
  Place top "the upper deck" is level within ship outdoors. Place bow "the bow" is room within top.
  Place hold "the hold" is level within ship. Place bilge "the bilge" is room within hold.
  Place book "the book" is wilderness within sea elsewhere. Place leaf "a leaf of it" is room within book.
  Company party "You" of 1 at bow.
  Goal false.
}`);
    const w = s.campaign.world, inside = (p: string) => w.test(ModuleWriter.call('indoors', `p__${p}`));
    expect(['bow', 'bilge', 'leaf'].map(inside)).toEqual([false, true, false]);
  }, 60000);
  // ARV-M8: a failure of the generation setting had become a scenario quietly left out of the world; only nothing
  // fitting is no choice.
  it('says a broken setting, and takes only nothing fitting for no choice', () => {
    const none = (WorldAssembler as unknown as { none(e: unknown): undefined }).none;
    expect(none.call(WorldAssembler, new Error('No matching options in lib[default] for condition: false'))).toBeUndefined();
    expect(() => none.call(WorldAssembler, new Error('Unknown function: nosuchfn'))).toThrow(/Unknown function/);
  });
  // WPC-X06: a story placed in the shared country could not use an Ending, which would have closed the whole book; it
  // is a chapter, as a country beyond a march is.
  it('installs the stories placed in a country as chapters', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const placed = s.campaign.installations.filter(m => /^(quarrel|fever|circus|players|drover)\d*$/.test(m.id));
    expect(placed.length).toBeGreaterThan(1);
    expect(placed.filter(m => !m.chapter).map(m => m.id)).toEqual([]);
  }, 120000);
  // ARV-A9: an action's effect wrote a variable nothing bound, and loaded; what an action writes is what its
  // requirement binds, as a rule's is.
  it('refuses an action that writes what its requirement does not bind', async () => {
    await expect(Probe.module('unbound', `Module unbound "Unbound" {
  Place hall "the hall" is room. Company party "You" of 1 at hall. Relation stale(group).
  Action stir(actor: group) "Stir" { Requires able(actor). On success { Assert stale(?nobody). } }
  Goal false.
}`)).rejects.toThrow(/Action stir writes \?nobody, which its condition does not bind/);
  }, 60000);
});
