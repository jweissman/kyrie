// Layer: the generic player (presentation). Knows no setting; reads the frame's rows and the projection (Knowing).
import type { Campaign } from '../campaign/campaign';
import { EntityIndex } from '../lang/index';
import { PlayerFrame, type FrameRow } from './player-frame';
import { AimLeads } from './aim-leads';
import { Companions } from './companions';
import { CompanyRecall } from './company-recall';
import { Knowing } from './knowing';
import { GlanceLines } from './glance-lines';

// Why the player is needed where a journey's leg has come, or why not: one engine-owned reading of attention (the fifth
// review, 25 November: "a leg without a frame needs an engine-owned account of attention"; platform-separation.md's
// immediate queue, step 2). Travel had built the whole page (ScreenModel and the narrator's leaf) on every leg where
// something was said, to read from the glance whether anything there asked the player: two definitions of "the player
// is needed". There is one now, read from the frame's rows and the projection (asks): Travel stops by it, and the
// glance carries it (Glance.asks). test/small/arrival-attention holds it to the verdict the glance's offers would
// give (the old oracle, the screen and leaf built whole) over a matrix of arrivals.
export type AttentionReason =
  // What the leg itself came to, the player's whatever else: a fight fought, a way that did not let the company by, a
  // hurt, someone here who would fight it and does not let it be, night come on, weariness, hunger.
  | 'set-upon' | 'barred' | 'hurt' | 'hostile' | 'dark' | 'weary' | 'hungry'
  // What is said to the company where it comes, or going on there and newly seen: the player's only where something
  // here asks (below); else told with the leg as passed.
  | 'said' | 'staged'
  // Heard or met, and asking nothing: a word from whoever goes with the company, something staged seen before, a
  // creature that lets the company be (tolerates it, or a beast at home with no temper to meet a company with).
  | 'aside' | 'seen' | 'tolerated'
  // What here asks of the player (the glance's material aspects and its noticed reasons): a danger with something to
  // do about it besides the fight (a toll, a talk round), a warning, an answer owed, the aim followed's own act, a
  // payoff (spoils, a sale, a lesson), someone who would join, a marvel, a sign, a thing not yet looked at.
  | 'threat' | 'warning' | 'answer' | 'aim' | 'payoff' | 'companion' | 'wonder' | 'sign' | 'unlooked';
// requiresDecision: whether the journey stops here. stop: in the words the page shows under where it stopped; passed:
// what came on the leg and asked nothing, in the words a stop would have said.
export interface Attention { requiresDecision: boolean; reasons: AttentionReason[]; stop?: string; passed?: string }

