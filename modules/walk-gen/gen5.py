OUT='/home/user/p3e-ws/data/situations/walk/'
H='Module walk "The Walk of the Milestones" {\n'
X='abcd'; FL='bcd'
ENDS=['licensed','suppressed','schism','usurped','riot','fades']
o=H
o+='''
  // ---- What the Reckoning leaves, in every town: the chalk, the notice, the bailiff's chair, the stock, the Station's gate, the
  // people. Each is read from the ending reached, and stays.
'''
for x in X:
    o+=f'''  Thing station_door_{x} "the Station's gate" on arch_{x} {{
    State open "The Station arch stands open, with the old stone beyond it.".
    State sealed blocking "The Station's gate is held shut from within by the Brethren, who will not open it to the Bench, or to you, or to anyone who has not said the names. Staves show in the slats.".
    State boarded blocking "The Station's arch has been boarded up with new planks, and the Hundred's ash-and-keys burnt into the middle one with a hot iron. A bench-man sits on the bench opposite, bored.".
    State burnt blocking "The Station is a black hollow under a fallen slate roof. The arch stands, and nothing else. The old milestone is on its side, and someone has chalked a number on it, and rubbed it out, and chalked it again.".
  }}
  Initially Assert state(station_door_{x}, open).
'''
o+='''
'''
for e in ENDS:
    for x in X:
        o+=f'  Rule after_{e}_{x} when ending(e_{e}) and state(chalk_{x}, ?s) and not state(chalk_{x}, after_{e}) {{ Assert state(chalk_{x}, after_{e}). Assert state(notice_{x}, end_{e}). }}\n'
for f in FL:
    for e,st in (('suppressed','boarded'),('schism','sealed'),('riot','burnt')):
        o+=f'  Rule station_{e}_{f} when ending(e_{e}) and flashpoint(f_{f}) and not station_set(walk) {{ Assert state(station_door_{f}, {st}). Assert station_set(walk). }}\n'
