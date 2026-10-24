import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';

// What can be taken is not said to be there by words that are always said there. Found by an architecture review
// (F-03): prose that names what moves goes on naming it once it has gone, as a crowbar a miner left was still lying
// in the galleries when the company carried it. Over five worlds, in every site: no observation said whatever the
// world holds ("when true") names, by the word it goes by, a thing that lies where it is said. The great barrow's
// king wore his crown that way, after the crown was taken; it is said while it is so.
describe('what can be taken', () => {
  it('is not named by what is always said where it lies', async () => {
    const found: string[] = [];
    for (const seed of ['a1', 'wren', 'cov7', 'thorn', 'd4']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
        { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const s = await PlaySession.start(w.path, seed, w.source), module = s.campaign.module;
      const at = new Map(s.campaign.world.related('at').map(r => [r.args[0]!, r.args[1]!]));
      const items = module.entities.filter(e => e.type === 'item' && /^region__w\d+/.test(at.get(e.id) ?? ''));
      for (const o of (module.observations ?? []).filter(x => x.when.kind === 'boolean' && x.when.value)) {
        for (const item of items.filter(i => at.get(i.id) === o.place)) {
          const word = item.name.split(' of ')[0]!.split(' ').at(-1)!.replace(/[^A-Za-z-]/g, '');
          if (word.length > 3 && new RegExp(`\\b${word}\\b`, 'i').test(o.text)) { found.push(`${seed} ${o.id}: ${word}`); }
        }
      }
    }
    expect(found).toEqual([]);
  }, 240000);
});
