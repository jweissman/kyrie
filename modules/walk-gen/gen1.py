import os
OUT='/home/user/p3e-ws/data/situations/walk/'
H='Module walk "The Walk of the Milestones" {\n'
def esc(s): return s.replace('"','\\"') if False else s
X='abcd'
START={'a':2,'b':4,'c':6,'d':8}
NAME={'a':'first','b':'second','c':'third','d':'fourth'}
FL=['b','c','d']

# ---------------- towns.kyr ----------------
o=H
for x in X:
    n=NAME[x]
    o+=f'''
  // ---- The {n} town: the camp, the Station, the green's chalk and notice, and the band that comes on its day.
  Place camp_{x} "The Walkers' camp" is room within town_{x} at 3, 1.
  Place station_{x} "The Station" is room within town_{x} at 4, 1.
  Passage gate_{x} "the camp gate" is door between green_{x} and camp_{x}.
  Passage arch_{x} "the Station arch" is door between camp_{x} and station_{x}.
  Thing gate_bar_{x} "the camp gate's bar" on gate_{x} {{
    State open "The camp gate stands open on its worn hinge, and the bar leans beside it.".
    State dropped blocking "The camp gate is barred from within with a length of ash, and somebody has chalked a number on the bar.".
    Change bar "Drop the bar across the camp gate" from open to dropped needing brawn.
    Change lift "Lift the bar from the camp gate" from dropped to open needing brawn.
  }}
  Initially Assert state(gate_bar_{x}, open).
  Measure fed_{x}(group). Measure mass_{x}(group).
  Person band_{x} "the walkers" nowhere {{
    Role "a band of the Walk, barefoot, with ash staves". Calling commoner. Numbers {6+ (2 if x=="a" else 4)}. Level 1. Peaceable. Manner cheerful.
    Arrives at green_{x} when day(clock) >= {START[x]}.
    Arrives "A string of barefoot people comes up the road from the next town in step, singing one line over and over, and takes the green as if it had been told it was theirs. Their feet are grey with chalk and road. The one in front is calling a number, and the rest answer: '{{creed_cry}}.'".
    Greets "'Mile and mile,' says the nearest of the walkers, a broad woman with a staff notched like a tally-stick. When you do not answer she is not offended. 'And mile,' she says, helpfully. 'You say that back. It is the whole of the secret and the rest is walking.'".
    Greets again "'Mile and mile,' says the broad woman, as to an old friend, and goes on with what she was doing, which is rubbing tallow into her heels.".
  }}
  Thing chalk_{x} "the chalk on the well-stone" at green_{x} {{
    State bare "The well-stone is as it was: grey, mossed on the north side, with a rope-groove worn in the rim.".
    State l1 "Somebody has chalked a number on the well-stone, large and fresh, and under it a small neat wheel with a wing on it. A few barefoot prints go in and out of the inn's door.".
    State l2 "The well-stone is chalked from rim to flags: numbers, forty hands' worth of them, and the wheel with the wing drawn as many ways. Barefoot prints, grey with dust, go and come between the well and the camp's gate. It is a Walk now and not a gathering of cranks.".
    State l3 "The well-stone, the post, the inn's lintel and a good stretch of wall are white with numbers. The green is a camp. Staves are stacked like spears; fires of ash-wood burn in rings; some forty people sit barefoot on the grass, mending feet. When a horn sounds on the road the whole green stands up and says the number back.".
    State l4 "There is more chalk than wall. The green has been given over: it is hard to cross it without being asked your mile, and nobody here is not barefoot. A hundred and more, and more still on the road. Babies are carried in staves-slings. You could not get a cart through; nobody has tried since morning.".
    State after_licensed "The chalk has been left. Under the last number a clerk has written, in ink: KEPT BY LEAVE OF THE BENCH. Somebody has added a small wheel with a wing, and nobody has rubbed it out.".
    State after_suppressed "The chalk has been scrubbed with sand and a brush; the stone is wet and paler in the patches. A bench-man stands by it with his arms folded, not looking at anything.".
    State after_schism "Two marks are chalked on the stone, side by side and argued over: the wheel with a wing, and beside it a bare staff crossed. Somebody has rubbed out the one and somebody else has put it back, in turn, for days.".
    State after_usurped "The chalk is boxed in a frame of new wood with a little gate and a slot in it for coin: THE PILGRIM'S MILE, KEPT BY ORDER. The numbers inside are very neat.".
    State after_riot "The well-stone is black with smoke and cracked across; the chalk has gone to soot and somebody has pulled the rope-post out and thrown it down the well.".
    State after_fades "The rain has taken most of the chalk. A faint '61' stays in the pitted stone, and a child is tracing it with a finger, on purpose, for nobody.".
  }}
  Initially Assert state(chalk_{x}, bare).
  Thing notice_{x} "the notice on the post" at green_{x} {{
    State none "The post by the well has nothing on it but a bill about a stray cow, curling in the damp.".
    State notice "A paper is nailed to the post, over the cow: BY THE BAILIFF OF THE HUNDRED. NO ASSEMBLY OF MORE THAN TWELVE WITHOUT LEAVE OF THE BENCH. NO STAVES CARRIED. NO FIRE AFTER CURFEW WITHIN THE WALLS. Underneath, in a boy's chalk: AND WHO IS TO COUNT THE MILES?".
    State ultimatum "A second paper is nailed over the first, in a stiffer hand: THE HOST AT THE STATION IS TO DISPERSE BY NOON ON THE TENTH DAY OR BE DISPERSED. BY THE BENCH. Nobody has scratched anything under it.".
    State end_licensed "A new paper, written in a round clerk's hand and sealed with the Hundred's ash-and-keys: THE WALK IS KEPT BY LEAVE OF THE BENCH, ONCE A YEAR, ON THE ROAD AND NOT ON THE GREEN. THE BAILIFF WALKS THE FIRST MILE. Somebody has stuck a sprig of rosemary in the nail.".
    State end_suppressed "The notice has been nailed up again with four nails and a bar of tin across it: NO ASSEMBLY. NO STAVES. NO CHALK. A FINE OF TWO CROWNS A HEAD. It has already been torn at one corner by someone with nothing left to lose.".
    State end_schism "Two papers, side by side: the Bench's old notice with its corner curled, and a sheet in a different hand: THE STATION IS HELD BY THE BRETHREN. THE ROAD IS FREE TO THE FAITHFUL. THE BENCH IS NOT FAITHFUL. A clerk has been round and taken a copy.".
    State end_usurped "A paper in an unfamiliar hand, sealed with an unfamiliar seal: BY THE BAILIFF OF THE HUNDRED, ON THE ADVICE OF HIS PATRON. THE WALK IS KEPT. A STONE-PENNY IS ASKED OF EVERY WALKER. Somebody has scratched under it: AND WHO IS TO COUNT THE PENNIES?".
    State end_riot "The notice has been burnt off the post and the post scorched. A new one says, in the Bench's hand and in capitals: CURFEW AT DUSK. ALL STAVES TO THE BENCH. THE ROAD IS CLOSED TO ASSEMBLY UNTIL FURTHER NOTICE.".
    State end_fades "The notice has curled in the rain and nobody has taken it down. Under it, in no hand at all: the number, small, in pencil.".
  }}
  Initially Assert state(notice_{x}, none).
  Thing shrine_door_{x} "the shrine door" at green_{x} {{
    State open "The shrine door stands ajar on its dim candle, as it has always stood.".
    State chained "A length of chain has been looped through the shrine door's rings and padlocked. Someone has hung a card on it, in a priest's careful capitals: CLOSED FOR THE PRESERVATION OF ORDER.".
  }}
  Initially Assert state(shrine_door_{x}, open).
  Observe camp_view_{x} at camp_{x} as feature when true "A yard behind the inn's stable, given over to the Walk: straw on the ground in rows, fire-rings of ash-wood, staves stacked in threes against the wall, and a line of washed heel-cloths drying on a rope. Whoever is in charge sits where the draught is least. A number is chalked above every door.".
  Observe stone_view_{x} at station_{x} as feature when true "The Station is a roofed rest beside an old milestone: three posts and a slate roof, a stone bench, and the milestone itself, a squat grey column with the Office's wheel cut in the top and a number cut below it that was recut, in a newer hand, over an older number. Ash from a hundred small fires lies in the bench's corners.".
'''
# host rule, chalk state rules, band
for x in X:
    S=START[x]
    f=f"min(4, (day(clock) - {S}) / 2 + 1 + boost(walk_{x}))"
    o+=f'''  Rule host_{x} when day(clock) >= {S} and host(walk_{x}) != {f} {{ Set host(walk_{x}) to {f}. }}
'''
    for k in range(1,5):
        o+=f'''  Rule chalk_{x}_{k} when host(walk_{x}) == {k} and not decided(walk) and not state(chalk_{x}, l{k}) {{ Assert state(chalk_{x}, l{k}). }}
'''
# notices
o+='''
  // ---- The Bench's notice goes up on the road's greens in its own order: the bailiff's riders are always a day ahead of the Walk.
  Rule notice_a when day(clock) >= 3 and state(notice_a, none) and not decided(walk) { Assert state(notice_a, notice). }
  Rule notice_b when day(clock) >= 5 and state(notice_b, none) and not decided(walk) { Assert state(notice_b, notice). }
  Rule notice_c when day(clock) >= 6 and state(notice_c, none) and not decided(walk) { Assert state(notice_c, notice). }
  Rule notice_d when day(clock) >= 7 and state(notice_d, none) and not decided(walk) { Assert state(notice_d, notice). }
'''
for f in FL:
    o+=f'''  Rule ultimatum_{f} when flashpoint(f_{f}) and day(clock) >= 9 and not decided(walk) and not licensed(walk) and not state(notice_{f}, ultimatum) {{ Assert state(notice_{f}, ultimatum). }}
'''
# the first sign, where the player will see it
o+='''
  // ---- What a stranger on the first green sees from the second day: a walk, and a stall, and a notice.
  Observe walk_arrives at green_a as sign when at(band_a, green_a) "A string of barefoot strangers has taken the well-steps and is chalking the stone: a number, and a little wheel with a wing. They are singing something with no tune to speak of and a great deal of will." teaches walk_heard.
  Observe walk_chalking at green_a as sound when at(band_a, green_a) "Somewhere behind the singing a man is selling something, with the voice of a man who has sold it before.".
  Observe walk_travel_b at green_b as sign when host(walk_b) >= 1 and not at(band_b, green_b) "Chalked numbers on the stone, a day old: the Walk has been, or is coming.".
  Objective find_walk when knows(party, walk_heard) and not decided(walk) toward leader "A barefoot company is chalking the old road's milestones; find out who leads them, and what the Bailiff means to do about it.".
  Goal decided(walk).
'''
o+='}\n'
open(OUT+'towns.kyr','w').write(o)
