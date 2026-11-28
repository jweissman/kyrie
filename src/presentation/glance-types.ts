import type { AttentionReason } from './arrival-attention';
import type { AfterAct } from './decision-frame';
import type { Continuance } from './aim-continuity';
import type { AimLead } from './aim-lead';

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
  // The aim: what it waits on, done here; the journey set out on, kin, what the aim names, a way the aim names, a way
  // toward it, another aim held.
  | 'advance' | 'bound' | 'kin' | 'about' | 'named' | 'toward' | 'held'
  // Someone who would go along, or the way to them, where the aim followed leads into a fight the company reckons
  // beyond it going alone (see Outmatched).
  | 'help'
  // In a site, a way further into it not yet taken: whatever aim is followed, a site is gone into, not out of.
  | 'deeper' | 'onward'
  // Out of a site gone through, toward the nearest place outside it: somewhere true to go, marked (OR-411).
  | 'out'
  // Where every way about the place goes somewhere been, the one that leads on to the nearest place of the hex not yet
  // been to (the shrine with the woods' edge walked, a dead-end recess): somewhere true to go, marked (OR-1502).
  | 'leads'
  // What the company needs: food, mending, a bed for the night, a camp.
  | 'hungry' | 'hurt' | 'night' | 'exposed'
  // The place: whoever is the life of it, one of its own acts, a sign not seen before, someone with something to ask,
  // something not looked at closely.
  | 'life' | 'own' | 'sign' | 'asked' | 'unlooked' | 'wonder'
  // Whoever the company is talking with: what is next to ask them (the reeve's own topics had stood in the rest while
  // she was spoken to: cold play 4, CL-49).
  | 'talking'
  // What was won, put to use: someone here who buys a treasure the company carries; someone who adds to what it can do
  // (a lesson, a spell) for what it can pay.
  | 'spoils' | 'means'
  // Someone with something for the company now: thanks that pay, a payment owed (see Owed). The talk with them is a
  // payoff, as the act inside it is (the owner, 18 November: the wagoner's thanks green, and nothing outside said so).
  | 'owed'
  // Someone who could join the company: willing now, or with something to be asked that would make them so.
  | 'companion'
  // A way about a settlement or site not yet taken.
  | 'unvisited'
  // A way into a settlement from its own country, the company outside it (the owner, 11 November late: in the hex of
  // Elmham the page had led toward a far aim and to look out over the country, and the town was only under Go…).
  | 'entry'
  // A way or an act the company's last act opened (a padlock picked: the corn-store it held shut).
  | 'opened'
  // Nothing else to do here: a way on, so that a place is never left with nothing in front of the company.
  | 'way'
  // In a lens, one of its own acts with no reason beyond being there (talking to whoever is here): promoted after
  // those with a reason, so that a lens with acts of its kind is never empty (see Promotion.lenses).
  | 'present';
