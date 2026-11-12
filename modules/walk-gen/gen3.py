OUT='/home/user/p3e-ws/data/situations/walk/'
H='Module walk "The Walk of the Milestones" {\n'
X='abcd'; FL='bcd'
o=H
o+='''
  // ---- The Bench: the bailiff of the Hundred, who wants the road quiet, and his men. He rides into the first town on the
  // third day, sits in the moot-house, and rides out to the Gathering on the ninth.
  Place moot_a "The moot-house" is room within town_a at 2, 1.
  Passage moot_door "the moot-house door" is door between green_a and moot_a.
  Thing bench_chair "the bailiff's chair" at moot_a {
    State held_dray "A tall chair with the Hundred's ash-and-keys carved on its back, pushed square to the table. It is not comfortable and was not meant to be.".
    State held_orme "The bailiff's chair has a cushion on it now, and a new rug under. It sits a half-pace nearer the window, where the light is.".
    State unfilled "The bailiff's chair is pushed back against the wall, and a clerk has laid a sheet over its seat.".
  }
  Initially Assert state(bench_chair, held_dray).
  Relation bench_blooded(group). Relation duel_called(group). Relation duel_counted(group).
  Person dray "Someone" nowhere {
    Role "the bailiff of the Hundred". Calling warrior. Level 3. Peaceable. Manner stoic. Pronouns he.
    Arrives at green_a when day(clock) >= 3.
    Arrives "A lean man in a bailiff's brown rides into the first town with three men behind him, dismounts at the well and reads a notice aloud to the post, apparently for the pleasure of hearing it come out right.".
    Greets "'Item,' says {dray}, to you, as to a post. 'No assembly of more than twelve without leave of the Bench. Item. No staves. Item, and this one is mine and not the Bench's: whoever chalked my corporal's door will wash it off before I find out who.' He looks at the walkers, and then at you, and something that is not quite relief crosses his face. 'You are fewer than twelve. That is the best thing I have heard today.'".
    Greets again "{dray} does not look up from his tablet. 'The Bench has your name,' he says, 'and nothing against it yet. Item: keep it that way.'".
  }
  Person bench_men "the Hundred's men" nowhere {
    Role "three men of the Bench in brown, with ash-and-keys on their sleeves". Calling warrior. Numbers 3. Level 2. Peaceable. Manner stoic.
    Arrives at green_a when day(clock) >= 3.
    Greets "The three bench-men stand in a row behind the bailiff, not at ease. One of them has a bandaged hand. One keeps looking at the walkers, and looking away.".
  }
  Person teague "Someone" nowhere {
    Role "the bailiff's corporal". Calling warrior. Level 3. Peaceable. Manner proud. Pronouns he.
    Greets "A broad corporal in a leather jerkin stands with his thumbs in his belt and a look as if the day had been got up to annoy him. On his door, if you look, there is a great deal of chalk. 'Do not,' says {teague}, 'ask me about my door.'".
  }
  Rule dray_sits when day(clock) >= 4 and at(dray, green_a) { Retract at(dray, green_a). Assert at(dray, moot_a). Assert at(bench_men, moot_a). }
  Rule teague_posts when day(clock) >= 5 and not teague_sent(walk) { Assert at(teague, green_c). Assert teague_sent(walk). }
  Relation teague_sent(group).
'''
for f in FL:
    o+=f'''  Rule dray_rides_{f} when flashpoint(f_{f}) and day(clock) >= 9 and not decided(walk) and not dray_rode(walk) {{ Assert at(dray, green_{f}). Assert at(bench_men, green_{f}). Assert at(teague, green_{f}). Assert dray_rode(walk). }}
'''
o+='''  Relation dray_rode(group).
  Rule dray_rides_said heard at green_a when day(clock) >= 9 and dray_rode(walk) and not dray_said(walk) says "The moot-house is shut, and a clerk is nailing a card to its door: THE BAILIFF IS ABROAD IN THE HUNDRED. Somebody has already written under it, 'Where the Walk is.'" { Assert dray_said(walk). }
  Relation dray_said(group).

  Topic dray_notice with dray "Ask {dray} what the notice is for" when true once {
    Says "'Order,' says {dray}. 'It is a small word. People think it is a big one. A hundred walkers fed on one green is a hundred walkers who have not paid for the bread. A hundred walkers on one road is a road with no carts on it. Item: three barns have been slept in, one with permission. Item: a stave through a pig. I do not say they are wicked. I say that I have a Hundred and not enough clerks.' He taps the tablet. 'And there is a woman, I am told, with a lead seal, collecting dues in the road's name. I am looking into her. The Walk says no tolls on the road. I should like to agree with them, if it were not for the fact that I keep the road in the Hundred's name, and have to be seen to.'".
  }
  Topic dray_leave with dray "Ask {dray} what it would take to give the Walk leave" when true once {
    Says "'Leave,' says {dray}. He looks at the post. 'I cannot give what I have not been given. I would have to be shown that it was lawful, or that it was kind, or that I was not being driven. One of those would do. I have not been shown any.' A pause that goes on one breath too long. 'Do not tell me which. I will know it when I see it.'".
  }
'''
for b,txt in (('kin',"'It was a thing my mother said once,' says {dray}, 'at a table, that I would rather she had not. About my brother. It is not a thing that is for sale, and I should be obliged if you did not make it one.' He does not say what. You noticed the hand: it stopped on the word 'brother'."),
              ('duty',"'I am a man of the book,' says {dray}, with some force. 'If the Bench's book says a thing, I do it, and if it does not, I wait for it to. I would give them leave tomorrow, if the book said the road was theirs to keep. It does not. I have looked.'"),
              ('debt',"'I have a note,' says {dray}, and stops, and turns the tablet face down. 'There is a gentleman with a very good plain coat who is kind enough to hold it. I do not think about it. I would rather not think about whoever it is, that has found the sums so easy to arrange.' You saw the hand shake.")):
    o+=f'''  Action read_dray_{b}(actor: group, site: place) "Watch {{dray}} while he says what he cannot be asked" {{
    Requires able(actor) and company(actor) and at(actor, site) and at(dray, site) and bound_by(m_{b}) and capable(actor, insight) and not knows(actor, bound_seen).
    Time 5 minutes.
    Resolve check(actor, insight, dc_fair).
    On success {{ Assert knows(actor, bound_seen). }}
    Result "{txt}".
    Otherwise "{{dray}} says nothing you can use, and says it very carefully.".
  }}
'''
# levers
o+='''
  // ---- What can be laid before the Bench. Any of the three gives the Bench a reason to hold its hand until noon; the one that
  // answers what actually holds the bailiff gives him leave to give the Walk its leave.
  Action names_to_bench(actor: group, site: place) "Lay Annet's roll of the names before {dray}, with Hal Dray's among them" {
    Speaker dray.
    Requires able(actor) and company(actor) and at(actor, site) and at(dray, site) and holding(actor, roll_kind) and knows(actor, hal_named) and not names_spoken(walk).
    Time 10 minutes.
    On success { Assert names_spoken(walk). Assert reprieve(walk). }
    Result "{dray} reads down the roll with a finger, which is not how he reads anything else, and stops. For some time he does not say anything. 'My mother,' he says at last, 'does not know I have heard that name aloud in eleven years.' He puts the roll down very gently. 'I will hold the Bench's hand until noon. I do not say more than that. Do not make me say more.'".
  }
  Action grant_to_bench(actor: group, site: place) "Lay the milestone's grant of the road before {dray}" {
    Speaker dray.
    Requires able(actor) and company(actor) and at(actor, site) and at(dray, site) and knows(actor, stone_true) and not grant_shown(walk).
    Time 10 minutes.
    On success { Assert grant_shown(walk). Assert reprieve(walk). }
    Result "You give {dray} the inscription as you read it, line by line, and the Office's old phrases for the wayfarer who keeps the road. He asks you to say the third line again, and then the fourth, and then he takes out his tablet and writes it down, slowly, and reads it back to himself. 'Item,' he says, very quietly. 'It is a lawful thing.' He closes the tablet. 'I will hold the Bench's hand until noon.'".
  }
  Action ledger_to_bench(actor: group, site: place) "Lay the steward's ledger before {dray}, with the note on his debt" {
    Speaker dray.
    Requires able(actor) and company(actor) and at(actor, site) and at(dray, site) and holding(actor, ledger_kind) and not ledger_shown(walk).
    Time 10 minutes.
    On success { Assert ledger_shown(walk). Assert exposed(walk). Assert reprieve(walk). }
    Result "{dray} reads the last page and does not read the rest. The colour goes out of him, and then comes back, slowly, as anger. 'I have been,' he says, 'a very obliging man.' He closes the ledger. 'I will hold the Bench's hand until noon. And then I will have a word with a gentleman in a plain coat.'".
  }
  Rule licence_kin when names_spoken(walk) and bound_by(m_kin) and not licensed(walk) and not bench_blooded(walk) and not decided(walk)
    says "{dray} stands a while with the roll in his hands. 'Leave,' he says, to no one, 'is a thing I find I can give.' He takes the Hundred's seal from his belt and sets it in a blot of wax on the notice; and a little way off, a woman in a grey shawl who has been standing at the edge of the green all day starts to cry." { Assert licensed(walk). Assert reprieve(walk). }
  Rule licence_duty when grant_shown(walk) and bound_by(m_duty) and not licensed(walk) and not bench_blooded(walk) and not decided(walk)
    says "{dray} writes the leave out himself, in the Bench's round hand, quoting the Office, and has it read aloud on the green by the corporal, who does it in a voice of settled, terrible dignity." { Assert licensed(walk). Assert reprieve(walk). }
  Rule licence_debt when ledger_shown(walk) and bound_by(m_debt) and not licensed(walk) and not bench_blooded(walk) and not decided(walk)
    says "{dray} tears the note in four and hands the pieces to the corporal. 'Whoever owns the Bench,' he says, 'it is not a man in a plain coat.' He has the leave written before dinner, and signs it twice." { Assert licensed(walk). Assert reprieve(walk). }
  Rule patron_falls when exposed(walk) and patron_ready(walk) { Retract patron_ready(walk). }
  Rule licensed_calms when licensed(walk) and not raid_off(walk) { Assert raid_off(walk). }
  Rule reprieve_calms when reprieve(walk) and not raid_off(walk) { Assert raid_off(walk). }
  Rule patron_seen when knows(party, skim_known) and knows(party, orme_seen) and not knows(party, ledger_found) and not orme_warned(walk)
    says "You have the shape of it now: a grey steward in a good plain coat, a purse at every camp, and a chalk-seller who takes his cut from both. Whoever is paying wants more than bread. The steward's chest travels with him, and he does not leave it unwatched for long." { Assert orme_warned(walk). }
  Relation orme_warned(group).

  // ---- The steward's chest and ledger. He goes where the Walk goes, a day behind it, and the thief's way is the lock.
  Action take_ledger(actor: group, site: place) "Take the ledger from the steward's open chest" {
    Requires able(actor) and company(actor) and at(actor, site) and at(orme_chest, site) and state(orme_chest, open) and not holding(actor, ledger_kind) and not ledger_taken(walk).
    Time 5 minutes.
    On success { Give ledger_kind to actor. Assert ledger_taken(walk). Assert knows(actor, ledger_found). Assert knows(actor, orme_seen). }
    Result "You lift the ledger out from under the purse, and leave the purse, which makes it theft of a rarer kind. The last page has a note, in the same good plain hand: 'Dray's note, bought; 800 crowns; to be called when the Walk is at the Station.'".
  }
  Relation ledger_taken(group).
  Action confront_orme(actor: group, site: place) "Put the steward's ledger in {orme}'s hand, and watch his face" {
    Speaker orme.
    Requires able(actor) and company(actor) and at(actor, site) and at(orme, site) and holding(actor, ledger_kind) and patron_ready(walk).
    Time 5 minutes.
    On success { Assert exposed(walk). }
    Result "{orme} holds the ledger as one holds something that has been returned from the dead. 'You have been,' he says, with some courtesy, 'thorough.' He turns the ring on his finger once. 'My employer will be disappointed in me. I shall not be disappointed in you. It is rare, in this line, to be bested by someone who then does not do a worse thing.' He gets on his horse. 'Tell the Mile-Keeper the bread will stop. And that I am sorry about it, which is true.'".
  }
'''
for x in X:
    n=dict(a=1,b=2,c=3,d=4)[x]
    day={1:3,2:4,3:6,4:8}[n]
    o+=f'  Rule chest_{x} when day(clock) >= {day} and at_leg(orme) == {n} and not chest_{x}_at(walk) and at(orme, green_{x}) {{ Assert at(orme_chest, green_{x}). Assert chest_{x}_at(walk). }}\n  Relation chest_{x}_at(group).\n'
