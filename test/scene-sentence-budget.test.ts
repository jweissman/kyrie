import { beforeAll, describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Campaign } from '../src/campaign/campaign';

// A scene's telling on arrival, held to a budget (the owner, 12 November: "a test that fails if average scene
// sentences is more than 3; and a failure on any individual having 5+"). Measured over what a newcomer meets first:
// the opening place and every place of the first town, in two countries, as the page tells them (the place's
// situation and who is here: Narrator.leaf). At M20's close the sample averaged 3.6 sentences, and 20 scenes told five
// or more (a town's heart 23 and 26; the roads out 20–27; the first place 9–10: retrospective/aesthetic-and-play.md),
// so both checks were marked failing. Mission 21 (13 November) tells a place at a glance within three sentences,
// typed by what each observation is (SceneBudget.typed, Narrator's glanced): 2.4 on average, none of five, no clue
// held back; the place whole stays in situation and presence for a deliberate look.
interface Told { place: string; sentences: number }
class Scenes {
  static sentences(lines: string[]): number { return (lines.join(' ').match(/[.!?]['’"”)]*(\s|$)/g) ?? []).length; }
  static told(c: Campaign): Told {
    // What is told at a glance (Narrator's glanced: three sentences, typed by what each observation is; Mission 21),
    // the page's and the terminal's both; the place whole stays in situation and presence for a deliberate look.
    const screen = ScreenModel.build(c), leaf = Narrator.leaf(c, screen), told = leaf.glanced!;
    return { place: `${screen.place.id} (${screen.place.name})`,
      sentences: Scenes.sentences([...told.situation, ...told.presence]) };
  }
  static async sample(seed: string, origin: string): Promise<Told[]> {
    const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, first = Scenes.told(c), here = c.world.one('at', 'party')!;
    const town = /^(region__s\d+)_/.exec(here)?.[1] ?? 'region__s1';
    const places = c.module.entities.filter(e => e.type === 'place' && e.id.startsWith(`${town}_`)
      && e.space?.kind === 'room').map(e => e.id);
    const told = [first];
    for (const place of places) {
      c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
        { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
      told.push(Scenes.told(c));
    }
    return told;
  }
}

describe('a scene told on arrival', () => {
  let told: Told[] = [];
  beforeAll(async () => {
    told = [...await Scenes.sample('a1', 'kin'), ...await Scenes.sample('kahitude', 'debt')];
  }, 240000);
  it('averages three sentences or fewer', () => {
    const average = told.reduce((n, t) => n + t.sentences, 0) / told.length;
    expect(Math.round(average * 10) / 10).toBeLessThanOrEqual(3);
  });
  it('has no scene of five sentences or more', () => {
    expect(told.filter(t => t.sentences >= 5).map(t => `${t.place}: ${t.sentences}`)).toEqual([]);
  });
});
