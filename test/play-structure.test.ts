import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { ChoiceList } from '../src/ui/choice-list';
import { Travel } from '../src/session/travel';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { RegionRecruits } from '../src/world/region-recruits';
import type { Region, Settlement } from '../src/world/region-writer';
import type { CreatureStore } from '../src/creature-store';
import { Standing } from '../src/ui/standing';
import { WorldAssembler } from '../src/world/world-assembler';
import { GeneratedWorld } from './support/generated';

// What the play-structure investigation of 6596e18 found in ordinary play, held here: a way that goes one way only
// says so, and a journey does not take it unasked (PT-17); a journey goes on past those who let the company by
// (PT-16); a risk that fails says who fell, and to what (PT-21); a mage in the dark can cast the light they have
// (PT-06); a warrior starts in mail (PT-38); and a recruit whose people cannot take their calling's class takes one
// near it (PT-13).
class Played {
  static readonly two = [{ name: 'Ama', raceId: 'human', classId: 'warrior' },
    { name: 'Bo', raceId: 'human', classId: 'warrior' }];
  static start(body: string, party: object[] = this.two) {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ps/site.kyr': `Module ps "Played" { Place field "the field" is wilderness. ${body} Goal false. }`,
      'ps/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ps.campaign.json': JSON.stringify({ version: 1, name: 'ps', modules: [{ id: 'p', bundle: 'ps/module.json' }],
        party }) });
    return PlaySession.start(source.resolve('ps.campaign.json'), 'ps', source);
  }
  static place(s: PlaySession, name: string) { return s.campaign.module.entities.find(e => e.name === name)!.id; }
  // The traveller at an inn, a scholar of the given people.
  static scholar(folk: string): string {
    return RegionRecruits.traveller({ id: 's1', name: 'Tapton', calling: 'scholar', traveller: 'Pim Ashdown', folk } as
      unknown as Settlement, 0, { ancestry: 'human' } as unknown as Region)[0]!;
  }
  // Walks the ways named, one after another, so that the company knows them.
  static async walk(s: PlaySession, ...ways: string[]) {
    for (const way of ways) {
      const id = this.place(s, way);
      await s.perform(PlayerView.choices(s.campaign).find(c => c.choice.id.startsWith(`go(${id},`))!.choice.id);
    }
  }
  static go(s: PlaySession, to: string) {
    return Travel.go({ campaign: s.campaign, perform: command => s.perform(command) }, this.place(s, to));
  }
}

describe('a way that goes one way only', () => {
  const body = `Place start "the gallery" is room within field at 0, 0 outdoors.
    Place top "the top of the pipe" is room within field at 1, 0 outdoors.
    Place bottom "the bottom of the pipe" is room within field at 2, 0 outdoors.
    Passage stair "the stair" is path between start and top.
    Passage pipe "the great pipe" is path between top and bottom one way.
    Company party "You" of 2 at start.`;
  it('says so by its own name, and asks again before it is taken', async () => {
    const s = await Played.start(body);
    await Played.walk(s, 'the stair');
    const down = ChoiceList.all(ChoiceList.explore(ScreenModel.build(s.campaign)))
      .find(c => c.command?.startsWith('go(') && c.command.includes('pipe'))!;
    expect(down.label).toContain('by the great pipe');
    expect(down.grave).toBe('There is no coming back this way.');
  }, 60000);
  it('is not taken by a journey: the journey stops before it', async () => {
    const s = await Played.start(body);
    await Played.walk(s, 'the stair', 'the stair');
    const done = await Played.go(s, 'the bottom of the pipe');
    expect([done.arrived, done.stopped, done.legs.length]).toEqual([false, 'There is no coming back by the great pipe', 1]);
  }, 60000);
});

