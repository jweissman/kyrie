import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import type { CampaignEvent } from '../src/campaign/campaign';

// What an author can now say in a few words, played: a clerk's key in his coat; the clerk bought and the key left
// on his desk, lent; that key and no other opening the strongroom; a porter who notices a key taken unlent; a bar
// on one side of a door; a dog that warns and comes, said with the dog; and facts known with no source to read.
class House {
  static start() {
    return PlaySession.start('test/fixtures/counting-house/campaign.json', 'house', NodeBundleSource.shared);
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static async act(s: PlaySession, prefix: string): Promise<CampaignEvent> {
    const id = this.legal(s).find(c => c.startsWith(prefix));
    if (!id) { throw new Error(`Not offered: ${prefix} among ${this.legal(s).join(', ')}`); }
    return s.perform(id);
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static said(e: CampaignEvent) { return [...(e.perceptions ?? []).map(p => p.text), e.response ?? ''].join(' '); }
  // What an author is told when the counting-house, edited badly, does not load.
  static readonly site = 'test/fixtures/counting-house/site.kyr';
  static async broken(edit: (text: string) => string): Promise<string> {
    const base = NodeBundleSource.shared;
    const path = base.resolve(this.site);
    const source = new OverlayBundleSource(base, { [path]: edit(await base.read(path)) });
    try { await PlaySession.start('test/fixtures/counting-house/campaign.json', 'broken', source); } catch (error) {
      return (error as Error).message;
    }
    return 'loaded';
  }
}

describe('the clerk and the key', () => {
  it('keeps the key out of reach in the clerk\'s coat until he is paid to leave it on his desk, lent', async () => {
    const s = await House.start();
    await House.act(s, 'go(world__front_door,world__office)');
    expect(House.legal(s).some(c => c.includes('brass_key'))).toBe(false);
    await House.act(s, 'world__bribe_pim');
    expect(House.holds(s, 'inside', 'world__brass_key', 'world__desk')).toBe(true);
    const taken = await House.act(s, 'take_out(world__brass_key');
    // The porter sees the key go, but Pim lent it: nobody objects.
    expect(House.said(taken)).not.toContain('in your hands');
    expect(House.holds(s, 'hostile', 'world__pim', 'party')).toBe(false);
  });
  it('opens the strongroom to its own key and to no other', async () => {
    const s = await House.start();
    await House.act(s, 'take_item(world__spare_key');
    await House.act(s, 'go(world__front_door,world__office)');
    expect(House.legal(s).some(c => c.includes('strong_lock_unlock'))).toBe(false);
    await House.act(s, 'world__bribe_pim');
    await House.act(s, 'take_out(world__brass_key');
    await House.act(s, 'change_thing(world__strong_lock_unlock');
    await House.act(s, 'go(world__strong_door,world__strongroom)');
    expect(House.holds(s, 'at', 'party', 'world__strongroom')).toBe(true);
  });
  it('makes the clerk object when the company carries his key unlent', async () => {
    const s = await House.start();
    await House.act(s, 'go(world__front_door,world__office)');
    // Lifted without a bribe (the coat put aside by the author's hand): the porter sees it.
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('inside', 'world__brass_key', 'world__coat') },
      { kind: 'assert', call: ModuleWriter.call('inside', 'world__brass_key', 'world__desk') }]));
    // Pim is there, and sees it go himself.
    const taken = await House.act(s, 'take_out(world__brass_key');
    expect(House.said(taken)).toContain("'That is mine.'");
    expect(House.holds(s, 'hostile', 'world__pim', 'party')).toBe(true);
    expect(House.holds(s, 'objected', 'world__pim', 'world__brass_key')).toBe(true);
  });
  it('lets the porter object in his own words while his master is out', async () => {
    const s = await House.start();
    await House.act(s, 'go(world__front_door,world__office)');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'world__pim', 'world__street') },
      { kind: 'retract', call: ModuleWriter.call('inside', 'world__brass_key', 'world__coat') },
      { kind: 'assert', call: ModuleWriter.call('inside', 'world__brass_key', 'world__desk') }]));
    const taken = await House.act(s, 'take_out(world__brass_key');
    expect(House.said(taken)).toContain('The porter looks at the strongroom key in your hands');
    expect(House.holds(s, 'hostile', 'world__pim', 'party')).toBe(true);
  });
});

describe('the counting-house\'s back door, its dog and its porter', () => {
  it('lets the back door\'s bar be lifted only from the office side', async () => {
    const s = await House.start();
    await House.act(s, 'go(world__front_door,world__office)');
    expect(House.legal(s).some(c => c.includes('back_bar_lift'))).toBe(true);
    await House.act(s, 'change_thing(world__back_bar_lift');
    await House.act(s, 'go(world__back_door,world__yard)');
    expect(House.holds(s, 'at', 'party', 'world__yard')).toBe(true);
  });
  it('gives the yard dog its temperament and words in its own declaration', async () => {
    const s = await House.start();
    await House.act(s, 'go(world__front_door,world__office)');
    await House.act(s, 'change_thing(world__back_bar_lift');
    const arrival = await House.act(s, 'go(world__back_door,world__yard)');
    expect(House.said(arrival)).toContain('stands stiff-legged');
    expect(arrival.combat).toEqual([]);
  });
  it('lets a discovery be known with no source to read, and taught by a topic', async () => {
    const s = await House.start();
    expect(House.holds(s, 'knows', 'world__porter', 'world__strongroom_rumour')).toBe(true);
    await House.act(s, 'go(world__front_door,world__office)');
    await House.act(s, 'world__porter_talk');
    expect(House.holds(s, 'knows', 'party', 'world__plain_fact')).toBe(true);
  });
});


describe('what an author is told when a module does not load', () => {
  it('says where the name is declared, and that the shared rules already have it', async () => {
    const message = await House.broken(t => t.replaceAll('street', 'marsh'));
    expect(message).toStartWith(`${House.site}:5: Duplicate entity marsh`);
    expect(message).toContain("'marsh' is already declared by the shared rules at data/rules/core.kyr:");
  });
  it('says when a name is a parameter of a shared rule', async () => {
    const message = await House.broken(t => t.replaceAll('pim', 'lord'));
    expect(message).toStartWith(`${House.site}:16: Parameter shadows entity lord`);
    expect(message).toContain("'lord' is a parameter of a shared rule at data/rules/");
  });
  it('says when the author has given one name to two things', async () => {
    const message = await House.broken(t => t.replace('State open', 'State yard').replace('to open needing', 'to yard needing'));
    expect(message).toContain(`'yard' names two things, at ${House.site}:8 and ${House.site}:41`);
  });
  // Thrume renamed five names, one load at a time (F3); every one that collides is now said at once.
  it('says every name that collides in one load', async () => {
    const message = await House.broken(t => t.replaceAll('pim', 'lord').replace('State open', 'State yard')
      .replace('to open needing', 'to yard needing'));
    expect(message).toContain("'lord' is a parameter of a shared rule at data/rules/");
    expect(message).toContain(`'yard' names two things, at ${House.site}:8 and ${House.site}:41`);
  });
  it('puts a syntax error at its file, line and column', async () => {
    const message = await House.broken(t => t.replace('Peaceable. }', 'Peaceable }'));
    expect(message).toMatch(new RegExp(`^${House.site}:16:\\d+: Invalid Kyr module`));
  });
});
