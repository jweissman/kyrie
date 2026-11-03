# Pip's Tin (`q_pip.kyr`, prefix `pt_`)

*The top landing of a Salt Lane stair. Local, tender, and not allowed to be pure comfort. Tests: `test/quittance-pip.test.ts`.*

## Premise

Pip is nine, and keeps a Lent coal in a tin because her grandmother Hester Tamsett (who has not left her chair in a month)
said to. It is going out: dim from the morning of day 3 (watch 288), **out at the stroke of the end of day 3 (watch 384)**.
Nobody in the Wards can relight it, because a lent coal is not lit; it is given into a house. It will not be touched by anyone
who does not say please.

**The dilemma.** Sit with it all night (the cost is the night, which is also, on day 2, the night of the Candlewick fire), or
carry it somewhere with a fire that loves it (the cost is Pip's company: it leaves her stair, and she is asked to let it go).
Either way it wants a **name**.

## Teaching `d_lent_coal`

Only when the company has **looked closely at the tin** and **heard what "lent" means from Hester Tamsett**.

## Approaches

- **Sit** (`pt_sit`, 8 hours, only between 18:00 and 03:00): the coal goes steady and the clock stops. The night is spent. A
  company with a ranger's rites can instead say the words (below) and spend twenty minutes.
- **The words** (rites, one try): buys exactly one day. On failure the old woman says it wants *their* way of saying it, and
  the topic that follows is how.
- **Carry with leave**: persuade Pip (persuasion), or promise her she shall be brought to see it. A promise is kept only at
  the Penny Mutual's grate (she must be able to walk there); put the coal anywhere else and `pt_wronged`.
- **Carry without leave** (stealth): lift the tin while she is at the pump. Saves the coal, loses the child for ever
  (`pt_wronged`, `pm_slighted_wards`, regard down one). Fails with an old woman who "knows what you are going to do".
- **Do nothing**: the coal is out. Hester Tamsett is not angry. The ash can still be named.

Where it can be taken (each a place the company must reach in 36 watches; later it is ash in the tin):

| Place | What it is | Cost |
|---|---|---|
| the Penny Mutual's grate (`penny_hall`) | Near; she can visit. `coalSource(penny_hall)`. The Mutual lays it only if the company is proud with it (lent, or proud, or regard 2). | Needs the Penny Mutual quest done well. +1 regard. |
| Hearn House (`hearn_hearth`) | The last Hearthkeeper's hearth; he says "from the Wards, they never stopped, you know". `coalSource(hearn_hearth)`. | Pip cannot walk to it. |
| the Lamp-house shelf (`lamp_front`) | The glass never lets a thing go out; it does not say it lets it be. | A caged coal. No source for the Night. The place is read, not Wynne; she is not required to be friendly. |
| the Gasworks retort-house | A furnace not out in thirty years. `coalSource(retort_house)`, `regard(gasco)` +1. | The Wards do not forgive a coal on the Company's books: `pm_slighted_wards`, regard(wardsfolk) down one. |

The bakehouse oven was not offered: its state is another author's (a friendly or hostile Tolliver) and I had no relation to
read; a guess would have been the kind of dependency the brief warned of.

## The name

Gran asks. Exactly one of `coalNamedGran(party)`, `coalNamedPip(party)`, `coalNamedNone(party)` is written, as an answer to a
question put to the company (declining is a real answer, and the old woman is not sure whether she is pleased). It can be
given at any time once the clock is known, including over the ash.

## The Night, and the child

`pt_trusted` is earned when the coal is saved, named, and the child was not wronged. From day 6, on a trusted company:

- **Her coal** (`pt_accept_gift`): `quantity(party, coal)` +1, `coalExpires` +144; her tin goes cold and she says to say it is
  from her. The company may instead say *keep it* (`pt_gift_refused`, regard +1); she may still be asked later.
- **Her word** (`pt_ask_witness`, needs her to have said what she saw): `witness(pt_pip)`. She will sit in a chair in the Hall of
  the Five, not at her coal. **The two are exclusive.** Pip saw Mr Larkworth chalk the pump in Candlewick Court; she carries his
  dinner.

## Writes into the contract

`coalNamedGran/Pip/None(party)`, `witness(pt_pip)`, `coalSource(penny_hall | hearn_hearth | retort_house)`, `quantity(party, coal)`
and `coalExpires(party)`, `regard(wardsfolk)`, `regard(gasco)`, `d_lent_coal`. Own: `pt_saved pt_lost pt_trusted pt_wronged
pt_carried pt_kept_penny pt_kept_hearn pt_kept_glass pt_kept_gas pt_gifted pt_gift_refused pt_witnessing pt_promised`.
Deliberate deviation: `coalSource(pip_stair)` is **not** asserted. A source anyone can scoop a coal from on day 6 undoes the
child's choice; her gift is the action.

## Build matrix

| Build | Door |
|---|---|
| Anyone with a night to spare | sit |
| Cleric / rites | the words (a day, not a cure) |
| Bard / persuasion | the child's leave |
| Anyone who will say a thing and keep it | the promise |
| Thief / stealth | lift the tin (and lose her) |
| Anyone who can reach a Hill, a Wharf, a furnace | carry |

## Changed from the brief

- `coalSource(pip_stair)` dropped (above). The Bakery oven and Wynne's own hand are not required anywhere.
- A promise (not in the brief) so that a child can be won by something other than a die, with a consequence.
- The witness and the gift are mutually exclusive: both are "what you ask of a nine-year-old on the Night".

## Weakest part

The grandmother does most of the speaking, and the ending of the sit is a Result paragraph where a scene should be: no
state of the night itself. The choice of a name has no visible consequence until the Descent reads it. The Lamp-house and
the Gasworks options are single actions on a bare place; a Wynne or a stoker who answered would be better and cannot be
written without reading other authors' people.