// What a choice risks, or needs said before it is chosen.
export type MarkKind = 'one-way' | 'grave' | 'fight' | 'trap' | 'unlooked' | 'heard' | 'lurks' | 'exposed' | 'warned'
  | 'night' | 'gutters';
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
  // A talk with someone not yet met: led as talking to them, for what it is led for (see Doable.called).
  unmet?: true;
  // What it is or may be led for (for, inside), each by the world's whole words (LedWords): what a talk led for it is
  // called by.
  words?: Record<string, string>;
  // Within an opener, the act each of its aspects is for, best first (see Promotion.inside): the page draws each where
  // the player finds it, the topic that teaches in blue, the asking to come along in rose.
  // borne: an act that bears what the opener is drawn as, and nothing it is led for (Promotion.inside).
  inside?: { command: string; aspects: Aspect[]; borne?: true }[];
  label: string;
  why: Why; facets: Facet[]; tier: Tier;
  // Drawn for an aim held and not followed (why held): which aim, by id (see Undertakings.heldFor).
  aim?: string;
  // What it is to the company, chiefly first (see Aspects); none for a need or the way back.
  aspects: Aspect[];
  // The one led act that is the followed aim's known next step, where one is known (see Promotion.continued): the
  // foreground's recommended continuation, whether or not the page shows it as such.
  continues?: true;
  // Led for something more pressing (a danger), but what the aim followed waits on all the same: the rats the
  // corn-store job is to clear, fought (see Promotion.continued). The aim's next step before any way to its place.
  advances?: true;
  // A way into a town from its own country (see Affordances, entry): the map's card for the hex offers it.
  enters?: true;
  // What it is lies where it goes, perceived from here, not present: drawn faint (the owner, 11 November night: a road
  // into a place inherits a fainter version of the place's known identity).
  afar?: true;
  // What the reason is, in words beside it: "your brother", "your aim", "the way you came", how a fight would go.
  note?: string;
  marks: Mark[];
}
// An attention lens over the one resting scene (CN-01, CN-05; the owner, 14 November): the things at hand, the people
// here, the places to go, and time (the waiting acts that exist). Choosing one is not a world act and takes no time:
// each lens is read off the same glance, from the same candidates the resting scene's four come from.
export type Lens = 'things' | 'people' | 'places' | 'time';
// One act in a lens's rest: what the page draws it as and does it by, and why it is not now (disabled).
export interface LensAct { choice: string; label: string; command?: string; subject?: string; disabled?: string }
// A lens's promoted acts (at most four, ranked as the resting scene's are; gold only on the glance's own next step) and
// the rest of its acts, in the scene's order.
// leaves: of each opener among them (a talk, a look, with no command of its own), the acts within it.
// subjects: of the subjects among them that the scene draws no one for (a thing on a way, the way itself), the name
// and what is seen of it (its state's words: the riddle cut across the speaking door).
// aspects: what its four are, together, in the order every client ranks them: all its mark may show, so a mark never
// says what none of the rows under it is (the owner, 17 November).
// kept: what the resting scene led with that will not wait or carries the aim on, and that this lens does not draw (the
// badger's Attack under Look, the windlass's fresh try under Talk): kept above it, as the four drew it, so that opening
// a lens never puts it a lens away (OR-240). Its rows take places of the four; it is no part of the lens's mark.
export interface Lensed { promoted: Promoted[]; rest: LensAct[]; leaves?: Record<string, LensAct[]>;
  subjects?: Record<string, { name: string; seen?: string[] }>; aspects: Aspect[]; kept?: Promoted[] }