export class ArrivalAttention {
  // What where the company stands asks of the player, read from the frame's rows and what the company knows and
  // perceives, never from the page. Worked out once a revision.
  static asks(campaign: Campaign): AttentionReason[] {
    const frame = PlayerFrame.of(campaign);
    return frame.reading('arrival attention', () => this.asked(campaign, frame));
  }
  private static asked(campaign: Campaign, frame: PlayerFrame): AttentionReason[] {
    const rows = frame.rows, on = ArrivalAttention.on.bind(ArrivalAttention, frame);
    const bound = new Set([...frame.bound().values()].flat());
    const threats = this.threats(campaign, rows).filter(g => on(g).length > 0);
    const reasons: [AttentionReason, boolean][] = [
      ['threat', threats.length > 0],
      // One of them warning the company off where it stands, and something to be done toward them besides the fight.
      ['warning', threats.some(g => Knowing.warns(campaign, g))],
      // A question just put to the company, and its answer offered (Topic … answering: Operator.answers).
      ['answer', rows.some(r => !!r.action.answers)],
      ['aim', this.aimed(campaign, frame)],
      ['payoff', rows.some(r => this.payoff(campaign, r, frame))],
      ['companion', this.joins(campaign, frame)],
      ['wonder', [...Knowing.marvels(campaign, bound)].some(id => on(id).some(r => r.action.schema !== 'look_closely'))],
      ['sign', this.signs(campaign, frame).some(id => id ? on(id).length > 0 : rows.some(r => r.action.searchPlace))],
      ['unlooked', this.unlooked(campaign, frame)]];
    return reasons.filter(([, holds]) => holds).map(([reason]) => reason);
  }
  // The rows done to someone or something, but the fight with it (the fight is danger's: Travel stops for it) and the
  // ways: those that bind it, are spoken by it, or change its standing (a toll paid at the bar the keepers hold).
  private static on(frame: PlayerFrame, id: string): FrameRow[] {
    const bound = frame.bound();
    return frame.rows.filter(r => !/^(attack|go)\(/.test(r.choice.id) && (r.action.speaker === id
      || (bound.get(r.choice.id) ?? []).includes(id)
      || (r.action.success ?? []).some(c => (c.call?.args ?? []).includes(id))));
  }
  // Whoever could be fought here and does not let the company be (as the page reckons a threat: FightHelp).
  private static threats(campaign: Campaign, rows: readonly FrameRow[]): string[] {
    return rows.filter(r => /^attack\(/.test(r.choice.id)).map(r => r.action.bindings?.opponent ?? '')
      .filter(g => g && !Knowing.tolerates(campaign, g));
  }
  // The aim followed's own act here, not done here yet (AimLeads.advances: what brings about what it waits on).
  private static aimed(campaign: Campaign, frame: PlayerFrame): boolean {
    const here = Knowing.here(campaign) ?? '', recall = CompanyRecall.of(campaign);
    return [...AimLeads.advances(campaign, frame.rows)].some(c => !!frame.row(c) && !recall.did(here, c));
  }
  // A treasure lying here to take up, not someone's; something of the company's to sell; a lesson to be had.
  private static payoff(campaign: Campaign, r: FrameRow, frame: PlayerFrame): boolean {
    const schema = r.action.schema ?? r.action.id;
    if (['sell_valuable', 'train_member', 'learn_spell'].includes(schema)) { return true; }
    const item = /^(take_item|take_out)\(/.test(r.choice.id) ? frame.bound().get(r.choice.id)?.[0] : undefined;
    return !!item && Knowing.spoils(campaign, item);
  }
  // Someone here who would join the company: asked along (recruit), or asked what would have them willing.
  private static joins(campaign: Campaign, frame: PlayerFrame): boolean {
    const possible = Companions.possible(campaign), alone = campaign.readout.partyIds.length <= 1;
    return frame.rows.some(r => {
      const schema = r.action.schema ?? r.action.id, who = r.action.speaker ?? frame.bound().get(r.choice.id)?.[0];
      return (schema === 'recruit' && (alone || (!!who && possible.has(who)))) || (!!r.action.speaker
        && possible.has(r.action.speaker) && (r.action.success ?? []).some(c => c.kind === 'assert'
          && c.call?.name.replace(/^.*__/, '') === 'willing'));
    });
  }
  // The signs perceived here and not seen before, by whom or what they are of ('' for the place's own). What is
  // perceived is worked out only where the module has a sign to perceive.
  private static signs(campaign: Campaign, frame: PlayerFrame): string[] {
    const defs = GlanceLines.defs(campaign.module), recall = CompanyRecall.of(campaign);
    if (![...defs.values()].some(d => d.aspect === 'sign')) { return []; }
    const knowing = frame.knowing, there = new Set(knowing.inView);
    return knowing.perceived.observations.flatMap(o => {
      const def = defs.get(o.id.split('@')[0]!);
      return def?.aspect === 'sign' && !recall.saw(o.id) ? [GlanceLines.whose(def, o.id, there) ?? ''] : [];
    });
  }
  // A mechanism or a door here not yet looked at closely.
  private static unlooked(campaign: Campaign, frame: PlayerFrame): boolean {
    const here = Knowing.here(campaign) ?? '', recall = CompanyRecall.of(campaign);
    const byId = EntityIndex.of(campaign.module.entities).byId;
    return frame.rows.some(r => r.action.schema === 'look_closely' && !recall.did(here, r.choice.id)
      && (frame.bound().get(r.choice.id) ?? []).some(t => ['mechanism', 'door'].includes(byId.get(t)?.type ?? '')));
  }
}
