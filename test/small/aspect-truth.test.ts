import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import type { Aspect } from '../../src/presentation/glance-types';
import { Attest } from '../../src/presentation/attest';
import { Fold } from '../../src/presentation/fold';

// What each Atlas aspect's mark promises is true of the world (the owner's P0 of 19 November, 100% Atlas trust; the
// lead's addition: folding keeps a container from saying what its rows do not, but not a row from saying what is
// false). One tiny world an aspect: the act the glance witnesses for it, done, does what the mark says; and the same
// world with what the company does not know left unknown lights nothing (the knowledge facade's smallest form,
// AT-07 I8).
// The commands the glance witnesses for an aspect, each a leaf (Fold.of: an opener by its rows).
const lit = (t: Tiny, aspect: Aspect): string[] => [...new Set([...t.glance.acts.map(a => a.choice),
  ...Object.values(t.glance.lenses ?? {}).flatMap(l => l.promoted.map(p => p.choice))]
  .flatMap(id => Fold.of(t.glance, undefined, id, true))
  .filter(l => l.witnesses.some(w => w.aspects.includes(aspect))).map(l => l.id))];
// Whether anything the company is shown is marked with an aspect: the acts, the lenses, a likeness, a way's sensed.
const anywhere = (t: Tiny, aspect: Aspect): boolean => lit(t, aspect).length > 0
  || Object.keys(t.glance.likenesses ?? {}).some(who => Attest.subject(t.glance, who)?.aspects.includes(aspect))
  || (t.glance.sensed ?? []).some(s => s.aspect === aspect);
const command = (t: Tiny, id: string): string => {
  const a = [...t.glance.acts, ...t.glance.acts.flatMap(x => x.inside ?? []).map(i => ({ choice: i.command,
    command: i.command }))].find(x => x.choice === id);
  return a?.command ?? id;
};