// A route the compass gives (see Compass): where it comes to, the ways in order, the time, the command that walks it
// (travel:<place>, leg by leg; or the one way's own), and what bars it, if anything.
export interface Route { to: string; name: string; ways: string[]; minutes: number; command?: string; barred?: string }
// Inside an enclosed place, the way out, the next known place worth going, and whether nothing known is left inside.
export interface Compass { out?: Route; next?: Route; exhausted: boolean }
// What a likeness here is to the company (see Likenesses): its aspects, or the undertaking alone where it is the
// followed aim's next step.
export interface Likeness { aspects: Aspect[]; continues?: true }
export interface Glance {
  arrival: Arrival;
  // What here asks of the player, if anything (the engine's one account of attention: ArrivalAttention.asks), as a
  // journey's leg reads it to stop there.
  asks?: AttentionReason[];
  // Coming here after a journey: one line of it (the legs stay in Look about); and, where it went by more than one
  // leg, the words of the control that opens them, a control of its own beside the line, which is told (OR-246: the
  // line had been the disclosure, and read as a line of the log).
  came?: string;
  legs?: string;
  // The place's own distinctive line, at most two sentences; none while staying.
  sight?: { id: string; text: string };
  // A sign of life now: a danger, whoever warns, a person's words or doings, the place's passing life.
  life?: { id?: string; text: string; subject?: string; danger?: boolean };
  // What lies here to be taken, read or opened, said once on coming here (see GlanceLines.contents).
  contents?: { text: string; subjects: string[] };
  // On a return, what has changed since the company was last here: at most two lines.
  changed: string[];
  // At most three, the best first.
  acts: Promoted[];
  // At most three choice ids for the quiet row of ways, none of them among the acts.
  ways: string[];
  // Inside a site or underground, the way the company came, open to it (an exit id): kept in sight on the scene.
  back?: string;
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
  // The aim followed and its next step, and where that step was learned (US-07): at Mistlake, the speaking door.
  lead?: AimLead;
  // How the aim followed goes on from here: its step gold, led with, or what stands said (see AimContinuity).
  continuance?: Continuance;
  // Each lens's acts (see Lens).
  lenses: Record<Lens, Lensed>;
  // Each subject led with, by its id: the one indicator its likeness is drawn with (see Likenesses).
  likenesses?: Record<string, Likeness>;
  // Inside a building, a site, under the ground or aboard (see Compass): no overland act is offered from here.
  enclosed?: true;
  compass?: Compass;
  // On the game's first page, the first goal the company's own errand gives it, said once in so many words.
  goal?: string;
  // As the aim followed is seen through, the one thing that pulls next (see Succession): offered, never followed.
  next?: Successor;
  // The company's state, said only when something is wrong (hungry, hurt, weary, in the dark).
  need?: string[];
  // Each barred way on in a site, what it needs and who has it, typed (see Threshold.leads, Means).
  leads?: import('./means').Lead[];
  // After an act: what was attempted, what came of it, what it changed, and the act it made relevant (REV-05).
  after?: AfterAct;
  // The scene's four, and every other choice of it, for every client (see Offers).
  offer?: import('./offer').Offer;
  // How the scene's rail of lenses is drawn at rest (OR-1084, the owner, 26 November: "fade the lenses rail in the
  // resting scene, or at least let it be folded into a single icon"): folded to one emblem, the diamond, always
  // there (OR-1880), which unfolds to the lenses had when the engine says so or when taken up, by a pointer or the
  // keys; the compass and the book stay beside it. A render hint every client takes alike (see Rail).
  rail?: Rail;
}
export type RailLens = 'talk' | 'go' | 'look' | 'wait' | 'search';
// The rail as the owner set it (27 November, late, OR-1880), every client drawing it alike:
// tools: what the character has from the start, beside the diamond and never folded: the compass (the ways out of a
// structure and between the places within the hex: the places lens, Go's, is the compass's), and the book, unless the
// character cannot read.
// lenses: the lenses had (Surfaces), folded behind the diamond; the compass's Go is never among them.
// diamond: always drawn; what the folded lenses hold, by their rows (Lensed.aspects), a coloured opportunity or someone
// who might join, in the one precedence; none, and it is dim.
// unfolded: whether the lenses stand open beside it: after act I, or while one of them holds something (the diamond
// lit). A player may still fold or unfold them at the diamond.
// keep: the company's own page, reachable from every resting scene whatever is earned (the owner's play, 27 November,
// OR-1685: "minimally we may always want the book available, even if tucked away"): what the book opens.
export type RailTool = 'compass' | 'book';
export interface Rail { fold: 'folded'; lenses: RailLens[]; keep?: Keep; tools: RailTool[]; diamond: Aspect[];
  unfolded: boolean }
export interface Keep { view: 'company'; label: string }
// What pulls once an aim is seen through (PL-06): the deed's own consequence (the yoke, to be hung over the drover's
// hearth: at, where) or a lead not followed (an aim held, to follow; or a place something known leads to). Its words
// are the act's, the aim's or the fact's, one sentence at most; the choice is the command or the aim's following.
export interface Successor { kind: 'consequence' | 'lead'; text: string; at?: string; command?: string; label?: string;
  aim?: string }
// A kind of opportunity perceived along a way from here, the nearest so many places off (1: where the way comes to).
// who: the one perceived nearest along it (the first of them), for the way's row to name where the company knows them.
export interface Sensed { to: string; aspect: Aspect; far: number; who?: string }
