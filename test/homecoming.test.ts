import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';

// Bringing home what a deep site's makers died for: the innkeeper who first told of it hears what the company
// brought up, in the site's own words, and keeps it a night on the house. Found when a1's king-barrow was played to
// its heart, the crown came into daylight, and nobody in Murkstede said a word; nor did anyone on the roads, where
// all a traveller had heard was that some stranger had been making themselves useful.
class Home {
  static async start() {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    return PlaySession.start(w.path, 'a1', w.source);
  }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static gold(s: PlaySession) { return s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')); }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events].join(' ');
  }
}

describe('the homecoming', () => {
  it('is told at the inn once the crown is up, and the night after is on the house', async () => {
    // A company that has not heard its name calls the barrow what it looks like.
    const s = await Home.start(), told = /^Tell (.+) what you brought up out of /;
    const keeper = s.campaign.module.actions.find(a => told.test(a.name))?.speaker;
    expect(keeper).toBeDefined();
    const inn = s.campaign.world.related('at').find(r => r.args[0] === keeper)!.args[1]!;
    Home.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', inn) }]);
    expect(Home.names(s).some(n => told.test(n))).toBe(false);
    Home.set(s, [{ kind: 'assert', call: ModuleWriter.call('region__w8_raised') }]);
    expect(await Home.take(s, told)).toContain('on the house');
    expect(Home.names(s).some(n => told.test(n))).toBe(false);
    const gold = Home.gold(s), free = Home.names(s).filter(n => n.endsWith(', on the house'));
    expect(free.length).toBeGreaterThan(0);
    expect(Home.names(s)).not.toContain(free[0]!.replace(/, on the house$/, ''));
    expect(await Home.take(s, new RegExp(`^${free[0]!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)))
      .toContain('nobody will take your coin');
    expect(Home.gold(s)).toBe(gold);
    expect(Home.names(s).some(n => n.endsWith(', on the house'))).toBe(false);
    expect(Home.names(s)).toContain(free[0]!.replace(/, on the house$/, ''));
  }, 90000);
  it('is what everyone on the roads is saying, once it is up', async () => {
    const s = await Home.start();
    const topic = s.campaign.module.actions.find(a => a.id.endsWith('_heart') && a.speaker?.includes('_way_t'))!;
    const at = s.campaign.world.related('at').find(r => r.args[0] === topic.speaker)!.args[1]!;
    Home.set(s, [{ kind: 'assert', call: ModuleWriter.call('at', 'party', at) }]);
    const said = /^Ask .+ what people are saying$/;
    Home.set(s, [{ kind: 'assert', call: ModuleWriter.call('region__renowned', 'party') }]);
    expect(await Home.take(s, said)).toContain('making themselves useful');
    Home.set(s, [{ kind: 'assert', call: ModuleWriter.call('region__w8_raised') }]);
    expect(await Home.take(s, said)).toContain('brought the crown of the first king up into the daylight');
  }, 90000);
});