# pre-place chest as nowhere: need an at for ?c; give it nowhere at start
o+=''
# priests: a topic each, and the vigil
tx={'a':("'The Walk is not a heresy,' says {priest_a}, with the care of a man laying a plank across a ditch. 'It is a custom. I have no canon against customs. But the road is not holy, and a priest who says it is has the order of things wrong. The altar is holy. I should like it understood.' A pause. 'My curate says I am a hard man. I have been a priest forty years. I may be.' If the door is chained, it is on his word."),
    'b':("'They are decent people,' says {priest_b}, and sounds, for a moment, as though that were a complaint. 'They have no priest, and they do not seem to want one. They pray at their stones in the open air and they say the Name at the end, and it is a perfectly good Name. I have no case.' He looks at his hands. 'It is the not-asking that bothers me.'"),
    'c':("'I am told that I am to forbid them,' says {priest_c}, 'and I find I cannot. I was a young man on that road once. If they want to say the names of the dead aloud, I should like to know who has the right to stop them.' He glances at the sky. 'The bishop's man will not see it that way. I will be told so, in writing.'"),
    'd':("'I have not made up my mind,' says {priest_d}, and then, because that is not true: 'I have made up my mind to say nothing, and I am at some pains to do it well. It is a lonely thing, a decision to say nothing.' He straightens a candle that did not need it.")}
