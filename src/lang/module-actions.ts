import type * as ohm from 'ohm-js';
import type { ModuleParser } from './module-parser';
import { ActionParts } from './action-parts';
import { CatalogParser } from './catalog-parser';
import { Endings } from './endings';
import { InformationParser } from './information-parser';
import { Milestones } from './milestones';
import { ObjectParser } from './object-parser';
import { PersonParser } from './person-parser';
import { Routes } from './routes';
import { StatementParser } from './statement-parser';

// The module grammar's actions, read when its semantics are first made, not as the parser loads: each names a parser
// that imports the module parser, so read at load it could be half-made (OR-542). The module parser is handed in.
export class ModuleActions {
  static of(M: typeof ModuleParser): ohm.ActionDict<unknown> { return { ...this.first(M), ...this.rest(M) }; }
  private static first(M: typeof ModuleParser): ohm.ActionDict<unknown> {
    return {
      Place: M.Place, PlaceParent: M.PlaceParent, PlaceGrid: M.PlaceGrid,
      PlaceAlias: M.PlaceAlias, PlaceShelter: M.text, PlaceDepth: M.PlaceDepth,
      ObservationAspect: M.Second, ItemPlace_at: ObjectParser.At, WonderPart: ObjectParser.WonderPart,
      ObservationBy: M.Third, ObservationInstead: M.Third, TopicAnswering: M.Second,
      Passage: M.Passage, PassagePart_oneway: M.OneWay, PassagePart_hidden: M.Hidden,
      PassagePart_needs: M.Needs, NeedsEnd_to: M.NeedsTo, NeedsEnd_from: M.Anchor,
      Thing: M.Thing, ThingSite_in: ObjectParser.In, ItemEnd_parts: ObjectParser.ItemParts,
      HoldsPart: ObjectParser.HoldsPart, MarvelPart: ObjectParser.MarvelPart, Concealed: ObjectParser.Concealed,
      ItemPlace_in: ObjectParser.In, FoundBy: M.FoundBy, FoundWith: ObjectParser.FoundWith,
      ThingSite_at: M.Site, ThingSite_on: ObjectParser.SiteOn, WayEnd: ObjectParser.WayEnd,
      ThingKind: M.ThingKind, StatePart: M.StatePart, PersonLeavesTo: PersonParser.PersonLeavesTo,
      ChangePart: M.ChangePart, ChangeNeeds: M.ChangeNeeds, ChangeAfter: M.Third,
      ChangeConsumes: M.Second, HurtsPart: M.HurtsPart, GuardsPart: M.GuardsPart,
      TriesPart: M.TriesPart, MemberBinding: StatementParser.MemberBinding, LeavesTo: PersonParser.LeavesTo,
      Event: M.Event, EventTail_effects: M.EventEffects, EventTail_plain: M.EventPlain,
      Anchor_at: M.Anchor, Anchor_near: M.Anchor, Anchor_beside: ObjectParser.Beside,
      Anchor_within: M.Anchor, RuleWhere_heard: M.Heard, Objective: M.Objective,
      PersonCalled: PersonParser.PersonCalled, GreetsAgain: PersonParser.GreetsAgain,
      WonderKind: ObjectParser.WonderKind,
      PersonHorizon: PersonParser.PersonHorizon, PersonPeaceable: PersonParser.PersonPeaceable,
      RuleSays: PersonParser.RuleSays, Seen: M.Seen, TopicOnce: PersonParser.TopicOnly,
      TopicTravelling: PersonParser.TopicOnce, RuleOnce: PersonParser.TopicOnce, PersonAgain: PersonParser.PersonAgain,
      Company: M.Company, ItemDecl: M.ItemDecl, PassageKind: M.ThingKind,
      PassagePart_taking: M.Taking, PassagePart_opening: M.Opening,
      PersonProfession: PersonParser.PersonProfession, Meanwhile: StatementParser.Meanwhile,
      PersonBackground: PersonParser.PersonBackground, OffersPart: M.OffersPart,
      SellsPart: M.SellsPart, BuysPart: M.BuysPart, Time_fixed: StatementParser.Time,
      Time_minutes: StatementParser.Minutes, Time_measured: StatementParser.Duration,
      Exit: M.Exit, ExitDoor: M.ExitDoor, ExitKnowledge: M.ExitKnowledge,
      Person: M.Person, PersonRole: PersonParser.PersonRole, RoleWhen: PersonParser.RoleWhen,
      PersonKnown: PersonParser.PersonKnown, PersonRemarks: PersonParser.PersonRemarks,
      PersonRace: PersonParser.PersonRace, PersonClass: PersonParser.PersonClass, WonderFor: ObjectParser.WonderFor,
      PersonLevel: PersonParser.PersonLevel, PersonSpecies: PersonParser.PersonSpecies,
      PersonVariant: PersonParser.PersonVariant, PersonSeen: PersonParser.PersonSeen,
    };
  }
  private static rest(M: typeof ModuleParser): ohm.ActionDict<unknown> {
    return {
      PersonCreature: PersonParser.PersonCreature, PersonCount: PersonParser.PersonCount,
      PersonTrait: PersonParser.PersonTrait, PersonCarries: PersonParser.PersonCarries,
      HazardDecl: M.HazardDecl, PersonUses: PersonParser.PersonUses, PersonWants: PersonParser.PersonWants,
      Topic: M.Topic, TopicEffects: M.TopicEffects, Lessen: StatementParser.Lessen,
      ToNothing: StatementParser.ToNothing, Information_parts: M.Information,
      InformationSource: M.InformationSource,
      ChangeAt: M.Second, ItemOwner: M.Third,
      PersonManner: PersonParser.PersonManner, PersonPronouns: PersonParser.PersonPronouns,
      PersonHaunt: PersonParser.PersonHaunt, Grave: PersonParser.Grave,
      Module: M.Module, Observation: M.Observation, Speaker: PersonParser.Speaker,
      WorldRule: M.WorldRule, Pursuit: M.Pursuit, PursuitUsing: M.PursuitUsing,
      Kind: StatementParser.Kind, Relation: M.Relation, Measure: M.Measure,
      Query: M.Query, Verb: M.Verb, Parameter: StatementParser.Parameter, Entity: M.Entity,
      Initial: StatementParser.Initial, Goal: StatementParser.Goal, Budget: StatementParser.Budget,
      Description: StatementParser.Description, ActionParameters: StatementParser.ActionParameters,
      Action: M.Action, Requires: StatementParser.Requires, Give: StatementParser.Give,
      GiveWhat: StatementParser.GiveWhat, Success: M.Success, Failure: M.Failure,
      Cost: StatementParser.Cost, Resolve: StatementParser.Resolve, ChangeStatement: StatementParser.ChangeStatement,
      Consequence_guarded: StatementParser.Guarded,
      Interruption: StatementParser.Interruption, Watchful: StatementParser.Watchful,
      Assert: StatementParser.Assert, Retract: StatementParser.Retract, Set: StatementParser.Set,
      Increase: StatementParser.Increase, Decrease: StatementParser.Decrease, Spend: StatementParser.Spend,
      Bring: StatementParser.Bring, ThingSite_nowhere: ObjectParser.Nowhere, ItemPlace_nowhere: ObjectParser.Nowhere,
      Or_binary: StatementParser.Or, And_binary: StatementParser.And,
      Unary_not: StatementParser.Not, Unary_group: StatementParser.Group,
      Unary_true: StatementParser.True, Unary_false: StatementParser.False,
      Comparison: StatementParser.Comparison, Call: StatementParser.Call,
      Value: StatementParser.Value, expression: StatementParser.Expression, integer: StatementParser.Integer,
      string: StatementParser.String, Product: StatementParser.Value, Operand_group: StatementParser.Group,
      Operand_extreme: StatementParser.Extreme, ExtremeArgs: StatementParser.ExtremeArgs, ...ActionParts.actions,
      Operand_given: StatementParser.Given, Restore: StatementParser.Restore, Slay: StatementParser.Slay,
      Operand_count: StatementParser.Count,
      ...CatalogParser.actions, ...InformationParser.actions, ...Endings.actions, ...Milestones.actions,
      ...PersonParser.actions, ...Routes.actions,
    };
  }
}
