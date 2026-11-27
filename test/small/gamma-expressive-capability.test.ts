import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../../src/lang/index';
import { PlayerView } from '../../src/presentation/player-view';
import { Tiny } from '../support/tiny';

// Each probe on the kernel and the packages it reads (OR-407).
const start: typeof Tiny.start = (kyr, options = {}) => Tiny.start(kyr, { horizon: ['probing', 'belongings', 'making'], ...options });

const yard = (body: string, size = 1) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of ${size} at yard.
  ${body}
  Goal false.`;
const call = (name: string, ...args: string[]) => ModuleWriter.call(name, ...args);
const inventory = (t: Tiny) => t.campaign.readout.creatures.flatMap(c => c.state.inventory ?? [])
  .map(i => i.definition);

describe('Gamma expressive capability probes', () => {
  it('keeps a compound\'s authored component facts, but not component ownership', async () => {
    const t = await start(yard(`
      Kind part.
      Relation componentOf(part, item).
      Relation fragile(part). Relation combustiblePart(part).
      Item lamp "a shuttered lantern" is lantern at yard.
      Entity globe: part "the lantern's glass globe".
      Entity wick: part "the lantern's wick".
      Initially Assert componentOf(globe, lamp). Initially Assert fragile(globe).
      Initially Assert componentOf(wick, lamp). Initially Assert combustiblePart(wick).
      Action shade(actor: group) "Shade the lantern's glass" {
        Requires able(actor) and company(actor) and componentOf(globe, lamp)
          and fragile(globe) and componentOf(wick, lamp) and combustiblePart(wick).
        Result "The glass is shaded without touching the wick.".
      }`));
    const take = t.journey.choices().find(c => /^take_item\(/.test(c.command)
      && c.command.includes('t__lamp'))!;
    await t.perform(take.command);
    expect(t.world.test(call('t__componentOf', 't__globe', 't__lamp'))).toBe(true);
    expect(t.world.test(call('t__fragile', 't__globe'))).toBe(true);
    expect(t.world.test(call('t__combustiblePart', 't__wick'))).toBe(true);
    expect(t.world.related('ownedItem', 't__globe')).toEqual([]);
    await t.play("Shade the lantern's glass");
  });

  it('changes one item state while its catalog identity remains unchanged', async () => {
    const t = await start(yard(`
      Item blade "a plain longsword" is longsword at yard {
        State plain "The blade is plain steel.".
        State bright "A blue word runs along the blade.".
        Change enchant "Lay the star-word on the longsword" from plain to bright.
      }
      Action cross_ward(actor: group) "Cross the silver ward with the star-worded blade" {
        Requires able(actor) and company(actor) and state(blade, bright).
        On success { Assert wardCrossed(actor). }
      }
      Relation wardCrossed(group).`));
    const item = 't__blade';
    const kind = t.world.one('itemKind', item);
    expect(t.journey.choices().some(c => c.label.includes('Cross the silver ward'))).toBe(false);
    await t.play('Lay the star-word on the longsword');
    expect(t.world.one('state', item)).toBe('t__bright');
    expect(t.world.one('itemKind', item)).toBe(kind);
    expect(t.journey.choices().some(c => c.label.includes('Cross the silver ward'))).toBe(true);
  });

  it('mixes two distinct materials into an item with a catalog effect', async () => {
    const t = await start(yard(`
      Item oil "a flask of lamp oil" is lamp_oil at yard.
      Item rag "a strip of linen" is bandages at yard.`));
    for (const id of ['oil', 'rag']) {
      const take = t.journey.choices().find(c => /^take_item\(/.test(c.command)
        && c.command.includes(`t__${id}`))!;
      await t.perform(take.command);
    }
    const make = PlayerView.choices(t.campaign).find(c => c.choice.id.startsWith('make_plain('))!;
    await t.perform(make.choice.id);
    expect(inventory(t)).toContain('oil_firebomb');
    expect(inventory(t)).not.toContain('lamp_oil');
    expect(inventory(t)).not.toContain('bandages');
  });

  it('deduces a new inquiry from two learned observations', async () => {
    const t = await start(yard(`
      Discovery mud "The river mark is fresh mud, not old silt.".
      Discovery scratch "The scratches are too low for a cart and too broad for a boot.".
      Discovery drag "Something heavy was dragged to the river in the night.".
      Observe mark at yard when true "A pale lip of fresh mud lies on the landing-stone." teaches mud.
      Thing reeds "the reed screen" at yard {
        State shut "Reeds hide the bank below.".
        State open "The screen is lifted from the bank.".
        Change lift "Lift the reed screen" from shut to open.
      }
      Observe scrape at yard when state(reeds, open)
        "Below the reeds, paired scrapes run into the water." teaches scratch.
      Action inquire(actor: group) "Ask who dragged the weight to the river" {
        Requires company(actor) and knows(actor, mud) and knows(actor, scratch).
        Result "Together, the mud and the scrapes are a question worth putting to the ferryman.".
      }`));
    expect(t.journey.choices().some(c => c.label.includes('Ask who dragged'))).toBe(false);
    await t.play('Lift the reed screen');
    expect(t.world.test(call('knows', 'party', 't__mud'))).toBe(true);
    expect(t.world.test(call('knows', 'party', 't__scratch'))).toBe(true);
    expect(t.journey.choices().some(c => c.label.includes('Ask who dragged'))).toBe(true);
    await t.play('Ask who dragged the weight to the river');
  });

  it('authors a changed form and its acts without changing the live creature body', async () => {
    const party = [{ name: 'Mara', raceId: 'human' as const, classId: 'warrior' as const }];
    const t = await start(yard(`
      Kind form. Entity wolf: form "wolf form".
      Relation shapedAs(group, form).
      Action become_wolf(actor: group) "Take wolf form" {
        Requires able(actor) and company(actor) and not shapedAs(actor, wolf).
        On success { Assert shapedAs(actor, wolf). }
        Result "Mara's outline gathers close, and the wolf looks out with the same eyes.".
      }
      Action bite(actor: group) "Bite as a wolf" {
        Requires able(actor) and company(actor) and shapedAs(actor, wolf).
        Result "The wolf closes its teeth on the offered target.".
      }`), { party });
    const identity = () => t.campaign.readout.creatures.map(c => ({ id: c.id, name: c.name, raceId: c.raceId }));
    const before = identity();
    expect(t.journey.choices().some(c => c.label === 'Bite as a wolf')).toBe(false);
    await t.play('Take wolf form');
    expect(t.world.test(call('t__shapedAs', 'party', 't__wolf'))).toBe(true);
    expect(t.journey.choices().some(c => c.label === 'Bite as a wolf')).toBe(true);
    await t.play('Bite as a wolf');
    expect(identity()).toEqual(before);
  });

  it('executes a named two-role collective act as one action', async () => {
    const party = [
      { name: 'Ivo', raceId: 'human' as const, classId: 'warrior' as const },
      { name: 'Sera', raceId: 'dwarf' as const, classId: 'cleric' as const }
    ];
    const t = await start(yard(`
      Relation beamRaised(group).
      Action raise_beam(actor: group, lever: member, brace: member, site: place)
          "{lever} heaves while {brace} sets the stone under the beam" {
        Requires able(actor) and company(actor) and at(actor, site) and at(actor, yard)
          and memberOf(lever, actor) and hasCalling(lever, calling_warrior) and awake(lever)
          and memberOf(brace, actor) and hasCalling(brace, calling_cleric) and awake(brace)
          and distinct(lever, brace) and not beamRaised(actor).
        Time 1.
        On success { Assert beamRaised(actor). }
        Result "The beam rises together: Ivo under the first end, Sera at the stone before it falls.".
      }`, 2), { party });
    const act = t.journey.choices().find(c => c.command.startsWith('t__raise_beam('))!;
    expect(act.label).toMatch(/Ivo.*Sera|Sera.*Ivo/);
    await t.perform(act.command);
    expect(t.world.test(call('t__beamRaised', 'party'))).toBe(true);
  });
});

describe('Gamma expressive capability friction probes', () => {
  it('makes new pieces from a kind without preserving which whole they came from', async () => {
    const t = await start(yard(`
      Item sword "the blue-daubed sword" is longsword at yard.
      Relation splitFrom(item, item).
      Action break_sword(actor: group) "Break the blue-daubed sword into two knives" {
        Requires able(actor) and company(actor) and holding(actor, longsword).
        On success { Spend sword from actor. Give 2 dagger to actor. }
        Result "The sword gives across its old notch. Two knives remain.".
      }`));
    const take = t.journey.choices().find(c => /^take_item\(/.test(c.command)
      && c.command.includes('t__sword'))!;
    await t.perform(take.command);
    await t.play('Break the blue-daubed sword into two knives');
    const pieces = t.campaign.readout.creatures.flatMap(c => c.state.inventory ?? [])
      .filter(i => i.definition === 'dagger');
    expect(pieces.map(i => i.id).sort()).toEqual(['dagger_given1', 'dagger_given2']);
    expect(t.world.related('t__splitFrom')).toEqual([]);
    expect(t.world.related('ownedItem').some(r => r.args[0] === 't__sword')).toBe(false);
  });

  it('refuses automatic revision of knowledge derived from witnesses', async () => {
    await expect(start(yard(`
      Discovery witness "A trustworthy witness saw Mara at the river.".
      Discovery conclusion "Mara crossed the river.".
      Discovery contradiction "The ferry tally says Mara never crossed that day.".
      Initially Assert knows(party, witness). Initially Assert knows(party, conclusion).
      Rule revise when knows(party, contradiction) and knows(party, witness) {
        Retract knows(party, conclusion).
      }`))).rejects.toThrow(/Rule revise cannot change canonical projections.*discovery knowledge/);
  });

  it('expires a temporary capability without expiring the authored form that named it', async () => {
    const party = [{ name: 'Mara', raceId: 'human' as const, classId: 'warrior' as const }];
    const t = await start(yard(`
      Kind form.
      Relation shapedAs(group, entity).
      Action become_cat(actor: group) "Take cat form" {
        Requires able(actor) and company(actor) and not shapedAs(actor, cat).
        On success {
          Assert shapedAs(actor, cat). Assert granted(actor, climbing).
          Set grantedUntil(actor, climbing) to watch(clock) + 2.
        }
      }
      Entity cat: form "cat form".
      Action cross(actor: group) "Cross the narrow ledge as a cat" {
        Requires able(actor) and company(actor) and capable(actor, climbing).
      }`,), { party });
    await t.play('Take cat form');
    expect(t.world.test(call('t__shapedAs', 'party', 't__cat'))).toBe(true);
    expect(t.journey.choices().some(c => c.label.includes('Cross the narrow ledge'))).toBe(true);
    await t.play('Wait a while', 'Wait a while');
    expect(t.world.test(call('capable', 'party', 'climbing'))).toBe(false);
    expect(t.world.test(call('t__shapedAs', 'party', 't__cat'))).toBe(true);
  });

  it('admits an aggregate collective without naming the members who contributed', async () => {
    const party = [
      { name: 'Ivo', raceId: 'human' as const, classId: 'warrior' as const },
      { name: 'Sera', raceId: 'dwarf' as const, classId: 'cleric' as const },
      { name: 'Odo', raceId: 'human' as const, classId: 'warrior' as const }
    ];
    const t = await start(yard(`
      Relation framingRaised(group).
      Action raise_framing(actor: group, site: place) "Raise the hall's framing together" {
        Requires able(actor) and company(actor) and at(actor, site)
          and count(memberOf(?m, actor) and awake(?m)) >= 3 and not framingRaised(actor).
        On success { Assert framingRaised(actor). }
        Result "Three pairs of hands lift until the frame stands.".
      }`, 3), { party });
    const act = t.journey.choices().find(c => c.command.startsWith('t__raise_framing('))!;
    expect(act.command).not.toContain('member_party');
    await t.perform(act.command);
    expect(t.world.test(call('t__framingRaised', 'party'))).toBe(true);
  });
});

describe('Gamma current mitigations', () => {
  it('predeclares bounded descendants and carries explicit lineage', async () => {
    const t = await start(yard(`
      Item sword "the blue-daubed sword" is longsword at yard.
      Item left "the sword's tip" is dagger nowhere.
      Item right "the sword's grip" is dagger nowhere.
      Relation splitFrom(item, item).
      Initially Assert splitFrom(left, sword). Initially Assert splitFrom(right, sword).
      Action break_sword(actor: group) "Break the blue-daubed sword into its two named pieces" {
        Requires able(actor) and company(actor) and holding(actor, longsword).
        On success { Spend sword from actor. Give left to actor. Give right to actor. }
      }`));
    const take = t.journey.choices().find(c => /^take_item\(/.test(c.command)
      && c.command.includes('t__sword'))!;
    await t.perform(take.command);
    await t.play('Break the blue-daubed sword into its two named pieces');
    const owned = t.world.related('ownedItem').map(r => r.args[0]!);
    expect(owned).toEqual(expect.arrayContaining(['t__left', 't__right']));
    expect(t.world.test(call('t__splitFrom', 't__left', 't__sword'))).toBe(true);
    expect(t.world.test(call('t__splitFrom', 't__right', 't__sword'))).toBe(true);
  });

  it('revises a conclusion through an explicit witnessed correction act', async () => {
    const t = await start(yard(`
      Discovery sighting "A witness saw Mara at the river.".
      Discovery conclusion "Mara crossed the river.".
      Discovery correction "The ferry tally contradicts the sighting.".
      Initially Assert knows(party, sighting). Initially Assert knows(party, conclusion).
      Initially Assert knows(party, correction).
      Action correct(actor: group) "Correct the conclusion from the ferry tally" {
        Requires company(actor) and knows(actor, sighting) and knows(actor, correction)
          and knows(actor, conclusion).
        On success { Retract knows(actor, conclusion). Assert stale(conclusion). }
      }`));
    await t.play('Correct the conclusion from the ferry tally');
    expect(t.world.test(call('knows', 'party', 't__conclusion'))).toBe(false);
    expect(t.world.test(call('stale', 't__conclusion'))).toBe(true);
    expect(t.world.test(call('knows', 'party', 't__sighting'))).toBe(true);
  });

  it('synchronizes one form and its grant with a shared expiry rule', async () => {
    const party = [{ name: 'Mara', raceId: 'human' as const, classId: 'warrior' as const }];
    const t = await start(yard(`
      Kind form. Relation shapedAs(group, form).
      Entity cat: form "cat form".
      Measure catUntil(group).
      Action become_cat(actor: group) "Take cat form" {
        Requires able(actor) and company(actor) and not shapedAs(actor, cat).
        On success {
          Assert shapedAs(actor, cat). Assert granted(actor, climbing).
          Set catUntil(actor) to watch(clock) + 2. Set grantedUntil(actor, climbing) to watch(clock) + 2.
        }
      }
      Rule cat_ends when shapedAs(?c, cat) and catUntil(?c) >= 1 and watch(clock) >= catUntil(?c) {
        Retract shapedAs(?c, cat). Retract granted(?c, climbing).
      }`), { party });
    await t.play('Take cat form');
    expect(t.world.test(call('t__shapedAs', 'party', 't__cat'))).toBe(true);
    await t.play('Wait a while', 'Wait a while');
    expect(t.world.test(call('t__shapedAs', 'party', 't__cat'))).toBe(false);
    expect(t.world.test(call('capable', 'party', 'climbing'))).toBe(false);
  });

  it('bounds collective participation with three named distinct roles', async () => {
    const party = [
      { name: 'Ivo', raceId: 'human' as const, classId: 'warrior' as const },
      { name: 'Sera', raceId: 'dwarf' as const, classId: 'cleric' as const },
      { name: 'Odo', raceId: 'human' as const, classId: 'warrior' as const }
    ];
    const t = await start(yard(`
      Relation frameRaised(group).
      Action raise_frame(actor: group, first: member, second: member, brace: member, site: place)
          "{first}, {second} and {brace} raise the hall's frame" {
        Requires able(actor) and company(actor) and at(actor, site)
          and memberOf(first, actor) and awake(first)
          and memberOf(second, actor) and awake(second)
          and memberOf(brace, actor) and awake(brace)
          and distinct(first, second) and distinct(first, brace) and distinct(second, brace).
        On success { Assert frameRaised(actor). }
      }`, 3), { party });
    const act = t.journey.choices().find(c => c.command.startsWith('t__raise_frame('))!;
    expect(act.command).toContain('member_party');
    await t.perform(act.command);
    expect(t.world.test(call('t__frameRaised', 'party'))).toBe(true);
  });
});