for x in X:
    o+=f'''  Topic priest_walk_{x} with priest_{x} "Ask {{priest_{x}}} what the church makes of the Walk" when day(clock) >= {dict(a=2,b=4,c=6,d=8)[x]} once {{
    Says "{tx[x]}".
  }}
  Relation lifted_{x}(group).
  Action vigil_{x}(actor: group, site: place) "Say the Walkers' vigil in the proper form before {{priest_{x}}}, and ask whether it is a heresy" {{
    Speaker priest_{x}.
    Requires able(actor) and company(actor) and at(actor, site) and at(priest_{x}, site) and interdict(walk_{x}) and capable(actor, rites) and not lifted_{x}(walk).
    Time 30 minutes.
    Resolve check(actor, rites, dc_hard).
    On success {{ Retract interdict(walk_{x}). Assert lifted_{x}(walk). Assert state(shrine_door_{x}, open). }}
    Result "You say the vigil through in the old form, to the end, with the responses; and {{priest_{x}}} listens as a man does who is waiting to be wrong, and is not. 'That is the office for the road-dead,' he says slowly. 'It is in the third book. It has not been said aloud in this country in sixty years.' He goes to the door himself and takes the chain off. 'I shall write to the bishop that I did not know what I was forbidding.'".
    Otherwise "{{priest_{x}}} hears you out and finds a flaw in the third response, which is a fair one. The chain stays.".
  }}
'''
for f in FL:
    o+=f'  Rule interdict_{f} when flashpoint(f_{f}) and day(clock) >= 9 and curate_gone(walk) and not licensed(walk) and not lifted_{f}(walk) and not interdict(walk_{f}) and not decided(walk) says "The priest here has chained the shrine door against the Walk. Nobody has seen him do it; the chain was there at dawn." {{ Assert interdict(walk_{f}). Assert state(shrine_door_{f}, chained). }}\n'
