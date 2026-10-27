// `kyrie new character <id> --in <adventure> [--incidental|--recurring|--major|--companion|--antagonist]`: someone of
// the adventure, beside where its company begins, written as a working example of what a character of that weight
// does. Each tier has what the one before has:
//   incidental   met once: a greeting in their own words, and one thing to ask
//   recurring    met again: greets you as someone seen before; what they tell you is remembered, and asked after; and
//                they answer one who knows the old lore otherwise
//   major        a promise remembered (they watch the road for you), and a mind changed by evidence: show them what
//                you found and they believe you, by degrees
//   companion    a recurring character who will join the company, and says so in their own words
//   antagonist   someone who guards the way on and warns you off: a way past by stealth, by talking them round, or by
//                force
import { Adventures, type Home, type Part } from './new-home';

export type Tier = 'incidental' | 'recurring' | 'major' | 'companion' | 'antagonist';
export class Characters {
  static readonly tiers: Tier[] = ['incidental', 'recurring', 'major', 'companion', 'antagonist'];
  static make(home: Home, id: string, tier: Tier): Part {
    const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');
    const lines = tier === 'antagonist' ? this.antagonist(home, id, name) : [...this.person(home, id, name, tier),
      ...this.incidental(id, name), ...tier === 'incidental' ? [] : this.recurring(id, name),
      ...tier === 'major' ? this.major(home, id, name) : [], ...tier === 'companion' ? this.companion(id, name) : []];
    const [steps, told] = this.played(home, id, name, tier);
    const kyr = Adventures.file(home, `${name}: a ${tier} character, beside ${home.from}. Meet them: bin/kyrie play`
      + ` character ${id} --in ${home.adventure}`, lines);
    return Adventures.part(home, id, { kyr, what: `${name}, a ${tier} character of ${home.title}`, steps, told,
      next: `bin/kyrie play character ${id} --in ${home.adventure}` });
  }
  // The steps that show what the tier is for, and some of what the page tells at the last of them (in words with no
  // quotation marks or apostrophes in them, which the page curls).
  private static played(home: Home, id: string, name: string, tier: Tier): [string[], string] {
    const talk = `Talk to ${name}`;
    switch (tier) {
      case 'incidental': return [[talk, `Ask ${name} what the weather will do`], 'Rain by dark'];
      case 'recurring': return [[talk, `Ask ${name} what is wrong`, `Ask ${name} the way to the old tower`], 'keep the wall on your left'];
      case 'major': return [[talk, `Ask ${name} what is wrong`, `Promise ${name}`, 'Take your leave',
        'the note pinned to the post: Examine', talk, `Show ${name} the note`], 'Then he went on'];
      case 'companion': return [[talk, `Ask ${name} what is wrong`, `Ask ${name} to come with you`, `Ask ${name} to join`],
        `says ${name}, and rolls the net up under her arm`];
      case 'antagonist': return [[talk, `Tell ${name} you have business`], 'He does not move.'];
    }
  }
  private static person(home: Home, id: string, name: string, tier: Tier): string[] {
    return [`  Person ${id} ${JSON.stringify(name)} at ${home.from} {`,
      '    Role "a fisher mending a net". Ancestry human. Calling ranger. Level 2. Peaceable. Manner cheerful. Pronouns she.',
      `    Greets "${name} looks up from the net in her lap. 'Mind the hooks.'".`,
      ...tier === 'incidental' ? [] : [`    Greets again "${name} nods to you as to someone she has seen before.".`],
      ...tier === 'companion' ? [`    Joins "'I'll come,' says ${name}, and rolls the net up under her arm. 'I can row, and I can see in the dark better than most.'".`,
        `    Leaves "'This is where I go home,' says ${name}. 'Mind how you go.'".`] : [], '  }'];
  }
  private static incidental(id: string, name: string): string[] {
    return [`  Topic ${id}_weather with ${id} ${JSON.stringify(`Ask ${name} what the weather will do`)} when true once {`,
      `    Says "'Rain by dark,' says ${name}, without looking at the sky. 'The gulls have come in.'".`, '  }'];
  }
  // What they tell you is remembered (a discovery), and asked after (a topic only once it is known); and one who
  // knows the old lore is answered otherwise.
  private static recurring(id: string, name: string): string[] {
    return [`  Discovery ${id}_brother ${JSON.stringify(`${name}'s brother went up to the old tower three days ago and has not come down.`)}.`,
      `  Topic ${id}_trouble with ${id} ${JSON.stringify(`Ask ${name} what is wrong`)} when true once {`,
      `    Says "'My brother went up to the old tower three days ago,' says ${name}, 'and he has not come down.'".`,
      `    On discuss { Assert knows(actor, ${id}_brother). }`, '  }',
      `  Topic ${id}_way with ${id} ${JSON.stringify(`Ask ${name} the way to the old tower`)} when knows(actor, ${id}_brother) once {`,
      '    Says "\'Up past the last field, and keep the wall on your left,\' she says. \'He will have gone that way. He always does.\'".', '  }',
      `  Topic ${id}_lore with ${id} ${JSON.stringify(`Ask ${name} who built the old tower`)} when capable(actor, lore) once {`,
      `    Says "'You have the look of someone who reads,' says ${name}. 'Then you will know better than I do: the stones up there are older than the village, and nobody here built them.'".`,
      '  }'];
  }
  // A promise remembered: they watch the road while it is kept. A mind changed by evidence: what you find counts with
  // them, by degrees (a measure), until they believe you.
  private static major(home: Home, id: string, name: string): string[] {
    const note = `${id}_note`;
    return [`  Relation ${id}_promised(group). Measure ${id}_belief(group).`,
      `  Topic ${id}_promise with ${id} ${JSON.stringify(`Promise ${name} you will look for her brother`)} when knows(actor, ${id}_brother) and not ${id}_promised(actor) once {`,
      `    Says "'You will?' ${name} puts the net down. 'Then I will hold you to it.'".`,
      `    On discuss { Assert ${id}_promised(actor). }`, '  }',
      `  Observe ${id}_waiting near ${id} when ${id}_promised(party) "${name} watches the road, as if you might have news already.".`,
      `  Thing ${note} "the note pinned to the post" at ${home.from} {`, '    Tries looking.',
      '    State still "A note is pinned to the post by the door, the ink run with rain.".', '  }',
      `  Discovery ${note}_read "The note on the post is in a boy's hand: GONE ON PAST THE TOWER. DONT WAIT.".`,
      `  Observe ${note}_seen near ${note} when tried(${note}, looking) "The note is in a boy's hand: GONE ON PAST THE TOWER. DONT WAIT." teaches ${note}_read.`,
      `  Topic ${id}_shown with ${id} ${JSON.stringify(`Show ${name} the note on the post`)} when knows(actor, ${note}_read) once {`,
      `    Says "${name} reads it twice. 'That is his hand,' she says. 'Then he went on, past the tower. He was never up there at all.'".`,
      `    On discuss { Increase ${id}_belief(${id}) by 2. }`, '  }',
      `  Observe ${id}_believes near ${id} when ${id}_belief(${id}) >= 2 "${name} has stopped watching the tower, and watches the road past it.".`];
  }
  private static companion(id: string, name: string): string[] {
    return [`  Topic ${id}_come with ${id} ${JSON.stringify(`Ask ${name} to come with you and look for him`)} when knows(actor, ${id}_brother) once {`,
      `    Says "${name} looks at the net, and then at the road. 'I have been waiting for someone to ask.'".`,
      `    On discuss { Assert willing(${id}, actor). Set hire(${id}) to 0. }`, '  }'];
  }
  // Someone between the company and the way on: they warn, they can be talked round by one who can talk, and slipped
  // past by one who moves quietly; and they can be fought.
  private static antagonist(home: Home, id: string, name: string): string[] {
    const [x, y] = home.spot, yard = `${id}_yard`, gate = `${id}_gate`;
    return [`  Place ${yard} "the yard beyond the gate" is room within ${home.parent} at ${x}, ${y} outdoors.`,
      `  Passage ${gate} "the barred gate" is path between ${home.from} and ${yard} taking 5 minutes.`,
      `  Observe ${yard}_scene at ${yard} when true "A yard of beaten earth beyond the gate, and nobody in it.".`,
      `  Person ${id} ${JSON.stringify(name)} at ${home.from} {`,
      '    Role "a gate-warden with a cudgel". Ancestry human. Calling warrior. Level 2. Manner grim. Pronouns he.',
      `    Guards ${gate}.`, `    State in_gateway blocking "${name} stands square in the gateway, the cudgel in both hands.".`,
      `    Warns "${name} steps into the gateway and sets his cudgel across it. 'Nobody through. Not today.'".`,
      `    Comes "${name} comes at you with the cudgel held low.".`,
      `    Pleads "${name} drops the cudgel and backs against the gatepost.".`, '  }',
      `  Topic ${id}_business with ${id} ${JSON.stringify(`Tell ${name} you have business beyond the gate`)} when true once {`,
      `    Says "'Everybody has business,' says ${name}. He does not move.".`, '  }',
      `  Topic ${id}_round with ${id} ${JSON.stringify(`Talk ${name} round`)} when capable(actor, persuasion) once {`,
      `    Says "${name} looks at you a long while. Then he lifts the cudgel out of the gateway. 'Be quick about it.'".`,
      `    On discuss { Assert tolerates(${id}, actor). }`, '  }'];
  }
}
