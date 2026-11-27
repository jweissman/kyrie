import type { Campaign } from '../campaign/campaign';
import type { Operator } from '../campaign/planner';
import { AimAdvances } from './aim-advances';
import type { Promoted } from './glance-types';
import type { Candidate } from '../ui/promotion';
import { HeldActs } from './held-acts';
import { PlayerView } from './player-view'; import { PlayerFrame } from './player-frame';
import { Undertakings } from './undertakings';
import { AimSaid } from './aim-said';

type Stepping = Pick<Candidate, 'command' | 'for' | 'subject'> & { inside?: { command: string }[] };
// The aim to follow (HeldActs.follow), held and nothing followed, whose next step is an act offered here: that act
// takes the aim up (OR-466). On the green, "Ask Owain how many head came down" had stood twice, the aim to follow (a
// decision) beside the question in Owain's talk (an act), and a player could not tell them apart. One row, one act:
// the act is drawn in the aim's words, and the session takes up the aim when it is done (PlaySession.perform), by this
// one reading. Worked out without following the aim: what moves it on (AimAdvances, for that aim), among the choices.
// Only where the aim is said in that act's own words, as the two rows were: an aim said otherwise ("The cart is in the
// ditch") is no name for heaving it out, and the aim and the act stay two rows.
export class HeldLead {
  static of(campaign: Campaign, aim: string, said: string): string | undefined {
    const held = Undertakings.held(campaign), def = held.find(o => o.id === aim);
    if (!def || Undertakings.followed(campaign, held)) { return undefined; }
    const rows = PlayerFrame.of(campaign).rows, moving = AimAdvances.of(campaign, rows, def);
    const lead = rows.find(r => moving.has(r.choice.id));
    return lead && lead.choice.name === said ? lead.choice.id : undefined;
  }
  // The aim the command (a choice's id) takes up, where it is the step of the aim to follow, as the glance drew it.
  // The screen's aims are read only where the command moves some aim held on: most acts move none.
  // A way is no aim's step (AimAdvances leads no way), so a leg of a journey asks no rows of the frame here.
  static taken(campaign: Campaign, command: string, action?: Operator): string | undefined {
    if (action?.movement) { return undefined; }
    const held = Undertakings.held(campaign);
    if (Undertakings.followed(campaign, held)) { return undefined; }
    if (!held.some(o => AimAdvances.of(campaign, this.own(campaign, command), o).has(command))) { return undefined; }
    const view = PlayerView.observe(campaign);
    const pull = HeldActs.pull(Undertakings.shown(campaign, view.objectives ?? [], view.location?.id ?? '').aims ?? []);
    return pull && this.of(campaign, pull.id, AimSaid.short(pull.text)) === command ? pull.id : undefined;
  }
  // The command's own row, where its schema says which (a journey's leg, its way: PlayerView.only), else every row:
  // whether a row moves an aim on is read of that row alone (AimAdvances.of), so the frame is not built to ask it of
  // one act a leg told by its receipt never shows (OR-1361).
  private static own(campaign: Campaign, command: string) {
    const schema = /^([a-z0-9_]+)\(/.exec(command)?.[1];
    return schema && schema !== 'ask' && campaign.module.actions.some(a => a.id === schema)
      ? PlayerView.only(campaign, new Set([schema])).filter(r => r.choice.id === command)
      : PlayerFrame.of(campaign).rows;
  }
  // The aim to follow folded into the act that is its step, where that act is led with or is one of the place's (a
  // talk the four fill in, Offers.scene): the act keeps its doing, and is placed, said, marked and noted as the aim to
  // follow was. A talk is its step where the step is a question put to whoever it is with.
  static fold(campaign: Campaign, at: { acts: Promoted[]; cands: Candidate[] }, pull?: Promoted):
    { acts: Promoted[]; pull?: Promoted } {
    const lead = pull?.aim && HeldLead.of(campaign, pull.aim, pull.label);
    if (!pull || !lead) { return { acts: at.acts, pull }; }
    const speaker = PlayerFrame.of(campaign).row(lead)?.action.speaker;
    const i = at.acts.findIndex(a => this.steps(a, lead, speaker));
    const act = at.acts[i] ?? at.cands.find(c => !c.barred && this.steps(c, lead, speaker));
    if (!act) { return { acts: at.acts, pull }; }
    const taken: Promoted = { ...pull, choice: act.choice, ...act.command ? { command: act.command } : {},
      ...act.subject ? { subject: act.subject } : {}, ...act.unmet ? { unmet: true as const } : {},
      ...'inside' in act && act.inside ? { inside: act.inside } : {}, marks: act.marks,
      // A talk that is the step keeps its own words, the question it is led for what it is called (Doable.row), as
      // any talk led for a question is: drawn in the aim's words it had been "Ask Owain how many head came down" in
      // the engine's rows and "Talk to your cousin" on his likeness and in the lens (offer-parity, 25 November).
      ...act.command === lead ? {} : { for: lead, label: act.label } };
    return { acts: i < 0 ? at.acts : [...at.acts.slice(0, i), ...at.acts.slice(i + 1)], pull: taken };
  }
  private static steps(x: Stepping, lead: string, speaker?: string): boolean {
    return x.command === lead || x.for === lead || !!x.inside?.some(i => i.command === lead)
      || (!!speaker && x.subject === speaker && x.command?.startsWith('talk_to(') === true);
  }
}
