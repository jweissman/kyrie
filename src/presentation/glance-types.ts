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
// Why a choice was led with, best first by tier (Promotion.tiers).
export type Why =
  // Must: an answer to a question just put, a danger here, a way back from it, someone warning the company off, the
  // dark with no light.
  | 'answer' | 'danger' | 'retreat' | 'warned' | 'dark'
  // The aim: the journey set out on, kin, what the aim names, a way the aim names, a way toward it, another aim held.
  | 'bound' | 'kin' | 'about' | 'named' | 'toward' | 'held'
  // What the company needs: food, mending, a bed for the night, a camp.
  | 'hungry' | 'hurt' | 'night' | 'exposed'
  // The place: whoever is the life of it, one of its own acts, a sign not seen before, someone with something to ask,
  // something not looked at closely.
  | 'life' | 'own' | 'sign' | 'asked' | 'unlooked'
  // A way about a settlement or site not yet taken.
  | 'unvisited';
// What a choice risks, or needs said before it is chosen.
export type MarkKind = 'one-way' | 'grave' | 'fight' | 'trap' | 'unlooked' | 'heard' | 'exposed' | 'warned' | 'night';
// ask: the page asks again before it is done.
export interface Mark { kind: MarkKind; said: string; ask?: boolean }
export type Tier = 0 | 1 | 2 | 3 | 4;
export interface Promoted {
  // The exact id of the choice the page draws (MenuModel.build(frame, 'here', []).choices): the page resolves nothing.
  choice: string;
  // The command it does (a PlayerView choice, or travel:<place>), for headless use; an opener (a talk) has its own.
  command?: string;
  subject?: string; exit?: string;
  label: string;
  why: Why; facets: Facet[]; tier: Tier;
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
  // Every choice id (an exit, a travel:) the company's aims name: the page's "your aim", decided here.
  aimed: string[];
  // The aim, said when no act serves it, on a first arrival, or when it has changed.
  aim?: string;
  // The company's state, said only when something is wrong (hungry, hurt, weary, in the dark).
  need?: string[];
}