# merchants
prof=["'Bread?' says {m}. 'My friend, I have never sold so much bread in a week. I laid in six sacks on the strength of a rumour and the rumour was kind. If the Walk walks to the Last Day I shall be a rich man and I shall be very sorry for the world.' A look of pure delight. 'You will have a loaf? On the house? No. Four crowns. But a warm one.'",
      "'It is a miracle,' says {m}, without irony, and counts coins into a jar. 'I do not say it is a holy one. I say that for the first time in my life the whole street comes in to buy rope.' He lowers his voice. 'I should like to know who is paying for the bread, because I think I should like to thank him. Or send him a bill.'",
      "'Trade?' says {m}. 'I have been selling the same cheese since the spring thaw. Yesterday a woman bought the cheese because it had been near the Walk.' A pause. 'I have raised the price of cheese. I am not proud. I am only very, very fed.'"]
res=["'Pilgrims in the yard,' says {m}, in the voice of a man to whom a thing has been done. 'Forty. On the straw. No beer, they say. No beer! And my regulars have gone to the ale-house in the next street, who have never forgiven me, and I do not suppose they will. There is a great deal of singing.' He wipes the bar. 'They are very clean. I will say that. It is the only thing I will say.'",
     "'It is all very well,' says {m}, 'for those who sell chalk.' The bar gets a long wipe. 'They eat at my table and say a prayer to the road and leave a penny in the jar and it is the wrong sort of penny. I had a quiet house. I had a very quiet house, and I liked it.' He looks at the door. 'Do not let it get about that I said it.'",
     "'I am to be grateful,' says {m}. 'The priest has said so, and the bailiff. Everyone has a view and nobody has a loaf. I have sold out of everything I stock and the carter cannot get through for staves.' A dry laugh. 'If the Walk wants a miracle, I should be glad of a cart.'"]