describe('an aspect\'s mark is true of the world', () => {
  it('companionship: the act marked can make them one of the company now; a yes barred lights nothing', async () => {
    const world = (when: string) => `
      Place green "the green" is room at 0, 0 outdoors.
      Place taproom "the taproom" is room at 1, 0.
      Passage bell "the Bell's door" is door between green and taproom.
      Company party "You" of 1 at taproom.
      Person ysolde "Ysolde" at taproom { Role "a traveller with a pack". Ancestry human. Peaceable. Pronouns she. }
      Topic ysolde_come with ysolde "Ask Ysolde whether she would come along" when ${when} once {
        Says "'Far enough to see the river,' says Ysolde.".
        On discuss { Assert willing(ysolde, actor). }
      }
      Goal false.`;
    const t = await Tiny.start(world('true'));
    const marked = lit(t, 'companionship');
    expect(marked.length).toBeGreaterThan(0);
    await t.perform(command(t, marked[0]!));
    // Willing now, and a recruiting act there to be done, which makes her one of the company.
    const recruit = t.glance.acts
      .flatMap(a => [a, ...(a.inside ?? []).map(i => ({ choice: i.command, command: i.command }))])
      .find(a => /recruit|come/.test(a.command ?? ''));
    expect(t.world.related('willing').some(r => r.args[0] === 't__ysolde')).toBe(true);
    if (recruit?.command) { await t.perform(recruit.command); }
    expect(JSON.stringify(t.world.related('travelsWith'))).toContain('t__ysolde');
    // Her yes barred (the topic not to be asked): nothing promises her, here or from the green.
    const barred = await Tiny.start(world('false'));
    expect(anywhere(barred, 'companionship')).toBe(false);
    barred.journey.put('party', 't__green');
    expect(anywhere(barred.look(), 'companionship')).toBe(false);
  });
  it('knowledge: the act marked teaches a fact not yet known; one known already lights nothing', async () => {
    const world = (known: boolean) => `
      Place green "the green" is room at 0, 0 outdoors.
      Company party "You" of 1 at green.
      Entity owed: fact "The miller owes the reeve ten coin.".
      ${known ? 'Initially Assert established(owed). Initially Assert knows(party, owed).' : ''}
      Person reeve "Annis the reeve" at green { Role "reeve". Ancestry human. Peaceable. Pronouns she. }
      Topic owing with reeve "Ask Annis who owes what" when true once {
        Says "'The miller,' says Annis.".
        On discuss { Assert knows(actor, owed). }
      }
      Goal false.`;
    const t = await Tiny.start(world(false)), marked = lit(t, 'knowledge');
    expect(marked.length).toBeGreaterThan(0);
    expect(t.world.related('knows').some(r => r.args[1] === 't__owed')).toBe(false);
    await t.perform(command(t, marked[0]!));
    expect(t.world.related('knows').some(r => r.args[1] === 't__owed')).toBe(true);
    expect(lit(await Tiny.start(world(true)), 'knowledge')).toEqual([]);
  });
  it('exploration: the way marked goes somewhere not yet been; once been, it is not', async () => {
    const world = `
      Place moor "the moor" is wilderness at 0, 0.
      Place porch "the porch of the hold" is room within moor at 0, 0 outdoors.
      Place hold "the old hold" is site within moor at 1, 0.
      Place hall "the carved hall" is room within hold at 1, 0 indoors.
      Passage arch "the arch" is door between porch and hall.
      Company party "You" of 1 at porch.
      Goal false.`;
    const t = await Tiny.start(world), marked = lit(t, 'exploration').filter(id => id.startsWith('exit:'));
    expect(marked.length).toBeGreaterThan(0);
    expect(t.screen.exits.find(e => e.id === marked[0])?.visited).not.toBe(true);
    await t.perform(command(t, marked[0]!));
    expect(t.where()).toBe('t__hall');
    // Back out on the porch, the hall been to: the way in is no longer somewhere not yet been.
    t.journey.put('party', 't__porch');
    expect(lit(t.look(), 'exploration').filter(id => id.startsWith('exit:'))).toEqual([]);
  });
  it('danger: a threat is there and the company knows it; one it cannot perceive lights nothing', async () => {
    const world = (seen: boolean) => `
      Place green "the green" is room at 0, 0 outdoors.
      Place yard "the yard" is room at 1, 0 outdoors.
      Passage gate "the gate" is gate between green and yard.
      Company party "You" of 1 at green.
      Person wolf "a grey wolf" at ${seen ? 'green' : 'yard'} { Role "rats, fat and bold". Species rat. Numbers 3. Level 1. }
      Goal false.`;
    const t = await Tiny.start(world(true));
    expect(anywhere(t, 'danger')).toBe(true);
    expect(t.screen.people.some(p => p.id === 't__wolf')).toBe(true);
    const away = await Tiny.start(world(false));
    expect(lit(away, 'danger')).toEqual([]);
  });
  it('payoff: the act marked pays the company', async () => {
    const world = `
      Place green "the green" is room at 0, 0 outdoors.
      Company party "You" of 1 at green.
      Item garnet "a jewelled box" is jeweled_box at green.
      Goal false.`;
    const t = await Tiny.start(world), marked = lit(t, 'payoff');
    expect(marked.length).toBeGreaterThan(0);
    expect(t.world.one('at', 't__garnet')).toBe('t__green');
    await t.perform(command(t, marked[0]!));
    // Taken up: it is the company's now, no longer lying on the green.
    expect(t.world.one('at', 't__garnet')).not.toBe('t__green');
  });
  it('undertaking: the gold step goes toward the followed aim; where they are unknown, it is not decided by their true place', async () => {
    const world = `
      Place hythe "Hythe" is settlement.
      Place green "the green at Hythe" is room within hythe at 0, 0 outdoors.
      Place lane "the back lane" is room within hythe at 0, 1 outdoors.
      Place yard "the churchyard" is room within hythe at 1, 1 outdoors.
      Place crypt "the crypt" is room within hythe at 1, 2 underground 1 down.
      Passage gate "the lych-gate" is gate between green and yard.
      Passage back "the back way" is path between green and lane.
      Passage stair "the crypt stair" is stair between yard and crypt.
      Company party "You" of 1 at green.
      Person dead "the restless dead" at crypt { Role "the dead, up out of their graves". Species zombie. }
      Objective crypt when true toward dead by yard "Lay the dead under {yard}.".
      Goal false.`;
    const t = (await Tiny.start(world)).follow('crypt'), gold = t.glance.acts.filter(a => a.continues);
    expect(gold).toHaveLength(1);
    await t.perform(gold[0]!.command ?? gold[0]!.choice);
    expect(t.where()).toBe('t__yard');
    // Moved where the company has not seen (the back lane): the gold is not led there by where they truly are.
    const moved = (await Tiny.start(world)).follow('crypt');
    moved.journey.put('t__dead', 't__lane');
    const now = moved.look().glance.acts.filter(a => a.continues);
    expect(now.map(a => a.exit ?? a.choice).join(' ')).not.toContain('back');
  });
});
