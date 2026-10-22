import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ObservationText } from '../src/lang/observation-text';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// A place is called what a stranger would call it (a lone tower, a grassed mound) until the company learns its name:
// from the people who live near it, or from the name cut over the door of an old site. Thorn: Palusporta, Aenean for
// "marsh gate", is fallen walls in the fen north of Merscheald, where the innkeeper Elinde knows its name.
class Named {
  static async start() {
    const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared);
    return PlaySession.start(w.path, 'thorn', w.source);
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
}

describe('a place the company has not learned the name of', () => {
  it('is said as it is seen, in choices and in text, until someone names it', async () => {
    const s = await Named.start();
    GeneratedWorld.put(s, 's1_taproom');
    await s.perform('wait');
    expect(ObservationText.label(s.campaign.world, 'region__w1')).toBe('the fallen walls');
    expect(Named.names(s)).toContain('Ask Elinde about the fallen walls');
    expect(Named.names(s).some(n => n.includes('Palusporta'))).toBe(false);
    const e = await s.perform('region__w1_asked');
    expect([e.response ?? '', ...(e.perceptions ?? []).map(p => p.text)].join(' ')).toContain('The old tongue: marsh gate.');
    expect(ObservationText.label(s.campaign.world, 'region__w1')).toBe('Palusporta');
    expect(Named.names(s).some(n => n.includes('trouble at Palusporta'))).toBe(true);
  }, 60000);
  it('is named by what is cut over the door of an old site, on arrival', async () => {
    const s = await Named.start();
    GeneratedWorld.put(s, 'w1');
    await s.perform('wait');
    expect(ObservationText.label(s.campaign.world, 'region__w1')).toBe('Palusporta');
  }, 60000);
  it('is written as authored', () => {
    const source = 'Module m "M" {\n  Place hut "Ansel\'s hut" is room seen as "a hut in the trees" until hut_named.\n'
      + '  Discovery hut_named "The hut is Ansel\'s.".\n  Goal false.\n}';
    const hut = ModuleParser.parse(source).entities.find(e => e.id === 'hut')!;
    expect(hut.alias).toEqual({ name: 'a hut in the trees', until: 'hut_named' });
    expect(ModuleWriter.write(ModuleParser.parse(source))).toContain('seen as "a hut in the trees" until hut_named');
  });
});
