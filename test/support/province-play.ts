import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { PlayerView } from '../../src/presentation/player-view';
import { WorldAssembler } from '../../src/world/world-assembler';
import { Frontier } from '../../src/world/frontier';
import type { DeemValue } from 'deem';
import type { CreatureGenerationContext } from '../../src/content';
import { GeneratedWorld } from './generated';

// An authored adventure in a drawn world, as a province of its first country (Mission 18's Gate B: one country, every
// adventure in it): the world begun, the company told of the adventure by whoever keeps travellers in one of its
// towns, walked by the road to its way in, the adventure installed there, and gone in by its entry.
export class ProvincePlay {
  static async enter(seed: string, id: string, options: { origin?: string; region?: Record<string, DeemValue>;
    party?: CreatureGenerationContext[] } = {}) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, options);
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const told = await this.ask(s, id);
    await GeneratedWorld.travel(s, `gate_${id}`);
    await new Frontier(seed, NodeBundleSource.shared).expand(c);
    const rid = `p${id}`, entry = PlayerView.choices(c).find(x => x.choice.id.startsWith('go(')
      && x.choice.id.includes(`,${rid}__`));
    const went = entry ? await s.perform(entry.choice.id) : undefined;
    // What coming in told: the place's own lines and whatever else was perceived on arriving.
    const came = [went?.response ?? '', ...(went?.perceptions ?? []).map(p => p.text)].join(' ');
    return { w, s, c, told, came, rid, k: (x: string) => `${rid}__${x}` };
  }
  // What whoever keeps travellers in the nearest town that tells of it says of the adventure, asked.
  static async ask(s: PlaySession, id: string): Promise<string> {
    const c = s.campaign, topic = c.module.actions.find(a => a.id.startsWith(`region__gate_${id}_beyond_told_`));
    if (!topic) { return ''; }
    await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!.replace(/^region__/, ''));
    const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id));
    return choice ? (await s.perform(choice.choice.id)).response ?? '' : '';
  }
}