describe('a journey', () => {
  // Hobs parleyed with stopped every journey past them, as danger.
  it('goes on past those who let the company by', async () => {
    const s = await Played.start(`Place a "the first room" is room within field at 0, 0 outdoors.
      Place mid "the middle room" is room within field at 1, 0 outdoors.
      Place c "the far room" is room within field at 2, 0 outdoors.
      Passage ab "the first track" is path between a and mid.
      Passage bc "the second track" is path between mid and c.
      Company party "You" of 2 at a.
      Person hobs "the hobs" at mid { Role "hobs at their ease". Ancestry goblin. Calling thief. Level 1. Numbers 2. }
      Initially Assert tolerates(hobs, party).`);
    await Played.walk(s, 'the first track', 'the second track', 'the second track', 'the first track');
    const done = await Played.go(s, 'the far room');
    expect([done.arrived, done.stopped, done.legs.length]).toEqual([true, undefined, 2]);
  }, 60000);
  // Faced down, the robbers stayed with the same options, and nothing showed what had changed (PT-32).
  it('shows a band that lets the company by as doing so', async () => {
    const s = await Played.start(`Place a "the first room" is room within field at 0, 0 outdoors.
      Company party "You" of 2 at a.
      Person hobs "the hobs" at a { Role "hobs at their ease". Ancestry goblin. Calling thief. Level 1. Numbers 2. }
      Initially Assert tolerates(hobs, party).`);
    const hobs = ScreenModel.build(s.campaign).people.find(p => p.name.startsWith('the hobs'))!;
    expect(hobs.note).toBe('letting you by');
  }, 60000);
  // Warned off, the robbers stayed where they stood (PT-32): one with somewhere to go gives ground and goes there.
  it('sends a band that is warned off back to where it keeps, in its own words', async () => {
    const s = await Played.start(`Place a "the first room" is room within field at 0, 0 outdoors.
      Place den "the den" is room within field at 1, 0 outdoors.
      Passage track "the track" is path between a and den.
      Company party "You" of 2 at a.
      Person hobs "the hobs" at a { Role "hobs on the road". Ancestry goblin. Calling thief. Level 1. Numbers 2.
        Temperament territorial. Refuge den. }
      Initially Assert warnedOff(hobs, party). Initially Assert tolerates(hobs, party).`);
    const event = await s.perform('wait');
    expect(s.campaign.world.one('at', Played.place(s, 'the hobs'))).toBe(Played.place(s, 'the den'));
    expect(event.perceptions?.map(p => p.text)).toContainEqual(expect.stringMatching(/^The hobs give ground/));
  }, 60000);
});

describe('a risk that fails', () => {
  it('says who fell, to what, and what follows', async () => {
    const s = await Played.start(`Place near "the near bank" is room within field at 0, 0 outdoors.
      Place far "the far bank" is room within field at 1, 0 outdoors.
      Passage ford "the ford" is path between near and far.
      Company party "You" of 2 at near.
      Hazard torrent "the torrent" means "Deal (100) bludgeoning damage to ally.".
      Thing water "deep water" on ford {
        State high dangerous "The river runs high over the ford.".
        State fallen "The river has fallen.".
        Hurts with torrent when high then fallen.
      }`);
    const risk = PlayerView.choices(s.campaign).find(c => /^Risk deep water.*; Ama goes first/.test(c.choice.name))!;
    const done = await s.perform(risk.choice.id);
    expect(done.response).toContain('The torrent brings Ama down, and the company does not cross.');
    expect(done.response).not.toContain('exposed adventurer');
  }, 60000);
});