o+='  Relation station_set(group).\n'
# persons after
o+='''  Rule seat_dray when decided(walk) and not ending(e_usurped) and day(clock) >= 11 and not seat_set(walk) { Assert at(dray, moot_a). Assert seat_set(walk). Assert state(bench_chair, held_dray). }
  Rule seat_orme when ending(e_usurped) and not seat_set(walk) and at(dray, ?w) and at(orme, ?o) {
    Assert at(dray, nowhere_gone). Assert at(orme, moot_a). Assert seat_set(walk). Assert state(bench_chair, held_orme).
  }
  Place nowhere_gone "Elsewhere" is room.
  Relation seat_set(group).
  Rule after_orme_said heard at green_a when ending(e_usurped) and day(clock) >= 11 and not orme_said(walk)
    says "The moot-house has a new man in the bailiff's chair, and it is the grey steward in the good plain coat. Bailiff Dray is not at the table, and nobody on the green will say where he is, in the voice of people who have been told. The clerk, very pale, has been told the new bailiff's name and is writing it out for the post." { Assert orme_said(walk). }
  Relation orme_said(group).
  Rule leader_taken when ending(e_suppressed) and not leader_set(walk) says "The Mile-Keeper is taken in the night by the Bench, quietly, on a cart, with the staff laid in beside. Nobody on the green saw it. Everyone on the green knows." { Assert at(leader, nowhere_gone). Assert leader_set(walk). }
  Rule leader_dies when ending(e_riot) and not leader_set(walk) says "The Mile-Keeper was in the middle of it, saying a number. It is said that the number was never finished. It is said by someone who was not there." { Assert at(leader, nowhere_gone). Assert leader_set(walk). }
  Relation leader_set(group).
'''
o+='''  Rule walk_ends_a when decided(walk) and not ending(e_licensed) and not ending(e_schism) and day(clock) >= 11 and at(band_a, ?a) { Retract at(band_a, ?a). }
  Rule walk_ends_b when decided(walk) and not ending(e_licensed) and not ending(e_schism) and day(clock) >= 11 and at(band_b, ?a) { Retract at(band_b, ?a). }
  Rule walk_ends_c when decided(walk) and not ending(e_licensed) and not ending(e_schism) and day(clock) >= 11 and at(band_c, ?a) { Retract at(band_c, ?a). }
  Rule walk_ends_d when decided(walk) and not ending(e_licensed) and not ending(e_schism) and day(clock) >= 11 and at(band_d, ?a) { Retract at(band_d, ?a). }
'''
o+='''
  Relation bands_set(group).
'''
# stock effects
for x in X:
    o+=f'''  Rule stock_licensed_{x} when ending(e_licensed) and not stocked_{x}(walk) {{ Increase quantity(merchant_{x}, rations) by 6. Increase quantity(innkeeper_{x}, rations) by 6. Assert stocked_{x}(walk). }}
  Rule stock_suppressed_{x} when ending(e_suppressed) and not stocked_{x}(walk) {{ Set quantity(merchant_{x}, rations) to 3. Assert stocked_{x}(walk). }}
  Rule stock_usurped_{x} when ending(e_usurped) and not stocked_{x}(walk) {{ Set quantity(innkeeper_{x}, rations) to 2. Assert stocked_{x}(walk). }}
  Rule stock_riot_{x} when ending(e_riot) and day(clock) > fed_{x}(walk) {{ Set fed_{x}(walk) to day(clock). Set quantity(merchant_{x}, rations) to 0. Set quantity(innkeeper_{x}, rations) to 0. }}
  Relation stocked_{x}(group).
'''
after={
'licensed':"'Dear God, the bread,' says {i}, with a catch of laughter. 'You were not there at the Station? The bailiff walked the first mile. In his boots, it is true. But he walked it, and the clerk read the leave out in the round hand, and the old priest came out and said the response in a voice I have not heard from him since I was a boy. They have kept the Walk every year since, on the first of the thaw. There are forty people in my yard and not one of them has asked for credit.'",
'suppressed':"'They broke it up,' says {i}, with no expression at all. 'The Bench and the sergeant's men. Not with swords, much. With the flat, and the horses. A lot of them ran and a lot of them were taken, and you will have seen the green.' A very long wipe of the bar. 'It is quiet. I said I wanted it quiet. Nobody tell me I said it.'",
'schism':"'There are two of them now,' says {i}. 'The ones who want the leave, and went home, and the Brethren, who held the Station and will not give it up. It is the old story. Both of them say they are the Walk.' A sigh. 'There is a chain on the shrine door and a stave at the Station gate. And on every milestone from here to the border there is a wheel and a cross, side by side, and every night someone rubs out the one, and every morning someone puts it back.'",
'usurped':"'There is a new man in the bailiff's chair,' says {i}, 'and it is the steward. He has kept the Walk. He has put a penny on it. A stone-penny, he says, which is for the road's keeping. It is a great deal for a poor walker and not very much for a rich one, and he says that is what a toll is.' A look. 'I find I have heard that argument before. From a woman with a lead seal.'",
'riot':"'It was a day,' says {i}, 'that I do not want to see twice.' The hands on the bar are quite steady. 'Nine dead that anyone will admit to. The stalls burnt. The Bench's men, and the sergeant, and the Brethren, and the lads, and God help us a crowd of people who had never in their lives hit anyone. There is curfew at dusk. I have nothing in the larder; I do not think anyone in the town does.' A pause. 'The Mile-Keeper did not finish the number.'",
'fades':"'It just stopped,' says {i}. 'There was no Bench and no Brethren and no steward at the end of it. They went home. They said the names and went home, on the road, the way you leave a feast when it is over. It rained on the chalk.' A shrug. 'I miss the singing. I did not think I should.'"}
for e in ENDS:
    for x in X:
        o+=f'''  Topic inn_after_{e}_{x} with innkeeper_{x} "Ask {{innkeeper_{x}}} how the Walk ended" when ending(e_{e}) once {{
    Says "{after[e].replace('{i}','{innkeeper_'+x+'}')}".
  }}
'''
open(OUT+'after.kyr','w').write(o+'}\n')