for i,x in enumerate(X):
    o+=f'''  Topic merchant_walk_{x}_p with merchant_{x} "Ask {{merchant_{x}}} how trade goes since the Walk came" when host(walk_{x}) >= 1 and stance(walk_{x}, s_profit) once {{
    Says "{prof[i%3].replace('{m}','{merchant_'+x+'}')}".
  }}
  Topic merchant_walk_{x}_r with merchant_{x} "Ask {{merchant_{x}}} how trade goes since the Walk came" when host(walk_{x}) >= 1 and stance(walk_{x}, s_resent) once {{
    Says "{res[i%3].replace('{m}','{merchant_'+x+'}')}".
  }}
  Topic inn_walk_{x}_p with innkeeper_{x} "Ask {{innkeeper_{x}}} how the inn has done since the Walk came" when host(walk_{x}) >= 1 and stance(walk_{x}, s_resent) once {{
    Says "{prof[(i+1)%3].replace('{m}','{innkeeper_'+x+'}')}".
  }}
  Topic inn_walk_{x}_r with innkeeper_{x} "Ask {{innkeeper_{x}}} how the inn has done since the Walk came" when host(walk_{x}) >= 1 and stance(walk_{x}, s_profit) once {{
    Says "{res[(i+1)%3].replace('{m}','{innkeeper_'+x+'}')}".
  }}
  // The Walk eats what it finds: the one of the pair who resents it has nothing left by dawn, the other has laid in bread.
  Measure laid_{x}(group).
  Rule laid_in_{x}_m when host(walk_{x}) >= 2 and stance(walk_{x}, s_profit) and laid_{x}(walk) == 0 {{ Set laid_{x}(walk) to 1. Increase quantity(merchant_{x}, rations) by 6. }}
  Rule laid_in_{x}_i when host(walk_{x}) >= 2 and stance(walk_{x}, s_resent) and laid_{x}(walk) == 0 {{ Set laid_{x}(walk) to 1. Increase quantity(innkeeper_{x}, rations) by 6. }}
  Rule eaten_{x}_m when host(walk_{x}) >= 3 and stance(walk_{x}, s_resent) and day(clock) > fed_{x}(walk) and not decided(walk) {{ Set fed_{x}(walk) to day(clock). Set quantity(merchant_{x}, rations) to 0. }}
  Rule eaten_{x}_i when host(walk_{x}) >= 3 and stance(walk_{x}, s_profit) and day(clock) > fed_{x}(walk) and not decided(walk) {{ Set fed_{x}(walk) to day(clock). Set quantity(innkeeper_{x}, rations) to 0. }}
'''
# Rooke in words
o+='''
  Topic rooke_dues_pettifer with pettifer "Ask {pettifer} what the Walk makes of the woman with the lead seal" when day(clock) >= 3 once {
    Says "'Rooke?' says {pettifer}, and for the first time in your acquaintance he says it quite flatly. 'She sells a thing that does not exist and calls it a road. We sell a thing that does not exist and call it chalk. It is a matter of professional respect that we do not speak.' He puts a stub in your hand. 'I will say this. She is better at it than I am, and I find I mind that more than the law.'".
  }
'''
open(OUT+'powers.kyr','w').write(o+'}\n')