describe('in the dark', () => {
  it('a mage can cast the light they have prepared, where the dark is', async () => {
    const s = await Played.start(`Place cellar "the cellar" is room within field at 0, 0 underground.
      Company party "You" of 1 at cellar. Initially Assert unlit(cellar).`,
      [{ name: 'Osric', raceId: 'human', classId: 'mage' }]);
    const screen = ScreenModel.build(s.campaign);
    expect(screen.dark).toBe(true);
    const cast = ChoiceList.all(ChoiceList.explore(screen)).find(c => c.label === 'Osric: cast Light')!;
    expect(cast.command).toMatch(/^field_spell\(.*conjure_light/);
    await s.perform(cast.command!);
    expect(ScreenModel.build(s.campaign).dark).toBe(false);
  }, 60000);
});

describe('a start', () => {
  // Plate at the start made ordinary foes harmless ("a common foe needs 20"): plate is something to buy.
  it('puts a warrior in mail, never plate', () => {
    const worn = Array.from({ length: 40 }, (_, i) => new Content(`mail${i}`)
      .createCreature('w', { raceId: 'human', classId: 'warrior' }))
      .map(c => c.state.inventory?.find(i => i.equipped && Canon.items[i.definition]?.armor)?.definition);
    expect(new Set(worn)).toEqual(new Set(['ring', 'scale', 'chainmail']));
  });
  // A halfling scholar came as a warrior.
  it('gives a recruit whose people cannot take their calling\'s class one near it', () => {
    expect(['halfling', 'dwarf', 'elf'].map(folk => /Calling (\w+)\./.exec(Played.scholar(folk))?.[1]))
      .toEqual(['bard', 'cleric', 'mage']);
  });
});

describe('one of the company who is down', () => {
  // A healer could not heal a companion down outside a fight, and the page did not say why (PT-19).
  it('is said to be senseless, with what follows; and dead, with what would bring them back', async () => {
    const s = await Played.start('Place yard "the yard" is room within field at 0, 0 outdoors. Company party "You" of 2 at yard.');
    const store = (s.campaign as unknown as { creatures: CreatureStore }).creatures, bo = s.campaign.state.partyIds[1]!;
    const lease = store.acquire([bo]);
    try { lease.creatures[0]!.state.hp = 0; lease.commit(lease.creatures); } finally { lease.release(); }
    await s.perform('wait');
    expect(ScreenModel.build(s.campaign).party.map(m => m.fallen)).toEqual([undefined, Standing.senseless]);
    const again = store.acquire([bo]);
    try {
      again.creatures[0]!.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' });
      again.commit(again.creatures);
    } finally { again.release(); }
    await s.perform('wait');
    expect(ScreenModel.build(s.campaign).party[1]!.fallen).toBe(Standing.dead);
  }, 60000);
});

describe('a warning', () => {
  // Its patience, the rest of the watch, was spent silently by reading and looking until they came on (PT-39).
  it('says, on whatever would take the company past it, who will not wait for it', async () => {
    const s = await Played.start(`Place out "the hillside" is room within field at 0, 0 outdoors.
      Place den "the den" is room within field at 1, 0 outdoors.
      Passage mouth "the den's mouth" is path between out and den.
      Company party "You" of 2 at out.
      Person wolves "the wolves" at den { Role "wolves at their den". Species wolf. Numbers 2. Temperament territorial.
        Warns "Two wolves stand up out of the bracken by the den, hackles up, growling.". Comes "The wolves come at you.". }`);
    await Played.walk(s, "the den's mouth");
    const screen = ScreenModel.build(s.campaign), warned = screen.warned!;
    expect(warned.by).toBe('the wolves');
    const choices = ChoiceList.all(ChoiceList.explore(screen)).filter(c => c.command);
    const marked = choices.filter(c => c.note?.includes('The wolves will not wait for it'));
    expect(marked.length).toBeGreaterThan(0);
    expect(choices.every(c => marked.includes(c) === ((c.minutes ?? 0) >= warned.left))).toBe(true);
  }, 60000);
});

describe('a night in the open', () => {
  // A mage of four hit points lost one to a night on a pass, the Muzgavor in seed2, unwarned (PT-41).
  it('says what it costs before the camp is made, where the cold comes down after dark', async () => {
    const w = await WorldAssembler.assemble('seed2', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Osric', raceId: 'human', classId: 'mage' }] });
    const s = await PlaySession.start(w.path, 'seed2', w.source);
    GeneratedWorld.put(s, 's1_s3_way');
    await s.perform('wait');
    const camp = ScreenModel.build(s.campaign).camp.flatMap(a => a.children ?? [a]).find(a => a.command?.startsWith('camp('));
    expect(camp?.grave).toMatch(/^The cold on the \S+ comes down after dark, and there is no shelter here\.$/);
    // After dark, the way onto it says so too (the laboratory's mage walked onto it at two hit points, and died).
    GeneratedWorld.put(s, 's1_green');
    await s.perform('wait_for_dark');
    const onto = ChoiceList.all(ChoiceList.explore(ScreenModel.build(s.campaign)))
      .find(c => c.command?.startsWith('go(') && c.command.endsWith(',region__s1_s3_way)'));
    expect(onto?.grave).toMatch(/^The cold on the \S+ is down already, and there is no shelter there\.$/);
  }, 60000);
});
