import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Frontier } from '../src/world/frontier';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// A world that remembers (Mission 16's Gate D): the free play came back down the north road from a Merrowdale seen
// through to an innkeeper who greeted it as anyone, under a notice still offering forty crowns. The dale now marks
// what the country below says of it old news, and the country below says so: the talk where the notice hangs, and,
// told by the company, what the road brought down before it, apart from the company's own part.
describe('coming back from Merrowdale', () => {
  it('finds the talk of it gone old, and the notice taken down when the keeper is told', async () => {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
    const s = await PlaySession.start(w.path, 'thorn', w.source), c = s.campaign;
    const choose = async (re: RegExp) => s.perform(PlayerView.choices(c).find(x => re.test(x.choice.name))!.choice.id);
    // Merrowdale a province of the country (Gate B): its way in on the country's land, the road on into it.
    const word = 'region__gate_longman_beyond';
    await GeneratedWorld.travel(s, 'gate_longman');
    await new Frontier('thorn', NodeBundleSource.shared).expand(c);
    for (const re of [/road on into|road_end|the road's end/i, /Merrow green/, /Hall yard/, /Untie the tarpaulin/, /^Take .*bell-teeth/,
      /to the crest/i]) { await choose(re); }
    expect(c.world.test(ModuleWriter.call('stale', word))).toBe(false);
    await choose(/Give a sack of bell-teeth to the Mower/);
    expect(c.world.test(ModuleWriter.call('stale', word))).toBe(true);
    GeneratedWorld.put(s, 's1_taproom');
    const seen = await s.perform('wait');
    expect((seen.perceptions ?? []).map(p => p.text).join(' ')).toContain('Nobody talks of the forty crowns now');
    expect(PlayerView.choices(c).some(x => /forty crowns in Merrowdale/.test(x.choice.name))).toBe(false);
    const told = await choose(/you have been to Merrowdale/);
    expect(told.response).toContain('There was word of it already');
    expect(ScreenModel.build(c).things.map(t => t.name)).not.toContain('a notice from Merrowdale');
  }, 180000);
});
