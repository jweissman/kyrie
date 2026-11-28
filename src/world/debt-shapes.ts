import tables from '../../data/origins/tables.json';
import { Draw } from './land/draw';
import { RegionKey } from './region-key';
import { RegionGeography } from './region-geography';
import { Terrain } from './land/terrain';
import { SettlementWriter } from './settlement-writer';
import type { Region, Settlement } from './region-writer';

export type DebtShape = 'salvage' | 'carry' | 'recover';
export interface Drawn { shape: DebtShape; lines: string; values: Record<string, string>;
  imports: Record<string, [string, string]> }

// The debt's chain, drawn from the country (the difference census's second proposal: the debt's warrior had held the
// same three aims in every world). By the country's key, one of three shapes, each a whole chain an hour can finish:
//   salvage  the inn's word of the old places round about, and what is in them sold (as it had been everywhere);
//   carry    the creditor's own trade sets the work: a load carried to the merchant of the nearest other town, and
//            what that merchant owes the creditor carried back, and the debt is square;
//   recover  the lost thing sets where it went: what went into the river at the ford fished out downstream and sold
//            at the nearest other town, to be claimed (a word, or a finder's fee) and carried home to the creditor.
// The lines go into the debt's module (data/origins/debt/origin.kyr's {out}).
export class DebtShapes {
  static of(region: Region, s: Settlement, owing: string, salvage: string): Drawn {
    const other = this.other(region, s);
    const shapes: DebtShape[] = [...salvage ? ['salvage' as const] : [], ...other ? ['carry' as const, 'recover' as const] : []];
    const fixed = shapes.find(x => x === region.chain);
    const shape = fixed ?? (shapes.length ? new Draw(`${RegionKey.of(region)}:debt-chain`).pick(shapes) : 'salvage');
    if (shape === 'salvage' || !other) { return { shape: 'salvage', lines: this.work(owing) + salvage, values: {}, imports: {} }; }
    const values = { othertown: other.name, carried: (tables.lost as Record<string, string>)[s.trade]
      ?.replace(/^a (cart|cartload|raft|load|bale) of/, 'a sack of') ?? 'a sealed sack of goods' };
    const imports: Record<string, [string, string]> = { other: [`region.${other.id}_merchant`, 'group'],
      otherplace: [`region.${SettlementWriter.standing(region, other, 'merchant')}`, 'place'] };
    return { shape, lines: shape === 'carry' ? this.carry() : this.recover(), values, imports };
  }
  // The nearest other town that has a merchant: where a load goes, or what was lost turns up.
  static other(region: Region, s: Settlement): Settlement | undefined {
    const land = RegionGeography.atlas(region).land;
    return region.settlements.filter(x => x !== s && x.cell !== undefined && s.cell !== undefined && x.merchant)
      .sort((a, b) => Terrain.distance(land, s.cell!, a.cell!) - Terrain.distance(land, s.cell!, b.cell!))[0];
  }
  // The salvage's first word: ask at the inn what is out in the country round.
  private static work(owing: string): string {
    return `  Objective owing_work when ${owing.replace(' and knows(party, told)', '')} and not knows(party, told) `
      + 'toward keeper "You owe {creditor} {owed(loan)} coin by market day. There is work for someone with nothing to '
      + 'lose: ask {keeper} at {inn} what is out in the country round.".\n';
  }
  private static carry(): string {
    return `  Entity other: group "The merchant at {othertown}". Place otherplace "Where {othertown} trades" is room.
  Relation carrying(group).
  Entity bale_given: fact "{creditor} gave you {carried} for the merchant at {othertown}.".
  Entity purse_given: fact "The merchant at {othertown} paid what was owed to {creditor}.".
  Kind bale_kind "a sealed bale" is gear worth 0 weighing 2 described "Tied and sealed with {creditor}'s mark.".
  Kind purse_kind "a sewn purse" is gear worth 0 weighing 1 described "Heavy, and sewn shut.".
  Item bale "{carried}" is bale_kind at shop hidden until bale_given.
  Item purse "a purse for {creditor}" is purse_kind at otherplace hidden until purse_given.
  Topic carry_ask with creditor "Ask {creditor} to take the debt in work" when owed(loan) > 0 and not called(actor) and not carrying(actor) once {
    Says "'Work,' says {creditor}, and thinks. 'Take {carried} to the merchant at {othertown}, and bring back what is owed me for the last lot. Do that and we are square.'".
    On discuss { Assert carrying(actor). Assert spoke(actor). Assert knows(actor, bale_given). Give bale to actor. }
  }
  Topic carry_hand with other "Give {other} {carried} from {creditor}" when holding(actor, bale_kind) once {
    Says "{other} breaks the seal and counts the goods twice. 'Late, but whole,' says {other}, and sews coin into a purse for {creditor}.".
    On discuss { Spend bale_kind from actor. Assert knows(actor, purse_given). Give purse to actor. }
  }
  Topic carry_back with creditor "Give {creditor} the purse from {othertown}" when holding(actor, purse_kind) and owed(loan) > 0 once {
    Says "{creditor} weighs the purse and does not open it. 'That is the carriage, and that is the debt,' says {creditor}. 'We are square.'".
    On discuss { Spend purse_kind from actor. Set owed(loan) to 0. Retract inDebtTo(actor, creditor). Assert squared(actor). Assert knows(actor, named). Assert knows(actor, found). }
  }
  Objective owing_carry when owed(loan) > 0 and not called(party) and spoke(party) and not carrying(party) toward creditor "You owe {creditor} {owed(loan)} coin by market day. {creditor} might take it in work: ask.".
  Objective carry_go when holding(party, bale_kind) toward other "Carry {carried} to the merchant at {othertown}, and the debt to {creditor} is paid.".
  Objective carry_return when holding(party, purse_kind) and owed(loan) > 0 toward creditor "Take the purse from {othertown} back to {creditor}, and you are square.".
`;
  }
  private static recover(): string {
    return `  Entity other: group "The merchant at {othertown}". Place otherplace "Where {othertown} trades" is room.
  Relation lostClaimed(group).
  Entity lost_seen: fact "What you lost at the ford was fished out downstream, and is for sale at {othertown}.".
  Entity lost_back: fact "The merchant at {othertown} gave you back {lost}.".
  Kind lost_kind "{lost}" is gear worth 0 weighing 3 described "Yours: river-stained, and short of a little, but yours.".
  Item lost_goods "{lost}" is lost_kind at otherplace hidden until lost_back.
  Topic lost_where with creditor "Ask {creditor} whether anything was ever found of {lost}" when owed(loan) > 0 and not called(actor) and not knows(actor, lost_seen) once {
    Says "{creditor} looks up. 'Found? It was sold. Somebody fished it out below the ford and took it to {othertown}. Bring it back and I will call it square.'".
    On discuss { Assert knows(actor, lost_seen). Assert spoke(actor). }
  }
  Action lost_claim(actor: group, site: place) "Tell the merchant at {othertown} that {lost} is yours" {
    Requires able(actor) and company(actor) and at(actor, site) and at(actor, otherplace) and at(other, otherplace) and knows(actor, lost_seen) and not lostClaimed(actor).
    Time 10 minutes.
    Resolve check(actor, persuasion, dc_fair).
    On success { Assert lostClaimed(actor). Assert knows(actor, lost_back). Give lost_goods to actor. }
    On failure { Assert lostClaimed(actor). }
    Result "{other} looks at the stain on it, and at you, and pushes it across the counter. 'I paid a man for that. I would sooner not have it in the shop.'".
    Otherwise "'Everybody's is,' says {other}. 'Five coin, and it is yours again.'".
  }
  Topic lost_buy with other "Pay {other} five coin for {lost}" when lostClaimed(actor) and not knows(actor, lost_back) and quantity(actor, gold) >= 5 once {
    Says "{other} counts the coins and pushes it across the counter.".
    On discuss { Decrease quantity(actor, gold) by 5. Assert knows(actor, lost_back). Give lost_goods to actor. }
  }
  Topic lost_home with creditor "Give {creditor} {lost} back" when holding(actor, lost_kind) and owed(loan) > 0 once {
    Says "{creditor} runs a hand over it and says nothing for a while. 'Short of a little,' says {creditor}. 'We are square all the same.'".
    On discuss { Spend lost_kind from actor. Set owed(loan) to 0. Retract inDebtTo(actor, creditor). Assert squared(actor). Assert knows(actor, named). Assert knows(actor, found). }
  }
  Objective owing_lost when owed(loan) > 0 and not called(party) and spoke(party) and not knows(party, lost_seen) toward creditor "You owe {creditor} {owed(loan)} coin by market day, for {lost}. Ask {creditor} whether anything was ever found of it.".
  Objective lost_go when knows(party, lost_seen) and not holding(party, lost_kind) and owed(loan) > 0 toward other "What you lost at the ford is for sale at {othertown}: claim it from the merchant there.".
  Objective lost_return when holding(party, lost_kind) and owed(loan) > 0 toward creditor "Take {lost} back to {creditor}, and you are square.".
`;
  }
}
