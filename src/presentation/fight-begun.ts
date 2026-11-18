import type { Campaign } from '../campaign/campaign';

// What a fight opens on, one rule for the page and the runner: what was seen and said in the moment the company was
// set upon, if it was ("The agile ghouls come at you without a sound."), never what was told before the command that
// began it (a fight with bats begun by the company opened on "Brann lights a torch.": play 13). Or, set upon in the
// midst of something done (a firebomb thrown through a crack at what will not wait for it), that it was done: the fight
// had opened on nothing, and the act was told after it as an attack (Mission 20's cold play). The runner's fights had
// opened on a line of hit points, the ghouls drawn out of the bone hall unsaid (cold play 4, CL-42).
// since: how long the story was when the command under way began; doing: that command's words.
export class FightBegun {
  static lines(campaign: Campaign, since: number, doing?: string): string[] {
    const history = campaign.history, last = history.length > since ? history.at(-1) : undefined;
    const seen = [...(last?.perceptions ?? []).filter(p => p.kind === 'event').map(p => p.text),
      ...(last?.response ? [last.response] : [])];
    if (seen.length) { return [...new Set(seen)]; }
    return doing && !/^(Attack|Fight)\b/.test(doing) ? [`You ${doing.charAt(0).toLowerCase()}${doing.slice(1)}.`] : [];
  }
}
