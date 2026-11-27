import type { Defense } from './woods-counsel';
import { Canon } from '../../canon/canon';
import { ItemNames } from '../../lang/item-names';
import { DeepLayouts, type DeepLayout, type DeepLink, type DeepRoom } from './deep-layout';
import { DeepMechanisms } from './deep-mechanisms';
import { DeepParley } from './deep-parley';
import { DeepShortcuts } from './deep-shortcuts';
import { DeepPacing, type DeepContent } from './deep-pacing';
import { DeepRooms } from './deep-rooms';
import { DeepTime } from './deep-time';
import { DeepHistory } from './deep-history';
import { DeepArgument } from './deep-argument';
import { DeepRivals } from './deep-rivals';
import { DeepSounds } from './deep-sounds';
import { DeepCache } from './deep-cache';
import { DeepOrder } from './deep-order';
import type { DeepPurpose, Valuable } from './deep-purposes';
import type { Region, Site } from '../region-writer';
import { RegionMarvels, type Fragment } from '../region-marvels';
import { RegionKey } from '../region-key';

// A region's deep site, as Kyr: one of its first makers' works that goes down level after level, written from what
// it was for (its purpose: data/generation/deep) rather than from a plan's sections. Its levels and rooms where the
// layout put them, every way between them, the working parts that open and shut them, what each room holds by its
// place in its level's run, and at the bottom the keeper and what the makers died for. It is placed, named, told of
// and found as the makers' other works are (Histories, RegionSites); the rumours of it are its own.
export class DeepSites {
  // A kind of creature's defenses, as the catalog has them, or none for a kind it does not know (WoodsCounsel).
  static defenses(species: string): Defense[] {
    try { return (Canon.creature(species) as { defenses?: Defense[] }).defenses ?? []; } catch { return []; }
  }
  static readonly q = JSON.stringify;
  // rivals: whether another company races this one to it (a country's own deep work); not the catacombs under the
  // town the company begins in, which a country's one rival expedition does not go down (see RegionUndertown).
  static lines(region: Region, site: Site,
    at: { purpose: DeepPurpose; values: Record<string, string>; rivals?: boolean; buried?: string; wooded?: boolean }):
    string[] {
    const { purpose, values } = at, key = `${RegionKey.of(region)}:${site.id}:deep`;
    const layout = DeepLayouts.make(purpose, site.id, key), content = DeepPacing.plan(purpose, layout, key);
    const handled = this.handled(layout, content), order = DeepOrder.lines(layout, content, { purpose, key });
    // What the kingdom after the makers did with it, and what its fall left there.
    const after = [...purpose.after?.[values.kingdomkind!] ?? [], ...purpose.fallen?.[values.fallen!] ?? []];
    return [`  Measure deepWater(place). Measure deepPumped(place).`, ...this.kinds(purpose, DeepHistory.kinds(after)),
      `  Place ${site.id}_site ${this.q(values.name!)} is site within ${values.land} at ${values.x}, ${values.y}.`,
      `  Observe ${site.id}_outside at ${site.id} when true ${this.q((at.wooded ? purpose.wooded ?? purpose.outside
        : at.buried ? purpose.under ?? purpose.outside : purpose.outside).replaceAll('{oldup}', values.oldup!))}`
        + ` teaches ${site.id}_named.`, ...this.marks(site.id, purpose, values),
      ...this.places(layout, at.buried ? { purpose, town: at.buried, wooded: !!at.wooded } : undefined),
      ...this.ways(layout, handled),
      ...DeepMechanisms.lines(layout, { fate: values.fate!, oldup: values.oldup!,
        ...purpose.bane ? { bane: purpose.bane.cut, taught: `${site.id}_bane` } : {} }, purpose.mechanisms),
      ...DeepShortcuts.lines(layout, purpose.mechanisms.shortcuts ?? []),
      // The earlier party's first camp is found first, from the top; those further down are the same party's again.
      ...content.flatMap(c => DeepRooms.lines(c, { site: site.id, purpose, ...this.fragment(region, purpose),
        ...content.find(x => x.special) ? { first: content.find(x => x.special)!.room.id } : {} })),
      ...this.ore(purpose, layout), ...this.rest(purpose, layout, content), ...DeepSounds.listening(layout),
      ...DeepHistory.finds(layout, purpose), ...DeepCache.lines(layout, purpose, { values, key }), ...order,
      ...this.heard(layout, content),
      ...DeepTime.lines(purpose, layout, content, key), ...DeepParley.lines(layout, content),
      ...DeepHistory.lines(layout, after, values),
      ...this.keeper(purpose, layout),
      ...this.bane(purpose, layout), ...this.raised(purpose, layout, values),
      ...this.hooks(purpose, values, this.bane(purpose, layout).length > 0), ...this.answers(purpose, values, layout),
      ...DeepArgument.lines(layout, values, purpose),
      ...at.rivals === false ? [] : DeepRivals.lines(region, site, { layout, purpose, values }),
      ...this.land(purpose, layout)];
  }
  // The makers' marks at the way in, read with lore: what they did and held, which is their history (see marks).
  private static marks(id: string, purpose: DeepPurpose, values: Record<string, string>): string[] {
    const m = purpose.marks, q = this.q;
    if (!m || !values.makersfact) { return []; }
    return [`  Thing ${id}_makers ${q(m.name)} at ${id} {`, `    State unread ${q(m.unread)}.`, `    State read ${q(m.read)}.`,
      `    Change read ${q(m.label)} from unread to read needing lore.`, '  }',
      `  Observe ${id}_makers_learned at ${id} of ${id}_makers as reading when state(${id}_makers, read)`
        + ` ${q(`${values.craft} ${values.belief}`)} teaches ${values.makersfact}.`];
  }
  // The levels and their rooms, each with how it looks; every room below the mouth is dark, and underground (the
  // galleries told themselves "outdoors", from the wild country the workings are in). A drowned level's rooms look as
  // they do once the water is down, and only then: the foot of a flooded stair had said "a floor of grey silt, ridged
  // where the water went out of it" under the black water, and a company took it for drained (the cold review's P0).
  private static places(layout: DeepLayout,
    buried?: { purpose: DeepPurpose; town: string; wooded?: boolean }): string[] {
    const q = this.q, site = layout.site;
    return layout.levels.flatMap(level => [`  Place ${level.id} ${q(level.name)} is level within ${site}_site.`,
      ...level.rooms.flatMap(r => [`  Place ${r.id} ${q(r.name)} is room within ${level.id} at ${r.x}, ${r.y}`
        + `${r.open && !buried ? ' outdoors' : ' underground'}.`,
        `  Observe ${r.id}_scene at ${r.id} when ${level.flooded ? `deepWater(${level.id}) == 0` : 'true'}`
          + ` ${q(this.scene(r, buried))}.`,
        ...r.lit ? [] : [`  Initially Assert unlit(${r.id}).`]])]);
  }
  // A room as it looks: as it was made, or buried under a town, as its purpose says it then (a barrow's forecourt had
  // faced "the sunrise" from under Brightbridge; a mine's mouth under Porthalen had opened "in the hillside").
  private static scene(r: DeepRoom, buried?: { purpose: DeepPurpose; town: string; wooded?: boolean }): string {
    // Under the old woods there is no town above it: its own words for that, or as it was made (OR-643).
    const role = buried?.purpose.roles[r.role];
    const under = buried?.wooded ? role?.wooded?.[0] ?? (role?.buried ? r.scene : undefined) : role?.buried?.[0];
    return under ? under.replaceAll('{town}', buried!.town) : r.scene;
  }
  // The ways the mechanisms do not write themselves: the mouth, the galleries, the ladders, the ore pass.
  private static ways(layout: DeepLayout, handled: Set<string>): string[] {
    const q = this.q, mouth = layout.levels[0]!.rooms[0]!;
    return [`  Passage ${layout.site}_in "the way in" is tunnel between ${layout.site} and ${mouth.id} taking 2 minutes.`,
      ...layout.links.filter(l => !handled.has(l.id)).map(l => `  Passage ${l.id} ${q(l.name)} is ${l.kind} between ${l.a} and ${l.b}${l.oneWay ? ' one way' : ''} taking ${l.minutes} minutes${l.needs ? ` needing ${l.needs.join(' or ')}` : ''}.`)];
  }
  private static handled(layout: DeepLayout, content: DeepContent[]): Set<string> {
    const parleyed = new Set(DeepParley.ways(layout, content).map(l => l.id));
    const flooded = new Set(layout.levels.filter(l => l.flooded).flatMap(l => l.rooms.map(r => r.id)));
    const vent = DeepMechanisms.room(layout, 'vent');
    return new Set(layout.links.filter((l: DeepLink) => l.mechanism || (!l.between && flooded.has(l.a))
      || (vent && l.b === vent.id && !l.between) || parleyed.has(l.id)).map(l => l.id));
  }
  // Where a company can rest (a hall, a store-room, an old camp), and what may find it there: the savage and the
  // territorial of a level go about it, and now and then one comes to wherever the company is on their level, the
  // longer it stays the likelier: one watch in twenty (one in a hundred had been as good as never; the owner, 26
  // November: far more fighting).
  private static rest(purpose: DeepPurpose, layout: DeepLayout, content: DeepContent[]): string[] {
    const rooms = layout.levels.flatMap(l => l.rooms);
    const restful = rooms.filter(r => purpose.rest?.includes(r.role) || content.some(c => c.room === r && c.special));
    const lines = ['  Relation deepLevelOf(place, place).', ...rooms.map(r => `  Initially Assert deepLevelOf(${r.id}, ${layout.levels[r.level]!.id}).`),
      ...restful.map(r => `  Initially Assert restful(${r.id}).`)];
    for (const c of content.filter(x => x.dwellers && !x.dwellers.elite && ['savage', 'territorial'].includes(x.dwellers.group.temperament))) {
      const id = c.dwellers!.id, level = layout.levels[c.room.level]!.id;
      lines.push(`  Rule ${id}_wanders when able(${id}) and at(${id}, ?o) and at(party, ?p) and deepLevelOf(?p, ${level}) and deepLevelOf(?o, ${level}) and distinct(?o, ?p) and dice(${id}) <= 5 says ${this.q(`Something is coming along ${purpose.walks?.[0] ?? 'the passage'} toward you: ${c.dwellers!.group.label}.`)} {`,
        `    Retract at(${id}, ?o). Assert at(${id}, ?p). }`);
    }
    return lines;
  }
  // The land round it, while what keeps its bottom is there and after: told outside, and what each skill reads in it.
  private static land(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const land = purpose.land, site = layout.site, keeper = `${site}_keeper`, q = this.q;
    if (!land) { return []; }
    return [`  Observe ${site}_blight at ${site} as sign when able(${keeper}) ${q(land.blight)}.`,
      ...Object.entries(land.signs).map(([skill, text]) => `  Observe ${site}_${skill}_sign at ${site} as sign`
        + ` noticed by ${skill} when able(${keeper}) ${q(text)}.`),
      `  Observe ${site}_healed at ${site} as sign when not able(${keeper}) ${q(land.healed)}.`];
  }
  // Who can be heard from the next room before they are met (see DeepSounds).
  private static heard(layout: DeepLayout, content: DeepContent[]): string[] {
    return content.filter(c => c.dwellers).flatMap(c => DeepSounds.lines(layout, { id: c.dwellers!.id, room: c.room.id,
      temperament: c.dwellers!.group.temperament, ...c.dwellers!.elite ? { elite: true } : {},
      ...c.dwellers!.group.ancestry ? { person: true } : {},
      ...c.dwellers!.group.species ? { kind: Canon.creature(c.dwellers!.group.species).type } : {} }));
  }
  // What the site was worked for, where it was left: lumps of ore in the stopes and the tubs.
  private static ore(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const ore = purpose.ore;
    if (!ore) { return []; }
    return layout.levels.flatMap(l => l.rooms).flatMap(r => Array.from({ length: ore.roles[r.role] ?? 0 },
      (_, n) => `  Item ${r.id}_ore${n} ${this.q(ore.name)} is ${ore.kind} at ${r.id}.`));
  }
  // At the bottom: whatever the makers broke into, and what they died for, which it keeps.
  // It shrinks back into its refuge from what it fears, and keeps the heart while it is there: taken from under it, it
  // comes at once, in its own words or its kind's. The king had let his crown be lifted from his head, said "In a few
  // minutes it will be on you", and never came (cold play 4, CL-44; cold play 2, CL-10).
  private static keeper(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const bottom = layout.levels.at(-1)!.rooms, heart = bottom.find(r => r.role === 'heart') ?? bottom.at(-1)!;
    const q = this.q, k = purpose.keeper, id = `${layout.site}_keeper`, words = Object.entries(k.words ?? {})
      .map(([w, text]) => ` ${w} ${q(text)}.`).join('');
    const refuge = bottom.find(r => r.role === k.refuge);
    const shrinks = refuge && k.fears ? ` Refuge ${refuge.id}. Fears ${k.fears}.` : '';
    const varied = (k.variations ?? []).map(v => ` Variant ${v}.`).join('');
    return [`  Person ${id} ${q(k.label)} at ${heart.id} { Role ${q(k.role)}. Species ${k.species}.${varied}`
      + ` Level ${k.level}. Temperament ${k.temperament}. Lair ${heart.id}.${shrinks}${words} }`,
      `  Item ${layout.site}_heart ${q(purpose.objective.item)} is ${purpose.objective.kind} at ${heart.id}.`,
      `  Rule ${id}_robbed when company(?c) and together(${id}, ?c) and able(${id}) and not routed(${id})`
        + ` and not tolerates(${id}, ?c) and not assails(${id}, ?c) and ownedItem(${layout.site}_heart, ?m)`
        + ` and memberOf(?m, ?c) and onslaught(${id}, ?o) says ${k.robbed ? q(k.robbed) : '"{?o}"'} {`
        + ` Assert assails(${id}, ?c). Retract warned(${id}, ?c). }`];
  }
  // Where the makers left what the keeper cannot bear, and what reading their words tells of it. Once it is known, by
  // whatever way (the innkeeper's saying before setting out, the words cut below, the priest won over), it is an aim
  // toward the room it lies in until it is carried: asking before setting out had told the company of it and changed
  // nothing the descent then offered (Sprint 2, S2-4: the warrior's preparation counted for nothing).
  private static bane(purpose: DeepPurpose, layout: DeepLayout): string[] {
    const b = purpose.bane, room = b && layout.levels.flatMap(l => l.rooms).find(r => r.role === b.role);
    if (!b || !room) { return []; }
    const q = this.q, id = `${layout.site}_bane`, o = purpose.objective;
    const name = b.like?.name ?? DeepRooms.called(b.item);
    const until = o.goal && o.raised ? ` and not ${layout.site}_raised()` : '';
    return [`  Entity ${id}: fact ${q(b.fact)}.`, `  Item ${id}_item ${q(name)} is ${b.item} at ${room.id}.`,
      `  Observe ${id}_seen at ${room.id} when at(${id}_item, ${room.id}) ${q(b.seen)}.`,
      ...b.aim ? [`  Objective ${id}_aim when knows(party, ${id}) and not holding(party, ${b.item})${until}`
        + ` toward ${room.id} ${q(b.aim)}.`] : []];
  }
  // Bringing up what they died for: to be done once its story is known, and told when it is done, which is when it
  // is first in daylight (come out by night, at first light, wherever the company then is).
  private static raised(purpose: DeepPurpose, layout: DeepLayout, values: Record<string, string>): string[] {
    const o = purpose.objective, site = layout.site, q = this.q;
    if (!o.goal || !o.raised) { return []; }
    // The aim names the site as the place it is, so the ways to it are known for the aim's (see Stakes).
    const [goal, raised] = [o.goal.replaceAll('{name}', `{${site}_site}`), o.raised.replaceAll('{name}', values.name!)];
    return [`  Entity ${site}_story: fact ${q(o.text)}.`, `  Relation ${site}_raised().`,
      `  Objective ${site}_bring when knows(party, ${site}_story) and not ${site}_raised() ${q(goal)}.`,
      `  Rule ${site}_brought when at(party, ?p) and not unlit(?p) and not dark() and ownedItem(${site}_heart, ?m)`
        + ` and memberOf(?m, party) and not ${site}_raised() says ${q(raised)} { Assert ${site}_raised(). }`];
  }
  // Who tells of it: the innkeeper and the merchant of the settlement nearest it, each in their own words, and the
  // merchant pays well for its ore.
  // Where it has a bane, the innkeeper's grandmother's saying names it: asking before setting out is the preparation
  // that changes the descent (Sprint 2, S2-4: the barrow's king could not abide the day, and only the embalmers' words,
  // far down, said so).
  private static hooks(purpose: DeepPurpose, values: Record<string, string>, baned: boolean): string[] {
    const q = this.q, w = values.w!, trade = purpose.hook.trade, ore = purpose.ore;
    const [first, second] = purpose.rumours.map(t => t.replaceAll('{name}', values.name!));
    // The saying is asked after, by one who has heard of the place: the bane's aim is uncovered by asking further, not
    // handed to anyone who asks about the place (OR-370; the quantity gate's first-town aims handed out, iscoed's
    // barrow and the undertown's both given with the innkeeper's first answer).
    const saying = baned && purpose.bane ? [
      `  Topic ${w}_saying with ${values.keeper} ${q(`Ask {${values.keeper}} what the old folk say of ${values.name}`)} when knows(actor, ${w}_named) and not knows(actor, ${w}_bane) once {`,
      `    Says ${q(`{${values.keeper}} lowers {their ${values.keeper}} voice. 'My grandmother used to say it: ${DeepSites.lower(purpose.bane.fact)}'`)}.`,
      `    On discuss { Assert knows(actor, ${w}_bane). }`, '  }'] : [];
    // Under the reference game's woods, told of only to a company that knows the way down (values.heard): what is
    // under the stones is the shrine-keeper's to tell first (the woods' riddle), and told before it, the gold had led
    // to a place whose way nobody had found.
    const heard = values.heard ? ` and ${values.heard}` : ` and not knows(actor, ${w}_named)`;
    return [`  Topic ${w}_rumour with ${values.keeper} ${q(`Ask {${values.keeper}} about ${purpose.hook.topic}`)} when toldMatter(${values.keeper}, actor)${heard} once {`,
      `    Says ${q(`${first} {${values.keeper}} wipes the counter. '${this.lies(values.where!)} Go in daylight, and take more light than you think.'`)}.`,
      `    On discuss { Assert knows(actor, ${w}_named). Assert knows(actor, ${w}_found). }`, '  }', ...saying,
      ...second && trade ? [`  Topic ${w}_rumour2 with ${values.merchant} ${q(`Ask {${values.merchant}} ${trade.topic}`)} when toldMatter(${values.merchant}, actor)${values.heard ? ` and ${values.heard}` : ''} once {`,
        `    Says ${q(`${second} {${values.merchant}} ${trade.says}`)}.`,
        // What he names, the map names too (he says Lapisrecs; the mound had stayed "a great long mound with a door of
        // stone", and a cold player went to another: Mission 20's third round, D 104), though not the way there.
        `    On discuss { Assert knows(actor, ${values.w}_named).${purpose.objective.goal ? ` Assert knows(actor, ${values.w}_story).`
          : ''} }`, '  }'] : [],
      // Half its worth, as a dealer pays for any valuable: at its whole worth one trip down the mine had paid 600
      // coin against a 50-coin debt (SI-07, the sites commission's walks).
      ...ore ? [`  Initially Set pays(${values.merchant}, ${ore.kind}) to ${Math.max(1, Math.round(ore.worth / 2))}.`] : [],
      ...this.brought(purpose, values),
      ...this.home(purpose, values)];
  }
  // The ore the company brought up and sold, answered by whoever bought it: what it is, and where the rest of it went,
  // which is the way deeper and what the makers died for there (the story, and with it the aim). Said once the buyer
  // keeps some, never before: a reason to go down again that grows from the first descent.
  private static brought(purpose: DeepPurpose, values: Record<string, string>): string[] {
    const q = this.q, w = values.w!, m = values.merchant!, said = purpose.hook.trade?.brought, ore = purpose.ore;
    if (!said || !ore) { return []; }
    const [ask, says] = [said.ask, said.says].map(t => t.replaceAll('{merchant}', `{${m}}`).replaceAll('{name}', values.name!));
    return [`  Topic ${w}_brought with ${m} ${q(ask!)} when keeps(${m}, ?o) and itemKind(?o, ${ore.kind}) once {`,
      `    Says ${q(says!)}.`,
      `    On discuss { Assert knows(actor, ${w}_named).${purpose.objective.goal ? ` Assert knows(actor, ${w}_story).` : ''} }`,
      '  }'];
  }
  // The town answering what the company did below (sprint 3: a settlement that responds): what it sold (the ore, or
  // what the makers left), shown where the buyer keeps it while he does; and the keeper of the inn hearing, once, that
  // the company has been below the first level, where the town says nobody goes.
  static answers(purpose: DeepPurpose, values: Record<string, string>, layout: DeepLayout): string[] {
    const q = this.q, w = values.w!, m = values.merchant!, k = values.keeper!, hook = purpose.hook, ore = purpose.ore;
    const below = layout.levels[1]?.rooms[0]?.id, at = values.keeperat;
    const kinds = ore ? [ore.kind] : Object.values(purpose.valuables ?? {}).flat().map(v => v.id);
    const sold = kinds.map(x => `itemKind(?o, ${x})`).join(' or ');
    return [...hook.trade?.shown && kinds.length ? [`  Observe ${w}_ore_shown near ${m} as sign when keeps(${m}, ?o) and `
      + `(${sold}) ${q(this.named(hook.trade.shown, values))}.`] : [],
    ...hook.below && below && at ? [`  Relation ${w}_below_told().`, `  Rule ${w}_below_talk when been(party, ${below})`
      + ` and at(party, ${at}) and at(${k}, ${at}) and not ${w}_below_told() says ${q(this.named(hook.below, values))}`
      + ` { Assert ${w}_below_told(). Assert onTheHouse(${k}, party). }`] : []];
  }
  private static named(text: string, values: Record<string, string>): string {
    return text.replaceAll('{merchant}', `{${values.merchant!}}`).replaceAll('{keeper}', `{${values.keeper!}}`)
      .replaceAll('{name}', values.name ?? '');
  }
  private static lower(text: string): string { return text.charAt(0).toLowerCase() + text.slice(1); }
  // Where the innkeeper says it is: out in the country, or under the town ("It is out in under Lowmouth" was said).
  private static lies(where: string): string {
    return /^under /.test(where) ? `It is ${where}, below the vault.` : `It is out in ${where}.`;
  }
  // When it is brought home: the innkeeper who told of it hears what the company brought up, and keeps it a night.
  // Their words hold it in their hands, so they are said only while the company has it: Kynes had looked a long while
  // at a crown sold an hour before to the company's head (cold play 2, CL-09). Sold, it is heard of, not handled.
  private static home(purpose: DeepPurpose, values: Record<string, string>): string[] {
    const q = this.q, w = values.w!, k = values.keeper!, home = purpose.hook.home, kind = purpose.objective.kind;
    if (!home || !purpose.objective.goal) { return []; }
    const tell = q(`Tell {${k}} what you brought up out of ${values.name}`), told = `not ${w}_home_told()`;
    const gone = `{${k}} hears it all out, and asks where it is now, and is told. 'Well. Tonight you eat and sleep on`
      + ` the house all the same, and I will be telling this in the taproom for a year.'`;
    return [`  Relation ${w}_home_told().`,
      `  Topic ${w}_home with ${k} ${tell} when ${w}_raised() and holding(actor, ${kind}) and ${told} once {`,
      `    Says ${q(home.replaceAll('{keeper}', `{${k}}`).replaceAll('{name}', values.name!))}.`,
      `    On discuss { Assert onTheHouse(${k}, actor). Assert ${w}_home_told(). }`, '  }',
      `  Topic ${w}_home_sold with ${k} ${tell} when ${w}_raised() and not holding(actor, ${kind}) and ${told} once {`,
      `    Says ${q(gone)}.`, `    On discuss { Assert onTheHouse(${k}, actor). Assert ${w}_home_told(). }`, '  }'];
  }
  // What a deep site holds that no catalog does: its ore, and what the makers died for.
  private static kinds(purpose: DeepPurpose, left: Valuable[]): string[] {
    const q = this.q;
    const ore = purpose.ore, o = purpose.objective, b = purpose.bane;
    return [...ore ? [`  Kind ${ore.kind} ${q(ore.name)} is treasure worth ${ore.worth} weighing ${ore.weight} described ${q(ore.text)}.`] : [],
      ...b?.like ? [`  Kind ${b.item} ${q(b.like.name)} like ${b.like.base} described ${q(b.like.text)}`
        + `${b.like.grants ? ` granting ${b.like.grants}` : ''}${b.like.worn ? ` worn as ${b.like.worn}` : ''}.`] : [],
      `  Kind ${o.kind} ${q(o.item)} is treasure worth ${o.worth ?? DeepRivals.worth} weighing ${o.weight ?? 30} described ${q(o.text)}.`,
      ...[...Object.values(purpose.valuables ?? {}).flat(), ...left].map(v =>
        `  Kind ${v.id} ${q(v.name)} is treasure worth ${v.worth} weighing ${v.weight} described ${q(v.text)}.`)];
  }
  // What a wonder met in it tells of its makers (RegionMarvels.fragmentOf), where they are the country's.
  private static fragment(region: Region, purpose: DeepPurpose): { fragment?: Fragment } {
    const fragment = RegionMarvels.fragmentOf(region, purpose.art);
    return fragment ? { fragment } : {};
  }
  // A catalog item by its own name: "a lantern".
  static called(id: string): string { return ItemNames.called(Canon.items[id]?.name ?? id.replace(/_/g, ' ')); }
}
