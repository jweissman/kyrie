import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';
import { MenuModel } from '../src/frame/menu-model';
import type { Frame } from '../src/creation/protocol';
import type { Choice } from '../src/ui/choice-list';
import { MenuTree } from '../src/frame/menu-tree';

// An act that exposes one of the company to a hazard is asked about before it is done, as any act that may hurt is
// (CB-01's descent measure, OR-226: heaving the adit's fallen prop alone, its weight a hazard of 1d4 unless a
// strength save, killed a mage of four hit points come out of the badger's bout at two, unasked and unwarned on the
// page; the acts whose changes strike had been asked about, an exposure resolved by the act's own Resolve had not).
const gallery = `
  Place gallery "the gallery" is room at 0, 0.
  Company party "You" of 1 at gallery.
  Thing prop "the fallen prop" at gallery { State down "A prop lies across the drift.". State raised "The prop is up.". }
  Initially Assert state(prop, down).
  Hazard strain "The weight of the prop" means "Deal (1d4) physical damage to ally unless strength save against (12).".
  Action heave(actor: group, lifter: member, site: place) "Heave the prop up; {lifter} takes the weight" {
    Requires able(actor) and at(actor, site) and state(prop, down) and memberOf(lifter, actor) and awake(lifter).
    Resolve expose(strain, lifter).
    On success { Assert state(prop, raised). }
  }
  Action look_about(actor: group, site: place) "Look along the drift" {
    Requires able(actor) and at(actor, site).
  }
  Goal false.`;
const flat = (cs: Choice[]): Choice[] => cs.flatMap(c => [c, ...flat(c.children ?? [])]);
describe('an act that exposes one of the company to a hazard', () => {
  it('is drawn as a risk and asked about before it is done; an act that hurts no one is not', async () => {
    const t = await Tiny.start(gallery);
    const frame = MenuTree.framed({ title: '', screen: t.screen, entries: [], leaf: t.leaf, opening: [], chronicle: [],
      transcript: { steps: [] } } as unknown as Frame);
    // The scene's rows, and each thing's own page (one flat level outside a fight, OR-1295: a thing's acts are its
    // page's): the prop's heave is on the prop's page.
    const scene = flat(MenuModel.build(frame, 'here', []).choices);
    const things = scene.map(c => /^(.+)#look$/.exec(c.id)?.[1]).filter((id): id is string => !!id);
    const pages = things.flatMap(id => flat(MenuModel.build(frame, 'here', [], { attention: { kind: 'thing', id } }).choices));
    const drawn = [...scene, ...pages].filter(c => c.command);
    const heave = drawn.find(c => /heave/.test(c.command!))!, look = drawn.find(c => /look_about/.test(c.command!))!;
    expect(heave.risk).toBe(true);
    expect(heave.marks?.some(m => m.kind === 'trap' && m.ask)).toBe(true);
    expect(look.risk).toBeUndefined();
  });
});
