import type { DeepLayout, DeepLevel, DeepLink, DeepRoom } from './deep-layout';

// What the makers cut where they walled the way down: the site's old name, their fate, what the keeper cannot bear,
// and the fact reading it teaches.
interface Words { fate: string; oldup: string; bane?: string; taught?: string }

// The working parts of a deep site, as Kyr: each a thing with states and the changes that move it, and the ways and
// rules that follow from it. A cage that runs only once its winding wheel is freed (and a chain to climb meanwhile);
// a wall across a stair, with the makers' warning cut in it; a drowned level that drains only while a spring is
// turned down a race onto a pump wheel a level below, and the pump's chain is engaged, and time passes; an air shaft
// found by the draft toward it, that is a second way out. Every one acts the same way in every site that has it.
export class DeepMechanisms {
  static readonly q = JSON.stringify;
  static lines(layout: DeepLayout, words: Words): string[] {
    return [...layout.links.flatMap(l => l.mechanism === 'winch' ? this.winch(l)
      : l.mechanism === 'seal' ? this.seal(l, words) : []),
    ...layout.levels.filter(l => l.flooded).flatMap(l => this.drowned(layout, l)), ...this.vent(layout)];
  }
  static room(layout: DeepLayout, role: string): DeepRoom | undefined {
    return layout.levels.flatMap(l => l.rooms).find(r => r.role === role);
  }
  private static winch(l: DeepLink): string[] {
    const q = this.q, wheel = `${l.id}_wheel`;
    return [`  Thing ${wheel} "the winding wheel" at ${l.a} {`,
      '    State seized "The winding wheel is seized: rust has locked its axle, and the chain hangs slack down the shaft. Somewhere below, the cage sits at the bottom.".',
      '    State turning "The winding wheel turns, stiffly, and the chain runs over it; the cage can be wound up and let down.".',
      '    Change free "Work the seized wheel free" from seized to turning needing brawn or crowbar.', '  }',
      `  Passage ${l.id} ${q(l.name)} is shaft between ${l.a} and ${l.b} taking ${l.minutes} minutes opening when state(${wheel}, turning) "The cage is at the bottom of the shaft, and the wheel that would bring it up will not turn.".`,
      `  Passage ${l.id}_chain "the chain, hand over hand" is climb between ${l.a} and ${l.b} taking 10 minutes needing climbing or rope.`];
  }
  private static seal(l: DeepLink, words: Words): string[] {
    const q = this.q, wall = `${l.id}_wall`, cut = `${l.id}_cut`;
    return [`  Passage ${l.id} ${q(l.name)} is stair between ${l.a} and ${l.b} taking ${l.minutes} minutes.`,
      `  Thing ${wall} "the wall across the stair" on ${l.id} {`,
      '    State standing blocking "A wall of dressed stone stands across the stair, built in a hurry, its mortar slopped and run.".',
      '    State broken "The wall across the stair lies in pieces on the steps, and the way down is open.".',
      '    Change break "Break the wall down" from standing to broken needing brawn or crowbar.', '  }',
      `  Thing ${cut} "the words cut in the wall" at ${l.a} {`,
      `    State unread ${q(`Words are cut deep in the wall across the stair, in the old script. Someone who reads it could say what they mean.`)}.`,
      `    State read ${q(`${words.oldup} SHUT THIS. WE WENT TOO FAR DOWN, AND WHAT WE FOUND WE LEFT THERE. ${words.fate.toUpperCase()}${words.bane ? ` ${words.bane}` : ''}`)}.`,
      '    Change read "Read what is cut in the wall" from unread to read needing lore.', '  }',
      ...words.taught ? [`  Observe ${cut}_told at ${l.a} when state(${cut}, read) and not knows(party, ${words.taught}) "Read aloud, the old words say plainly enough what the makers shut in below, and what it cannot bear." teaches ${words.taught}.`] : []];
  }
  // A drowned level: every way on it but the one into it is under water until the water is down; it goes down only
  // while the spring above runs down the race and the pump below draws it, a watch at a time.
  private static drowned(layout: DeepLayout, level: DeepLevel): string[] {
    const q = this.q, water = `deepWater(${level.id})`, spring = this.room(layout, 'race_head'), pump = this.room(layout, 'pump');
    const arrival = layout.links.find(l => l.between && level.rooms.some(r => r.id === l.b))?.b;
    const ways = layout.links.filter(l => !l.between && level.rooms.some(r => r.id === l.a));
    const lines = [`  Initially Set ${water} to 12.`, `  Relation ${level.id}_dry().`,
      ...ways.map(l => `  Passage ${l.id} ${q(l.name)} is ${l.kind} between ${l.a} and ${l.b} taking ${l.minutes} minutes opening when ${water} == 0 "Black water fills the gallery to its roof.".`)];
    if (arrival) {
      lines.push(`  Observe ${level.id}_deep at ${arrival} when ${water} > 6 "The stair goes down into black water, which stands to within a hand of the roof of the gallery ahead. Your light goes into it and does not come back.".`,
        `  Observe ${level.id}_going at ${arrival} when ${water} > 0 and ${water} <= 6 "The water has gone down: the tops of the gallery's props stand out of it now, black and dripping, and it is still going.".`);
    }
    if (!spring || !pump) { return lines; }
    const gate = `${spring.id}_gate`, chain = `${pump.id}_chain`;
    return [...lines, `  Thing ${gate} "the bronze gate in the channel" at ${spring.id} {`,
      '    State shut "The bronze gate stands across the race, and the spring runs on down its own channel and away.".',
      '    State open "The gate is swung across the old channel, and the spring goes roaring away down the race into the dark.".',
      '    Change open "Swing the gate across, and turn the spring down the race" from shut to open.',
      '    Change shut "Swing the gate back, and let the spring run its own way" from open to shut.', '  }',
      `  Thing ${chain} "the bucket-chain" at ${pump.id} {`,
      '    State slack "The bucket-chain hangs slack from the wheel\'s axle; the pawl that would hold it to the axle is knocked out of its seat.".',
      '    State engaged "The bucket-chain is set on the axle, and goes round with the wheel.".',
      '    Change engage "Knock the pawl home, and set the bucket-chain on the axle" from slack to engaged.', '  }',
      `  Rule ${level.id}_pumping when state(${gate}, open) and state(${chain}, engaged) and ${water} > 0 { Decrease ${water} by 1. }`,
      `  Rule ${level.id}_drained when ${water} == 0 and not ${level.id}_dry() says "From the pump-shaft comes a new sound: the buckets coming up empty, full of air." { Assert ${level.id}_dry(). }`,
      `  Observe ${pump.id}_running at ${pump.id} when state(${gate}, open) and state(${chain}, engaged) and ${water} > 0 "Water pours down the race onto the wheel, which turns with a noise like a mill; the buckets come up full out of the shaft and tip into the drain.".`,
      `  Observe ${pump.id}_idle at ${pump.id} when state(${gate}, open) and state(${chain}, slack) "Water pours down the race and the wheel spins on nothing: the buckets hang still in the shaft.".`,
      `  Observe ${pump.id}_dry at ${pump.id} when state(${gate}, shut) "The race above the wheel is dry, and the wheel stands still. Down the well-shaft there is the sound of standing water.".`,
      `  Observe ${pump.id}_heard at ${spring.id} when state(${gate}, open) "Far below, very faint through the rock, something is turning.".`];
  }
  // The air shaft off a stope: hidden until the draft that goes toward it is followed, then a climb up iron rungs to
  // the hillside, another way out.
  private static vent(layout: DeepLayout): string[] {
    const vent = this.room(layout, 'vent'), way = vent && layout.links.find(l => l.b === vent.id && !l.between);
    if (!vent || !way) { return []; }
    const q = this.q, site = layout.site, found = `${vent.id}_found`;
    return [`  Discovery ${found} ${q(`Where the draft goes: behind the rubble at the end of the stope, a way into the air shaft.`)} { Found by searching ${way.a}. }`,
      `  Observe ${vent.id}_draft at ${way.a} as sign when not knows(party, ${found}) "A draft moves your light, steadily, toward the end of the chamber, where the rubble is heaped highest.".`,
      `  Passage ${way.id} "the gap behind the rubble" is crawl between ${way.a} and ${way.b} taking 3 minutes hidden until ${found}.`,
      `  Passage ${vent.id}_rungs "the iron rungs in the air shaft" is climb between ${vent.id} and ${site} taking 6 minutes hidden until ${found}.`];
  }
}
