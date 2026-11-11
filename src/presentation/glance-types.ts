import type { AfterAct } from './decision-frame';

// A place at a glance (OWN-18, OWN-19): what the page leads with where the company stands, decided by the engine so
// that the page draws and does not guess. The full telling, every person and every way stay behind "Look about",
// "Every way" and "More": nothing written is lost, and nothing legal is left out.

// How the company came to be where the glance is of: the game's first page; a place come to for the first time, or
// again; the same place after something done in it; or a game taken up again (set by the host).
export type Arrival = 'opening' | 'first' | 'return' | 'stay' | 'resume';
// What makes a choice worth leading with (the cold review's affordance facets): it can be done here and now; it serves
// what the company is about; something is pressing or has just changed; it is new to the company. One only known (done
// before, nothing new about it) is never led with.
export type Facet = 'here' | 'aimed' | 'urgent' | 'new' | 'known';
// What an opportunity is to the company that sees it (see Aspects): the aim it follows, somewhere worth exploring,
// something to gain, something to learn, a danger, a wonder. Meaning, not colour.
export type Aspect = 'undertaking' | 'exploration' | 'payoff' | 'knowledge' | 'danger' | 'wonder' | 'companionship';
// Why a choice was led with, best first by tier (Promotion.tiers).
export type Why =
  // Must: the company held where it is (asleep, stunned) with nothing to do but lie as it is, an answer to a question
  // just put, a danger here, a way back from it, someone warning the company off, the dark with no light.
  | 'helpless' | 'answer' | 'danger' | 'retreat' | 'warned' | 'dark'
  // The aim: the journey set out on, kin, what the aim names, a way the aim names, a way toward it, another aim held.
  | 'bound' | 'kin' | 'about' | 'named' | 'toward' | 'held'
  // In a site, a way further into it not yet taken: whatever aim is followed, a site is gone into, not out of.
  | 'deeper' | 'onward'
  // What the company needs: food, mending, a bed for the night, a camp.
  | 'hungry' | 'hurt' | 'night' | 'exposed'
  // The place: whoever is the life of it, one of its own acts, a sign not seen before, someone with something to ask,
  // something not looked at closely.
  | 'life' | 'own' | 'sign' | 'asked' | 'unlooked'
  // What was won, put to use: someone here who buys a treasure the company carries; someone who adds to what it can do
  // (a lesson, a spell) for what it can pay.
  | 'spoils' | 'means'
  // Someone who could join the company: willing now, or with something to be asked that would make them so.
  | 'companion'
  // A way about a settlement or site not yet taken.
  | 'unvisited';
// What a choice risks, or needs said before it is chosen.
export type MarkKind = 'one-way' | 'grave' | 'fight' | 'trap' | 'unlooked' | 'heard' | 'exposed' | 'warned' | 'night';
// ask: the page asks again before it is done.
// danger: a fight's, as reckoned, so that an easy one is not drawn as a deadly one is.
export interface Mark { kind: MarkKind; said: string; ask?: boolean; danger?: 'slight' | 'fair' | 'hard' | 'grave' | 'deadly' }
export type Tier = 0 | 1 | 2 | 3 | 4;
export interface Promoted {
  // The exact id of the choice the page draws (MenuModel.build(frame, 'here', []).choices): the page resolves nothing.
  choice: string;
  // The command it does (a PlayerView choice, or travel:<place>), for headless use; an opener (a talk) has its own.
  command?: string;
  // Within an opener (a talk), what it is led for: the first new thing to ask someone an aim names, or what the
  // company needs of them (a bed at night, a light, a hand); headless players take it there, as a player would.
  for?: string;
  subject?: string; exit?: string;
  label: string;
  why: Why; facets: Facet[]; tier: Tier;
  // What it is to the company, chiefly first (see Aspects); none for a need or the way back.
  aspects: Aspect[];
  // The one led act that is the followed aim's known next step, where one is known (see Promotion.continued): the
  // foreground's recommended continuation, whether or not the page shows it as such.
  continues?: true;
  // What the reason is, in words beside it: "your brother", "your aim", "the way you came", how a fight would go.
  note?: string;
  marks: Mark[];
}
export interface Glance {
  arrival: Arrival;
  // Coming here after a journey: one line of it (the legs stay in Look about).
  came?: string;
  // The place's own distinctive line, at most two sentences; none while staying.
  sight?: { id: string; text: string };
  // A sign of life now: a danger, whoever warns, a person's words or doings, the place's passing life.
  life?: { id?: string; text: string; subject?: string; danger?: boolean };
  // On a return, what has changed since the company was last here: at most two lines.
  changed: string[];
  // At most three, the best first.
  acts: Promoted[];
  // At most three choice ids for the quiet row of ways, none of them among the acts.
  ways: string[];
  // Places left twice having done nothing there, with nothing new since (see CompanyRecall.idle): a way to one has
  // nothing new to give for now, and is drawn dim, though it can be taken (and is lit again when anything changes).
  idle?: string[];
  // What the company perceives beyond here, by the way it lies along (see Perception): never a thing to do from here.
  sensed?: Sensed[];
  // Every choice id (an exit, a travel:) the company's aims name: the page's "your aim", decided here.
  aimed: string[];
  // Of those, the ones that go where the aim followed names, first among them (the rest are other aims held).
  following?: string[];
  // The aim, said when no act serves it, on a first arrival, or when it has changed.
  aim?: string;
  // On the game's first page, the first goal the company's own errand gives it, said once in so many words.
  goal?: string;
  // The company's state, said only when something is wrong (hungry, hurt, weary, in the dark).
  need?: string[];
  // After an act: what was attempted, what came of it, what it changed, and the act it made relevant (REV-05).
  after?: AfterAct;
}
// A kind of opportunity perceived along a way from here, the nearest so many places off (1: where the way comes to).
export interface Sensed { to: string; aspect: Aspect; far: number }
