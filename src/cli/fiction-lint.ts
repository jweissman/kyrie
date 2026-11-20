import type { Operator } from '../lang/module';
import type { CampaignLint } from './campaign-lint';

// Fiction standing in for the rules (OR-147; the owner, 20 November, playing the pedlar on the road in: "if there is a
// fight we shouldn't just narrate around it", and "it looks like you are fictionalizing a cast, would you like to know
// more about firing spells from Kyr…?"). An act's Result, Otherwise or a topic's Says that tells a blow landed, a
// fall, a wound, a defeat or a spell cast, where the act itself fights nothing, harms no one, lays no condition and
// casts nothing, is told as advice, with the way to do it in Kyr. Advice, not a warning: some such lines are meant
// (a fight told as past, a blow to a door), and recommended content is held to its warnings.
export class FictionLint {
  // What the words tell, by kind.
  static readonly told: Record<'blow' | 'fall' | 'wound' | 'defeat' | 'spell', RegExp> = {
    blow: new RegExp(String.raw`\b(one shove|shoves you(?! off)|knocks you (down|flat|over|cold)|hits you|strikes you`
      + String.raw`|punches you|kicks you|clubs you|stabs you|on your back in the)\b`, 'i'),
    fall: /\b(throws you (off|back|down|across)|you go down the \w+ on your (side|back)|you are thrown)\b/i,
    wound: new RegExp(String.raw`\b(you are (hurt|wounded|bleeding)|wounds you`
      + String.raw`|cuts you(?! an?\b)|blood (runs|pours) (down )?(your|from your))\b`, 'i'),
    defeat: new RegExp(String.raw`\b(beats you|you are beaten|knocked senseless|leaves you (senseless|for dead)`
      + String.raw`|puts you (down|on your back))\b`, 'i'),
    spell: new RegExp(String.raw`\b(you cast(?! (up|off|about|around|down|an? eye|your eye))`
      + String.raw`|casts? (a |the |your )?(spell|charm|ward|hex|curse)|the spell takes`
      + String.raw`|you lay the spell|words of power)\b`, 'i'),
  };
  // What would make it so in the rules: a fight begun or fought, harm dealt, a condition laid, healing, a spell; or
  // the author's own mark of it, a relation named for the fall or the hurt (the circus's turnFell).
  private static readonly rules = new RegExp('"(assails|combat|expose|recover|hurt|damage|afflicted|condition'
    + '|conditioned|cast|castSpell|captured|\\w*(Fell|Fall|Hurt|Wound|Beaten|Bruised|Yield)\\w*)"');
  static readonly how: Record<keyof typeof FictionLint.told, string> = {
    blow: 'a blow is the fight\'s to land: give the foe a Person and Assert assails(foe, actor) (Initially Assert '
      + 'yields(foe) for a bout, over at the first fall), or let it do no blow at all',
    fall: 'a fall that hurts is harm: Resolve expose(hazard, member) with a Hazard for the fall (as a ledge or a roof '
      + 'is), so that the company carries it; or tell a fall that costs nothing as costing nothing',
    wound: 'a wound is harm the company carries: Resolve expose(hazard, member) with a Hazard that means the damage, '
      + 'or a fight; or say nothing of a wound',
    defeat: 'a defeat is a fight lost: a bout (yields) lost asserts yielded(party, foe), which the scene can then tell; '
      + 'narrated, it is a defeat nobody was in',
    spell: 'a spell is cast by its caster, not told: offer the casting as the ability itself (the casting-fiction '
      + 'invariant: a named capability, invoked, with its aftermath), not words about it',
  };
  static run(lint: CampaignLint) {
    for (const a of lint.module.actions) {
      const found = FictionLint.of(a);
      if (found) { lint.add('advice', 'fiction', found); }
    }
  }
  // The first kind of fiction an act tells without its rules, said with its words and the way to do it.
  static of(a: Operator): string | undefined {
    if (FictionLint.rules.test(JSON.stringify([a.success, a.failure, a.resolve ?? null]))) { return undefined; }
    for (const text of [a.report, a.otherwise, ...(a.told ?? []).map(t => t.text)].filter((t): t is string => !!t)) {
      for (const [kind, re] of Object.entries(FictionLint.told) as [keyof typeof FictionLint.told, RegExp][]) {
        const m = re.exec(text);
        if (m) {
          return `${a.id} tells ${kind === 'spell' ? 'a spell cast' : `a ${kind}`} ("…${text.slice(Math.max(0, m.index - 30),
            m.index + m[0].length + 20)}…") with nothing of it in the rules: ${FictionLint.how[kind]}`;
        }
      }
    }
    return undefined;
  }
}
